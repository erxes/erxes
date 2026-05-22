# 40 — Safety

> Things that look harmless but break the build, the gateway, the federation, or production.

## Before editing

### Editing `erxes-api-shared`?
Rebuild before testing dependents:
```bash
pnpm nx build erxes-api-shared
```
Otherwise dependent services use the **stale dist** and your changes don't show up.

### Adding a new port?
Check [`../memory/stack.md`](../memory/stack.md) — collisions silently break service discovery. Update the table when you add one.

### Touching `module-federation.config.ts`?
- Don't change `name:` (it's the federation handle; other apps reference it)
- Don't change `shared:` core libraries (singletons across host/remotes)
- New exposes must be lazy-loaded by consumers; if not, host bundle bloats

### Touching `apollo/schema/extensions.ts` (federation directives)?
Get a second opinion. Wrong `@key` or `@external` directives produce composition errors at gateway startup; the whole API goes down.

### Modifying `core-api`?
Stop. Check plugin impacts first:
- Does any plugin extend a core type?
- Does any plugin reference a core query/mutation?
- Does the change require a new field that plugins must populate?

A breaking core change can take down every plugin.

## Common silent failures

### "It compiles but data doesn't appear"
- Forgot to add the field to a Mongoose schema (`db/definitions/`)
- Forgot to expose the field in GraphQL (`graphql/schemas/`)
- Forgot to update the GraphQL **fragment** the UI uses
- Federation didn't pick up the change — restart the gateway

### "Local works, deployed breaks"
- Used a newer Node API not in the production runtime
- Hard-coded `localhost:<port>` instead of the gateway URL
- Forgot to update env vars (`.env.example`)

### "It works for me but not for another tenant"
- Subdomain leak — see [`30-multi-tenancy.md`](./30-multi-tenancy.md)
- Global cache key not scoped by subdomain

### "Tests pass but the UI is broken"
- Module federation share mismatch — singleton lib has two versions loaded
- A lazy import path is wrong — silent at build time, fails at navigation

## Things that are NEVER OK

- `// @ts-ignore` or `// @ts-expect-error` without a comment explaining why and a TODO with a deadline
- `as any` to silence the type checker
- Modifying generated files (`*.generated.ts`)
- Committing `.env`, `.env.local`, `credentials.json`, or any file with secrets
- `git push --force` to `main`
- Adding a dependency without checking [`../memory/stack.md`](../memory/stack.md) — it may conflict with the existing version
- `npm install` or `yarn add` — **pnpm only**

## When you've already broken something

1. **Don't pile on.** Stop and assess.
2. Check `git status` — is the breakage in committed code or working tree?
3. If working tree: `git diff` shows the problem.
4. If committed: `git log` to find the offending commit; consider `git revert` (not `git reset --hard`) for shared branches.
5. If you genuinely can't recover, **tell the developer**. Don't silently leave a half-working state.

## Recovery is cheap; cover-up is expensive

A reverted commit costs minutes. A subtle bug in production costs hours of debugging and possibly customer trust. Always choose the cheap recovery.
