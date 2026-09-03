# Implementation Priorities

The 100-item catalog is intentionally divergent. This shortlist is convergent: it favors narrow,
observable interventions that fit DSH’s current tool-registration and Cordis overlay model, impose
little context overhead, and can be tested one at a time.

## Ranking method

Candidates are ranked qualitatively on:

1. **mechanism isolation** — one cognitive intervention rather than a replacement architecture;
2. **determinism** — useful preprocessing or control outside another model call;
3. **observability** — a trace clearly shows whether the plugin fired and what it changed;
4. **low distraction** — few new tools and little injected text;
5. **transfer** — useful across languages, repositories, and task families;
6. **clean ablation** — removable without changing the rest of the stack.

This is an implementation order, not a prediction of benchmark rank.

## Tier A — build first

| Rank | Catalog idea | DSH-shaped first implementation | Existing overlap |
|---:|---|---|---|
| 1 | **#100 Failure Signal Parser** | One tool-free output normalizer for pytest, unittest, Jest, TypeScript, and compiler failures; retain raw-log paths. | Complements context compaction; does not duplicate a verifier. |
| 2 | **#87 Fail–Pass Provenance** | Add a red/green evidence record keyed by command, test identity, environment, and relevant hashes. | Tight remix of `test-first-gate` and `verify-loop`. |
| 3 | **#95 Acceptance Criteria Compiler** | Emit a cited criteria card with stable IDs and non-goals before writes begin. | Narrow deterministic layer around `dsh-specflow`. |
| 4 | **#63 Action Precondition Checker** | Extend `tool-validator` with typed file, service, permission, and working-directory preconditions. | Direct `tool-validator` remix. |
| 5 | **#65 Observation Completeness Detector** | Mark truncation, pagination, partial failure, stale cache, and ambiguous success in tool output. | New control; pairs with `dsh-context-proxy`. |
| 6 | **#52 Evidence Coverage Matrix** | Require every acceptance ID to link to a current command result or source observation. | Structured `dsh-proof` remix. |
| 7 | **#60 Evidence Freshness Guard** | Hash evidence dependencies and invalidate checks after relevant state changes. | New state layer for all verification plugins. |
| 8 | **#70 Failure Recovery Automaton** | Map normalized failure classes to one bounded recovery action with strict retry caps. | Combines `failure-notebook` and `tool-validator` without adding an agent. |

Tier A deliberately starts with perception, evidence, and control. Those mechanisms are cheaper and
easier to falsify than a new planner, memory system, or multi-agent director.

## Tier B — build after Tier A traces exist

| Rank | Catalog idea | Why it waits |
|---:|---|---|
| 9 | **#64 Tool Result Normalizer** | Its common envelope should be informed by real parser and completeness-detector outputs. |
| 10 | **#84 Progress Pulse** | Thrash thresholds need representative traces to avoid interrupting productive exploration. |
| 11 | **#69 Information-Gain Tool Selector** | It needs calibrated costs and a reliable unknowns register. |
| 12 | **#47 Calibration Coach** | Useful only after prediction/outcome pairs are recorded consistently. |
| 13 | **#76 Localization Handoff Packet** | Test after single-agent localization evidence establishes the required fields. |
| 14 | **#72 Disagreement-to-Probe Resolver** | Add only if multi-agent disagreement yields value beyond a single alternative-cause matrix. |
| 15 | **#7 Attention Residue Cleaner** | Goal-scoped context needs evidence about what downstream plugins actually consume. |

## Explicitly defer

Defer global workspaces, learned world models, cognitive-needs regulators, architecture-wide memory,
and strategy-learning controllers until simpler plugins expose enough structured state to implement
and evaluate them. Their research value remains high, but building them first would confound several
mechanisms and make a keep/drop result hard to interpret.

## Graduation checklist

Before moving a catalog entry into `data/ideas.json` or `remixes/`:

- identify the single mechanism being tested;
- name the closest existing plugin and state the non-duplicative delta;
- define trigger, inputs, output, and no-op behavior;
- define expected benefit and a plausible harm;
- cap tool, token, latency, and model-call overhead;
- choose varied held-out tasks without evaluator or answer access;
- define success, regression, and interaction measurements;
- verify the plugin can be removed cleanly for ablation.
