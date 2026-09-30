import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const ranking = require('../ranking-core.js');
const { groups } = require('../swap-catalog.js');
const cases = JSON.parse(await readFile(new URL('../benchmarks/ranking-cases.json', import.meta.url), 'utf8'));

test('the ranker returns a complete deterministic ordering for every synthetic case', () => {
  for (const scenario of cases) {
    const group = groups.find((item) => item.id === scenario.sourceId);
    assert.ok(group, `unknown source group: ${scenario.sourceId}`);
    const order = ranking.rank(group.options, scenario.candidateMetrics, scenario.budget, scenario.goalId);
    assert.deepEqual(order, scenario.expectedRulesOrder, scenario.id);
    assert.equal(new Set(order).size, group.options.length, `${scenario.id} must not duplicate IDs`);
  }
});

test('the ranker does not mutate catalogue options or candidate metrics', () => {
  const scenario = cases[0];
  const group = groups.find((item) => item.id === scenario.sourceId);
  const options = structuredClone(group.options);
  const metrics = structuredClone(scenario.candidateMetrics);
  ranking.rank(group.options, scenario.candidateMetrics, scenario.budget, scenario.goalId);
  assert.deepEqual(group.options, options);
  assert.deepEqual(scenario.candidateMetrics, metrics);
});

test('missing candidate metrics fail clearly', () => {
  const group = groups.find((item) => item.id === 'eggs');
  assert.throws(() => ranking.rank(group.options, { 'masoor-dal': { total: 10, pantryCovered: 0 } }, 100, 'budget'), /Missing metrics/);
});
