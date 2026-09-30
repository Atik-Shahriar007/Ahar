# AharAI · IUT_b(a)s

Open [the local preview](http://127.0.0.1:5174) while its server is running, or open `index.html` directly. No installation or build is required. Fonts use Google Fonts when online and fall back to system fonts offline.

To restart a preview from the project root with Python installed:

```powershell
python -m http.server 5174 --bind 127.0.0.1 --directory f2
```

## A three-minute walkthrough

1. **Today:** start as Nabil. Read the green recommendation and its reason. Click “I'll try this today.”
2. **My plate:** your supplied shared-lunch photo appears. Choose “Review this lunch,” then adjust your rice, chicken, fries and bread portions. Save your own portion; the spread is not counted as one person’s meal.
3. **My profile:** select Rahim. Return to Today to show the different advice. Profiles are fictional, and switching resets the current person's demo interactions.
4. **Food plan:** build the solo plan. Rahim's ৳160 sample budget produces a ৳115 basket, leaving ৳45. These are illustrative home-cooking costs, not verified stall prices.
5. Choose **My family** and build the default plan: ৳1,200, three adult-equivalent people, three days. The sample basket totals ৳1,035, leaving ৳165. Tick items or download the list. Budget below the basket cost produces a clear shortfall state.
6. **Recipes:** open a dish, read ingredients and steps, save it as a dinner idea. Return to Today to see the chosen dish.
7. **My progress:** see illustrative history and the meal/habit actions from this session. **বাংলা** switches the principal interface into Bengali.

## Filming shortcuts

- `?demo=nabil`, `?demo=rahim`, `?demo=mariam` select a fresh persona on reload.
- Add `&bn=1` for Bengali at launch.
- Hashes: `#today`, `#plate`, `#plan`, `#recipes`, `#progress`, `#profile`.
- Number keys **1–6** go to those screens in the same order when not typing in a field or inside a dialog.
- Reload to reset. No sign-in or setup is necessary.
- Desktop shows a sidebar; narrow screens show bottom navigation. Film at your chosen viewport consistently.

Example: `http://127.0.0.1:5174/?demo=rahim&bn=1#today`

## Camera and voice

“Take / upload photo” opens a file/camera picker depending on the device. JPG, PNG, WebP and GIF up to 10 MB can be previewed locally. No photo is uploaded or analyzed. “Review this lunch” deliberately returns to pic_lunch.png before showing the scripted result.

The earlier scripted voice control is not part of the revised shared-lunch screen. No microphone is recorded.

## What is real in this prototype

Navigation, language switching, forms, simple conditional recommendations, portion arithmetic, basket totals, checkboxes, recipe dialogs, dinner selection and a text download work in the browser. All nutrient numbers, meal history and prices are sample values. There is no backend, trained model, real recognition, live price source or clinical decision system. Ordinary session state resets on reload. Confirmed pantry purchases persist in browser storage, separately for each demo persona; clear them from My bazar.

## Submission materials

Read `video.txt` for the timed pitch and shots; `problem_statement.txt` and `ai-solution.txt` for application content; `judges-qa.md` for rehearsal. The reusable brief is `prompt.txt`. `sources.md` records verified primary sources and the current-round rules still needing confirmation.

The finished video still needs your team's narration and screen recording. Do not submit the sample habit chart as evidence of real impact.

## New: photo to pantry

Open **My bazar** (or `#bazar`). The supplied `bajar.jpeg` anchors the flow. Choose **Review this bazar photo**. Item names are seeded suggestions, while quantities and prices begin blank. Enter them yourself, or choose **Use demo quantities & prices** for filming. Edit names and uncheck unwanted items, then **Confirm & save to my pantry**.

The full sample has 13 items and costs ৳794. This is invented demonstration data, not image-derived weights or current prices. Saved records survive reload in this browser and are isolated by demo persona. Saving a new review replaces that persona’s previous demo purchase record. No photo is saved or uploaded. Clear the record from My bazar when finished.

Today shows the confirmed purchase count and spend. Recipes show saved ingredients and prioritize dishes with matching main ingredients. This is simple demonstration logic, not an AI recommendation engine or allergy check. Purchases never increment meal logs or consumed calories.
