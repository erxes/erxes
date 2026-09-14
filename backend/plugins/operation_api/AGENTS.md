# `operation_api` Plugin Guide

## Identity

- **Plugin:** `operation`
- **Project:** `operation_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/operation_api`
- **Last synchronized:** `2026-09-14`

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

- GraphQL queries, mutations and subscriptions for tasks, teams, statuses,
  cycles, milestones, projects, notes and templates.
- Segment content type `operation:task.tasks`, with `segmentFields`,
  `evaluateFields`, `listSegmentMembers`, `countSegmentMembers` and
  `applyMembership`.
- Segment relations `user.assignedTasks` and `user.createdTasks`.
- Import/export producers for the `task` module.
- tRPC procedures under `src/trpc/`.

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

## Validation

- `npx tsc --noEmit -p backend/plugins/operation_api/tsconfig.json` - expect
  exactly two errors, both `TS2307: Cannot find module '@octokit/app'` from
  `src/utils/githubClient.ts`. The dependency is declared in `package.json` but
  is not installed, and it blocks `pnpm nx build operation_api` as well. Any
  third error is new.
- `pnpm nx build operation_api` (currently blocked by the above)
- Build a task segment on an assignee, confirm the preview count matches the
  task list filtered the same way, then confirm `segmentIds` lands on those
  tasks after the rebuild.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

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
