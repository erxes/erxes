#!/usr/bin/env bash
# .agents/evals/check-deliverables.sh
# Verify that all deliverables in the checklist are actually complete
#
# Usage:
#   check-deliverables.sh <plugin> <module>
#
# Checks:
#   - Components exist
#   - Exports are named (not default)
#   - GraphQL operations exist
#   - Real-time updates are implemented
#   - No atomic components used

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
Usage: $(basename "$0") <plugin> <module>

Verify deliverables for a plugin module.

Example:
  $(basename "$0") content_ui cms/tags
EOF
}

if [[ $# -lt 2 ]]; then
  usage
  exit 1
fi

PLUGIN="$1"
MODULE="$2"
FRONTEND_DIR="${REPO_ROOT}/frontend/plugins/${PLUGIN}/src/modules/${MODULE}"
BACKEND_DIR="${REPO_ROOT}/backend/plugins/${PLUGIN/_ui/_api}/src/modules/${MODULE}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         DELIVERABLES VERIFICATION                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Plugin: ${PLUGIN}"
echo "Module: ${MODULE}"
echo ""

# ─── Check 1: Components Exist ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 CHECK 1: Components"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ -d "${FRONTEND_DIR}" ]]; then
  ok "Module directory exists: ${FRONTEND_DIR}"
  
  # Check for common components
  COMPONENTS=$(find "${FRONTEND_DIR}" -name "*.tsx" -not -name "*.test.tsx" | sort)
  if [[ -n "${COMPONENTS}" ]]; then
    echo ""
    echo "Components found:"
    echo "${COMPONENTS}" | while read -r comp; do
      echo "  • $(basename ${comp})"
    done
  else
    error "No components found in ${FRONTEND_DIR}"
  fi
else
  error "Module directory not found: ${FRONTEND_DIR}"
fi
echo ""

# ─── Check 2: Named Exports Only ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 CHECK 2: Named Exports"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ -d "${FRONTEND_DIR}" ]]; then
  DEFAULT_EXPORTS=$(grep -r "export default" "${FRONTEND_DIR}" || true)
  if [[ -n "${DEFAULT_EXPORTS}" ]]; then
    error "Found default exports (FORBIDDEN):"
    echo "${DEFAULT_EXPORTS}" | while read -r line; do
      echo "    ${line}"
    done
  else
    ok "No default exports found"
  fi
else
  warn "Cannot check exports - frontend directory not found"
fi
echo ""

# ─── Check 3: No Atomic Components ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧱 CHECK 3: No Atomic Components"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ -d "${FRONTEND_DIR}" ]]; then
  # Check for forbidden imports - @radix-ui direct usage
  FORBIDDEN=$(grep -r "import.*@radix-ui" "${FRONTEND_DIR}" --include="*.tsx" --include="*.ts" || true)
  
  if [[ -n "${FORBIDDEN}" ]]; then
    error "Found direct @radix-ui imports (FORBIDDEN):"
    echo "${FORBIDDEN}" | while read -r line; do
      if [[ -n "${line}" ]]; then
        echo "    ${line}"
      fi
    done
  else
    ok "No direct @radix-ui imports found"
  fi
else
  warn "Cannot check components - frontend directory not found"
fi
echo ""

# ─── Check 4: GraphQL Operations ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 CHECK 4: GraphQL Operations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

GRAPHQL_DIR="${FRONTEND_DIR}/graphql"
if [[ -d "${GRAPHQL_DIR}" ]]; then
  ok "GraphQL directory exists"
  
  QUERIES=$(find "${GRAPHQL_DIR}" -name "*.ts" | wc -l | tr -d ' ')
  ok "Found ${QUERIES} GraphQL files"
else
  warn "No graphql directory found at ${GRAPHQL_DIR}"
fi
echo ""

# ─── Check 5: Real-Time Updates ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 CHECK 5: Real-Time Updates"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ -d "${FRONTEND_DIR}" ]]; then
  # Check for cache update patterns
  CACHE_PATTERNS=(
    "updateQuery"
    "refetch"
    "subscribeToMore"
    "cache.modify"
    "cache.updateQuery"
  )
  
  FOUND=0
  for pattern in "${CACHE_PATTERNS[@]}"; do
    if grep -rq "${pattern}" "${FRONTEND_DIR}"; then
      FOUND=$((FOUND + 1))
    fi
  done
  
  if [[ ${FOUND} -gt 0 ]]; then
    ok "Found ${FOUND} cache update patterns"
  else
    error "No cache update patterns found - mutations may not update UI"
  fi
else
  warn "Cannot check cache updates - frontend directory not found"
fi
echo ""

# ─── Check 6: Backend Schema ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏗️  CHECK 6: Backend Schema"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ -d "${BACKEND_DIR}" ]]; then
  ok "Backend module directory exists"
  
  # Check for schema definitions
  SCHEMAS=$(find "${BACKEND_DIR}" -path "*/db/definitions/*.ts" | wc -l | tr -d ' ')
  if [[ ${SCHEMAS} -gt 0 ]]; then
    ok "Found ${SCHEMAS} schema definition(s)"
  else
    warn "No schema definitions found in db/definitions/"
  fi
  
  # Check for schemaWrapper (FORBIDDEN)
  if grep -rq "schemaWrapper" "${BACKEND_DIR}"; then
    error "Found schemaWrapper usage (FORBIDDEN)"
  else
    ok "No schemaWrapper usage found"
  fi
else
  warn "Backend directory not found: ${BACKEND_DIR}"
fi
echo ""

# ─── Summary ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ ${ERRORS} -eq 0 ]] && [[ ${WARNINGS} -eq 0 ]]; then
  echo "${GREEN}✓ ALL CHECKS PASSED${NC}"
  echo ""
  echo "Deliverables are complete and compliant."
  exit 0
elif [[ ${ERRORS} -eq 0 ]]; then
  echo "${YELLOW}✓ PASSED WITH WARNINGS${NC}"
  echo ""
  echo "Warnings: ${WARNINGS}"
  echo "Review warnings above."
  exit 0
else
  echo "${RED}✗ VERIFICATION FAILED${NC}"
  echo ""
  echo "Errors: ${ERRORS}"
  echo "Warnings: ${WARNINGS}"
  echo ""
  echo "Fix errors above before declaring feature complete."
  exit 1
fi
