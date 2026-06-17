# Sentry to OpenCode Automation

This document describes the automation loop for:

Sentry issue/event -> GitHub issue -> OpenCode AI agent -> branch -> commit -> pull request.

Current Sentry instance:

- URL: `https://sentry.erxes.io`
- Project: `erxes-api`
- UI version: `26.5.0`

## Flow

1. Sentry detects a new issue or regression in `erxes-api`.
2. A Sentry alert rule creates a GitHub issue with labels `sentry` and `bug`.
3. `.github/workflows/opencode-autofix.yml` triggers on issue creation or labeling.
4. The workflow runs the OpenCode GitHub Action with the `erxes-bug-fixer` agent.
5. The agent analyzes the issue, applies noise filtering, and either:
   - Posts a triage comment (for non-actionable issues), or
   - Creates a branch, commits a fix, and opens a draft PR.

The same workflow also handles issues labeled `bug` (without `sentry`), covering
manually reported bugs as well.

## Unified Workflow

The workflow file `.github/workflows/opencode-autofix.yml` replaces the previous
separate workflows (`opencode-sentry.yml` and `sentry-opencode-fix.yml`).

Trigger conditions:

- Issue is opened or labeled
- Issue has `bug` OR `sentry` label (either one is sufficient)
- Issue is not a pull request

The workflow uses:

- **Action:** `anomalyco/opencode/github@latest`
- **Agent:** `erxes-bug-fixer` (defined in `.github/agents/erxes-bug-fixer.agent.md`)
- **Model:** `kimi-for-coding/k2p6`

## Sentry Alert Rule Setup

Use Sentry's existing GitHub integration. Do not send Sentry credentials to GitHub Actions unless a future workflow needs to call the Sentry API directly.

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
   - Labels: `sentry`, `bug`.

Required GitHub issue labels:

- `sentry` — Marks the issue as originating from Sentry
- `bug` — Marks the issue as a bug for triage and tracking

The workflow triggers on either label independently.

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

## Required GitHub Secrets

| Secret | Required | Purpose |
|--------|----------|---------|
| `KIMI_API_KEY` | Yes | Kimi model API access for OpenCode |
| `GH_TOKEN` (PAT) | Optional | Only if branch protection blocks `GITHUB_TOKEN` |
| `SENTRY_AUTH_TOKEN` | No | Not needed — Sentry creates the GitHub issue |

## GitHub Workflow Permissions

The workflow needs:

- `id-token: write`
- `contents: write`
- `pull-requests: write`
- `issues: write`

Repository settings must allow GitHub Actions to create pull requests.

## Noise Filtering

The agent includes a noise filter that prevents unnecessary PRs for:

- Auth failures, expired tokens, rate limits
- Bot/crawler traffic
- Bad user input
- External service outages
- Infrastructure issues

For these cases, the agent posts a triage comment instead of creating a PR.

## Local Dry Run

The `scripts/run-opencode-sentry-fix.sh` script is still available for local testing:

```bash
ISSUE_NUMBER=999 \
ISSUE_TITLE="Test Sentry automation" \
ISSUE_BODY="Fake Sentry stack trace from https://sentry.erxes.io/issues/123/" \
ISSUE_URL="https://github.com/erxes/erxes/issues/999" \
DRY_RUN=1 \
bash scripts/run-opencode-sentry-fix.sh
```

Dry-run without calling OpenCode:

```bash
ISSUE_NUMBER=999 \
ISSUE_TITLE="Test Sentry automation" \
ISSUE_BODY="Fake Sentry stack trace from https://sentry.erxes.io/issues/123/" \
ISSUE_URL="https://github.com/erxes/erxes/issues/999" \
DRY_RUN=1 \
SKIP_AGENT=1 \
bash scripts/run-opencode-sentry-fix.sh
```

## Rollback

To disable automation without touching Sentry:

1. Disable `.github/workflows/opencode-autofix.yml` in GitHub Actions, or remove the `bug`/`sentry` labels from affected issues.
2. Delete any unneeded automation branches named `sentry-fix/*`.
3. Close unneeded generated PRs.

To stop creating GitHub issues from Sentry:

1. Disable the Sentry alert rule in project `erxes-api`.
2. Or remove the GitHub issue action from the alert rule.

No Sentry instrumentation files are changed by this automation.
