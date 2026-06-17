#!/usr/bin/env bash
set -euo pipefail

# validate-scaffold.sh
# Post-scaffold validation: Ensures a newly scaffolded plugin follows all non-negotiable rules
# Usage: ./validate-scaffold.sh <plugin_name> [frontend|backend|both]

PLUGIN_NAME="${1:-}"
SCOPE="${2:-both}"

if [ -z "$PLUGIN_NAME" ]; then
  echo "Usage: $0 <plugin_name> [frontend|backend|both]"
  exit 1
fi

ERRORS=0

echo "=== Validating scaffolded plugin: $PLUGIN_NAME ==="
echo ""

# ─── Frontend Validation ───
if [ "$SCOPE" = "frontend" ] || [ "$SCOPE" = "both" ]; then
  FRONTEND_DIR="frontend/plugins/${PLUGIN_NAME}_ui"
  
  if [ ! -d "$FRONTEND_DIR" ]; then
    echo "ERROR: Frontend plugin directory not found: $FRONTEND_DIR"
    exit 1
  fi

  echo "--- Frontend Checks ---"

  # Check 1: No default exports in .tsx files (except config/tooling files)
  echo "Checking for default exports in .tsx files..."
  DEFAULT_EXPORTS=$(find "$FRONTEND_DIR/src" -name "*.tsx" -type f | while read -r file; do
    # Skip files that genuinely need default exports for tooling
    basename_file=$(basename "$file")
    if [[ "$basename_file" == "rspack.config.ts" ]] || \
       [[ "$basename_file" == "rspack.config.prod.ts" ]] || \
       [[ "$basename_file" == "jest.config.ts" ]] || \
       [[ "$basename_file" == "eslint.config.js" ]] || \
       [[ "$basename_file" == "module-federation.config.ts" ]]; then
      continue
    fi
    if grep -n "export default" "$file" 2>/dev/null; then
      echo "  DEFAULT_EXPORT: $file"
    fi
  done)

  if [ -n "$DEFAULT_EXPORTS" ]; then
    echo "FAIL: Found default exports in application code:"
    echo "$DEFAULT_EXPORTS"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: No default exports in application code"
  fi

  # Check 2: No 'any' types
  echo "Checking for 'any' types..."
  ANY_TYPES=$(grep -rn ": any" "$FRONTEND_DIR/src" --include="*.tsx" --include="*.ts" 2>/dev/null || true)
  if [ -n "$ANY_TYPES" ]; then
    echo "FAIL: Found 'any' types:"
    echo "$ANY_TYPES"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: No 'any' types found"
  fi

  # Check 3: No placeholder/empty content
  echo "Checking for placeholder content..."
  PLACEHOLDERS=$(grep -rn "<h1>.*Settings</h1>" "$FRONTEND_DIR/src" --include="*.tsx" 2>/dev/null || true)
  if [ -n "$PLACEHOLDERS" ]; then
    echo "FAIL: Found placeholder content:"
    echo "$PLACEHOLDERS"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: No placeholder content found"
  fi

  # Check 4: Has AGENTS.md
  echo "Checking for AGENTS.md..."
  if [ ! -f "$FRONTEND_DIR/AGENTS.md" ]; then
    echo "FAIL: AGENTS.md not found"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: AGENTS.md exists"
  fi

  # Check 5: Registered in manifest
  echo "Checking manifest registration..."
  if ! grep -q "${PLUGIN_NAME}_ui" .agents/manifest.yaml; then
    echo "FAIL: Plugin not registered in manifest.yaml"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: Plugin registered in manifest"
  fi

  # Check 6: Can build
  echo "Checking build..."
  if ! pnpm nx build "${PLUGIN_NAME}_ui" 2>&1 | tail -20; then
    echo "FAIL: Frontend plugin build failed"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: Frontend plugin builds successfully"
  fi
fi

# ─── Backend Validation ───
if [ "$SCOPE" = "backend" ] || [ "$SCOPE" = "both" ]; then
  BACKEND_DIR="backend/plugins/${PLUGIN_NAME}_api"
  
  if [ ! -d "$BACKEND_DIR" ]; then
    echo "ERROR: Backend plugin directory not found: $BACKEND_DIR"
    exit 1
  fi

  echo ""
  echo "--- Backend Checks ---"

  # Check 1: No schemaWrapper usage
  echo "Checking for schemaWrapper usage..."
  SCHEMA_WRAPPER=$(grep -rn "schemaWrapper" "$BACKEND_DIR/src" --include="*.ts" 2>/dev/null || true)
  if [ -n "$SCHEMA_WRAPPER" ]; then
    echo "FAIL: Found schemaWrapper usage (violates non-negotiable rule):"
    echo "$SCHEMA_WRAPPER"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: No schemaWrapper usage"
  fi

  # Check 2: No default exports in application code
  echo "Checking for default exports..."
  DEFAULT_EXPORTS=$(find "$BACKEND_DIR/src" -name "*.ts" -type f | while read -r file; do
    if grep -n "export default" "$file" 2>/dev/null; then
      echo "  DEFAULT_EXPORT: $file"
    fi
  done)

  if [ -n "$DEFAULT_EXPORTS" ]; then
    echo "FAIL: Found default exports:"
    echo "$DEFAULT_EXPORTS"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: No default exports"
  fi

  # Check 3: Can build
  echo "Checking build..."
  if ! pnpm nx build "${PLUGIN_NAME}_api" 2>&1 | tail -20; then
    echo "FAIL: Backend plugin build failed"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: Backend plugin builds successfully"
  fi
fi

echo ""
echo "=== Validation Complete ==="
if [ $ERRORS -eq 0 ]; then
  echo "SUCCESS: All checks passed!"
  exit 0
else
  echo "FAILURE: $ERRORS check(s) failed"
  echo ""
  echo "You MUST fix these issues before declaring the plugin complete."
  echo "See .agents/rules/non-negotiable.md for the full rules."
  exit 1
fi
