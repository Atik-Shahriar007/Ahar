/* Shared validation for the opt-in meal-text demonstration. */
(function (root) {
  const catalog = root.AHAR_MEAL_FOODS || (typeof require === 'function' ? require('./meal-text-catalog.js') : []);
  const byId = new Map(catalog.map((food) => [food.id, food]));
  const unitTerms = {
    cup: ['cup', 'cups', 'কাপ'], plate: ['plate', 'plates', 'প্লেট'], bowl: ['bowl', 'bowls', 'বাটি'],
    piece: ['piece', 'pieces', 'pcs', 'টুকরা', 'টুকরো'],
    g: ['g', 'gram', 'grams', 'গ্রাম'], kg: ['kg', 'kilogram', 'kilograms', 'কেজি', 'কিলোগ্রাম'],
    tsp: ['tsp', 'teaspoon', 'teaspoons', 'চা চামচ'], tbsp: ['tbsp', 'tablespoon', 'tablespoons', 'টেবিল চামচ'],
    ml: ['ml', 'milliliter', 'milliliters', 'মিলিলিটার'], L: ['l', 'liter', 'litre', 'লিটার'],
  };
  const numberWords = new Map([
    ['one', 1], ['two', 2], ['three', 3], ['four', 4], ['five', 5], ['six', 6], ['seven', 7], ['eight', 8], ['nine', 9], ['ten', 10],
    ['এক', 1], ['একটি', 1], ['একটা', 1], ['দুই', 2], ['দুটি', 2], ['দুটো', 2], ['তিন', 3], ['তিনটি', 3], ['চার', 4], ['পাঁচ', 5], ['ছয়', 6], ['ছয়', 6], ['সাত', 7], ['আট', 8], ['নয়', 9], ['নয়', 9], ['দশ', 10],
  ]);

  function normalize(text) {
    return String(text || '').normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  }
  function isWordChar(char) {
    return !!char && /[\p{L}\p{N}]/u.test(char);
  }
  function aliasOccurrences(text, alias) {
    const source = normalize(text);
    const haystack = source;
    const needle = normalize(alias);
    if (!needle) return [];
    const matches = [];
    let from = 0;
    while (from <= haystack.length - needle.length) {
      const index = haystack.indexOf(needle, from);
      if (index < 0) break;
      const end = index + needle.length;
      const before = index ? haystack[index - 1] : '';
      const after = end < haystack.length ? haystack[end] : '';
      if (/\p{Script=Bengali}/u.test(needle) || (!isWordChar(before) && !isWordChar(after))) {
        matches.push({ start: index, end, text: source.slice(index, end) });
      }
      from = index + Math.max(1, needle.length);
    }
    return matches;
  }
  function includesEvidence(text, evidence) {
    const quote = normalize(evidence);
    return quote.length > 0 && normalize(text).includes(quote);
  }
  function findFoodInEvidence(food, evidence) {
    return food.aliases.some((alias) => aliasOccurrences(evidence, alias).length > 0);
  }
  function extractExplicitQuantity(evidence) {
    const text = normalize(evidence);
    const tokens = [];
    const digits = /[0-9০-৯]+(?:[.٫][0-9০-৯]+)?/gu;
    for (const match of text.matchAll(digits)) {
      const latin = match[0].replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))).replace('٫', '.');
      const value = Number(latin);
      if (Number.isFinite(value)) tokens.push({ start: match.index, end: match.index + match[0].length, value });
    }
    for (const [word, value] of numberWords) {
      for (const hit of aliasOccurrences(text, word)) tokens.push({ start: hit.start, end: hit.end, value });
    }
    tokens.sort((a, b) => a.start - b.start || b.end - a.end);
    const unique = tokens.filter((token, index) => !tokens.slice(0, index).some((prior) => token.start < prior.end && token.end > prior.start));
    return unique.length === 1 ? unique[0].value : null;
  }
  function unitIsExplicit(evidence, unit) {
    if (!unit || !unitTerms[unit]) return false;
    if (unitTerms[unit].some((term) => aliasOccurrences(evidence, term).length > 0)) return true;
    if (unit !== 'piece') return false;
    const words = [...numberWords.keys()].sort((a, b) => b.length - a.length).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:[0-9০-৯]+|${words.join('|')})\\s*(?:টি|টা)(?=$|[^\\p{L}\\p{N}])`, 'iu').test(normalize(evidence));
  }
  function validateItems(items, sentence) {
    if (!Array.isArray(items) || typeof sentence !== 'string') return { items: [], rejected: 0 };
    const clean = [];
    let rejected = 0;
    const seen = new Set();
    for (const item of items.slice(0, 30)) {
      const food = byId.get(item?.foodId);
      const evidence = typeof item?.evidence === 'string' ? item.evidence.trim().slice(0, 140) : '';
      if (!food || seen.has(food.id) || !includesEvidence(sentence, evidence) || !findFoodInEvidence(food, evidence)) {
        rejected += 1;
        continue;
      }
      seen.add(food.id);
      let unit = food.units.includes(item.unit) && unitIsExplicit(evidence, item.unit) ? item.unit : null;
      const explicitQuantity = extractExplicitQuantity(evidence);
      let quantity = null;
      let uncertainty = ['low', 'medium', 'high'].includes(item.uncertainty) ? item.uncertainty : 'high';
      if (explicitQuantity !== null) {
        if (item.quantity == null || (Number.isFinite(Number(item.quantity)) && Math.abs(Number(item.quantity) - explicitQuantity) < 0.0001)) {
          quantity = explicitQuantity;
        } else {
          uncertainty = 'high';
        }
      } else if (item.quantity != null) {
        uncertainty = 'high';
      }
      if (quantity !== null && (quantity <= 0 || quantity > 10000)) {
        quantity = null;
        uncertainty = 'high';
      }
      if (item.unit && item.unit !== 'unknown' && !unit) uncertainty = 'high';
      clean.push({ foodId: food.id, quantity, unit, evidence, uncertainty });
    }

    // Prefer a specific match over a generic one when both quote the same phrase.
    const ranked = [...clean].sort((a, b) => b.evidence.length - a.evidence.length);
    const accepted = [];
    for (const item of ranked) {
      const genericOverlap = accepted.some((other) => normalize(other.evidence).includes(normalize(item.evidence)) && other.foodId !== item.foodId);
      if (genericOverlap) { rejected += 1; continue; }
      accepted.push(item);
    }
    return { items: accepted.slice(0, 12), rejected };
  }
  function rulesMatch(sentence) {
    const candidates = [];
    for (const food of catalog) {
      for (const alias of food.aliases) {
        for (const hit of aliasOccurrences(sentence, alias)) candidates.push({ food, ...hit });
      }
    }
    candidates.sort((a, b) => (b.end - b.start) - (a.end - a.start) || a.start - b.start);
    const spans = [];
    for (const candidate of candidates) {
      if (spans.some((span) => candidate.start < span.end && candidate.end > span.start)) continue;
      if (spans.some((span) => span.foodId === candidate.food.id)) continue;
      spans.push({ start: candidate.start, end: candidate.end, text: candidate.text, foodId: candidate.food.id });
    }
    return spans.sort((a, b) => a.start - b.start).map((span) => ({
      foodId: span.foodId, quantity: null, unit: null, evidence: span.text, uncertainty: 'high',
    }));
  }

  const api = { catalog, extractExplicitQuantity, includesEvidence, rulesMatch, unitIsExplicit, validateItems };
  root.AHAR_MEAL_TEXT_CORE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
