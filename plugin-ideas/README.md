# 100 Generalizable Intelligence Plugin Ideas for DSH

This catalog proposes **exactly 100** plugin experiments. Each is intended to improve a reusable
cognitive capability rather than exploit a benchmark, evaluator, hidden test, or data leak. The
ideas are deliberately plugin-shaped: narrow enough to ablate, composable with the current DSH
stack, and measurable through behavior rather than persuasive prompting alone.

## Selection rules

- **General over benchmark-specific:** the mechanism should transfer across repositories, task
  types, models, and evaluation suites.
- **No cheating:** no hidden-answer reconstruction, evaluator detection, reward tampering, test
  leakage, memorized patches, or special-casing known tasks.
- **Observable intervention:** every plugin changes a traceable process such as attention, memory,
  planning, search, tool selection, verification, or learning.
- **Bounded overhead:** start with a cheap trigger, budget, or confidence threshold; expensive
  cognition must earn its cost.
- **Falsifiable:** compare against the same stack without the plugin and record quality, cost,
  latency, failure modes, and interactions.

The “first trial” for each idea is an implementation sketch, not a benchmark prescription. Trials
should use held-out, contamination-resistant task collections spanning debugging, implementation,
explanation, refactoring, and unfamiliar tool use.

## Using this backlog in DSH

This folder is the reviewable research backlog. Promote a selected concept to `data/ideas.json` for
triage, then implement one narrow intervention under `remixes/<name>/` before adding it to the
catalog. DSH should test one candidate at a time against the current champion; never install the
whole catalog as a monolithic architecture. Favor deterministic wrappers and existing-plugin
remixes for early trials, reserving model-heavy orchestration for mechanisms that cannot be tested
more simply.

## I. Attention and executive control

### 1. Global Workspace Router

Let specialist plugins submit short, typed “broadcast bids” containing a claim, relevance score,
confidence, and requested action; expose only the winning few to the main agent each turn. This
turns plugin composition into an attention bottleneck instead of concatenating every plugin’s
output. **Inspiration:** Global Workspace Theory and Bengio’s consciousness prior. **First trial:**
wrap existing planning, memory, search, and verification plugins as bidders and cap the broadcast
at three cards.

### 2. Salience Auction

Allocate the next block of tokens or tool calls through a lightweight auction among unresolved
goals, surprising observations, risks, and information gaps. Bids decay when repeatedly ignored
and rise when new evidence arrives, preventing both fixation and constant goal switching.
**Inspiration:** attention competition in LIDA/Global Workspace architectures. **First trial:**
maintain a small priority queue whose winner becomes the explicit focus of the next turn.

### 3. Cognitive Mode Configurator

Classify the current state as routine execution, exploration, diagnosis, planning, or verification,
then configure context depth, tool visibility, temperature, and review intensity for that mode.
Unlike static model routing, it changes the whole cognitive setup while preserving one task state.
**Inspiration:** LeCun’s configurable world-model architecture. **First trial:** implement five
transparent modes and switch only on observable events such as a failed prediction or test.

### 4. Fast–Slow Escalator

Start with a cheap direct action, but switch to explicit hypothesis search when uncertainty,
irreversibility, repeated failure, or dependency breadth crosses a threshold. Return to fast mode
once a plan step is well specified. **Inspiration:** dual-process theories and neuro-symbolic
fast/slow agent designs. **First trial:** use deterministic escalation rules rather than asking the
model whether it “feels” stuck.

### 5. Goal Shield

Keep an immutable, compact statement of the user’s objective, constraints, and evidence required
for completion; compare every proposed action against it before execution. It differs from a task
list by detecting locally sensible actions that move toward the wrong end state. **Inspiration:**
goal-state reflection and intention stability in cognitive architectures. **First trial:** emit a
one-line alignment verdict and block only clear contradictions.

### 6. Interruption Ledger

When a new error, request, or discovery interrupts ongoing work, record whether it replaces,
branches, postpones, or merely informs the active intention. Resume from the exact suspended state
instead of reconstructing intent from the transcript. **Inspiration:** goal stacks in Soar and
prospective memory. **First trial:** serialize suspended goals with resumption conditions and a
maximum nesting depth.

### 7. Attention Residue Cleaner

After changing subproblems, generate a fresh working set containing only the new goal, relevant
evidence, live assumptions, and pending decisions. Preserve the full trace for retrieval while
preventing stale instructions and failed approaches from priming the next step. **Inspiration:**
working-memory gating. **First trial:** remix `dsh-context-proxy` with goal-scoped context slices.

### 8. Focus Stability Modulator

Track how often the agent changes files, hypotheses, plans, or tools without resolving anything;
increase commitment when oscillation is high and encourage exploration when progress has plateaued.
**Inspiration:** Joscha Bach’s MicroPsi focus/selection-threshold modulators. **First trial:** adjust
the number of alternatives considered and require a reason for premature switching.

### 9. Resolution-Level Dial

Represent the same problem at multiple resolutions—objective, subsystem, symbol, line—and choose
the coarsest level that supports the current decision. This avoids both vague planning and
premature line-level fixation. **Inspiration:** MicroPsi’s resolution modulator and hierarchical
planning. **First trial:** require each working note to declare its level and permit zooming by one
level per action.

### 10. Internal–External Balance Governor

Balance deliberation against environment contact: after too much internal reasoning, require an
observation; after noisy tool output, require synthesis before another call. **Inspiration:**
MicroPsi’s balance between securing/exteroception and internal processing. **First trial:** enforce
soft budgets for consecutive reasoning-only and tool-only steps, with exceptions for atomic work.

## II. World models, causality, and imagination

### 11. Action–Outcome World Model

Learn a compact table of predicted effects for common actions in the current environment, then
compare actual outcomes with those predictions. Prediction errors update the model and become
high-salience evidence. **Inspiration:** model-based reinforcement learning and LeCun’s predictive
world models. **First trial:** model tool outcomes, changed artifacts, expected runtime, and likely
failure classes without trying to simulate raw text.

### 12. Counterfactual Patch Simulator

Before a consequential edit or command, simulate two or three plausible resulting states,
including second-order effects on callers, tests, interfaces, and stored data. Predictions are
explicitly labeled as hypotheses and checked after action. **Inspiration:** Hassabis’s account of
imagination as world-model rollouts. **First trial:** trigger only for high-blast-radius changes and
limit each rollout to a structured state delta.

### 13. Causal Graph Scratchpad

Build a temporary graph separating observed correlations, hypothesized causes, interventions, and
outcomes. The agent must state what edge an experiment would test before running it. **Inspiration:**
Pearl’s causal hierarchy. **First trial:** store typed edges with supporting evidence and delete
unsupported edges when interventions contradict them.

### 14. Abduction–Action–Prediction Loop

For debugging, force three distinct stages: infer hidden conditions that could explain the
observation, specify an intervention, then predict its result before executing it. This prevents a
plausible intervention from being mistaken for a diagnosis. **Inspiration:** structural
counterfactual reasoning. **First trial:** remix `dsh-pain-point-check` around a three-field card.

### 15. Competing World Models

Maintain several small explanations of the system rather than allowing one early story to dominate.
Each observation updates their support, and experiments are chosen partly for their ability to
discriminate between models. **Inspiration:** Bayesian model comparison and scientific inference.
**First trial:** cap the set at four models and require materially different predicted outcomes.

### 16. State Belief Tracker

Separate directly observed state from inferred, stale, or unknown state, especially after external
changes and partial tool output. Actions that depend on weak beliefs first seek confirming
observations. **Inspiration:** planning under partial observability. **First trial:** attach
provenance and freshness to key facts such as current branch, generated files, process status, and
dependency versions.

### 17. Invariant World Model

Infer properties that should remain stable across allowed transformations, then use them to reject
plans whose simulated outcomes violate those invariants. This is broader than test-first behavior
because invariants can cover interfaces, semantics, safety, and user intent. **Inspiration:**
abstract predictive representations. **First trial:** extract at most five invariants and demand
evidence for each.

### 18. Affordance Mapper

For each salient object—file, service, API, tool, data store—record what actions it supports, their
preconditions, and likely consequences. Planning then operates on available affordances rather than
free-form verbs. **Inspiration:** ecological psychology and agent-centric representation learning.
**First trial:** synthesize affordances from tool schemas, repository metadata, and observed
successes.

### 19. Temporal Horizon Stack

Maintain linked predictions for the next action, current subgoal, whole task, and likely maintenance
future. A plan is flagged when short-term gains conflict with a longer-horizon outcome.
**Inspiration:** hierarchical planning across time scales in DeepMind and LeCun’s H-JEPA proposal.
**First trial:** use four fixed horizons and update only the horizons affected by new evidence.

### 20. Surprise-to-Question Converter

Turn every substantial prediction error into a precise question about the world model before
allowing blind retries. The plugin distinguishes useful surprise from random noise by asking whether
the discrepancy is repeatable or decision-relevant. **Inspiration:** predictive processing and
Bayesian surprise. **First trial:** intercept repeated failed tool calls and create one falsifiable
question plus one cheapest probe.

## III. Memory and continual learning

### 21. Complementary Memory Pair

Store exact, rapidly written episodes separately from slowly consolidated semantic rules. Retrieval
can cite episodes, while reusable guidance is admitted only after repeated or strongly verified
support. **Inspiration:** Complementary Learning Systems theory from Kumaran, Hassabis, and
McClelland. **First trial:** remix `dsh-mneme` or `dsh-memory` into append-only episodes plus a small
reviewed playbook.

### 22. Goal-Weighted Replay

Periodically replay a diverse sample of past episodes weighted by current goals, unresolved errors,
and underrepresented outcomes, then extract candidate lessons. This avoids consolidating only
recent or emotionally salient failures. **Inspiration:** hippocampal replay in updated CLS theory.
**First trial:** replay on task boundaries and require every lesson to link back to episodes.

### 23. Pattern Separation Gate

Before merging a new experience with an old memory, compare their causal structure and boundary
conditions; retain a separate episode when differences could matter. This prevents a superficially
similar task from retrieving the wrong procedure. **Inspiration:** hippocampal pattern separation.
**First trial:** add contrastive “same because / different because” fields to memory admission.

### 24. Pattern Completion Retriever

Given a partial current situation, retrieve the smallest coherent past episode that completes the
missing structure, not merely the most textually similar chunk. Surface both the match and mismatched
conditions. **Inspiration:** hippocampal pattern completion. **First trial:** rerank semantic search
using shared goal, failure, intervention, and outcome fields.

### 25. Memory Reconsolidation

When a recalled memory is used and new evidence arrives, create a revised version while preserving
the original and its provenance. Confidence can rise, fall, or split by context. **Inspiration:**
reconstructive memory. **First trial:** version procedural notes and record which outcome triggered
each update.

### 26. Episodic Scene Builder

Encode episodes as coherent scenes containing goal, environment, actors/tools, constraints,
actions, and outcomes rather than isolated transcript snippets. This gives future planning a
structured situation to reconstruct. **Inspiration:** Hassabis’s scene-construction account of
episodic memory and imagination. **First trial:** generate a compact scene card at meaningful state
transitions.

### 27. Prospective Memory Triggers

Store future intentions with event-based triggers such as “after schema generation, inspect the
diff” or “when the server is healthy, run the smoke path.” The plugin activates intentions from
observed events instead of relying on the model to remember later. **Inspiration:** prospective
memory. **First trial:** support event, state, and deadline-free dependency triggers.

### 28. Forgetting-by-Utility

Decay memories based on failed retrieval value, redundancy, staleness, and changed environment
rather than age alone. Important rare lessons remain; repeatedly irrelevant notes disappear from
active retrieval but stay auditable. **Inspiration:** activation-based memory in ACT-R. **First trial:**
compute a transparent utility score from recency, use, outcome, and contradiction.

### 29. Contradiction-Aware Memory

On write and retrieval, identify memories that disagree and present the conflict rather than
silently choosing the nearest result. Resolve through current evidence, contextual branching, or
explicit uncertainty. **Inspiration:** belief revision. **First trial:** attach scope and validity
conditions to facts and procedures, then run lightweight contradiction checks.

### 30. Skill Compiler

Convert repeated successful action sequences into parameterized, inspectable skills with
preconditions, steps, checks, and abort conditions. Skills remain proposals until replayed
successfully in varied contexts. **Inspiration:** Soar chunking and procedural memory. **First trial:**
compile only sequences observed at least twice and expose them through progressive
disclosure.

## IV. Planning and search

### 31. Impasse-to-Subgoal

Detect specific impasse types—missing knowledge, conflicting operators, no progress, unmet
precondition—and create a bounded subgoal tailored to resolve the impasse. Close the subgoal as soon
as the parent decision becomes possible. **Inspiration:** Soar’s impasse-driven substates. **First trial:**
classify impasses deterministically from trace events and permit one nested subgoal.

### 32. Hierarchical Option Planner

Plan first with reusable high-level options, then expand only the selected option into concrete
actions. Completed sequences can become new options if they generalize. **Inspiration:** hierarchical
reinforcement learning and temporal abstraction. **First trial:** define options as typed contracts
with initiation conditions, termination conditions, and verification.

### 33. Search-and-Learn Controller

Treat reasoning strategies as candidates in a generate–test loop, record their utility, and allocate
more search to strategies that improve outcomes across tasks. Avoid hard-coding domain wisdom when
experience can select it. **Inspiration:** Sutton’s Bitter Lesson. **First trial:** choose among a
small set of general strategies and update utility only from external evidence.

### 34. Branch Budget Allocator

Distribute a fixed reasoning budget across alternative plans according to uncertainty, expected
value, information gain, and cost. Weak branches are pruned early; close contenders receive deeper
checks. **Inspiration:** best-first search and bounded rationality. **First trial:** expose a
three-branch tree with explicit budget accounting.

### 35. Reversible-First Planner

Order equally promising actions by reversibility, observability, and information gained, delaying
irreversible commitments until the model is stronger. This is a general action-selection prior, not
merely a safety block. **Inspiration:** value of information and robust planning. **First trial:**
annotate planned actions with rollback cost and expected evidence.

### 36. Plan Repairer

When reality diverges from a plan, preserve unaffected steps, revise invalid dependencies, and
explain the minimal repair instead of regenerating everything. This maintains continuity and makes
learning from prediction errors possible. **Inspiration:** continual planning. **First trial:**
represent plans as a dependency graph with observed pre/postconditions.

### 37. Constraint Propagation Planner

Extract hard constraints, soft preferences, dependencies, and forbidden states, then propagate them
through candidate plans before execution. Contradictions become explicit decisions rather than
late-stage failures. **Inspiration:** classical constraint satisfaction. **First trial:** combine
`dsh-specflow` with a machine-readable constraint ledger.

### 38. Means–Ends Difference Reducer

At each step, state the most important difference between current and goal state, choose an operator
that reduces it, and verify that it actually shrank. When no operator applies, create a precondition
subgoal. **Inspiration:** Newell and Simon’s General Problem Solver. **First trial:** use typed state
differences rather than unconstrained prose.

### 39. Landmark Planner

Identify states that every plausible successful path must pass through, then plan and verify around
those landmarks. This reduces long-horizon search without prescribing one full route. **Inspiration:**
AI planning landmarks. **First trial:** infer up to five evidence-backed landmarks and invalidate
them when a counterexample path appears.

### 40. Diverse Plan Portfolio

Generate plans that differ in mechanism, not wording—minimal intervention, architecture-aligned
change, compatibility bridge, or information-first investigation—then select using explicit
criteria. **Inspiration:** ensemble search and cognitive diversity. **First trial:** deduplicate
plans by affected components and causal hypothesis before scoring.

## V. Metacognition and calibrated reasoning

### 41. Confidence Ledger

Attach calibrated confidence, provenance, and a falsifier to decision-critical claims. Update
confidence from observations rather than rhetorical certainty. **Inspiration:** Bayesian
metacognition. **First trial:** track only the ten claims most likely to change the chosen action.

### 42. Unknowns Register

Maintain explicit known, inferred, unknown, and unknowable-for-now fields; block conclusions that
quietly depend on unresolved high-impact unknowns. Pair each actionable unknown with the cheapest
probe. **Inspiration:** epistemic logic and uncertainty-aware planning. **First trial:** integrate
with planning so probes compete with implementation actions.

### 43. Assumption Expiry

Give every assumption a scope, evidence link, and invalidation event; recheck it when dependencies
or external state change. This catches reasoning built on once-true repository or runtime facts.
**Inspiration:** truth-maintenance systems. **First trial:** automatically expire assumptions after
relevant writes, installs, process restarts, or user corrections.

### 44. Premise Guard Remix

Extend `dsh-premise-guard` from prompt-level checking into a live dependency graph from conclusions
to premises. New evidence can retract downstream conclusions and reopen decisions. **Inspiration:**
assumption-based truth maintenance. **First trial:** track only premises supporting planned
irreversible actions or completion claims.

### 45. Bias Counterweight

Detect trace-level signs of anchoring, confirmation search, sunk-cost persistence, availability, and
premature closure, then trigger a targeted countermeasure. It does not label the model’s internal
psychology; it reacts to observable behavior patterns. **Inspiration:** Kahneman and Stanovich.
**First trial:** implement one detector per bias with conservative thresholds.

### 46. Disconfirmation Seeker

For the leading hypothesis, propose the cheapest observation that would most strongly refute it.
Prefer discriminating tests over accumulating supportive examples. **Inspiration:** Popperian
falsification and diagnostic reasoning. **First trial:** pair every high-confidence diagnosis with
one rival and one discriminating probe.

### 47. Calibration Coach

Score prior predictions against outcomes using proper scoring rules, stratify by task and claim
type, and feed back a compact calibration adjustment. This teaches when the agent is over- or
under-confident without changing answers directly. **Inspiration:** probabilistic forecasting.
**First trial:** collect binary predictions about tool success, test outcomes, and completion.

### 48. Cognitive Load Meter

Estimate active goals, unresolved claims, context entropy, tool-schema burden, and dependency
breadth; simplify, externalize, or split work when load is high. **Inspiration:** bounded working
memory in ACT-R/Common Model of Cognition. **First trial:** expose a transparent load score and test
which interventions reduce errors rather than merely tokens.

### 49. Meta-Control Bandit

Learn which cognitive intervention—retrieve, plan, debate, verify, search, ask, or act—has the best
expected value in the current state. The bandit optimizes final outcomes net of cost, not agreement
with its own recommendations. **Inspiration:** rational metareasoning. **First trial:** start with
contextual features available without another model call.

### 50. Stop/Continue Arbiter

Decide whether more cognition is worth its expected value by comparing remaining uncertainty,
available probes, risk, and marginal progress. It can prevent both premature completion and endless
reflection. **Inspiration:** optimal stopping and bounded rationality. **First trial:** require
specific missing evidence to continue and specific completion evidence to stop.

## VI. Verification and scientific method

### 51. Prediction-Before-Action

Before each nontrivial action, record an observable expected result and what alternative outcomes
would imply. Compare immediately after execution. **Inspiration:** active inference and scientific
prediction. **First trial:** wrap state-changing tool calls and test invocations, skipping trivial
reads.

### 52. Evidence Coverage Matrix

Map every explicit requirement and invariant to the strongest available evidence, marking missing,
indirect, contradicted, or proven cells. Completion requires full relevant coverage, not merely a
green command. **Inspiration:** assurance cases. **First trial:** remix `dsh-proof` with
requirement-level evidence links.

### 53. Independent Reproduction

Have a clean verifier reproduce the reported behavior from declared setup steps, without access to
the solver’s persuasive narrative. Differences become actionable evidence. **Inspiration:**
reproducible science. **First trial:** replay in a fresh process or checkout with bounded cost.

### 54. Metamorphic Test Generator

When exact expected outputs are unavailable, derive transformations under which relevant behavior
should remain invariant or change predictably. This broadens verification beyond example tests.
**Inspiration:** metamorphic testing. **First trial:** generate transformations from interface
contracts and validate them for plausibility before execution.

### 55. Property Miner

Infer candidate algebraic, state, type, and lifecycle properties from code, docs, and examples,
then turn high-confidence properties into executable checks. **Inspiration:** property-based
testing. **First trial:** keep generated properties quarantined until they pass a human-readable
contract review.

### 56. Differential Oracle

Run two independent implementations, versions, configurations, or execution paths on generated
inputs and investigate meaningful disagreements. No side is presumed correct. **Inspiration:**
differential testing. **First trial:** use an existing stable path as comparison only where both
claim equivalent semantics.

### 57. Mutation Adequacy Probe

Make temporary, controlled faults and check whether the current evidence suite detects them; weak
suites trigger better tests before completion. Restore all mutations automatically. **Inspiration:**
mutation testing. **First trial:** mutate only directly changed logic and cap mutants tightly.

### 58. Boundary Cartographer

Derive input, state, concurrency, time, resource, and compatibility boundaries from interfaces and
exercise representative edges. This counters happy-path verification without encoding task-specific
answers. **Inspiration:** robust software testing. **First trial:** generate a boundary table before
selecting a small, risk-weighted subset.

### 59. Negative-Space Verifier

Ask what must *not* change—unrelated outputs, public APIs, permissions, performance class, persisted
data—and gather evidence for those non-effects. **Inspiration:** frame problems in action reasoning.
**First trial:** compare before/after observables outside the intended change footprint.

### 60. Evidence Freshness Guard

Invalidate verification evidence when later edits, dependency changes, generated artifacts, or
environment changes could affect it. The plugin computes dependency-aware staleness instead of
trusting old green results. **Inspiration:** incremental build systems and truth maintenance.
**First trial:** hash relevant inputs for each evidence item and rerun only stale checks.

## VII. Tool use and situated action

### 61. Tool Affordance Learner

Learn which tools succeed for which intent, environment, and argument shape from actual outcomes.
Retrieve a concise recommendation only when a matching intent appears. **Inspiration:** procedural
learning. **First trial:** log normalized tool intents, preconditions, result class, latency, and
recovery.

### 62. Progressive Tool Disclosure

Expose a minimal core toolset and reveal specialized tools only through semantic search or detected
need, keeping schemas out of the main context until useful. **Inspiration:** attentional bottlenecks.
**First trial:** remix `dsh-tool-search` with task-state-aware recommendations and measure selection
errors.

### 63. Action Precondition Checker

Before a tool call, verify required files, permissions, services, dependencies, identifiers, and
state assumptions using cheap checks. Explain failed preconditions and propose the smallest remedy.
**Inspiration:** STRIPS-style planning. **First trial:** extend `dsh-tool-validator` from dangerous
commands to typed preconditions.

### 64. Tool Result Normalizer

Convert heterogeneous outputs into a common observation envelope: status, changed state, key
facts, uncertainty, truncation, and next affordances. Preserve raw output by reference. **Inspiration:**
perceptual abstraction in cognitive architectures. **First trial:** normalize shell, search, test,
browser, and repository results.

### 65. Observation Completeness Detector

Detect truncation, sampling, pagination, stale caches, partial failures, and ambiguous success in
tool results before they are treated as complete. **Inspiration:** sensing under partial
observability. **First trial:** use tool metadata and content signatures, escalating only when the
missing portion can affect a decision.

### 66. Reversible Action Wrapper

For state-changing actions, capture a scoped before-state, execute, verify the delta, and expose a
safe rollback when feasible. The wrapper refuses to promise reversibility when it cannot provide it.
**Inspiration:** transactional action models. **First trial:** support file edits, generated
artifacts, configuration changes, and local process state.

### 67. Idempotence Planner

Prefer actions safe to retry and transform non-idempotent workflows into check-before-act steps.
This reduces damage from uncertain timeouts and interrupted sessions. **Inspiration:** distributed
systems reliability. **First trial:** classify tool calls and generate idempotency keys or state
checks where supported.

### 68. Tool Sequence Macro Learner

Discover recurring successful tool subsequences, parameterize them, and offer them as auditable
macros with stop conditions. Unlike unrestricted automation, each macro remains inspectable and
verifies intermediate state. **Inspiration:** procedural chunking. **First trial:** mine traces for
frequent sequences that transfer across at least two task families.

### 69. Information-Gain Tool Selector

When several observations are possible, estimate which tool call most reduces decision-relevant
uncertainty per unit cost. Choose direct action only when further information has low expected
value. **Inspiration:** active learning. **First trial:** score candidate reads, searches, tests, and
questions against the unknowns register.

### 70. Failure Recovery Automaton

Map common tool failure classes to bounded recovery policies—correct arguments, satisfy a
precondition, choose an alternative, wait for an explicit condition, or escalate. Prevent repeated
identical calls with no changed state. **Inspiration:** finite-state control and existing
`failure-notebook`/`tool-validator` remixes. **First trial:** learn recovery success statistics while
keeping hard retry caps.

## VIII. Multi-agent and social cognition

### 71. Role-Diverse Deliberation

Assign agents genuinely different evidence roles—causal modeler, constraint checker, empirical
probe designer, and maintainer—instead of asking identical solvers for opinions. Synthesize only
claims supported by role-relevant evidence. **Inspiration:** cognitive diversity. **First trial:**
remix `dsh-multi-agent-debate` with asymmetric briefs and one shared evidence table.

### 72. Belief-Merging Blackboard

Let agents post claims, evidence, conflicts, and proposed actions to a shared structured blackboard
without sharing all private reasoning. A coordinator resolves conflicts by gathering evidence, not
majority vote. **Inspiration:** blackboard systems and Global Workspace Theory. **First trial:** cap
posts and require provenance for every decision-changing claim.

### 73. Adversarial Collaboration

Pair a proposer and skeptic who pre-register what evidence would change their minds, jointly design
a discriminating experiment, and update after observing it. This replaces rhetorical debate with
cooperative falsification. **Inspiration:** adversarial collaboration in science. **First trial:**
allow one exchange before forcing a shared probe.

### 74. Theory-of-Mind Handoff

Before delegating, model what the recipient knows, lacks, can access, and is authorized to change;
construct the smallest self-contained handoff accordingly. On return, distinguish missing context
from reasoning failure. **Inspiration:** theory of mind. **First trial:** use a capability/context
matrix for subagents and tools.

### 75. Independent Localization Jury

Ask several cheap agents to independently identify the relevant subsystem and causal path, then
cluster answers by mechanism and investigate disagreement. Keep agents blind to earlier guesses to
avoid social anchoring. **Inspiration:** wisdom of crowds under independence. **First trial:** spend
parallelism on localization only when repository breadth justifies it.

### 76. Specialist Market

Specialists bid for tasks using declared capability, expected cost, confidence, and required
context; the coordinator assigns work and scores realized value afterward. Over time, allocation
adapts to empirical strengths. **Inspiration:** contract-net protocols and mixture-of-experts
routing. **First trial:** use fixed specialist profiles before learning bids.

### 77. Cross-Examination Verifier

The verifier asks the solver for the evidence behind selected claims, then checks those sources
directly and samples omitted risks. It never grades style or confidence. **Inspiration:** structured
peer review. **First trial:** choose claims by impact times uncertainty and limit questioning to
three rounds.

### 78. Consensus-with-Minority-Report

When agents converge, preserve the strongest evidence-backed dissent and the observation that would
vindicate it. Consensus controls action only after accounting for correlated assumptions.
**Inspiration:** fault-tolerant decision systems. **First trial:** detect shared evidence sources so
five copies of one premise do not count as five votes.

### 79. Teach-Back Delegate

After receiving a task, a delegate restates the objective, constraints, expected artifact, and
verification plan before acting; mismatches are corrected once. **Inspiration:** closed-loop
communication. **First trial:** trigger only for costly or ambiguous delegation and keep the
teach-back structured.

### 80. Collective Memory Curator

Separate private agent scratchpads from shared episodic and semantic memory; a curator admits only
verified, reusable knowledge and records dissent. This prevents one agent’s speculation from
becoming group fact. **Inspiration:** organizational memory and complementary learning systems.
**First trial:** require two independent evidence paths or direct reproducibility for shared rules.

## IX. Motivation, adaptation, and resource allocation

### 81. Cognitive Needs Regulator

Represent a small set of system needs—goal progress, competence, information, consistency, safety,
and resource reserve—as bounded signals that influence action selection. No need may override user
intent or safety constraints. **Inspiration:** Joscha Bach’s MicroPsi motivation model. **First trial:**
hand-design six transparent signals and test whether they reduce stagnation and thrashing.

### 82. Competence Progress Drive

Prefer subproblems where measured capability is improving, not merely tasks that are novel or easy.
Shift away when errors are random or no learning signal remains. **Inspiration:** intrinsic
motivation and learning progress. **First trial:** estimate progress from repeated prediction,
localization, and tool-use outcomes.

### 83. Compression-Progress Curiosity

Direct exploratory effort toward observations that make the system’s model simpler or more
predictive, avoiding both familiar data and irreducible noise. **Inspiration:** Schmidhuber’s
compression-progress account of curiosity. **First trial:** reward reductions in a compact model’s
description length or prediction error on held-out trace events.

### 84. Exploration Debt Meter

Track when the agent repeatedly exploits one familiar strategy despite unresolved uncertainty or
stagnation; accrue debt that can be paid by trying a meaningfully different probe. Exploration stays
bounded by risk and task relevance. **Inspiration:** exploration–exploitation control. **First trial:**
define diversity by causal intervention, not wording.

### 85. Frustration-to-Strategy Shift

Detect repeated unmet expectations and lower commitment to the current policy while widening
associative search or raising analysis depth. This functional “frustration” is a control signal, not
simulated emotion. **Inspiration:** MicroPsi cognitive modulators. **First trial:** connect failure
rate to focus, resolution, and exploration parameters with stable limits.

### 86. Resource Homeostasis

Continuously regulate token, time, context, tool, and parallelism reserves against expected
remaining work and risk. The plugin can compress, delegate, or narrow search before resources are
exhausted. **Inspiration:** homeostatic control and bounded rationality. **First trial:** use
forecasted rather than fixed per-step budgets.

### 87. Outcome-Based Strategy Evolution

Maintain a population of small, interpretable cognitive policies; vary one mechanism at a time and
retain variants that improve diverse held-out outcomes net of cost. Never optimize against a single
public benchmark or inspect evaluator internals. **Inspiration:** evolutionary search and
`dsh-evolve`. **First trial:** evolve trigger thresholds and workflow ordering across rotating task
families.

### 88. Error Curriculum Builder

Cluster naturally occurring failures by underlying cognitive deficit and schedule varied practice
that isolates weak capabilities while interleaving old ones. It must not train on held-out answers.
**Inspiration:** curriculum learning and deliberate practice. **First trial:** generate synthetic or
open-ended exercises from abstract failure schemas, then validate transfer elsewhere.

### 89. Strategy Utility Learner

Record when plans, prompts, tools, and verification methods helped or hurt, controlling for task
features and cost; surface the best-supported strategy for the current context. **Inspiration:**
ACT-R production utilities and reinforcement learning. **First trial:** use conservative updates and
retain uncertainty for rarely tried strategies.

### 90. Self-Generated Micro-Experiments

When evidence is scarce, invent a tiny safe experiment whose outcome teaches a reusable capability
or resolves a live uncertainty. Experiments compete on information value and reversibility.
**Inspiration:** artificial scientist architectures. **First trial:** sandbox generated experiments
and require an explicit learning target before execution.

## X. Abstraction, representation, and creative reasoning

### 91. Sparse Concept Workspace

Compress the current problem into a small set of explicit variables and relations that all
specialists can read and update. This creates a low-dimensional reasoning bottleneck without losing
raw evidence, which remains retrievable. **Inspiration:** Bengio’s consciousness prior. **First trial:**
allow at most seven active concepts and measure whether substitutions and compositions
become more reliable.

### 92. Relational Structure Mapper

Represent systems by roles and relations—producer/consumer, owner/resource, caller/callee,
invariant/transformation—so lessons can transfer despite different names and domains.
**Inspiration:** structure mapping and analogical reasoning. **First trial:** retrieve analogies by
relational graph match, then explicitly list where the analogy breaks.

### 93. Abstraction Ladder

Move deliberately among concrete observations, local patterns, reusable mechanisms, and general
principles; require links between adjacent levels. This prevents unsupported grand theories and
overly literal reuse. **Inspiration:** hierarchical representation learning. **First trial:** store
four-level explanation cards and test whether derived mechanisms transfer.

### 94. Causal Analogy Engine

Retrieve past cases with the same intervention–mechanism–outcome pattern, adapt the intervention to
the new environment, and predict where transfer may fail. **Inspiration:** case-based and analogical
reasoning. **First trial:** index episodes by causal roles rather than vocabulary.

### 95. Conceptual Blending Workshop

Combine two compatible mechanisms from different plugins, state the shared structure and tension,
then derive one minimal hybrid experiment. Reject blends that are only name-level mashups.
**Inspiration:** Hofstadter-style analogy and conceptual blending. **First trial:** remix pairs such
as world-model prediction plus evidence freshness, or global workspace plus specialist markets.

### 96. Minimal Sufficient Representation

Search for the smallest state summary that preserves the ability to choose the same good next
action. Add detail back only when counterexamples show it matters. **Inspiration:** information
bottleneck and abstract world models. **First trial:** compare action decisions under full and
compressed state on replayed traces.

### 97. Compositional Skill Algebra

Define how skills sequence, branch, retry, verify, compensate, and share outputs so new procedures
can be assembled from tested parts. Composition checks interface and invariant compatibility.
**Inspiration:** options, program synthesis, and System-2 compositionality. **First trial:** build a
small typed algebra around existing DSH remixes.

### 98. Representation Red-Team

Challenge whether the current framing omits actors, timescales, causal variables, constraints, or
alternative decompositions. Propose one re-representation and test whether it changes a decision.
**Inspiration:** frame problems and multiple representations in AI. **First trial:** trigger after
repeated failure or when all candidate plans share the same assumptions.

### 99. Explanatory Compression Judge

Prefer hypotheses that explain more observations with fewer unsupported assumptions while retaining
predictive accuracy; penalize both baroque stories and simplistic models that miss exceptions.
**Inspiration:** minimum description length. **First trial:** score competing diagnoses on evidence
coverage, complexity, and held-out predictions.

### 100. Architecture Composer

Given a task state, select a small cognitive pipeline from attention, memory, planning, search,
verification, and learning plugins; record why each component is present and ablate components over
time. The composer optimizes transfer and net value, not raw plugin count. **Inspiration:** common
models of cognition and DSH’s existing plugin-stack experiment loop. **First trial:** choose among a
few hand-audited pipelines, then learn routing only after enough diverse evidence exists.

## Research lineage and starting sources

These ideas translate broad mechanisms into testable plugins; they do not claim that a software
wrapper reproduces a biological faculty or validates a theory of consciousness.

- **Demis Hassabis, Dharshan Kumaran, Christopher Summerfield, and Matthew Botvinick,
  “Neuroscience-Inspired Artificial Intelligence” (2017):**
  https://doi.org/10.1016/j.neuron.2017.06.011
- **Demis Hassabis and Eleanor Maguire, “The Construction System of the Brain” (2009):**
  https://pmc.ncbi.nlm.nih.gov/articles/PMC2666702/
- **Dharshan Kumaran, Demis Hassabis, and James McClelland, “What Learning Systems do
  Intelligent Agents Need? Complementary Learning Systems Theory Updated” (2016):**
  https://doi.org/10.1016/j.tics.2016.05.004
- **Joscha Bach, “The MicroPsi Agent Architecture” (2003):**
  http://www.cognitive-ai.com/publications/assets/MicroPsiArchitectureICCM03.pdf
- **Joscha Bach, “Modeling Motivation in MicroPsi 2” (2015):**
  https://agi-conf.org/2015/wp-content/uploads/2015/07/agi15_bach.pdf
- **Yoshua Bengio, “The Consciousness Prior” (2017):**
  https://arxiv.org/abs/1709.08568
- **Yann LeCun, “A Path Towards Autonomous Machine Intelligence” (2022):**
  https://openreview.net/forum?id=BZ5a1r-kVsf
- **John Laird, “Introduction to Soar” (2022):**
  https://arxiv.org/abs/2205.03854
- **John Laird, “An Analysis and Comparison of ACT-R and Soar” (2022):**
  https://arxiv.org/abs/2201.09305
- **Richard Sutton, “The Bitter Lesson” (2019):**
  http://www.incompleteideas.net/IncIdeas/BitterLesson.html
- **Judea Pearl, “The Seven Tools of Causal Inference, with Reflections on Machine Learning”
  (2018):** https://ftp.cs.ucla.edu/pub/stat_ser/r481.pdf
- **Jürgen Schmidhuber, “Driven by Compression Progress” (2009):**
  https://people.idsia.ch/~juergen/driven2009.pdf
- **ReflAct, goal-state reflection for world-grounded decisions (2025):**
  https://aclanthology.org/2025.emnlp-main.1697/
- **AriGraph, semantic/episodic knowledge-graph world models (2025):**
  https://www.ijcai.org/proceedings/2025/0002

## Suggested experiment record

For each candidate, record:

1. the cognitive mechanism and exact trigger;
2. the baseline stack and single intervention;
3. diverse held-out task families and contamination controls;
4. task success plus token, latency, tool, and model-call costs;
5. calibration, recovery, and regression evidence;
6. interactions with already-kept plugins;
7. observed failure modes and a keep, revise, or drop decision.

The catalog is an experiment backlog, not a claim that all 100 plugins should be built or stacked
together.
