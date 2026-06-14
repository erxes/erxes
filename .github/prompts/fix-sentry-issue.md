You are fixing a GitHub issue generated from Sentry for the Erxes repository.

Issue number: #{{ env.ISSUE_NUMBER }}
Issue title: {{ env.ISSUE_TITLE }}
Issue URL: {{ env.ISSUE_URL }}

Use the Sentry stack trace and GitHub issue body as the main source of truth. Identify the likely failing layer and files before editing.

Rules:

- Make the smallest safe code change that addresses the reported bug.
- Do not refactor unrelated code.
- Do not change lockfiles unless dependency changes are necessary.
- Preserve existing local Sentry instrumentation files unless they are directly wrong for this bug.
- Follow repository patterns and AGENTS.md.
- Run targeted tests first.
- If full tests are too expensive, run the most relevant command and document exactly what was run.
- Commit only relevant files.
- Do not commit API keys, tokens, DSNs, secrets, or `.env` files.

PR title format:

fix: resolve Sentry issue #{{ env.ISSUE_NUMBER }}

PR body must include:

- GitHub issue link.
- Sentry issue link if present.
- Root cause.
- Fix summary.
- Tests run.
- Risks / follow-up.

Before finishing, write `.opencode-sentry-pr.md` with this exact structure:

```markdown
## Root cause

<specific root cause, or "Unable to determine from available Sentry context">

## Fix summary

<specific files/behavior changed>

## Tests run

- `<command>`

## Risks / follow-up

- <risk or follow-up, or "None identified">
```

GitHub issue body:

```text
{{ env.ISSUE_BODY }}
```
