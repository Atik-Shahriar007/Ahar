AHARAI — AI SOLUTION AND IMPACT
IUT_b(a)s

1. THE PRODUCT
A personal food companion for Bangladesh. Photograph or describe a meal, correct the portion estimate, and get one practical next step. Keep a personal profile, build a budget-aware food plan, cook from available ingredients and review habits over time. Add family planning when useful; it is not required to use the product.

2. THE DEMO'S THREE COMPOSITE PEOPLE
Nabil, 23: university student in Gulshan, mostly seated, mixes home and outside meals, illustrative daily budget ৳280. The demo notices repeated soft drinks at lunch and suggests water without condemning his plate.
Rahim, 38: rickshaw driver in Tejgaon, strenuous work, illustrative daily budget ৳160. The demo preserves a filling lunch and proposes a familiar dal-and-egg option. It does not infer that he needs to lose weight from his occupation or appearance.
Mariam, 31: teacher in Mirpur, cooks at home and can also plan for a household. The demo uses existing rice and lentils to suggest vegetable khichuri and a consolidated shopping list.
These are fictional composites, not customers or research participants. Budgets and prices demonstrate interaction, not verified affordability or nutritional adequacy.

3. WHY AI BELONGS HERE
The photo is an input. The value is choosing an achievable next action under several constraints.
Input: confirmed foods and portions; voluntary age, height, weight and relevant profile information; activity; budget; food preferences; cooking access; recent choices.
Analysis: detect repeated meal patterns, retrieve local food records, identify useful substitutions and rank feasible options.
Output: a meal suggestion and a short reason explaining which constraints shaped it.
Feedback: accept, reject, correct a portion, change the budget, or say an ingredient is unavailable. The intended system would use this feedback to improve later ranking.
Current implemented AI boundary: when the user explicitly asks, the optional local Node service ranks IDs from a small fixed demo swap catalogue using a chosen planning priority, sample budget, demo meal-style tags, and aggregate candidate totals after pantry adjustment. The model does not receive a profile, raw pantry list, photo, or health goal, and it cannot create or apply an ingredient. The swap catalogue has not received professional nutrition review.

The key film moment: show Nabil and Rahim receiving different advice for familiar lunches. Explain the inputs that changed the recommendation. A generic chatbot response beside a calorie counter is not sufficient evidence of AI impact.

4. PROPOSED IMPLEMENTATION AFTER SELECTION
Perception: a vision model proposes likely dish labels and an uncertainty range. Ask about portions and oil. Never treat a photo as a laboratory measurement.
Grounding: retrieve dish variants from a curated Bangladesh food composition dataset with source, preparation method, units and update date. Verify rights before importing records. Maintain a separate price table with location, unit and collection date.
Calculation: deterministic arithmetic calculates nutrients from confirmed quantities and sums shopping costs. An LLM does not invent the totals.
Planning: generate candidates; enforce budget, availability and relevant exclusions; rank by variety, preferences and likely adherence. If no feasible option exists, say so.
Explanation: a language model describes the selected option in short Bangla or English, with the concrete reason visible.
Learning: aggregate meal history only with consent. Test whether personalized recommendations outperform a rules-only baseline before claiming a benefit from AI.

5. SAFETY THAT CHANGES PRODUCT BEHAVIOR
No diagnosis, promised weight loss or treatment claims. No universal calorie deficit. Photo results show uncertainty and ask for correction.
An eventual clinical-condition flow must use professional review and a defined scope. Pregnancy, children, suspected eating disorders and complex disease management are outside the first personalized adult pilot. Family shopping does not assign children adult portions or adult calorie targets.
Allergies and exclusions must be hard constraints in a real planner; the prototype does not implement an allergy-safe recommendation engine.
Do not monetize by recommending food that pays the highest commission. Do not sell health profiles.
Obtain explicit consent before storing photos or health-related details; allow deletion. The optional ranker endpoint receives only the minimal selected swap context described above. It does not upload photographs or health-profile fields. Pantry entries remain in the browser.

6. WHAT EXISTS TODAY
Clickable interface, illustrated sample meals, scripted estimate animation, editable illustrative portion values, three personas, personal profile form, budget arithmetic, family/solo modes, recipes, sample habit history, English/Bangla presentation, pantry-aware sample basket, user-selected ingredient swaps, and a constrained optional model ranker. Meal and photo responses remain scripted; none is evidence of working recognition or personalized medical guidance.
Uploaded photos are local previews only. The user must explicitly choose the sample result. State resets on reload. No login, real nutrition database, live bazar prices, real voice recognition or health outcomes.

7. FIRST PILOT: A TESTABLE PROPOSAL
Recruit 30 consenting adults across students, physically active workers and household shoppers. This is a proposed cohort, not traction. Spend two weeks observing food decisions, then four weeks testing the service with a qualified nutrition professional reviewing recommendations.
Baseline: a static set of locally relevant food tips.
Comparison: personalized suggestions using the same curated food and price data. Account for participant differences and avoid interpreting a small convenience sample as causal proof.
Primary measures: accepted suggestions actually tried; days with recorded dietary variety; planned versus actual food spend; retention without burdensome logging.
Quality measures: correction rate for dish/portion estimates; out-of-budget suggestions; unsafe or unsuitable suggestions flagged by the reviewer; performance differences across user groups and Bangla input conditions.
Do not use short-term weight change, disease reduction or projected lives saved as the prototype's impact result.

8. FEASIBLE SCOPE AND ECONOMICS
Start with a small, reviewed catalog of common meals and text-assisted portion confirmation. Cache repeated food lookups. Reserve vision for meal entry; do not call a large model for every arithmetic operation.
Test actual per-session inference cost and willingness to pay. Keep essential guidance accessible; explore optional household convenience features or sponsored access without assuming a signed payer. This is an experiment, not a revenue forecast.

9. WHY GP
Grameenphone is a potential distribution and pilot-enablement partner for Bangla, mobile-first services. Propose testing data-light access and recruitment support. There is no confirmed GP integration, free-data arrangement or commercial partnership.

10. JUDGING STORY
Originality: make local constraints and explainable personal adjustments visible. Do not claim to be the first food-photo app.
Feasibility: bounded food catalog, user correction, rules for costs and exclusions, professional review.
Social impact: practical decisions across different budgets and working lives, measured in a proposed pilot.
Meaningful AI: context and meal-history analysis change the recommendation; validate against a non-AI baseline.
These match published 2025 criteria. Confirm the current edition's rules before submission.


PHOTO / PANTRY REVISION — APPROVED BRAND: AharAI · আহারাই
The final AI is capitalized, in the same color as Ahar. Earlier brand options are not active.
The supplied pic_lunch.png is a shared meal: seasoned rice, grilled chicken, bread, fries and greens. Ask for the person's own portion. Do not reuse the earlier rui-fish/dal analysis for this photograph.
The supplied bajar.jpeg is used in My bazar. Scripted item suggestions are reviewed; quantities and prices need entry or an explicit demo-fill action. Confirmation stores a local pantry record per demo persona. Reload preserves that record; a new save replaces it. Photos are not stored. Saved ingredients and spending appear on Today, and matching main ingredients influence recipe ordering. Buying food never counts as eating it.
The intended AI opportunity is the link between purchases, availability, personal meal history and affordable suggestions. We have not validated recognition accuracy; a photo cannot establish unknown weights, prices, shelf life or actual consumption.
