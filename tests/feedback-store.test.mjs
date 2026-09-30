import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const store = require('../feedback-store.js');
const ranking = require('../ranking-core.js');
const { groups } = require('../swap-catalog.js');

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

test('feedback is stored under a profile-specific key and cleared only for that key', () => {
  const storage = memoryStorage();
  assert.equal(store.save(storage, 'aharai.swap-feedback.v1.nabil', groups, 'eggs', 'rui-fish', 'down', 'unavailable'), true);
  assert.equal(store.save(storage, 'aharai.swap-feedback.v1.rahim', groups, 'eggs', 'masoor-dal', 'up'), true);
  const nabil = store.read(storage, 'aharai.swap-feedback.v1.nabil', groups);
  assert.deepEqual(nabil.eggs['rui-fish'], { vote: 'down', reason: 'unavailable' });
  assert.deepEqual(store.read(storage, 'aharai.swap-feedback.v1.rahim', groups).eggs['masoor-dal'], { vote: 'up', reason: null });
  assert.equal(store.clear(storage, 'aharai.swap-feedback.v1.nabil'), true);
  assert.deepEqual(store.read(storage, 'aharai.swap-feedback.v1.nabil', groups), {});
  assert.equal(store.count(store.read(storage, 'aharai.swap-feedback.v1.rahim', groups)), 1);
});

test('invalid catalogue IDs, votes, and missing negative-feedback reasons are rejected', () => {
  const storage = memoryStorage();
  assert.equal(store.save(storage, 'feedback', groups, 'unknown-group', 'rui-fish', 'up'), false);
  assert.equal(store.save(storage, 'feedback', groups, 'eggs', 'unlisted', 'up'), false);
  assert.equal(store.save(storage, 'feedback', groups, 'eggs', 'rui-fish', 'neutral'), false);
  assert.equal(store.save(storage, 'feedback', groups, 'eggs', 'rui-fish', 'down'), false);
  assert.deepEqual(store.read(storage, 'feedback', groups), {});
});

test('only exact ties use feedback; budget, chosen priority, and lower cost retain precedence', () => {
  const options = [
    { id: 'a', mealTags: ['one-pot'] },
    { id: 'b', mealTags: [] },
  ];
  const equal = { a: { total: 80, pantryCovered: 5 }, b: { total: 80, pantryCovered: 5 } };
  assert.deepEqual(ranking.rank(options, equal, 100, 'budget', { b: { vote: 'up' } }), ['b', 'a']);
  const differentCosts = { a: { total: 70, pantryCovered: 5 }, b: { total: 80, pantryCovered: 5 } };
  assert.deepEqual(ranking.rank(options, differentCosts, 100, 'budget', { b: { vote: 'up' } }), ['a', 'b']);
  const budgetBoundary = { a: { total: 80, pantryCovered: 5 }, b: { total: 120, pantryCovered: 5 } };
  assert.deepEqual(ranking.rank(options, budgetBoundary, 100, 'budget', { b: { vote: 'up' } }), ['a', 'b']);
  assert.deepEqual(ranking.rank(options, equal, 100, 'one-pot', { b: { vote: 'up' } }), ['a', 'b']);
});
