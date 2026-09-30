import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const marketDataSource = await readFile(new URL('../market-data.js', import.meta.url), 'utf8');
const marketScript = await readFile(new URL('../market-pulse.js', import.meta.url), 'utf8');
const json = marketDataSource.slice(marketDataSource.indexOf('=') + 1).trim().replace(/;\s*$/, '');
const data = JSON.parse(json);
let changeHandler;
const panel = { outerHTML: '' };
const document = {
  addEventListener: (type, handler) => { if (type === 'change') changeHandler = handler; },
  querySelector: (selector) => selector === '.market-pulse' ? panel : null,
};
const window = { AHAR_MARKET_DEMO: data, document };
vm.runInNewContext(marketScript, { window });


test('market pulse displays dated historical observations and source attribution', () => {
  const state = { bn: false };
  const html = window.AHAR_MARKET_PULSE.render(state);
  assert.match(html, /A glimpse of bazar prices/);
  assert.match(html, /15 Jul 2026/);
  assert.match(html, /not today/);
  assert.match(html, /WFP Price Database via HDX/);
  assert.match(html, /BDT \/ KG/);
  assert.match(html, /View 10 dated observations/);
});

test('market selection refreshes the displayed cards for the selected market', () => {
  const state = { bn: false };
  window.AHAR_MARKET_PULSE.render(state);
  assert.equal(typeof changeHandler, 'function');
  changeHandler({ target: { id: 'market-pulse-market', value: 'Kawran Bazar Dhaka' } });
  assert.match(panel.outerHTML, /Kawran Bazar, Dhaka/);
  assert.match(panel.outerHTML, /Green chilli/);
  assert.equal(state.marketPulseMarket, 'Kawran Bazar Dhaka');
});

test('Bangla screen names the historical experience and marks values as sample data', () => {
  const html = window.AHAR_MARKET_PULSE.render({ bn: true });
  assert.match(html, /বাজারের দামের ধারাবাহিকতা/);
  assert.match(html, /আজকের দাম নয়/);
  assert.match(html, /তথ্যসূত্র খুলুন/);
});
