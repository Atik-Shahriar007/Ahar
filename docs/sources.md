# Evidence and submission checks

Prepared 30 September 2026. This is a source ledger, not proof that the prototype improves health.

| Source | What it supports | Limit |
|---|---|---|
| [Grameenphone: FutureMakers launch, 3 September 2025](https://www.grameenphone.com/about/media-center/press-release/grameenphone-launches-futuremakers-first-ever-university-wide-ai) | The competition's AI-based university innovation context | Historical announcement; not a 2026 rulebook |
| [Grameenphone: FutureMakers finale, 5 November 2025](https://www.grameenphone.com/about/media-center/press-release/grameenphone-futuremakers-grand-finale-ignites-ai-innovation-among) | Published evaluation emphasis: originality, feasibility, social impact and meaningful AI | Do not claim these are verified current-round scoring weights |
| [WHO / NIPSOM: Bangladesh STEPS 2018 report](https://cdn.who.int/media/docs/default-source/ncds/ncd-surveillance/data-reporting/bangladesh/steps-ban-2018-eng.pdf?download=true&sfvrsn=964a03f7_1) | National evidence about adult dietary and other NCD risk factors; see diet chapter | Historical survey; no causal proof for AharAI and no inference from someone's appearance |
| [FAO: Bangladesh food-based dietary guidelines](https://www.fao.org/nutrition/education/dietary-guidelines/regions/bangladesh/en/) | Locally grounded guidance on variety and balanced meals | General guidance, not individualized clinical advice |
| [WFP Bangladesh food prices via HDX](https://data.humdata.org/dataset/wfp-food-prices-for-bangladesh) | Static Market Pulse excerpt plus two explicitly labelled demo-series links in Food plan; source rows include date, unit, market, price type, and flag | Latest row in the reviewed snapshot is 15 July 2026; historical only, mixed raw units, demo mappings are not equivalence validation, and records do not feed Food plan totals |
| [FAO/INFOODS: Bangladesh Food Composition Table, 2013](https://www.fao.org/fileadmin/templates/food_composition/documents/FCT_10_2_14_final_version.pdf) | Candidate Bangladesh food-composition reference; PDF and Excel are listed by INFOODS | Reuse terms for the data were not confirmed; no values imported into this prototype |
| [Updated Bangladesh food-composition table, 2022 paper](https://pubmed.ncbi.nlm.nih.gov/35763921/) | Describes an updated database of 447 foods and 89 components, with mixed data provenance | Publication is not the underlying database license or access confirmation; no values imported |
| [AgriPriceBD dataset](https://data.mendeley.com/datasets/bkmxnrn3hn) | Candidate for researching price-data extraction and anomaly handling | Secondary LLM-assisted transcription; compare to original reports before treating as reference data |

## Claims deliberately left out

“Bangladesh has the freshest food”; “Europeans are healthier”; “manual workers should have abs”; “our AI is accurate”; “we prevent diabetes”; “we save X taka”; “30 users already improved”; “first in Bangladesh.” None is established by our work.

## Before submitting

Check the actual invitation or portal for the current edition, deadline, eligibility, team size, track, word limits, accepted video length/format, prototype link requirements, and AI-use disclosures. The user requested a two-minute pitch; that duration is not independently verified here as a competition rule.

The proposed brand has not undergone trademark or domain clearance. Keep IUT_b(a)s exactly as supplied.

The Market Pulse UI and regeneration details are documented in [`../data/sources.json`](../data/sources.json) and [`validation-phase.md`](validation-phase.md). Its data is a dated historical excerpt, not a live quote.

## Evidence to gather next

Interview six to ten people across the three intended contexts. Ask them to reconstruct yesterday's meals and spending, show where they get food, and describe the last advice they tried. Test one recommendation with real shop prices. Record rejection reasons without pressuring participants. Use those findings to revise the problem statement before adding a market-size slide.
