# GitHub Actions Security

## Pin Third-Party Actions

Prefer pinning third-party actions and reusable workflows to full commit SHAs.
Mutable tags can be changed upstream.

```yaml
# Avoid mutable tags when updating security-sensitive workflows
uses: actions/checkout@v4

# Prefer a full SHA with a version comment for readability
uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4.3.1
```

When updating an existing workflow that uses tags, keep the change scoped. Do
not churn every workflow unless the task is specifically workflow hardening.
Existing erxes workflows may still use version tags such as `actions/checkout@v4`;
do not rewrite those opportunistically during unrelated CI changes.

## Minimal Permissions

Declare explicit permissions at the workflow or job level.

```yaml
permissions:
  contents: read
```

Avoid broad permissions such as:

```yaml
permissions: write-all
```

## Secrets and Shell Safety

- Never echo secrets.
- Pass GitHub expression values into shell through `env` variables, especially
  user-controlled values such as branch names, PR titles, and labels.
- Quote shell variables.
- Avoid inline JSON with unescaped `${{ }}` expressions in shell scripts.

## Workflow Changes

- Keep workflow edits focused on the requested CI/CD behavior.
- Preserve existing pnpm, Nx, Docker, and release steps unless the task is to
  change them.
- Do not broaden tokens, deploy credentials, or environment access to fix an
  unrelated failure.
