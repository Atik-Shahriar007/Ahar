import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const feedbackStore = require('../feedback-store.js');
const ranking = require('../ranking-core.js');
const { groups, goals } = require('../swap-catalog.js');
const source = await readFile(new URL('../swap-engine.js', import.meta.url), 'utf8');

function harness({ fetchMock = async () => ({ ok: false }) } = {}) {
  const values = new Map();
  const handlers = {};
  const nodes = {};
  const reasonWrap = { hidden: true };
  const toasts = [];
  let renderCount = 0;
  const localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
  const document = {
    addEventListener: (name, handler) => { handlers[name] = handler; },
    getElementById: (id) => nodes[id] || null,
    querySelector: (selector) => selector === '[data-rank-swaps]' ? nodes.rankButton : selector === '[data-feedback-reason-wrap]' ? reasonWrap : null,
  };
  const state = { who: 'nabil', bn: false, planReady: true, people: 1, days: 1, budget: 100, checked: [] };
  const window = {
    AHAR_SWAP_CATALOG: groups,
    AHAR_SWAP_GOALS: goals,
    AHAR_RANKING_CORE: ranking,
    AHAR_FEEDBACK_STORE: feedbackStore,
    AHAR_PLAN_MATH: null,
  };
  const context = vm.createContext({
    window,
    document,
    localStorage,
    state,
    basket: () => [{ en: 'Eggs', bn: 'ডিম', qty: 1, unit: 'pcs', cost: 13 }],
    render: () => { renderCount += 1; },
    toast: (message) => toasts.push(message),
    tr: (english) => english,
    escapeHTML: (value) => String(value),
    fetch: fetchMock,
    AbortController,
    setTimeout,
    clearTimeout,
  });
  vm.runInContext(source, context, { filename: 'swap-engine.js' });
  return { context, window, document, localStorage, state, nodes, reasonWrap, handlers, toasts, renderCount: () => renderCount, values };
}

function clickTarget(selector) {
  return { target: { closest: (candidate) => candidate === selector ? {} : null } };
}

test('the applied-swap prompt saves an optional vote and a separate control clears it', () => {
  const app = harness();
  app.state.feedbackPrompt = { groupId: 'eggs', optionId: 'rui-fish', profile: 'nabil' };
  const html = app.window.AHAR_SWAP_CONTROLS();
  assert.match(html, /Was Rui fish useful\?/);
  assert.match(html, /data-feedback-reason-wrap/);
  assert.match(html, /never sent to the optional AI model/);
  app.handlers.change({ target: { id: 'ahar-feedback-vote', value: 'down', closest: () => null } });
  assert.equal(app.reasonWrap.hidden, false, 'a negative response should reveal its simple reason choices');
  app.state.bn = true;
  assert.match(app.window.AHAR_SWAP_CONTROLS(), /আপনার মতামত/);
  app.state.bn = false;

  app.nodes['ahar-feedback-vote'] = { value: 'down' };
  app.nodes['ahar-feedback-reason'] = { value: 'unavailable' };
  app.handlers.click(clickTarget('[data-save-feedback]'));
  assert.deepEqual(feedbackStore.read(app.localStorage, 'aharai.swap-feedback.v1.nabil', groups).eggs['rui-fish'], { vote: 'down', reason: 'unavailable' });
  assert.equal(app.state.feedbackPrompt, null);

  app.handlers.click(clickTarget('[data-reset-feedback]'));
  assert.deepEqual(feedbackStore.read(app.localStorage, 'aharai.swap-feedback.v1.nabil', groups), {});
});

test('rules fallback applies local feedback while the outgoing model payload excludes it', async () => {
  let sentBody;
  const app = harness({
    fetchMock: async (_url, request) => {
      sentBody = request.body;
      return { ok: true, json: async () => ({ engine: 'rules', rankedIds: ['masoor-dal', 'rui-fish'] }) };
    },
  });
  app.window.AHAR_PLAN_MATH = { applyPantry: (items) => items.map((item) => ({ ...item, cost: 100, coveredValue: 0 })) };
  feedbackStore.save(app.localStorage, 'aharai.swap-feedback.v1.nabil', groups, 'eggs', 'masoor-dal', 'down', 'too-expensive');
  const metricsBefore = app.window.AHAR_SWAP_ENGINE.scenarioMetrics('eggs', 'rui-fish');
  feedbackStore.save(app.localStorage, 'aharai.swap-feedback.v1.nabil', groups, 'eggs', 'rui-fish', 'up');
  const metricsAfter = app.window.AHAR_SWAP_ENGINE.scenarioMetrics('eggs', 'rui-fish');
  assert.deepEqual(metricsAfter, metricsBefore, 'feedback must not change quantities or arithmetic');

  app.nodes['ahar-ai-source'] = { value: 'eggs' };
  app.nodes['ahar-ai-goal'] = { value: 'budget' };
  app.nodes['ahar-swap-results'] = { innerHTML: '', textContent: '' };
  app.nodes.rankButton = { disabled: false };
  await app.handlers.click(clickTarget('[data-rank-swaps]'));

  const request = JSON.parse(sentBody);
  assert.deepEqual(Object.keys(request).sort(), ['budget', 'candidateMetrics', 'goalId', 'sourceId']);
  const markup = app.nodes['ahar-swap-results'].innerHTML;
  assert.ok(markup.indexOf('Rui fish') < markup.indexOf('Masoor dal'), 'the local rules order should honor the saved vote on a tie');
  assert.match(markup, /not sent to the model/);
});
