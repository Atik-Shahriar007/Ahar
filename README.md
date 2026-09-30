# AharAI · আহারাই

A static, browser-based prototype for everyday food guidance shaped by familiar Bangladeshi meals, routines, and illustrative budgets.

## Run locally

```bash
python3 -m http.server 5174 --bind 127.0.0.1
```

Open `http://127.0.0.1:5174`. No package installation or build step is required.

Demo personas: `?demo=nabil`, `?demo=rahim`, or `?demo=mariam`. Add `&bn=1` to start in Bangla. Navigation routes are available as URL hashes such as `#today`, `#plate`, `#bazar`, and `#plan`.

## Prototype limits

This is an illustrative frontend, not a deployed service. Photo results, food values, prices, meal history, and profile suggestions are scripted or sample data. Uploaded meal photos are local previews and are not analyzed or sent to a server. Confirmed bazar entries are stored in this browser only. There is no trained AI model, backend, account system, live price source, or clinical guidance.

See `docs/` for the original concept, demo instructions, source ledger, judge questions, and pitch materials.
