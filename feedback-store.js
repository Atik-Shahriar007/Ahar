/* Opt-in swap feedback storage. The caller chooses a profile-specific localStorage key. */
(function (root) {
  const votes = new Set(['up', 'down']);
  const reasons = new Set(['too-expensive', 'unavailable', 'not-preferred', 'other']);

  function sanitize(value, groups) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const clean = {};
    for (const group of groups) {
      const stored = value[group.id];
      if (!stored || typeof stored !== 'object' || Array.isArray(stored)) continue;
      const allowedOptions = new Set(group.options.map((option) => option.id));
      for (const [optionId, entry] of Object.entries(stored)) {
        if (!allowedOptions.has(optionId) || !entry || !votes.has(entry.vote)) continue;
        if (entry.vote === 'down' && !reasons.has(entry.reason)) continue;
        clean[group.id] ||= {};
        clean[group.id][optionId] = {
          vote: entry.vote,
          reason: entry.vote === 'down' ? entry.reason : null,
        };
      }
    }
    return clean;
  }

  function read(storage, key, groups) {
    try {
      return sanitize(JSON.parse(storage.getItem(key) || '{}'), groups);
    } catch {
      return {};
    }
  }

  function save(storage, key, groups, groupId, optionId, vote, reason = '') {
    const group = groups.find((item) => item.id === groupId);
    if (!group || !group.options.some((item) => item.id === optionId) || !votes.has(vote)) return false;
    if (vote === 'down' && !reasons.has(reason)) return false;
    const current = read(storage, key, groups);
    current[groupId] ||= {};
    current[groupId][optionId] = { vote, reason: vote === 'down' ? reason : null };
    try {
      storage.setItem(key, JSON.stringify(current));
      return true;
    } catch {
      return false;
    }
  }

  function clear(storage, key) {
    try {
      storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function count(feedback) {
    return Object.values(feedback || {}).reduce((sum, entries) => sum + Object.keys(entries || {}).length, 0);
  }

  const api = { sanitize, read, save, clear, count };
  root.AHAR_FEEDBACK_STORE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
