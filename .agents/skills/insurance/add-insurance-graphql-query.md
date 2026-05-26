# add insurance graphql query

> **When to use:** the wish needs a new GraphQL **read** on a insurance entity that the existing `contracts`/`contractDetail`/`pipelines`/`stages` queries can't serve — e.g., `contractsByPriority`, `contractsClosingThisWeek`, `pipelineHealthSummary`.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters (all in `backend/plugins/insurance_api/src/modules/insurance/`):

| Sister | Shape | Why |
|---|---|---|
| `contracts(...)` | list + filter + cursor pagination | most common shape — copy this for any "list with filters" |
| `contractsTotalCount(...)` | scalar derived from same filter | mirrors a counter/aggregate read |
| `contractDetail(_id)` | single-entity read by id | mirrors a "fetch one" |

**Read these files in full** before writing any code:

- `backend/plugins/insurance_api/src/modules/insurance/graphql/schemas/contract.ts` — `queryParams`, the `queries` export, see how `contracts` declares filter input
- `backend/plugins/insurance_api/src/modules/insurance/graphql/resolvers/queries/contracts.ts` — the `contractQueries` object + `generateFilter()` (the canonical filter builder)
- `backend/plugins/insurance_api/src/apollo/resolvers/queries.ts` — how `contractQueries` is merged into the root resolver
- `backend/plugins/insurance_api/src/apollo/schema/schema.ts` — how `ContractQueries` typedef block joins the rest
- `backend/plugins/insurance_api/src/modules/insurance/graphql/resolvers/customResolvers/contract.ts` — read-only, to see how DataLoaders avoid N+1 (line 7+: `customers`, `companies`)

Permissions sister:
- `backend/plugins/insurance_api/src/modules/insurance/graphql/resolvers/mutations/contracts.ts` lines 27–32 — `checkPermission('contractsAdd')` pattern. Queries use the same `checkPermission` helper via `IContext`. Check the existing `contracts` query resolver for the read-side permission name.

## Phase 4 — PLAN

Default plan for a list-shape query:

1. **declare query in GraphQL schema** — files: `backend/plugins/insurance_api/src/modules/insurance/graphql/schemas/contract.ts` (extend the `queries` template literal)
2. **add resolver function to `contractQueries`** — files: `backend/plugins/insurance_api/src/modules/insurance/graphql/resolvers/queries/contracts.ts`
3. **(optional) add permission entry** — files: `backend/plugins/insurance_api/src/meta/permissions.ts` if the query needs RBAC
4. **add UI query document** — files: `frontend/plugins/insurance_ui/src/graphql/queries.ts` (plus the hook that consumes it under `cards/hooks/` or `boards/hooks/`)
5. **playwright spec asserts the UI uses the new query** — files: `.agents/plugins/insurance/tests/contracts.spec.ts`

If the query already returns `Contract`, no schema-side `customResolvers` change is needed — the existing custom resolvers fire.

## Phase 5 — IMPLEMENT (step-by-step)

For each commit:

1. In `schemas/contract.ts`, extend `export const queries = ...`. Mirror the `contracts(stageId: String, ...)` line — declare your query, reuse `${queryParams}` if the wish needs the same filters, or declare a tighter input. Return `ContractsListResponse`, `Int`, `Contract`, or `[Contract]` based on shape.
2. In `resolvers/queries/contracts.ts`, add a property to the `contractQueries: Record<string, Resolver>` object. Destructure `{ models, subdomain, user, checkPermission }` from `IContext` ([`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md)). Reuse `generateFilter(models, subdomain, user._id, args)` if your inputs overlap.
3. If the query touches `Contract` lists, **do not** call `models.Users.findOne` per row — return raw contracts and let `customResolvers/contract.ts` + `loaders/index.ts` hydrate. See [`../../docs/insurance/graphql-federation.md`](../../docs/insurance/graphql-federation.md) "DataLoaders".
4. Run `.agents/evals/run.sh insurance --backend-only`. Exit 0 before continuing.
5. On the UI: add `gql` document to `ContractsQueries.ts`, write a hook (`useContractsByPriority`) mirroring `useContracts` (in `cards/hooks/useContracts.tsx`). Then surface it in a component if the wish needs a view.
6. Run `.agents/evals/run.sh insurance`. Exit 0.

## Phase 6 — VERIFY

Add to `.agents/plugins/insurance/tests/contracts.spec.ts`:

- a test that navigates to the view that consumes the new query and asserts a stable DOM element appears (label, count, list row)
- a test that toggles a filter (if the query takes input) and asserts the URL/state change matches

Run: `cd .agents && pnpm test plugins/insurance/tests/contracts.spec.ts`

## Pitfalls (specific to this skill)

- A new query that returns `[Contract]` must be merged into `contractQueries` and have its typedef appear in `schemas/contract.ts` `queries`. Forgetting either causes a silent `null` at runtime — federation composition does **not** fail.
- Avoid hand-building filters. `generateFilter` already handles 30+ params and `parentId`/`status` defaults — bypassing it leaks archived contracts into the response.
- If the query needs subdomain-scoped sorting or aggregation across stages, use the loader pattern from `customResolvers/contract.ts`. Inline `findOne` calls inside a list resolver = N+1 bug.
- `checkPermission` throws — do not wrap it in `try/catch` (see [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)).
- After typedef edits, the gateway recomposes on plugin restart. If federation breaks, the whole gateway falls over — see [`../../rules/40-safety.md`](../../rules/40-safety.md) "Touching `apollo/schema/extensions.ts`".

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No comments restating the query name
- [ ] No "just in case" filter params in `queryParams` you don't actually use
- [ ] No bypassing `generateFilter` to reinvent its behavior
- [ ] No `try/catch` around `checkPermission`
- [ ] No new DataLoader unless you actually have a list-of-contracts N+1 (single-entity reads don't need one)
