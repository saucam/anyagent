#!/usr/bin/env bash
#
# demo.sh — the canonical anyagent demo, run against a throwaway workspace.
#
# Used to (a) sanity-check the happy path and (b) drive the README terminal
# recording. Deterministic: same output every run. Requires a build first
# (`npm run build`) or run with DEMO_CMD="npx anyagent".
#
#   ./scripts/demo.sh
#
set -euo pipefail

DEMO_CMD="${DEMO_CMD:-node $(cd "$(dirname "$0")/.." && pwd)/dist/cli.js}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

run() { printf '\n$ anyagent %s\n' "$*"; $DEMO_CMD "$@"; }

run init --root "$WORK"
run doctor --root "$WORK"
run sync --root "$WORK" --to codex gemini cursor
run check --root "$WORK" --to codex gemini cursor
