# DSH Intelligence Lab

This repo searches DeepSeek Harness plugin stacks against SWE-bench Lite.

- Default champion is the official `headless` profile with no extra plugins.
- Add one candidate at a time. Keep only if the 3-repeat mean clears the noise floor.
- After every N judged plugins, a review reorders the queue and can ablate a kept plugin.
- Dry-run scores are simulated from catalog priors. Never treat them as SWE-bench.
- Ideas are skipped in dry-run until they become an installable remix.
- Persist everything under `data/`. Use `pnpm lab:daemon` for unattended runs.
- Live mode must call `lab/swebench_adapter.py` and needs Docker plus a DeepSeek key.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
