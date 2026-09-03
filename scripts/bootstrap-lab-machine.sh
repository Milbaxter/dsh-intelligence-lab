#!/usr/bin/env bash
# One-time bootstrap for a lab machine: deps, then the live daemon.
# Requires DEEPSEEK_API_KEY. Docker must already be installed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${DEEPSEEK_API_KEY:-}" ]]; then
  echo "Export DEEPSEEK_API_KEY first (DeepSeek flash key, not a Cursor key)." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Install Docker Engine, then rerun." >&2
  exit 1
fi

python3 -m pip install --upgrade pip
python3 -m pip install -r lab/requirements.txt
npm install
python3 lab/swebench_adapter.py --smoke
python3 lab/swebench_adapter.py --prepare-split lite50

echo "Starting the unattended live loop on deepseek-v4-flash..."
exec npx tsx lab/cli.ts daemon --mode live --model deepseek-v4-flash --auto-commit
