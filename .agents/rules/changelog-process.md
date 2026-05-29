# erxes Changelog Process

## Current Process

erxes keeps release notes in the root `CHANGELOG.md`. The root `package.json`
uses:

```json
{
  "scripts": {
    "release": "release-it"
  }
}
```

The changelog follows conventional-changelog style sections such as:

- `Bug Fixes`
- `Features`
- `Reverts`

Entries include commit links and PR/issue references when available.

## Normal Feature Work

- Do not manually edit `CHANGELOG.md` for ordinary feature or bug-fix work
  unless the task explicitly asks for a release/changelog update.
- Use clear commit messages when committing is requested. Prefer conventional
  scopes used in the project, such as `content`, `frontline`, `sales`,
  `payment`, `loyalty`, `operation`, `accounting`, `mongolian`, `tourism`,
  `core`, and `gateway`.

## Release Work

When the task is to prepare a release:

1. Confirm the target version.
2. Confirm the release date.
3. Review commits since the previous tag/version.
4. Group user-visible changes under the existing changelog headings.
5. Preserve the existing markdown format in `CHANGELOG.md`.
6. Run or document the release command only when requested:

```bash
pnpm release
```

## Research Commands

```bash
git log --oneline --no-merges
git log <previous-tag>..<new-tag> --oneline
gh pr list --state merged --limit 50
```

Use `rg` to inspect specific feature areas when release notes need more context.

## Review Checklist

- Version and compare links are correct.
- Date is correct.
- Entries are grouped under the existing headings.
- Links point to erxes repository commits or PRs.
- No unrelated historical changelog content was reformatted.
