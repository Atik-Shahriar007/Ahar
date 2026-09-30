# AharAI implementation roadmap

This roadmap turns the current concept prototype into a stronger, testable product in small releases. It is deliberately narrower than the attached NutriShield brainstorm: preserve the AharAI name and Bangladesh-first focus, demonstrate one useful decision loop, and add AI only where its output can be bounded and checked.

## Current baseline

- **Foundation:** static mobile-first browser prototype; sample persona, recipe, pantry, and budget flows.
- **Stage 1 complete:** confirmed pantry quantities reduce the illustrative shopping basket only for clear food-name and compatible-unit matches.
- **This implementation:** a curated ingredient-swap catalogue, immediate basket recalculation, and an optional server-side AI ranker that can order only approved swap IDs. If the server/model is unavailable, the local rules-based ranking remains available.
- **Market Pulse showcase:** a bilingual, switchable historical WFP/HDX price visualization for two Dhaka markets; observation dates, raw units, source flags, and attribution are displayed. This static excerpt is not a live feed and is not connected to Food plan totals.

All basket prices and quantities remain demonstration values. No clinical or nutritional equivalence is asserted by a swap.

## Release sequence

### Step 0 — Reproducible prototype foundation (complete)

**Work:** import the supplied site and assets, preserve the existing product name, document local setup and sample-data limits.

**Acceptance:** the static site runs without a build step; the repository contains no API key or participant data.

### Step 1 — Pantry-aware sample plan (complete)

**Work:** deduct confirmed, recognizable pantry stock from the sample basket using compatible units; recalculate what remains to buy and explain the match.

**Acceptance:** a compatible pantry item reduces the line; unknown names and incompatible units do not; purchases are not logged as meals; no quantity is silently consumed.

### Step 2 — Ingredient swaps (implemented in this release)

**Work:** offer a short catalogue of clearly named shopping substitutions (for example, rice → flour or eggs → lentils). On selection, replace the item, merge duplicate ingredients, apply compatible pantry stock, and recalculate line costs, total, remaining budget, and shortfall. Keep an obvious reset. Label every price as sample data and every choice as a shopping alternative—not nutrition, medical, religious, or allergy equivalence.

**Acceptance:** swaps persist only in the current browser for that fictional demo profile; the user can undo them; all affected totals and the downloadable list agree; the meal description warns users to review substitutions instead of pretending the recipe itself was automatically adapted.

### Step 3 — Optional constrained AI swap ranking (implemented in this release)

**Work:** add a same-origin local Node endpoint. After the user explicitly chooses “AI rank,” send an approved source ID, one of five non-sensitive priorities (budget, pantry use, or curated meal style), the sample budget, and locally calculated candidate costs plus aggregate pantry-covered values. Never send a name, profile demographics, height/weight, meal/photo uploads, raw pantry rows, or health goals. Keep the credential exclusively on the server. Ask a current GPT model for an ordered list of candidate IDs in strict structured output; validate every ID against the server-side catalogue. AI can order options; it cannot create a food, quantity, price, nutrition claim, or action.

**Acceptance:** a strict ID whitelist is enforced; an absent key, API error, timeout, malformed response, duplicate/unknown ID, or disabled server falls back to a deterministic priority-aware ordering; the user must select an option; nothing is applied automatically; UI discloses what is sent and labels the result AI-assisted or rules-based accurately.

**Local modes:** `node server.mjs` serves the site and optional AI route. `python3 -m http.server` still serves a static demo; AI ranking then degrades to local rules. Set an API key only in the server environment; never put a key in HTML, JavaScript, a committed `.env`, or GitHub Pages.

### Showcase sub-step — Historical market pulse (implemented)

**Work:** include a small, dated historical price excerpt in My bazar; let judges switch between two Dhaka market series and inspect item-level values, source units, source flags, and dates. The displayed excerpt is statically bundled, with attribution, and the prototype does not make a network request for prices.

**Acceptance:** the page identifies the latest snapshot date, describes the prices as historical, keeps unlike units separate, and states that charts do not change sample plan totals. This demonstrates the intended data experience; it does not establish present-day market prices or user savings.

### Step 4 — Learn from explicit corrections (implemented)

**Goal:** improve relevance without silently profiling people. Feedback is optional, scoped to the selected fictional demo profile, stored in this browser only, and does not transmit to the model.

1. Ask for optional thumbs-up/down on a swap or ranked result.
2. Let users choose a simple reason (too expensive, not available, do not like it, other); do not ask for diagnosis, allergy history, weight goals, or sensitive explanations.
3. Store feedback locally on the device, visibly resettable, and scoped to the fictional demo profile; do not send it to a model by default.
4. Use it only to adjust deterministic local ranking first; state that it is device-local and experimental.
5. If cross-user research is later needed, obtain informed consent, minimize/aggregate data, define a retention period, and compare results to the baseline.

**Implementation:** after applying a swap, the user may choose useful/not useful and—only for a negative response—a simple reason. “Clear saved feedback” resets it separately from swaps. The deterministic local ranker uses votes only as a final tie-break after budget feasibility, the chosen planning priority, and cost. AI requests do not include feedback.

**Acceptance evidence:** tests cover per-profile local storage, validation against catalogue IDs, reset isolation, feedback tie behavior, preservation of budget/priority/cost precedence, unchanged plan arithmetic, and exclusion from the outgoing model payload.

### Step 5 — Ground the catalogue in verified Bangladesh data

1. Identify nutrition/ingredient datasets that are lawful to use and suitable for Bangladesh foods; record source, units, coverage, and date.
2. Find a reliable, dated, location-specific price source. Do not infer current prices from the supplied bazar image or one household purchase.
3. Get qualified nutrition review before making nutrient comparisons or health-oriented claims.
4. Keep price/nutrient arithmetic deterministic and source-linked. Show missing values and uncertainty instead of filling gaps with a language model.
5. Re-run swap tests against real dataset edge cases and document where the catalogue does not apply.

**Gate:** no nutrition-equivalence, calorie, disease, or affordability claims until evidence and review support them.

### Step 6 — Bangla meal-text interpretation (future AI candidate)

1. Use a user-entered Bangla/English meal sentence only after a separate, explicit action.
2. Ask the model to map phrases into IDs from a reviewed ingredient list, with optional quantities and uncertainty—not to invent foods or estimate calories from text alone.
3. Validate IDs/units, show the parsed result for correction, and require confirmation before adding a meal or changing a plan.
4. Keep model uncertainty visible and preserve a rules-only manual-entry path.
5. Exclude photos, health profile fields, and account identity from the request unless a future consented design specifically requires them.

### Step 7 — Optional meal-photo recognition (future; not a near-term requirement)

1. First build an appropriately licensed, representative, consented dataset and agree on deletion/security rules.
2. Show what leaves the device and request opt-in before upload.
3. Return possible food labels with calibrated uncertainty, never a false-precision calorie total; ask the user to correct portions, oil, and shared-plate ambiguity.
4. Compare performance across Bangla meals, lighting, dishes, regions, and device quality. If bias/error is unacceptable, do not enable the feature.
5. Keep local preview/manual description fully available.

### Step 8 — Real-user pilot and competition evidence

1. Test with a small, diverse set of consenting adult users before expanding scope.
2. Use scripted tasks: build a plan, confirm stock, try a swap, review the AI/rules ordering, and undo it.
3. Measure task completion, failed/out-of-budget plans, accepted versus rejected suggestions, correction rate, and comprehension of limitations—not health outcomes.
4. Record methods and limitations, not invented testimonials. Update the pitch from observed evidence only.
5. Add accessibility checks for small screens, keyboard/screen readers, Bangla text, and reduced motion.

### Step 9 — Deployment and operating safeguards

Before any public API deployment, choose an authorized host and confirm its secret-management, budget/rate limits, request retention, abuse protection, logging, data-location, and deletion behavior. Rotate credentials if they are ever exposed. Add input size limits, timeouts, safe error messages, and monitoring without storing meal/profile payloads. A static GitHub Pages deployment must never call a privileged model credential directly from the browser.

## AI and health guardrails for every release

- The LLM ranks IDs from a small fixed demo catalogue; it does not diagnose, prescribe, or invent nutritional data. Professional review is still a future data-validation gate.
- Deterministic code owns quantities, compatible units, totals, and budget feasibility.
- Each request is opt-in and data-minimized. The model cannot apply a swap without user action.
- Clearly distinguish sample values, rules-based ranking, and a genuine model-assisted response.
- Never assert that a swap is allergy-safe, religion-compatible, nutritionally equivalent, medically suitable, or affordable in a live market without evidence.
- Keep a no-AI/manual route. Do not build a generic health chatbot merely to add an AI label.

## Suggested next milestone after this release

Use the separate [`validation-phase.md`](validation-phase.md) one-month plan to test whether people understand the historical Market Pulse and what local data they actually need. After that initial review, implement the Step 4 device-local feedback control to test whether the current curated choices are useful before adding model complexity or collecting broader data. The chart remains a historical demo until an appropriate current source and target geography are selected.
