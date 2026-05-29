#!/bin/bash
# Pre-flight Check: detect-scope → intake gate
# This script MUST pass before intake skill can run.
# It validates that detect-scope completed successfully and produced valid output.

set -e

SESSION_FILE=".agents/session.yaml"
SCOPE_STATE_FILE=".agents/state/last-detect-scope.json"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

errors=0

# ─── Check 1: Session file exists ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 PREFLIGHT CHECK: detect-scope → intake gate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f "$SESSION_FILE" ]; then
    echo -e "${RED}✗ FAIL${NC}: Session file not found: $SESSION_FILE"
    echo "   Run: touch $SESSION_FILE"
    errors=$((errors + 1))
else
    echo -e "${GREEN}✓${NC} Session file exists"
fi

# ─── Check 2: detect-scope state exists ───
if [ ! -f "$SCOPE_STATE_FILE" ]; then
    echo -e "${RED}✗ FAIL${NC}: detect-scope output not found: $SCOPE_STATE_FILE"
    echo "   detect-scope MUST run before intake."
    echo "   The detect-scope skill should write its output to:"
    echo "   $SCOPE_STATE_FILE"
    errors=$((errors + 1))
else
    echo -e "${GREEN}✓${NC} detect-scope state file exists"
fi

# ─── Check 3: Required fields in detect-scope output ───
if [ -f "$SCOPE_STATE_FILE" ]; then
    required_fields=("plugin" "action" "scope" "user_confirmed" "goal_condition")
    for field in "${required_fields[@]}"; do
        if ! grep -q "\"$field\"" "$SCOPE_STATE_FILE" 2>/dev/null; then
            echo -e "${RED}✗ FAIL${NC}: Required field missing in detect-scope output: '$field'"
            errors=$((errors + 1))
        else
            echo -e "${GREEN}✓${NC} Field '$field' present"
        fi
    done
fi

# ─── Check 4: user_confirmed must be true ───
if [ -f "$SCOPE_STATE_FILE" ]; then
    if grep -q '"user_confirmed": true' "$SCOPE_STATE_FILE" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} User confirmed scope (user_confirmed: true)"
    else
        echo -e "${RED}✗ FAIL${NC}: user_confirmed is not true"
        echo "   detect-scope must obtain user confirmation before proceeding."
        errors=$((errors + 1))
    fi
fi

# ─── Check 5: Plugin exists in manifest ───
if [ -f "$SCOPE_STATE_FILE" ]; then
    plugin=$(grep -o '"plugin": "[^"]*"' "$SCOPE_STATE_FILE" | head -1 | cut -d'"' -f4)
    if [ -n "$plugin" ]; then
        if grep -q "name: \"$plugin\"" .agents/manifest.yaml 2>/dev/null || \
           grep -q "name: \"${plugin}_ui\"" .agents/manifest.yaml 2>/dev/null || \
           grep -q "name: \"${plugin}_api\"" .agents/manifest.yaml 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Plugin '$plugin' found in manifest"
        else
            echo -e "${YELLOW}⚠ WARNING${NC}: Plugin '$plugin' not found in manifest registry"
            echo "   If creating a new plugin, this is expected."
        fi
    fi
fi

# ─── Check 6: Session timestamps (detect-scope must be recent) ───
if [ -f "$SESSION_FILE" ] && [ -f "$SCOPE_STATE_FILE" ]; then
    session_mtime=$(stat -f %m "$SESSION_FILE" 2>/dev/null || stat -c %Y "$SESSION_FILE" 2>/dev/null)
    scope_mtime=$(stat -f %m "$SCOPE_STATE_FILE" 2>/dev/null || stat -c %Y "$SCOPE_STATE_FILE" 2>/dev/null)
    
    if [ "$scope_mtime" -ge "$session_mtime" ]; then
        echo -e "${GREEN}✓${NC} detect-scope ran in current session"
    else
        echo -e "${YELLOW}⚠ WARNING${NC}: detect-scope output is older than current session"
        echo "   detect-scope may need to run again for this conversation."
    fi
fi

# ─── Summary ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ PREFLIGHT CHECK PASSED${NC}"
    echo "   detect-scope completed. Proceeding to intake..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
else
    echo -e "${RED}❌ PREFLIGHT CHECK FAILED ($errors error(s))${NC}"
    echo "   detect-scope MUST run and complete before intake."
    echo "   Run detect-scope skill first, then retry."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
fi
