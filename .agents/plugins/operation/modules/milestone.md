# operation > milestone

Milestones linked to project cycles and tasks.

## Eval files (verify these after changes)
Highest-priority files. If you touch this module, re-read these:

- `backend/plugins/operation_api/src/modules/milestone/db/models/Milestone.ts` — Milestone CRUD
- `backend/plugins/operation_api/src/modules/milestone/graphql/schema/milestone.ts` — Graphql surface definition

## All files involved

### Backend — types
- `backend/plugins/operation_api/src/modules/milestone/types.ts`

### Backend — models & schema
- `backend/plugins/operation_api/src/modules/milestone/db/models/Milestone.ts`
- `backend/plugins/operation_api/src/modules/milestone/db/definitions/milestone.ts`

### Backend — GraphQL
- `backend/plugins/operation_api/src/modules/milestone/graphql/schema/milestone.ts`
- `backend/plugins/operation_api/src/modules/milestone/graphql/resolvers/queries/milestone.ts`
- `backend/plugins/operation_api/src/modules/milestone/graphql/resolvers/mutations/milestone.ts`

### Frontend — hooks (under project module)
- `frontend/plugins/operation_ui/src/modules/project/hooks/useMilestones.tsx`
- `frontend/plugins/operation_ui/src/modules/project/hooks/useCreateMilestone.tsx`
- `frontend/plugins/operation_ui/src/modules/project/hooks/useUpdateMilestone.tsx`
- `frontend/plugins/operation_ui/src/modules/project/hooks/useGetMilestone.tsx`

## Connected to / related to

| Other surface | How | Where |
|---|---|---|
| **operation / Project** | Milestones belong to projects | DB definitions + resolvers |
| **operation / Task** | Tasks can reference milestones | `ITaskFilter` reference |
