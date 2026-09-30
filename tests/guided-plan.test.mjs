import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { calculatePlan } = require('../guided-plan-core.js');

test('busy-workday plan is a three-meal illustrative rules calculation', () => {
  const result = calculatePlan({ context: 'workday', budget: 160 });
  assert.equal(result.meals.length, 3);
  assert.deepEqual(result.meals.map((meal) => meal.id), ['breakfast', 'lunch', 'dinner']);
  assert.equal(result.total, 100);
  assert.equal(result.remaining, 60);
  assert.equal(result.pantrySavings, 0);
  assert.equal(result.illustrative, true);
});

test('home-cooking rhythm changes the example basket', () => {
  const result = calculatePlan({ context: 'home', budget: 160 });
  assert.equal(result.meals[0].dish, 'Rice & egg');
  assert.equal(result.total, 107);
  assert.equal(result.remaining, 53);
});

test('only explicitly selected, name-matched, unit-compatible pantry stock reduces the estimate', () => {
  const stock = [
    { name: 'Rice', qty: 0.2, unit: 'kg' },
    { name: 'Masoor dal', qty: 80, unit: 'g' },
    { name: 'Eggs', qty: 3, unit: 'pcs' },
    { name: 'Unrecognized groceries', qty: 5, unit: 'kg' },
    { name: 'Rice', qty: 2, unit: 'pcs' },
  ];
  const original = structuredClone(stock);
  const result = calculatePlan({ context: 'workday', budget: 160, stock });
  assert.equal(result.total, 46);
  assert.equal(result.pantrySavings, 54);
  assert.equal(result.coveredItems.find((item) => item.key === 'rice').qty, 0.2);
  assert.equal(result.coveredItems.find((item) => item.key === 'lentils').qty, 0.08);
  assert.equal(result.coveredItems.find((item) => item.key === 'eggs').qty, 2);
  assert.deepEqual(stock, original, 'planning must not mutate the saved pantry record');
});

test('the optional lunch egg-to-dal swap recalculates cost and leaves other meals intact', () => {
  const baseline = calculatePlan({ context: 'workday', budget: 160 });
  const swapped = calculatePlan({ context: 'workday', budget: 160, swap: true });
  assert.equal(swapped.total, 99);
  assert.equal(swapped.total - baseline.total, -1);
  assert.equal(swapped.meals[0].items.some((item) => item.swapped), false);
  assert.equal(swapped.meals[1].items.some((item) => item.swapped && item.key === 'lentils'), true);
});

test('pantry coverage is applied once across meals and changes the visible swap delta', () => {
  const stock = [{ name: 'Rice', qty: 0.2, unit: 'kg' }, { name: 'Masoor dal', qty: 0.08, unit: 'kg' }];
  const baseline = calculatePlan({ context: 'workday', budget: 160, stock });
  const swapped = calculatePlan({ context: 'workday', budget: 160, stock, swap: true });
  assert.equal(baseline.total, 72);
  assert.equal(swapped.total, 71);
  assert.equal(swapped.remaining, 89);
});

test('invalid budgets are rejected instead of silently producing a misleading balance', () => {
  assert.throws(() => calculatePlan({ budget: -1 }), /Budget must be between/);
  assert.throws(() => calculatePlan({ budget: 'not a number' }), /Budget must be between/);
  assert.throws(() => calculatePlan({ budget: 100001 }), /Budget must be between/);
});
