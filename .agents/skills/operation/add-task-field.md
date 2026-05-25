# add task field

> **When to use:** the wish adds a new field on `Task` that the user can read and edit — e.g., a `taskColor` enum, a `urgencyScore` number, etc.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

For this skill, the natural sisters are:

| Sister field | Why it's a good mirror |
|---|---|
| `priority` (number) | already wired through every layer — schema, type, GraphQL type + input, mutation variables, UI fragment |
| `startDate` / `targetDate` (Date) | shows how a non-string scalar threads through the same stack |
| `tagIds[]` (string array) | shows array shape end-to-end |

**Read these files in full** before writing any code:

Backend:
- `backend/plugins/operation_api/src/modules/task/db/definitions/task.ts` — Mongoose schema (search for `priority:` at line 29)
- `backend/plugins/operation_api/src/modules/task/@types/task.ts` — `ITask` interface
- `backend/plugins/operation_api/src/modules/task/graphql/schemas/task.ts` — full GraphQL surface: `type Task`, `createTaskParams`, `updateTaskParams`
- `backend/plugins/operation_api/src/modules/task/db/models/Task.ts` — `createTask` and `updateTask` (the writes that accept the new field)

Frontend:
- `frontend/plugins/operation_ui/src/modules/task/graphql/mutations/createTask.ts` — create task mutation
- `frontend/plugins/operation_ui/src/modules/task/graphql/mutations/updateTask.tsx` — update task mutation
- `frontend/plugins/operation_ui/src/modules/task/types/index.ts` — the TS types operation task uses

## Phase 4 — PLAN

Atomic commits, ordered (rename `<field>` to your wish's field name):

1. **add `<field>` to Mongoose task schema** — files: `backend/plugins/operation_api/src/modules/task/db/definitions/task.ts`
2. **add `<field>` to `ITask` TS interface** — files: `backend/plugins/operation_api/src/modules/task/@types/task.ts`
3. **add `<field>` to GraphQL `type Task` and mutation params** — files: `backend/plugins/operation_api/src/modules/task/graphql/schemas/task.ts`
4. **expose `<field>` in the UI mutation variables** — files: `frontend/plugins/operation_ui/src/modules/task/graphql/mutations/{createTask,updateTask.tsx}`, `frontend/plugins/operation_ui/src/modules/task/types/index.ts`
5. **playwright spec asserts field is present + persists** — files: `.agents/plugins/operation/tests/task.spec.ts`

Each commit ≤ ~50 LOC. After commits 1–3 the backend compiles standalone; after commit 4 the UI compiles standalone.

## Phase 5 — IMPLEMENT (step-by-step)

1. **Mongoose schema (`task.ts`)** — copy the `priority` line and adapt. Pick `String`, `Number`, `Boolean`, `Date`, `[String]`, or `Schema.Types.Mixed`.
2. **`@types/task.ts`** — add the field to `interface ITask`.
3. **`schemas/task.ts`** — add the field inside `type Task`, `createTaskParams`, and `updateTaskParams`.
4. **`createTask.ts`/`updateTask.tsx`** — add to mutation query and variables.
5. After each commit, run `.agents/evals/run.sh operation`.

## Phase 6 — VERIFY

Add to `.agents/plugins/operation/tests/task.spec.ts`:
- a test that opens the "Add task" sheet and asserts the new field is visible.
- run: `cd .agents && pnpm test plugins/operation/tests/task.spec.ts`
