# AharAI: showcase data now, deeper validation in the later build phase

**Source review date: 30 September 2026.** The team has clarified that the current goal is a compelling prototype: show how the probable system could work with clearly labelled online/historical examples. Full accuracy, source-owner coordination, nutrition review, and field validation belong to the later one-month build phase; they are not blockers to this demo.

## What is visible in the prototype now

**My bazar** includes a historical market-pulse preview with a market selector, four food series, small trendlines, per-observation dates, source flags, and the source attribution. It uses a tiny static subset from the WFP Price Database via HDX for Dhaka Sadar and Kawran Bazar Dhaka. It does not fetch data at runtime, forecast prices, or alter the illustrative shopping plan. The newest row in the reviewed CSV is dated **15 July 2026**, so the UI correctly calls it historical data rather than today's price. The separate Food plan still uses explicitly illustrative prices.

**Food plan** now has a collapsed source-and-gap panel that follows the current Market Pulse market (default: Dhaka Sadar). It shows two explicit demo links—to WFP/HDX `Lentils (masur)` and `Wheat flour`—with the latest row date, raw unit, source flag, and attribution. It also names the swap options without a matched record. The mapping is not a food-equivalence review, and neither the historical values nor the snapshot changes sample plan arithmetic. No nutrient values are loaded because the Bangladesh food-composition files and reuse terms are not confirmed.

The data snapshot was explored from the HDX CSV on 30 September 2026: 34,377 records, 110 markets, 73 commodities, and eight raw units. Its date range includes 1900-08-15; that anomalous-looking date is kept as a review warning in the source audit, not treated as a valid modern market observation. The WFP CSV mixes units such as `KG`, `100 KG`, `L`, and `1 piece`; the demo preserves the specific item's source unit and does not compare unlike units.

The following sources were found for later expansion:

- The FAO/INFOODS catalogue links Bangladesh's **2013** food-composition table in PDF and Excel form. A 2022 peer-reviewed paper describes a newer database with 447 foods and 89 components, including primary analytical values for 74 foods and records that are analytical, estimated, borrowed, or calculated. The paper demonstrates that the update exists; the actual current data file and its applicable reuse terms were not confirmed in this review. No nutrient values from those tables are included in the prototype. [1] [2] [3]
- The Department of Agricultural Marketing (DAM) site offers date and locality filters, market selection, retail/wholesale reports, and print/PDF output. It is a promising source for a later local price view; the prototype uses the already-exported HDX snapshot for its static visual instead. [4] [5]
- AgriPriceBD is a secondary historical-price candidate: its Mendeley page states CC BY 4.0, five commodities, BDT/kg retail and wholesale ranges, and LLM-assisted extraction from government PDFs. It also notes four zero-valued green-chilli records during a portal outage. This is useful as a pipeline example, not as an unquestioned truth set. [6]

## What to say in a competition demo

> “Here’s the experience we are prototyping: choose a local market, see dated price observations and their trend, then make a food plan. The market chart is a static historical demonstration; today’s prices and the plan’s sample budget are separate. In the next build phase, we will connect and validate the right local data.”

Do not call the chart live, describe a trend as a forecast, or claim the illustrative plan prices were calculated from the chart. The point of the feature is to make a future data connection tangible, not to claim it is already production-ready.

## Suggested one-month build phase

This is a practical sequence for the month after the showcase prototype. It can run alongside the team's competition preparation and does not require finishing before demonstrating the prototype.

1. **Week 1 — user/context discovery:** agree on the target users and launch locations; run a few short, voluntary task-based sessions with adults; observe how people understand the market, date, unit, budget, pantry, and swap labels. Ask about recent real decisions rather than “would you use this?” and record anonymized themes, not identities or health details.
2. **Week 2 — data fit:** decide which market feed can be used for the selected locations; confirm source terms and collection cadence; map local food names, languages, market names, date fields, retail/wholesale categories, currencies, and units. Keep original source values and attribution.
3. **Week 3 — planning integration:** only after the above decisions, connect selected dated observations to a separate “estimated local basket” path. Show the market, observation date, unit, and sample size/provenance beside every estimate. Keep sample values distinct; do not silently convert litres, pieces, 100 kg, and kg.
4. **Week 4 — review and demo hardening:** compare displayed entries against source reports, test stale/missing/outlier cases, have a nutrition professional review any nutrient-equivalence claims, repeat the user task test, fix comprehension problems, and update the pitch to match what actually works.

### Lightweight interview prompts for later

This is a preparation sheet, not a report of completed interviews. Keep a session voluntary and brief. Avoid names, diagnoses, body measurements, income amounts, or recording by default; use participant codes and summarize themes. Follow any school/team research guidance. The prototype is not medical advice.

**English opener:** “We are students testing an early food-planning prototype. This is not medical advice. Taking part is voluntary; you may skip any question or stop. We will not record your name and will summarize comments. May we continue?”

**Bangla opener:** “আমরা শিক্ষার্থী, খাবার পরিকল্পনার একটি প্রাথমিক নমুনা পরীক্ষা করছি। এটি চিকিৎসা-পরামর্শ নয়। অংশ নেওয়া আপনার ইচ্ছা; যেকোনো প্রশ্ন বাদ দিতে বা থামতে পারবেন। আপনার নাম রাখব না; মন্তব্যগুলো সারাংশ হিসেবে লিখব। আমরা কি শুরু করতে পারি?”

1. “Tell me about the last time you decided what food to buy or prepare with limited money.”
2. “What food was already at home, and how did you check?”
3. “What changed the plan—price, availability, time, cooking equipment, household preference, or something else?”
4. “What do you do when an ingredient is unavailable?”
5. Ask the person to use the sample prototype: make a plan, try one swap, inspect the historical price chart, and explain what each date/unit means.
6. “Which part was confusing or felt untrustworthy? What would you change?”
7. “What, if anything, would stop this from fitting how you actually shop or cook?”

## Included developer checks

- `scripts/build_demo_market_snapshot.py` regenerates the small static preview from a downloaded HDX CSV; it does not call the network.
- `scripts/validate_price_data.py` checks a known WFP/HDX CSV, reports old/zero/future/stale records, preserves raw units, and does not certify a source as accurate.
- `scripts/compare_rankings.mjs` uses synthetic cases only. Its optional AI comparison runs only with the explicit `--with-ai` switch.

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/*.test.mjs
node scripts/compare_rankings.mjs
python3 scripts/validate_price_data.py --source wfp-hdx-bangladesh-food-prices --file /path/to/wfp_food_prices_bgd.csv --as-of 2026-09-30
```

The synthetic ranking benchmark checks behavior and agreement with the deterministic baseline; it is not a measure of model accuracy, user preference, nutrition quality, or social impact.

## References

[1]: https://www.fao.org/infoods/infoods/tables-and-databases/asia/en/ "FAO/INFOODS Asia food-composition catalogue"
[2]: https://www.fao.org/fileadmin/templates/food_composition/documents/FCT_10_2_14_final_version.pdf "Food Composition Table for Bangladesh, first edition, June 2013"
[3]: https://pubmed.ncbi.nlm.nih.gov/35763921/ "Development of a new food composition table for the Bangladeshi population, 2022"
[4]: https://market.dam.gov.bd/market_daily_price_report?L=E "Department of Agricultural Marketing daily price report"
[5]: https://market.dam.gov.bd/dam_user_guide/visitor_guide.html "Department of Agricultural Marketing visitor guide"
[6]: https://data.mendeley.com/datasets/bkmxnrn3hn "AgriPriceBD: daily agricultural commodity prices for Bangladesh"
[7]: https://data.humdata.org/dataset/wfp-food-prices-for-bangladesh "WFP Bangladesh food prices via the Humanitarian Data Exchange"
