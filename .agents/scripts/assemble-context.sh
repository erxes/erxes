#!/usr/bin/env bash
# .agents/scripts/assemble-context.sh
# Context Auto-Assembly Script for the erxes Agent Manifest Protocol
#
# Usage:
#   assemble-context.sh <working-path> [skill-name]
#
# Examples:
#   assemble-context.sh frontend/plugins/content_ui/src/modules/cms
#   assemble-context.sh backend/plugins/sales_api/src/modules/deals create-backend-entity
#
# Output: Structured context block showing all rules and skills to load

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
MANIFEST="${REPO_ROOT}/.agents/manifest.yaml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

usage() {
  cat <<EOF
Usage: $(basename "$0") <working-path> [skill-name]

Assemble the complete working context for a task.

Arguments:
  working-path    Path to the directory or file being worked on
  skill-name      Optional: Name of the skill being used

Examples:
  $(basename "$0") frontend/plugins/content_ui/src/modules/cms
  $(basename "$0") backend/plugins/sales_api/src/modules/deals create-backend-entity
  $(basename "$0") . create-page

EOF
}

if [[ $# -eq 0 ]] || [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

WORKING_PATH="$1"
SKILL_NAME="${2:-}"

# Resolve working path
if [[ ! "${WORKING_PATH}" = /* ]]; then
  WORKING_PATH="${REPO_ROOT}/${WORKING_PATH}"
fi

WORKING_PATH="$(cd "$(dirname "${WORKING_PATH}")" && pwd)/$(basename "${WORKING_PATH}")"

# Check manifest exists
if [[ ! -f "${MANIFEST}" ]]; then
  echo "${RED}Error: manifest.yaml not found at ${MANIFEST}${NC}" >&2
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           ERXES AGENT CONTEXT ASSEMBLY v1.0                      ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Working path: ${WORKING_PATH}"
if [[ -n "${SKILL_NAME}" ]]; then
  echo "Skill: ${SKILL_NAME}"
fi
echo ""

# ─── Step 0: Consult Semantic Index ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 STEP 0: SKILL DISCOVERY (Recommended)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Consult .agents/skills/SEMANTIC_INDEX.md for complex intents,"
echo "orchestration sequences, and troubleshooting (404s, loading errors)."
echo ""

# ─── Step 1: Load Constitution ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📜 STEP 1: CONSTITUTION (Required)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "File: AGENTS.md"
echo "Precedence: 0 (highest authority)"
echo "Scope: Global"
echo ""

# ─── Step 2: Load Global Rules ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 2: GLOBAL RULES (Required)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RULES_DIR="${REPO_ROOT}/.agents/rules"
if [[ -d "${RULES_DIR}" ]]; then
  while IFS= read -r rule_file; do
    rule_name=$(basename "${rule_file}" .md)
    echo "  ✓ ${rule_name}.md"
  done < <(find "${RULES_DIR}" -name "*.md" -not -name "README.md" | sort)
fi
echo ""

# ─── Step 3: Identify Plugin ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 STEP 3: PLUGIN IDENTIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PLUGIN_NAME=""
PLUGIN_TYPE=""
PLUGIN_PATH=""

# Check if working in frontend plugin
if [[ "${WORKING_PATH}" == *"frontend/plugins/"* ]]; then
  PLUGIN_TYPE="frontend"
  PLUGIN_PATH=$(echo "${WORKING_PATH}" | sed -n 's|.*frontend/plugins/\([^/]*\).*|frontend/plugins/\1|p')
  PLUGIN_NAME=$(basename "${PLUGIN_PATH}" | sed 's/_ui$//')
  echo "  Type: Frontend Plugin"
  echo "  Name: ${PLUGIN_NAME}"
  echo "  Path: ${PLUGIN_PATH}"

# Check if working in backend plugin
elif [[ "${WORKING_PATH}" == *"backend/plugins/"* ]]; then
  PLUGIN_TYPE="backend"
  PLUGIN_PATH=$(echo "${WORKING_PATH}" | sed -n 's|.*backend/plugins/\([^/]*\).*|backend/plugins/\1|p')
  PLUGIN_NAME=$(basename "${PLUGIN_PATH}" | sed 's/_api$//')
  echo "  Type: Backend Plugin"
  echo "  Name: ${PLUGIN_NAME}"
  echo "  Path: ${PLUGIN_PATH}"

# Check if working in shared library
elif [[ "${WORKING_PATH}" == *"frontend/libs/"* ]]; then
  PLUGIN_TYPE="shared-frontend"
  PLUGIN_PATH=$(echo "${WORKING_PATH}" | sed -n 's|.*frontend/libs/\([^/]*\).*|frontend/libs/\1|p')
  PLUGIN_NAME=$(basename "${PLUGIN_PATH}")
  echo "  Type: Shared Frontend Library"
  echo "  Name: ${PLUGIN_NAME}"
  echo "  Path: ${PLUGIN_PATH}"

elif [[ "${WORKING_PATH}" == *"backend/erxes-api-shared"* ]]; then
  PLUGIN_TYPE="shared-backend"
  PLUGIN_PATH="backend/erxes-api-shared"
  PLUGIN_NAME="erxes-api-shared"
  echo "  Type: Shared Backend Library"
  echo "  Name: ${PLUGIN_NAME}"
  echo "  Path: ${PLUGIN_PATH}"

else
  echo "  ⚠ No specific plugin identified"
  echo "  Working in general repository area"
fi
echo ""

# ─── Step 4: Load Category Rules ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📂 STEP 4: CATEGORY RULES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ "${PLUGIN_TYPE}" == "frontend" ]] || [[ "${PLUGIN_TYPE}" == "shared-frontend" ]]; then
  CATEGORY_RULES="${REPO_ROOT}/frontend/plugins/AGENTS.md"
  if [[ -f "${CATEGORY_RULES}" ]]; then
    echo "  ✓ frontend/plugins/AGENTS.md (Precedence: 200)"
  else
    echo "  ⚠ frontend/plugins/AGENTS.md not found"
  fi
elif [[ "${PLUGIN_TYPE}" == "backend" ]] || [[ "${PLUGIN_TYPE}" == "shared-backend" ]]; then
  CATEGORY_RULES="${REPO_ROOT}/backend/plugins/AGENTS.md"
  if [[ -f "${CATEGORY_RULES}" ]]; then
    echo "  ✓ backend/plugins/AGENTS.md (Precedence: 200)"
  else
    echo "  ⚠ backend/plugins/AGENTS.md not found"
  fi
else
  echo "  ℹ No category rules applicable"
fi
echo ""

# ─── Step 5: Load Plugin-Specific Rules ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 STEP 5: PLUGIN-SPECIFIC RULES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ -n "${PLUGIN_PATH}" ]]; then
  PLUGIN_RULES="${REPO_ROOT}/${PLUGIN_PATH}/AGENTS.md"
  if [[ -f "${PLUGIN_RULES}" ]]; then
    echo "  ✓ ${PLUGIN_PATH}/AGENTS.md (Precedence: 300)"
  else
    echo "  ⚠ ${PLUGIN_PATH}/AGENTS.md not found (falling back to category rules)"
  fi
else
  echo "  ℹ No plugin-specific rules applicable"
fi
echo ""

# ─── Step 6: Load Skill Contract ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛠️  STEP 6: SKILL CONTRACT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ -n "${SKILL_NAME}" ]]; then
  SKILL_DIR="${REPO_ROOT}/.agents/skills/${SKILL_NAME}"
  CONTRACT_FILE="${SKILL_DIR}/contract.yaml"
  SKILL_FILE="${SKILL_DIR}/SKILL.md"
  
  if [[ -d "${SKILL_DIR}" ]]; then
    echo "  Skill: ${SKILL_NAME}"
    
    if [[ -f "${CONTRACT_FILE}" ]]; then
      echo "  ✓ contract.yaml"
    else
      echo "  ⚠ contract.yaml not found"
    fi
    
    if [[ -f "${SKILL_FILE}" ]]; then
      echo "  ✓ SKILL.md"
    else
      echo "  ⚠ SKILL.md not found"
    fi
    
    # Parse and display contract info if available
    if [[ -f "${CONTRACT_FILE}" ]]; then
      echo ""
      echo "  Contract Details:"
      
      # Extract rules required
      RULES_REQUIRED=$(grep -A 20 "rules_required:" "${CONTRACT_FILE}" | grep "^  - " | sed 's/^  - //' || true)
      if [[ -n "${RULES_REQUIRED}" ]]; then
        echo "    Rules Required:"
        echo "${RULES_REQUIRED}" | while read -r rule; do
          echo "      • ${rule}"
        done
      fi
      
      # Extract inputs
      echo ""
      echo "    Inputs:"
      grep -A 50 "inputs:" "${CONTRACT_FILE}" | grep "name:" | head -5 | while read -r line; do
        input_name=$(echo "${line}" | sed 's/.*name: //')
        echo "      • ${input_name}"
      done
      
      # Extract postconditions
      echo ""
      echo "    Postconditions (Validation):"
      grep -A 30 "postconditions:" "${CONTRACT_FILE}" | grep "command:" | while read -r line; do
        cmd=$(echo "${line}" | sed 's/.*command: //')
        echo "      • ${cmd}"
      done
    fi
  else
    echo "  ${RED}✗ Skill '${SKILL_NAME}' not found${NC}"
    echo ""
    echo "  Available skills:"
    find "${REPO_ROOT}/.agents/skills" -maxdepth 1 -mindepth 1 -type d | sort | while read -r skill_dir; do
      skill=$(basename "${skill_dir}")
      echo "    • ${skill}"
    done
  fi
else
  echo "  ℹ No skill specified"
  echo ""
  echo "  Available skills:"
  find "${REPO_ROOT}/.agents/skills" -maxdepth 1 -mindepth 1 -type d | sort | while read -r skill_dir; do
    skill=$(basename "${skill_dir}")
    echo "    • ${skill}"
  done
fi
echo ""

# ─── Step 7: Summary ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 CONTEXT ASSEMBLY SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Files to load (in order):"
echo ""
echo "  1. AGENTS.md (Constitution)"
echo "  2. .agents/manifest.yaml"
echo "  3. .agents/rules/*.md (Global Rules)"

if [[ "${PLUGIN_TYPE}" == "frontend" ]] || [[ "${PLUGIN_TYPE}" == "shared-frontend" ]]; then
  echo "  4. frontend/plugins/AGENTS.md (Category Rules)"
elif [[ "${PLUGIN_TYPE}" == "backend" ]] || [[ "${PLUGIN_TYPE}" == "shared-backend" ]]; then
  echo "  4. backend/plugins/AGENTS.md (Category Rules)"
fi

if [[ -n "${PLUGIN_PATH}" ]] && [[ -f "${REPO_ROOT}/${PLUGIN_PATH}/AGENTS.md" ]]; then
  echo "  5. ${PLUGIN_PATH}/AGENTS.md (Plugin-Specific Rules)"
fi

if [[ -n "${SKILL_NAME}" ]] && [[ -f "${REPO_ROOT}/.agents/skills/${SKILL_NAME}/contract.yaml" ]]; then
  echo "  6. .agents/skills/${SKILL_NAME}/contract.yaml (Skill Contract)"
fi

if [[ -n "${SKILL_NAME}" ]] && [[ -f "${REPO_ROOT}/.agents/skills/${SKILL_NAME}/SKILL.md" ]]; then
  echo "  7. .agents/skills/${SKILL_NAME}/SKILL.md (Skill Guide)"
fi

echo ""
echo "Precedence: Plugin-Specific (300) > Category (200) > Global (100) > Constitution (0)"
echo ""
echo "${GREEN}✓ Context assembly complete${NC}"
echo ""

# ─── Readiness Check ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ READINESS CHECKLIST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CHECKS_PASSED=0
CHECKS_TOTAL=4

# Check 1: Constitution
if [[ -f "${REPO_ROOT}/AGENTS.md" ]]; then
  echo "  ✓ Constitution (AGENTS.md) accessible"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo "  ✗ Constitution (AGENTS.md) missing"
fi

# Check 2: Manifest
if [[ -f "${MANIFEST}" ]]; then
  echo "  ✓ Manifest accessible"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo "  ✗ Manifest missing"
fi

# Check 3: Rules
if [[ -d "${RULES_DIR}" ]] && [[ $(find "${RULES_DIR}" -name "*.md" | wc -l) -gt 0 ]]; then
  echo "  ✓ Global rules accessible"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo "  ✗ Global rules missing"
fi

# Check 4: Skill (if specified)
if [[ -n "${SKILL_NAME}" ]]; then
  if [[ -d "${REPO_ROOT}/.agents/skills/${SKILL_NAME}" ]]; then
    echo "  ✓ Skill '${SKILL_NAME}' accessible"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    echo "  ✗ Skill '${SKILL_NAME}' not found"
  fi
else
  echo "  ℹ No skill specified (optional)"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

echo ""
echo "Readiness: ${CHECKS_PASSED}/${CHECKS_TOTAL} checks passed"

if [[ ${CHECKS_PASSED} -eq ${CHECKS_TOTAL} ]]; then
  echo "${GREEN}✓ Context is ready for work${NC}"
  exit 0
else
  echo "${YELLOW}⚠ Some checks failed - review above${NC}"
  exit 1
fi
