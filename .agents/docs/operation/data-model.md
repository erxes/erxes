# Operation — Data Model

> The shape of Task, Project, Milestone, Cycle, and how they relate. Read this before any skill that touches the database layer.

## Entity-relationship overview

```
Project
  ↓ (1:N)
Milestone
  ↓ (1:N)
Task
  ├─ projectId           → operation.Project
  ├─ milestoneId         → operation.Milestone
  ├─ cycleId             → operation.Cycle
  ├─ teamId              → operation.Team
  ├─ assigneeId          → core.User
  ├─ createdBy           │ core.User
  ├─ labelIds[]          → operation.Label[]
  └─ tagIds[]            → core.Tag[]

Cycle (time-boxed iterations)
  └─ taskIds[]           → operation.Task[]
```

## Task — the central entity

**Definition:** `backend/plugins/operation_api/src/modules/task/db/definitions/task.ts`
**Model class:** `db/models/Task.ts`
**GraphQL type:** `graphql/schemas/task.ts`

### Key fields

| Field | Type | Notes |
|---|---|---|
| `_id` | string | federation `@key` |
| `name` | string | task title (required) |
| `description` | string | issue details |
| `status` | string | task state/column |
| `priority` | number | priority index |
| `assigneeId` | string | links to core.User |
| `createdBy` | string | creator user ID |
| `projectId` | string | links to Project |
| `milestoneId` | string | links to Milestone |
| `cycleId` | string | links to Cycle |
| `teamId` | string | links to Team |
| `labelIds` | string[] | custom operation labels |
| `tagIds` | string[] | core.Tag references |
| `estimatePoint` | number | task estimate points |
| `statusType` | number | status category (0-3) |

> **Note on Custom Fields:** Unlike Sales (Deals) and Frontline (Tickets), the Operation `Task` entity currently **does not** support `customFieldsData` via the core properties module. All fields must be strongly typed in the Mongoose schema.

---

## Project — the workspace group

**Definition:** `backend/plugins/operation_api/src/modules/project/db/definitions/project.ts`
**Model class:** `db/models/Project.ts`
**GraphQL type:** `graphql/schema/project.ts`

### Key fields

| Field | Type | Notes |
|---|---|---|
| `_id` | string | unique ID |
| `name` | string | project name |
| `description` | string | project description |
| `leadId` | string | references core.User |
| `memberIds` | string[] | references core.User[] |
| `teamIds` | string[] | references operation.Team[] |
| `startDate` | Date | start |
| `targetDate` | Date | deadline |
