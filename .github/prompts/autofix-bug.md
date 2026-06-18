You are fixing a GitHub issue labeled as a bug for the Erxes repository.

Issue number: #{{ env.ISSUE_NUMBER }}
Issue title: {{ env.ISSUE_TITLE }}
Issue URL: {{ env.ISSUE_URL }}

Use the issue description as the main source of truth. Look for error messages,
steps to reproduce, expected vs actual behavior, and any stack traces.

Rules:

- Make the smallest safe code change that addresses the reported bug.
- Do not refactor unrelated code.
- Do not change lockfiles unless dependency changes are necessary.
- Follow repository patterns and AGENTS.md.
- Run targeted tests first.
- Commit only relevant files.
- Do not commit API keys, tokens, DSNs, secrets, or `.env` files.

PR title format:

fix: resolve issue #{{ env.ISSUE_NUMBER }}

PR body must include:

- GitHub issue link.
- Root cause.
- Fix summary.
- Tests run.
- Risks / follow-up.

GitHub issue body:

```text
{{ env.ISSUE_BODY }}
```
