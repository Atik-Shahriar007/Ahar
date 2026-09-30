/* Historical-price visualization only; this snapshot never changes the planner basket. */
(function (root) {
  const data = root.AHAR_MARKET_DEMO;
  let currentState = null;
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fmtDate = (iso, bn) => {
    const [year, month, day] = iso.split('-').map(Number);
    const names = bn
      ? ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
      : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const digit = (value) => bn ? String(value).replace(/[0-9]/g, (n) => '০১২৩৪৫৬৭৮৯'[Number(n)]) : String(value);
    return `${digit(day)} ${names[month - 1]} ${digit(year)}`;
  };
  const priceText = (value, bn) => `৳${Number(value).toLocaleString(bn ? 'bn-BD' : 'en-US', { maximumFractionDigits: 1 })}`;

  function sparkline(points, label) {
    if (!points.length) return '';
    const values = points.map((point) => point.price);
    const min = Math.min(...values), max = Math.max(...values), spread = max - min || 1;
    const x = (index) => 8 + index * (164 / Math.max(1, values.length - 1));
    const y = (value) => 48 - ((value - min) / spread) * 36;
    const coords = values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
    const dots = values.map((value, index) => `<circle cx="${x(index)}" cy="${y(value)}" r="2.7"/>`).join('');
    return `<svg class="market-spark" viewBox="0 0 180 58" role="img" aria-label="${escape(label)}"><polyline points="${coords}"/>${dots}</svg>`;
  }

  function render(state) {
    if (!data?.markets?.length) return '';
    currentState = state;
    const bn = !!state.bn;
    if (!data.markets.some((market) => market.id === state.marketPulseMarket)) state.marketPulseMarket = data.markets[0].id;
    const market = data.markets.find((item) => item.id === state.marketPulseMarket);
    const options = data.markets.map((item) => `<option value="${escape(item.id)}" ${item.id === market.id ? 'selected' : ''}>${escape(item.name)}</option>`).join('');
    const cards = market.series.map((item) => {
      const points = item.points || [];
      if (!points.length) return '';
      const latest = points.at(-1);
      const period = `${fmtDate(points[0].date, bn)} – ${fmtDate(latest.date, bn)} · ${points.length} ${bn ? 'টি রেকর্ড' : 'records'}`;
      const label = `${item.en}: ${points.map((point) => `${point.date} ৳${point.price}/${item.unit}`).join(', ')}`;
      const detailLabel = bn ? `${points.length}টি তারিখসহ রেকর্ড দেখুন` : `View ${points.length} dated observations`;
      return `<article class="market-price-card"><div class="market-price-title"><div><span class="market-product">${escape(bn ? item.bn : item.en)}</span><small>${period}</small></div><span class="market-unit">BDT / ${escape(item.unit)}</span></div><div class="market-price-main"><strong>${priceText(latest.price, bn)}</strong><small>${bn ? 'সর্বশেষ রেকর্ড' : 'latest record'} · ${fmtDate(latest.date, bn)}</small></div>${sparkline(points, label)}<details class="market-observations"><summary>${detailLabel}</summary><div class="market-data-points">${points.map((point) => `<span><b>${priceText(point.price, bn)}</b><small>${fmtDate(point.date, bn)}</small></span>`).join('')}</div></details><small class="market-flag">${bn ? 'উৎসের ধরন' : 'Source flag'}: ${escape(latest.priceflag)}</small></article>`;
    }).join('');
    const heading = bn ? 'বাজারের দামের ধারাবাহিকতা' : 'A glimpse of bazar prices';
    const intro = bn ? 'ঢাকার নির্বাচিত বাজারের পুরোনো রেকর্ড—আজকের দাম নয়।' : 'Historical observations for a selected Dhaka market—not today’s prices.';
    const source = bn
      ? 'তথ্যসূত্র: WFP Price Database · HDX · CC BY-IGO. রেকর্ডের তারিখ দেখুন; এটি লাইভ বাজারদর নয়।'
      : 'Source: WFP Price Database via HDX · CC BY-IGO. Use the observation dates shown; this is not a live bazar quote.';
    const endDate = fmtDate(data.source.snapshotLatestDate, bn);
    const endNotice = bn ? `ডেটা-স্ন্যাপশটে সর্বশেষ রেকর্ড ${endDate}; খাবারভেদে তারিখ পুরোনো হতে পারে।` : `Latest date in this data snapshot: ${endDate}; individual foods may have older records.`;
    const basketNotice = bn ? 'এই চার্ট নমুনা পরিকল্পনার দাম বদলায় না। কেনার আগে নিজের বাজারে দাম যাচাই করুন।' : 'These charts do not change the sample plan prices. Check your own market before buying.';
    return `<section class="market-pulse" aria-labelledby="market-pulse-title"><div class="market-pulse-head"><div><span class="eyebrow">${bn ? 'ঐতিহাসিক নমুনা · বাজারের তথ্য' : 'HISTORICAL DEMO · MARKET DATA'}</span><h2 id="market-pulse-title">${heading}</h2><p>${intro}</p></div><label class="market-select"><span>${bn ? 'বাজার বেছে নিন' : 'Choose a market'}</span><select id="market-pulse-market">${options}</select></label></div><p class="market-snapshot-note">${endNotice}</p><div class="market-price-grid">${cards || `<p class="help">${bn ? 'এই বাজারের রেকর্ড নেই।' : 'No records for this market.'}</p>`}</div><p class="market-disclosure">${source} <a href="${escape(data.source.url)}" target="_blank" rel="noopener noreferrer">${bn ? 'তথ্যসূত্র খুলুন' : 'Open source dataset'} ↗</a></p><p class="market-disclosure">${basketNotice}</p></section>`;
  }

  root.document?.addEventListener('change', (event) => {
    if (event.target?.id !== 'market-pulse-market' || !currentState) return;
    currentState.marketPulseMarket = event.target.value;
    const panel = root.document.querySelector('.market-pulse');
    if (panel) panel.outerHTML = render(currentState);
  });

  root.AHAR_MARKET_PULSE = { render };
})(typeof window !== 'undefined' ? window : globalThis);
