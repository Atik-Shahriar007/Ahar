# AharAI · IUT_b(a)s

Open `index.html` directly or run a local server from the repository root:

```bash
python3 -m http.server 5174 --bind 127.0.0.1
```

Then open `http://127.0.0.1:5174`. No installation or build is required. Google Fonts are optional and fall back to system fonts offline.

## Three-minute walkthrough

1. **Today:** start as Nabil. Read the sample recommendation and its reason. Click “I'll try this today.”
2. **My plate:** choose “Review this lunch,” adjust the example portion, and save. The shared photograph is not counted as one person's whole meal.
3. **My profile:** select Rahim. Return to Today to show how the fictional profile changes the scripted suggestion.
4. **My bazar:** select “Review this bazar photo,” then “Use demo quantities & prices.” Confirm and save the sample pantry. Demo values are invented, not extracted from the photo or current market data.
5. **Food plan:** build a solo plan. The plan now subtracts clearly matched, compatible-unit items from the confirmed pantry and displays a note explaining which sample ingredients it can reuse. For a simple demo, use the default sample quantities. The displayed remaining basket total is illustrative, not a verified price.
6. **My family:** build the default sample plan for three adult-equivalent people over three days. The family basket is a demonstration and does not assign children's portions or nutrition targets.
7. **Recipes:** open a dish and save it as a dinner idea. Pantry ingredient matches may influence recipe ordering.
8. **My progress:** sample history only. The **বাংলা** control switches the principal interface into Bengali.

## Demo shortcuts

- `?demo=nabil`, `?demo=rahim`, `?demo=mariam` select a fresh fictional persona on reload.
- Add `&bn=1` for Bengali at launch.
- Hashes: `#today`, `#plate`, `#bazar`, `#plan`, `#recipes`, `#progress`, `#profile`.
- Number keys **1–6** go to Today, My plate, Food plan, Recipes, My progress, and My profile when not typing in a field or inside a dialog.
- Reload to reset ordinary demo interactions. Confirmed pantry entries remain in this browser's local storage, separately for each fictional persona.
- Desktop shows a sidebar; narrow screens show bottom navigation.

## Photos, microphone, and data

Meal photos uploaded through the prototype are local previews only. The “Review this lunch” action restores the supplied sample photo and shows scripted values; no photo recognition runs and no photo is uploaded. The voice concept uses a written sample sentence and does not record the microphone.

The supplied bazar photo starts a review flow with scripted item-name suggestions. Quantities and prices are blank until entered or explicitly filled with the invented demo values. Nothing is saved until the user confirms the list. A confirmed pantry record is stored in this browser only; no photo is stored or sent.

The Food plan enhancement subtracts only pantry entries with a clear sample-food name match and compatible units. It does not infer that an item is fresh, unexpired, or still present. It never treats purchases as eaten or silently changes pantry quantities. Unknown names or incompatible units are ignored.

## What is real in this prototype

Navigation, language switching, forms, simple profile-based sample suggestions, portion arithmetic, illustrative basket calculations, pantry confirmation/storage, compatible-unit pantry deductions, recipe dialogs, dinner selection, and a shopping-list text download work in the browser. Nutrition values, meal history, recipes' costs, bazar prices, and sample profiles are not validated real-world data. There is no backend, trained model, live recognition, live price feed, or clinical decision system. The planner is transparent demo logic, not an AI model.

Do not present the sample habit chart or the pantry-adjusted demo arithmetic as measured impact, current prices, medical guidance, or proof of user savings.

## Submission notes

Read `video-pitch.md` for the existing timed pitch and shots; `problem-statement.md` and `ai-solution.md` for concept copy; `judges-qa.md` for rehearsal; `sources.md` for the original source ledger; and `competition-roadmap-2026.md` for the current evidence-led improvement plan. The team's final video still needs its narration and screen recording. Confirm current competition requirements in the official portal.
