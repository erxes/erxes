# add sales graphql query

> **When to use:** the wish needs a new GraphQL **read** on a sales entity that the existing `deals`/`dealDetail`/`pipelines`/`stages` queries can't serve — e.g., `dealsByPriority`, `dealsClosingThisWeek`, `pipelineHealthSummary`.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters (all in `backend/plugins/sales_api/src/modules/sales/`):

| Sister | Shape | Why |
|---|---|---|
| `deals(...)` | list + filter + cursor pagination | most common shape — copy this for any "list with filters" |
| `dealsTotalCount(...)` | scalar derived from same filter | mirrors a counter/aggregate read |
| `dealDetail(_id)` | single-entity read by id | mirrors a "fetch one" |

**Read these files in full** before writing any code:

- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts` — `queryParams`, the `queries` export, see how `deals` declares filter input
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts` — the `dealQueries` object + `generateFilter()` (the canonical filter builder)
- `backend/plugins/sales_api/src/apollo/resolvers/queries.ts` — how `dealQueries` is merged into the root resolver
- `backend/plugins/sales_api/src/apollo/schema/schema.ts` — how `DealQueries` typedef block joins the rest
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/customResolvers/deal.ts` — read-only, to see how DataLoaders avoid N+1 (line 7+: `customers`, `companies`)

Permissions sister:
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/mutations/deals.ts` lines 27–32 — `checkPermission('dealsAdd')` pattern. Queries use the same `checkPermission` helper via `IContext`. Check the existing `deals` query resolver for the read-side permission name.

## Phase 4 — PLAN

Default plan for a list-shape query:

1. **declare query in GraphQL schema** — files: `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts` (extend the `queries` template literal)
2. **add resolver function to `dealQueries`** — files: `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts`
3. **(optional) add permission entry** — files: `backend/plugins/sales_api/src/meta/permissions.ts` if the query needs RBAC
4. **add UI query document** — files: `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts` (plus the hook that consumes it under `cards/hooks/` or `boards/hooks/`)
5. **playwright spec asserts the UI uses the new query** — files: `.agents/plugins/sales/tests/deals.spec.ts`

If the query already returns `Deal`, no schema-side `customResolvers` change is needed — the existing custom resolvers fire.

## Phase 5 — IMPLEMENT (step-by-step)

For each commit:

1. In `schemas/deal.ts`, extend `export const queries = ...`. Mirror the `deals(stageId: String, ...)` line — declare your query, reuse `${queryParams}` if the wish needs the same filters, or declare a tighter input. Return `DealsListResponse`, `Int`, `Deal`, or `[Deal]` based on shape.
2. In `resolvers/queries/deals.ts`, add a property to the `dealQueries: Record<string, Resolver>` object. Destructure `{ models, subdomain, user, checkPermission }` from `IContext` ([`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md)). Reuse `generateFilter(models, subdomain, user._id, args)` if your inputs overlap.
3. If the query touches `Deal` lists, **do not** call `models.Users.findOne` per row — return raw deals and let `customResolvers/deal.ts` + `loaders/index.ts` hydrate. See [`../../docs/sales/graphql-federation.md`](../../docs/sales/graphql-federation.md) "DataLoaders".
4. Run `.agents/evals/run.sh sales --backend-only`. Exit 0 before continuing.
5. On the UI: add `gql` document to `DealsQueries.ts`, write a hook (`useDealsByPriority`) mirroring `useDeals` (in `cards/hooks/useDeals.tsx`). Then surface it in a component if the wish needs a view.
6. Run `.agents/evals/run.sh sales`. Exit 0.

## Phase 6 — VERIFY

Add to `.agents/plugins/sales/tests/deals.spec.ts`:

- a test that navigates to the view that consumes the new query and asserts a stable DOM element appears (label, count, list row)
- a test that toggles a filter (if the query takes input) and asserts the URL/state change matches

Run: `cd .agents && pnpm test plugins/sales/tests/deals.spec.ts`

## Pitfalls (specific to this skill)

- A new query that returns `[Deal]` must be merged into `dealQueries` and have its typedef appear in `schemas/deal.ts` `queries`. Forgetting either causes a silent `null` at runtime — federation composition does **not** fail.
- Avoid hand-building filters. `generateFilter` already handles 30+ params and `parentId`/`status` defaults — bypassing it leaks archived deals into the response.
- If the query needs subdomain-scoped sorting or aggregation across stages, use the loader pattern from `customResolvers/deal.ts`. Inline `findOne` calls inside a list resolver = N+1 bug.
- `checkPermission` throws — do not wrap it in `try/catch` (see [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)).
- After typedef edits, the gateway recomposes on plugin restart. If federation breaks, the whole gateway falls over — see [`../../rules/40-safety.md`](../../rules/40-safety.md) "Touching `apollo/schema/extensions.ts`".

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No comments restating the query name
- [ ] No "just in case" filter params in `queryParams` you don't actually use
- [ ] No bypassing `generateFilter` to reinvent its behavior
- [ ] No `try/catch` around `checkPermission`
- [ ] No new DataLoader unless you actually have a list-of-deals N+1 (single-entity reads don't need one)
