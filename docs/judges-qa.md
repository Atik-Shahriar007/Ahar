# Questions worth rehearsing

**Isn't this another calorie scanner?**
The photo result is scripted in this prototype; it is not a working scanner. The Today demo instead makes a connected decision loop visible: a chosen routine, only pantry stock the user confirms is still present, an illustrative budget, and a user-selected shopping alternative. Show its sample total changing; validate whether the loop solves a real problem before claiming differentiation.

**Why use AI instead of rules?**
We do not use a model for arithmetic. The Guided Plan for Today, costs, and pantry deductions all use local deterministic rules. Separately, an optional server-side model ranks IDs from a fixed demo swap list against a user-selected budget, pantry-use, or sample meal-style priority. The list has not had professional nutrition review, and we still need to test whether model ranking adds value over that baseline.

**What information does the model receive?**
There are two separate, opt-in requests. Swap ranking receives the selected catalogue ingredient ID, planning priority, sample budget, and aggregate candidate costs/stock coverage. Meal-text interpretation receives only the sentence after the user presses its review button; the server supplies the fixed demo food list. Neither includes a name, profile/health fields, body measurements, pantry rows, or photos. Credentials stay on the localhost server. The text parser returns only allowlisted food IDs with quoted evidence; the user can correct everything and must confirm before local saving.

**Does meal text recognition know nutrition or calories?**
No. It only maps explicitly mentioned words to a small fixed demo food list. Units and any amount must be supported by the quoted sentence; results show an uncalibrated uncertainty label and remain editable. The feature does not estimate calories, nutrition, allergies, or health needs.

**What if the model is unavailable?**
With the local server running but no model credentials, the parser falls back to exact-name matching only. Users can always choose foods manually without AI. A static-only preview also retains manual selection. Nothing is added until the user confirms.

**Does the feedback train or personalize the AI?**
No. Feedback is optional and stored in this browser under the current fictional demo profile. It only breaks ties in the local rules ranking, is excluded from the model request, and has a separate clear control. We have not collected real-user feedback or measured whether the suggestions are useful.

**Can a photo know the calories in curry?**
Not precisely. Hidden oil and portion size matter. We show a range, ask for correction and would evaluate against measured dishes. Today's result is scripted, not a recognition benchmark.

**Can a rickshaw driver realistically use this?**
That needs field testing. The demo offers Bangla, large controls and a non-gym framing. A proposed voice flow and lighter interface need testing on actual devices, in noise and with data costs. We do not claim universal access from a desktop demo.

**What happens when an option costs too much?**
The sample plan shows the estimated total and flags whether it fits the sample budget. **All items / To buy / From pantry** filters show different ingredient rows but do not change meal or day totals. Alternatives are only shopping-list examples—not nutritionally equivalent or guaranteed available. Real affordability and nutritional adequacy need verified local data and professional review.

**Is Rahim’s demo pantry real, and does the plan save anything?**
No. **Show Rahim’s workday** is a fictional one-tap scenario with explicitly labelled, unsaved sample rice and dal. In the regular flow, the user checks which previously saved pantry items are still available before any deduction. Selecting the plan keeps a confirmation in the current demo session only; it does not save a health record or send information to a model.

**Where does the data come from?**
My bazar contains a small static excerpt from the WFP Price Database via HDX. The Food plan also shows two explicit demo links to the WFP lentil and wheat-flour series, with dates, raw units, and source flags; it lists unmatched options instead of filling gaps. This is historical context only—the links are not professional equivalence checks and do not feed sample totals. Nutrition data remains unimported while file access and reuse terms are unconfirmed.

**Are the prices current or used by the budget planner?**
No. The Market Pulse is a historical visual for two selected Dhaka markets and its snapshot ends in July 2026. Sample purchase and plan prices are separate. The prototype has no live market-price integration or savings claim.

**What impact have you achieved?**
None has been measured yet. We have a clickable prototype and a proposed pilot. We would test text-interpretation corrections and comprehension as well as sustained use, dietary variety, actual spending and recommendation quality—not claim accuracy, savings, or disease prevention from a demo.

**Who pays?**
We would test optional paid convenience features and sponsored access while protecting essential guidance. No payer is confirmed. We need real cost and willingness-to-pay evidence before forecasting revenue.

**Why your team?**
Use the team's real skills and access to pilot participants. Do not invent clinical expertise. Identify the nutrition professional or institution you still need to recruit.

**What exactly do you want from GP?**
Support to validate a Bangla, data-light experience with a small adult cohort, connect with appropriate nutrition expertise and test distribution. Say “proposed collaboration,” not “GP-powered.”
