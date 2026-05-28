# add frontline graphql query

> **When to use:** the wish needs a new GraphQL **read** on a frontline entity that the existing `tickets`/`ticketDetail`/`pipelines`/`stages` queries can't serve — e.g., `ticketsByPriority`, `ticketsClosingThisWeek`, `pipelineHealthSummary`.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters (all in `backend/plugins/frontline_api/src/modules/frontline/`):

| Sister | Shape | Why |
|---|---|---|
| `tickets(...)` | list + filter + cursor pagination | most common shape — copy this for any "list with filters" |
| `ticketsTotalCount(...)` | scalar derived from same filter | mirrors a counter/aggregate read |
| `ticketDetail(_id)` | single-entity read by id | mirrors a "fetch one" |

**Read these files in full** before writing any code:

- `backend/plugins/frontline_api/src/modules/frontline/graphql/schemas/ticket.ts` — `queryParams`, the `queries` export, see how `tickets` declares filter input
- `backend/plugins/frontline_api/src/modules/frontline/graphql/resolvers/queries/tickets.ts` — the `ticketQueries` object + `generateFilter()` (the canonical filter builder)
- `backend/plugins/frontline_api/src/apollo/resolvers/queries.ts` — how `ticketQueries` is merged into the root resolver
- `backend/plugins/frontline_api/src/apollo/schema/schema.ts` — how `TicketQueries` typedef block joins the rest
- `backend/plugins/frontline_api/src/modules/frontline/graphql/resolvers/customResolvers/ticket.ts` — read-only, to see how DataLoaders avoid N+1 (line 7+: `customers`, `companies`)

Permissions sister:
- `backend/plugins/frontline_api/src/modules/frontline/graphql/resolvers/mutations/tickets.ts` lines 27–32 — `checkPermission('ticketsAdd')` pattern. Queries use the same `checkPermission` helper via `IContext`. Check the existing `tickets` query resolver for the read-side permission name.

## Phase 4 — PLAN

Default plan for a list-shape query:

1. **declare query in GraphQL schema** — files: `backend/plugins/frontline_api/src/modules/frontline/graphql/schemas/ticket.ts` (extend the `queries` template literal)
2. **add resolver function to `ticketQueries`** — files: `backend/plugins/frontline_api/src/modules/frontline/graphql/resolvers/queries/tickets.ts`
3. **(optional) add permission entry** — files: `backend/plugins/frontline_api/src/meta/permissions.ts` if the query needs RBAC
4. **add UI query document** — files: `frontend/plugins/frontline_ui/src/modules/tickets/graphql/queries/TicketsQueries.ts` (plus the hook that consumes it under `cards/hooks/` or `boards/hooks/`)
5. **playwright spec asserts the UI uses the new query** — files: `.agents/plugins/frontline/tests/tickets.spec.ts`

If the query already returns `Ticket`, no schema-side `customResolvers` change is needed — the existing custom resolvers fire.

## Phase 5 — IMPLEMENT (step-by-step)

For each commit:

1. In `schemas/ticket.ts`, extend `export const queries = ...`. Mirror the `tickets(stageId: String, ...)` line — declare your query, reuse `${queryParams}` if the wish needs the same filters, or declare a tighter input. Return `TicketsListResponse`, `Int`, `Ticket`, or `[Ticket]` based on shape.
2. In `resolvers/queries/tickets.ts`, add a property to the `ticketQueries: Record<string, Resolver>` object. Destructure `{ models, subdomain, user, checkPermission }` from `IContext` ([`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md)). Reuse `generateFilter(models, subdomain, user._id, args)` if your inputs overlap.
3. If the query touches `Ticket` lists, **do not** call `models.Users.findOne` per row — return raw tickets and let `customResolvers/ticket.ts` + `loaders/index.ts` hydrate. See [`../../docs/frontline/graphql-federation.md`](../../docs/frontline/graphql-federation.md) "DataLoaders".
4. Run `.agents/evals/run.sh frontline --backend-only`. Exit 0 before continuing.
5. On the UI: add `gql` document to `TicketsQueries.ts`, write a hook (`useTicketsByPriority`) mirroring `useTickets` (in `cards/hooks/useTickets.tsx`). Then surface it in a component if the wish needs a view.
6. Run `.agents/evals/run.sh frontline`. Exit 0.

## Phase 6 — VERIFY

Add to `.agents/plugins/frontline/tests/tickets.spec.ts`:

- a test that navigates to the view that consumes the new query and asserts a stable DOM element appears (label, count, list row)
- a test that toggles a filter (if the query takes input) and asserts the URL/state change matches

Run: `cd .agents && pnpm test plugins/frontline/tests/tickets.spec.ts`

## Pitfalls (specific to this skill)

- A new query that returns `[Ticket]` must be merged into `ticketQueries` and have its typedef appear in `schemas/ticket.ts` `queries`. Forgetting either causes a silent `null` at runtime — federation composition does **not** fail.
- Avoid hand-building filters. `generateFilter` already handles 30+ params and `parentId`/`status` defaults — bypassing it leaks archived tickets into the response.
- If the query needs subdomain-scoped sorting or aggregation across stages, use the loader pattern from `customResolvers/ticket.ts`. Inline `findOne` calls inside a list resolver = N+1 bug.
- `checkPermission` throws — do not wrap it in `try/catch` (see [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)).
- After typedef edits, the gateway recomposes on plugin restart. If federation breaks, the whole gateway falls over — see [`../../rules/40-safety.md`](../../rules/40-safety.md) "Touching `apollo/schema/extensions.ts`".

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No comments restating the query name
- [ ] No "just in case" filter params in `queryParams` you don't actually use
- [ ] No bypassing `generateFilter` to reinvent its behavior
- [ ] No `try/catch` around `checkPermission`
- [ ] No new DataLoader unless you actually have a list-of-tickets N+1 (single-entity reads don't need one)
