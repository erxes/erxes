# operation plugin

**Backend:** `backend/plugins/operation_api/` — port **3307**
**Frontend:** `frontend/plugins/operation_ui/` — port **3006**

Tasks, projects, milestones, cycle planning, and team management surfaces for erxes.

## Modules

| Module | Doc | Backend root | Frontend root |
|---|---|---|---|
| **task** | [modules/task.md](modules/task.md) | `backend/plugins/operation_api/src/modules/task/` | `frontend/plugins/operation_ui/src/modules/task/` |
| **project** | [modules/project.md](modules/project.md) | `backend/plugins/operation_api/src/modules/project/` | `frontend/plugins/operation_ui/src/modules/project/` |
| **milestone** | [modules/milestone.md](modules/milestone.md) | `backend/plugins/operation_api/src/modules/milestone/` | _(shared via GraphQL only)_ |

## External surfaces

### GraphQL federation
Exposed via `@key(fields: "_id")`:
- `Team`

Extended (consumed from other plugins): `User`, `Customer`, `Company`, `Tag`, `Product`.

### tRPC routers
Merged in `backend/plugins/operation_api/src/trpc/init-trpc.ts`:
- `operation` — inline procedure `hello`
- `task` — `backend/plugins/operation_api/src/modules/task/trpc/task.ts`

### Express routes
File: `backend/plugins/operation_api/src/main.ts`
- None registered explicitly.

### Automation
None registered explicitly.

### Segments
File: `backend/plugins/operation_api/src/main.ts`
- Content type registrations for properties and tags:
  - `task` (Tasks)
  - `project` (Projects)

### Permissions
`backend/plugins/operation_api/src/meta/permissions.ts` — RBAC permissions for tasks, projects, milestones, cycles, and team boards.

## Cross-plugin consumers
- **sales** — links deals to tasks via segment filtering.
- **frontline** — links tickets and conversations to tasks.
- **core** — federates user assignments, tags, and org structures.

## Cross-plugin dependencies
- **core** — `User`, `Customer`, `Company`, `Tag`, `Product` schemas.
