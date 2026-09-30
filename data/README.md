# Data intake and prototype snapshot

The prototype includes one **small historical WFP/HDX price excerpt** in `market-data.js`, used only by the My bazar trend preview. Its displayed dates, market, original unit, and source are kept visible. It is not a live price feed, does not change the Food plan's illustrative prices, and should not be called today's price.

`sources.json` records the source candidates reviewed and the reuse/quality status found on 30 September 2026. The 2013/2022 food-composition sources and DAM reports are not imported into nutrition or budget calculations.

## Regenerate the demo excerpt

Download the WFP Bangladesh CSV from the dataset page linked in `sources.json`, then run:

```bash
python3 scripts/build_demo_market_snapshot.py --input /path/to/wfp_food_prices_bgd.csv --output market-data.js --max-points 10
```

The script selects a small, fixed set of Dhaka retail foods and keeps each source observation's date, price, raw unit, and price flag. It does not fetch data at runtime or convert units.

## Inspect a downloaded source file

```bash
python3 scripts/validate_price_data.py \
  --source wfp-hdx-bangladesh-food-prices \
  --file /path/to/wfp_food_prices_bgd.csv \
  --as-of YYYY-MM-DD
```

The validator checks a known source's schema and reports warnings for stale, zero, future-dated, or pre-1990 records; it never silently normalizes units. A structurally valid CSV is still not proof that a quote is current, accurate, or representative of a particular household.
