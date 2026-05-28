# add accounting graphql query

> **When to use:** the wish needs a new GraphQL **read** on a accounting entity that the existing `accounts`/`accountDetail`/`pipelines`/`stages` queries can't serve — e.g., `accountsByPriority`, `accountsClosingThisWeek`, `pipelineHealthSummary`.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters (all in `backend/plugins/accounting_api/src/modules/accounting/`):

| Sister | Shape | Why |
|---|---|---|
| `accounts(...)` | list + filter + cursor pagination | most common shape — copy this for any "list with filters" |
| `accountsTotalCount(...)` | scalar derived from same filter | mirrors a counter/aggregate read |
| `accountDetail(_id)` | single-entity read by id | mirrors a "fetch one" |

**Read these files in full** before writing any code:

- `backend/plugins/accounting_api/src/modules/accounting/graphql/schemas/account.ts` — `queryParams`, the `queries` export, see how `accounts` declares filter input
- `backend/plugins/accounting_api/src/modules/accounting/graphql/resolvers/queries/accounts.ts` — the `accountQueries` object + `generateFilter()` (the canonical filter builder)
- `backend/plugins/accounting_api/src/apollo/resolvers/queries.ts` — how `accountQueries` is merged into the root resolver
- `backend/plugins/accounting_api/src/apollo/schema/schema.ts` — how `AccountQueries` typedef block joins the rest
- `backend/plugins/accounting_api/src/modules/accounting/graphql/resolvers/customResolvers/account.ts` — read-only, to see how DataLoaders avoid N+1 (line 7+: `customers`, `companies`)

Permissions sister:
- `backend/plugins/accounting_api/src/modules/accounting/graphql/resolvers/mutations/accounts.ts` lines 27–32 — `checkPermission('accountsAdd')` pattern. Queries use the same `checkPermission` helper via `IContext`. Check the existing `accounts` query resolver for the read-side permission name.

## Phase 4 — PLAN

Default plan for a list-shape query:

1. **declare query in GraphQL schema** — files: `backend/plugins/accounting_api/src/modules/accounting/graphql/schemas/account.ts` (extend the `queries` template literal)
2. **add resolver function to `accountQueries`** — files: `backend/plugins/accounting_api/src/modules/accounting/graphql/resolvers/queries/accounts.ts`
3. **(optional) add permission entry** — files: `backend/plugins/accounting_api/src/meta/permissions.ts` if the query needs RBAC
4. **add UI query document** — files: `frontend/plugins/accounting_ui/src/graphql/queries.ts` (plus the hook that consumes it under `cards/hooks/` or `boards/hooks/`)
5. **playwright spec asserts the UI uses the new query** — files: `.agents/plugins/accounting/tests/accounts.spec.ts`

If the query already returns `Account`, no schema-side `customResolvers` change is needed — the existing custom resolvers fire.

## Phase 5 — IMPLEMENT (step-by-step)

For each commit:

1. In `schemas/account.ts`, extend `export const queries = ...`. Mirror the `accounts(stageId: String, ...)` line — declare your query, reuse `${queryParams}` if the wish needs the same filters, or declare a tighter input. Return `AccountsListResponse`, `Int`, `Account`, or `[Account]` based on shape.
2. In `resolvers/queries/accounts.ts`, add a property to the `accountQueries: Record<string, Resolver>` object. Destructure `{ models, subdomain, user, checkPermission }` from `IContext` ([`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md)). Reuse `generateFilter(models, subdomain, user._id, args)` if your inputs overlap.
3. If the query touches `Account` lists, **do not** call `models.Users.findOne` per row — return raw accounts and let `customResolvers/account.ts` + `loaders/index.ts` hydrate. See [`../../docs/accounting/graphql-federation.md`](../../docs/accounting/graphql-federation.md) "DataLoaders".
4. Run `.agents/evals/run.sh accounting --backend-only`. Exit 0 before continuing.
5. On the UI: add `gql` document to `AccountsQueries.ts`, write a hook (`useAccountsByPriority`) mirroring `useAccounts` (in `cards/hooks/useAccounts.tsx`). Then surface it in a component if the wish needs a view.
6. Run `.agents/evals/run.sh accounting`. Exit 0.

## Phase 6 — VERIFY

Add to `.agents/plugins/accounting/tests/accounts.spec.ts`:

- a test that navigates to the view that consumes the new query and asserts a stable DOM element appears (label, count, list row)
- a test that toggles a filter (if the query takes input) and asserts the URL/state change matches

Run: `cd .agents && pnpm test plugins/accounting/tests/accounts.spec.ts`

## Pitfalls (specific to this skill)

- A new query that returns `[Account]` must be merged into `accountQueries` and have its typedef appear in `schemas/account.ts` `queries`. Forgetting either causes a silent `null` at runtime — federation composition does **not** fail.
- Avoid hand-building filters. `generateFilter` already handles 30+ params and `parentId`/`status` defaults — bypassing it leaks archived accounts into the response.
- If the query needs subdomain-scoped sorting or aggregation across stages, use the loader pattern from `customResolvers/account.ts`. Inline `findOne` calls inside a list resolver = N+1 bug.
- `checkPermission` throws — do not wrap it in `try/catch` (see [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)).
- After typedef edits, the gateway recomposes on plugin restart. If federation breaks, the whole gateway falls over — see [`../../rules/40-safety.md`](../../rules/40-safety.md) "Touching `apollo/schema/extensions.ts`".

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No comments restating the query name
- [ ] No "just in case" filter params in `queryParams` you don't actually use
- [ ] No bypassing `generateFilter` to reinvent its behavior
- [ ] No `try/catch` around `checkPermission`
- [ ] No new DataLoader unless you actually have a list-of-accounts N+1 (single-entity reads don't need one)
