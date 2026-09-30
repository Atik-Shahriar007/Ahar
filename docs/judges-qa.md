# Questions worth rehearsing

**Isn't this another calorie scanner?**
The photo result is scripted in this prototype; it is not a working scanner. Our product hypothesis is the connected decision loop: confirmed pantry, illustrative budget, and a user-selected shopping alternative. Show the basket changing, and validate whether that solves a real problem before claiming differentiation.

**Why use AI instead of rules?**
We do not use a model for arithmetic. In this prototype, an optional server-side model ranks IDs from a fixed demo swap list against a user-selected budget, pantry-use, or sample meal-style priority. Rules calculate costs, pantry coverage, and budget fit; a deterministic ranker remains available. The list has not had professional nutrition review, and we still need to test whether model ranking adds value over that baseline.

**What information does the model receive?**
Only the selected catalogue ingredient ID, one planning priority, the sample budget, and candidate costs after pantry adjustment plus aggregate pantry-covered amounts. It receives no name, profile fields, body measurements, raw pantry rows, or photos. The credential stays on the server. The model returns approved IDs only; the user still chooses.

**Does the feedback train or personalize the AI?**
No. Feedback is optional and stored in this browser under the current fictional demo profile. It only breaks ties in the local rules ranking, is excluded from the model request, and has a separate clear control. We have not collected real-user feedback or measured whether the suggestions are useful.

**Can a photo know the calories in curry?**
Not precisely. Hidden oil and portion size matter. We show a range, ask for correction and would evaluate against measured dishes. Today's result is scripted, not a recognition benchmark.

**Can a rickshaw driver realistically use this?**
That needs field testing. The demo offers Bangla, large controls and a non-gym framing. A proposed voice flow and lighter interface need testing on actual devices, in noise and with data costs. We do not claim universal access from a desktop demo.

**What happens when an option costs too much?**
The sample plan shows the estimated total and flags whether it fits the sample budget. Its alternatives are only shopping-list examples—not nutritionally equivalent or guaranteed available. Real affordability and nutritional adequacy need verified local data and professional review.

**Where does the data come from?**
My bazar contains a small static excerpt from the WFP Price Database via HDX. The latest record shown is dated 15 July 2026; we display the market, units, source flags, and dates so it is not mistaken for a live quote. It does not feed the illustrative Food plan totals. Nutrition data remains illustrative; selecting and validating suitable local sources is a later build-phase task.

**Are the prices current or used by the budget planner?**
No. The Market Pulse is a historical visual for two selected Dhaka markets and its snapshot ends in July 2026. Sample purchase and plan prices are separate. The prototype has no live market-price integration or savings claim.

**What impact have you achieved?**
None has been measured yet. We have a clickable prototype and a proposed pilot. We would measure sustained use, dietary variety, actual spending and recommendation quality—not claim disease prevention from a demo.

**Who pays?**
We would test optional paid convenience features and sponsored access while protecting essential guidance. No payer is confirmed. We need real cost and willingness-to-pay evidence before forecasting revenue.

**Why your team?**
Use the team's real skills and access to pilot participants. Do not invent clinical expertise. Identify the nutrition professional or institution you still need to recruit.

**What exactly do you want from GP?**
Support to validate a Bangla, data-light experience with a small adult cohort, connect with appropriate nutrition expertise and test distribution. Say “proposed collaboration,” not “GP-powered.”
