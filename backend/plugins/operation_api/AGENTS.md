# `operation_api` Plugin Guide

## Identity

- **Plugin:** `operation`
- **Project:** `operation_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/operation_api`
- **Last synchronized:** `2026-10-29`

## Scope

### Owns

- Tasks and their triage queue, including status, priority, estimate points
  and the assignee/author fields.
- Teams and team membership, statuses, cycles, milestones and projects.
- Task notes, activity records and operation templates.
- The GitHub issue integration: repository configuration, connections, and the
  issue number/URL a task carries.
- The Discord notification integration: bot connections per Discord server,
  the channel and events each team posts to, the Discord card each triage
  or task owns in that channel, and the link between a team member and their
  Discord account.
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
- Frontline's Discord inbox integration (customer conversations over the
  Discord Gateway). Operation keeps its own bot connections, never opens a
  Gateway socket and never reads frontline's Discord records.

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
- Discord notifications: a team posts new, accepted and declined triages,
  task assignments and completed tasks to one Discord channel through a
  bring-your-own bot token (REST only, no Gateway, no message-content intent).
  The first event for a record posts an embed card (team in the author line;
  status; priority; assignee while open or once set; due date
  as a Discord timestamp while open; customer; company; decline reason) with
  "Open in erxes" and, for GitHub-opened records, "GitHub #n" link buttons.
  Later events edit that card and reply to it with one emoji-prefixed
  activity line. User-supplied text in fields and replies is
  markdown-escaped.
- Discord account linking: an admin turns on member linking per connection
  with the application's client secret (checked with a client-credentials
  grant) after adding the OAuth redirect URI in the Developer Portal. A member
  signs in with Discord (`identify` scope) from a popup; the callback stores
  the Discord user id, username, display name and avatar, then revokes the
  token. A `taskAssigned` reply mentions the assignee as `<@id>` when they are
  linked and in the server; when they are not linked and linking is on, the
  reply says so and carries a "Link Discord account" button. Admins see each
  team member's link and server status, unlink members and send a reminder
  notification.
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
| Discord integration   | `src/modules/discordIntegration/`              | Connections, team configs, card mapping and builder, `notifyDiscord`  |
| Discord REST client   | `src/utils/discordClient.ts`                   | Discord API v10 calls, 429 retry, error descriptions                  |
| Discord worker        | `src/worker/discordNotifications.ts`           | `operations-discord-notify` processor: posts or edits the card        |
| Discord account link  | `src/modules/discordIntegration/utils/`        | OAuth start, Redis state, callback route, assignee mention            |

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
- Discord GraphQL (`teamRead` for reads, `teamUpdate` for the token check and
  every mutation): queries `operationDiscordConnections`,
  `operationDiscordCheckToken(token)`, `operationDiscordChannels(connectionId)`,
  `operationDiscordConfigByTeam(teamId)`, `operationDiscordConfigs(connectionId)`;
  mutations `operationDiscordConnect(token, guildId)`,
  `operationDiscordDisconnect(_id)` (refused while a team uses the server),
  `operationDiscordSaveTeamConfig`, `operationDiscordDisconnectTeam(teamId)`,
  `operationDiscordSendTestMessage(teamId)`. Events are the
  `OperationDiscordNotificationEvent` enum built from
  `DISCORD_NOTIFICATION_EVENTS`.
- Discord account GraphQL: `operationDiscordMyAccount`,
  `operationDiscordStartAccountLink` (returns the Discord authorize URL) and
  `operationDiscordUnlinkMyAccount` need only a signed-in user;
  `operationDiscordTeamMembers(teamId)` needs `teamRead`;
  `operationDiscordOAuthRedirectUri`, `operationDiscordSetClientSecret`,
  `operationDiscordClearClientSecret`, `operationDiscordUnlinkMember(userId)`
  and `operationDiscordRemindMember(teamId, userId)` need `teamUpdate`.
- Express route `GET /integrations/discord/oauth/callback`
  (`DISCORD_OAUTH_CALLBACK_PATH`). Its public URL (the OAuth redirect URI) is
  `<gateway>/pl:operation/integrations/discord/oauth/callback`, where the
  gateway is `GATEWAY_URL`, else `${DOMAIN}/gateway` in production, else
  `REACT_APP_API_URL` (the dev UI server proxies neither `/pl:*` nor
  `/gateway`). It answers with a page that posts
  `operation-discord-account-link` to its opener at the `DOMAIN` origin and
  closes.
- Notification event `operation:discord:accountLinkRequest` (content type
  `operation:discord`, content id the team).
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
- `sendNotification` with `event` (`TOperationNotificationEvent`) from
  `src/utils/notifications.ts`; core sends email and push on the channels each
  recipient's settings resolve to.
- Discord REST API v10 with each connection's bot token; the invite link asks
  for View Channels, Send Messages, Embed Links and Read Message History.
  Server membership is read one member at a time with
  `GET /guilds/{id}/members/{user}`, which needs no privileged intent.
- Discord OAuth2 (`/oauth2/token`, `/oauth2/token/revoke`, `/users/@me` with a
  bearer token) with the connection's application id and client secret.
- The shared `redis` client for single-use account-link states
  (`operation:discord:account-link:<state>`, 10 minutes).
- Core's `users.find`, `customers.findOne` and `companies.findOne` tRPC
  queries for the actor, assignee, customer and company names on Discord
  cards, and the `DOMAIN` env for their links (no link when it is not an
  `http(s)` URL).
- The shared BullMQ helpers (`sendWorkerQueue`, `createMQWorkerWithListeners`)
  for the `operations-discord-notify` queue.

## Data and State

- Tasks, projects and triages own one customer and one company as `customerId` / `companyId` (indexed, `default: null`). Operation saves and reads them itself, with no relation fallback; accepting a triage copies its fields to the task and moves no relations. Tasks have ObjectId `_id`s; `backend/saas-migrations/core/commands/migrateRelationsToContactFields.ts` (targets `operation_tasks`, `operation_projects`, `operation_triage`, the last also from legacy `operation:task` relations) backfills records linked before (first of old `customerIds` / `companyIds` arrays, else the oldest related contact; extra contacts are dropped).
- `operationConvertTriageToTask` gives the task the triage's `_id` and its contacts (the triage's fields, else its legacy relations), re-creates the triage's other `operation:triage` relations as `operation:task`, then cleans them.
- Every model is generated from the request `subdomain`.
- `operation_tasks` carries `segmentIds`, written only by the segmentation
  worker through `applyMembership`.
- Tasks and projects store optional custom field values in the schema-owned `propertiesData` mixed object.
- A task's `_id` is a Mongo `ObjectId`, not the generated string id most erxes
  collections use.
- `operation_discord_connections` (unique `guildId` + `subdomain`) stores the
  bot token with `select: false`; read it only through
  `getConnectionWithToken` or an explicit `+token` select. A 401 marks the
  connection `health.status: 'broken'` and the worker skips it until it is
  reconnected.
- `operation_discord_configs` holds one config per team (unique `teamId` +
  `subdomain`), with `lastError` / `lastSentAt` written by the worker and the
  test message. Several teams may share a channel.
- `operation_discord_connections.clientSecret` is `select: false` like the
  token; `hasClientSecret` says whether member linking is on. Reconnecting a
  server with a different bot application clears the secret.
- `operation_discord_user_links` holds one Discord account per member and one
  member per Discord account (unique `userId` + `subdomain` and
  `discordUserId` + `subdomain`). No OAuth token is stored. The team members
  query refreshes username, display name and avatar from the server member.
- `operation_discord_messages` maps a record to its card (unique `entityId` +
  `channelId` + `subdomain`). A triage and the task it becomes share one
  `_id`, so the card carries over on acceptance. Changing a team's channel or
  disconnecting the team deletes its mappings; the posted messages stay in
  Discord.
- `operation_tasks.propertiesData` holds `operation:task` property values keyed
  by field id. Only `task.createFromSource` writes it today, and the task
  GraphQL type does not expose it; import/export read it.

## Local Invariants

- Discord events are queued by `notifyDiscord` after the record is written,
  so the worker reads the saved state. `triageCreated`, `taskAssigned` and
  `taskCompleted` fire from the Task/Triage models, so GitHub webhook writes
  notify as UI writes do; `triageAccepted` / `triageDeclined` fire from
  `operationConvertTriageToTask` (after the triage is deleted) and
  `operationCancelTriage`. `taskAssigned` fires only when the assignee
  actually changes, and `taskCompleted` only on entering a completed status.
  `notifyDiscord` never throws and queues nothing unless an active config for
  the team subscribes to the event.
- Every Discord message is sent with `allowed_mentions: { parse: [] }`, so a
  record name can never ping `@everyone` or a role.
- The worker posts a card only after `DiscordMessage.claimCard` succeeds, so
  two workers never post two cards for one record; a stale claim (older than
  `DISCORD_CARD_CLAIM_TIMEOUT_MS`) is taken over. Discord 429, 5xx and network
  errors are retried by BullMQ (`DISCORD_NOTIFY_JOB_OPTIONS`); other Discord
  errors are recorded on the config and dropped.
- The bot token never leaves the server: no GraphQL type exposes it and the
  frontend sends it only to `operationDiscordCheckToken` and
  `operationDiscordConnect`. The client secret likewise reaches the server
  only through `operationDiscordSetClientSecret`.
- A member can link only their own Discord account: the OAuth `state` is
  random, stored in Redis with the user and subdomain, consumed once, and
  must match the callback's subdomain. Mentions only ever allow the one
  assignee id (`allowed_mentions.users`), never `parse`.

- Triages keep `tagIds` from the task tag type (`operation:task`); there is no `triage` tag type. They are set through `operationAddTriage` / `operationUpdateTriage` (the `task.tag` tRPC procedure updates tasks only), and `operationConvertTriageToTask` copies them, with the customer and company, onto the task.
- `getTasks` without `orderBy` pages through `taskCursorPaginateByStatus` (`modules/task/graphql/resolvers/utils.ts`): status type ascending like projects (in progress, todo, backlog, done, cancelled; untyped last), then the status's own `order`, its name, and newest `updatedAt`. Never order by hard-coded status names; teams rename and add statuses.
- Every automation action declares a `configSchema` (`src/modules/automations/configSchemas.ts`) with exactly what its handler reads or refuses: create task (`name`, `teamId`, `status`) and create project (`name`, a team). Change the schema with the handler; core publishes it to authors as `configJsonSchema` and enforces it when a flow goes live.
- Every `createNotifications` call passes `event`, typed
  `TOperationNotificationEvent` from `src/meta/notifications.ts`: task
  assignment (on create and on update) `operation:task:taskAssignee`, note
  mentions `operation:note:noteMention`, a new triage
  `operation:triage:triageCreated`, added team members
  `operation:team:teamMemberAdded`. The meta names are the keys users' settings
  are saved under; renaming one drops saved choices, and the meta lists only
  events that have a sender.
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
- Smoke (Discord account): turn on member linking with the client secret,
  link an account from My Discord account, assign that member a task in a
  team with Discord, and confirm the reply pings them; unlink and confirm the
  reply names them with a "Link Discord account" button.
- Smoke (Discord): connect a server with a bot token, pick a channel and all
  events for a team, send the test message, then create a triage, accept it
  and assign the task. One card appears in the channel and is edited in
  place, with a reply line per later event; a GitHub-opened triage shows its
  issue link.
