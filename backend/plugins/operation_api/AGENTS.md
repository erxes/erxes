# `operation_api` Plugin Guide

## Identity

- **Plugin:** `operation`
- **Project:** `operation_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/operation_api`
- **Last synchronized:** `2026-10-23`

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

- Task list queries and exports share validated, inclusive date ranges for start, target, creation, update, and completion dates; completion ranges also restrict results to completed tasks.

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

- Task segment `tagIds` lists `operation:task` tags plus workspace tags
  (`query.variables`).
- Tasks are a segment content type: 19 filterable fields, member listing and
  counting, materialised membership on the record, and two relations from a
  team member (`user.assignedTasks`, `user.createdTasks`).
- Task import/export through the platform's import-export producers.
- GraphQL subscriptions for live task and project updates.
- `pnpm nx run operation_api:schema:print` writes the full subgraph schema, including the subscription fields from `src/apollo/subscription.ts`, to `generated/schema.graphql` without Redis, Mongo or a running service. The shared `scripts/print-subgraph-schema.ts` does the printing; the target comes from the `schema:print` default in `nx.json`.
- Settings-configured custom property values on tasks and projects, validated through Core fields and exposed as GraphQL `propertiesData`.
- GitHub issue synchronisation for tasks.
- Triage conversion preserves the triage creator on the task while recording a `TRIAGE_ACCEPTANCE` activity with action `ACCEPTED` by the acting user; other task creation paths continue to use their acting `userId` as creator. Conversion to a cancelled task does not record acceptance and can save a decline reason as a note.
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

- Internal `contactFields.sync` tRPC mutation (`TContactFieldsSync`) — core broadcasts contact merges and removals to every plugin declaring `meta.contactFields` (operation declares `operation:task`, `operation:project`, `operation:triage` in `main.ts`); applied with `applyContactFieldsSync`. Not agent-callable.
- Plugin meta `properties` (`src/meta/properties.ts`) — the `task` and `project` property
  types, each with the `systemFields` (`code`, `name`, `type`) core lists as
  the read-only "Basic information" group in Settings → Properties. A
  `code` must name a real field on the record; core-api reads this meta
  once per process, so a changed list shows after core-api restarts.
- GraphQL queries, mutations and subscriptions for tasks, teams, statuses,
  cycles, milestones, projects, notes and templates.
- Segment content type `operation:task.tasks`, with `segmentFields`, a
  `propertiesData` `segmentFieldNamespaces` entry (`propertyType`
  `operation:task`),
  `evaluateFields`, `listSegmentMembers`, `countSegmentMembers` and
  `applyMembership`.
- Segment relations `user.assignedTasks` and `user.createdTasks`.
- Import/export producers for the `task` module.
- Nx target `schema:print` (cached, output `generated/schema.graphql`), composed with every other subgraph by `gateway:schema:compose`.
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
- Core's `fields.validateFieldValues` tRPC mutation for task and project custom property values.

## Data and State

- Tasks, projects and triages own one customer and one company as `customerId` / `companyId` (indexed, `default: null`). Operation saves and reads them itself, with no relation fallback; accepting a triage copies its fields to the task and moves no relations. Tasks have ObjectId `_id`s; `backend/saas-migrations/core/commands/migrateRelationsToContactFields.ts` (targets `operation_tasks`, `operation_projects`, `operation_triage`, the last also from legacy `operation:task` relations) backfills records linked before (first of old `customerIds` / `companyIds` arrays, else the oldest related contact; extra contacts are dropped).
- `operationConvertTriageToTask` gives the task the triage's `_id` and its contacts (the triage's fields, else its legacy relations), re-creates the triage's other `operation:triage` relations as `operation:task`, then cleans them.
- Every model is generated from the request `subdomain`.
- `operation_tasks` carries `segmentIds`, written only by the segmentation
  worker through `applyMembership`.
- Tasks and projects store optional custom field values in the schema-owned `propertiesData` mixed object.
- A task's `_id` is a Mongo `ObjectId`, not the generated string id most erxes
  collections use.
- `operation_tasks.propertiesData` holds `operation:task` property values keyed
  by field id. Only `task.createFromSource` writes it today, and the task
  GraphQL type does not expose it; import/export read it.

## Local Invariants

- `createTask` / `updateTask`, `createProject` / `updateProject` and `operationAddTriage` / `operationUpdateTriage` accept `customerId` / `companyId` (one of each) and save them on the record; `getTasks`, `getProjects` and `operationGetTriageList` filter by them (a contact's records). `Task`, `Project` and `Triage` expose both fields.
- `createTask` and `operationAddTriage` require a name (the UI creates a task or triage only once its draft is named in the side panel). `createTask` accepts a task without a status: a triage then starts in the team's backlog, any other task in its first to-do (`UNSTARTED`) status by `order`.
- Operation owns its records' contacts: change them only through its own mutations (and `contactFields.sync` for merges and removals); never create core relations for record ↔ contact links.
- Set property handlers pass `targetActionId: action.targetActionId` to
  `getSetPropertySelector`, so a Manage properties action targeting an earlier
  action (Find object, Create) updates that action's record, not the trigger's.

- Task date filters use paired `startDateStartDate`/`startDateEndDate`, `targetDateStartDate`/`targetDateEndDate`, `createdStartDate`/`createdEndDate`, `updatedStartDate`/`updatedEndDate`, and `completedStartDate`/`completedEndDate` bounds through `src/modules/task/utils/dateFilters.ts`. Reject invalid or reversed bounds; subscription events leave date membership to the client refetch so tasks moving out of a range are removed.

- `Task` exposes `_id`, `name`, `status`, `teamId`, `createdAt` and `updatedAt` as non-null, and `Triage` exposes `_id`, `name`, `teamId`, `createdAt` and `updatedAt` as non-null. `Project` exposes `_id`, `name`, `teamIds` (non-null items), `createdAt` and `updatedAt` as non-null, and `Milestone` exposes `_id`, `name` and `projectId` as non-null. They are `required` or timestamped in the Mongoose schemas since 3.0. `createProject` and `updateProject` enforce the same contract on writes because the update path uses `findOneAndUpdate` without validators: an explicit null or blank `name` throws, and `teamIds` throws if it is null or contains a null/blank item (an empty array is allowed). Fields with only a default (`priority`, `number`, `estimatePoint`, `icon`, `status`) stay nullable because list queries use `.lean()`, which does not apply defaults to older documents.
- `removeTask` returns and publishes the task as it was before deletion, with `type: 'delete'`.
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
- Decide whether triage conversion is a decline from the mutation's requested `status`, not the triage's stored status; only non-cancelled conversions create acceptance activity.
- Only `createTask` calls carrying `triageId` may preserve `doc.createdBy`; automation, import, GraphQL, and tRPC task creation continue to assign `userId`.
- Validate `propertiesData` whenever it is present on a GraphQL create or update; an empty object is a valid explicit clear and must not be treated as omitted.
- The plugin answers segment requests only about its own collections. No
  segment producer here may call another plugin: that shape is what produced
  the plugin-to-plugin RPC loop the Elasticsearch-era producers carried.

- `task.createFromSource` is service-to-service only and checks no permission;
  the caller must enforce `taskCreate` for the acting user before calling it.
  It does not open a GitHub issue — that sync stays in the `createTask`
  resolver.
- Mutation and query arguments the operation cannot run without are non-null
  in the SDL (`_id`, `createCycle.input`, `updateCycle.input`,
  `getTeamEstimateChoises.teamId`). Runtime guards that remain cover cases
  GraphQL validation cannot: empty-string ids and `updateCycle.input._id`,
  which stays nullable because `createCycle` sends the same `CycleInput`
  without an `_id`.
- An argument the operation cannot run without must fail with a clear error,
  even when the SDL has to keep it nullable for a caller. `getTeamMembers`
  and `getConvertedProject` throw on a missing id for this reason;
  `getTeamMembers` requires `teamId` or `teamIds` and never runs an empty
  `$match`.
- Every query or mutation declared in the SDL must have a resolver, and every
  resolver must be declared. Template operations carry no dedicated
  permission, so they reuse the `task*` actions they configure.
- `teamUpdate(memberIds)` syncs `TeamMember` rows to the given list and
  additionally requires `teamMemberManage`; omitting it leaves membership
  untouched. Member roles are deprecated end to end, so `teamUpdateMember`
  is gone from the SDL and the resolvers.
- `Cycle.endCycle(_id, subdomain)` needs the tenant to resolve the timezone
  for the progress chart; the worker and the mutation both pass it.
- Progress queries (`getProjectProgress*`, `getCycleProgress*`) return
  concrete SDL object types (`OperationProgress`, `OperationProgressByMember`,
  `OperationProgressByTeam`, `OperationProgressByProject`,
  `OperationProgressChart`), not `JSON`. `Cycle.statistics` is a concrete
  `CycleStatistics` type over the same progress types, and the
  `Cycle.statistics` resolver fills missing totals with 0 so old documents
  stored with `progress: {}` still satisfy the `Int!` fields. The aggregations can legitimately
  produce no rows, so the resolvers return zero-valued objects or empty
  arrays instead of `{}` when the aggregate result is missing. Milestone
  progress counters (`totalScope`, `totalStartedScope`,
  `totalCompletedScope`) are non-null ints because the aggregation always
  emits numbers.
- `OperationTemplate` exposes `_id`, `name`, `teamId`, `createdAt` and
  `updatedAt` as non-null (schema-required or timestamps), and
  `operationTemplateDetail` takes `_id: String!`. `GithubConfig` fields are
  all non-null (all required in the schema); `GithubConnection` is non-null
  except `orgAvatarUrl`/`initiatedUserId`. `OperationActivity._id`, `action`,
  `contentId`, `module` and timestamps are non-null; `metadata` and
  `createdBy` stay nullable.
- `Cycle._id` is non-null; its other fields stay nullable because nothing
  in the Mongoose schema requires them.
- `getStatusesChoicesByTeam` and `getTeamEstimateChoises` return concrete
  `[StatusChoice]` and `[EstimateChoice]` types, not `JSON`. `Status` exposes
  `color`, `order`, `type`, `createdAt` and `updatedAt` as non-null
  (schema-required or timestamps). `Team._id`, `Team.createdAt`,
  `Team.updatedAt` and `TeamMember._id` are non-null; other Team fields stay
  nullable because the Mongoose schema does not require them and `.lean()`
  does not apply defaults. `deleteStatus` still returns the `deleteOne`
  result as `JSON`.
- Any request-driven value (filter, params, variables, input, args,
  searchValue) that reaches a `$regex` or `new RegExp()` goes through
  `escapeRegExp` from `erxes-api-shared/utils` first. The plugin-local ESLint
  `no-restricted-syntax` rules in `eslint.config.js` fail the lint otherwise.

## Validation

- `pnpm nx run operation_api:schema:print` - writes `generated/schema.graphql`.
- `pnpm nx lint operation_api` - runs ESLint with the plugin-local
  `eslint.config.js` (regex-escaping rules).
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
