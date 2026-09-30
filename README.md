# AharAI · আহারাই

A mobile-first concept prototype for practical food choices shaped by familiar Bangladeshi meals, household pantry, and an illustrative food budget. The prototype now also demonstrates how dated local-market observations could appear in a future product.

## Run locally

No package installation is required. To run the full local prototype and optional AI ranking endpoint:

```bash
node server.mjs
```

Open `http://127.0.0.1:5174`. The server binds to localhost. Set `OPENAI_API_KEY` and `OPENAI_API_BASE` in the **server environment only** to enable optional model ranking; never put a key in frontend code or GitHub. Without these variables, the deterministic local ranking still works. For a static-only preview, run `python3 -m http.server 5174 --bind 127.0.0.1`.

## Demo shortcuts

- `?demo=nabil`, `?demo=rahim`, or `?demo=mariam` selects a fictional persona.
- Add `&bn=1` to launch the main interface in Bangla.
- Navigation hashes: `#today`, `#plate`, `#bazar`, `#plan`, `#recipes`, `#progress`, `#profile`.

## What is new in this phase

**My bazar** now includes a bilingual historical market-pulse preview. It uses a small, dated excerpt from the WFP Price Database distributed via HDX for Dhaka Sadar and Kawran Bazar Dhaka. The page shows the selected market, food, original unit, source flag, observation dates, and small trend lines. A market dropdown lets the demo switch locations. The excerpt is not live, may be stale, and does not feed the illustrative Food plan or shopping budget.

The `scripts/build_demo_market_snapshot.py` script can regenerate the excerpt from a downloaded WFP/HDX CSV. The prototype does not fetch prices at runtime. Attribution and the detailed source snapshot notes are in [`data/sources.json`](data/sources.json) and [`docs/validation-phase.md`](docs/validation-phase.md).

**Food plan** now includes a collapsed **Data evidence & gaps** disclosure. It uses the current Market Pulse market (default: Dhaka Sadar) and shows the dated WFP/HDX series linked by this demo to masoor dal and flour, preserving each source unit and flag. It lists the other swap ingredients with no matched observation, includes attribution, and explains that these historical values do not change plan prices. The mappings are prototype references, not verified food equivalence; nutrition-composition values remain unimported.

The Food plan still lets users select from a fixed list of illustrative ingredient swaps, then recalculates sample quantities, pantry coverage, and budget. The optional server-side model can rank only the listed candidates against a chosen goal; the user chooses whether to apply an option. Swaps are not nutrition, allergy, recipe, or health equivalence.

After applying a swap, users may optionally mark it useful or not and select a simple reason. Feedback is saved in this browser under the current fictional demo profile, can be cleared independently from swap choices, and only breaks ties in local rules rankings. It is never included in an AI request and does not change quantities, costs, pantry calculations, or the candidate catalogue.

## Important limitations

Meal/photo results, nutrition, the swap catalogue, household budgets, and Food plan prices remain illustrative or scripted. The market pulse is a **dated historical excerpt**, not a current market-price feed or a prediction of what a household will pay. There is no live food database, account system, or clinical decision service. Uploaded meal photos are local previews and are not analyzed or uploaded. Confirmed pantry entries and swap selections stay in the current browser. On an explicit ranking request, the optional AI endpoint receives only a selected ingredient ID, chosen planning goal, sample budget, candidate costs after local pantry adjustment, and aggregate pantry-covered value—not raw pantry rows, a name, profile/body measurements, or photos.

Do not describe the historical sample as today's price, the scripted nutrition as measured, or the small synthetic benchmark as evidence of model accuracy or user impact. The project keeps its AharAI name and Bangladesh-first concept; the attached NutriShield discussion is a feature brainstorm, not a rebrand.

## Checks and prototype tooling

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/*.test.mjs
node scripts/compare_rankings.mjs
```

The ranker comparison uses synthetic scenarios only. An optional model comparison requires the explicit `--with-ai` flag and a running local server; see [`docs/validation-phase.md`](docs/validation-phase.md).

## Project notes

- [`docs/competition-roadmap-2026.md`](docs/competition-roadmap-2026.md): evidence-led competition analysis and staged product roadmap.
- [`docs/implementation-roadmap.md`](docs/implementation-roadmap.md): detailed feature sequence and safeguards.
- [`docs/validation-phase.md`](docs/validation-phase.md): source review, interview preparation, implementation gates, and commands.
- [`data/README.md`](data/README.md): data intake notes.
- [`docs/tutorial.md`](docs/tutorial.md): prototype walkthrough and caveats.
- [`docs/ai-solution.md`](docs/ai-solution.md): original concept and proposed architecture.
