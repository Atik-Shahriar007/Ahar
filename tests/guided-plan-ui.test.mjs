import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../guided-plan-core.js');
const source = await readFile(new URL('../guided-plan.js', import.meta.url), 'utf8');

function harness({ pantry = null } = {}) {
  const handlers = {};
  const state = { who: 'nabil', bn: false };
  const personas = {
    nabil: { name: 'Nabil', budget: 280 },
    rahim: { name: 'Rahim', budget: 160 },
    mariam: { name: 'Mariam', budget: 220 },
  };
  let profile = structuredClone(personas.nabil);
  let html = '';
  const window = { AHAR_GUIDED_PLAN_CORE: core };
  const document = { addEventListener: (name, handler) => { handlers[name] = handler; } };
  const context = vm.createContext({
    window, document, state, profile, personas, structuredClone,
    today: () => '<div class="dashboard-grid">today demo</div>',
    render: () => { html = context.today(); },
    icon: () => '<svg></svg>',
    escapeHTML: (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]),
    savedPantry: () => state.who === 'nabil' ? pantry : null,
    toast: () => {},
    Number, Math, Set, Map,
  });
  vm.runInContext(source, context, { filename: 'guided-plan.js' });
  const click = (action) => {
    const button = { dataset: { guidedAction: action } };
    handlers.click({ target: { closest: () => button } });
  };
  return { context, handlers, html: () => html, click, state };
}

test('Today shows the guided loop and the demo shortcut without opening it automatically', () => {
  const app = harness();
  assert.match(app.html(), /Plan for the day you actually have/);
  assert.match(app.html(), /Build today’s plan/);
  assert.match(app.html(), /Show Rahim’s workday/);
  assert.ok(app.html().indexOf('guided-plan-card') < app.html().indexOf('dashboard-grid'));
});

test('Rahim shortcut opens an unsaved, labelled workday demo and the chosen swap updates the cost', () => {
  const app = harness();
  app.click('demo');
  assert.equal(app.state.who, 'rahim');
  assert.match(app.html(), /fictional workday demo/);
  assert.match(app.html(), /Illustrative demo pantry · not saved/);
  assert.match(app.html(), /value="160"/);
  assert.match(app.html(), /<b>৳72<\/b>/);

  app.handlers.change({ target: { id: 'guided-swap', checked: true } });
  assert.match(app.html(), /৳71/);
  assert.match(app.html(), /your chosen swap/);

  app.click('apply');
  assert.match(app.html(), /Plan selected for this demo/);
  assert.match(app.html(), /Nothing was sent to a model or saved to your profile/);
});

test('saved pantry rows are not counted until the user confirms they are still available', () => {
  const pantry = { items: [{ name: 'Rice', bn: 'চাল', qty: 0.3, unit: 'kg', price: 24 }] };
  const app = harness({ pantry });
  app.click('open');
  assert.match(app.html(), /Which saved items are still at home today/);
  assert.match(app.html(), /<b>৳100<\/b>/);
  assert.match(app.html(), /data-guided-stock="0"/);

  app.handlers.change({ target: { dataset: { guidedStock: '0' }, checked: true, matches: () => true } });
  assert.match(app.html(), /<b>৳76<\/b>/);
  assert.match(app.html(), /৳24/);
  assert.equal(pantry.items[0].qty, 0.3, 'display calculation must not consume or rewrite saved pantry stock');
});

test('switching the active persona clears demo stock and the previous profile budget', () => {
  const app = harness();
  app.click('demo');
  assert.match(app.html(), /Illustrative demo pantry · not saved/);
  app.state.who = 'mariam';
  app.context.profile = structuredClone(app.context.personas.mariam);
  app.context.render();
  assert.match(app.html(), /value="220"/);
  assert.doesNotMatch(app.html(), /Illustrative demo pantry · not saved/);
  assert.match(app.html(), /No confirmed pantry list yet/);
});
