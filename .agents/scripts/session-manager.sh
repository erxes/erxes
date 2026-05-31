#!/usr/bin/env bash
# .agents/scripts/session-manager.sh
# Session state manager for erxes Agent System
#
# Usage:
#   session-manager.sh init <session-id>
#   session-manager.sh status
#   session-manager.sh update-phase <phase>
#   session-manager.sh add-rule <rule-name>
#   session-manager.sh add-skill <skill-name>
#   session-manager.sh complete-step <step-name>
#   session-manager.sh set-variable <key> <value>
#   session-manager.sh get-variable <key>
#   session-manager.sh fail-validation <command> <error>
#   session-manager.sh reset

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SESSION_FILE="${REPO_ROOT}/.agents/session.yaml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

usage() {
  cat <<EOF
Session Manager for erxes Agent System

Usage: $(basename "$0") <command> [args]

Commands:
  init <session-id>              Initialize new session
  status                        Show current session status
  update-phase <phase>          Update current phase
  add-rule <rule>               Mark rule as loaded
  add-skill <skill>             Mark skill as loaded
  complete-step <step>          Mark step as completed
  set-variable <key> <value>   Set session variable
  get-variable <key>            Get session variable
  fail-validation <cmd> <err>   Record validation failure
  reset                         Reset/clear session

Examples:
  $(basename "$0") init "feature-tags-20260528"
  $(basename "$0") update-phase "coding"
  $(basename "$0") complete-step "context_loaded"
  $(basename "$0") set-variable plugin "content_ui"
EOF
}

init_session() {
  local session_id="${1:-$(date +%Y%m%d-%H%M%S)}"
  cat > "${SESSION_FILE}" <<EOF
# erxes Agent Session
# Auto-generated. Do not edit manually.

session:
  id: "${session_id}"
  created_at: "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  updated_at: "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  status: "active"

# Current phase of work
phase:
  current: "init"
  history: []

# Rules that have been loaded
rules_loaded: []

# Skills that have been loaded
skills_loaded: []

# Steps completed
completed_steps: []

# Validations run
validations:
  passed: []
  failed: []

# Context variables (plugin, module, feature, etc.)
variables: {}

# Deliverables checklist
deliverables:
  pending: []
  completed: []

# Notes for next session
notes: []
EOF
  echo "${GREEN}✓${NC} Session initialized: ${session_id}"
}

show_status() {
  if [[ ! -f "${SESSION_FILE}" ]]; then
    echo "${YELLOW}⚠ No active session${NC}"
    echo "Run: $(basename "$0") init <session-id>"
    return 1
  fi

  echo ""
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║              SESSION STATUS                                ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
  
  # Parse session file
  local session_id=$(grep "^  id:" "${SESSION_FILE}" | sed 's/.*id: "//' | sed 's/"$//')
  local phase=$(grep "^  current:" "${SESSION_FILE}" | sed 's/.*current: "//' | sed 's/"$//')
  local status=$(grep "^  status:" "${SESSION_FILE}" | sed 's/.*status: "//' | sed 's/"$//')
  
  echo "Session ID: ${session_id}"
  echo "Status: ${status}"
  echo "Current Phase: ${phase}"
  echo ""
  
  echo "Rules Loaded:"
  grep -A 100 "rules_loaded:" "${SESSION_FILE}" | grep "^  - " | sed 's/^  - /  ✓ /' || echo "  (none)"
  echo ""
  
  echo "Skills Loaded:"
  grep -A 100 "skills_loaded:" "${SESSION_FILE}" | grep "^  - " | sed 's/^  - /  ✓ /' || echo "  (none)"
  echo ""
  
  echo "Completed Steps:"
  grep -A 100 "completed_steps:" "${SESSION_FILE}" | grep "^  - " | sed 's/^  - /  ✓ /' || echo "  (none)"
  echo ""
  
  echo "Validations:"
  local passed=$(grep -A 50 "passed:" "${SESSION_FILE}" | grep "^  - " | wc -l | tr -d ' ')
  local failed=$(grep -A 50 "failed:" "${SESSION_FILE}" | grep "^  - " | wc -l | tr -d ' ')
  echo "  ✓ Passed: ${passed}"
  echo "  ✗ Failed: ${failed}"
  echo ""
  
  echo "Variables:"
  grep -A 100 "variables:" "${SESSION_FILE}" | grep "^  [a-z]" | sed 's/^  /  /' || echo "  (none)"
  echo ""
  
  echo "Deliverables:"
  local pending=$(grep -A 50 "pending:" "${SESSION_FILE}" | grep "^  - " | wc -l | tr -d ' ')
  local completed=$(grep -A 50 "completed:" "${SESSION_FILE}" | grep "^  - " | wc -l | tr -d ' ')
  echo "  ☐ Pending: ${pending}"
  echo "  ☑ Completed: ${completed}"
}

update_phase() {
  local new_phase="$1"
  local current_phase=$(grep "^  current:" "${SESSION_FILE}" | sed 's/.*current: "//' | sed 's/"$//')
  
  # Update current phase
  sed -i.bak "s/  current: \"${current_phase}\"/  current: \"${new_phase}\"/" "${SESSION_FILE}"
  
  # Add to history
  sed -i.bak "/history:/a\\  - \"${current_phase} > ${new_phase}\"" "${SESSION_FILE}"
  
  # Update timestamp
  sed -i.bak "s/updated_at:.*/updated_at: \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"/" "${SESSION_FILE}"
  
  rm -f "${SESSION_FILE}.bak"
  echo "${GREEN}✓${NC} Phase updated: ${current_phase} > ${new_phase}"
}

add_rule() {
  local rule="$1"
  if ! grep -q "^  - \"${rule}\"" "${SESSION_FILE}"; then
    sed -i.bak "/rules_loaded:/a\\  - \"${rule}\"" "${SESSION_FILE}"
    rm -f "${SESSION_FILE}.bak"
  fi
  echo "${GREEN}✓${NC} Rule loaded: ${rule}"
}

add_skill() {
  local skill="$1"
  if ! grep -q "^  - \"${skill}\"" "${SESSION_FILE}"; then
    sed -i.bak "/skills_loaded:/a\\  - \"${skill}\"" "${SESSION_FILE}"
    rm -f "${SESSION_FILE}.bak"
  fi
  echo "${GREEN}✓${NC} Skill loaded: ${skill}"
}

complete_step() {
  local step="$1"
  if ! grep -q "^  - \"${step}\"" "${SESSION_FILE}"; then
    sed -i.bak "/completed_steps:/a\\  - \"${step}\"" "${SESSION_FILE}"
    rm -f "${SESSION_FILE}.bak"
  fi
  echo "${GREEN}✓${NC} Step completed: ${step}"
}

set_variable() {
  local key="$1"
  local value="$2"
  
  if grep -q "^  ${key}:" "${SESSION_FILE}"; then
    sed -i.bak "s/^  ${key}:.*/  ${key}: \"${value}\"/" "${SESSION_FILE}"
  else
    sed -i.bak "/variables:/a\\  ${key}: \"${value}\"" "${SESSION_FILE}"
  fi
  rm -f "${SESSION_FILE}.bak"
  echo "${GREEN}✓${NC} Variable set: ${key} = ${value}"
}

get_variable() {
  local key="$1"
  local value=$(grep "^  ${key}:" "${SESSION_FILE}" | sed "s/.*${key}: \"//" | sed 's/"$//')
  if [[ -n "${value}" ]]; then
    echo "${value}"
  else
    echo "${YELLOW}⚠ Variable '${key}' not found${NC}" >&2
    return 1
  fi
}

fail_validation() {
  local command="$1"
  local error="$2"
  sed -i.bak "/failed:/a\\  - command: \"${command}\"\\n    error: \"${error}\"" "${SESSION_FILE}"
  rm -f "${SESSION_FILE}.bak"
  echo "${RED}✗${NC} Validation failed: ${command}"
  echo "    Error: ${error}"
}

reset_session() {
  rm -f "${SESSION_FILE}"
  echo "${GREEN}✓${NC} Session reset"
}

# Main
case "${1:-}" in
  init)
    init_session "${2:-}"
    ;;
  status)
    show_status
    ;;
  update-phase)
    update_phase "$2"
    ;;
  add-rule)
    add_rule "$2"
    ;;
  add-skill)
    add_skill "$2"
    ;;
  complete-step)
    complete_step "$2"
    ;;
  set-variable)
    set_variable "$2" "$3"
    ;;
  get-variable)
    get_variable "$2"
    ;;
  fail-validation)
    fail_validation "$2" "$3"
    ;;
  reset)
    reset_session
    ;;
  *)
    usage
    exit 1
    ;;
esac
