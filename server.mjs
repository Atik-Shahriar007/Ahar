import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { groups: catalog, goals } = require('./swap-catalog.js');
const rankingCore = require('./ranking-core.js');
const root = path.dirname(fileURLToPath(import.meta.url));
// Keep this demo endpoint loopback-only; public deployment requires a separate
// authenticated, rate-limited service design rather than changing this bind.
const host = '127.0.0.1';
const port = Number(process.env.PORT || 5174);
const model = process.env.AHAR_LLM_MODEL || 'gpt-5-mini';
const publicFiles = new Set(['index.html', 'app.js', 'pantry.js', 'planner.js', 'swap-catalog.js', 'swap-engine.js', 'market-data.js', 'market-pulse.js', 'ranking-core.js', 'style.css', 'bajar.jpeg', 'pic_lunch.png']);
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml',
};

function sendJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(JSON.stringify(payload));
}

function fallbackRank(group, metrics, budget, goalId) {
  return rankingCore.rank(group.options, metrics, budget, goalId);
}

async function readBody(req, limit = 8192) {
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > limit) throw new Error('request too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function rankSwaps(req, res) {
  let body;
  try {
    body = await readBody(req);
  } catch {
    return sendJson(res, 400, { error: 'Invalid or oversized request.' });
  }
  const group = catalog.find((entry) => entry.id === body.sourceId);
  const budget = Number(body.budget);
  const goal = goals.find((entry) => entry.id === body.goalId);
  if (!group || !goal || !Number.isFinite(budget) || budget < 1 || budget > 100000) {
    return sendJson(res, 400, { error: 'Unsupported planning context.' });
  }
  const metrics = {};
  for (const option of group.options) {
    const total = Number(body.candidateMetrics?.[option.id]?.total);
    const pantryCovered = Number(body.candidateMetrics?.[option.id]?.pantryCovered);
    if (!Number.isFinite(total) || total < 0 || total > 100000 || !Number.isFinite(pantryCovered) || pantryCovered < 0 || pantryCovered > 100000) {
      return sendJson(res, 400, { error: 'Missing or invalid sample totals.' });
    }
    metrics[option.id] = { total: Math.round(total), pantryCovered: Math.round(pantryCovered) };
  }
  const deterministic = fallbackRank(group, metrics, budget, goal.id);
  const apiKey = process.env.OPENAI_API_KEY;
  const apiBase = process.env.OPENAI_API_BASE;
  if (!apiKey || !apiBase) {
    return sendJson(res, 200, { engine: 'rules', rankedIds: deterministic, notice: 'AI credentials are not configured; showing the local priority-based ranking.' });
  }

  const allowedIds = group.options.map((option) => option.id);
  const schema = {
    type: 'object',
    properties: { rankedIds: { type: 'array', items: { type: 'string', enum: allowedIds } } },
    required: ['rankedIds'],
    additionalProperties: false,
  };
  const request = {
    model,
    messages: [
      {
        role: 'system',
        content: 'You rank a tiny fixed allowlist of illustrative grocery substitutions for a Bangladesh food-planning demo. Return every supplied option ID exactly once. Respect the supplied planning priority: budget means prefer an option whose pantry-adjusted basket fits the sample budget and costs less; pantry means prefer more already-covered sample value, while still considering budget; a meal-style priority means prefer candidates carrying that curated demo tag, then budget and lower cost. Tags describe only a demo meal format, not nutritional or cultural suitability. Never create or alter an ID. Do not make nutrition, health, allergy, religious-suitability, or live-price claims. Output only the required JSON.',
      },
      { role: 'user', content: JSON.stringify({ priority: goal.id, budgetBDT: Math.round(budget), candidates: group.options.map((option) => ({ id: option.id, mealTags: option.mealTags, estimatedBasketTotalAfterPantryBDT: metrics[option.id].total, estimatedPantryCoveredBDT: metrics[option.id].pantryCovered })) }) },
    ],
    max_completion_tokens: 100,
    reasoning: { effort: 'minimal' },
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'ahar_swap_ranking', strict: true, schema },
    },
  };

  try {
    const endpoint = `${apiBase.replace(/\/+$/, '')}/chat/completions`;
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(12000),
    });
    if (!upstream.ok) throw new Error(`upstream status ${upstream.status}`);
    const data = await upstream.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('missing model response');
    const parsed = JSON.parse(content);
    const ordered = Array.isArray(parsed.rankedIds) ? parsed.rankedIds.filter((id) => allowedIds.includes(id)) : [];
    const unique = [...new Set(ordered)];
    if (!unique.length) throw new Error('model returned no allowed IDs');
    const complete = [...unique, ...deterministic.filter((id) => !unique.includes(id))];
    return sendJson(res, 200, { engine: 'ai', rankedIds: complete });
  } catch {
    // Do not expose upstream details, credentials, or user context in the UI/log.
    return sendJson(res, 200, { engine: 'rules', rankedIds: deterministic, notice: 'The model was unavailable; showing the local priority-based ranking.' });
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${host}:${port}`);
  if (req.method === 'POST' && url.pathname === '/api/rank-swaps') {
    const requestHost = String(req.headers.host || '').toLowerCase();
    if (!new Set([`127.0.0.1:${port}`, `localhost:${port}`]).has(requestHost)) return sendJson(res, 421, { error: 'Local requests only.' });
    if (req.headers.origin) {
      try {
        if (new URL(req.headers.origin).origin !== `http://${requestHost}`) return sendJson(res, 403, { error: 'Cross-origin request blocked.' });
      } catch {
        return sendJson(res, 403, { error: 'Invalid request origin.' });
      }
    }
    if (String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') return sendJson(res, 415, { error: 'JSON requests only.' });
    return rankSwaps(req, res);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'Method not allowed.' });
  const requested = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  if (!publicFiles.has(requested)) return sendJson(res, 404, { error: 'Not found.' });
  const file = path.resolve(root, requested);
  if (!file.startsWith(`${root}${path.sep}`) || !existsSync(file) || !statSync(file).isFile()) return sendJson(res, 404, { error: 'Not found.' });
  res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff' });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
});

server.listen(port, host, () => console.log(`AharAI local server ready at http://${host}:${port}`));
