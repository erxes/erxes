#!/usr/bin/env bash
# .agents/evals/run.sh — runnable verification for sales (and other plugins).
#
# Usage:
#   evals/run.sh sales              # backend + frontend build + tests
#   evals/run.sh sales --backend-only
#   evals/run.sh sales --frontend-only
#   evals/run.sh sales --include-e2e   # also runs Playwright suite for this plugin
#   evals/run.sh sales --help
#
# Exit codes:
#   0  — all checks passed
#   1  — a check failed (look at stderr for which)
#   2  — invalid arguments / unknown plugin
#
# AI: this is the "done" oracle. If it exits non-zero, you are not done.

set -euo pipefail

usage() {
  cat <<EOF
Usage: $(basename "$0") <plugin> [--backend-only|--frontend-only] [--include-e2e]

Plugins:
  sales            ← supported today
  operation, frontline, accounting, content, insurance,
  loyalty, mongolian, payment, posclient, tourism
                   ← scaffolded but not validated; flag will warn

Examples:
  $(basename "$0") sales
  $(basename "$0") sales --backend-only
  $(basename "$0") sales --include-e2e
EOF
}

if [[ $# -eq 0 ]] || [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

PLUGIN="$1"
shift

BACKEND_ONLY=0
FRONTEND_ONLY=0
INCLUDE_E2E=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backend-only)  BACKEND_ONLY=1 ;;
    --frontend-only) FRONTEND_ONLY=1 ;;
    --include-e2e)   INCLUDE_E2E=1 ;;
    --help|-h)       usage; exit 0 ;;
    *) echo "Unknown flag: $1" >&2; usage; exit 2 ;;
  esac
  shift
done

# Find repo root (this script lives at .agents/evals/run.sh)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

# Validate plugin
SUPPORTED_PLUGINS=(sales operation frontline accounting content insurance loyalty mongolian payment posclient tourism)
if ! printf '%s\n' "${SUPPORTED_PLUGINS[@]}" | grep -qx "${PLUGIN}"; then
  echo "Unknown plugin: ${PLUGIN}" >&2
  echo "Supported: ${SUPPORTED_PLUGINS[*]}" >&2
  exit 2
fi


# Step counter for output clarity
STEP=0
say() { STEP=$((STEP + 1)); echo "─── [${STEP}] $* ───"; }
ok()  { echo "    ✓ $*"; }
die() { echo "    ✗ $*" >&2; exit 1; }

API_NX_NAME="${PLUGIN}_api"
UI_NX_NAME="${PLUGIN}_ui"
# posclient has no UI (it's served by the standalone app)
[[ "${PLUGIN}" == "posclient" ]] && FRONTEND_ONLY=0 && UI_NX_NAME=""

# erxes-api-shared must build first if backend involved
if [[ ${FRONTEND_ONLY} -eq 0 ]]; then
  say "Build erxes-api-shared (prereq for backend plugins)"
  pnpm nx build erxes-api-shared > /tmp/run.sh.shared.log 2>&1 || die "erxes-api-shared build failed — see /tmp/run.sh.shared.log"
  ok "erxes-api-shared built"
fi

# Backend build
if [[ ${FRONTEND_ONLY} -eq 0 ]]; then
  say "Build ${API_NX_NAME}"
  pnpm nx build "${API_NX_NAME}" > /tmp/run.sh.api.log 2>&1 || die "${API_NX_NAME} build failed — see /tmp/run.sh.api.log"
  ok "${API_NX_NAME} built"
fi

# Backend tests (only if the project has tests configured)
if [[ ${FRONTEND_ONLY} -eq 0 ]]; then
  if pnpm nx show project "${API_NX_NAME}" --json 2>/dev/null | grep -q '"test"'; then
    say "Test ${API_NX_NAME}"
    pnpm nx test "${API_NX_NAME}" > /tmp/run.sh.api-test.log 2>&1 || die "${API_NX_NAME} tests failed — see /tmp/run.sh.api-test.log"
    ok "${API_NX_NAME} tests passing"
  else
    echo "    ⚠ ${API_NX_NAME} has no test target — skipping"
  fi
fi

# Frontend build
if [[ ${BACKEND_ONLY} -eq 0 ]] && [[ -n "${UI_NX_NAME}" ]]; then
  say "Build ${UI_NX_NAME}"
  pnpm nx build "${UI_NX_NAME}" > /tmp/run.sh.ui.log 2>&1 || die "${UI_NX_NAME} build failed — see /tmp/run.sh.ui.log"
  ok "${UI_NX_NAME} built"
fi

# Playwright (opt-in)
if [[ ${INCLUDE_E2E} -eq 1 ]]; then
  say "Run Playwright specs for plugins/${PLUGIN}"
  TEST_DIR="${REPO_ROOT}/.agents/plugins/${PLUGIN}/tests"
  if [[ ! -d "${TEST_DIR}" ]]; then
    echo "    ⚠ No tests dir at ${TEST_DIR} — skipping"
  elif [[ ! -d "${REPO_ROOT}/.agents/node_modules/@playwright" ]]; then
    die "Playwright not installed in .agents/. Run: cd .agents && pnpm install --ignore-workspace && pnpm exec playwright install"
  else
    (cd "${REPO_ROOT}/.agents" && pnpm test "plugins/${PLUGIN}/tests") || die "Playwright suite failed"
    ok "Playwright passing"
  fi
fi

echo ""
echo "✓ All checks passed for plugin: ${PLUGIN}"
