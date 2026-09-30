import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { groups, goals } = require('../swap-catalog.js');
const ranking = require('../ranking-core.js');
const feedback = require('../feedback-store.js');
const marketDataSource = await readFile(new URL('../market-data.js', import.meta.url), 'utf8');
const evidenceSource = await readFile(new URL('../ingredient-evidence.js', import.meta.url), 'utf8');
const swapEngineSource = await readFile(new URL('../swap-engine.js', import.meta.url), 'utf8');
const json = marketDataSource.slice(marketDataSource.indexOf('=') + 1).trim().replace(/;\s*$/, '');
const marketData = JSON.parse(json);

function appHarness() {
  const window = {
    AHAR_MARKET_DEMO: marketData,
    AHAR_SWAP_CATALOG: groups,
    AHAR_SWAP_GOALS: goals,
    AHAR_RANKING_CORE: ranking,
    AHAR_FEEDBACK_STORE: feedback,
    AHAR_PLAN_MATH: null,
  };
  const document = { addEventListener: () => {}, getElementById: () => null, querySelector: () => null };
  const localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  const state = { who: 'nabil', bn: false, planReady: true, people: 1, days: 1, budget: 100, checked: [], marketPulseMarket: 'Dhaka Sadar' };
  const context = vm.createContext({
    window,
    document,
    localStorage,
    state,
    basket: () => [{ en: 'Eggs', bn: 'ডিম', qty: 1, unit: 'pcs', cost: 13 }],
    render: () => {},
    toast: () => {},
    tr: (english) => english,
    escapeHTML: (value) => String(value),
    AbortController,
    setTimeout,
    clearTimeout,
  });
  vm.runInContext(evidenceSource, context, { filename: 'ingredient-evidence.js' });
  vm.runInContext(swapEngineSource, context, { filename: 'swap-engine.js' });
  return { window, state };
}

test('Food plan shows only mapped historical evidence and makes source limits clear', () => {
  const app = appHarness();
  const html = app.window.AHAR_SWAP_CONTROLS();
  assert.match(html, /Data evidence &amp; gaps/);
  assert.match(html, /Dhaka Sadar/);
  assert.match(html, /Lentils \(masur\)/);
  assert.match(html, /Wheat flour/);
  assert.match(html, /৳95 \/ KG/);
  assert.match(html, /15 Jul 2026/);
  assert.match(html, /source flag: actual/);
  assert.match(html, /Rui fish/);
  assert.match(html, /No price is inferred/);
  assert.match(html, /do not change sample plan costs/);
  assert.match(html, /Nutrition composition/);
  assert.equal(app.window.AHAR_SWAP_ENGINE.scenarioMetrics('eggs', 'masoor-dal').total, 12, 'the WFP context must not replace the sample swap cost');
});

test('the provenance card follows the selected market and preserves the published unit', () => {
  const app = appHarness();
  app.state.marketPulseMarket = 'Kawran Bazar Dhaka';
  const html = app.window.AHAR_SWAP_CONTROLS();
  assert.match(html, /Kawran Bazar, Dhaka/);
  assert.match(html, /৳94 \/ KG/);
  assert.match(html, /৳60 \/ KG/);
  assert.match(html, /CC BY-IGO/);
  assert.match(html, /no unit conversion is performed/);
});

test('the evidence disclosure translates missing-data and date details into Bangla', () => {
  const app = appHarness();
  app.state.bn = true;
  const html = app.window.AHAR_SWAP_CONTROLS();
  assert.match(html, /তথ্যসূত্র ও ঘাটতি/);
  assert.match(html, /১৫ জুলাই ২০২৬/);
  assert.match(html, /কোনো দাম অনুমান করা হয়নি/);
  assert.match(html, /মসুর ডাল/);
  assert.match(html, /একক রূপান্তর করা হয়নি/);
});

test('the source and script wiring is present in the local demo shell', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  assert.ok(html.indexOf('market-data.js') < html.indexOf('ingredient-evidence.js'));
  assert.ok(html.indexOf('ingredient-evidence.js') < html.indexOf('swap-engine.js'));
  assert.match(server, /'ingredient-evidence\.js'/);
});
