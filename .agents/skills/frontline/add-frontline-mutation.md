# add frontline mutation

> **When to use:** the wish needs a new GraphQL **write** on a frontline entity (e.g. creating/updating/deleting Conversations, Tickets, Articles).

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters:

| Sister | Shape | Where |
|---|---|---|
| `createTicket` / `updateTicket` | entity write | `backend/plugins/frontline_api/src/modules/ticket/graphql/resolvers/mutations/tickets.ts` |
| `removeTicket` | entity delete | `backend/plugins/frontline_api/src/modules/ticket/graphql/resolvers/mutations/tickets.ts` |

**Read these files in full** before writing any code:

- `backend/plugins/frontline_api/src/modules/ticket/graphql/schemas/ticket.ts` — typedefs for mutations and inputs.
- `backend/plugins/frontline_api/src/modules/ticket/graphql/resolvers/mutations/tickets.ts` — mutation resolvers.

## Phase 4 — PLAN

1. **declare mutation in GraphQL schema** — files: `backend/plugins/frontline_api/src/modules/ticket/graphql/schemas/ticket.ts`
2. **add resolver function** — files: `backend/plugins/frontline_api/src/modules/ticket/graphql/resolvers/mutations/tickets.ts`
3. **add UI mutation document** — files: `frontend/plugins/frontline_ui/src/modules/ticket/graphql/mutations/*`
4. **playwright spec asserts the UI uses the mutation** — files: `.agents/plugins/frontline/tests/ticket.spec.ts`

## Phase 5 — IMPLEMENT (step-by-step)

1. **`ticket.ts` (schema)** — extend `export const mutations = ...`.
2. **`tickets.ts` (resolver)** — add mutation resolver.
3. Run `.agents/evals/run.sh frontline --backend-only`.
4. **`frontend/`** — add mutation document and use it in a hook (e.g., inside `hooks/useCreateTicket.tsx`).
5. Run `.agents/evals/run.sh frontline`.
