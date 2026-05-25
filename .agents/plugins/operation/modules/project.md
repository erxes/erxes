# operation > project

Projects for structuring cycle milestones and task grouping.

## Eval files (verify these after changes)
Highest-priority files. If you touch this module, re-read these:

- `backend/plugins/operation_api/src/modules/project/db/models/Project.ts` — Project CRUD + business logic
- `backend/plugins/operation_api/src/modules/project/graphql/resolvers/mutations/project.ts` — Writes
- `backend/plugins/operation_api/src/modules/project/graphql/resolvers/queries/project.ts` — Reads
- `frontend/plugins/operation_ui/src/pages/ProjectsPage.tsx` — Projects landing page

## All files involved

### Backend — types
- `backend/plugins/operation_api/src/modules/project/@types/project.ts`

### Backend — models & schema
- `backend/plugins/operation_api/src/modules/project/db/models/Project.ts`
- `backend/plugins/operation_api/src/modules/project/db/definitions/project.ts`

### Backend — GraphQL
- `backend/plugins/operation_api/src/modules/project/graphql/schema/project.ts`
- `backend/plugins/operation_api/src/modules/project/graphql/resolvers/queries/project.ts`
- `backend/plugins/operation_api/src/modules/project/graphql/resolvers/mutations/project.ts`

### Frontend — entry & navigation
- `frontend/plugins/operation_ui/src/pages/ProjectsPage.tsx`
- `frontend/plugins/operation_ui/src/modules/project/Main.tsx`

### Frontend — components & hooks
- `frontend/plugins/operation_ui/src/modules/project/hooks/useGetProjects.tsx`
- `frontend/plugins/operation_ui/src/modules/project/hooks/useCreateProject.tsx`
- `frontend/plugins/operation_ui/src/modules/project/hooks/useUpdateProject.tsx`
- `frontend/plugins/operation_ui/src/modules/project/components/*`

## Connected to / related to

| Other surface | How | Where |
|---|---|---|
| **core / User** | `leadId`, `memberIds[]` | DB definitions + resolvers |
| **operation / Task** | Projects host tasks | `ITaskFilter` reference |
| **operation / Milestone** | Projects link milestones | `useMilestones` hooks |
