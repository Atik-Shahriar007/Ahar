/* Guided Plan for Today: transparent illustrative arithmetic, not nutrition or live-price advice. */
(function (root) {
  const price = { rice: 80, lentils: 150, eggs: 13, flour: 65, vegetables: 80, oil: 200, seasoning: 4 };
  const recipes = {
    workday: [
      { id: 'breakfast', en: 'Breakfast', bn: 'সকালের খাবার', dish: 'Ruti & egg', dishBn: 'রুটি ও ডিম', items: [
        { id: 'flour-breakfast', key: 'flour', en: 'Flour', bn: 'আটা', qty: 0.12, unit: 'kg' },
        { id: 'egg-breakfast', key: 'eggs', en: 'Eggs', bn: 'ডিম', qty: 1, unit: 'pcs' },
      ] },
      { id: 'lunch', en: 'Lunch', bn: 'দুপুরের খাবার', dish: 'Rice, dal, egg & greens', dishBn: 'ভাত, ডাল, ডিম ও শাক', items: [
        { id: 'rice-lunch', key: 'rice', en: 'Rice', bn: 'চাল', qty: 0.18, unit: 'kg' },
        { id: 'dal-lunch', key: 'lentils', en: 'Masoor dal', bn: 'মসুর ডাল', qty: 0.06, unit: 'kg' },
        { id: 'egg-lunch', key: 'eggs', en: 'Eggs', bn: 'ডিম', qty: 1, unit: 'pcs' },
        { id: 'greens-lunch', key: 'vegetables', en: 'Seasonal vegetables', bn: 'মৌসুমি সবজি', qty: 0.08, unit: 'kg' },
        { id: 'oil-lunch', key: 'oil', en: 'Cooking oil', bn: 'রান্নার তেল', qty: 0.01, unit: 'L' },
      ] },
      { id: 'dinner', en: 'Dinner', bn: 'রাতের খাবার', dish: 'Shobji khichuri', dishBn: 'সবজি খিচুড়ি', items: [
        { id: 'rice-dinner', key: 'rice', en: 'Rice', bn: 'চাল', qty: 0.12, unit: 'kg' },
        { id: 'dal-dinner', key: 'lentils', en: 'Masoor dal', bn: 'মসুর ডাল', qty: 0.04, unit: 'kg' },
        { id: 'veg-dinner', key: 'vegetables', en: 'Seasonal vegetables', bn: 'মৌসুমি সবজি', qty: 0.15, unit: 'kg' },
        { id: 'oil-dinner', key: 'oil', en: 'Cooking oil', bn: 'রান্নার তেল', qty: 0.015, unit: 'L' },
        { id: 'seasoning-dinner', key: 'seasoning', en: 'Spices & salt allowance', bn: 'মসলা ও লবণের নমুনা বরাদ্দ', qty: 1, unit: 'lot' },
      ] },
    ],
    home: [
      { id: 'breakfast', en: 'Breakfast', bn: 'সকালের খাবার', dish: 'Rice & egg', dishBn: 'ভাত ও ডিম', items: [
        { id: 'rice-breakfast', key: 'rice', en: 'Rice', bn: 'চাল', qty: 0.1, unit: 'kg' },
        { id: 'egg-breakfast', key: 'eggs', en: 'Eggs', bn: 'ডিম', qty: 1, unit: 'pcs' },
      ] },
      { id: 'lunch', en: 'Lunch', bn: 'দুপুরের খাবার', dish: 'Rice, dal, egg & greens', dishBn: 'ভাত, ডাল, ডিম ও শাক', items: [
        { id: 'rice-lunch', key: 'rice', en: 'Rice', bn: 'চাল', qty: 0.18, unit: 'kg' },
        { id: 'dal-lunch', key: 'lentils', en: 'Masoor dal', bn: 'মসুর ডাল', qty: 0.08, unit: 'kg' },
        { id: 'egg-lunch', key: 'eggs', en: 'Eggs', bn: 'ডিম', qty: 1, unit: 'pcs' },
        { id: 'greens-lunch', key: 'vegetables', en: 'Seasonal vegetables', bn: 'মৌসুমি সবজি', qty: 0.1, unit: 'kg' },
        { id: 'oil-lunch', key: 'oil', en: 'Cooking oil', bn: 'রান্নার তেল', qty: 0.01, unit: 'L' },
      ] },
      { id: 'dinner', en: 'Dinner', bn: 'রাতের খাবার', dish: 'Shobji khichuri', dishBn: 'সবজি খিচুড়ি', items: [
        { id: 'rice-dinner', key: 'rice', en: 'Rice', bn: 'চাল', qty: 0.12, unit: 'kg' },
        { id: 'dal-dinner', key: 'lentils', en: 'Masoor dal', bn: 'মসুর ডাল', qty: 0.05, unit: 'kg' },
        { id: 'veg-dinner', key: 'vegetables', en: 'Seasonal vegetables', bn: 'মৌসুমি সবজি', qty: 0.15, unit: 'kg' },
        { id: 'oil-dinner', key: 'oil', en: 'Cooking oil', bn: 'রান্নার তেল', qty: 0.015, unit: 'L' },
        { id: 'seasoning-dinner', key: 'seasoning', en: 'Spices & salt allowance', bn: 'মসলা ও লবণের নমুনা বরাদ্দ', qty: 1, unit: 'lot' },
      ] },
    ],
  };

  function foodKey(name) {
    const text = String(name || '').toLowerCase();
    if (/\brice\b|চাল/.test(text)) return 'rice';
    if (/masoor|lentil|\bdal\b|মসুর|ডাল/.test(text)) return 'lentils';
    if (/\beggs?\b|ডিম/.test(text)) return 'eggs';
    if (/\bflour\b|আটা/.test(text)) return 'flour';
    if (/vegetable|greens|leafy|সবজি|শাক/.test(text)) return 'vegetables';
    if (/\boil\b|তেল/.test(text)) return 'oil';
    if (/spice|salt|মসলা|লবণ/.test(text)) return 'seasoning';
    return null;
  }

  function unitFamily(unit) {
    const normalized = String(unit || '').toLowerCase().trim();
    if (normalized === 'kg' || normalized === 'g') return 'mass';
    if (['pcs', 'pc', 'piece'].includes(normalized)) return 'count';
    if (['l', 'litre', 'liter'].includes(normalized)) return 'volume';
    if (normalized === 'bunch') return 'bunch';
    if (normalized === 'lot') return 'lot';
    return null;
  }

  function toCanonical(quantity, unit) {
    const normalized = String(unit || '').toLowerCase().trim();
    if (normalized === 'g') return quantity / 1000;
    return quantity;
  }

  function fromCanonical(quantity, unit) {
    const normalized = String(unit || '').toLowerCase().trim();
    if (normalized === 'g') return quantity * 1000;
    return quantity;
  }

  function rounded(quantity) {
    return Math.round((quantity + Number.EPSILON) * 1000) / 1000;
  }

  function calculatePlan({ context = 'workday', budget = 0, stock = [], swap = false } = {}) {
    const chosenContext = context === 'home' ? 'home' : 'workday';
    const chosenBudget = Number(budget);
    if (!Number.isFinite(chosenBudget) || chosenBudget < 0 || chosenBudget > 100000) {
      throw new RangeError('Budget must be between 0 and 100000 taka.');
    }
    const meals = recipes[chosenContext].map((meal) => ({ ...meal, items: meal.items.map((item) => ({ ...item })) }));
    if (swap) {
      const lunch = meals.find((meal) => meal.id === 'lunch');
      const eggIndex = lunch.items.findIndex((item) => item.id === 'egg-lunch');
      if (eggIndex !== -1) {
        lunch.items.splice(eggIndex, 1, {
          id: 'dal-swap-lunch', key: 'lentils', en: 'Masoor dal', bn: 'মসুর ডাল', qty: 0.08, unit: 'kg', swapped: true,
        });
      }
    }

    const remainingStock = new Map();
    for (const record of Array.isArray(stock) ? stock : []) {
      const name = [record?.name, record?.en, record?.bn].filter(Boolean).join(' ');
      const key = foodKey(name);
      const family = unitFamily(record?.unit);
      const quantity = Number(record?.qty);
      if (!key || !family || !Number.isFinite(quantity) || quantity <= 0) continue;
      const stockKey = `${key}:${family}`;
      remainingStock.set(stockKey, (remainingStock.get(stockKey) || 0) + toCanonical(quantity, record.unit));
    }

    const coveredByFood = new Map();
    let total = 0;
    let pantrySavings = 0;
    for (const meal of meals) {
      meal.cost = 0;
      for (const item of meal.items) {
        const family = unitFamily(item.unit);
        const required = toCanonical(item.qty, item.unit);
        const stockKey = `${item.key}:${family}`;
        const available = remainingStock.get(stockKey) || 0;
        const coveredCanonical = Math.min(required, available);
        remainingStock.set(stockKey, Math.max(0, available - coveredCanonical));
        const coveredQty = rounded(fromCanonical(coveredCanonical, item.unit));
        const toBuyQty = rounded(Math.max(0, item.qty - coveredQty));
        const grossCost = Math.round(item.qty * price[item.key]);
        const purchaseCost = Math.round(toBuyQty * price[item.key]);
        const coveredValue = Math.max(0, grossCost - purchaseCost);
        Object.assign(item, { coveredQty, toBuyQty, purchaseCost, coveredValue });
        meal.cost += purchaseCost;
        total += purchaseCost;
        pantrySavings += coveredValue;
        if (coveredQty > 0) {
          const prior = coveredByFood.get(item.key) || { key: item.key, en: item.en, bn: item.bn, unit: item.unit, qty: 0, value: 0 };
          prior.qty = rounded(prior.qty + coveredQty);
          prior.value += coveredValue;
          coveredByFood.set(item.key, prior);
        }
      }
    }

    return {
      context: chosenContext,
      budget: chosenBudget,
      total,
      remaining: chosenBudget - total,
      pantrySavings,
      coveredItems: [...coveredByFood.values()],
      meals,
      swap: Boolean(swap),
      illustrative: true,
    };
  }

  const api = { calculatePlan, foodKey };
  root.AHAR_GUIDED_PLAN_CORE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
