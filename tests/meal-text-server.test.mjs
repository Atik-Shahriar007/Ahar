import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let server;
let aiServer;
let mockModel;
let port;
let aiPort;
let mockPort;
let modelRequest;
let failModel = false;

async function freePort() {
  const probe = net.createServer();
  await new Promise((resolve, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', resolve);
  });
  const free = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  return free;
}

async function waitForAhar(child, candidatePort) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 5000) {
    if (child.exitCode !== null) throw new Error('Ahar server exited before the integration test started.');
    try {
      const response = await fetch(`http://127.0.0.1:${candidatePort}/`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Ahar server did not become ready.');
}

function stop(child) {
  if (!child || child.exitCode !== null) return Promise.resolve();
  child.kill('SIGTERM');
  return new Promise((resolve) => {
    const timer = setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 1000);
    child.once('exit', () => { clearTimeout(timer); resolve(); });
  });
}

before(async () => {
  port = await freePort();
  server = spawn(process.execPath, ['server.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), OPENAI_API_KEY: '', OPENAI_API_BASE: '' },
    stdio: 'ignore',
  });
  await waitForAhar(server, port);

  mockModel = createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    modelRequest = { headers: req.headers, path: req.url, body: JSON.parse(Buffer.concat(chunks).toString('utf8')) };
    if (failModel) {
      res.writeHead(503, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'test outage' }));
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ items: [
      { foodId: 'rice', quantity: 7, unit: 'cup', evidence: '2 cups rice', uncertainty: 'low' },
      { foodId: 'chicken', quantity: 1, unit: 'piece', evidence: 'mystery stew', uncertainty: 'low' },
      { foodId: 'not-in-list', quantity: 2, unit: 'kg', evidence: '2 kg unknown', uncertainty: 'low' },
    ] }) } }] }));
  });
  await new Promise((resolve, reject) => {
    mockModel.once('error', reject);
    mockModel.listen(0, '127.0.0.1', resolve);
  });
  mockPort = mockModel.address().port;
  aiPort = await freePort();
  aiServer = spawn(process.execPath, ['server.mjs'], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(aiPort),
      OPENAI_API_KEY: 'test-only-not-a-credential',
      OPENAI_API_BASE: `http://127.0.0.1:${mockPort}/v1`,
    },
    stdio: 'ignore',
  });
  await waitForAhar(aiServer, aiPort);
});

after(async () => {
  await stop(aiServer);
  await stop(server);
  if (mockModel?.listening) await new Promise((resolve) => mockModel.close(resolve));
});

test('server uses exact fixed-list matches when model credentials are absent', async () => {
  const sentence = 'আমি ভাত, ২টি ডিম আর অচেনা স্যুপ খেয়েছি।';
  const response = await fetch(`http://127.0.0.1:${port}/api/interpret-meal-text`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: sentence, profile: 'nabil', photo: 'never-forward-this' }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.engine, 'rules');
  assert.deepEqual(body.items.map((item) => item.foodId), ['rice', 'eggs']);
  assert.ok(body.items.every((item) => item.quantity === null && item.unit === null));
  assert.equal(JSON.stringify(body).includes(sentence), false);
  assert.equal(JSON.stringify(body).includes('nabil'), false);
});

test('AI path sends only the sentence plus public allowlist and filters model output deterministically', async () => {
  const sentence = 'I ate 2 cups rice with mystery stew.';
  const response = await fetch(`http://127.0.0.1:${aiPort}/api/interpret-meal-text`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: sentence, profile: 'nabil', photo: 'not-sent-to-model' }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.engine, 'ai');
  assert.deepEqual(body.items, [{ foodId: 'rice', quantity: null, unit: 'cup', evidence: '2 cups rice', uncertainty: 'high' }]);
  assert.match(body.notice, /omitted/);
  assert.equal(modelRequest.path, '/v1/chat/completions');
  assert.equal(modelRequest.headers.authorization, 'Bearer test-only-not-a-credential');
  assert.equal(modelRequest.body.response_format.json_schema.strict, true);
  const userPayload = JSON.parse(modelRequest.body.messages.find((message) => message.role === 'user').content);
  assert.deepEqual(Object.keys(userPayload).sort(), ['allowedFoods', 'sentence']);
  assert.equal(userPayload.sentence, sentence);
  assert.ok(userPayload.allowedFoods.some((food) => food.id === 'rice'));
  assert.equal(JSON.stringify(userPayload).includes('nabil'), false);
  assert.equal(JSON.stringify(userPayload).includes('not-sent-to-model'), false);
});

test('meal-text API falls back to direct name matching during a mock model outage', async () => {
  failModel = true;
  const response = await fetch(`http://127.0.0.1:${aiPort}/api/interpret-meal-text`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: 'rice and one egg' }),
  });
  failModel = false;
  const body = await response.json();
  assert.equal(body.engine, 'rules');
  assert.deepEqual(body.items.map((item) => item.foodId), ['rice', 'eggs']);
  assert.ok(body.items.every((item) => item.quantity === null && item.unit === null));
});

test('meal text request has a same-origin, JSON, and length boundary', async () => {
  const base = `http://127.0.0.1:${port}/api/interpret-meal-text`;
  const crossOrigin = await fetch(base, {
    method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://example.invalid' }, body: JSON.stringify({ text: 'rice' }),
  });
  assert.equal(crossOrigin.status, 403);
  const wrongType = await fetch(base, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'rice' });
  assert.equal(wrongType.status, 415);
  const tooLong = await fetch(base, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: 'x'.repeat(501) }) });
  assert.equal(tooLong.status, 400);
});

test('only allowlisted public scripts and the sample image are exposed, not server source', async () => {
  for (const file of ['meal-text-catalog.js', 'meal-text-core.js', 'meal-text.js', 'guided-plan-core.js', 'guided-plan.js']) {
    const response = await fetch(`http://127.0.0.1:${port}/${file}`);
    assert.equal(response.status, 200, `${file} should be public`);
  }
  const sampleMeal = await fetch(`http://127.0.0.1:${port}/assets/sample-bangladeshi-meal.jpg`);
  assert.equal(sampleMeal.status, 200, 'the original demo meal image should be public');
  assert.match(sampleMeal.headers.get('content-type'), /image\/jpeg/);
  const privateSource = await fetch(`http://127.0.0.1:${port}/server.mjs`);
  assert.equal(privateSource.status, 404);
});
