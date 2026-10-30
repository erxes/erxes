# `operation_api` Plugin Guide

## Identity

- **Plugin:** `operation`
- **Project:** `operation_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/operation_api`
- **Last synchronized:** `2026-10-30`

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
  or task owns in that channel, the link between a team member and their
  Discord account, and the company channels where customers use the
  `/triage new` and `/tasks` slash commands.
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
- Discord slash commands for customers: an admin links a company's Discord
  channel to the company and the team that receives its triages. Slash
  commands turn on by themselves when a server is connected
  (`operationDiscordConnect` for a new server, or for a server reconnected
  with a different bot application; a token update on the same application
  keeps the current on/off state) and again whenever a customer channel is
  saved on a server whose commands are off
  (`operationDiscordSaveCustomerChannel`; the channel is saved either way).
  The server card can turn them on again or off
  (`operationDiscordEnableCommands`). Turning them on points the bot application's
  Interactions Endpoint URL at the gateway itself
  (`PATCH /applications/@me`, skipped when it already matches; Discord
  verifies it with a signed PING, so the public key is saved first) and
  registers `/triage new` and `/tasks` in the server. Nothing is pasted in
  the Discord Developer Portal. The gateway URL must be public HTTPS; a
  localhost or `http` URL is refused before Discord is called, with a hint
  to set `GATEWAY_URL`. The automatic turn-on never replaces an endpoint URL
  the bot already points elsewhere (another system or deployment may use
  it); only the manual turn-on does. A failed turn-on never fails the
  mutation: the connection keeps commands off and stores the reason in
  `commandsError`, cleared by the next success or by turning them off.
  Turning them off removes the server's commands and leaves the endpoint
  URL as it is.
  `/triage new` opens a modal built from Label components (Title, Details,
  and an optional Priority select: Critical, High, Medium, Minor, No priority)
  and creates a triage for that company and team with that priority (none
  when the select is left empty),
  attributed to the member when the Discord user is linked, else to `system`
  with `discordSource`; the team then gets the usual `triageCreated`
  notifications. `/tasks` (no options) answers privately (ephemeral) with
  the company's open triages and tasks (number, name, status, due date only),
  ten per page; its Open/All/Previous/Next buttons switch the filter and
  page. Triages reported with
  `/triage new` keep a customer thread: their `triageAccepted`,
  `triageDeclined`, `taskAssigned` and `taskCompleted` events are also posted
  as a reply to the confirmation message in the channel they came from,
  mentioning the reporter. Customer messages name the report by its title,
  never by triage number (triage numbers restart once triages become
  tasks): "Your report X was accepted as Task #n", "Your report X was
  declined" with the reason, then "Task #n · X" for assignment and
  completion. The team's own channel still gets its internal card.
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
| Discord interactions  | `src/modules/discordIntegration/utils/`        | Signature check, `/triage new` modal, `/tasks` list and paging        |
| Discord commands      | `src/modules/discordIntegration/utils/discordCommands.ts` | Slash commands on/off (endpoint URL + guild commands) and re-sync |

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
- Discord customer channel GraphQL: `operationDiscordCustomerChannels`
  (`teamRead`); `operationDiscordSaveCustomerChannel`,
  `operationDiscordRemoveCustomerChannel`,
  `operationDiscordEnableCommands(_id)` and
  `operationDiscordDisableCommands(_id)` (`teamUpdate`).
  `OperationDiscordConnection.commandsRegisteredAt`, `commandsError` and
  `Triage.discordSource { userId username displayName }`.
- Express route `POST /integrations/discord/interactions`
  (`DISCORD_INTERACTIONS_PATH`) — the Interactions Endpoint URL, at
  `<gateway>/pl:operation/integrations/discord/interactions`
  (`getDiscordInteractionsUrl`), which erxes sets on the bot application.
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
  for the `bot` and `applications.commands` scopes with View Channels, Send
  Messages, Embed Links and Read Message History.
  Server membership is read one member at a time with
  `GET /guilds/{id}/members/{user}`, which needs no privileged intent.
- Discord OAuth2 (`/oauth2/token`, `/oauth2/token/revoke`, `/users/@me` with a
  bearer token) with the connection's application id and client secret.
- The shared `redis` client for single-use account-link states
  (`operation:discord:account-link:<state>`, 10 minutes) and the
  `/triage new` rate limit (`operation:discord:triage-rate:<subdomain>:<user>`).
- Discord interactions: Ed25519 signatures checked with the application's
  `verify_key`, the endpoint URL set through `PATCH /applications/@me`,
  guild command registration
  (`PUT /applications/{app}/guilds/{guild}/commands`) and deferred answers
  edited through `PATCH /webhooks/{app}/{token}/messages/@original`. Core's
  `companies.findOne` names the company and validates the link.
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
  bot token and client secret with `select: false`, sealed with AES-256-GCM
  as `enc:v1:<k|j>:<iv>:<tag>:<data>` (`utils/discordSecrets.ts`). The key is
  scrypt-derived from `OPERATION_DISCORD_SECRET_KEY` (`k`), else
  `JWT_TOKEN_SECRET` (`j`); with neither set values stay plaintext. Read
  secrets only through `findWithSecrets` / `getConnectionWithToken`, which
  decrypt and re-seal legacy plaintext values; changing the key that sealed
  a value makes that server need reconnecting. A 401 marks the connection
  `health.status: 'broken'` and the worker skips it until it is reconnected.
- `operation_discord_configs` holds one config per team (unique `teamId` +
  `subdomain`), with `lastError` / `lastSentAt` written by the worker and the
  test message. Several teams may share a channel.
- `operation_discord_connections.clientSecret` is `select: false` like the
  token; `hasClientSecret` says whether member linking is on. Reconnecting a
  server with a different bot application clears the secret,
  `commandsRegisteredAt` and `commandsVersion` and deletes that server's team card mappings, since
  the new bot cannot edit the old bot's cards.
- `operation_discord_customer_channels` maps one Discord channel (unique
  `channelId` + `subdomain`) to one company and the team that receives its
  triages; a company may have several channels. Connections store the
  application `publicKey` (from `verify_key`, refreshed by
  `operationDiscordEnableCommands`), `commandsRegisteredAt` (set while slash
  commands are on), `commandsVersion`, a hash of `DISCORD_SLASH_COMMANDS`,
  and `commandsError` (why the last turn-on failed).
  When a verified interaction arrives for a server whose stored hash differs,
  the commands are re-registered in the background
  (`syncDiscordCommands`, one try per server per minute through the Redis
  lock `operation:discord:commands-sync:<subdomain>:<connection>`), so
  changing the command definitions needs no admin action. A server
  with customer channels cannot be disconnected.
- `operation_discord_messages.audience` is `team` (a card in a team
  channel, `configId` = team config) or `customer` (the `/triage new`
  confirmation in a company channel, `configId` = customer channel,
  `discordUserId` = reporter). The triage `_id` carries over to the task, so
  the customer thread follows the record. Removing a customer channel, or
  pointing it at another channel, deletes its customer threads.
- Triages created from Discord carry `discordSource` (Discord user id,
  username, display name, channel and guild); accepting or declining the
  triage copies it onto the task (`Task.discordSource`, GraphQL
  `OperationDiscordSource` on both types).
- A record reported from Discord before customer threads existed gets one
  the first time a customer event fires: `notifyDiscord` finds its
  `discordSource.channelId` among the customer channels and creates the
  thread without a message to reply to.
- `removeTask` queues a `cleanup` job (`TDiscordCleanupJob`): team cards are
  deleted from Discord, customer threads get a "was removed by the team"
  reply, and the task's `operation_discord_messages` rows are deleted.
  Moving a task to another team queues the same job limited to the old
  team's config (`configIds`), so only that team's card is removed (skipped
  when both teams post to the same channel) and the customer thread stays.
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
  errors are recorded on the config and dropped. A card that cannot be
  edited (Unknown Message, or 50005 when another bot posted it) is posted
  again. A 429 waits for `Retry-After`, else the body's `retry_after`.
- The bot token never leaves the server: no GraphQL type exposes it and the
  frontend sends it only to `operationDiscordCheckToken` and
  `operationDiscordConnect`. The client secret likewise reaches the server
  only through `operationDiscordSetClientSecret`.
- Every interaction except a body without `application_id` is answered
  only after its Ed25519 signature and timestamp (five minutes) verify.
  The modal is returned at once; `/tasks`, buttons and the modal submit are
  deferred, then the original response is edited, so nothing waits past
  Discord's three seconds; the edit retries on 404 in case it reaches
  Discord before the acknowledgement. The `/triage new` confirmation's
  customer thread is upserted, so a thread created earlier by the backfill
  still gets the confirmation's message id.
- A channel is either a company channel or a team's notification channel,
  never both: both save mutations refuse the other kind, so internal cards
  never reach a customer. Commands answer only in a linked channel (or a
  thread under one) of the connected server; `/tasks` never shows
  descriptions, notes or assignees.
- `/triage new` allows ten triages per Discord user per hour.
- `notifyDiscord` queues a `team` job when the team config subscribes to
  the event and a `customer` job when the record has a customer thread and
  the event is in `DISCORD_CUSTOMER_EVENTS`; a customer update goes only to
  the thread's own channel, never to another company's channel.
- An interaction that fails answers people in Discord with the generic
  `DISCORD_INTERACTION_ERROR_MESSAGE` and logs the real error on the server;
  internal error text never reaches a customer channel.
- Discord reaches the interactions endpoint and the OAuth callback through
  the gateway host, which can differ from the UI host (`GATEWAY_URL`, a
  tunnel). Outside SaaS (`VERSION` is not `saas`) both take the tenant from
  the stored connection or link state when the host-derived subdomain finds
  nothing; in SaaS the host-derived subdomain must match.
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
- Smoke (Discord slash commands): with the gateway on public HTTPS
  (`GATEWAY_URL`, e.g. a tunnel), connect a new server and confirm slash
  commands are already on (with them off, linking a customer channel turns
  them on) and the bot's Interactions Endpoint URL in the
  Discord Developer Portal now points at erxes; on localhost the server
  still connects, with commands off and the HTTPS hint in `commandsError`.
  With the bot's endpoint pointing at another address, connecting leaves it
  alone and stores that reason; turning them on manually replaces it.
  Link a channel to a company, run `/triage new` and `/tasks` there; the triage appears in the
  team's triage list with the company and the Discord reporter, and `/tasks`
  pages through the company's tasks. In an unlinked channel both commands
  answer that the channel is not linked. Accepting, assigning, completing
  or declining that triage replies in the company channel and mentions the
  reporter, while the team channel keeps its card.
- Smoke (Discord account): turn on member linking with the client secret,
  link an account from My Discord account, assign that member a task in a
  team with Discord, and confirm the reply pings them; unlink and confirm the
  reply names them with a "Link Discord account" button.
- Smoke (Discord): connect a server with a bot token, pick a channel and all
  events for a team, send the test message, then create a triage, accept it
  and assign the task. One card appears in the channel and is edited in
  place, with a reply line per later event; a GitHub-opened triage shows its
  issue link.
