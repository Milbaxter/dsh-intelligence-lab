#!/usr/bin/env bash
set -euo pipefail
export DSH_HOME="${DSH_HOME:?set DSH_HOME to an isolated home}"
export DSH_MODEL="deepseek-v4-flash"
dsh --profile headless --dump-default-config >/dev/null
dsh plugin --profile headless add github:PerryLink/dsh-doublecheck
dsh plugin --profile headless add github:EvilIrving/dsh-proof
dsh plugin --profile headless add github:Areium/dsh-fail-logger
dsh plugin --profile headless add github:Optim-Agent/dsh-plans
dsh plugin --profile headless add github:lmst2/dsh-asc
