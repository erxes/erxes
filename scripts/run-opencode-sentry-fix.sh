#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROMPT_TEMPLATE="${ROOT_DIR}/.github/prompts/fix-sentry-issue.md"
ISSUE_NUMBER="${ISSUE_NUMBER:-}"
ISSUE_TITLE="${ISSUE_TITLE:-}"
ISSUE_BODY="${ISSUE_BODY:-}"
ISSUE_URL="${ISSUE_URL:-}"
DRY_RUN="${DRY_RUN:-0}"
SKIP_AGENT="${SKIP_AGENT:-0}"
REMOTE_NAME="${REMOTE_NAME:-origin}"

fail() {
  printf 'error: %s\n' "$1" >&2
  exit 1
}

require_env() {
  local name="$1"
  local value="${!name:-}"
  if [ -z "$value" ]; then
    fail "$name is required"
  fi
}

build_prompt() {
  perl -0pe '
    s/ISSUE_NUMBER/$ENV{ISSUE_NUMBER}/g;
    s/ISSUE_TITLE/$ENV{ISSUE_TITLE}/g;
    s/ISSUE_URL/$ENV{ISSUE_URL}/g;
    s/ISSUE_BODY/$ENV{ISSUE_BODY}/g;
  ' "$PROMPT_TEMPLATE"
}

configure_opencode() {
  if [ -n "${KIMI_API_KEY:-}" ]; then
    export OPENCODE_MODEL="kimi/${KIMI_MODEL:-kimi-for-coding}"
    export OPENCODE_CONFIG_CONTENT
    OPENCODE_CONFIG_CONTENT=$(cat <<JSON
{
  "\$schema": "https://opencode.ai/config.json",
  "model": "{env:OPENCODE_MODEL}",
  "provider": {
    "kimi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Kimi Code",
      "options": {
        "baseURL": "${KIMI_BASE_URL:-https://api.kimi.com/coding/v1}",
        "apiKey": "{env:KIMI_API_KEY}"
      },
      "models": {
        "${KIMI_MODEL:-kimi-for-coding}": {
          "name": "${KIMI_MODEL:-kimi-for-coding}"
        }
      }
    }
  }
}
JSON
)
    return
  fi

  if [ -n "${MOONSHOT_API_KEY:-}" ]; then
    export OPENCODE_MODEL="moonshot/${MOONSHOT_MODEL:-kimi-k2.6}"
    export OPENCODE_CONFIG_CONTENT
    OPENCODE_CONFIG_CONTENT=$(cat <<JSON
{
  "\$schema": "https://opencode.ai/config.json",
  "model": "{env:OPENCODE_MODEL}",
  "provider": {
    "moonshot": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Moonshot",
      "options": {
        "baseURL": "${MOONSHOT_BASE_URL:-https://api.moonshot.ai/v1}",
        "apiKey": "{env:MOONSHOT_API_KEY}"
      },
      "models": {
        "${MOONSHOT_MODEL:-kimi-k2.6}": {
          "name": "${MOONSHOT_MODEL:-kimi-k2.6}"
        }
      }
    }
  }
}
JSON
)
    return
  fi

  fail "Set KIMI_API_KEY or MOONSHOT_API_KEY before running OpenCode"
}

run_known_safe_checks() {
  if [ -f "${ROOT_DIR}/package.json" ]; then
    printf 'Running package validation: pnpm --version\n'
    pnpm --version
  fi
}

require_env ISSUE_NUMBER
require_env ISSUE_TITLE
require_env ISSUE_BODY
require_env ISSUE_URL

[ -f "$PROMPT_TEMPLATE" ] || fail "Prompt template not found at $PROMPT_TEMPLATE"

cd "$ROOT_DIR"

BRANCH_NAME="automated/sentry-issue-${ISSUE_NUMBER}"
PROMPT_FILE="$(mktemp)"
trap 'rm -f "$PROMPT_FILE"' EXIT
build_prompt > "$PROMPT_FILE"

if [ "$DRY_RUN" = "1" ]; then
  {
    printf '\n\nDry-run instruction:\n'
    printf 'DRY_RUN=1 is set. Inspect and propose changes if needed, but do not commit, push, or create a pull request.\n'
  } >> "$PROMPT_FILE"
fi

printf 'Preparing Sentry automation for issue #%s\n' "$ISSUE_NUMBER"

if [ "$DRY_RUN" = "1" ]; then
  printf 'DRY_RUN=1: will not push a branch or create a pull request.\n'
else
  git checkout -B "$BRANCH_NAME"
fi

START_SHA="$(git rev-parse HEAD)"

if [ "$SKIP_AGENT" = "1" ]; then
  printf 'SKIP_AGENT=1: built prompt at %s and skipped OpenCode.\n' "$PROMPT_FILE"
else
  command -v opencode >/dev/null 2>&1 || fail "opencode is not installed. Install with: npm install -g opencode-ai@latest"
  configure_opencode
  printf 'Running OpenCode with model %s\n' "$OPENCODE_MODEL"
  opencode run --model "$OPENCODE_MODEL" --agent build --file "$PROMPT_FILE" "Fix the Sentry-generated GitHub issue using the attached prompt."
fi

HAS_WORKTREE_CHANGES=0
HAS_NEW_COMMITS=0

if ! git diff --quiet || ! git diff --cached --quiet; then
  HAS_WORKTREE_CHANGES=1
fi

if [ "$(git rev-parse HEAD)" != "$START_SHA" ]; then
  HAS_NEW_COMMITS=1
fi

if [ "$HAS_WORKTREE_CHANGES" = "0" ] && [ "$HAS_NEW_COMMITS" = "0" ]; then
  printf 'No file changes or new commits detected after agent run.\n'
  exit 0
fi

run_known_safe_checks

if [ "$DRY_RUN" = "1" ]; then
  printf 'DRY_RUN=1: changes detected, but skipping commit, push, and PR creation.\n'
  git status --short
  exit 0
fi

if [ "$HAS_WORKTREE_CHANGES" = "1" ]; then
  git add -A
  git commit -m "fix: resolve Sentry issue #${ISSUE_NUMBER}"
fi

git push --set-upstream "$REMOTE_NAME" "$BRANCH_NAME"

command -v gh >/dev/null 2>&1 || fail "gh CLI is required to create the pull request"

SENTRY_LINK="$(printf '%s\n' "$ISSUE_BODY" | grep -Eo 'https://sentry\.erxes\.io/[^[:space:])>]+' | head -n 1 || true)"
PR_BODY="$(mktemp)"
trap 'rm -f "$PROMPT_FILE" "$PR_BODY"' EXIT
{
  printf 'Closes %s\n\n' "$ISSUE_URL"
  printf '## Sentry issue\n\n'
  if [ -n "$SENTRY_LINK" ]; then
    printf '%s\n\n' "$SENTRY_LINK"
  else
    printf 'Not present in the GitHub issue body.\n\n'
  fi
  printf '## Root cause\n\n'
  printf 'See the generated commit and issue context.\n\n'
  printf '## Fix summary\n\n'
  printf 'Implemented by OpenCode from the Sentry-generated issue context.\n\n'
  printf '## Tests run\n\n'
  printf '- `pnpm --version`\n\n'
  printf '## Risks / follow-up\n\n'
  printf '- Review the generated diff and run broader project-specific checks before merge.\n'
} > "$PR_BODY"

gh pr create \
  --title "fix: resolve Sentry issue #${ISSUE_NUMBER}" \
  --body-file "$PR_BODY" \
  --base "${BASE_BRANCH:-main}" \
  --head "$BRANCH_NAME"
