/*
 * AharAI demo planning layer.
 * This is transparent rules-based arithmetic, not a trained AI model.
 * Only confirmed pantry rows with a clear food-name match and compatible unit
 * are deducted from the illustrative shopping basket.
 */
(function () {
  const originalBasket = basket;
  const originalPlanView = planView;

  function foodKey(name) {
    const text = String(name || '').toLowerCase();
    if (/\b(rice)\b|চাল/.test(text)) return 'rice';
    if (/masoor|lentil|\bdal\b|মসুর|ডাল/.test(text)) return 'lentils';
    if (/\beggs?\b|ডিম/.test(text)) return 'eggs';
    if (/vegetable|greens|leafy|সবজি|শাক/.test(text)) return 'vegetables';
    if (/\bbananas?\b|কলা/.test(text)) return 'bananas';
    if (/\boil\b|তেল/.test(text)) return 'oil';
    if (/spice|salt|মসলা|লবণ/.test(text)) return 'seasoning';
    if (/\bfish\b|machh|মাছ/.test(text)) return 'fish';
    return null;
  }

  function unitFamily(unit) {
    const normalized = String(unit || '').toLowerCase().trim();
    if (normalized === 'kg' || normalized === 'g') return 'mass';
    if (normalized === 'pcs' || normalized === 'pc' || normalized === 'piece') return 'count';
    if (normalized === 'l' || normalized === 'litre' || normalized === 'liter') return 'volume';
    if (normalized === 'bunch') return 'bunch';
    if (normalized === 'lot') return 'lot';
    return null;
  }

  function inPlanUnits(quantity, fromUnit, toUnit) {
    const from = String(fromUnit || '').toLowerCase().trim();
    const to = String(toUnit || '').toLowerCase().trim();
    if (from === to || (unitFamily(from) === 'count' && unitFamily(to) === 'count')) return quantity;
    if (from === 'g' && to === 'kg') return quantity / 1000;
    if (from === 'kg' && to === 'g') return quantity * 1000;
    return null;
  }

  function pantryAdjustedBasket() {
    const baseItems = originalBasket();
    let saved;
    try {
      saved = savedPantry();
    } catch {
      saved = null;
    }
    const pantryItems = saved && Array.isArray(saved.items) ? saved.items : [];

    return baseItems.map((item) => {
      const targetKey = foodKey(item.en);
      const available = pantryItems.reduce((sum, stock) => {
        if (!targetKey || foodKey(stock.name) !== targetKey) return sum;
        const converted = inPlanUnits(Number(stock.qty), stock.unit, item.unit);
        return converted === null || !Number.isFinite(converted) || converted < 0 ? sum : sum + converted;
      }, 0);
      const coveredQty = Math.min(item.qty, available);
      const toBuyQty = Math.max(0, item.qty - coveredQty);
      const cost = item.qty > 0 ? Math.round(item.cost * (toBuyQty / item.qty)) : item.cost;
      const roundQty = (value) => Math.round(value * 1000) / 1000;
      return {
        ...item,
        plannedQty: item.qty,
        coveredQty: roundQty(coveredQty),
        qty: roundQty(toBuyQty),
        cost,
        coveredValue: item.cost - cost,
      };
    });
  }

  basket = pantryAdjustedBasket;

  planView = function () {
    let html = originalPlanView();
    const items = basket();
    const matched = items.filter((item) => item.coveredQty > 0);
    const coveredValue = items.reduce((sum, item) => sum + item.coveredValue, 0);
    const saved = savedPantry();
    const constraints = `${state.people} adult-equivalent person(s) · ${state.days} day(s) · ৳${state.budget} sample budget`;
    let details;

    if (!saved) {
      details = '<p>Build a plan using the sample budget. Confirmed items from <a href="#bazar" class="text-link">My bazar</a> can be counted here on your next visit to Food plan.</p>';
    } else if (matched.length) {
      const rows = matched.map((item) => `<li><strong>${item.en}</strong>: ${item.coveredQty} ${item.unit} available to reuse</li>`).join('');
      details = `<p>Based on your confirmed pantry, the example basket covers about <strong>৳${coveredValue}</strong> of planned ingredients. Check that these items are still available before relying on the list.</p><ul>${rows}</ul>`;
    } else {
      details = '<p>Your saved pantry has no clear name-and-unit matches in this sample basket, so nothing was deducted. Add or correct an item in My bazar if needed.</p>';
    }

    const note = `<aside class="plan-insight" aria-label="How this sample plan is adjusted"><span class="eyebrow">HOW THIS SAMPLE PLAN ADAPTS</span><p class="plan-constraints">${constraints}</p>${details}<p class="help">Transparent demo rule: only recognizable food names and compatible units are matched. Unclear items are ignored. Prices are illustrative, and this does not track expiry or consumption.</p></aside>`;
    const marker = '</div><div class="two-col"><section><form class="surface" id="plan-form">';
    if (html.includes(marker)) html = html.replace(marker, `</div>${note}<div class="two-col"><section><form class="surface" id="plan-form">`);
    return html;
  };

  // The base app renders once before this enhancement script loads. Re-render
  // so the current route uses the pantry-aware plan implementation immediately.
  render();
})();
