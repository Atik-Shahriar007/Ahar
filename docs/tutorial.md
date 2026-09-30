# AharAI · IUT_b(a)s

For the full demo and optional model endpoint, run this from the repository root:

```bash
node server.mjs
```

Then open `http://127.0.0.1:5174`. No package install or build is required. The server binds to localhost by default. Model ranking is enabled only if `OPENAI_API_KEY` and `OPENAI_API_BASE` are configured in the server environment. Never put credentials in client code or the repository. For a static preview, run `python3 -m http.server 5174 --bind 127.0.0.1`; the AI button will use a clearly labeled local cost/budget ranking instead. Google Fonts are optional.

## Three-minute walkthrough

1. **Today:** start as Nabil. Read the sample recommendation and its reason. Click “I'll try this today.”
2. **My plate:** choose “Review this lunch,” adjust the example portion, and save. The shared photograph is not counted as one person's whole meal.
3. **My profile:** select Rahim. Return to Today to show how the fictional profile changes the scripted suggestion.
4. **My bazar:** select “Review this bazar photo,” then “Use demo quantities & prices.” Confirm and save the sample pantry. Scroll to **A glimpse of bazar prices**; switch between Dhaka Sadar and Kawran Bazar Dhaka and point out the dates, units, and source. It is a static historical snapshot ending 15 July 2026, not a live quote, and it does not change the sample plan.
5. **Food plan:** build a solo plan. Confirmed pantry items reduce the sample shopping basket only when names and units match. Try a swap, such as **Eggs → Masoor dal**, and confirm the list total changes. The sample meal description does not automatically change; review it before cooking. Prices are illustrative.
6. In the swap panel, choose a simple priority such as **Keep the sample cost low**, **Use confirmed pantry stock**, or a meal style; optionally choose **Rank alternatives with AI**. With the local server and model credentials configured, AharAI requests an order of IDs from its fixed sample catalogue using that goal, demo meal-style tags, and locally calculated aggregate costs/stock coverage. If the service is missing, it shows the deterministic rules-based order. The model never selects a swap for you; you must click **Use this**.
7. **My family:** build the default sample plan for three adult-equivalent people over three days. The family basket is a demonstration and does not assign children's portions or nutrition targets.
8. **Recipes:** open a dish and save it as a dinner idea. Pantry ingredient matches may influence recipe ordering.
9. **My progress:** sample history only. The **বাংলা** control switches the principal interface into Bengali.

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

Ingredient swaps are shopping-list alternatives from a short fixed catalogue. Compatible pantry stock is applied to the replacement, duplicate lines are combined, and the totals are recalculated. The swap does not claim nutrition equivalence, allergy safety, religious suitability, medical suitability, or recipe adaptation.

The optional AI request is made only when a user presses the ranking button. It contains the selected catalogue ingredient ID, the selected non-sensitive planning priority, the sample budget, locally calculated costs after pantry adjustment, and only an aggregate pantry-covered amount for each candidate. It does **not** include profile fields, body measurements, raw pantry rows, a name, or a photo. The server prompts the model to return only approved IDs; the interface validates them again. A local deterministic ranking works without AI.

## What is real in this prototype

Navigation, language switching, forms, sample suggestions, portion arithmetic, pantry confirmation/storage, compatible-unit deductions, user-selected swaps, basket recalculation, recipe dialogs, and a shopping-list text download work in the browser. The optional Node server can make one structured AI ranking request; it does not generate ingredients or advice. Market Pulse is a dated static historical-price visualization; it is not live and is not used by the planner. Nutrition values, sample meal history, recipe costs, bazar-purchase demo prices, and sample profiles remain illustrative. There is no live recognition, live price feed, or clinical decision system.

Do not present the sample habit chart or the pantry-adjusted demo arithmetic as measured impact, current prices, medical guidance, or proof of user savings.

## Submission notes

Read `video-pitch.md` for the timed pitch and shots; `problem-statement.md` and `ai-solution.md` for concept copy; `judges-qa.md` for rehearsal; `sources.md` for the source ledger; `validation-phase.md` for the market-data demo and later one-month plan; `competition-roadmap-2026.md` for competition research; and `implementation-roadmap.md` for staged feature work and release gates. The team's final video still needs narration and screen recording. Confirm current competition requirements in the official portal.
