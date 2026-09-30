/* The guided daily loop stays in this browser; all totals come from the local demo rules module. */
(function () {
  if (typeof today !== 'function' || !window.AHAR_GUIDED_PLAN_CORE) return;

  const core = window.AHAR_GUIDED_PLAN_CORE;
  const demoStock = [
    { name: 'Rice', bn: 'চাল', qty: 0.2, unit: 'kg', price: 0 },
    { name: 'Masoor dal', bn: 'মসুর ডাল', qty: 0.08, unit: 'kg', price: 0 },
  ];
  let open = false;
  let context = 'workday';
  let budget = null;
  let swap = false;
  let applied = false;
  let demo = false;
  let openedFor = null;
  let breakdownFilter = 'all';
  const selectedStock = new Set();

  const text = (en, bn) => state.bn ? bn : en;
  const safe = (value) => escapeHTML(String(value ?? ''));

  function savedItems() {
    if (demo) return demoStock;
    try {
      const saved = savedPantry();
      return saved && Array.isArray(saved.items) ? saved.items : [];
    } catch {
      return [];
    }
  }

  function activeStock() {
    const items = savedItems();
    if (demo) return items;
    return [...selectedStock].map((index) => items[index]).filter(Boolean);
  }

  function formatQty(quantity) {
    return Number(quantity).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  }

  function pantryPicker() {
    if (demo) {
      return `<div class="guided-demo-note" role="note"><strong>${text('Illustrative demo pantry · not saved','නমুনা ঘরের উপকরণ · সংরক্ষিত নয়')}</strong><p>${text('For this shortcut only: 0.2 kg rice and 0.08 kg masoor dal. This does not change Rahim’s saved pantry.','শুধু এই নমুনার জন্য: ০.২ কেজি চাল ও ০.০৮ কেজি মসুর ডাল। এতে রহিমের সংরক্ষিত হিসাব বদলায় না।')}</p></div>`;
    }
    const items = savedItems();
    if (!items.length) {
      return `<div class="guided-demo-note"><strong>${text('No confirmed pantry list yet','এখনও নিশ্চিত ঘরের উপকরণের তালিকা নেই')}</strong><p>${text('Open My bazar to confirm items, or use the Rahim shortcut to see a clearly labelled sample pantry.','উপকরণ নিশ্চিত করতে আমার বাজারে যান, অথবা নমুনা ঘরের উপকরণ দেখতে রহিমের শর্টকাট ব্যবহার করুন।')} <a class="text-link" href="#bazar">${text('Open My bazar','আমার বাজার খুলুন')} ↗</a></p></div>`;
    }
    return `<fieldset class="guided-stock"><legend>${text('Which saved items are still at home today?','আজ ঘরে কোন সংরক্ষিত জিনিস এখনো আছে?')}</legend><p class="help">${text('Nothing is deducted unless you check it. Purchases may no longer be available.','আপনি টিক না দিলে কিছুই বাদ যাবে না। কেনা জিনিস এখন নাও থাকতে পারে।')}</p><div class="guided-stock-list">${items.map((item, index) => {
      const name = state.bn ? (item.bn || item.name) : item.name;
      return `<label class="guided-stock-option"><input type="checkbox" data-guided-stock="${index}" ${selectedStock.has(index) ? 'checked' : ''}><span><strong>${safe(name)}</strong><small>${safe(item.qty)} ${safe(item.unit)} · ${text('confirm still available','এখনো আছে নিশ্চিত করুন')}</small></span></label>`;
    }).join('')}</div><p class="help">${text('Only clear food-name and compatible-unit matches reduce this illustrative estimate.','শুধু পরিষ্কার খাবারের নাম ও মেলা একক নমুনা হিসাব কমাবে।')}</p></fieldset>`;
  }

  function renderMeals(result) {
    const filters = [
      ['all', text('All items', 'সব উপকরণ')],
      ['buy', text('To buy', 'কিনতে হবে')],
      ['pantry', text('From pantry', 'ঘরে আছে')],
    ];
    const status = breakdownFilter === 'buy'
      ? text('Showing ingredients still to buy · meal and day totals unchanged.', 'কিনতে হবে এমন উপকরণ দেখানো হচ্ছে · খাবার ও দিনের মোট অপরিবর্তিত।')
      : breakdownFilter === 'pantry'
        ? text('Showing checked pantry matches · meal and day totals unchanged.', 'টিক দেওয়া ঘরের উপকরণ দেখানো হচ্ছে · খাবার ও দিনের মোট অপরিবর্তিত।')
        : text('Filter ingredient rows; meal and day totals stay the same.', 'উপকরণের তালিকা ছাঁকুন; খাবার ও দিনের মোট অপরিবর্তিত থাকবে।');
    const toolbar = `<div class="guided-breakdown-toolbar"><div class="guided-filter-chips" role="group" aria-label="${text('Filter ingredient rows', 'উপকরণের তালিকা ছাঁকুন')}">${filters.map(([id, label]) => `<button type="button" class="guided-filter-chip ${breakdownFilter === id ? 'active' : ''}" data-guided-filter="${id}" aria-pressed="${breakdownFilter === id}">${label}</button>`).join('')}</div><p class="help guided-filter-note" aria-live="polite">${status}</p></div>`;
    const meals = result.meals.map((meal) => {
      const visibleItems = meal.items.filter((item) => breakdownFilter === 'all'
        || (breakdownFilter === 'buy' && item.toBuyQty > 0)
        || (breakdownFilter === 'pantry' && item.coveredQty > 0));
      const rows = visibleItems.map((item) => `<div class="guided-ingredient" data-guided-key="${item.key}"><span>${state.bn ? item.bn : item.en}<small>${formatQty(item.qty)} ${safe(item.unit)}${item.swapped ? ` · ${text('your chosen swap', 'আপনার বেছে নেওয়া বদল')}` : ''}</small></span><small>${item.coveredQty > 0 ? `${formatQty(item.coveredQty)} ${safe(item.unit)} ${text('from home', 'ঘর থেকে')} · ` : ''}৳${item.purchaseCost} ${text('to buy', 'কিনতে')}</small></div>`).join('');
      const empty = breakdownFilter === 'buy'
        ? text('Nothing to buy for this meal.', 'এই খাবারের জন্য কিছু কিনতে হবে না।')
        : text('No checked pantry items used in this meal.', 'এই খাবারে টিক দেওয়া ঘরের উপকরণ নেই।');
      return `<article class="guided-meal"><div class="guided-meal-head"><div><span class="eyebrow">${state.bn ? meal.bn : meal.en}</span><h3>${state.bn ? meal.dishBn : meal.dish}</h3></div><b>৳${meal.cost}</b></div><div class="guided-ingredients">${rows || `<p class="guided-filter-empty">${empty}</p>`}</div><p class="guided-meal-cost">${text('Illustrative amount to buy for this meal', 'এই খাবারের নমুনা কেনাকাটা')}</p></article>`;
    }).join('');
    return `${toolbar}${meals}`;
  }

  function renderPanel() {
    if (open && state.who !== openedFor) {
      openedFor = state.who;
      demo = false;
      budget = Number(profile.budget) || 0;
      context = 'workday';
      swap = false;
      breakdownFilter = 'all';
      applied = false;
      selectedStock.clear();
    }
    if (!open && !demo) {
      return `<section class="guided-plan-card surface" aria-labelledby="guided-plan-title"><div class="guided-plan-header"><div><span class="eyebrow">${text('A ONE-DAY DEMO · ROUTINE + PANTRY + BUDGET','এক দিনের নমুনা · রুটিন + ঘরের উপকরণ + বাজেট')}</span><h2 id="guided-plan-title">${text('Plan for the day you actually have.','আপনার আজকের দিনের মতো করে পরিকল্পনা করুন।')}</h2><p>${text('Choose a day rhythm, confirm what is still at home, then see the sample cost and one optional swap.','দিনের ধরন বাছুন, ঘরে কী আছে নিশ্চিত করুন, তারপর নমুনা খরচ ও একটি ঐচ্ছিক বদল দেখুন।')}</p></div><div class="guided-plan-actions"><button class="button" type="button" data-guided-action="open">${text('Build today’s plan','আজকের পরিকল্পনা করুন')} ${icon('arrow')}</button><button class="button light" type="button" data-guided-action="demo">${text('Show Rahim’s workday','রহিমের কর্মদিবস দেখুন')}</button></div></div><p class="guided-limits">${text('Rules-based sample arithmetic only · illustrative prices · no nutrition or health advice.','শুধু নিয়মভিত্তিক নমুনা হিসাব · দাম নমুনা · পুষ্টি বা স্বাস্থ্য পরামর্শ নয়।')}</p></section>`;
    }

    const effectiveBudget = Number.isFinite(budget) ? budget : Number(profile.budget) || 0;
    const stock = activeStock();
    const result = core.calculatePlan({ context, budget: effectiveBudget, stock, swap });
    const baseline = core.calculatePlan({ context, budget: effectiveBudget, stock, swap: false });
    const delta = result.total - baseline.total;
    const deltaText = delta === 0 ? text('No change in this sample','এই নমুনায় পরিবর্তন নেই') : `${delta < 0 ? '−' : '+'}৳${Math.abs(delta)} ${text('for this demo basket','এই নমুনা তালিকায়')}`;
    const remainingBlock = result.remaining >= 0
      ? `<b>৳${result.remaining}</b><small>${text('illustrative budget remaining','নমুনা বাজেট বাকি')}</small>`
      : `<b class="guided-over">−৳${Math.abs(result.remaining)}</b><small>${text('over the entered sample budget','দেওয়া নমুনা বাজেটের বেশি')}</small>`;
    const coverage = result.coveredItems.length
      ? `<strong>${text('Confirmed pantry applied','নিশ্চিত ঘরের উপকরণ ধরা হয়েছে')}</strong><p>${result.coveredItems.map((item) => `${state.bn ? item.bn : item.en}: ${formatQty(item.qty)} ${safe(item.unit)} · ৳${item.value}`).join(' · ')}</p><small>${text('Estimated reduction from checked stock','টিক দেওয়া মজুত থেকে নমুনা কমেছে')}</small> <b>৳${result.pantrySavings}</b>`
      : `<strong>${text('No pantry stock counted yet','এখনও ঘরের মজুত ধরা হয়নি')}</strong><p>${text('Check any saved items that are still available.','এখনো আছে এমন সংরক্ষিত জিনিসে টিক দিন।')}</p>`;

    return `<section class="guided-plan-card surface" aria-labelledby="guided-plan-title"><div class="guided-plan-header"><div><span class="eyebrow">${text('A ONE-DAY DEMO · RULES, NOT AI','এক দিনের নমুনা · নিয়ম, এআই নয়')}</span><h2 id="guided-plan-title">${text('Plan for the day you actually have.','আপনার আজকের দিনের মতো করে পরিকল্পনা করুন।')}</h2><p>${text('A practical starting point, not a prescription. Change anything that does not fit.','ব্যবহারিক শুরু, বাধ্যতামূলক পরামর্শ নয়। না মিললে বদলে নিন।')}</p></div><div class="guided-plan-actions"><button class="button light small" type="button" data-guided-action="close">${text('Hide plan','পরিকল্পনা লুকান')}</button><button class="button light small" type="button" data-guided-action="demo">${text('Show Rahim’s workday','রহিমের কর্মদিবস')}</button></div></div>${demo ? `<div class="guided-demo-banner">${text('Showing Rahim · fictional workday demo','রহিমের নমুনা · কাল্পনিক কর্মদিবস')}</div>` : ''}<div class="guided-controls"><label class="guided-field">${text('What is today like?','আজকের দিন কেমন?')}<select id="guided-routine"><option value="workday" ${context === 'workday' ? 'selected' : ''}>${text('Busy workday · quick familiar meals','ব্যস্ত কর্মদিবস · পরিচিত সহজ খাবার')}</option><option value="home" ${context === 'home' ? 'selected' : ''}>${text('Cooking at home · more time to prepare','ঘরে রান্না · প্রস্তুতির সময় আছে')}</option></select></label><label class="guided-field">${text('Food budget for today · ৳','আজকের খাবারের বাজেট · ৳')}<input id="guided-budget" type="number" min="0" max="100000" step="1" value="${effectiveBudget}" inputmode="numeric"></label></div><div class="guided-pantry-panel">${pantryPicker()}</div><label class="guided-swap-choice"><input id="guided-swap" type="checkbox" ${swap ? 'checked' : ''}><span><strong>${text('Optional swap: lunch egg → masoor dal','ঐচ্ছিক বদল: দুপুরের ডিম → মসুর ডাল')}</strong><small>${text('A user-chosen meal idea; not a nutrition-equivalence claim.','ব্যবহারকারীর বাছা খাবারের ধারণা; পুষ্টিগত সমতার দাবি নয়।')}</small></span><b>${deltaText}</b></label><div class="guided-summary" aria-live="polite"><div class="guided-metric"><span>${text('Estimated shopping cost','নমুনা কেনাকাটা')}</span><b>৳${result.total}</b><small>${text('illustrative only · no live prices','শুধু নমুনা · বর্তমান বাজারদর নয়')}</small></div><div class="guided-metric"><span>${text('Budget check','বাজেট হিসাব')}</span>${remainingBlock}</div><div class="guided-metric guided-coverage">${coverage}</div></div><h3 class="guided-section-heading">${text('Your day, meal by meal','দিনের খাবার')}</h3><div class="guided-meal-grid">${renderMeals(result)}</div>${applied ? `<div class="guided-applied" role="status"><strong>${text('Plan selected for this demo.','এই নমুনার জন্য পরিকল্পনা বেছে নেওয়া হয়েছে।')}</strong><p>${text('You can still edit it. Nothing was sent to a model or saved to your profile.','এখনো বদলাতে পারবেন। কোনো মডেলে পাঠানো বা প্রোফাইলে সংরক্ষণ করা হয়নি।')}</p></div>` : ''}<div class="guided-plan-footer"><p class="guided-limits">${text('Sample rates and rules only. Check availability, portions, ingredients and prices yourself; this is not nutrition, allergy or medical guidance.','শুধু নমুনা দাম ও নিয়ম। উপকরণ, পরিমাণ ও দাম নিজে দেখুন; এটি পুষ্টি, অ্যালার্জি বা চিকিৎসা পরামর্শ নয়।')}</p><button class="button" type="button" data-guided-action="apply">${applied ? text('Plan selected ✓','পরিকল্পনা বেছে নেওয়া হয়েছে ✓') : text('Use this plan','এই পরিকল্পনা নিন')}</button></div></section>`;
  }

  const originalToday = today;
  today = function guidedToday() {
    let html = originalToday();
    const marker = '<div class="dashboard-grid">';
    if (html.includes(marker)) html = html.replace(marker, `${renderPanel()}${marker}`);
    return html;
  };

  document.addEventListener('click', (event) => {
    const filterButton = event.target.closest('[data-guided-filter]');
    if (filterButton) {
      const nextFilter = filterButton.dataset.guidedFilter;
      if (['all', 'buy', 'pantry'].includes(nextFilter) && breakdownFilter !== nextFilter) {
        breakdownFilter = nextFilter;
        render();
        document.querySelector(`[data-guided-filter="${nextFilter}"]`)?.focus({ preventScroll: true });
      }
      return;
    }
    const button = event.target.closest('[data-guided-action]');
    if (!button) return;
    const action = button.dataset.guidedAction;
    if (action === 'open') {
      open = true;
      demo = false;
      budget = Number(profile.budget) || 0;
      openedFor = state.who;
      context = 'workday';
      swap = false;
      breakdownFilter = 'all';
      applied = false;
      selectedStock.clear();
    } else if (action === 'demo') {
      state.who = 'rahim';
      profile = structuredClone(personas.rahim);
      state.budget = 160;
      open = true;
      demo = true;
      budget = 160;
      openedFor = 'rahim';
      context = 'workday';
      swap = false;
      breakdownFilter = 'all';
      applied = false;
      selectedStock.clear();
    } else if (action === 'close') {
      open = false;
      demo = false;
      applied = false;
    } else if (action === 'apply') {
      applied = true;
      render();
      toast(text('Plan selected in this demo; nothing was saved.','নমুনায় পরিকল্পনা বেছে নেওয়া হয়েছে; কিছু সংরক্ষণ করা হয়নি।'));
      return;
    }
    render();
  });

  document.addEventListener('change', (event) => {
    const target = event.target;
    if (target.id === 'guided-routine') {
      context = target.value === 'home' ? 'home' : 'workday';
      applied = false;
      render();
    } else if (target.id === 'guided-budget') {
      const nextBudget = Number(target.value);
      if (!Number.isFinite(nextBudget) || nextBudget < 0 || nextBudget > 100000) {
        toast(text('Enter a budget from ৳0 to ৳100,000.','৳০ থেকে ৳১,০০,০০০-এর মধ্যে বাজেট লিখুন।'));
        return;
      }
      budget = Math.round(nextBudget);
      applied = false;
      render();
    } else if (target.id === 'guided-swap') {
      swap = target.checked;
      applied = false;
      render();
    } else if (target.matches('[data-guided-stock]')) {
      const index = Number(target.dataset.guidedStock);
      if (target.checked) selectedStock.add(index);
      else selectedStock.delete(index);
      applied = false;
      render();
    }
  });

  render();
})();
