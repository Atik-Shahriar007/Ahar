# AharAI — project context for maintainers and new AI sessions

**Last updated:** 30 September 2026
**Start here:** read this file, then [`todo.md`](todo.md), then the relevant source/docs named below. Check `git status` and the current `main` head before changing files.

## 1. Project snapshot

**AharAI (আহারাই)** is a Bangladesh-first, mobile-first food-planning concept prototype prepared for the **Grameenphone FutureMakers 2026** competition. Its core product idea is a connected decision loop: a person's routine, food already confirmed to be at home, and a sample food budget shape practical meal/shopping choices. The experience should be useful, visually compelling, respectful, and honest about what is only a demo.

This repository is a showcase prototype—not a deployed health product, clinical service, or validated nutrition system. Do not claim competition results, user impact, savings, current prices, recognition accuracy, or medical benefit without evidence.

## 2. What currently works

- **Today / Guided Plan for Today:** choose a busy-workday or home-cooking rhythm, enter a sample daily budget, and view breakfast/lunch/dinner ideas with illustrative purchase costs. A pantry item only reduces the estimate after the user checks that a previously saved item is still available. The one-tap **Show Rahim’s workday** shortcut uses fictional, unsaved sample rice and dal stock. The optional lunch egg-to-masoor-dal idea recalculates sample cost. **All items / To buy / From pantry** filters change visible ingredient rows only; meal and day totals do not change. Selecting the plan does not persist a health/meal record.
- **My bazar / pantry:** a sample purchase review can create a browser-local, fictional-profile-scoped pantry record. A purchase is not proof the food was eaten, and planning does not silently consume saved quantities.
- **Food plan:** illustrative shopping-basket arithmetic, compatible pantry deductions, a curated set of user-selected ingredient swaps, and recalculated sample totals. Swap choices are shopping alternatives, not claims of nutritional, allergy, religious, or medical equivalence.
- **Optional swap ranking:** a localhost Node endpoint may order IDs from the fixed demo swap catalogue when explicitly requested. Deterministic local ranking remains available; the model cannot add foods, compute the budget, or apply a swap.
- **Swap feedback:** optional votes/reasons are stored locally per fictional demo profile. Users can clear the feedback; it only breaks ties in local rules ranking and is not sent to the model.
- **Market Pulse:** bilingual visualization of a small static historical WFP/HDX excerpt for Dhaka Sadar and Kawran Bazar Dhaka, with dates, original units, flags, and attribution. It is not live, does not forecast, and does not feed plan totals. The reviewed snapshot's latest observation is dated **15 July 2026**; see [`docs/validation-phase.md`](docs/validation-phase.md) and [`data/sources.json`](data/sources.json).
- **Data evidence & gaps:** the Food plan shows a couple of explicit historical WFP/HDX demo mappings and identifies unmatched items. Mappings are not expert-reviewed food equivalences; the historical rows do not change sample calculations.
- **My plate:** local illustrative photo/sample flow plus an opt-in Bangla/English sentence mapper. The user explicitly requests review, can correct/remove suggestions or choose foods manually, and must separately confirm before text-derived food IDs/accepted quantities are stored in this browser. The raw sentence is not retained.
- **English/Bangla interface:** primary prototype screens and feature-specific controls include Bangla presentation.

## 3. Important non-features and safety boundaries

- Meal photos are **local previews**; there is no working meal-photo recognition and no upload/vision request. A scripted sample can be selected by the user.
- There is no production database, account/login system, live market-price integration, or measured health outcome.
- Plan prices, food quantities, budgets, sample nutrition and personas are illustrative. The prototype does not diagnose, prescribe, estimate medical suitability, guarantee affordability, or make allergy-safe recommendations.
- No nutrient composition values have been imported into the plan. Qualified nutrition review, suitable data/reuse terms, and user validation remain future gates.
- AI features are opt-in and separate from the deterministic arithmetic. Keep credentials server-side; never place API secrets in HTML/JavaScript, committed files, or a client request.
- The Guided Plan and selected-plan confirmation stay in the current page/session; they do not save a health record. Pantry, meal-text confirmations, and swap feedback use browser-local storage according to their feature-specific flows. Do not mistake those local demos for a cloud account or backend database.
- Personas (Nabil, Rahim, Mariam) are fictional composites. No real-user pilot or impact study has been completed.

## 4. Architecture and where to look

This is a vanilla HTML/CSS/JavaScript application with **no frontend build step or package installation**. `server.mjs` is a small localhost Node server for the preview and optional server-backed functions; static-file access is explicitly allowlisted.

| File or folder | Responsibility |
| --- | --- |
| `index.html` | Page shell, styling/scripts, initialization order. |
| `app.js` | Main screen rendering, navigation, fictional persona and shared UI state. |
| `style.css` | Main layout and responsive component styling. |
| `pantry.js`, `planner.js` | Browser-local pantry handling and Food plan calculations. |
| `swap-catalog.js`, `swap-engine.js`, `ranking-core.js`, `feedback-store.js` | Fixed swap list, deterministic arithmetic/ranking, optional ranking request, local profile-scoped votes. |
| `guided-plan-core.js`, `guided-plan.js` | Pure one-day sample calculations and Today-screen routine/pantry/budget/swap/filter UI. |
| `market-data.js`, `market-pulse.js`, `ingredient-evidence.js` | Static historical market series, chart UI, evidence/provenance disclosure. |
| `meal-text-catalog.js`, `meal-text-core.js`, `meal-text.js` | Fixed-list meal-text validation, local UI, and review/confirm boundary. |
| `server.mjs` | Local static server plus optional ranking/meal-text endpoints and explicit public-file allowlist. |
| `data/`, `scripts/` | Source notes/static demo data and offline data/validation scripts. |
| `tests/` | Node and Python regression tests. |
| `docs/` | Competition story, implementation stages, validation plan, judge Q&A, tutorial, pitch script, and safety notes. |

## 5. Run and test

From the repository root:

```bash
node server.mjs
```

Open `http://127.0.0.1:5174`. No package install is required. Optional model calls require `OPENAI_API_KEY` and `OPENAI_API_BASE` **in the server environment only**. Without them, ranking falls back to local rules and meal-text has exact-name/manual fallbacks. A static-only preview is possible with:

```bash
python3 -m http.server 5174 --bind 127.0.0.1
```

The static server does not provide the meal-text API route. Standard checks:

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/*.test.mjs
node scripts/compare_rankings.mjs
```

At this handoff, the suite passed **6 Python tests and 40 Node tests**; the ranker comparison is explicitly synthetic, not model-accuracy or user-impact evidence. If source/test counts change, rerun and update this note.

## 6. Product and collaboration preferences

- Preserve the **AharAI** name and Bangladesh-first focus; do not rebrand based on the attached NutriShield brainstorm.
- The competition demo should feel polished and “wow” through a visible, connected frontend loop—not by disguising simulated features as production systems.
- The owner has asked to prioritize **visible frontend prototype improvements and speed**, rather than spending the showcase phase on backend/database infrastructure or extensive dataset research. Do not add services, data ingestion, or a public backend unless explicitly requested and the necessary source/privacy decisions are clear.
- Keep every AI action user-triggered, explain what is demo-only, preserve manual/no-AI fallbacks, and make correction easy.
- Continue making small, reviewable commits and pushing to the existing `main` branch when requested; do not force-push. Verify the remote head and clean worktree after delivery.

## 7. Canonical reference documents

- [`README.md`](README.md): launch, feature summary, limitations, tests.
- [`todo.md`](todo.md): implemented items, prioritized next work, deferred gates, and open decisions.
- [`docs/implementation-roadmap.md`](docs/implementation-roadmap.md): implementation stages and technical safeguards.
- [`docs/validation-phase.md`](docs/validation-phase.md): market-data caveats, pilot/interview prep, and test commands.
- [`docs/competition-roadmap-2026.md`](docs/competition-roadmap-2026.md): competition framing and evidence-led demo story.
- [`docs/judges-qa.md`](docs/judges-qa.md), [`docs/tutorial.md`](docs/tutorial.md), [`docs/video-pitch.md`](docs/video-pitch.md): presentation materials.
- [`docs/ai-solution.md`](docs/ai-solution.md): broader product concept, optional AI boundary, and future architecture.

When two documents disagree, use the implementation and tests to establish what works; use [`todo.md`](todo.md) for the current recommended direction; then reconcile stale text rather than silently treating a proposal as implemented.
