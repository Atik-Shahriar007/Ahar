/* Source provenance for the demo catalogue; these historical records never set plan prices. */
(function (root) {
  const optionSeries = Object.freeze({
    'masoor-dal': 'Lentils (masur)',
    flour: 'Wheat flour',
  });
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const banglaDigits = '০১২৩৪৫৬৭৮৯';
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

  function dateText(iso, bn) {
    const [year, month, day] = String(iso).split('-').map(Number);
    if (!year || !month || !day || month < 1 || month > 12) return escape(iso);
    if (!bn) return `${day} ${monthsEn[month - 1]} ${year}`;
    const digits = (value) => String(value).replace(/[0-9]/g, (digit) => banglaDigits[Number(digit)]);
    return `${digits(day)} ${monthsBn[month - 1]} ${digits(year)}`;
  }

  function latest(points) {
    return (points || []).reduce((current, point) => !current || String(point.date) > String(current.date) ? point : current, null);
  }

  function render(state, groups) {
    const data = root.AHAR_MARKET_DEMO;
    if (!data?.markets?.length || !Array.isArray(groups)) return '';
    const market = data.markets.find((item) => item.id === state.marketPulseMarket) || data.markets[0];
    const bn = !!state.bn;
    const uniqueOptions = new Map();
    for (const group of groups) {
      for (const option of group.options || []) {
        if (!uniqueOptions.has(option.id)) uniqueOptions.set(option.id, option);
      }
    }

    const linked = [];
    const missing = [];
    for (const option of uniqueOptions.values()) {
      const seriesId = optionSeries[option.id];
      const series = seriesId && market.series.find((item) => item.id === seriesId);
      const point = series && latest(series.points);
      if (!series || !point || !Number.isFinite(Number(point.price))) {
        missing.push(option);
        continue;
      }
      linked.push({ option, series, point });
    }

    const en = !bn;
    const productName = (option) => bn ? option.bn : option.en;
    const rows = linked.map(({ option, series, point }) => {
      const amount = Number(point.price).toLocaleString(bn ? 'bn-BD' : 'en-US', { maximumFractionDigits: 2 });
      const flag = escape(point.priceflag || (en ? 'not supplied' : 'উল্লেখ নেই'));
      return `<li><strong>${escape(productName(option))}</strong> — ${en ? 'demo-linked WFP series' : 'নমুনায় যুক্ত WFP সিরিজ'} “${escape(series.id)}”: ৳${amount} / ${escape(series.unit)} · ${dateText(point.date, bn)} · ${en ? 'source flag' : 'উৎসের চিহ্ন'}: ${flag}</li>`;
    }).join('');
    const missingNames = missing.map(productName).map(escape).join(bn ? '、' : ', ');
    const heading = en ? 'Data evidence &amp; gaps' : 'তথ্যসূত্র ও ঘাটতি';
    const summary = en ? 'Inspect historical market data behind sample swaps' : 'নমুনা বিকল্পের ঐতিহাসিক বাজারতথ্য দেখুন';
    const coverage = en
      ? `${linked.length} of ${uniqueOptions.size} unique sample swap ingredients have a linked record in this market snapshot.`
      : `এই বাজারের স্ন্যাপশটে ${uniqueOptions.size}টি নমুনা উপকরণের মধ্যে ${linked.length}টির যুক্ত রেকর্ড আছে।`;
    const missingNote = missing.length
      ? `<p class="help">${en ? `No matched series in this snapshot for: ${missingNames}. No price is inferred.` : `এই স্ন্যাপশটে মিল পাওয়া যায়নি: ${missingNames}। কোনো দাম অনুমান করা হয়নি।`}</p>`
      : '';
    const source = en
      ? 'Source: WFP Price Database via HDX · CC BY-IGO. Values retain the published unit and source flag; no unit conversion is performed.'
      : 'তথ্যসূত্র: WFP Price Database via HDX · CC BY-IGO। প্রকাশিত একক ও উৎসের চিহ্ন অপরিবর্তিত; একক রূপান্তর করা হয়নি।';
    const limitations = en
      ? 'These are dated historical observations, not current quotes. The demo mapping is not a verified food-equivalence or quality assessment. These values do not change sample plan costs. Nutrition composition: no values are imported because the relevant data file and reuse terms are not yet confirmed; no nutrient comparison is calculated.'
      : 'এগুলো তারিখযুক্ত পুরোনো পর্যবেক্ষণ, বর্তমান বাজারদর নয়। নমুনার সংযোগ কোনো যাচাইকৃত খাদ্য-সমতুল্যতা বা গুণমানের মূল্যায়ন নয়। এতে নমুনা পরিকল্পনার দাম বদলায় না। পুষ্টি-উপাদান: প্রাসঙ্গিক ডেটা ফাইল ও পুনর্ব্যবহারের শর্ত নিশ্চিত না হওয়ায় কোনো মান আমদানি করা হয়নি; পুষ্টির তুলনাও করা হয় না।';
    const marketLabel = en ? `Reference market: ${market.name}` : `তথ্যসূত্রের বাজার: ${market.name}`;

    return `<details class="ingredient-evidence"><summary><span><strong>${heading}</strong><small>${summary}</small></span><span class="ingredient-evidence-count">${linked.length}/${uniqueOptions.size}</span></summary><div class="ingredient-evidence-body"><p class="ingredient-evidence-market">${escape(marketLabel)}</p><p class="help">${coverage}</p>${rows ? `<ul class="ingredient-evidence-list">${rows}</ul>` : `<p class="help">${en ? 'No mapped historical observations are available for this market.' : 'এই বাজারের জন্য কোনো যুক্ত পুরোনো পর্যবেক্ষণ নেই।'}</p>`}${missingNote}<p class="help">${limitations}</p><p class="help ingredient-evidence-source">${source} <a href="${escape(data.source.url)}" target="_blank" rel="noopener noreferrer">${en ? 'Open dataset' : 'ডেটাসেট দেখুন'} ↗</a></p></div></details>`;
  }

  const api = { render, optionSeries };
  root.AHAR_INGREDIENT_EVIDENCE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
