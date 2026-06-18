#!/usr/bin/env bash
set -euo pipefail

# check-rules.sh
# Validates that code changes follow non-negotiable rules
# Usage: ./check-rules.sh [path]
# If no path is provided, checks the entire repository

TARGET_PATH="${1:-.}"

ERRORS=0
echo "=== Checking Non-Negotiable Rules ==="
echo "Target: $TARGET_PATH"
echo ""

# Rule 1: No default exports in application code (.tsx, .ts in src/)
echo "--- Rule: Named Exports Only ---"
DEFAULT_EXPORTS=$(find "$TARGET_PATH" \( -path "*/src/*.tsx" -o -path "*/src/*.ts" \) -type f | while read -r file; do
  # Skip known config files that require default exports
  basename_file=$(basename "$file")
  if [[ "$basename_file" == "rspack.config.ts" ]] || \
     [[ "$basename_file" == "rspack.config.prod.ts" ]] || \
     [[ "$basename_file" == "jest.config.ts" ]] || \
     [[ "$basename_file" == "eslint.config.js" ]] || \
     [[ "$basename_file" == "module-federation.config.ts" ]] || \
     [[ "$basename_file" == "*.d.ts" ]]; then
    continue
  fi
  
  # Check for export default in application code
  if grep -n "export default" "$file" 2>/dev/null | grep -v "// Default export required" | grep -v "export default config" | grep -v "export default composePlugins"; then
    echo "  $file"
  fi
done || true)

if [ -n "$DEFAULT_EXPORTS" ]; then
  echo "FAIL: Found default exports in application code:"
  echo "$DEFAULT_EXPORTS"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS"
fi

# Rule 2: No 'any' types
echo ""
echo "--- Rule: No 'any' Types ---"
ANY_TYPES=$(grep -rn ": any" "$TARGET_PATH" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules" | grep -v "\.d\.ts" || true)
if [ -n "$ANY_TYPES" ]; then
  echo "FAIL: Found 'any' types:"
  echo "$ANY_TYPES"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS"
fi

# Rule 3: No schemaWrapper in backend
echo ""
echo "--- Rule: No schemaWrapper Usage ---"
SCHEMA_WRAPPER=$(grep -rn "schemaWrapper" "$TARGET_PATH" --include="*.ts" 2>/dev/null | grep -v "node_modules" | grep -v "erxes-api-shared" || true)
if [ -n "$SCHEMA_WRAPPER" ]; then
  echo "FAIL: Found schemaWrapper usage:"
  echo "$SCHEMA_WRAPPER"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS"
fi

# Rule 4: No placeholder content (empty pages without empty states)
echo ""
echo "--- Rule: Completeness (No Placeholders) ---"
PLACEHOLDERS=$(grep -rn "<h1>.*Settings</h1>\|Empty page\|TODO\|FIXME\|Placeholder" "$TARGET_PATH" --include="*.tsx" 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$PLACEHOLDERS" ]; then
  echo "WARN: Found potential placeholder content:"
  echo "$PLACEHOLDERS"
  # This is a warning, not an error, since some placeholders might be intentional during development
  echo "(Review these - they may violate the Completeness rule)"
else
  echo "PASS"
fi

# Rule 5: No console.log or debugger in production code
echo ""
echo "--- Rule: No Debug Code ---"
DEBUG_CODE=$(grep -rn "console\.log\|debugger;" "$TARGET_PATH" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$DEBUG_CODE" ]; then
  echo "WARN: Found debug code:"
  echo "$DEBUG_CODE"
  echo "(Remove before committing)"
else
  echo "PASS"
fi

# Rule 6: All GraphQL operations must be named
echo ""
echo "--- Rule: Named GraphQL Operations ---"
UNNAMED_GQL=$(grep -rn "gql\`" "$TARGET_PATH" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v "query\|mutation\|subscription" || true)
if [ -n "$UNNAMED_GQL" ]; then
  echo "WARN: Found potentially unnamed GraphQL operations:"
  echo "$UNNAMED_GQL"
else
  echo "PASS"
fi

# Rule 7: Check for cross-plugin imports
echo ""
echo "--- Rule: No Cross-Plugin Imports ---"
CROSS_IMPORTS=$(grep -rn "from 'frontend/plugins/\|from 'backend/plugins/" "$TARGET_PATH" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$CROSS_IMPORTS" ]; then
  echo "FAIL: Found cross-plugin imports:"
  echo "$CROSS_IMPORTS"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS"
fi

echo ""
echo "=== Rule Check Complete ==="
if [ $ERRORS -eq 0 ]; then
  echo "SUCCESS: All critical checks passed"
  exit 0
else
  echo "FAILURE: $ERRORS critical rule(s) violated"
  echo ""
  echo "Fix these issues before proceeding."
  echo "See .agents/rules/non-negotiable.md for details."
  exit 1
fi
