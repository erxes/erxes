#!/bin/bash
# Pre-flight Check: detect-scope → intake gate
# This script MUST pass before intake skill can run.
# It validates that detect-scope completed successfully and produced valid output.

SESSION_FILE=".agents/session.yaml"
SCOPE_STATE_FILE=".agents/state/last-detect-scope.json"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
SEPARATOR="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

errors=0

# ─── Check 1: Session file exists ───
echo "$SEPARATOR"
echo "🔍 PREFLIGHT CHECK: detect-scope → intake gate"
echo "$SEPARATOR"

if [[ ! -f "$SESSION_FILE" ]]; then
    echo -e "${RED}✗ FAIL${NC}: Session file not found: $SESSION_FILE" >&2
    echo "   Run: touch $SESSION_FILE" >&2
    errors=$((errors + 1))
else
    echo -e "${GREEN}✓${NC} Session file exists"
fi

# ─── Check 2: detect-scope state exists ───
if [[ ! -f "$SCOPE_STATE_FILE" ]]; then
    echo -e "${RED}✗ FAIL${NC}: detect-scope output not found: $SCOPE_STATE_FILE" >&2
    echo "   detect-scope MUST run before intake." >&2
    echo "   The detect-scope skill should write its output to:" >&2
    echo "   $SCOPE_STATE_FILE" >&2
    errors=$((errors + 1))
else
    echo -e "${GREEN}✓${NC} detect-scope state file exists"
fi

# ─── Check 3: Valid JSON structure ───
if [[ -f "$SCOPE_STATE_FILE" ]]; then
    # Use python3 or node to validate JSON if available, fallback to basic check
    if command -v python3 &> /dev/null; then
        if python3 -c "import json; json.load(open('$SCOPE_STATE_FILE'))" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Valid JSON structure"
        else
            echo -e "${RED}✗ FAIL${NC}: Invalid JSON in detect-scope output" >&2
            errors=$((errors + 1))
        fi
    elif command -v node &> /dev/null; then
        if node -e "JSON.parse(require('fs').readFileSync('$SCOPE_STATE_FILE', 'utf8'))" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Valid JSON structure"
        else
            echo -e "${RED}✗ FAIL${NC}: Invalid JSON in detect-scope output" >&2
            errors=$((errors + 1))
        fi
    else
        echo -e "${YELLOW}⚠ WARNING${NC}: Cannot validate JSON (no python3 or node available)"
    fi
fi

# ─── Check 4: Required fields in detect-scope output ───
if [[ -f "$SCOPE_STATE_FILE" ]]; then
    required_fields=("plugin" "module" "action" "scope" "user_confirmed" "goal_condition")
    for field in "${required_fields[@]}"; do
        # Use grep to check for JSON key presence (more robust pattern)
        if grep -qE "^\s*\"$field\"\s*:" "$SCOPE_STATE_FILE" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Field '$field' present"
        else
            echo -e "${RED}✗ FAIL${NC}: Required field missing in detect-scope output: '$field'" >&2
            errors=$((errors + 1))
        fi
    done
fi

# ─── Check 5: user_confirmed must be true ───
if [[ -f "$SCOPE_STATE_FILE" ]]; then
    # Look for the exact pattern: "user_confirmed": true (as a boolean, not string)
    if grep -qE '^\s*"user_confirmed"\s*:\s*true\b' "$SCOPE_STATE_FILE" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} User confirmed scope (user_confirmed: true)"
    else
        echo -e "${RED}✗ FAIL${NC}: user_confirmed is not true" >&2
        echo "   detect-scope must obtain user confirmation before proceeding." >&2
        errors=$((errors + 1))
    fi
fi

# ─── Check 6: Plugin exists in manifest ───
if [[ -f "$SCOPE_STATE_FILE" ]]; then
    # Extract plugin value more carefully
    plugin=$(grep -oE '^\s*"plugin"\s*:\s*"[^"]*"' "$SCOPE_STATE_FILE" | head -1 | grep -oE '"[^"]*"$' | tr -d '"')
    if [[ -n "$plugin" ]]; then
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

# ─── Check 7: Session timestamps (detect-scope must be recent) ───
if [[ -f "$SESSION_FILE" ]] && [[ -f "$SCOPE_STATE_FILE" ]]; then
    session_mtime=$(stat -f %m "$SESSION_FILE" 2>/dev/null || stat -c %Y "$SESSION_FILE" 2>/dev/null)
    scope_mtime=$(stat -f %m "$SCOPE_STATE_FILE" 2>/dev/null || stat -c %Y "$SCOPE_STATE_FILE" 2>/dev/null)
    
    if [[ "$scope_mtime" -ge "$session_mtime" ]]; then
        echo -e "${GREEN}✓${NC} detect-scope ran in current session"
    else
        echo -e "${YELLOW}⚠ WARNING${NC}: detect-scope output is older than current session"
        echo "   detect-scope may need to run again for this conversation."
    fi
fi

# ─── Summary ───
echo "$SEPARATOR"
if [[ $errors -eq 0 ]]; then
    echo -e "${GREEN}✅ PREFLIGHT CHECK PASSED${NC}"
    echo "   detect-scope completed. Proceeding to intake..."
    echo "$SEPARATOR"
    exit 0
else
    echo -e "${RED}❌ PREFLIGHT CHECK FAILED ($errors error(s))${NC}" >&2
    echo "   detect-scope MUST run and complete before intake." >&2
    echo "   Run detect-scope skill first, then retry." >&2
    echo "$SEPARATOR" >&2
    exit 1
fi
