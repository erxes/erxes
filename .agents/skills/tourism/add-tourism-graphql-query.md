# add tourism graphql query

> **When to use:** the wish needs a new GraphQL **read** on a tourism entity that the existing `tours`/`tourDetail`/`pipelines`/`stages` queries can't serve — e.g., `toursByPriority`, `toursClosingThisWeek`, `pipelineHealthSummary`.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters (all in `backend/plugins/tourism_api/src/modules/tourism/`):

| Sister | Shape | Why |
|---|---|---|
| `tours(...)` | list + filter + cursor pagination | most common shape — copy this for any "list with filters" |
| `toursTotalCount(...)` | scalar derived from same filter | mirrors a counter/aggregate read |
| `tourDetail(_id)` | single-entity read by id | mirrors a "fetch one" |

**Read these files in full** before writing any code:

- `backend/plugins/tourism_api/src/modules/bms/graphql/schemas/tour.ts` — `queryParams`, the `queries` export, see how `tours` declares filter input
- `backend/plugins/tourism_api/src/modules/tourism/graphql/resolvers/queries/tours.ts` — the `tourQueries` object + `generateFilter()` (the canonical filter builder)
- `backend/plugins/tourism_api/src/apollo/resolvers/queries.ts` — how `tourQueries` is merged into the root resolver
- `backend/plugins/tourism_api/src/apollo/schema/schema.ts` — how `TourQueries` typedef block joins the rest
- `backend/plugins/tourism_api/src/modules/tourism/graphql/resolvers/customResolvers/tour.ts` — read-only, to see how DataLoaders avoid N+1 (line 7+: `customers`, `companies`)

Permissions sister:
- `backend/plugins/tourism_api/src/modules/tourism/graphql/resolvers/mutations/tours.ts` lines 27–32 — `checkPermission('toursAdd')` pattern. Queries use the same `checkPermission` helper via `IContext`. Check the existing `tours` query resolver for the read-side permission name.

## Phase 4 — PLAN

Default plan for a list-shape query:

1. **declare query in GraphQL schema** — files: `backend/plugins/tourism_api/src/modules/bms/graphql/schemas/tour.ts` (extend the `queries` template literal)
2. **add resolver function to `tourQueries`** — files: `backend/plugins/tourism_api/src/modules/tourism/graphql/resolvers/queries/tours.ts`
3. **(optional) add permission entry** — files: `backend/plugins/tourism_api/src/meta/permissions.ts` if the query needs RBAC
4. **add UI query document** — files: `frontend/plugins/tourism_ui/src/graphql/queries.ts` (plus the hook that consumes it under `cards/hooks/` or `boards/hooks/`)
5. **playwright spec asserts the UI uses the new query** — files: `.agents/plugins/tourism/tests/tours.spec.ts`

If the query already returns `Tour`, no schema-side `customResolvers` change is needed — the existing custom resolvers fire.

## Phase 5 — IMPLEMENT (step-by-step)

For each commit:

1. In `schemas/tour.ts`, extend `export const queries = ...`. Mirror the `tours(stageId: String, ...)` line — declare your query, reuse `${queryParams}` if the wish needs the same filters, or declare a tighter input. Return `ToursListResponse`, `Int`, `Tour`, or `[Tour]` based on shape.
2. In `resolvers/queries/tours.ts`, add a property to the `tourQueries: Record<string, Resolver>` object. Destructure `{ models, subdomain, user, checkPermission }` from `IContext` ([`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md)). Reuse `generateFilter(models, subdomain, user._id, args)` if your inputs overlap.
3. If the query touches `Tour` lists, **do not** call `models.Users.findOne` per row — return raw tours and let `customResolvers/tour.ts` + `loaders/index.ts` hydrate. See [`../../docs/tourism/graphql-federation.md`](../../docs/tourism/graphql-federation.md) "DataLoaders".
4. Run `.agents/evals/run.sh tourism --backend-only`. Exit 0 before continuing.
5. On the UI: add `gql` document to `ToursQueries.ts`, write a hook (`useToursByPriority`) mirroring `useTours` (in `cards/hooks/useTours.tsx`). Then surface it in a component if the wish needs a view.
6. Run `.agents/evals/run.sh tourism`. Exit 0.

## Phase 6 — VERIFY

Add to `.agents/plugins/tourism/tests/tours.spec.ts`:

- a test that navigates to the view that consumes the new query and asserts a stable DOM element appears (label, count, list row)
- a test that toggles a filter (if the query takes input) and asserts the URL/state change matches

Run: `cd .agents && pnpm test plugins/tourism/tests/tours.spec.ts`

## Pitfalls (specific to this skill)

- A new query that returns `[Tour]` must be merged into `tourQueries` and have its typedef appear in `schemas/tour.ts` `queries`. Forgetting either causes a silent `null` at runtime — federation composition does **not** fail.
- Avoid hand-building filters. `generateFilter` already handles 30+ params and `parentId`/`status` defaults — bypassing it leaks archived tours into the response.
- If the query needs subdomain-scoped sorting or aggregation across stages, use the loader pattern from `customResolvers/tour.ts`. Inline `findOne` calls inside a list resolver = N+1 bug.
- `checkPermission` throws — do not wrap it in `try/catch` (see [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)).
- After typedef edits, the gateway recomposes on plugin restart. If federation breaks, the whole gateway falls over — see [`../../rules/40-safety.md`](../../rules/40-safety.md) "Touching `apollo/schema/extensions.ts`".

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No comments restating the query name
- [ ] No "just in case" filter params in `queryParams` you don't actually use
- [ ] No bypassing `generateFilter` to reinvent its behavior
- [ ] No `try/catch` around `checkPermission`
- [ ] No new DataLoader unless you actually have a list-of-tours N+1 (single-entity reads don't need one)
