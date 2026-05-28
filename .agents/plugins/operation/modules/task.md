# operation > task

Tasks, cycle planning, and team management boards.

## Eval files (verify these after changes)
Highest-priority files. If you touch this module, re-read these:

- `backend/plugins/operation_api/src/modules/task/db/models/Task.ts` — Task CRUD + business logic
- `backend/plugins/operation_api/src/modules/task/graphql/resolvers/mutations/task.ts` — Writes
- `backend/plugins/operation_api/src/modules/task/graphql/resolvers/queries/task.ts` — Reads
- `frontend/plugins/operation_ui/src/pages/TasksPage.tsx` — Tasks landing page

## All files involved

### Backend — types
- `backend/plugins/operation_api/src/modules/task/@types/task.ts`
- `backend/plugins/operation_api/src/modules/task/@types/cycle.ts`

### Backend — models & schema
- `backend/plugins/operation_api/src/modules/task/db/models/Task.ts`
- `backend/plugins/operation_api/src/modules/task/db/definitions/task.ts`
- `backend/plugins/operation_api/src/modules/task/db/definitions/cycle.ts`

### Backend — GraphQL
- `backend/plugins/operation_api/src/modules/task/graphql/schemas/task.ts`
- `backend/plugins/operation_api/src/modules/task/graphql/resolvers/queries/task.ts`
- `backend/plugins/operation_api/src/modules/task/graphql/resolvers/mutations/task.ts`

### Backend — tRPC
- `backend/plugins/operation_api/src/modules/task/trpc/task.ts`

### Frontend — entry & navigation
- `frontend/plugins/operation_ui/src/pages/TasksPage.tsx`
- `frontend/plugins/operation_ui/src/modules/task/Main.tsx`

### Frontend — components & hooks
- `frontend/plugins/operation_ui/src/modules/task/hooks/useGetTasks.tsx`
- `frontend/plugins/operation_ui/src/modules/task/hooks/useCreateTask.tsx`
- `frontend/plugins/operation_ui/src/modules/task/hooks/useUpdateTask.tsx`
- `frontend/plugins/operation_ui/src/modules/task/components/*`

## Connected to / related to

| Other surface | How | Where |
|---|---|---|
| **core / User** | `assigneeId` | DB definitions + resolvers |
| **core / Customer** | Linked customers | segment configs |
| **frontline / Ticket** | Linked tickets | properties mapping |
| **sales / Deal** | Linked deals | properties mapping |
