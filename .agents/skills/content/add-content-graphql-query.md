# add content graphql query

> **When to use:** the wish needs a new GraphQL **read** on a content entity that the existing `cmss`/`cmsDetail`/`pipelines`/`stages` queries can't serve — e.g., `cmssByPriority`, `cmssClosingThisWeek`, `pipelineHealthSummary`.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters (all in `backend/plugins/content_api/src/modules/content/`):

| Sister | Shape | Why |
|---|---|---|
| `cmss(...)` | list + filter + cursor pagination | most common shape — copy this for any "list with filters" |
| `cmsListTotalCount(...)` | scalar derived from same filter | mirrors a counter/aggregate read |
| `cmsDetail(_id)` | single-entity read by id | mirrors a "fetch one" |

**Read these files in full** before writing any code:

- `backend/plugins/content_api/src/modules/cms/graphql/schemas/cms.ts` — `queryParams`, the `queries` export, see how `cmss` declares filter input
- `backend/plugins/content_api/src/modules/content/graphql/resolvers/queries/cmss.ts` — the `cmsQueries` object + `generateFilter()` (the canonical filter builder)
- `backend/plugins/content_api/src/apollo/resolvers/queries.ts` — how `cmsQueries` is merged into the root resolver
- `backend/plugins/content_api/src/apollo/schema/schema.ts` — how `CMSQueries` typedef block joins the rest
- `backend/plugins/content_api/src/modules/content/graphql/resolvers/customResolvers/cms.ts` — read-only, to see how DataLoaders avoid N+1 (line 7+: `customers`, `companies`)

Permissions sister:
- `backend/plugins/content_api/src/modules/content/graphql/resolvers/mutations/cmss.ts` lines 27–32 — `checkPermission('cmsListAdd')` pattern. Queries use the same `checkPermission` helper via `IContext`. Check the existing `cmss` query resolver for the read-side permission name.

## Phase 4 — PLAN

Default plan for a list-shape query:

1. **declare query in GraphQL schema** — files: `backend/plugins/content_api/src/modules/cms/graphql/schemas/cms.ts` (extend the `queries` template literal)
2. **add resolver function to `cmsQueries`** — files: `backend/plugins/content_api/src/modules/content/graphql/resolvers/queries/cmss.ts`
3. **(optional) add permission entry** — files: `backend/plugins/content_api/src/meta/permissions.ts` if the query needs RBAC
4. **add UI query document** — files: `frontend/plugins/content_ui/src/graphql/queries.ts` (plus the hook that consumes it under `cards/hooks/` or `boards/hooks/`)
5. **playwright spec asserts the UI uses the new query** — files: `.agents/plugins/content/tests/cmsList.spec.ts`

If the query already returns `CMS`, no schema-side `customResolvers` change is needed — the existing custom resolvers fire.

## Phase 5 — IMPLEMENT (step-by-step)

For each commit:

1. In `schemas/cms.ts`, extend `export const queries = ...`. Mirror the `cmss(stageId: String, ...)` line — declare your query, reuse `${queryParams}` if the wish needs the same filters, or declare a tighter input. Return `CMSsListResponse`, `Int`, `CMS`, or `[CMS]` based on shape.
2. In `resolvers/queries/cmss.ts`, add a property to the `cmsQueries: Record<string, Resolver>` object. Destructure `{ models, subdomain, user, checkPermission }` from `IContext` ([`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md)). Reuse `generateFilter(models, subdomain, user._id, args)` if your inputs overlap.
3. If the query touches `CMS` lists, **do not** call `models.Users.findOne` per row — return raw cmss and let `customResolvers/cms.ts` + `loaders/index.ts` hydrate. See [`../../docs/content/graphql-federation.md`](../../docs/content/graphql-federation.md) "DataLoaders".
4. Run `.agents/evals/run.sh content --backend-only`. Exit 0 before continuing.
5. On the UI: add `gql` document to `CMSsQueries.ts`, write a hook (`useCMSsByPriority`) mirroring `useCMSs` (in `cards/hooks/useCMSs.tsx`). Then surface it in a component if the wish needs a view.
6. Run `.agents/evals/run.sh content`. Exit 0.

## Phase 6 — VERIFY

Add to `.agents/plugins/content/tests/cmsList.spec.ts`:

- a test that navigates to the view that consumes the new query and asserts a stable DOM element appears (label, count, list row)
- a test that toggles a filter (if the query takes input) and asserts the URL/state change matches

Run: `cd .agents && pnpm test plugins/content/tests/cmss.spec.ts`

## Pitfalls (specific to this skill)

- A new query that returns `[CMS]` must be merged into `cmsQueries` and have its typedef appear in `schemas/cms.ts` `queries`. Forgetting either causes a silent `null` at runtime — federation composition does **not** fail.
- Avoid hand-building filters. `generateFilter` already handles 30+ params and `parentId`/`status` defaults — bypassing it leaks archived cmss into the response.
- If the query needs subdomain-scoped sorting or aggregation across stages, use the loader pattern from `customResolvers/cms.ts`. Inline `findOne` calls inside a list resolver = N+1 bug.
- `checkPermission` throws — do not wrap it in `try/catch` (see [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)).
- After typedef edits, the gateway recomposes on plugin restart. If federation breaks, the whole gateway falls over — see [`../../rules/40-safety.md`](../../rules/40-safety.md) "Touching `apollo/schema/extensions.ts`".

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No comments restating the query name
- [ ] No "just in case" filter params in `queryParams` you don't actually use
- [ ] No bypassing `generateFilter` to reinvent its behavior
- [ ] No `try/catch` around `checkPermission`
- [ ] No new DataLoader unless you actually have a list-of-cmss N+1 (single-entity reads don't need one)
