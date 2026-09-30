import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../meal-text-core.js');

test('rules fallback matches only direct English and Bangla names from the fixed list', () => {
  const items = core.rulesMatch('আজ ভাত, মসুর ডাল আর রুই মাছ খেয়েছি।');
  assert.deepEqual(items.map((item) => item.foodId), ['rice', 'masoor-dal', 'rui-fish']);
  assert.ok(items.every((item) => item.quantity === null && item.unit === null && item.uncertainty === 'high'));
  assert.deepEqual(core.rulesMatch('The price is high; no meal is described.'), []);
});

test('validator accepts only quoted allowlisted foods and quantities supported by the quote', () => {
  const sentence = 'আমি ২ কাপ ভাত এবং ১টি ডিম খেয়েছি।';
  const result = core.validateItems([
    { foodId: 'rice', quantity: 2, unit: 'cup', evidence: '২ কাপ ভাত', uncertainty: 'medium' },
    { foodId: 'eggs', quantity: 1, unit: 'piece', evidence: '১টি ডিম', uncertainty: 'low' },
    { foodId: 'eggs', quantity: 9, unit: 'piece', evidence: '১টি ডিম', uncertainty: 'low' },
    { foodId: 'fish-unspecified', quantity: null, unit: null, evidence: 'রুই মাছ', uncertainty: 'low' },
    { foodId: 'unknown-food', quantity: 3, unit: 'kg', evidence: '৩ কেজি অচেনা খাবার', uncertainty: 'low' },
    { foodId: 'rice', quantity: 3, unit: 'cup', evidence: 'unquoted rice', uncertainty: 'low' },
  ], sentence);
  assert.deepEqual(result.items, [
    { foodId: 'rice', quantity: 2, unit: 'cup', evidence: '২ কাপ ভাত', uncertainty: 'medium' },
    { foodId: 'eggs', quantity: 1, unit: 'piece', evidence: '১টি ডিম', uncertainty: 'low' },
  ]);
  assert.equal(result.rejected, 4);
});

test('a model cannot invent an amount or unit when the cited words do not support it', () => {
  const result = core.validateItems([
    { foodId: 'rice', quantity: 3, unit: 'cup', evidence: 'ভাত', uncertainty: 'low' },
    { foodId: 'rice', quantity: 2, unit: 'kg', evidence: 'দুই কাপ ভাত', uncertainty: 'low' },
  ], 'দুই কাপ ভাত');
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].quantity, null, 'a contradictory numeric answer is omitted');
  assert.equal(result.items[0].unit, null, 'an unsupported unit is omitted');
  assert.equal(result.items[0].uncertainty, 'high');
});

test('Bangla number words are retained only when the quoted item phrase supports them', () => {
  const result = core.validateItems([
    { foodId: 'rice', quantity: 2, unit: 'cup', evidence: 'দুই কাপ ভাত', uncertainty: 'medium' },
  ], 'দুই কাপ ভাত খেয়েছি।');
  assert.deepEqual(result.items[0], { foodId: 'rice', quantity: 2, unit: 'cup', evidence: 'দুই কাপ ভাত', uncertainty: 'medium' });
});
