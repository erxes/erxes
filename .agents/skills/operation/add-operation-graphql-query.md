# add operation graphql query

> **When to use:** the wish needs a new GraphQL **read** on an operation entity (e.g. Tasks, Projects, Milestones) that existing queries can't serve.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters:

| Sister | Shape | Where |
|---|---|---|
| `getTasks(...)` | list + filter + cursor pagination | `backend/plugins/operation_api/src/modules/task/graphql/resolvers/queries/task.ts` |
| `getTask(_id)` | single-entity read | `backend/plugins/operation_api/src/modules/task/graphql/resolvers/queries/task.ts` |

**Read these files in full** before writing any code:

- `backend/plugins/operation_api/src/modules/task/graphql/schemas/task.ts` — typedefs for queries and inputs.
- `backend/plugins/operation_api/src/modules/task/graphql/resolvers/queries/task.ts` — query resolvers.
- `backend/plugins/operation_api/src/apollo/schema/schema.ts` — merges schemas.

## Phase 4 — PLAN

1. **declare query in GraphQL schema** — files: `backend/plugins/operation_api/src/modules/task/graphql/schemas/task.ts`
2. **add resolver function** — files: `backend/plugins/operation_api/src/modules/task/graphql/resolvers/queries/task.ts`
3. **add UI query document** — files: `frontend/plugins/operation_ui/src/modules/task/graphql/queries/*`
4. **playwright spec asserts the UI uses the new query** — files: `.agents/plugins/operation/tests/task.spec.ts`

## Phase 5 — IMPLEMENT (step-by-step)

1. **`task.ts` (schema)** — extend `export const queries = ...`.
2. **`task.ts` (resolver)** — add resolver handler.
3. Run `.agents/evals/run.sh operation --backend-only`.
4. **`frontend/`** — add query document and use it in a hook (e.g., inside `hooks/useGetTasks.tsx`).
5. Run `.agents/evals/run.sh operation`.
