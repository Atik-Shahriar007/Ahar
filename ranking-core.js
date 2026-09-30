/* Deterministic comparison baseline shared by the UI, local API, and tests. */
(function (root) {
  function rank(options, metrics, budget, goalId) {
    const safeBudget = Number(budget);
    return [...options].sort((a, b) => {
      const aMetrics = metrics[a.id];
      const bMetrics = metrics[b.id];
      if (!aMetrics || !bMetrics) throw new Error('Missing metrics for a candidate.');
      const aFits = aMetrics.total <= safeBudget;
      const bFits = bMetrics.total <= safeBudget;
      let aGoalScore = 0;
      let bGoalScore = 0;
      if (goalId === 'pantry') {
        aGoalScore = aMetrics.pantryCovered;
        bGoalScore = bMetrics.pantryCovered;
      } else if (['one-pot', 'rice-meal', 'roti-meal'].includes(goalId)) {
        aGoalScore = a.mealTags.includes(goalId) ? 1 : 0;
        bGoalScore = b.mealTags.includes(goalId) ? 1 : 0;
      }
      return Number(bFits) - Number(aFits)
        || bGoalScore - aGoalScore
        || aMetrics.total - bMetrics.total
        || a.id.localeCompare(b.id);
    }).map((option) => option.id);
  }

  const api = { rank };
  root.AHAR_RANKING_CORE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
