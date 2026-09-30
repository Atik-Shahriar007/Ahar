# AharAI · আহারাই

A mobile-first concept prototype for practical food choices shaped by familiar Bangladeshi meals, daily routine, household pantry, and an illustrative food budget.

## Run locally

No package installation is required. To run the full local prototype and optional AI ranking endpoint, run:

```bash
node server.mjs
```

Then open `http://127.0.0.1:5174`. The server binds to localhost by default. Set `OPENAI_API_KEY` and `OPENAI_API_BASE` in the **server environment only** to enable optional model ranking; never put a key in frontend code or GitHub. Without these variables, the local rules-based ranking still works. For a static-only preview, run `python3 -m http.server 5174 --bind 127.0.0.1`; the AI button then uses its local fallback.

## Demo shortcuts

- `?demo=nabil`, `?demo=rahim`, or `?demo=mariam` selects a fictional persona.
- Add `&bn=1` to launch the main interface in Bangla.
- Navigation hashes: `#today`, `#plate`, `#bazar`, `#plan`, `#recipes`, `#progress`, `#profile`.

## First staged improvement

The Food plan uses confirmed pantry entries when names and measurement units are clear. It also lets users choose from a small fixed list of illustrative ingredient swaps, then recalculates sample quantities, pantry coverage, and budget. An optional server-side model can rank only the listed candidates against a chosen goal (budget, pantry use, or meal style); the browser applies nothing until the user chooses. A deterministic ranking remains available. Swaps are not nutrition, allergy, or recipe equivalence.

The swap arithmetic and fallback ranker are transparent local rules. Only when explicitly requested through `node server.mjs` with model credentials configured does a real model rank approved option IDs. It cannot create prices, ingredients, nutrition advice, or actions.

## Important limitations

Meal/photo results, prices, meal history, swap catalogue, and nutrition figures are illustrative or scripted; there is no live food database, current market-price feed, account system, or clinical decision service. Uploaded meal photos are local previews and are not analyzed or uploaded. Confirmed pantry entries and swap selections stay in the current browser. On an explicit ranking request, the optional AI endpoint receives only the selected ingredient ID, chosen planning goal, sample budget, candidate costs after local pantry adjustment, and aggregate pantry-covered value—not raw pantry rows. It does not receive a name, profile/body measurements, or photos.

Do not present demo values as measured impact, verified prices, medical guidance, or evidence that an AI model is already operating. The project keeps the AharAI name and its existing Bangladesh-first concept; the attached NutriShield discussion is treated as a feature brainstorm, not a rebrand or a commitment to implement every proposed feature.

## Project notes

- [`docs/competition-roadmap-2026.md`](docs/competition-roadmap-2026.md): evidence-led competition analysis and staged product roadmap.
- [`docs/implementation-roadmap.md`](docs/implementation-roadmap.md): detailed feature sequence, release gates, privacy and AI safeguards.
- [`docs/tutorial.md`](docs/tutorial.md): walkthrough and prototype caveats.
- [`docs/ai-solution.md`](docs/ai-solution.md): original concept and proposed architecture.
- [`docs/sources.md`](docs/sources.md): original sources and claim limitations.
