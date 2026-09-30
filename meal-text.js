/* Opt-in meal-text review UI. Saving is explicit and browser-local. */
(function (root) {
  const foods = root.AHAR_MEAL_FOODS || [];
  const foodById = new Map(foods.map((food) => [food.id, food]));
  const core = root.AHAR_MEAL_TEXT_CORE;
  const storagePrefix = 'aharai.meal-text.v1.';
  let owner = state.who;
  let draftText = '';
  let manualIds = new Set();
  let pending = [];
  let pendingSource = '';
  let notice = '';
  let busy = false;

  function en() { return !state.bn; }
  function tr(english, bangla) { return state.bn ? bangla : english; }
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }
  function syncOwner() {
    if (owner === state.who) return;
    owner = state.who;
    draftText = '';
    manualIds = new Set();
    pending = [];
    pendingSource = '';
    notice = '';
    busy = false;
  }
  function key() { return `${storagePrefix}${owner}`; }
  function readSaved() {
    try {
      const data = JSON.parse(localStorage.getItem(key()) || '[]');
      if (!Array.isArray(data)) return [];
      return data.filter((entry) => entry && typeof entry.id === 'string' && Number.isFinite(entry.createdAt) && Array.isArray(entry.items))
        .map((entry) => ({
          id: entry.id,
          createdAt: entry.createdAt,
          items: entry.items.filter((item) => foodById.has(item?.foodId)).map((item) => ({
            foodId: item.foodId,
            quantity: Number.isFinite(item.quantity) && item.quantity > 0 && item.quantity <= 10000 ? item.quantity : null,
            unit: foodById.get(item.foodId).units.includes(item.unit) ? item.unit : null,
          })),
        }));
    } catch { return []; }
  }
  function writeSaved(entries) {
    try {
      localStorage.setItem(key(), JSON.stringify(entries.slice(-20)));
      return true;
    } catch { return false; }
  }
  function foodLabel(food) { return tr(food.en, food.bn); }
  function quantityLabel(item) {
    if (item.quantity == null) return tr('amount not stated', 'পরিমাণ বলা হয়নি');
    return `${item.quantity}${item.unit ? ` ${esc(item.unit)}` : ` · ${tr('choose a unit', 'একক বেছে নিন')}`}`;
  }
  function renderSaved() {
    const entries = readSaved();
    if (!entries.length) return `<p class="help meal-text-empty">${tr('No text-based meal entries have been saved in this demo profile.','এই নমুনা প্রোফাইলে কথার ভিত্তিতে কোনো খাবার রাখা হয়নি।')}</p>`;
    return `<ul class="meal-text-saved-list">${entries.map((entry) => `<li><div><strong>${entry.items.map((item) => `${esc(foodLabel(foodById.get(item.foodId)))} <small>(${quantityLabel(item)})</small>`).join(', ')}</strong><small>${new Date(entry.createdAt).toLocaleDateString(state.bn ? 'bn-BD' : 'en-GB')}</small></div><button type="button" class="button light small" data-meal-delete="${esc(entry.id)}">${tr('Delete','মুছুন')}</button></li>`).join('')}</ul>`;
  }
  function renderReview() {
    if (!pending.length) return '';
    const choices = foods.map((food) => `<option value="${esc(food.id)}">${esc(foodLabel(food))}</option>`);
    const rows = pending.map((item, index) => {
      const current = foodById.get(item.foodId);
      const units = current.units.map((unit) => `<option value="${esc(unit)}" ${item.unit === unit ? 'selected' : ''}>${esc(unit)}</option>`).join('');
      const uncertainty = item.manualCorrection
        ? tr('Corrected by you; check the amount.','আপনি ঠিক করেছেন; পরিমাণ যাচাই করুন।')
        : pendingSource === 'manual'
          ? tr('Chosen manually','নিজে বেছে নেওয়া')
          : pendingSource === 'rules'
            ? tr('Exact-name rules match only; check it manually.','শব্দের সরাসরি মিল; নিজে যাচাই করুন।')
            : tr(`Model uncertainty label: ${item.uncertainty} (not calibrated)`, `মডেলের অনিশ্চয়তা: ${item.uncertainty} (যাচাইকৃত সম্ভাবনা নয়)`);
      const matchedPhrase = item.manualCorrection
        ? tr('Food choice corrected by you.','খাবারটি আপনি ঠিক করেছেন।')
        : pendingSource === 'manual' ? tr('Manual selection','নিজে বেছে নেওয়া') : `${tr('Matched phrase','মেলা শব্দ')}: “${esc(item.evidence)}”`;
      return `<li class="meal-text-review-row" data-meal-row="${index}"><label><span>${tr('Food · correct if needed','খাবার · প্রয়োজনে ঠিক করুন')}</span><select data-meal-index="${index}" data-meal-field="foodId">${choices.map((choice) => choice.replace(`value="${esc(current.id)}"`, `value="${esc(current.id)}" selected`)).join('')}</select></label><p class="meal-text-evidence">${matchedPhrase}</p><small class="meal-text-uncertainty">${uncertainty}</small><div class="meal-text-quantity"><label><span>${tr('Quantity · optional','পরিমাণ · ঐচ্ছিক')}</span><input type="number" min="0.01" max="10000" step="any" inputmode="decimal" value="${item.quantity == null ? '' : esc(item.quantity)}" data-meal-index="${index}" data-meal-field="quantity" placeholder="—"></label><label><span>${tr('Unit · choose if known','একক · জানা থাকলে বেছে নিন')}</span><select data-meal-index="${index}" data-meal-field="unit"><option value="">${tr('Not stated','বলা হয়নি')}</option>${units}</select></label></div><button type="button" class="button light small" data-meal-remove="${index}">${tr('Remove item','উপকরণ বাদ দিন')}</button></li>`;
    }).join('');
    return `<div class="meal-text-review"><div class="meal-text-review-head"><h3>${tr('Review before saving','রাখার আগে দেখে নিন')}</h3><p class="help">${tr('Correct or remove every item. Nothing is saved until you confirm. No calories or nutrition are calculated.','প্রতিটি খাবার ঠিক করুন বা বাদ দিন। নিশ্চিত না করা পর্যন্ত কিছু রাখা হবে না। ক্যালরি বা পুষ্টি হিসাব করা হয় না।')}</p></div>${notice ? `<p class="meal-text-notice" role="status">${esc(notice)}</p>` : ''}<ul class="meal-text-review-list">${rows}</ul><div class="button-row"><button type="button" class="button" data-meal-confirm>${tr('Confirm & save to this browser','নিশ্চিত করে এই ব্রাউজারে রাখুন')}</button><button type="button" class="button light" data-meal-discard>${tr('Discard review','পর্যালোচনা বাদ দিন')}</button></div></div>`;
  }
  function renderManualPicker() {
    return `<details class="meal-text-manual"><summary>${tr('Enter foods manually (no AI)','নিজে খাবার বেছে নিন (এআই ছাড়া)')}</summary><p class="help">${tr('Choose only items from this small demo list; type and amount remain your choice.','এই ছোট নমুনা তালিকা থেকে খাবার বেছে নিন; ধরন ও পরিমাণ আপনার পছন্দ।')}</p><div class="meal-text-food-grid">${foods.map((food) => `<label><input type="checkbox" data-meal-manual="${esc(food.id)}" ${manualIds.has(food.id) ? 'checked' : ''}><span>${esc(foodLabel(food))}</span></label>`).join('')}</div><button type="button" class="button light" data-meal-build-manual>${tr('Review selected foods','বাছাই করা খাবার পর্যালোচনা')}</button></details>`;
  }
  function renderCard() {
    syncOwner();
    const saved = readSaved();
    return `<section class="surface meal-text-assistant" aria-labelledby="meal-text-heading"><span class="eyebrow">${tr('OPTIONAL TEXT ENTRY · DEMO FOOD LIST','ঐচ্ছিক লেখা · নমুনা খাবারের তালিকা')}</span><h2 id="meal-text-heading">${tr('Describe a meal in Bangla or English','বাংলা বা ইংরেজিতে খাবারের কথা লিখুন')}</h2><p class="help">${tr('An optional model can map words to this fixed demo list. It does not estimate calories, nutrition, health needs, or foods it cannot name.','ঐচ্ছিক মডেল কথাকে এই নির্দিষ্ট নমুনা তালিকার সঙ্গে মেলাতে পারে। এটি ক্যালরি, পুষ্টি, স্বাস্থ্যচাহিদা বা তালিকার বাইরের খাবার অনুমান করে না।')}</p><label class="meal-text-input-label" for="meal-text-input"><span>${tr('Your sentence · up to 500 characters','আপনার বাক্য · সর্বোচ্চ ৫০০ অক্ষর')}</span><textarea id="meal-text-input" maxlength="500" rows="3" placeholder="${tr('Example: I ate rice, one egg and vegetables.','যেমন: আমি ভাত, ২টি ডিম আর সবজি খেয়েছি।')}">${esc(draftText)}</textarea></label><div class="button-row"><button type="button" class="button" data-meal-parse ${busy ? 'disabled' : ''}>${busy ? tr('Reviewing…','দেখা হচ্ছে…') : tr('Review sentence with optional AI','ঐচ্ছিক এআই দিয়ে বাক্য দেখুন')}</button></div><p class="help meal-text-privacy">${tr('Only the sentence is sent, and only if you press the button. No photo, account name, body measurement, or profile field is included. The reviewed food IDs are saved only in this browser after confirmation; the sentence itself is not saved.','বোতাম চাপলেই শুধু বাক্যটি পাঠানো হয়। ছবি, অ্যাকাউন্টের নাম, শরীরের মাপ বা প্রোফাইলের তথ্য পাঠানো হয় না। নিশ্চিত করার পর শুধু বাছাই করা খাবার এই ব্রাউজারে থাকে; বাক্যটি রাখা হয় না।')}</p>${notice && !pending.length ? `<p class="meal-text-notice" role="status">${esc(notice)}</p>` : ''}${renderManualPicker()}${renderReview()}<div class="meal-text-saved"><div><h3>${tr('Saved in this demo profile','এই নমুনা প্রোফাইলে রাখা')}</h3><p class="help">${saved.length ? tr(`${saved.length} local meal entr${saved.length === 1 ? 'y' : 'ies'}; separate from the sample photo log and Food plan.`, `${saved.length}টি খাবারের নমুনা-তথ্য; ছবির নমুনা বা Food plan থেকে আলাদা।`) : tr('Saved records stay in this browser only.','রাখা তথ্য শুধু এই ব্রাউজারেই থাকে।')}</p></div>${saved.length ? `<button type="button" class="button light small" data-meal-clear>${tr('Clear this list','এই তালিকা মুছুন')}</button>` : ''}</div>${renderSaved()}</section>`;
  }

  function replacePlate() {
    if (typeof plateView !== 'function') return;
    const original = plateView;
    plateView = function () { return `${original()}${renderCard()}`; };
  }
  async function parseSentence() {
    syncOwner();
    const field = document.getElementById('meal-text-input');
    draftText = String(field?.value || draftText).trim();
    if (draftText.length < 2 || draftText.length > 500) {
      notice = tr('Enter a short sentence first.','আগে ছোট একটি বাক্য লিখুন।');
      render();
      return;
    }
    const requestOwner = owner;
    busy = true;
    pending = [];
    pendingSource = '';
    notice = '';
    render();
    try {
      const response = await fetch('/api/interpret-meal-text', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: draftText }),
      });
      if (!response.ok) throw new Error('Meal review is unavailable.');
      const data = await response.json();
      if (state.who !== requestOwner) { syncOwner(); return; }
      const result = core.validateItems(data.items, draftText);
      pending = result.items;
      pendingSource = data.engine === 'ai' ? 'ai' : 'rules';
      notice = [data.notice, result.rejected ? tr('Some model output did not match the fixed list or quoted sentence and was left out.','কিছু ফল নির্দিষ্ট তালিকা বা বাক্যের সঙ্গে মেলেনি, তাই বাদ দেওয়া হয়েছে।') : ''].filter(Boolean).join(' ');
      if (!pending.length && !notice) notice = tr('No direct match found. Try the manual list below.','সরাসরি মিল পাওয়া যায়নি। নিচের তালিকা থেকে নিজে বেছে নিন।');
    } catch {
      notice = tr('Text review is unavailable here. Use the manual food list instead.','এখানে লেখা দেখা যাচ্ছে না। বদলে নিজে খাবার বেছে নিন।');
    } finally {
      busy = false;
      render();
    }
  }
  function selectedManualItems() {
    return [...manualIds].filter((id) => foodById.has(id)).map((foodId) => ({ foodId, quantity: null, unit: null, evidence: '', uncertainty: 'high' }));
  }
  function saveMeal() {
    syncOwner();
    const incompleteAmount = pending.some((item) => {
      if (item.quantity == null) return false;
      const food = foodById.get(item.foodId);
      const quantity = Number(item.quantity);
      return !food || !Number.isFinite(quantity) || quantity <= 0 || quantity > 10000 || !food.units.includes(item.unit);
    });
    if (incompleteAmount) {
      notice = tr('Choose a compatible unit for each amount, or clear that amount before saving.','প্রতিটি পরিমাণের উপযুক্ত একক বেছে নিন, অথবা রাখার আগে পরিমাণ মুছে দিন।');
      render();
      return;
    }
    const valid = pending.filter((item) => foodById.has(item.foodId)).map((item) => {
      const food = foodById.get(item.foodId);
      const quantity = Number(item.quantity);
      return {
        foodId: food.id,
        quantity: Number.isFinite(quantity) && quantity > 0 && quantity <= 10000 ? quantity : null,
        unit: food.units.includes(item.unit) ? item.unit : null,
      };
    });
    if (!valid.length) {
      notice = tr('Choose at least one food to save.','রাখতে অন্তত একটি খাবার বেছে নিন।');
      render();
      return;
    }
    const now = Date.now();
    const id = `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const saved = readSaved();
    if (!writeSaved([...saved, { id, createdAt: now, items: valid }])) {
      notice = tr('Browser storage is unavailable; this entry was not saved.','ব্রাউজারে রাখা যাচ্ছে না; তথ্যটি সংরক্ষিত হয়নি।');
      render();
      return;
    }
    pending = [];
    pendingSource = '';
    notice = '';
    toast(tr('Reviewed foods saved in this browser.','পর্যালোচিত খাবার এই ব্রাউজারে রাখা হয়েছে।'));
    render();
  }

  document.addEventListener('input', (event) => {
    if (event.target?.id === 'meal-text-input') draftText = String(event.target.value || '').slice(0, 500);
    if (event.target?.dataset?.mealField === 'quantity') {
      const index = Number(event.target.dataset.mealIndex);
      if (pending[index]) pending[index].quantity = event.target.value === '' ? null : Number(event.target.value);
    }
  });
  document.addEventListener('change', (event) => {
    const target = event.target;
    if (target?.dataset?.mealManual) {
      if (target.checked) manualIds.add(target.dataset.mealManual); else manualIds.delete(target.dataset.mealManual);
      return;
    }
    const field = target?.dataset?.mealField;
    const index = Number(target?.dataset?.mealIndex);
    if (!pending[index] || !field) return;
    if (field === 'foodId' && foodById.has(target.value)) {
      pending[index] = { foodId: target.value, quantity: null, unit: null, evidence: '', uncertainty: 'high', manualCorrection: true };
      render();
    } else if (field === 'unit') {
      const allowed = foodById.get(pending[index].foodId).units;
      pending[index].unit = allowed.includes(target.value) ? target.value : null;
    } else if (field === 'quantity') {
      const quantity = target.value === '' ? null : Number(target.value);
      pending[index].quantity = Number.isFinite(quantity) && quantity > 0 && quantity <= 10000 ? quantity : null;
    }
  });
  document.addEventListener('click', async (event) => {
    if (event.target.closest('[data-meal-parse]')) { await parseSentence(); return; }
    if (event.target.closest('[data-meal-build-manual]')) {
      pending = selectedManualItems();
      pendingSource = 'manual';
      notice = pending.length ? '' : tr('Choose one or more foods first.','আগে এক বা একাধিক খাবার বেছে নিন।');
      render();
      return;
    }
    if (event.target.closest('[data-meal-confirm]')) { saveMeal(); return; }
    const remove = event.target.closest('[data-meal-remove]');
    if (remove) { pending.splice(Number(remove.dataset.mealRemove), 1); render(); return; }
    if (event.target.closest('[data-meal-discard]')) { pending = []; pendingSource = ''; notice = ''; render(); return; }
    const del = event.target.closest('[data-meal-delete]');
    if (del) { writeSaved(readSaved().filter((entry) => entry.id !== del.dataset.mealDelete)); render(); return; }
    if (event.target.closest('[data-meal-clear]')) { try { localStorage.removeItem(key()); notice = ''; render(); } catch { notice = tr('Browser storage is unavailable.','ব্রাউজারে রাখা যাচ্ছে না।'); render(); } }
  });

  replacePlate();
  root.AHAR_MEAL_TEXT = { renderCard };
  render();
})(window);
