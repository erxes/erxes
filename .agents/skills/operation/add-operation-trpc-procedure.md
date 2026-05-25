# add operation trpc procedure

> **When to use:** the wish adds a new backend procedure exposed via tRPC for fast cross-plugin communication or frontend queries (e.g. `task.getTasks`, `task.changeStatus`).

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters:

| Sister | Router | Where |
|---|---|---|
| `hello` | `operation` router | `backend/plugins/operation_api/src/trpc/init-trpc.ts` |
| `task` procedures | `taskTrpcRouter` | `backend/plugins/operation_api/src/modules/task/trpc/task.ts` |

**Read these files in full** before writing any code:

- `backend/plugins/operation_api/src/trpc/init-trpc.ts` — appRouter config.
- `backend/plugins/operation_api/src/modules/task/trpc/task.ts` — tRPC procedures for task.

## Phase 4 — PLAN

1. **define procedure input/output schema** — files: `backend/plugins/operation_api/src/modules/task/trpc/task.ts`
2. **add query/mutation handler** — files: `backend/plugins/operation_api/src/modules/task/trpc/task.ts`
3. Run verification check.

## Phase 5 — IMPLEMENT (step-by-step)

1. **`task.ts`** — add your procedure.
2. Run `.agents/evals/run.sh operation --backend-only`.
