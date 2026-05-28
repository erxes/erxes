# Sentry to OpenCode Automation

This document describes the minimal automation loop for:

Sentry issue/event -> GitHub issue -> OpenCode/Kimi agent -> branch -> commit -> pull request.

Current Sentry instance:

- URL: `https://sentry.erxes.io`
- Project: `erxes-api`
- UI version: `26.5.0`

## Flow

1. Sentry detects a new issue or regression in `erxes-api`.
2. A Sentry alert rule creates or notifies a GitHub issue.
3. The GitHub issue has both required automation labels: `sentry` and `opencode`.
4. `.github/workflows/sentry-opencode-fix.yml` runs on issue open, edit, or label changes.
5. `scripts/run-opencode-sentry-fix.sh` creates `automated/sentry-issue-${ISSUE_NUMBER}`, runs OpenCode in non-interactive mode, commits relevant changes if any, pushes the branch, and opens a PR linked to the issue.

## Sentry Alert Rule Setup

Use Sentry's existing GitHub integration. Do not send Sentry credentials to GitHub Actions unless a future workflow needs to call the Sentry API directly.

## Production Sentry Release

Use a release value that changes on each deploy so Sentry can tie an error back to the exact code revision:

```bash
SENTRY_RELEASE=erxes-<short-git-sha>
```

For local API development through `pnpm dev:apis`, `scripts/start-api-dev.js` auto-generates `SENTRY_RELEASE=erxes-$(git rev-parse --short HEAD)` when `SENTRY_RELEASE` is missing or still set to `erxes-<git-sha-or-version>`.

For deploy scripts or Docker commands, wrap the command with:

```bash
bash scripts/with-sentry-release.sh <your-deploy-command>
```

Example:

```bash
bash scripts/with-sentry-release.sh docker compose up -d --build
```

Keep `SENTRY_DSN` in server environment variables or secret managers. Do not commit it.

In Sentry:

1. Open `https://sentry.erxes.io`.
2. Go to project `erxes-api`.
3. Confirm the GitHub integration is installed and connected to the `erxes/erxes` repository.
4. Create an issue alert rule for new issues or regressions.
5. Use conditions similar to:
   - When a new issue is created.
   - Or when an issue changes state from resolved to unresolved.
6. Add an action that creates or notifies a GitHub issue.
7. Configure the GitHub issue content to include:
   - Sentry issue URL.
   - Sentry issue title.
   - Stack trace or the most relevant stack frame.
   - Environment.
   - Release, if available.
   - Event URL, if available.
   - Labels: `sentry`, `opencode`, `bug`.

Required GitHub issue labels:

- `sentry`
- `opencode`
- `bug`

The workflow only requires `sentry` and `opencode` to run. `bug` is required for triage consistency.

## Required GitHub Secrets

Add one model credential option:

- Preferred Kimi Code option:
  - `KIMI_API_KEY`
  - optional `KIMI_BASE_URL`, default `https://api.kimi.com/coding/v1`
  - optional `KIMI_MODEL`, default `kimi-for-coding`

- Alternative Moonshot Platform option:
  - `MOONSHOT_API_KEY`
  - optional `MOONSHOT_BASE_URL`, default `https://api.moonshot.ai/v1`
  - optional `MOONSHOT_MODEL`, default `kimi-k2.6`

GitHub token:

- The workflow uses the default GitHub Actions token by default.
- If branch protection or organization policy requires a PAT, add `GH_TOKEN`.

Optional:

- `SENTRY_AUTH_TOKEN` is not required for the current loop because Sentry creates the GitHub issue. Add it only if a future workflow fetches Sentry event details directly.

## GitHub Workflow Permissions

The workflow needs:

- `contents: write`
- `pull-requests: write`
- `issues: read`

Repository settings must allow GitHub Actions to create pull requests.

## Local Dry Run

Dry-run validates prompt assembly and runner behavior without pushing or creating a PR.

```bash
ISSUE_NUMBER=999 \
ISSUE_TITLE="Test Sentry automation" \
ISSUE_BODY="Fake Sentry stack trace from https://sentry.erxes.io/issues/123/" \
ISSUE_URL="https://github.com/erxes/erxes/issues/999" \
DRY_RUN=1 \
bash scripts/run-opencode-sentry-fix.sh
```

Dry-run still checks that `opencode` is installed and model credentials exist unless you set:

```bash
SKIP_AGENT=1
```

Example dry-run without calling OpenCode:

```bash
ISSUE_NUMBER=999 \
ISSUE_TITLE="Test Sentry automation" \
ISSUE_BODY="Fake Sentry stack trace from https://sentry.erxes.io/issues/123/" \
ISSUE_URL="https://github.com/erxes/erxes/issues/999" \
DRY_RUN=1 \
SKIP_AGENT=1 \
bash scripts/run-opencode-sentry-fix.sh
```

## Local Real Run

Install OpenCode locally:

```bash
npm install -g opencode-ai@latest
```

Set one credential option:

```bash
export KIMI_API_KEY="..."
export KIMI_BASE_URL="https://api.kimi.com/coding/v1"
export KIMI_MODEL="kimi-for-coding"
```

Or:

```bash
export MOONSHOT_API_KEY="..."
export MOONSHOT_BASE_URL="https://api.moonshot.ai/v1"
export MOONSHOT_MODEL="kimi-k2.6"
```

Then run with a real issue:

```bash
ISSUE_NUMBER=123 \
ISSUE_TITLE="Sentry issue title" \
ISSUE_BODY="$(gh issue view 123 --json body --jq .body)" \
ISSUE_URL="https://github.com/erxes/erxes/issues/123" \
bash scripts/run-opencode-sentry-fix.sh
```

## Rollback

To disable automation without touching Sentry:

1. Disable `.github/workflows/sentry-opencode-fix.yml` in GitHub Actions, or remove the `opencode` label from affected issues.
2. Delete any unneeded automation branches named `automated/sentry-issue-*`.
3. Close unneeded generated PRs.

To stop creating GitHub issues from Sentry:

1. Disable the Sentry alert rule in project `erxes-api`.
2. Or remove the GitHub issue action from the alert rule.

No Sentry instrumentation files are changed by this automation.
