# REVIEW: <wish title>

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md) | **Plan:** [`./PLAN.md`](./PLAN.md)

## Self-review of the diff

I ran `git diff main...HEAD` and read every changed line.

### Slop checklist walk-through

For each item in [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md):

- [ ] **Comments that restate the code** — clean / fixed
- [ ] **try/catch around code that cannot fail** — clean / fixed
- [ ] **Helpers extracted for a single caller** — clean / fixed
- [ ] **Backwards-compat shims for code that doesn't exist** — clean / fixed
- [ ] **// TODO: implement** — clean / fixed
- [ ] **Tests that only assert non-throw** — clean / fixed
- [ ] **Validation at internal boundaries** — clean / fixed
- [ ] **"Just in case" parameters** — clean / fixed
- [ ] **Renaming unused params to _var** — clean / fixed
- [ ] **Feature flags / config knobs for non-configurable code** — clean / fixed
- [ ] **Re-exports without purpose** — clean / fixed
- [ ] **Defensive optional chaining on non-null types** — clean / fixed
- [ ] **console.log left in shipped code** — clean / fixed
- [ ] **`any` to silence the type checker** — clean / fixed

### Other things I checked

- [ ] No files touched outside SPEC scope (if any, disclosed in PR)
- [ ] Subdomain scoping respected on every data path
- [ ] No cross-plugin direct imports
- [ ] No new ports introduced
- [ ] No `erxes-api-shared` changes without rebuild
- [ ] No `npm` / `yarn` usage
- [ ] No secrets committed

## Acceptance criteria — each verified

For each SPEC.md acceptance criterion:

1. **<criterion 1>** — verified by test `<test name>` (passing)
2. **<criterion 2>** — verified by ...
3. ...

## Lessons captured

Did I learn anything non-obvious during this wish?
- [ ] Yes — added entry to [`../../memory/lessons.md`](../../memory/lessons.md): "<title>"
- [ ] No — nothing surprising

## Final verification

- [ ] `.agents/evals/run.sh sales` exit 0 — output captured below
- [ ] Playwright spec covering SPEC criteria passing

```
<paste output of evals/run.sh sales>
```

## PR

- Title: <PR title>
- Body: filled per [`../../.github/PULL_REQUEST_TEMPLATE.md`](../../../.github/PULL_REQUEST_TEMPLATE.md)
- Link: <URL after opening>
