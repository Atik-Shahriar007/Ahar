# AharAI · আহারাই

A mobile-first concept prototype for practical food choices shaped by familiar Bangladeshi meals, daily routine, household pantry, and an illustrative food budget.

## Run locally

No build step or package installation is required. From this directory, run:

```bash
python3 -m http.server 5174 --bind 127.0.0.1
```

Then open `http://127.0.0.1:5174`. Opening `index.html` directly may also work, but a local server is more reliable for browser storage and image behavior.

## Demo shortcuts

- `?demo=nabil`, `?demo=rahim`, or `?demo=mariam` selects a fictional persona.
- Add `&bn=1` to launch the main interface in Bangla.
- Navigation hashes: `#today`, `#plate`, `#bazar`, `#plan`, `#recipes`, `#progress`, `#profile`.

## First staged improvement

The Food plan now uses confirmed pantry entries when the name and measurement unit are clear. It subtracts compatible stock from the sample shopping basket, recalculates the estimated amount still to buy, and explains the match. Unclear names or incompatible units are ignored. It does not assume food is fresh, track expiry, or count purchases as meals.

This is transparent, deterministic demo logic—not a trained AI model. The feature is intended to make AharAI's budget-and-pantry decision loop tangible while preserving a clean baseline for future AI evaluation.

## Important limitations

This repository is a static frontend. Meal/photo results, recommendations, prices, meal history, and nutrition figures are illustrative or scripted; no live AI model, food database, current market-price feed, server, account system, or clinical decision service is connected. Uploaded meal photos are local previews and are not analyzed or uploaded. Confirmed pantry entries are stored in the current browser only.

Do not present demo values as measured impact, verified prices, medical guidance, or evidence that an AI model is already operating. The project keeps the AharAI name and its existing Bangladesh-first concept; the attached NutriShield discussion is treated as a feature brainstorm, not a rebrand or a commitment to implement every proposed feature.

## Project notes

- [`docs/competition-roadmap-2026.md`](docs/competition-roadmap-2026.md): evidence-led competition analysis and staged product roadmap.
- [`docs/tutorial.md`](docs/tutorial.md): walkthrough and prototype caveats.
- [`docs/ai-solution.md`](docs/ai-solution.md): original concept and proposed architecture.
- [`docs/sources.md`](docs/sources.md): original sources and claim limitations.
