# `operation_api` Plugin Guide

## Identity

- **Plugin:** `operation`
- **Project:** `operation_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/operation_api`
- **Last synchronized:** `2026-09-21`

## Scope

### Owns

- Tasks and their triage queue, including status, priority, estimate points
  and the assignee/author fields.
- Teams and team membership, statuses, cycles, milestones and projects.
- Task notes, activity records and operation templates.
- The GitHub issue integration: repository configuration, connections, and the
  issue number/URL a task carries.
- Task import and export handlers.
- The segment contract for `operation:task.tasks` - what can be filtered, how
  a batch is resolved, and how membership is written onto a task.

### Does not own

- Contacts, team-member accounts, tags, products or any core record. A user id
  on a task is a reference; the user itself belongs to core.
- Deals, tickets, conversations or POS orders. A relation into any of those is
  declared by the plugin that owns them.
- The segmentation engine. This plugin declares and answers; the decision, the
  queue and the sweep run elsewhere.

## Current Capabilities

- A task or project an automation creates records `createdVia` — what produced
  it, which run, and for whom — and is created as that actor. `getAutomationUserId`
  reads the actor from there when neither the action config nor the target names
  one.
- Two task workflow templates ship with the plugin through
  `automations.constants.workflowTemplates`: `operation.follow-up-task` (wait
  three days, then open a task) and `operation.hand-off-now` (open one
  straight away). They are code, never tenant documents, so they exist on a
  fresh deployment; a copy is materialized only when someone installs one.
  Neither restricts the target, so both are offered on a broadcast campaign as
  well — giving the team a task per customer rather than messaging that
  customer. Both declare `operation:task.team` and `operation:task.status`
  requirements, the status scoped by the team.

- Tasks are a segment content type: 19 filterable fields, member listing and
  counting, materialised membership on the record, and two relations from a
  team member (`user.assignedTasks`, `user.createdTasks`).
- Task import/export through the platform's import-export producers.
- GraphQL subscriptions for live task and project updates.
- GitHub issue synchronisation for tasks.
- Another service can create a task on a user's behalf from a status id
  (`task.createFromSource`) and check which of a list of ids are tasks
  (`task.findOne`); `frontline` uses both to convert a conversation into a task.

## Architecture

| Area                  | Path                                           | Responsibility                                                        |
| --------------------- | ---------------------------------------------- | --------------------------------------------------------------------- |
| Plugin entry          | `src/main.ts`                                  | `startPlugin` on port 3307, GraphQL, subscriptions, meta registration |
| Models                | `src/connectionResolvers.ts`                   | Tenant-scoped models, each with its event dispatcher                  |
| Task module           | `src/modules/task/`                            | Task and triage schemas, models, resolvers                            |
| Task segment contract | `src/modules/task/meta/segments/`              | Fields, collections, members, membership, evaluation, relations       |
| Plugin segment meta   | `src/meta/segments.ts`                         | Routes segment producers to the module that owns the content type     |
| Import/export         | `src/meta/import-export/`                      | Task import and export handlers                                       |
| GitHub integration    | `src/modules/githubIntegration/`, `src/utils/` | Issue sync, repository configuration                                  |

## Contracts

### Provides

- Plugin meta `properties` (`src/meta/properties.ts`) — the `task` and `project` property
  types, each with the `systemFields` (`code`, `name`, `type`) core lists as
  the read-only "Basic information" group in Settings → Properties. A
  `code` must name a real field on the record; core-api reads this meta
  once per process, so a changed list shows after core-api restarts.
- GraphQL queries, mutations and subscriptions for tasks, teams, statuses,
  cycles, milestones, projects, notes and templates.
- Segment content type `operation:task.tasks`, with `segmentFields`,
  `evaluateFields`, `listSegmentMembers`, `countSegmentMembers` and
  `applyMembership`.
- Segment relations `user.assignedTasks` and `user.createdTasks`.
- Import/export producers for the `task` module.
- tRPC procedures under `src/trpc/` and `src/modules/task/trpc/task.ts`:
  `task.tag`; `task.findOne({ _ids })` returns the first task among the ids
  (`{ _id, name, teamId }`) or `null`, skipping ids that are not ObjectIds;
  `task.createFromSource({ userId, doc: { name, status, description?,
priority?, assigneeId?, labelIds?, tagIds?, startDate?, targetDate?,
propertiesData? } })`
  resolves `teamId` from the status, creates the task as `userId`, publishes
  `operationTaskChanged` / `operationTaskListChanged`, and returns `{ _id }`.

### Consumes

- `erxes-api-shared/core-modules` for the segment engine
  (`evaluateOwnedSegmentFields`, `compileSegmentMongoFilter`,
  `applySegmentMembership`, `segmentPage*`) and the event dispatcher.
- Core's `users` and `tags` list queries, named by the lookup fields a segment
  renders.

## Data and State

- Every model is generated from the request `subdomain`.
- `operation_tasks` carries `segmentIds`, written only by the segmentation
  worker through `applyMembership`.
- A task's `_id` is a Mongo `ObjectId`, not the generated string id most erxes
  collections use.
- `operation_tasks.propertiesData` holds `operation:task` property values keyed
  by field id. Only `task.createFromSource` writes it today, and the task
  GraphQL type does not expose it; import/export read it.

## Local Invariants

- A task's `_id` stays an `ObjectId`. `schemaWrapper` must never be applied to
  `taskSchema`: it would make `_id` a generated string and orphan every
  existing task and reference. `segmentIds` is therefore declared by hand.
- Because ids are ObjectIds and the segment engine passes strings, every read
  and write in the segment path goes through the Mongoose model, which casts.
  A raw driver handle would compare a hex string against an ObjectId and match
  nothing. Verified against live data: cursor paging, `$in` lookup and the
  membership `bulkWrite` all resolve correctly through the model.
- A segment content type is named the way the event dispatcher names it
  (`operation:task.tasks`). A declaration under any other name is never matched
  to a write, which is a segment that silently never updates.
- Every field-joined relation needs an index on the path it groups by
  (`tasks.assigneeId`, `tasks.createdBy`). Without one the measure scans the
  collection.
- Preserve tenant isolation by using the request `subdomain` for every model,
  resolver, worker and route access.
- The plugin answers segment requests only about its own collections. No
  segment producer here may call another plugin: that shape is what produced
  the plugin-to-plugin RPC loop the Elasticsearch-era producers carried.

- `task.createFromSource` is service-to-service only and checks no permission;
  the caller must enforce `taskCreate` for the acting user before calling it.
  It does not open a GitHub issue — that sync stays in the `createTask`
  resolver.

## Validation

- `npx tsc --noEmit -p backend/plugins/operation_api/tsconfig.json` - expect
  no errors.
- `pnpm nx build operation_api` - its type-declaration step can exhaust the
  default Node heap; run with `NODE_OPTIONS=--max-old-space-size=8192`.
- Smoke (conversation convert): from a frontline conversation convert into a
  task on a team status; the task appears in that team with the chosen status
  and `Go to a task` opens `/operation/tasks/<id>`.
- Build a task segment on an assignee, confirm the preview count matches the
  task list filtered the same way, then confirm `segmentIds` lands on those
  tasks after the rebuild.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-21` — The task and project actions say they need someone to act for

- **Summary:** `Create task` and `Create project` now declare
  `requiresActor: true`. Both already take their owner from the run's
  `createdVia.actorId` through `getAutomationUserId`; the declaration lets the
  builder tell, before an automation goes live, whether its records will belong
  to someone. Creation itself is unchanged.
- **Affected areas:** `src/modules/automations/constants.ts`
- **Contracts changed:** The action descriptor carries `requiresActor`, a field
  `erxes-api-shared` added for every plugin to use.

### `2026-09-14` — A task an automation opened records what produced it

- **Summary:** Tasks and projects created by an automation now carry
  `createdVia` — the configuration that produced them, the run that did it, and
  whose configuration it was — and are created as that actor. Creation behind a
  campaign had been failing with "requires a user to create task", because
  neither the action config nor a customer target names a person.
- **Affected areas:** `src/modules/automations/utils.ts`,
  `src/modules/automations/actions/createTaskAction.ts`,
  `src/modules/automations/actions/createProjectAction.ts`,
  `src/modules/task/@types/task.ts`, `src/modules/project/@types/project.ts`
- **Contracts changed:** Consumes the new `TCreatedVia` and
  `IExecution.createdVia` from `erxes-api-shared`; `createdVia` itself is added
  to every schema by `schemaWrapper`.

### `2026-09-14` — Tasks ship two flows of their own

- **Summary:** The plugin now provides built-in workflow templates through
  `automations.constants.workflowTemplates`, naming the task the customer they
  concern and declaring the team and status they need as requirements answered
  while installing.
- **Affected areas:** `src/modules/automations/workflowTemplates.ts`,
  `src/meta/automations.ts`
- **Contracts changed:** Consumes the new optional
  `AutomationConstants.workflowTemplates` from `erxes-api-shared`.

### `2026-09-17` — Property types declare system fields

- **Summary:** The `task` and `project` property types now declare `systemFields`, shown
  as the "Basic information" group in Settings → Properties.
- **Affected areas:** `src/meta/properties.ts` (`task`, `project`), `src/main.ts`
- **Contracts changed:** Plugin meta `properties.types[].systemFields` added.

### `2026-09-17` — Tasks can be created from another service

- **Summary:** Added the `task.createFromSource` and `task.findOne` tRPC
  procedures so `frontline` can convert a conversation into a task and detect
  an existing one; tasks can store `propertiesData`.
- **Affected areas:** `src/modules/task/trpc/task.ts`,
  `src/modules/task/db/definitions/task.ts`, `src/modules/task/@types/task.ts`
- **Contracts changed:** New tRPC procedures `task.createFromSource` and
  `task.findOne`; `operation_tasks` gains the optional `propertiesData` field.

### `2026-09-05` — `Export repeating task properties by row`

- **Summary:** Task and project import/export expands a repeating property group into one numbered column per row (`<Group> <n> / <Field>`) and reassembles those columns back into rows on import, using the shared property import/export helpers.
- **Affected areas:** `src/meta/import-export/utils.ts`, `src/meta/import-export/export/getTaskExportHeaders.ts`, `src/meta/import-export/import/importHandlers.ts`, `src/meta/import-export/import/processTaskRows.ts`
- **Contracts changed:** Export and import headers for a repeating group are now numbered; `getExportHeaders`, `resolveExportHeaders`, `getCustomPropertyHeaders` and `getTaskCustomPropertyHeaders` take an optional `models` argument.

### `2026-09-01` — `checkTargetMatch` producer removed

- **Summary:** The `checkTargetMatch` producer was deleted from the plugin-level
  automations object and from the automations module handlers, taking both its
  task and project branches; automation target matching now runs through the
  segment engine, so the Elasticsearch-era selector round-trip has no caller
  left anywhere in the repository.
- **Affected areas:** `src/meta/automations.ts`,
  `src/modules/automations/automationHandlers.ts`.
- **Contracts changed:** `/automations` no longer answers `checkTargetMatch`.
  The `TAutomationProducers.CHECK_TARGET_MATCH` method no longer exists in
  `erxes-api-shared`.

### `2026-09-01` — Elasticsearch-era segment producers removed

- **Summary:** `associationFilter`, `esTypesMap`, `initialSelector` and
  `propertyConditionExtender` were deleted from the task and project modules
  and from the plugin-level segment object; the plugin no longer makes any
  plugin-to-plugin segment call, and no plugin-to-plugin RPC loop can form.
  `projectsSegments` is now a declaration only - its content type and
  dependent modules - and answers no producer.
- **Affected areas:** `src/meta/segments.ts`,
  `src/modules/task/meta/segments/index.ts`,
  `src/modules/project/meta/segments.ts`.
- **Contracts changed:** `/segments` no longer answers `associationFilter`,
  `esTypesMap`, `initialSelector` or `propertyConditionExtender`. No caller
  existed for any of them.

### `2026-09-01` — Tasks became a real segment content type

- **Summary:** `operation:task.tasks` is now declared with its event content
  type, filterable on 19 user-facing fields, materialisable, and reachable
  from a team-member segment; the module moved off the Elasticsearch-era
  producers onto the shared evaluator.
- **Affected areas:** `src/modules/task/meta/segments/` (was `segments.ts`,
  now a directory with fields, collections, members, membership, evaluate and
  relations); `src/meta/segments.ts`;
  `src/modules/task/db/definitions/task.ts` (`segmentIds`, join indexes).
- **Contracts changed:** Task content type now declares
  `contentType: 'operation:task.tasks'`; new relations `user.assignedTasks`,
  `user.createdTasks`.
