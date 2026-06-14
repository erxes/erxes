#!/usr/bin/env bash
set -euo pipefail

# check-deliverables.sh
# Verifies that all deliverables from a skill execution are complete
# Usage: ./check-deliverables.sh <skill_name> [plugin_name]

SKILL_NAME="${1:-}"
PLUGIN_NAME="${2:-}"

if [ -z "$SKILL_NAME" ]; then
  echo "Usage: $0 <skill_name> [plugin_name]"
  echo ""
  echo "Available skills:"
  ls -1 .agents/skills/*/contract.yaml | sed 's|.agents/skills/||;s|/contract.yaml||'
  exit 1
fi

CONTRACT_FILE=".agents/skills/${SKILL_NAME}/contract.yaml"

if [ ! -f "$CONTRACT_FILE" ]; then
  echo "ERROR: Skill contract not found: $CONTRACT_FILE"
  exit 1
fi

echo "=== Checking Deliverables for Skill: $SKILL_NAME ==="
echo ""

# Extract deliverables from contract
DELIVERABLES=$(grep -A 50 "deliverables:" "$CONTRACT_FILE" | grep "^  -" | sed 's/^  - //')

if [ -z "$DELIVERABLES" ]; then
  echo "No deliverables defined in contract."
  echo "Postconditions defined:"
  grep -A 100 "postconditions:" "$CONTRACT_FILE" | grep "description:" | sed 's/.*description: //'
  exit 0
fi

MISSING=0
echo "Required deliverables:"
echo "$DELIVERABLES" | while read -r item; do
  # Skip items with placeholders
  if echo "$item" | grep -q "{.*}"; then
    if [ -n "$PLUGIN_NAME" ]; then
      item=$(echo "$item" | sed "s/{plugin_name}/$PLUGIN_NAME/g;s/{plugin_name}_ui/${PLUGIN_NAME}_ui/g;s/{plugin_name}_api/${PLUGIN_NAME}_api/g")
    else
      echo "  [SKIP] $item (requires plugin_name)"
      continue
    fi
  fi
  
  echo -n "  [ ] $item"
  
  # Check if deliverable exists (file, directory, or registered in manifest)
  if echo "$item" | grep -q "AGENTS.md"; then
    if [ -n "$PLUGIN_NAME" ] && [ -f "frontend/plugins/${PLUGIN_NAME}_ui/AGENTS.md" ]; then
      echo " ✓"
    else
      echo " MISSING"
      MISSING=$((MISSING + 1))
    fi
  elif echo "$item" | grep -q "manifest"; then
    if [ -n "$PLUGIN_NAME" ] && grep -q "${PLUGIN_NAME}" .agents/manifest.yaml; then
      echo " ✓"
    else
      echo " MISSING"
      MISSING=$((MISSING + 1))
    fi
  elif echo "$item" | grep -q "feature map"; then
    if [ -f ".agents/maps/feature-map.yaml" ]; then
      if [ -n "$PLUGIN_NAME" ] && grep -q "${PLUGIN_NAME}" .agents/maps/feature-map.yaml; then
        echo " ✓"
      else
        echo " MISSING"
        MISSING=$((MISSING + 1))
      fi
    else
      echo " (feature map not found - skipped)"
    fi
  elif echo "$item" | grep -q "build\|lint\|test"; then
    echo " (verify manually)"
  else
    echo " (verify manually)"
  fi
done

echo ""
if [ $MISSING -eq 0 ]; then
  echo "SUCCESS: All deliverables accounted for"
  exit 0
else
  echo "WARNING: $MISSING deliverable(s) need verification"
  exit 1
fi
