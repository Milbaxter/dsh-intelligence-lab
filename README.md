# DSH Intelligence Lab

Autonomous search over [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugins, scored on [SWE-bench Lite](https://www.swebench.com/lite.html).

The loop is greedy and explicit:

1. Measure the **default DSH plugin set** (the `headless` profile) three times on a cheap model.
2. Add **one** candidate from the queue — community plugin, local remix, or a brainstormed idea.
3. Score that stack three times.
4. **Keep** it only if the mean resolve rate clears a noise floor (margin + pooled standard error).
5. Otherwise **drop** it and keep the previous champion.
6. Every 6 judged plugins, a smarter model writes a **meta-review** of the whole stack.

All state lives in `data/` so a self-hosted machine can run the expensive part and commit the scores back to this repo.

## What is in the box

- A dashboard for the champion, queue, catalog, runs, reviews, and new plugin ideas.
- 45 community plugins chosen because they might raise *intelligence* (verification, planning, memory, code search). UI skins and pets are not in the queue.
- 9 local remixes under `remixes/` — edits of existing ideas: test-first gates, smallest-patch prior, failure notebook, no-web ablation.
- [100 generalizable plugin ideas](plugin-ideas/README.md) inspired by cognitive architectures,
  AGI research, and practical remixes, with no benchmark-specific or evaluator-targeting methods.
- A dry-run scorer so the loop is usable before Docker, SWE-bench images, and API keys exist.
- A live adapter (`lab/swebench_adapter.py`) that drives DeepSeek Harness and `swebench.harness.run_evaluation`.

## Run the dashboard

```bash
npm install
npm run dev
```

Open http://127.0.0.1:43173

## Run the loop

```bash
# Simulated scores — no API spend. Recovers catalog priors plus noise.
pnpm lab:run -- --steps 12 --mode dry

# Intelligence wave from the awesome-dsh plugin list
pnpm lab:prioritize -- --wave intel
pnpm lab:run -- --steps 8 --mode dry

# Unattended worker: lock, crash resume, optional git commit after each trial
pnpm lab:daemon -- --mode dry
# pnpm lab:stop

# Real SWE-bench Lite (needs Docker + DEEPSEEK_API_KEY)
export DEEPSEEK_API_KEY=sk-...
python3 lab/swebench_adapter.py --smoke
python3 lab/swebench_adapter.py --prepare-split lite50
pnpm lab:prioritize
pnpm lab:daemon -- --mode live --auto-commit
```

Dry-run is the default. It is **not** SWE-bench. It exists so keep/drop, ablation, overlays, and meta-reviews can be tested in minutes. The dashboard banners simulated scores. Ideas are skipped in dry-run so a pitch cannot fake a win.

## Cursor worker

This cloud agent cannot register a My Machines worker. On a Docker box you own:

```bash
./scripts/start-cursor-worker.sh          # agent worker start --name dsh-lab
# other terminal
export DEEPSEEK_API_KEY=sk-...
./scripts/bootstrap-lab-machine.sh        # live daemon on deepseek-v4-flash
```

Then send Cloud Agents to `worker=dsh-lab`.

SWE-bench scoring is hard-pinned to a cheap model (`deepseek-v4-flash` by default). `deepseek-v4-pro` and other smart models are rejected for eval and may only be used for meta-review.

This cloud session cannot register a My Machines worker. Run the scripts above on a Docker box you own. The lab records a heartbeat in `data/worker-status.json` whenever the CLI or dashboard runs a step.

Full Lite is 300 instances × 3 repeats per plugin. Start on `lite50` until the decision rule and the DSH overlays are trustworthy.

## Decision rule

A candidate is kept when

```
mean(candidate) - mean(champion) > max(0.50 pp, 0.75 × pooled SE)
```

With `n=3`, that ignores one-repeat luck without demanding a 300-instance confidence interval on every plugin.

## Layout

```
src/lib/lab/     loop, scorer, decision, catalog
lab/             CLI + SWE-bench adapter
scripts/         Cursor worker + live-machine bootstrap
remixes/         local DSH plugins under test
plugin-ideas/    100 generalizable cognitive-plugin experiments
data/            experiment.json, catalog, ideas, splits, run overlays
```

## Tests

```bash
npm test
```
