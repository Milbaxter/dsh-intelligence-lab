#!/usr/bin/env bash
set -euo pipefail
export DSH_HOME="${DSH_HOME:?set DSH_HOME to an isolated home}"
dsh --profile headless --dump-default-config >/dev/null
dsh plugin --profile headless add github:EvilIrving/dsh-proof
dsh plugin --profile headless add github:Areium/dsh-fail-logger
