#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ranking = require('../ranking-core.js');
const { groups } = require('../swap-catalog.js');
const scenarios = JSON.parse(await readFile(new URL('../benchmarks/ranking-cases.json', import.meta.url), 'utf8'));
const compareAI = process.argv.includes('--with-ai');
const endpoint = process.env.AHAR_RANKER_URL || 'http://127.0.0.1:5174/api/rank-swaps';
const results = [];

for (const scenario of scenarios) {
  const group = groups.find((item) => item.id === scenario.sourceId);
  assert.ok(group, `Unknown source group: ${scenario.sourceId}`);
  const rulesOrder = ranking.rank(group.options, scenario.candidateMetrics, scenario.budget, scenario.goalId);
  assert.deepEqual(rulesOrder, scenario.expectedRulesOrder, `Rules baseline changed for ${scenario.id}`);
  const result = { id: scenario.id, goalId: scenario.goalId, rulesOrder };
  if (compareAI) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sourceId: scenario.sourceId, goalId: scenario.goalId, budget: scenario.budget, candidateMetrics: scenario.candidateMetrics }),
      signal: AbortSignal.timeout(16000),
    });
    if (!response.ok) throw new Error(`Ranker request failed for ${scenario.id}: HTTP ${response.status}`);
    const payload = await response.json();
    if (payload.engine !== 'ai') throw new Error(`The local endpoint used ${payload.engine || 'an unknown engine'} for ${scenario.id}; configure model credentials and retry if you intend to compare AI.`);
    const allowed = new Set(group.options.map((item) => item.id));
    const ids = payload.rankedIds;
    if (!Array.isArray(ids) || ids.length !== allowed.size || new Set(ids).size !== ids.length || ids.some((id) => !allowed.has(id))) {
      throw new Error(`The model returned an invalid candidate ordering for ${scenario.id}.`);
    }
    result.aiOrder = ids;
    result.topChoiceAgreesWithRules = ids[0] === rulesOrder[0];
    result.aiTopChoiceWithinSampleBudget = scenario.candidateMetrics[ids[0]].total <= scenario.budget;
  }
  results.push(result);
}

const report = {
  mode: compareAI ? 'synthetic-rules-vs-optional-ai' : 'synthetic-rules-only',
  data: 'synthetic demonstration scenarios only; no user or real market data',
  interpretation: 'This checks behavior and rule alignment, not model accuracy, preference, nutrition quality, or social impact.',
  scenarioCount: results.length,
  ...(compareAI ? { topChoiceAgreementRate: results.filter((x) => x.topChoiceAgreesWithRules).length / results.length } : {}),
  results,
};
console.log(JSON.stringify(report, null, 2));
