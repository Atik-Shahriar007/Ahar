import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const foods = require('../meal-text-catalog.js');
const core = require('../meal-text-core.js');
const source = await readFile(new URL('../meal-text.js', import.meta.url), 'utf8');

function harness({ fetchMock = async () => ({ ok: false }), who = 'nabil' } = {}) {
  const handlers = {};
  const values = new Map();
  const textarea = { value: '' };
  let html = '';
  const localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
  const document = {
    addEventListener: (name, handler) => { handlers[name] = handler; },
    getElementById: (id) => id === 'meal-text-input' ? textarea : null,
  };
  const state = { who, bn: false };
  const window = { AHAR_MEAL_FOODS: foods, AHAR_MEAL_TEXT_CORE: core };
  let plateView = () => '<main>existing photo demo</main>';
  const context = vm.createContext({
    window,
    document,
    localStorage,
    state,
    plateView,
    render: () => { html = context.plateView(); },
    toast: () => {},
    fetch: fetchMock,
    Date,
    Math,
  });
  vm.runInContext(source, context, { filename: 'meal-text.js' });
  const eventFor = (selector, dataset = {}) => ({
    target: {
      dataset,
      closest: (candidate) => candidate === selector ? { dataset } : null,
    },
  });
  return { context, document, handlers, html: () => html, localStorage, state, textarea, values, eventFor };
}

test('sentence is sent only after a click, and only the text field leaves the browser', async () => {
  let calls = 0;
  let request;
  const app = harness({ fetchMock: async (url, options) => {
    calls += 1;
    request = { url, options };
    return { ok: true, json: async () => ({ engine: 'ai', items: [
      { foodId: 'rice', quantity: 2, unit: 'cup', evidence: 'two cups rice', uncertainty: 'medium' },
    ] }) };
  } });
  const sentence = 'two cups rice';
  assert.equal(calls, 0, 'loading the screen must not send an AI request');
  app.textarea.value = sentence;
  app.handlers.input({ target: { id: 'meal-text-input', value: sentence } });
  await app.handlers.click(app.eventFor('[data-meal-parse]'));
  assert.equal(calls, 1);
  assert.equal(request.url, '/api/interpret-meal-text');
  assert.equal(request.options.method, 'POST');
  assert.deepEqual(JSON.parse(request.options.body), { text: sentence });
  assert.match(app.html(), /Review before saving/);
  assert.match(app.html(), /Model uncertainty label: medium/);
  assert.equal(app.localStorage.getItem('aharai.meal-text.v1.nabil'), null, 'model output is not saved before review confirmation');
});

test('user edits are saved only after confirmation, without retaining the raw sentence or profile data', async () => {
  const sentence = 'two cups rice';
  const app = harness({ fetchMock: async () => ({ ok: true, json: async () => ({ engine: 'ai', items: [
    { foodId: 'rice', quantity: 2, unit: 'cup', evidence: 'two cups rice', uncertainty: 'medium' },
  ] }) }) });
  app.textarea.value = sentence;
  await app.handlers.click(app.eventFor('[data-meal-parse]'));
  app.handlers.input({ target: { dataset: { mealIndex: '0', mealField: 'quantity' }, value: '3' } });
  assert.equal(app.localStorage.getItem('aharai.meal-text.v1.nabil'), null);
  await app.handlers.click(app.eventFor('[data-meal-confirm]'));
  const saved = JSON.parse(app.localStorage.getItem('aharai.meal-text.v1.nabil'));
  assert.equal(saved.length, 1);
  assert.deepEqual(saved[0].items, [{ foodId: 'rice', quantity: 3, unit: 'cup' }]);
  assert.equal(JSON.stringify(saved).includes(sentence), false, 'the raw sentence is not stored');
  assert.equal(JSON.stringify(saved).includes('nabil'), false, 'profile identity is not stored in the record');
  assert.match(app.html(), /Saved in this demo profile/);
});

test('manual food choice works without calling the model and still requires confirmation', async () => {
  let calls = 0;
  const app = harness({ fetchMock: async () => { calls += 1; throw new Error('must not call'); }, who: 'rahim' });
  app.handlers.change({ target: { dataset: { mealManual: 'rui-fish' }, checked: true } });
  await app.handlers.click(app.eventFor('[data-meal-build-manual]'));
  assert.equal(calls, 0);
  assert.match(app.html(), /Chosen manually/);
  assert.equal(app.localStorage.getItem('aharai.meal-text.v1.rahim'), null);
  await app.handlers.click(app.eventFor('[data-meal-confirm]'));
  const saved = JSON.parse(app.localStorage.getItem('aharai.meal-text.v1.rahim'));
  assert.deepEqual(saved[0].items, [{ foodId: 'rui-fish', quantity: null, unit: null }]);
  assert.equal(app.localStorage.getItem('aharai.meal-text.v1.nabil'), null);
});

test('an entered amount needs a compatible unit before it can be saved', async () => {
  const app = harness({ fetchMock: async () => ({ ok: true, json: async () => ({ engine: 'ai', items: [
    { foodId: 'rice', quantity: null, unit: 'unknown', evidence: 'rice', uncertainty: 'high' },
  ] }) }) });
  app.textarea.value = 'rice';
  await app.handlers.click(app.eventFor('[data-meal-parse]'));
  app.handlers.input({ target: { dataset: { mealIndex: '0', mealField: 'quantity' }, value: '2' } });
  await app.handlers.click(app.eventFor('[data-meal-confirm]'));
  assert.equal(app.localStorage.getItem('aharai.meal-text.v1.nabil'), null);
  assert.match(app.html(), /Choose a compatible unit/);
  app.handlers.change({ target: { dataset: { mealIndex: '0', mealField: 'unit' }, value: 'cup' } });
  await app.handlers.click(app.eventFor('[data-meal-confirm]'));
  const saved = JSON.parse(app.localStorage.getItem('aharai.meal-text.v1.nabil'));
  assert.deepEqual(saved[0].items, [{ foodId: 'rice', quantity: 2, unit: 'cup' }]);
});

test('switching fictional profiles clears an unconfirmed draft review', async () => {
  const app = harness({ fetchMock: async () => ({ ok: true, json: async () => ({ engine: 'rules', items: [
    { foodId: 'rice', quantity: null, unit: null, evidence: 'rice', uncertainty: 'high' },
  ] }) }) });
  app.textarea.value = 'rice';
  await app.handlers.click(app.eventFor('[data-meal-parse]'));
  assert.match(app.html(), /Review before saving/);
  app.state.who = 'mariam';
  app.context.window.AHAR_MEAL_TEXT.renderCard();
  assert.equal(app.context.window.AHAR_MEAL_TEXT.renderCard().includes('Review before saving'), false);
});
