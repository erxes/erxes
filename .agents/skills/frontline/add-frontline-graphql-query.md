# add frontline graphql query

> **When to use:** the wish needs a new GraphQL **read** on a frontline entity (e.g. Conversations, Tickets, Articles) that existing queries can't serve.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters:

| Sister | Shape | Where |
|---|---|---|
| `getTickets(...)` | list + filter + cursor pagination | `backend/plugins/frontline_api/src/modules/ticket/graphql/resolvers/queries/tickets.ts` |
| `getTicket(_id)` | single-entity read | `backend/plugins/frontline_api/src/modules/ticket/graphql/resolvers/queries/tickets.ts` |

**Read these files in full** before writing any code:

- `backend/plugins/frontline_api/src/modules/ticket/graphql/schemas/ticket.ts` — typedefs for queries and inputs.
- `backend/plugins/frontline_api/src/modules/ticket/graphql/resolvers/queries/tickets.ts` — query resolvers.
- `backend/plugins/frontline_api/src/apollo/schema/schema.ts` — merges schemas.

## Phase 4 — PLAN

1. **declare query in GraphQL schema** — files: `backend/plugins/frontline_api/src/modules/ticket/graphql/schemas/ticket.ts`
2. **add resolver function** — files: `backend/plugins/frontline_api/src/modules/ticket/graphql/resolvers/queries/tickets.ts`
3. **add UI query document** — files: `frontend/plugins/frontline_ui/src/modules/ticket/graphql/queries/*`
4. **playwright spec asserts the UI uses the new query** — files: `.agents/plugins/frontline/tests/ticket.spec.ts`

## Phase 5 — IMPLEMENT (step-by-step)

1. **`ticket.ts` (schema)** — extend `export const queries = ...`.
2. **`tickets.ts` (resolver)** — add resolver handler.
3. Run `.agents/evals/run.sh frontline --backend-only`.
4. **`frontend/`** — add query document and use it in a hook (e.g., inside `hooks/useGetTickets.tsx`).
5. Run `.agents/evals/run.sh frontline`.
