# add operation mutation

> **When to use:** the wish needs a new GraphQL **write** on an operation entity (e.g. creating/updating/deleting Tasks, Projects, Milestones).

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters:

| Sister | Shape | Where |
|---|---|---|
| `createTask` / `updateTask` | entity write | `backend/plugins/operation_api/src/modules/task/graphql/resolvers/mutations/task.ts` |
| `removeTask` | entity delete | `backend/plugins/operation_api/src/modules/task/graphql/resolvers/mutations/task.ts` |

**Read these files in full** before writing any code:

- `backend/plugins/operation_api/src/modules/task/graphql/schemas/task.ts` — typedefs for mutations and inputs.
- `backend/plugins/operation_api/src/modules/task/graphql/resolvers/mutations/task.ts` — mutation resolvers.

## Phase 4 — PLAN

1. **declare mutation in GraphQL schema** — files: `backend/plugins/operation_api/src/modules/task/graphql/schemas/task.ts`
2. **add resolver function** — files: `backend/plugins/operation_api/src/modules/task/graphql/resolvers/mutations/task.ts`
3. **add UI mutation document** — files: `frontend/plugins/operation_ui/src/modules/task/graphql/mutations/*`
4. **playwright spec asserts the UI uses the mutation** — files: `.agents/plugins/operation/tests/task.spec.ts`

## Phase 5 — IMPLEMENT (step-by-step)

1. **`task.ts` (schema)** — extend `export const mutations = ...`.
2. **`task.ts` (resolver)** — add mutation resolver.
3. Run `.agents/evals/run.sh operation --backend-only`.
4. **`frontend/`** — add mutation document and use it in a hook (e.g., inside `hooks/useCreateTask.tsx`).
5. Run `.agents/evals/run.sh operation`.
