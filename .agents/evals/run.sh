#!/usr/bin/env bash
# .agents/evals/run.sh
# Main evaluation runner for erxes Agent System
#
# Usage:
#   evals/run.sh <plugin> <module>
#
# Runs all checks:
#   - Build and lint
#   - Deliverables verification
#   - Rules compliance
#   - TypeScript compilation

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0

usage() {
  cat <<EOF
Usage: $(basename "$0") <plugin> <module>

Run comprehensive evaluation for a plugin module.

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
FRONTEND_PLUGIN="${PLUGIN}"
BACKEND_PLUGIN="${PLUGIN/_ui/_api}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         ERXES AGENT EVALUATION SUITE                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Plugin: ${PLUGIN}"
echo "Module: ${MODULE}"
echo "Started: $(date)"
echo ""

# ─── Phase 1: Build & Lint ───
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}🔨 PHASE 1: Build & Lint${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Frontend build
if [[ -d "${REPO_ROOT}/frontend/plugins/${FRONTEND_PLUGIN}" ]]; then
  echo "Building frontend: ${FRONTEND_PLUGIN}..."
  if pnpm nx build "${FRONTEND_PLUGIN}" > /tmp/eval-build-${FRONTEND_PLUGIN}.log 2>&1; then
    echo "${GREEN}✓${NC} Frontend build passed"
  else
    echo "${RED}✗${NC} Frontend build failed"
    echo "See: /tmp/eval-build-${FRONTEND_PLUGIN}.log"
    ERRORS=$((ERRORS + 1))
  fi
  
  echo "Linting frontend: ${FRONTEND_PLUGIN}..."
  if pnpm nx lint "${FRONTEND_PLUGIN}" > /tmp/eval-lint-${FRONTEND_PLUGIN}.log 2>&1; then
    echo "${GREEN}✓${NC} Frontend lint passed"
  else
    echo "${RED}✗${NC} Frontend lint failed"
    echo "See: /tmp/eval-lint-${FRONTEND_PLUGIN}.log"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Backend build
if [[ -d "${REPO_ROOT}/backend/plugins/${BACKEND_PLUGIN}" ]]; then
  echo ""
  echo "Building backend: ${BACKEND_PLUGIN}..."
  if pnpm nx build "${BACKEND_PLUGIN}" > /tmp/eval-build-${BACKEND_PLUGIN}.log 2>&1; then
    echo "${GREEN}✓${NC} Backend build passed"
  else
    echo "${RED}✗${NC} Backend build failed"
    echo "See: /tmp/eval-build-${BACKEND_PLUGIN}.log"
    ERRORS=$((ERRORS + 1))
  fi
fi

echo ""

# ─── Phase 2: Deliverables ───
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}📦 PHASE 2: Deliverables Verification${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if "${SCRIPT_DIR}/check-deliverables.sh" "${PLUGIN}" "${MODULE}"; then
  : # passed
else
  ERRORS=$((ERRORS + 1))
fi

echo ""

# ─── Phase 3: Rules Compliance ───
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}📋 PHASE 3: Rules Compliance${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

FRONTEND_MODULE="${REPO_ROOT}/frontend/plugins/${FRONTEND_PLUGIN}/src/modules/${MODULE}"
if [[ -d "${FRONTEND_MODULE}" ]]; then
  if "${SCRIPT_DIR}/check-rules.sh" "${FRONTEND_MODULE}"; then
    : # passed
  else
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "${YELLOW}⚠${NC} Frontend module not found, skipping rules check"
fi

echo ""

# ─── Phase 4: TypeScript ───
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}📘 PHASE 4: TypeScript Compilation${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [[ -d "${REPO_ROOT}/frontend/plugins/${FRONTEND_PLUGIN}" ]]; then
  echo "Type-checking frontend..."
  if (cd "${REPO_ROOT}/frontend/plugins/${FRONTEND_PLUGIN}" && npx tsc --noEmit) > /tmp/eval-tsc-${FRONTEND_PLUGIN}.log 2>&1; then
    echo "${GREEN}✓${NC} TypeScript check passed"
  else
    echo "${RED}✗${NC} TypeScript errors found"
    echo "See: /tmp/eval-tsc-${FRONTEND_PLUGIN}.log"
    ERRORS=$((ERRORS + 1))
  fi
fi

echo ""

# ─── Final Summary ───
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}📊 EVALUATION SUMMARY${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Plugin: ${PLUGIN}"
echo "Module: ${MODULE}"
echo "Finished: $(date)"
echo ""

if [[ ${ERRORS} -eq 0 ]]; then
  echo "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo "${GREEN}║  ✓ ALL EVALUATIONS PASSED                                  ║${NC}"
  echo "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Feature is complete and compliant. Ready for human review."
  exit 0
else
  echo "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
  echo "${RED}║  ✗ EVALUATION FAILED                                       ║${NC}"
  echo "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Total errors: ${ERRORS}"
  echo ""
  echo "Fix all errors before declaring feature complete."
  exit 1
fi
