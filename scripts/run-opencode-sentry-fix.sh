#!/usr/bin/env bash
set -euo pipefail

# Sentry OpenCode Fix Script
# This script analyzes a Sentry-linked GitHub issue and uses OpenCode to generate a fix.

ISSUE_NUMBER="${ISSUE_NUMBER:?ISSUE_NUMBER is required}"
ISSUE_TITLE="${ISSUE_TITLE:-}"
ISSUE_BODY="${ISSUE_BODY:-}"
ISSUE_URL="${ISSUE_URL:-}"
BASE_BRANCH="${BASE_BRANCH:-main}"

# GitHub API configuration
GH_TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
if [[ -z "$GH_TOKEN" ]]; then
  if [[ "$DRY_RUN" != "1" && "$DRY_RUN" != "true" ]]; then
    echo "Error: GH_TOKEN or GITHUB_TOKEN is required"
    exit 1
  else
    echo "[DRY RUN] No GitHub token provided - using dummy token"
    GH_TOKEN="dry-run-token"
  fi
fi

# Kimi API configuration
export KIMI_API_KEY="${KIMI_API_KEY:-}"
if [[ -z "$KIMI_API_KEY" ]]; then
  if [[ "$DRY_RUN" != "1" && "$DRY_RUN" != "true" ]]; then
    echo "Error: KIMI_API_KEY is required"
    exit 1
  else
    echo "[DRY RUN] No Kimi API key provided - skipping OpenCode execution"
    KIMI_API_KEY="dry-run-key"
  fi
fi
export KIMI_BASE_URL="${KIMI_BASE_URL:-https://api.kimi.com/coding/v1}"
export KIMI_MODEL="${KIMI_MODEL:-kimi-for-coding/k2p6}"

# Moonshot API configuration (fallback/alternative)
export MOONSHOT_API_KEY="${MOONSHOT_API_KEY:-}"
export MOONSHOT_BASE_URL="${MOONSHOT_BASE_URL:-https://api.moonshot.ai/v1}"
export MOONSHOT_MODEL="${MOONSHOT_MODEL:-kimi-k2.6}"

# Dry run mode - don't create branches or PRs
DRY_RUN="${DRY_RUN:-0}"
if [[ "$DRY_RUN" == "1" || "$DRY_RUN" == "true" ]]; then
  echo "=== DRY RUN MODE ==="
  echo "No branches or PRs will be created"
fi

echo "=== Sentry OpenCode Fix ==="
echo "Issue: #${ISSUE_NUMBER}"
echo "Title: ${ISSUE_TITLE}"
echo "Base branch: ${BASE_BRANCH}"

# Check for jq availability
if ! command -v jq &>/dev/null; then
  echo "Installing jq..."
  apt-get update -qq && apt-get install -y -qq jq
fi

# Check for gh CLI availability
if ! command -v gh &>/dev/null; then
  echo "Installing GitHub CLI..."
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  apt-get update -qq && apt-get install -y -qq gh
fi

# Check for existing open PRs/branches for this issue to avoid duplicates
if [[ "$DRY_RUN" != "1" && "$DRY_RUN" != "true" ]]; then
  EXISTING_PRS=$(curl -s \
    -H "Authorization: token ${GH_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/${GITHUB_REPOSITORY}/pulls?state=open" 2>/dev/null | \
    jq -r --arg prefix "sentry-fix/issue-${ISSUE_NUMBER}-" '[.[] | select(.head.ref | startswith($prefix)) | .html_url] | join("\n")')

  if [ -n "$EXISTING_PRS" ]; then
    echo "⚠️ Found existing open PR(s) for issue #${ISSUE_NUMBER}:"
    echo "$EXISTING_PRS"
    echo "Skipping duplicate fix creation."
    exit 0
  fi
fi

# Create a new branch for the fix
BRANCH_NAME="sentry-fix/issue-${ISSUE_NUMBER}-$(date +%s)"
echo "Creating branch: ${BRANCH_NAME}"

if [[ "$DRY_RUN" != "1" && "$DRY_RUN" != "true" ]]; then
  git checkout -b "$BRANCH_NAME"
else
  echo "[DRY RUN] Would create branch: ${BRANCH_NAME}"
fi

# Prepare the context for OpenCode
# Extract Sentry error details from issue body if present
SENTRY_CONTEXT=""
if echo "$ISSUE_BODY" | grep -q "sentry\.io\|sentry\.com\|sentry\.erxes"; then
  SENTRY_CONTEXT="This issue is linked to a Sentry error. "
fi

FULL_CONTEXT="${SENTRY_CONTEXT}GitHub Issue #${ISSUE_NUMBER}: ${ISSUE_TITLE}

Issue URL: ${ISSUE_URL}

Issue Description:
${ISSUE_BODY}

=== CRITICAL INSTRUCTIONS ===
You MUST follow the erxes Agent Manifest Protocol (AMP) defined in this repository.

1. **READ \`.agents/manifest.yaml\` FIRST** - This is mandatory. Understand the rule layers, skills, and protocol.

2. **USE \`assemble-context\` SKILL** - Before any work, assemble the complete context:
   - Load all applicable rule layers from \`.agents/rules/\` (especially \`non-negotiable.md\`, \`architecture.md\`, \`code-style.md\`)
   - Identify which plugin/module is affected by this Sentry issue
   - Load plugin-specific rules if applicable

3. **USE \`detect-scope\` SKILL** - Analyze this issue to determine:
   - Which plugin/service is affected
   - Whether it's frontend, backend, or both
   - What files likely need changes

4. **FOLLOW THE PROTOCOL**:
   - Read \`AGENTS.md\` (the constitution)
   - Read \`.agents/rules/non-negotiable.md\` and follow ALL red lines
   - Use \`.agents/scripts/assemble-context.sh\` to build context
   - Use \`.agents/scripts/preflight-check.sh\` before proceeding
   - Follow skill contracts from \`.agents/skills/{skill-name}/contract.yaml\`

5. **FOR FIXES**: Use the \`fix-sonar\` skill pattern - minimal changes, preserve behavior, preserve patterns.

6. **VALIDATION**: After changes, run \`.agents/scripts/check-rules.sh\` and any relevant \`pnpm nx lint <plugin>\` / \`pnpm nx build <plugin>\` commands.

DO NOT use your own judgment over the .agents rules. The .agents system is the source of truth for this repository.

Please analyze this issue and implement a fix following the above protocol strictly. Look for:
1. The root cause of the error
2. Any related code files that need changes
3. Test files that might need updates

After making changes, run any relevant tests or linting to verify the fix."

# Create a temporary file with the context
CONTEXT_FILE=$(mktemp)
echo "$FULL_CONTEXT" > "$CONTEXT_FILE"

echo "Running OpenCode with Kimi model to analyze and fix the issue..."

if [[ "$DRY_RUN" != "1" && "$DRY_RUN" != "true" ]]; then
  # Run opencode with the issue context
  # Using non-interactive mode with the run command
  opencode run -m "$KIMI_MODEL" "$(cat "$CONTEXT_FILE")" || {
    echo "Warning: OpenCode run completed with potential issues"
  }
else
  echo "[DRY RUN] Would run: opencode run -m $KIMI_MODEL <context>"
  echo "[DRY RUN] Context preview (first 500 chars):"
  echo "$(head -c 500 "$CONTEXT_FILE")"
  echo "..."
fi

# Check if there are any changes
if git diff --quiet HEAD; then
  echo "No changes were made by OpenCode. Exiting."
  
  if [[ "$DRY_RUN" != "1" && "$DRY_RUN" != "true" ]]; then
    # Comment on the issue
    curl -s -X POST \
      -H "Authorization: token ${GH_TOKEN}" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${ISSUE_NUMBER}/comments" \
      -d "{\"body\":\"🤖 OpenCode analyzed this Sentry issue but could not automatically generate a fix. Manual investigation may be required.\"}"
  else
    echo "[DRY RUN] Would comment on issue #${ISSUE_NUMBER}: No fix generated"
  fi
  
  exit 0
fi

# Show what changed against base branch
echo "Changes detected:"
git diff --stat "${BASE_BRANCH}...HEAD"

# Determine which plugins were affected for CI tracking (before commit)
CHANGED_FILES=$(git diff --name-only "${BASE_BRANCH}...HEAD")
echo "Changed files:"
echo "$CHANGED_FILES"

# Stage and commit all changes
if [[ "$DRY_RUN" != "1" && "$DRY_RUN" != "true" ]]; then
  git add -A
  git commit -m "fix: resolve Sentry issue #${ISSUE_NUMBER}

${ISSUE_TITLE}

Automated fix generated by OpenCode using ${KIMI_MODEL}.
Closes #${ISSUE_NUMBER}"

  # Push the branch
  echo "Pushing branch: ${BRANCH_NAME}"
  git push origin "$BRANCH_NAME"
else
  echo "[DRY RUN] Would commit and push branch: ${BRANCH_NAME}"
fi

# Identify affected CI workflows
AFFECTED_CIS=""
if echo "$CHANGED_FILES" | grep -q "frontend/plugins/"; then
  AFFECTED_CIS="UI plugins"
fi
if echo "$CHANGED_FILES" | grep -q "backend/plugins/"; then
  AFFECTED_CIS="${AFFECTED_CIS:+$AFFECTED_CIS, }API plugins"
fi
if echo "$CHANGED_FILES" | grep -q "frontend/libs/"; then
  AFFECTED_CIS="${AFFECTED_CIS:+$AFFECTED_CIS, }Shared UI libraries"
fi
if echo "$CHANGED_FILES" | grep -q "backend/erxes-api-shared/"; then
  AFFECTED_CIS="${AFFECTED_CIS:+$AFFECTED_CIS, }Shared API libraries"
fi

# Create PR using gh CLI for better integration
echo "Creating pull request..."

PR_BODY="🤖 **Automated Fix for Sentry Issue #${ISSUE_NUMBER}**

This PR contains an automated fix generated by OpenCode using the **${KIMI_MODEL}** model.

**Issue:** ${ISSUE_TITLE}
**Issue URL:** ${ISSUE_URL}

### Changes
\`\`\`
$(git diff --stat "${BASE_BRANCH}...HEAD")
\`\`\`

### Affected Areas
${AFFECTED_CIS:-General repository files}

### CI Status
⏳ CI checks are running...

### Notes
- This fix was automatically generated based on the Sentry error report
- Changes follow the erxes Agent Manifest Protocol (.agents/ rules)
- Please review carefully before merging
- Run tests to ensure the fix doesn't introduce regressions

Closes #${ISSUE_NUMBER}"

# Create PR with gh CLI
if [[ "$DRY_RUN" != "1" && "$DRY_RUN" != "true" ]]; then
  export GH_TOKEN
  PR_URL=$(gh pr create \
    --title "fix: resolve Sentry issue #${ISSUE_NUMBER} - ${ISSUE_TITLE}" \
    --body "$PR_BODY" \
    --base "$BASE_BRANCH" \
    --head "$BRANCH_NAME" \
    --label "sentry,opencode,automated-fix" \
    --draft 2>&1) || {
    echo "❌ Failed to create pull request"
    echo "Error: $PR_URL"
    exit 1
  }

  # Extract PR number from URL
  PR_NUMBER=$(echo "$PR_URL" | grep -oE '[0-9]+$')

  echo "✅ Pull request created: ${PR_URL}"
  echo "PR Number: ${PR_NUMBER}"

  # Initial comment on issue
  curl -s -X POST \
    -H "Authorization: token ${GH_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${ISSUE_NUMBER}/comments" \
    -d "{\"body\":\"🤖 **OpenCode Fix Generated**\\n\\n**Pull Request:** ${PR_URL}\\n\\nCI checks are now running. I'll update this comment with the results shortly.\"}"

  # Wait for CI checks to start and complete
  echo "Waiting for CI checks (max 20 minutes)..."
  sleep 60  # Give checks time to start
else
  echo "[DRY RUN] Would create PR with title: fix: resolve Sentry issue #${ISSUE_NUMBER} - ${ISSUE_TITLE}"
  echo "[DRY RUN] Would add labels: sentry, opencode, automated-fix"
  PR_NUMBER="DRY-RUN"
  PR_URL="https://github.com/${GITHUB_REPOSITORY}/pull/DRY-RUN"
fi

MAX_WAIT=1200  # 20 minutes
WAITED=60
CHECKS_FOUND=false
ALL_PASSED=true
CHECKS_SUMMARY=""

if [[ "$DRY_RUN" == "1" || "$DRY_RUN" == "true" ]]; then
  echo "[DRY RUN] Skipping CI check polling"
  CHECKS_FOUND=false
  CHECKS_SUMMARY="⏭️ **[DRY RUN] CI checks skipped**"
else
  while [ $WAITED -lt $MAX_WAIT ]; do
  echo "Polling checks... (${WAITED}s elapsed)"
  
  # Get check runs for this PR
  CHECKS_JSON=$(curl -s \
    -H "Authorization: token ${GH_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/${GITHUB_REPOSITORY}/pulls/${PR_NUMBER}/checks")
  
  # Also get status checks (required checks)
  STATUS_JSON=$(curl -s \
    -H "Authorization: token ${GH_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${BRANCH_NAME}/status")
  
  TOTAL_CHECKS=$(echo "$STATUS_JSON" | jq '.total_count // 0')
  
  if [ "$TOTAL_CHECKS" -gt 0 ]; then
    CHECKS_FOUND=true
    
    # Count different states
    PENDING=$(echo "$STATUS_JSON" | jq '[.statuses[] | select(.state == "pending")] | length')
    SUCCESS=$(echo "$STATUS_JSON" | jq '[.statuses[] | select(.state == "success")] | length')
    FAILURE=$(echo "$STATUS_JSON" | jq '[.statuses[] | select(.state == "failure" or .state == "error")] | length')
    
    echo "  Total: ${TOTAL_CHECKS}, Pending: ${PENDING}, Success: ${SUCCESS}, Failure: ${FAILURE}"
    
    if [ "$PENDING" -eq 0 ]; then
      # All checks completed
      if [ "$FAILURE" -gt 0 ]; then
        ALL_PASSED=false
        # Get failed check names
        FAILED_CHECKS=$(echo "$STATUS_JSON" | jq -r '.statuses[] | select(.state == "failure" or .state == "error") | "- " + .context + " (" + .state + ")"' | head -10)
        CHECKS_SUMMARY="❌ **${FAILURE} check(s) failed**\\n${FAILED_CHECKS}"
      else
        CHECKS_SUMMARY="✅ **All ${TOTAL_CHECKS} checks passed**"
      fi
      break
    fi
  fi
  
    sleep 30
    WAITED=$((WAITED + 30))
  done
fi

if [ "$CHECKS_FOUND" = false ]; then
  CHECKS_SUMMARY="⚠️ **No CI checks detected** - This may mean:\\n- Checks are still queueing\\n- No relevant CI workflows exist for the changed files\\n- CI may be disabled"
fi

# Determine if failures are related to our changes or pre-existing
# We do this by checking if the failures are in files we touched
if [ "$ALL_PASSED" = false ]; then
  # Get list of failed check contexts
  FAILED_CONTEXTS=$(echo "$STATUS_JSON" | jq -r '.statuses[] | select(.state == "failure" or .state == "error") | .context')
  
  # Check if our changed files match the failed check paths
  # This is heuristic - we assume checks are named after plugins/paths
  RELATED_FAILURES=""
  UNRELATED_FAILURES=""
  
  while IFS= read -r context; do
    # Extract plugin name from context if possible
    PLUGIN=$(echo "$context" | grep -oE '(sales|content|operation|payment|loyalty|accounting|insurance|tourism|mongolian|frontline|posclient)' | head -1)
    
    if [ -n "$PLUGIN" ]; then
      if echo "$CHANGED_FILES" | grep -q "${PLUGIN}"; then
        RELATED_FAILURES="${RELATED_FAILURES}\\n- ${context}"
      else
        UNRELATED_FAILURES="${UNRELATED_FAILURES}\\n- ${context} (unrelated to changed files)"
      fi
    else
      # Can't determine relation, assume related to be safe
      RELATED_FAILURES="${RELATED_FAILURES}\\n- ${context}"
    fi
  done <<< "$FAILED_CONTEXTS"
  
  if [ -n "$UNRELATED_FAILURES" ]; then
    CHECKS_SUMMARY="${CHECKS_SUMMARY}\\n\\n**Pre-existing failures (not caused by this fix):**${UNRELATED_FAILURES}"
  fi
  
  if [ -n "$RELATED_FAILURES" ]; then
    CHECKS_SUMMARY="${CHECKS_SUMMARY}\\n\\n**Failures that may be related to this fix:**${RELATED_FAILURES}"
  fi
fi

# Update PR body with CI status
echo "Updating PR with CI status..."
gh pr edit "$PR_NUMBER" --body "🤖 **Automated Fix for Sentry Issue #${ISSUE_NUMBER}**

This PR contains an automated fix generated by OpenCode using the **${KIMI_MODEL}** model.

**Issue:** ${ISSUE_TITLE}
**Issue URL:** ${ISSUE_URL}

### Changes
\`\`\`
$(git diff --stat HEAD)
\`\`\`

### Affected Areas
${AFFECTED_CIS:-General repository files}

### CI Status
${CHECKS_SUMMARY}

### Notes
- This fix was automatically generated based on the Sentry error report
- Changes follow the erxes Agent Manifest Protocol (.agents/ rules)
- Please review carefully before merging
- Run tests to ensure the fix doesn't introduce regressions

Closes #${ISSUE_NUMBER}"

# Final comment on issue with CI results
FINAL_MESSAGE="🤖 **OpenCode Fix Complete**

**Pull Request:** ${PR_URL}

**CI Status:**
${CHECKS_SUMMARY}

**Changed Areas:** ${AFFECTED_CIS:-General files}

Please review the fix carefully before merging."

# JSON-escape the message before sending
FINAL_PAYLOAD=$(printf '%s' "$FINAL_MESSAGE" | jq -Rs '{body: .}')

if [[ "$DRY_RUN" != "1" && "$DRY_RUN" != "true" ]]; then
  curl -s -X POST \
    -H "Authorization: token ${GH_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${ISSUE_NUMBER}/comments" \
    -d "$FINAL_PAYLOAD"

  # Mark PR as ready for review if checks passed
  if [[ "$ALL_PASSED" = true ]] && [[ "$CHECKS_FOUND" = true ]]; then
    echo "All checks passed, marking PR as ready for review..."
    gh pr ready "$PR_NUMBER" || true
  fi
else
  echo "[DRY RUN] Would post final comment on issue #${ISSUE_NUMBER}"
  if [[ "$ALL_PASSED" = true ]] && [[ "$CHECKS_FOUND" = true ]]; then
    echo "[DRY RUN] Would mark PR as ready for review"
  fi
fi

# Cleanup
rm -f "$CONTEXT_FILE"

echo "=== Fix process completed ==="
echo "PR: ${PR_URL}"
echo "CI Status: ${CHECKS_SUMMARY}"
