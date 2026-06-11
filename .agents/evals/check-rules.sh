#!/usr/bin/env bash
# .agents/evals/check-rules.sh
# Verify that all non-negotiable rules are followed
#
# Usage:
#   check-rules.sh <path>
#
# Checks:
#   - Named exports only
#   - No atomic components
#   - No debug code
#   - No unused imports

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

error() {
  echo "${RED}✗${NC} $*" >&2
  ERRORS=$((ERRORS + 1))
}

warn() {
  echo "${YELLOW}⚠${NC} $*" >&2
  WARNINGS=$((WARNINGS + 1))
}

ok() {
  echo "${GREEN}✓${NC} $*"
}

usage() {
  cat <<EOF
Usage: $(basename "$0") <path>

Verify non-negotiable rules for files in path.

Example:
  $(basename "$0") frontend/plugins/content_ui/src/modules/cms/tags
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

TARGET_PATH="$1"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         RULES COMPLIANCE CHECK                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Path: ${TARGET_PATH}"
echo ""

# ─── Check 1: Named Exports Only ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 CHECK 1: Named Exports Only"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DEFAULT_EXPORTS=$(grep -r "export default" "${TARGET_PATH}" --include="*.ts" --include="*.tsx" || true)
if [[ -n "${DEFAULT_EXPORTS}" ]]; then
  error "Found default exports:"
  echo "${DEFAULT_EXPORTS}" | while read -r line; do
    if [[ -n "${line}" ]]; then
      echo "    ${line}"
    fi
  done
else
  ok "No default exports found"
fi
echo ""

# ─── Check 2: No Atomic Components ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧱 CHECK 2: No Atomic Components"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RADIX_IMPORTS=$(grep -r "import.*@radix-ui" "${TARGET_PATH}" --include="*.tsx" --include="*.ts" || true)

if [[ -n "${RADIX_IMPORTS}" ]]; then
  error "Found direct @radix-ui imports:"
  echo "${RADIX_IMPORTS}" | while read -r line; do
    if [[ -n "${line}" ]]; then
      echo "    ${line}"
    fi
  done
else
  ok "No direct @radix-ui imports found"
fi
echo ""

# ─── Check 3: No Debug Code ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐛 CHECK 3: No Debug Code"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DEBUG_CODE=$(grep -r "console\.log\|console\.warn\|console\.error\|debugger;" "${TARGET_PATH}" --include="*.ts" --include="*.tsx" || true)
if [[ -n "${DEBUG_CODE}" ]]; then
  error "Found debug code:"
  echo "${DEBUG_CODE}" | while read -r line; do
    if [[ -n "${line}" ]]; then
      echo "    ${line}"
    fi
  done
else
  ok "No debug code found"
fi
echo ""

# ─── Check 4: No Commented Dead Code ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💀 CHECK 4: No Commented Dead Code"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Look for large blocks of commented code (more than 3 consecutive commented lines)
DEAD_CODE=$(awk '/^\/\//{count++} /^[^\/\/]/{if(count>3) print count " lines"; count=0}' "${TARGET_PATH}"/*.ts "${TARGET_PATH}"/*.tsx 2>/dev/null | head -5 || true)
if [[ -n "${DEAD_CODE}" ]]; then
  warn "Possible dead code blocks found:"
  echo "${DEAD_CODE}" | while read -r line; do
    if [[ -n "${line}" ]]; then
      echo "    ${line}"
    fi
  done
else
  ok "No dead code blocks found"
fi
echo ""

# ─── Check 5: GraphQL Naming ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 CHECK 5: GraphQL Operation Names"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ -d "${TARGET_PATH}/graphql" ]]; then
  # Check for unnamed operations
  UNNAMED=$(grep -r "gql\`" "${TARGET_PATH}/graphql" --include="*.ts" | grep -v "export const " || true)
  if [[ -n "${UNNAMED}" ]]; then
    error "Found potentially unnamed operations:"
    echo "${UNNAMED}" | head -3 | while read -r line; do
      echo "    ${line}"
    done
  else
    ok "All operations appear named"
  fi
else
  ok "No graphql directory - skipping check"
fi
echo ""

# ─── Summary ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 COMPLIANCE SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ ${ERRORS} -eq 0 ]] && [[ ${WARNINGS} -eq 0 ]]; then
  echo "${GREEN}✓ ALL RULES FOLLOWED${NC}"
  exit 0
elif [[ ${ERRORS} -eq 0 ]]; then
  echo "${YELLOW}✓ COMPLIANT WITH WARNINGS${NC}"
  echo "Warnings: ${WARNINGS}"
  exit 0
else
  echo "${RED}✗ RULES VIOLATED${NC}"
  echo "Errors: ${ERRORS}"
  echo "Warnings: ${WARNINGS}"
  exit 1
fi
