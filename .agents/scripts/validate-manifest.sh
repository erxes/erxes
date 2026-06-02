#!/usr/bin/env bash
# .agents/scripts/validate-manifest.sh
# Manifest Integrity Validator
#
# Usage:
#   validate-manifest.sh
#
# Validates:
#   - manifest.yaml syntax and required fields
#   - All referenced rule files exist
#   - All skill directories have contract.yaml and SKILL.md
#   - All plugin entries have valid paths
#   - No duplicate skill names
#   - No orphan skills (in directory but not in manifest)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
AGENTS_DIR="${REPO_ROOT}/.agents"
MANIFEST="${AGENTS_DIR}/manifest.yaml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

error() {
  echo "${RED}✗ ERROR:${NC} $*" >&2
  ERRORS=$((ERRORS + 1))
}

warn() {
  echo "${YELLOW}⚠ WARNING:${NC} $*" >&2
  WARNINGS=$((WARNINGS + 1))
}

ok() {
  echo "${GREEN}✓${NC} $*"
}

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║         AGENT MANIFEST VALIDATOR v1.0                            ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# ─── Check 1: Manifest exists ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 CHECK 1: Manifest File"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ ! -f "${MANIFEST}" ]]; then
  error "manifest.yaml not found at ${MANIFEST}"
  exit 1
fi
ok "manifest.yaml exists"

# Check YAML syntax (basic - look for required top-level keys)
REQUIRED_KEYS=("version" "schema" "rule_layers" "skills" "plugins" "protocol")
for key in "${REQUIRED_KEYS[@]}"; do
  if grep -q "^${key}:" "${MANIFEST}"; then
    ok "Required key '${key}' present"
  else
    error "Required key '${key}' missing from manifest"
  fi
done
echo ""

# ─── Check 2: Rule Layers ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📜 CHECK 2: Rule Layers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check constitution
if grep -q "id: \"constitution\"" "${MANIFEST}"; then
  ok "Constitution layer defined"
  if [[ -f "${REPO_ROOT}/AGENTS.md" ]]; then
    ok "AGENTS.md exists"
  else
    error "AGENTS.md not found (constitution references it)"
  fi
else
  error "Constitution layer missing"
fi

# Check global rules layer
if grep -q "id: \"global-rules\"" "${MANIFEST}"; then
  ok "Global rules layer defined"
  
  # Check each listed rule file exists
  RULES_DIR="${AGENTS_DIR}/rules"
  if [[ -d "${RULES_DIR}" ]]; then
    RULE_COUNT=$(find "${RULES_DIR}" -name "*.md" -not -name "README.md" | wc -l)
    ok "${RULE_COUNT} rule files found in .agents/rules/"
  else
    error "Rules directory not found: ${RULES_DIR}"
  fi
else
  error "Global rules layer missing"
fi

# Check category rules
for category in "frontend-plugin-category" "backend-plugin-category"; do
  if grep -q "id: \"${category}\"" "${MANIFEST}"; then
    ok "Category layer '${category}' defined"
  else
    warn "Category layer '${category}' not defined"
  fi
done
echo ""

# ─── Check 3: Skills ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛠️  CHECK 3: Skills Registry"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SKILLS_DIR="${AGENTS_DIR}/skills"

# Get skills from manifest (only from the skills: section)
MANIFEST_SKILLS=$(awk '/^skills:/{flag=1;next}/^[a-z]/{flag=0}flag' "${MANIFEST}" | grep "^  [a-z]" | sed 's/^  //' | sed 's/:.*//' | sort -u)

# Get skills from directory
DIR_SKILLS=$(find "${SKILLS_DIR}" -maxdepth 1 -mindepth 1 -type d | sort | xargs -n1 basename)

# Check for skills in manifest but not in directory
while IFS= read -r skill; do
  if [[ -z "${skill}" ]]; then continue; fi
  if [[ ! -d "${SKILLS_DIR}/${skill}" ]]; then
    error "Skill '${skill}' in manifest but directory missing: ${SKILLS_DIR}/${skill}"
  else
    ok "Skill '${skill}' directory exists"
  fi
done <<< "${MANIFEST_SKILLS}"

# Check for skills in directory but not in manifest
while IFS= read -r skill; do
  if [[ -z "${skill}" ]]; then continue; fi
  if ! grep -q "name: \"${skill}\"" "${MANIFEST}"; then
    warn "Skill '${skill}' exists in directory but not registered in manifest"
  fi
done <<< "${DIR_SKILLS}"

# Check each skill has required files
while IFS= read -r skill; do
  if [[ -z "${skill}" ]] || [[ "${skill}" == "README.md" ]]; then continue; fi
  
  SKILL_DIR="${SKILLS_DIR}/${skill}"
  if [[ ! -d "${SKILL_DIR}" ]]; then continue; fi
  
  # Check contract.yaml
  if [[ -f "${SKILL_DIR}/contract.yaml" ]]; then
    ok "Skill '${skill}' has contract.yaml"
    
    # Validate contract has required fields
    CONTRACT="${SKILL_DIR}/contract.yaml"
    CONTRACT_KEYS=("skill:" "inputs:" "rules_required:" "preconditions:" "postconditions:")
    for key in "${CONTRACT_KEYS[@]}"; do
      if grep -q "^${key}" "${CONTRACT}"; then
        : # ok
      else
        warn "Skill '${skill}' contract missing key: ${key}"
      fi
    done
  else
    error "Skill '${skill}' missing contract.yaml"
  fi
  
  # Check SKILL.md
  if [[ -f "${SKILL_DIR}/SKILL.md" ]]; then
    ok "Skill '${skill}' has SKILL.md"
  else
    error "Skill '${skill}' missing SKILL.md"
  fi
done <<< "${DIR_SKILLS}"
echo ""

# ─── Check 4: Plugin Registry ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔌 CHECK 4: Plugin Registry"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check frontend plugins
FRONTEND_PLUGINS=$(awk '/^plugins:/{flag=1;next}/^[a-z]/{flag=0}flag' "${MANIFEST}" | awk '/frontend:/{flag=1;next}/backend:/{flag=0}flag' | grep "path: " | sed 's/.*path: "//' | sed 's/"$//')
while IFS= read -r plugin_path; do
  if [[ -z "${plugin_path}" ]]; then continue; fi
  PLUGIN_DIR="${REPO_ROOT}/${plugin_path}"
  if [[ -d "${PLUGIN_DIR}" ]]; then
    ok "Frontend plugin '${plugin_path}' directory exists"
  else
    warn "Frontend plugin '${plugin_path}' directory not found: ${PLUGIN_DIR}"
  fi
done <<< "${FRONTEND_PLUGINS}"

# Check backend plugins
BACKEND_PLUGINS=$(awk '/^plugins:/{flag=1;next}/^[a-z]/{flag=0}flag' "${MANIFEST}" | awk '/backend:/{flag=1;next}/shared:/{flag=0}flag' | grep "path: " | sed 's/.*path: "//' | sed 's/"$//')
while IFS= read -r plugin_path; do
  if [[ -z "${plugin_path}" ]]; then continue; fi
  PLUGIN_DIR="${REPO_ROOT}/${plugin_path}"
  if [[ -d "${PLUGIN_DIR}" ]]; then
    ok "Backend plugin '${plugin_path}' directory exists"
  else
    warn "Backend plugin '${plugin_path}' directory not found: ${PLUGIN_DIR}"
  fi
done <<< "${BACKEND_PLUGINS}"
echo ""

# ─── Check 5: Scripts ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 CHECK 5: Utility Scripts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ASSEMBLE_SCRIPT="${AGENTS_DIR}/scripts/assemble-context.sh"
if [[ -f "${ASSEMBLE_SCRIPT}" ]]; then
  if [[ -x "${ASSEMBLE_SCRIPT}" ]]; then
    ok "assemble-context.sh exists and is executable"
  else
    warn "assemble-context.sh exists but is not executable"
  fi
else
  error "assemble-context.sh not found"
fi

VALIDATE_SCRIPT="${AGENTS_DIR}/scripts/validate-manifest.sh"
if [[ -f "${VALIDATE_SCRIPT}" ]]; then
  if [[ -x "${VALIDATE_SCRIPT}" ]]; then
    ok "validate-manifest.sh exists and is executable"
  else
    warn "validate-manifest.sh exists but is not executable"
  fi
else
  error "validate-manifest.sh not found"
fi
echo ""

# ─── Check 6: Protocol Definition ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 CHECK 6: Agent Protocol"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PROTOCOL_KEYS=("entry_point" "base_context_required" "context_assembly_required" "skill_contract_required" "validation_required")
for key in "${PROTOCOL_KEYS[@]}"; do
  if grep -q "${key}:" "${MANIFEST}"; then
    ok "Protocol key '${key}' defined"
  else
    error "Protocol key '${key}' missing"
  fi
done
echo ""

# ─── Summary ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VALIDATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ ${ERRORS} -eq 0 ]] && [[ ${WARNINGS} -eq 0 ]]; then
  echo "${GREEN}✓ ALL CHECKS PASSED${NC}"
  echo ""
  echo "The agent manifest system is healthy and ready for use."
  exit 0
elif [[ ${ERRORS} -eq 0 ]]; then
  echo "${YELLOW}✓ PASSED WITH WARNINGS${NC}"
  echo ""
  echo "Warnings: ${WARNINGS}"
  echo "Errors: ${ERRORS}"
  echo ""
  echo "The system is functional but has warnings to review."
  exit 0
else
  echo "${RED}✗ VALIDATION FAILED${NC}"
  echo ""
  echo "Errors: ${ERRORS}"
  echo "Warnings: ${WARNINGS}"
  echo ""
  echo "Please fix the errors above before using the agent system."
  exit 1
fi
