#!/usr/bin/env bash
# Register this machine as a Cursor My Machines worker for the DSH lab.
# Run it on a box you own (Docker + outbound HTTPS). This cloud VM cannot
# log into your Cursor account, so it cannot complete the registration for you.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="${CURSOR_WORKER_NAME:-dsh-lab}"

if ! command -v agent >/dev/null 2>&1; then
  echo "Installing the Cursor CLI..."
  curl https://cursor.com/install -fsS | bash
  export PATH="$HOME/.local/bin:$PATH"
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "The Cursor CLI is not on PATH after install. Open a new shell and retry." >&2
  exit 1
fi

echo "Starting Cursor worker '$NAME' for $ROOT"
echo "Keep this process running. Then pick this machine in cursor.com/agents."

if [[ -n "${CURSOR_API_KEY:-}" ]]; then
  exec agent worker start --name "$NAME" --worker-dir "$ROOT" --api-key "$CURSOR_API_KEY"
fi

exec agent worker start --name "$NAME" --worker-dir "$ROOT"
