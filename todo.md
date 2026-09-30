# AharAI — implemented features and future work

**Status date:** 30 September 2026
**Purpose:** living handoff for the team and future AI sessions. Read [`context.md`](context.md) first. “Implemented” means the prototype has the interaction/code; it does **not** mean users validated it or the underlying data/claim is production-ready.

## Completed in the prototype

- [x] **Mobile-first AharAI shell:** vanilla HTML/CSS/JavaScript, English/Bangla presentation, three fictional demo personas, navigation and sample profile/recipe/progress flows.
- [x] **Pantry-aware sample basket:** clear food-name and unit matches can reduce what is estimated to buy; unknown/incompatible items are not counted; stock is not silently consumed.
- [x] **Curated ingredient swaps:** user-selected alternatives recalculate the sample basket and budget. They are not nutrition, allergy, recipe, medical, religious, or availability equivalences.
- [x] **Optional constrained swap ranking:** user-triggered localhost LLM ordering of fixed approved IDs, with deterministic rules fallback. The model does not calculate or apply swaps.
- [x] **Browser-local swap feedback:** optional fictional-profile-scoped votes/reasons; resettable; used only as a final local-rules tie-break and omitted from model requests.
- [x] **Historical Market Pulse and provenance panel:** static WFP/HDX excerpt for two Dhaka markets, dated/original-unit source display, and explicit data gaps. Not live and not connected to the plan totals.
- [x] **Opt-in meal-text mapper:** Bangla/English sentence review into a fixed food allowlist with quoted evidence, user correction, and separate local confirmation. Raw sentence is not saved; it does not produce nutrition estimates.
- [x] **Guided Plan for Today:** routine + budget + checked pantry + meal-by-meal sample cost + optional egg-to-dal swap. **Show Rahim’s workday** uses fictional unsaved sample stock. **All items / To buy / From pantry** filters the displayed ingredient lines only; totals remain unchanged. The selected plan is session-only.
- [x] **Regression coverage:** latest known run passed 6 Python tests, 40 Node tests, `git diff --check`, and the synthetic-only ranker comparison.
- [x] **Competition materials:** README, tutorial, implementation/competition/validation roadmaps, AI-solution notes, judge Q&A, and timed pitch script are maintained in `docs/` and the repository root.

## Next recommended work — keep it visible and lightweight

### Priority 1 — Demo and usability hardening

- [ ] Rehearse the short path: Today → **Show Rahim’s workday** → explain the fictional pantry and sample budget → try **To buy / From pantry** → select the swap and explain the recalculated total.
- [ ] Do a manual accessibility pass for keyboard focus, filter `aria-pressed` state, readable Bangla wrapping, narrow screens, fixed bottom navigation, and reduced-motion/zoom behavior. Fix concrete defects without redesigning working flows.
- [ ] Keep pitch, tutorial, and Q&A synchronized with the exact UI. Never describe scripted photo results, the historical chart, or sample prices as real-time/model-validated.

### Priority 2 — Step 8 pilot preparation (not a completed pilot)

- [ ] Finalize a short, voluntary task-based usability session around routine choice, pantry freshness confirmation, the cost filters, swap choice, and price/date/unit comprehension.
- [ ] Before recruiting, agree with the team/mentor on target adults, location, sample size, consent/recording approach, and any school/competition requirements. Existing docs contain different *proposals* (a few early sessions versus a larger cohort); neither is a completed commitment or result.
- [ ] Collect only consented, minimal observations. Record comprehension, task completion, corrections and concerns—not names, diagnoses, body measurements, health outcomes, or invented testimonials.
- [ ] Update materials from actual observations only. Do not claim savings, accuracy, impact, retention, or dietary change before measuring them.

## Deferred or gated future work

### Step 7 — Optional meal-photo recognition research (not implemented)

- [ ] Only if the team wants this next: assess technical feasibility, representative Bangladesh-food coverage, dataset licenses/consent, privacy/deletion, and device/network constraints.
- [ ] Do not upload photos or add a scanner merely for competition impact. Any future flow must be opt-in, state what leaves the device, show uncertainty, ask the user to correct dish/portion/oil/shared-plate ambiguity, and retain a manual route.
- [ ] No calorie, nutrient, or health output until appropriate data, qualified review, and validation exist. The current sample/photo flow is scripted/local.

### Step 5 — Food and price grounding (partially implemented; unresolved)

- [ ] Current provenance UI is a prototype increment only. Agree on target locations, confirm lawful reuse and suitable dates/units for a price source, and obtain nutrition-data access/reuse confirmation and qualified review before importing values.
- [ ] Preserve source units/dates/flags, make missing values visible, and keep sample values separate. No live data integration or database is required for the current showcase scope.

### Step 9 — Deployment/operations (future gate)

- [ ] There is no public production backend/account/database. Before deploying any API, decide whether deployment is needed and review secret management, rate/budget limits, retention/logging, abuse protection, data location, and deletion behavior.
- [ ] Never expose a model key from browser code or a static hosting build. Maintain an explicit no-AI/manual path.

## Open decisions and cautions

- [ ] Resolve the pilot sample-size difference in the planning docs with the team; do not turn proposal language into a promise.
- [ ] Decide whether future planning is strictly individual or includes household-size controls. The current Guided Plan does not collect a household size; do not imply that its portions scale for a family.
- [ ] Keep the optional Step 7 research separate from a frontend demo request. The owner has explicitly preferred visible prototype work over backend/database or deep dataset work during this showcase phase.
- [ ] The final “Suggested next milestone” paragraph in `docs/implementation-roadmap.md` predates the completed Step 4 feedback work. Treat it as stale; reconcile it before using it to choose work. Step 8 preparation is a reasonable next practical focus, while Step 7 remains optional/deferred.
- [ ] No real user pilot, production nutrition review, live-price accuracy, model-accuracy evaluation, savings outcome, or medical safety validation has been demonstrated.

## Delivery checklist for each future code change

1. Check `git status --short --branch`, current `main` head, and relevant feature tests before editing.
2. Keep the change scoped, user-visible where requested, deterministic for arithmetic, and explicit about sample assumptions.
3. Run the Python and Node suites from [`context.md`](context.md); add focused regression coverage when behavior changes.
4. Update README/tutorial/judge/pitch/roadmap docs when user-facing claims or controls change.
5. Commit and push a small, descriptive change to the existing `main` branch when requested. Verify local/remote `main` match and the worktree is clean; never force-push.
