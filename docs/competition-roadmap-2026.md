# AharAI: FutureMakers 2026 analysis and staged roadmap

**Prepared 30 September 2026.** This is an evidence-based product plan, not a claim about judging outcomes or a guarantee of winning.

## Competition fit and lessons from 2025

The official FutureMakers 2026 site describes the theme as **AI for Social Good** and says AI should play a meaningful, responsible role in addressing a societal challenge—not be added as a buzzword. Its listed areas include healthcare and mental wellbeing, digital inclusion and education, gender equality and inclusion, environmental sustainability and climate resilience, safety/security/privacy, and an “Others” category. AharAI can fit healthcare/social wellbeing if the team frames the problem as everyday food decisions under real budget and routine constraints, rather than as diagnosis or treatment. The public site currently shows a partly placeholder timeline, so verify the current application portal and the team’s own submission status. News coverage published on 3 September reported a 30 September registration deadline and teams of up to three; if the team is not already registered, confirm immediately through the official portal. [1] [2]

Grameenphone’s published 2025 evaluation criteria were **originality, feasibility, social impact, and meaningful application of AI**. Team Watermelon’s Ishara won with a Bangla Sign Language Translator concept. The first runner-up was Team Opion’s AI-driven news credibility platform; Team Synapz’s AI inclusion for differently-abled learners and Team Lasta’s Disha financial-inclusion project jointly took second runner-up. These are documented outcomes and project descriptions, not a complete record of the judging panel’s reasoning. We should not claim that any single feature caused a team to win. [3] [4]

The useful pattern is to make the social problem and intended beneficiary immediately concrete, make the role of AI understandable, and show a feasible way to test the idea. Coverage of Ishara describes two-way communication between Bangla sign-language gestures and text/speech, and a proposed institutional route for building data with hospitals and other organizations. That is a good precedent for grounding a technical idea in an actual communication barrier and a plausible validation partner—but it does not prove that AharAI should copy its technology or that the reported concept was already a mature product. [5]

## What to keep, narrow, and defer from the attached NutriShield discussion

The strongest parts for AharAI are pantry-aware meal planning, budget-sensitive alternatives, short explanations for recommendations, and learning from a user’s corrections. These connect naturally to the existing prototype’s personal profiles, food plan, recipes, and confirmed pantry.

Keep the established **AharAI** name and Bangladesh-first framing. The attached discussion’s NutriShield name, all-in-one product promise, calorie targets, weight-gain/loss goals, nutrition-gap radar, and broad health analytics would dilute the current concept and create unsupported health claims. Do not add disease-specific advice, child nutrition targets, clinical family profiles, or allergy guarantees without qualified review and robust data. Packaged-food OCR, live food-photo recognition, expiry notifications, accounts, reminders, monthly reports, and a general chatbot are later-stage ideas; none is required to make this prototype clearer or more credible.

The interface is primarily a browser prototype, now paired with an optional same-origin Node endpoint. Photo recognition, meal estimates, sample history, profile suggestions, and Food plan prices remain scripted or illustrative. My bazar additionally shows a small static, dated WFP/HDX historical-price snapshot for two Dhaka markets; it is not live and does not affect the plan budget. The only live model function is an explicitly requested rank of fixed sample swap IDs against a selected planning priority. This demonstrates bounded AI and a possible local-data experience, not a professionally reviewed catalogue, validated personalization system, or live market service.

## Staged plan

### Stage 0 — Establish the working project

Import the supplied prototype into the empty `Ahar` repository, keep the existing brand, move the supporting documents into `docs/`, and document how to run the static demo and what is simulated. Keep secrets and real participant information out of the repository. This stage establishes a reproducible starting point.

### Stage 1 — Connect confirmed pantry stock to the budget plan

**First implementation:** when a user has explicitly confirmed a pantry list, match only clearly recognizable ingredients with compatible units against the sample shopping basket. Subtract available quantities, recalculate the estimated amount still to buy and the remaining sample budget, and explain which constraints changed the plan. If a name or unit is unclear, do not silently count it. Mark the result as an illustrative planning calculation, and remind users to confirm that recorded food is still available. Do not mark purchased food as eaten or decrement pantry stock automatically.

This created a visible, testable journey across three existing parts of AharAI: bazar review → pantry → a lower-cost food plan. At that stage, the calculation was intentionally rules-based and gave us a baseline for later comparison.

### Stage 1b — Add sample swaps and a constrained AI ranker (implemented)

Users can choose from a small illustrative swap catalogue and see quantities, pantry coverage, and budget recalculate locally. An optional server-side model ranks only approved option IDs against a user-selected, non-sensitive planning priority (sample cost, aggregate confirmed-stock use, or a curated meal style). Arithmetic remains deterministic; a local fallback always works; nothing is applied without a user click. No profile, photos, or raw pantry list is sent. This is a working prototype feature—not evidence that AI improves outcomes. Evaluate it against the fallback before expanding AI's role.

### Stage 2 — Validate the problem and replace invented assumptions

Before claiming that users need this, interview a small, diverse group of consenting adults across student, physically demanding work, and household-planning contexts. Ask about actual meal decisions, budget trade-offs, pantry practices, Bangla usability, and why a suggested change would be rejected. Record what was said without inventing participants or results. The new static Market Pulse makes the future local-data experience visible, but does not complete this validation stage: the team still needs to select a target area, find data appropriate to it, and review freshness and units. Do not treat the historical chart or illustrative plan prices as survey, current-price, or affordability evidence.

### Stage 3 — Evaluate bounded AI and expand only where it earns its place

First compare the implemented constrained ranker with its deterministic baseline using the same approved options, priorities, and sample inputs. Report when rankings differ and whether users find them more useful; do not claim better outcomes from one test call. Only after validated local data, a consent plan, and user testing should the team consider meal-text interpretation. Keep arithmetic, budget ceilings, exclusions, and ingredient/unit matching deterministic and inspectable. Do not expose credentials in the static frontend or present generated output as medical advice.

### Stage 4 — Make the pitch evidence-led

Use a short demo with one clear contrast: the same familiar food decision for two fictional adults with different routines/budgets, then show how confirmed pantry stock changes what must be purchased. Label personas and prices as illustrative. Close with a modest proposed pilot and measurable questions: accepted suggestions actually tried, out-of-budget recommendations, user corrections, and reported usefulness across Bangla/English and different contexts. Do not claim health outcomes, cost savings, or user traction before measuring them.

## Competition-oriented acceptance checklist

- **Originality:** show the connected local decision loop (routine + budget + existing food), not another isolated calorie scanner. Treat differentiation as a hypothesis until competitors and users are researched.
- **Feasibility:** keep the first scope small, offline-friendly, explainable, and explicit about sample data and missing integrations.
- **Social impact:** design for practical choices across different budgets and work patterns, without body shaming or assuming that every household has the same needs.
- **Meaningful AI:** describe the optional constrained ranker accurately, distinguish it from still-scripted photo/meal flows, explain why arithmetic stays deterministic, and compare its choices with the rules-only baseline before claiming added value.
- **Trust:** no diagnosis, promised weight change, false precision from photos, unverified current prices, or fabricated validation evidence.

## Sources

[1]: https://gpfuturemakers.com/ "Grameenphone FutureMakers 2026 official website"
[2]: https://www.thedailystar.net/news/technology/news/grameenphone-launches-second-futuremakers-competition-4263831 "The Daily Star: Grameenphone launches second FutureMakers competition, 3 September 2026"
[3]: https://www.grameenphone.com/about/media-center/press-release/grameenphone-futuremakers-grand-finale-ignites-ai-innovation-among "Grameenphone: FutureMakers 2025 grand finale and evaluation criteria"
[4]: https://www.tbsnews.net/economy/corporates/futuremakers-finale-celebrates-bangladeshs-next-generation-ai-innovators-1278466 "The Business Standard: FutureMakers 2025 finalists and outcomes"
[5]: https://www.thedailystar.net/tech-startup/news/bangla-sign-language-translator-wins-futuremakers-4028751 "The Daily Star: Ishara and the 2025 FutureMakers winner"
