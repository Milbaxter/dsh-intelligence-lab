# Local remixes

These are small DeepSeek Harness plugins that live in this repo. The loop treats them like any other candidate: install with `dsh plugin --profile headless add file:remixes/<name>`, then keep or drop from the SWE-bench score.

Each remix is intentionally narrow. They exist to test *edits* of the default stack and of community plugins, not to become another marketplace.

User-batch remixes:

- `tool-validator` — reject destructive/repeated bash before retry
- `multi-agent-debate` — two cheap-model localizations, pick one (no Claude)