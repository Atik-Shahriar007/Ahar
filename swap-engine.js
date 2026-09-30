/*
 * User-controlled sample-food substitutions and optional ranked suggestions.
 * All prices/quantities are illustrative. Nothing here establishes nutrition,
 * medical, allergy, religious, or live-market equivalence.
 */
(function () {
  const groups = window.AHAR_SWAP_CATALOG || [];
  const goals = window.AHAR_SWAP_GOALS || [];
  const baseBasket = basket;
  const key = () => `aharai.swaps.v1.${state.who}`;
  const goalKey = () => `aharai.swap-goal.v1.${state.who}`;
  const feedbackStore = window.AHAR_FEEDBACK_STORE;
  const feedbackKey = () => `aharai.swap-feedback.v1.${state.who}`;
  const feedbackReasons = [
    { id: 'too-expensive', en: 'Too expensive', bn: 'দাম বেশি' },
    { id: 'unavailable', en: 'Not available', bn: 'পাওয়া যায়নি' },
    { id: 'not-preferred', en: 'I do not like it', bn: 'আমার পছন্দ নয়' },
    { id: 'other', en: 'Other', bn: 'অন্য কারণ' },
  ];
  const roundQty = (value) => Math.round(value * 1000) / 1000;

  function readGoal() {
    try {
      const value = localStorage.getItem(goalKey());
      return goals.some((goal) => goal.id === value) ? value : 'budget';
    } catch {
      return 'budget';
    }
  }

  function writeGoal(value) {
    if (!goals.some((goal) => goal.id === value)) return;
    try { localStorage.setItem(goalKey(), value); } catch {}
  }

  function readFeedback() {
    return feedbackStore.read(localStorage, feedbackKey(), groups);
  }

  function readSelections() {
    try {
      const saved = JSON.parse(localStorage.getItem(key()) || '{}');
      const valid = {};
      for (const group of groups) {
        const id = saved[group.id];
        if (group.options.some((option) => option.id === id)) valid[group.id] = id;
      }
      return valid;
    } catch {
      return {};
    }
  }

  function writeSelections(selections) {
    try {
      localStorage.setItem(key(), JSON.stringify(selections));
    } catch {
      toast(tr('This browser could not save the swap choice.','এই ব্রাউজারে বদলের পছন্দ রাখা যায়নি।'));
    }
  }

  function mergeLines(items) {
    const merged = new Map();
    for (const source of items) {
      const item = { ...source, swapChanges: [...(source.swapChanges || [])] };
      const groupKey = `${String(item.en).trim().toLowerCase()}|${String(item.unit).trim().toLowerCase()}`;
      const existing = merged.get(groupKey);
      if (!existing) {
        merged.set(groupKey, item);
      } else {
        existing.qty = roundQty(existing.qty + item.qty);
        existing.cost += item.cost;
        existing.swapChanges.push(...item.swapChanges);
      }
    }
    return [...merged.values()];
  }

  function applySwaps(items, selections = readSelections()) {
    const scale = Math.max(1, Number(state.people) || 1) * Math.max(1, Number(state.days) || 1);
    const replaced = items.map((item) => {
      const group = groups.find((candidate) => candidate.source.en === item.en);
      if (!group || !selections[group.id]) return { ...item };
      const option = group.options.find((candidate) => candidate.id === selections[group.id]);
      if (!option) return { ...item };
      const qty = roundQty(option.qtyPerPersonDay * scale);
      const unit = option.unit;
      return {
        ...item,
        en: option.en,
        bn: option.bn,
        qty,
        unit,
        cost: Math.round(qty * option.pricePerUnit),
        swapChanges: [...(item.swapChanges || []), { from: item.en, to: option.en }],
      };
    });
    return mergeLines(replaced);
  }

  // The pantry wrapper loads after this script, so it receives the substituted
  // shopping basket and deducts stock from the replacement ingredient instead.
  basket = function () {
    return applySwaps(baseBasket());
  };

  function scenarioMetrics(groupId, optionId) {
    const selections = readSelections();
    selections[groupId] = optionId;
    const raw = applySwaps(baseBasket(), selections);
    const adjusted = window.AHAR_PLAN_MATH ? window.AHAR_PLAN_MATH.applyPantry(raw) : raw;
    return {
      total: adjusted.reduce((sum, item) => sum + item.cost, 0),
      pantryCovered: adjusted.reduce((sum, item) => sum + (item.coveredValue || 0), 0),
    };
  }

  function eligibleGroups() {
    const items = baseBasket();
    return groups.filter((group) => items.some((item) => item.en === group.source.en));
  }

  function feedbackPromptMarkup() {
    const prompt = state.feedbackPrompt;
    if (!prompt) return '';
    if (prompt.profile !== state.who) {
      state.feedbackPrompt = null;
      return '';
    }
    const group = groups.find((item) => item.id === prompt.groupId);
    const option = group?.options.find((item) => item.id === prompt.optionId);
    if (!group || !option) return '';
    const saved = readFeedback()[group.id]?.[option.id] || {};
    const en = !state.bn;
    const name = en ? option.en : option.bn;
    const voteOptions = [
      { id: 'up', en: 'Yes, it was useful', bn: 'হ্যাঁ, কাজে লেগেছে' },
      { id: 'down', en: 'No, it was not useful', bn: 'না, কাজে লাগেনি' },
    ].map((item) => `<option value="${item.id}" ${saved.vote === item.id ? 'selected' : ''}>${en ? item.en : item.bn}</option>`).join('');
    const reasonOptions = feedbackReasons.map((item) => `<option value="${item.id}" ${saved.reason === item.id ? 'selected' : ''}>${en ? item.en : item.bn}</option>`).join('');
    const reasonsVisible = saved.vote === 'down';
    return `<section class="swap-feedback" aria-labelledby="swap-feedback-heading"><h3 id="swap-feedback-heading">${en ? `Was ${escapeText(name)} useful?` : `${escapeText(name)} কি কাজে লেগেছে?`}</h3><p class="help">${en ? 'Optional feedback for this sample swap.' : 'এই নমুনা বদল নিয়ে মতামত ঐচ্ছিক।'}</p><div class="swap-feedback-fields"><label><span>${en ? 'Your feedback' : 'আপনার মতামত'}</span><select id="ahar-feedback-vote"><option value="">${en ? 'Choose an answer' : 'একটি উত্তর বাছুন'}</option>${voteOptions}</select></label><label class="swap-feedback-reason" data-feedback-reason-wrap ${reasonsVisible ? '' : 'hidden'}><span>${en ? 'What did not fit?' : 'কোনটি মানানসই হয়নি?'}</span><select id="ahar-feedback-reason"><option value="">${en ? 'Choose a reason' : 'কারণ বাছুন'}</option>${reasonOptions}</select></label></div><div class="swap-feedback-actions"><button type="button" class="button small" data-save-feedback>${saved.vote ? (en ? 'Update feedback' : 'মতামত বদলান') : (en ? 'Save feedback' : 'মতামত রাখুন')}</button><button type="button" class="button light small" data-skip-feedback>${en ? 'Not now' : 'এখন নয়'}</button></div></section>`;
  }

  function swapControls() {
    const available = eligibleGroups();
    const selections = readSelections();
    const ready = !!state.planReady;
    const en = !state.bn;
    const fields = available.map((group) => {
      const selected = selections[group.id] || '';
      const sourceName = en ? group.source.en : group.source.bn;
      const options = group.options.map((option) => {
        const unitCost = Math.round(option.qtyPerPersonDay * option.pricePerUnit);
        const label = en ? option.en : option.bn;
        const costNote = en ? ` · ~৳${unitCost}/person/day` : ` · ~৳${unitCost}/জন/দিন`;
        return `<option value="${option.id}" ${selected === option.id ? 'selected' : ''}>${label}${costNote}</option>`;
      }).join('');
      return `<label class="field swap-field"><span>${en ? `Swap ${sourceName}` : `${sourceName} বদলে নিন`}</span><select data-aharswap="${group.id}" ${ready ? '' : 'disabled'}><option value="" ${selected ? '' : 'selected'}>${en ? `Keep ${sourceName}` : `${sourceName} রাখুন`}</option>${options}</select></label>`;
    }).join('');
    const heading = en ? 'Change an ingredient' : 'উপকরণ বদলে দেখুন';
    const intro = ready
      ? (en ? 'Choose a sample shopping alternative. The basket, pantry deduction and budget will update.' : 'নমুনা বাজারের বিকল্প বেছে নিন। বাজারের তালিকা, ঘরের মজুত ও বাজেট নতুন করে হিসাব হবে।')
      : (en ? 'Build a food plan to enable sample swaps.' : 'নমুনা বদল চালু করতে আগে খাবার পরিকল্পনা তৈরি করুন।');
    const caution = en
      ? 'Shopping alternatives only—not nutrition or medical equivalence or allergy screening. The sample meal idea below is not rewritten; review it before cooking.'
      : 'শুধু বাজারের বিকল্প—পুষ্টি/চিকিৎসার সমতুল্যতা বা অ্যালার্জি যাচাই নয়। নিচের নমুনা খাবারের লেখা বদলায় না; রান্নার আগে মিলিয়ে নিন।';
    const disclosure = en
      ? 'Optional model request: selected ingredient, this planning priority, sample budget and per-option totals plus aggregate pantry coverage. No name, profile/body measurements, raw pantry list or photos are sent.'
      : 'ঐচ্ছিক মডেল অনুরোধে উপকরণ, পছন্দের অগ্রাধিকার, নমুনা বাজেট ও বিকল্পের মোট খরচ/মজুতের সম্মিলিত অঙ্ক যায়। নাম, প্রোফাইল, শারীরিক মাপ, ঘরের তালিকা বা ছবি যায় না।';
    const rankable = available.filter((group) => group.options.length > 1);
    const sourceOptions = rankable.map((group) => `<option value="${group.id}">${en ? group.source.en : group.source.bn}</option>`).join('');
    const goal = readGoal();
    const goalOptions = goals.map((item) => `<option value="${item.id}" ${goal === item.id ? 'selected' : ''}>${en ? item.en : item.bn}</option>`).join('');
    const reset = en ? 'Reset swaps' : 'বদল বাতিল';
    const resetFeedback = en ? 'Clear saved feedback' : 'রাখা মতামত মুছুন';
    const savedFeedbackCount = feedbackStore.count(readFeedback());
    const feedbackNote = en
      ? 'Saved only in this browser for this demo profile. It can break ties in local rules rankings, but it is never sent to the optional AI model.'
      : 'শুধু এই ব্রাউজারে এই নমুনা প্রোফাইলের জন্য থাকে। স্থানীয় নিয়মভিত্তিক সাজানোয় সমতা হলে এটি কাজে লাগে; ঐচ্ছিক এআই মডেলে পাঠানো হয় না।';
    const ask = en ? 'Rank alternatives with AI (optional)' : 'এআই দিয়ে বিকল্প সাজান (ঐচ্ছিক)';
    const controls = fields || `<p class="help">${en ? 'No eligible sample ingredients in this basket.' : 'এই নমুনা তালিকায় বদলানোর উপকরণ নেই।'}</p>`;
    const noRankable = rankable.length ? '' : `<p class="help">${en ? 'AI ranking needs more than one listed alternative; manual swaps are still available.' : 'এআই সাজাতে একাধিক বিকল্প দরকার; হাতে বদলের সুবিধা চালু আছে।'}</p>`;
    const dataEvidence = window.AHAR_INGREDIENT_EVIDENCE ? window.AHAR_INGREDIENT_EVIDENCE.render(state, groups) : '';
    return `<section class="swap-panel" aria-labelledby="swap-heading"><div class="swap-head"><div><span class="eyebrow">${en ? 'USER-CONTROLLED · SAMPLE DATA' : 'আপনার পছন্দ · নমুনা তথ্য'}</span><h2 id="swap-heading">${heading}</h2><p>${intro}</p></div><div class="swap-reset-actions"><button type="button" class="button light small" data-reset-feedback ${savedFeedbackCount ? '' : 'disabled'}>${resetFeedback}</button><button type="button" class="button light small" data-reset-swaps ${Object.keys(selections).length ? '' : 'disabled'}>${reset}</button></div></div><div class="swap-grid">${controls}</div>${dataEvidence}${feedbackPromptMarkup()}<p class="help swap-feedback-note">${feedbackNote}</p><p class="help swap-caution">${caution}</p><div class="swap-ai"><label class="field"><span>${en ? 'Choose an ingredient to rank' : 'যে উপকরণের বিকল্প সাজাবেন'}</span><select id="ahar-ai-source" ${ready && rankable.length ? '' : 'disabled'}>${sourceOptions}</select></label><label class="field"><span>${en ? 'What matters for this plan?' : 'এই পরিকল্পনায় কোনটি গুরুত্বপূর্ণ?'}</span><select id="ahar-ai-goal" ${ready && rankable.length ? '' : 'disabled'}>${goalOptions}</select></label><button type="button" class="button" data-rank-swaps ${ready && rankable.length ? '' : 'disabled'}>${ask}</button><p class="help">${disclosure}</p>${noRankable}<div class="swap-results" id="ahar-swap-results" aria-live="polite"></div></div></section>`;
  }

  function escapeText(value) {
    return typeof escapeHTML === 'function' ? escapeHTML(value) : String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  function rankLocally(group, metrics, goalId) {
    return window.AHAR_RANKING_CORE.rank(group.options, metrics, Number(state.budget), goalId, readFeedback()[group.id] || {});
  }

  function showRanking(group, ids, metrics, mode, message = '', goalId = readGoal()) {
    const box = document.getElementById('ahar-swap-results');
    if (!box) return;
    const byId = new Map(group.options.map((option) => [option.id, option]));
    const safeIds = [...new Set(ids)].filter((id) => byId.has(id));
    const complete = [...safeIds, ...group.options.map((option) => option.id).filter((id) => !safeIds.includes(id))];
    const en = !state.bn;
    const heading = mode === 'ai'
      ? (en ? 'AI-assisted order · review before choosing' : 'এআই-সহায়তায় সাজানো · বেছে নেওয়ার আগে দেখুন')
      : (en ? 'Local rules order · AI is unavailable' : 'স্থানীয় নিয়মে সাজানো · এআই এখন পাওয়া যাচ্ছে না');
    const goal = goals.find((item) => item.id === goalId);
    const goalLabel = goal ? (en ? goal.en : goal.bn) : '';
    const savedFeedbackCount = Object.keys(readFeedback()[group.id] || {}).length;
    const feedbackNote = savedFeedbackCount
      ? `<p class="help swap-feedback-note">${en ? `Your ${savedFeedbackCount} saved vote(s) stay on this device, are not sent to the model, and affect only local rules tie-breaks.` : `আপনার ${savedFeedbackCount}টি মতামত এই ডিভাইসেই থাকে, মডেলে পাঠানো হয় না এবং শুধু স্থানীয় নিয়মভিত্তিক সমতায় প্রভাব ফেলে।`}</p>`
      : '';
    const rows = complete.map((id, index) => {
      const option = byId.get(id);
      const metric = metrics[id];
      const total = metric.total;
      const fits = total <= Number(state.budget);
      const name = en ? option.en : option.bn;
      const budgetText = fits ? (en ? 'within sample budget' : 'নমুনা বাজেটের মধ্যে') : (en ? 'above sample budget' : 'নমুনা বাজেটের বেশি');
      const pantryText = metric.pantryCovered > 0 ? ` · ~৳${metric.pantryCovered} ${en ? 'covered at home' : 'ঘরে মজুত'}` : '';
      return `<li><span><strong>${index + 1}. ${escapeText(name)}</strong><small>~৳${total} · ${budgetText}${pantryText}</small></span><button type="button" class="button light small" data-apply-swap="${option.id}" data-swap-source="${group.id}">${en ? 'Use this' : 'এটি নিন'}</button></li>`;
    }).join('');
    box.innerHTML = `<div class="swap-result-card"><strong>${heading}</strong><p class="help">${message || (en ? `Priority: ${goalLabel}. Only pre-listed choices are ranked; costs and pantry coverage are calculated locally.` : `অগ্রাধিকার: ${goalLabel}। শুধু তালিকাভুক্ত বিকল্প সাজানো হয়; খরচ ও মজুতের হিসাব স্থানীয়ভাবে হয়।`)}</p>${feedbackNote}<ol>${rows}</ol></div>`;
  }

  async function requestRanking() {
    const source = document.getElementById('ahar-ai-source');
    const button = document.querySelector('[data-rank-swaps]');
    const box = document.getElementById('ahar-swap-results');
    if (!source || !button || !box) return;
    const group = groups.find((item) => item.id === source.value);
    if (!group) return;
    const goal = document.getElementById('ahar-ai-goal');
    const goalId = goals.some((item) => item.id === goal?.value) ? goal.value : 'budget';
    const metrics = Object.fromEntries(group.options.map((option) => [option.id, scenarioMetrics(group.id, option.id)]));
    const fallback = rankLocally(group, metrics, goalId);
    button.disabled = true;
    box.textContent = tr('Checking the optional ranker…','ঐচ্ছিক সাজানোর সেবা দেখা হচ্ছে…');
    let usedAI = false;
    let ranked = fallback;
    let fallbackNote = '';
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch('/api/rank-swaps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceId: group.id, goalId, budget: Number(state.budget), candidateMetrics: metrics }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`ranker status ${response.status}`);
        const result = await response.json();
        const allowed = new Set(group.options.map((option) => option.id));
        const received = Array.isArray(result.rankedIds) ? result.rankedIds.filter((id) => allowed.has(id)) : [];
        if (result.engine === 'ai' && received.length) {
          ranked = [...new Set(received)];
          usedAI = true;
        } else if (result.engine === 'rules') {
          // Re-rank rules results in this browser so profile-local feedback never leaves the device.
          ranked = fallback;
          fallbackNote = result.notice || tr('Showing a local priority-based order.','স্থানীয় অগ্রাধিকারভিত্তিক ক্রম দেখানো হচ্ছে।');
        }
      } finally {
        clearTimeout(timer);
      }
    } catch {
      // Keep the demo usable offline; the UI accurately labels this as rules-based.
      fallbackNote = tr('The optional AI server is unavailable; showing the local priority-based order.','ঐচ্ছিক এআই সার্ভার নেই; স্থানীয় অগ্রাধিকারভিত্তিক ক্রম দেখানো হচ্ছে।');
    }
    showRanking(group, ranked, metrics, usedAI ? 'ai' : 'rules', fallbackNote, goalId);
    button.disabled = false;
  }

  function saveFeedback() {
    const prompt = state.feedbackPrompt;
    const vote = document.getElementById('ahar-feedback-vote')?.value;
    const reason = document.getElementById('ahar-feedback-reason')?.value || '';
    if (!prompt || prompt.profile !== state.who) return;
    if (!['up', 'down'].includes(vote) || (vote === 'down' && !feedbackReasons.some((item) => item.id === reason))) {
      toast(tr('Choose a valid answer and reason before saving.','মতামত রাখার আগে উত্তর ও কারণ বাছুন।'));
      return;
    }
    const saved = feedbackStore.save(localStorage, feedbackKey(), groups, prompt.groupId, prompt.optionId, vote, reason);
    if (!saved) {
      toast(tr('This browser could not save the feedback; you can continue without it.','এই ব্রাউজারে মতামত রাখা যায়নি; আপনি মতামত ছাড়াই চালিয়ে যেতে পারেন।'));
      return;
    }
    state.feedbackPrompt = null;
    render();
    toast(tr('Feedback saved only in this browser.','মতামত শুধু এই ব্রাউজারেই রাখা হয়েছে।'));
  }

  function chooseSwap(sourceId, optionId) {
    const group = groups.find((item) => item.id === sourceId);
    if (!group || !group.options.some((option) => option.id === optionId)) return;
    const selections = readSelections();
    selections[sourceId] = optionId;
    writeSelections(selections);
    state.feedbackPrompt = { groupId: sourceId, optionId, profile: state.who };
    state.checked = [];
    render();
    toast(tr('Sample basket updated. Review the changed meal idea.','নমুনা বাজার বদলেছে। খাবারের ধারণাটিও দেখে নিন।'));
  }

  window.AHAR_SWAP_ENGINE = { groups, baseBasket, applySwaps, readSelections, scenarioMetrics };
  window.AHAR_SWAP_CONTROLS = swapControls;

  document.addEventListener('change', (event) => {
    if (event.target.id === 'ahar-ai-goal') {
      writeGoal(event.target.value);
      return;
    }
    if (event.target.id === 'ahar-feedback-vote') {
      const reasonWrap = document.querySelector('[data-feedback-reason-wrap]');
      if (reasonWrap) reasonWrap.hidden = event.target.value !== 'down';
      return;
    }
    const select = event.target.closest('[data-aharswap]');
    if (!select) return;
    const sourceId = select.dataset.aharswap;
    const selections = readSelections();
    if (select.value) selections[sourceId] = select.value;
    else delete selections[sourceId];
    writeSelections(selections);
    state.feedbackPrompt = select.value ? { groupId: sourceId, optionId: select.value, profile: state.who } : null;
    state.checked = [];
    render();
    toast(tr('Sample basket updated.','নমুনা বাজারের হিসাব বদলেছে।'));
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-reset-feedback]')) {
      const cleared = feedbackStore.clear(localStorage, feedbackKey());
      state.feedbackPrompt = null;
      render();
      toast(cleared ? tr('Saved feedback for this profile was cleared from this browser.','এই ব্রাউজার থেকে এই প্রোফাইলের মতামত মুছে ফেলা হয়েছে।') : tr('Could not clear saved feedback.','রাখা মতামত মুছতে সমস্যা হয়েছে।'));
      return;
    }
    if (event.target.closest('[data-reset-swaps]')) {
      try { localStorage.removeItem(key()); } catch {}
      state.checked = [];
      render();
      toast(tr('Ingredient swaps reset.','উপকরণের বদল বাতিল হয়েছে।'));
      return;
    }
    if (event.target.closest('[data-rank-swaps]')) {
      return requestRanking();
    }
    if (event.target.closest('[data-save-feedback]')) {
      saveFeedback();
      return;
    }
    if (event.target.closest('[data-skip-feedback]')) {
      state.feedbackPrompt = null;
      render();
      return;
    }
    const apply = event.target.closest('[data-apply-swap]');
    if (apply) chooseSwap(apply.dataset.swapSource, apply.dataset.applySwap);
  });
})();
