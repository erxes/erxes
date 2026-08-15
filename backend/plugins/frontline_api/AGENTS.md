# `frontline_api` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/frontline_api`
- **Last synchronized:** `2026-08-15`

## Scope

### Owns

- Inbox conversations, conversation messages, and the Elasticsearch/Mongo
  conversation query builders.
- Channels and channel membership, including channel scope (`team` vs
  `personal`) and the role model (`admin` / `lead` / `member`).
- Integrations records (`Integrations` collection) and their lifecycle
  (create / edit / repair / archive / remove) across messenger, lead, webhook,
  and external kinds.
- Channel integration runtimes hosted in this service and their webhook
  ingestion, message delivery, and bot automation: Facebook (Messenger + Page
  comments), Instagram, IMAP, Discord, and Call (SIP/CDR).
- Response templates.
- Ticketing: boards, pipelines, statuses, tickets, activities, notes, ticket
  configs, plus ticket import/export handlers.
- Forms: form definitions, fields, and form submissions (with submission export).
- Knowledge base: topics, categories, articles, and the AI knowledge source
  provider that indexes articles.
- Frontline reports, including the saved report charts that persist a named
  filter configuration for a report card.
- Plugin-owned automation triggers/actions/bots contributed to the platform
  automation engine.

### Does not own

- Users, brands, tags, permission groups, customers, teams, permissions storage,
  file upload configuration, and segments infrastructure — owned by `core-api`
  and read over tRPC, never modelled here.
- The automation execution engine, wait conditions, or trigger dispatch — those
  live in `erxes-api-shared/core-modules` and are consumed, not modified.
- Meta/Facebook app registration and page tokens beyond what is stored on this
  plugin's own integration and account documents.
- Any UI surface; `frontline_ui` owns routes, forms, and rendering. The
  `frontline` i18n namespace is served from
  `backend/gateway/src/locales/{en,mn}/frontline.json`, which is gateway-owned,
  not plugin-owned.
- Other plugins' collections or service implementations.

## Current Capabilities

- Ticket pipelines persist an ordered unique `propertyIds` selection. Create
  and update validate every id against Core `frontline:ticket` fields before
  writing it. `isPropertySelectionConfigured` distinguishes untouched legacy
  pipelines from an intentional empty selection.
- Runs as a federated subgraph plus tRPC service on port `3304`, with GraphQL
  subscriptions enabled.
- Multi-channel inbox with membership-scoped conversation visibility.
- **Team channels** — many members, invitable through `channelAddMembers`.
- **Personal channels** — a single user's private inbox with exactly one member
  (the owner, as `admin`) and no invite path. Provisioned lazily: it comes into
  existence the first time it is asked for, either by the `getPersonalChannel`
  query (the settings page reads it) or by an integration created without a
  channel.
- A personal channel accepts every integration kind a team channel accepts.
  There is no personal-only or team-only kind list. When
  `integrationsCreateExternalIntegration` is called without a `channelId`, the
  integration attaches to the caller's personal channel regardless of kind.
- Receives Facebook and Instagram webhooks over Express and turns them into
  customers, conversations, comment conversations, and post conversations.
- Sends agent replies and bot messages through the Graph Send API, including
  private replies addressed by `comment_id`.
- Publishes posts to a connected page (`facebookCreatePost`), optionally with up
  to 10 uploaded images (passed as storage keys) staged as unpublished photos and
  published as one carousel, under a per-page hourly rate limit and an audit log
  of every attempt.
- Resolves the Meta app per integration kind, so page posting can run on its own
  `FACEBOOK_POST_APP_ID`/`FACEBOOK_POST_APP_SECRET` credentials while Messenger
  keeps the shared app.
- Runs Facebook/Instagram/Discord/inbox/ticket automation triggers and actions,
  including bot message sequences with postback buttons and wait conditions.
- Logs Facebook Graph delivery failures with provider error metadata and request
  context while excluding outbound message content; comment-triggered bot flows
  do not send Messenger typing indicators.
- Boots the Call app, the IMAP poller, and the Discord gateway client from
  `onServerInit`.
- Ticket boards/pipelines, response templates, forms, knowledgebase articles,
  and report aggregations.
- Contributes permissions, notifications, segments, references, and
  import/export handlers to the platform through `meta/`.

## Architecture

| Area                 | Path                                                                        | Responsibility                                                                                          |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Bootstrap            | `src/main.ts`                                                               | `startPlugin({ name: 'frontline', port: 3304 })`, wires tRPC, routes, meta, and every surface           |
| Models               | `src/connectionResolvers.ts`                                                | Per-subdomain model container for all modules                                                           |
| GraphQL              | `src/apollo/`                                                               | Aggregated `typeDefs` and `resolvers` across modules                                                    |
| tRPC                 | `src/init-trpc.ts`                                                          | `appRouter` for service-to-service calls                                                                |
| HTTP                 | `src/routes.ts`                                                             | Mounts `/facebook` and `/instagram` webhook routers                                                     |
| Platform extensions  | `src/meta/`                                                                 | automations, permissions, notifications, segments, references, import/export                            |
| Channels             | `src/modules/channel/`                                                      | Channel + ChannelMember models, schema, resolvers, role checks                                          |
| Inbox                | `src/modules/inbox/`                                                        | Conversations, messages, integrations, widget/clientportal schemas, `receiveInboxMessage`               |
| Conversation queries | `src/conversationQueryBuilder.ts`, `src/modules/inbox/conversationUtils.ts` | Mongo and Elasticsearch conversation filters (membership-scoped)                                        |
| Integrations         | `src/modules/integrations/<kind>/`                                          | facebook, instagram, imap, discord, call, trpc                                                          |
| Call reporting       | `src/modules/reports/callReportService.ts`                                  | CDR filter, leg-to-call folding, and the per-queue/agent/number report computation                      |
| FB automation        | `src/modules/integrations/facebook/meta/automation/`                        | Comment/message triggers and actions, bot message generation                                            |
| FB page posting      | `src/modules/integrations/facebook/postService.ts`, `postGuard.ts`          | Post publishing pipeline (validation, photo staging, cleanup, permalink) and its rate limit + audit log |
| FB app resolution    | `src/modules/integrations/facebook/commonUtils.ts`                          | `resolveFacebookApp`, `facebookAppSelector`, `facebookAccountSelector`                                  |
| Ticket               | `src/modules/ticket/`                                                       | Boards, pipelines, statuses, tickets, activities, notes                                                 |
| Forms                | `src/modules/form/`                                                         | Forms, fields, submissions                                                                              |
| Knowledge base       | `src/modules/knowledgebase/`                                                | Topics, categories, articles, AI knowledge source                                                       |
| Reports              | `src/modules/reports/`                                                      | Inbox/ticket report aggregations, `buildTicketMatch`, and the saved `ReportCharts` model                |
| Migrations           | `src/migrations/`                                                           | Plugin-owned data migrations                                                                            |

## Contracts

### Provides

- GraphQL subgraph on port `3304` (queries, mutations, subscriptions) federated
  by the gateway.
- GraphQL (federated subgraph): `getChannel`, `getChannels`, `getMyChannels`,
  `getChannelMembers`; `channelAdd`, `channelUpdate`, `channelRemove`,
  `channelAddMembers`, `channelRemoveMember(s)`, `channelUpdateMember`.
- GraphQL: `getMyChannels(name, sortField, sortDirection)` — the caller's
  memberships, sorted in the database. `sortField` accepts `name` or `createdAt`
  and falls back to `createdAt` for anything else; `sortDirection` is `1` or
  `-1`, defaulting to `-1`. Counts are field resolvers and `updatedAt` is not a
  schema path, so neither is sortable. The query runs under
  `collation({ locale: 'en', strength: 1 })`, so `name` sorts case- and
  diacritic-insensitively instead of in Mongo's default byte order.
- GraphQL: `getChannels` returns **team channels only** on every branch
  (`channelIds`, `integrationId`, see-everything, and membership), including the
  caller's own personal channel. Personal inboxes are reached only through
  `getPersonalChannel`.
- GraphQL: `getPersonalChannel: Channel` — **get-or-create**. Reading it
  provisions the caller's personal channel; it never returns null for an
  authenticated user. This is the lazy provisioning entry point.
- GraphQL: `Channel.conversationCount` and `Channel.unreadConversationCount` —
  resolved per request from the channel's integrations, never from the stored
  `conversationCount` field on the document, which is legacy and not maintained.
  `unreadConversationCount` is per-viewer: open conversations whose
  `readUserIds` lacks the caller. Both cost a query per channel, so select them
  only where the number is shown.
- GraphQL: `Channel.scope` (`"team" | "personal"`; absent on channels written
  before the field existed — treat missing as `team`).
- GraphQL: `channelAdd(..., scope: String)` — defaults to `team`. `personal`
  rejects non-empty `memberIds` and errors if the caller already owns one.
  `channelUpdate` deliberately exposes no `scope` argument, so a channel's scope
  is fixed at creation.
- GraphQL: `integrationsCreateExternalIntegration(kind, channelId, name,
accountId, brandId, data)` — `channelId` is **nullable** for every kind;
  omitting it attaches the integration to the caller's personal channel and
  provisions that channel if it does not exist yet.
- GraphQL: `integrationsGetUsedTypes` and
  `integrationsGetUsedTypesByChannel(channelId: String, scope: String)` — the
  integration kinds that currently have at least one active integration:
  repository-wide for the former, and for the latter within the caller's
  visible channels, optionally narrowed by channel id and/or channel scope.
  Both return `[{ _id: kind, name: label }]` filtered through the
  `getIntegrationsKinds()` label map. `scope: "team"` also matches legacy
  channels that have no `scope` field. The by-channel query requires an
  authenticated user and never reveals another user's personal inbox.
  `integrationsGetUsedTypesByChannel` returns
  `[integrationsGetUsedTypesByChannel]` (its own type, not the shared
  `integrationsGetUsedTypes`), carrying `conversationCount` and
  `unreadConversationCount` per kind for the matched channels.
- tRPC `appRouter` consumed by other services, including
  `inbox.updateUserChannels({ channelIds, userId })` — replaces a user's team
  channel memberships; never touches their personal channel.
- HTTP routes in `src/routes.ts` and provider webhooks under
  `src/modules/integrations/*`: Express webhook routes `/facebook/*` and
  `/instagram/*`, including the OAuth entry points `/facebook/fblogin`,
  `/facebook/kind/:kind/fblogin`, and `/instagram/iglogin`.
- GraphQL `callQueueList(integrationId)` — the queues configured on the call
  integration, each merged with its `CallQueueStatistics` row when the PBX has
  reported one. A queue with no live statistics is still listed, as
  `{ queue, integrationId }`.
- GraphQL call reports — `callGetQueueStats`, `callGetAgentStats`,
  `getCallbackStats`, `callKpiScorecard`, `callVolumeSeries`,
  `callCarrierBreakdown`, `callHeatmap`, `callTopNumbers`. All eight read
  `CallCdrs` through `buildCdrFilter` and fold legs into calls before counting.
  They return nothing in a deployment whose PBX does not post CDRs.
- GraphQL: `reportCharts(chartType: String)` and `reportChartDetail(_id)` —
  saved report charts, oldest first. A saved chart is a name plus the filter
  configuration a report card was showing; `chartType` is the frontend's chart
  registry id (for example `ticket-custom-properties`), which is how a stored
  configuration finds the component that renders it.
- GraphQL: `reportChartAdd(name!, chartType!, colSpan, filters)`,
  `reportChartEdit(_id!, name, colSpan, filters)`, `reportChartRemove(_id!)`.
  All three require an authenticated user. `filters` reuses the
  `TicketReportFilter` **input**, so a saved configuration is by construction
  something the report queries accept; the persisted subset is narrowed by
  `pickReportChartFilters`. Saving never touches the default charts — they are
  a frontend constant, not rows in this collection.
- `TicketReportFilter.statusIds: [String]` — real pipeline `Status._id` values
  (multi-select). `buildTicketMatch` turns a non-empty list into
  `statusId: { $in: filters.statusIds }`. This is distinct from the older,
  unused-by-the-frontend `status: String` single-value field on the same
  input, which `buildTicketMatch` still honors first if present — never merge
  the two or repurpose `status` for multi-select.
- Automation constants (`triggers`, `actions`, `bots`, AI knowledge sources) and
  worker producers exported from `src/meta/automations.ts`.
- Permissions, notification types, segment definitions, references, and
  ticket/form-submission import-export handlers from `src/meta/`.

- GraphQL: `ticketConfigs(channelId)`, `ticketConfigDetail(_id)`,
  `ticketConfig(pipelineId)`, `ticketSaveConfig(input)`, `ticketRemoveConfig`
  — the messenger ticket form configuration for a pipeline. `TicketConfig`
  carries `formFields` (the four built-in fields `name`, `description`,
  `attachment`, `tags`, each with `isShow` / `label` / `placeholder` / `order`)
  and `propertyFields: [TicketPropertyField]` — ticket custom properties chosen
  from the `frontline:ticket` field groups, each `{ fieldId, groupId, label,
placeholder, order, isRequired, type, options }`, where `type` and `options`
  are copied from the core field definition on save so the messenger widget can
  render the right control without querying core. The widget bootstrap
  (`widgetsMessengerConnect`) returns the whole document as `ticketConfig: JSON`,
  so both lists reach the messenger widget without a schema change there.
- GraphQL: `widgetTicketCreated(name, description, attachments, statusId,
customerIds, tagIds, propertiesData: JSON)` — the public messenger ticket
  submission. `propertiesData` is a `{ [fieldId]: value }` map that is narrowed
  to the `propertyFields` of the pipeline's ticket config, checked for the
  required ones, validated through core `fields.validateFieldValues`, and stored
  on `Ticket.propertiesData`.

### Consumes

- `erxes-api-shared/utils`: `startPlugin`, `sendTRPCMessage`, `fetchEs`,
  `getEnv`, `sendWorkerQueue`, `getUniqueValue`, `randomAlphanumeric`,
  `schemaWrapper`, `mongooseStringRandomId`.
- `erxes-api-shared/core-modules`: `sendNotification`, `canGroup`,
  import/export producer handlers, automation types,
  `replaceOutputPlaceholders`, `splitType`, `sendAutomationTrigger`,
  `EXECUTE_WAIT_TYPES`, `attachmentSchema`.
- `core` over tRPC — brands, tags, users, structure,
  `configs.getFileUploadConfigs`, `users.findOne`, `fields.find` (validating the
  ticket property fields chosen in a ticket config).
- Facebook Graph API through `fbgraph` (`graphRequest` in
  `src/modules/integrations/facebook/utils.ts`).

## Data and State

- Tenant-scoped Mongo collections generated per `subdomain` through
  `generateModels`; all reads and writes are tenant-scoped.
- Collections are namespaced per module: `Facebook*`, `Instagram*`, `Call*`,
  `Discord*`, `Imap*`, plus inbox (`Conversations`, `ConversationMessages`),
  channel, ticket, form, and knowledge base collections.
- `channels.scope` — `'team' | 'personal'`, default `'team'`. Legacy documents
  have no `scope` field; all reads treat a missing value as `team`, so **no
  backfill migration is required**.
- Partial unique index `channels { createdBy: 1 }` with
  `partialFilterExpression: { scope: 'personal' }` — enforces at most one
  personal channel per user and makes concurrent creation race-safe (the loser
  catches duplicate-key `11000` and reuses the winner).
- Unique index `channelMembers { channelId: 1, memberId: 1 }`.
- `frontline_report_charts` (`models.ReportCharts`) — one document per saved
  report chart: `name`, indexed `chartType`, `colSpan`, an embedded `filters`
  subdocument with explicit fields, and `createdBy`. Tenant-scoped like every
  other collection here; charts are visible to the whole tenant, not only their
  author.
- Migrations under `src/migrations/` cover call conversation content, CDR dates,
  channels, forms, response templates, and tickets.
- Every call — whether it arrived through the CDR webhook (`receiveCdr`) or the
  CTI event pipeline (`handleCallEvent`) — creates or updates a row in the inbox
  `Conversations` collection. That collection is therefore the only complete
  record of call activity and is what call reporting aggregates.
- Per-call telemetry lives outside the conversation: `CallSessions`
  (`calls_sessions`) is the live record written by both call paths, and
  `CallHistory` (`calls_histories`) is the legacy softphone log, still read but
  no longer written. `CallCdrs` (`calls_cdrs`) holds raw PBX legs and is
  populated only when a PBX posts to the CDR webhook.
- `calls_conversations` and `calls_active_sessions` are erxes v1 leftovers. No
  model binds them; never read or write them.
- Facebook upload configuration is cached in a module-level variable in
  `src/modules/integrations/facebook/utils.ts` and is **not** keyed by
  subdomain — treat it as a known cross-tenant hazard when touching that file.

## Local Invariants

- A personal channel always has exactly one `ChannelMembers` row: its owner,
  with role `admin`. Nothing may add, remove, or demote that member.
  `channelAdd(scope: "personal")` rejects `memberIds`, `channelAddMembers`
  rejects personal channels, and `removeChannelMember` / `updateChannelMember`
  already refuse to drop the last admin.
- `updateUserChannels` must exclude personal channels from both its delete and
  its insert — revoking that membership would hide a user's own inbox from them.
- Conversation visibility stays membership-based. `integrationsFilter` and
  `channelFilter` must not gain a scope-specific branch; a personal channel is
  correctly private because it has exactly one member.
- A see-everything channel listing (`isOwner` / `showAllChannels`) must still
  exclude other users' personal channels. `visibleChannelsFilter` in
  `src/modules/channel/utils.ts` is the one implementation of that rule; any
  new resolver that reads channels — from any module — composes it rather than
  querying `Channels` directly, and narrows with `$and` so a caller-supplied
  `_id` can never widen the result.
- Conversations reference an integration, not a channel. Any per-channel
  conversation count must resolve the channel's integration ids first; never
  read `channels.conversationCount` / `channels.openConversationCount`, which
  are stale legacy fields.
- An integration may never be attached to another user's personal channel. That
  ownership check is the only scope-based restriction on integration creation —
  do not reintroduce a per-kind allowlist for personal channels.
- The Facebook OAuth `state` must stay a query-less url. When
  `FACEBOOK_LOGIN_REDIRECT_URL` points at the shared authorize redirector, that
  service builds the callback as `${state}/fblogin?code=...`, so any query
  string in `state` lands before the `/fblogin` path and 404s. Extra context
  such as the integration kind travels as a `/kind/<kind>` path segment.
- Facebook/Instagram Send API calls that carry a `tag` must also carry
  `messaging_type: 'MESSAGE_TAG'`; a `sender_action` request must carry neither.
  `handleFacebookMessage.ts` is the reference implementation.
- A Page may send exactly one private reply per comment, and that reply does not
  open the 24-hour messaging window. Any message after it needs a user
  interaction, an already-open window, or a valid tag.
- Comment-triggered Facebook automations never send `typing_on`, including bot
  sequence steps after the initial private reply.
- In `sendReply`, request-level Graph error codes (`1`, `10`, `100`, `10900`)
  must not flip `FacebookIntegrations.healthStatus` to a token state — only
  genuine token and permission failures may.
- Page access tokens never leave the service: `facebookGetAccounts` excludes
  `token`/`tokenSecret` and the integration queries exclude
  `facebookPageTokensMap`.
- `facebookCreatePost` resolvers stay thin — validation, photo staging, staged
  media cleanup, and audit logging belong to `publishPagePost` in
  `postService.ts`. A post carries images or a link preview, never both.
- Accounts stored before `appId` existed belong to the shared app; app-scoped
  queries must go through `facebookAppSelector`/`facebookAccountSelector` so
  those legacy accounts stay visible.
- Call reports read `CallCdrs`. It is the only source carrying `disposition`,
  `billsec`, `duration`, `userfield`, and the `QUEUE[<id>]` action type; the
  trade-off is that a deployment whose PBX never posts CDRs reports nothing.
- Every call report resolver has the same shape as `callCalculate*`: build a
  filter with `buildCdrFilter`, `find(...).select(CDR_REPORT_FIELDS).lean()`,
  then compute in JS. Do not reintroduce an aggregation pipeline — the folding
  and the metric definitions belong in `callReportService.ts` and
  `statistics.ts`, where one change reaches every surface.
- A call writes several CDR legs sharing a `uniqueid`, so every report calls
  `foldLegsIntoCalls` before counting. Counting legs double-counts a multi-leg
  call — that is exactly what the carrier donut used to do, which is why it
  never reconciled with Total Calls.
- The Mongolian carrier mapping lives once, in `carrierExpression` in
  `callReportService.ts`, and is shared by `callCarrierBreakdown` and
  `callTopNumbers`. Prefixes are two digits except Skytel's `696XXXXX`;
  unallocated ranges (`81`, `82`, `84`, `87`) fall through to `Other`. Mirror
  any change in `detectCarrier` in `frontline_ui`.
- `CallIntegrations.queues` is the authoritative queue list.
  `CallQueueStatistics` is a cache of live PBX counters and is empty until the
  PBX pushes queue statistics, so it must never be the source of "which queues
  exist" — the Call Reports page hides every tab when the queue list is empty.
- Call report queue visibility is decided once, by `seesEveryQueue` in
  `src/modules/reports/graphql/resolvers/callQueries.ts`: `user.isOwner`, the
  `frontline:admin` entry in `user.permissionGroupIds`, or the
  `showAllCallReports` action grants every queue; everyone else is narrowed to
  the integrations listing them under `operators.userId`. Add new report
  resolvers on top of that helper rather than re-deriving the rule.
- A queue is a filter, never the scope. Every call report resolver resolves an
  `IReportScope` through `resolveReportScope` and bounds its CDR reads with
  `inboxScopeFilter` (`inboxIntegrationId`); `QUEUE[<id>]` narrowing applies
  only when a specific `queueId` arrives. Anchoring on the queue alone is what
  emptied the whole report once the deployment stopped routing through
  queue 6507 and moved to IVR, and it left `callCarrierBreakdown`,
  `callHeatmap`, and `callTopNumbers` reading every integration's CDRs whenever
  no queue was chosen. An empty `scope.inboxIds` means "nothing readable" and
  must short-circuit before any query runs.
- `resolveReportScope` rejects a `queueId` the scoped integrations do not own,
  which is the permission guard `callGetQueueStats` used to carry alone. Keep
  that check in the helper so a caller cannot reach another integration's queue
  by pairing it with its own `integrationId`.
- KPI formulas live once, in `statistics.ts`. `callKpiScorecard`,
  `callTodayStatistics`, and the six `callCalculate*` queries all pass filtered
  CDR legs to those helpers, so every surface reports a metric the same way.
  The one exception is `callKpiScorecard`'s `averageSpeed`, which uses
  `averageSpeedOfAnswer` in `cdrUtils.ts`.
- Speed of answer must be folded per call, never averaged per leg. The caller's
  wait is stamped on the leg that held them — the `Queue` leg, which carries
  `NO ANSWER` and no talk time because the caller left it the moment the agent
  bridged — while the leg marked `ANSWERED` is usually a `ForkCDR` copy whose
  `answer` equals its `start`. Selecting legs by `disposition` therefore keeps
  only zero-ring legs and reports `0`. `callSpeedOfAnswer` reads the
  `isHumanAnsweredLeg` leg first and falls back to the call's `Queue`/`Dial`
  legs; calls answered only by voicemail or IVR are excluded, not counted as 0.
- `waittime` is **not a field on `CDRSchema`** — Mongoose strips it on write, so
  anything reading `$waittime` measures zero. Ring time is `duration - billsec`
  on a folded call (`statistics.ts` uses `answer - start` for the same thing).
- A trunk leg carries the dialled DID in `dst`; the answering extension is in
  `dstchannelExt`. `agentOf` takes whichever field holds a four-digit extension,
  so agent attribution must not read `dst` alone.
- Some trunks present the outbound caller id as `<did><extension>` — `src` is
  `767622222000` for DID `76762222` and extension `2000`, and `channelExt` holds
  the customer number, not the agent. `agentOf` therefore accepts an optional
  known-extension set and trusts a four-digit `src` suffix only when it matches
  a configured operator. Never strip the suffix without that set: an arbitrary
  trailing four digits is a customer number as often as an extension.
- Agent statistics are attributed **per leg, not per folded call**. A queue call
  rings several agents at once, each on its own leg sharing the `uniqueid`, so
  `summariseAgentStats` takes `ICdrLeg[]` (not `ICall[]`): the agent whose leg
  satisfies `isHumanAnsweredLeg` gets the answer, every other agent that rang
  gets a miss. Folding first would credit whichever ringing leg happened to come
  first and silently drop the rest. Consequently per-agent totals sum to more
  than the queue's call count — that is correct for a leaderboard.
- When a call is answered but no leg yields an extension, `summariseAgentStats`
  skips the call entirely rather than charging every agent that rang with a
  miss; one of them is likely the one who picked it up.
- A `FOLLOWME[<ext>]` leg is an extension's Follow-Me forward to a staff mobile,
  not a customer call. It carries the DID in `src` and the staff mobile in
  `dst`, so it has no customer identity at all, and the PBX gives each forward
  attempt its own `uniqueid` — one unanswered queue call can spawn three of
  them. Counted naively they dominate every call-level report: on a real
  deployment 1,664 of 1,843 "calls" were forwards, and the busiest "customer"
  in Top Numbers was an operator's mobile.
- `buildCdrFilter` therefore excludes `FOLLOWME[...]` unless the caller passes
  `includeForwarded: true`, which only `callGetAgentStats` and `callHistoryList`
  do. A `queueId` already narrows `actionType` to `QUEUE[<id>]`, so the
  exclusion applies only to the unfiltered (outbound) fetches. Never drop the
  exclusion elsewhere to "get more data" — it re-inflates Total Calls, Top
  Numbers, carrier mix, and callbacks.
- A forward cannot be merged into the call that triggered it. The PBX issues a
  fresh `uniqueid` per attempt and erxes gives most forwards their own
  `conversationId`, so neither field links them back; only ~2 in 10 forwarded
  conversations also hold the originating `IVR`/`DIAL` leg. Do not add a
  time-window join to "fix" abandonment — forwards outnumber queue calls 15:1
  because most originate from direct extension calls, not the queue.
- Consequence to keep in mind: a queue call nobody answered at the desk but
  which was answered on a mobile counts as abandoned in Queues and answered for
  the agent in Agents. That is the honest reading of the data, not a bug.
- The forwarded agent is in the `actionType`, nowhere else: `agentOf` reads
  `FOLLOWME[<ext>]` before anything else because `dstchannelExt` is the trunk
  and `dst` is a mobile. This is the only way extensions whose calls are all
  forwarded ever appear on the leaderboard.
- Because each forward attempt has its own `uniqueid`, `summariseAgentStats`
  re-keys forwarded legs before folding: consecutive legs for the same
  extension starting within `FORWARDED_WINDOW_MS` become one call. Bucketing by
  a fixed time window instead would split a burst that straddles the boundary —
  real forwards land one second apart. Without this, an extension with three
  Follow-Me destinations reports triple its real volume.
- A voicemail deposit is not an answered call. `isHumanAnsweredLeg` requires
  `billsec > 0`, a `Queue`/`Dial` `lastapp`, and an `actionType` without `VM`,
  which is why a queue leg that the PBX marks `ANSWERED` with `billsec: 0` — the
  queue answering the line to play its announcement — counts as abandoned. Do
  not relax those conditions to raise an answer rate; on a real deployment the
  voicemail legs outnumber human answers by more than twenty to one.
- `calculateOccupancyRate` computes `workingTime / handlingTime`, which is the
  inverse of occupancy and exceeds 100% at low call volume. `callKpiScorecard`
  returns it as-is; neither it nor `firstCallResolution` is rendered by the UI
  today.
- `TicketConfig.propertyFields` is stored in display order: the array position
  is the order and `order` is rewritten to `index + 1` on every save. Never
  re-sort the incoming list by `order` — the client sends the list as the user
  arranged it. Every entry must resolve to an existing `frontline:ticket` field
  in core, and duplicates are dropped; `validateTicketPropertyFields` in
  `src/modules/ticket/utils/ticketConfig.ts` is the one implementation. `type`
  and `options` are always taken from the core field definition there, never
  from the submitted input, so a saved config mirrors the property as it exists
  at save time.
- `widgetTicketCreated` is unauthenticated: it must never write a
  `propertiesData` key that the pipeline's ticket config does not expose.
  `buildTicketPropertiesData` in
  `src/modules/inbox/graphql/resolvers/mutations/widget.ts` is the single filter
  and required-field gate for that payload.
- Automation operation and node type names stay prefixed with the plugin and
  module (`frontline:facebook.comments.create`).
- Facebook/Instagram automations must resolve their integration and bot from the
  request's own models; never read another plugin's collections. The two
  integrations share a code shape but never a collection: an Instagram automation
  reads and writes `Instagram*` models only. `addMessage` on either
  `ConversationMessages` model validates the parent against its own
  conversations collection, so a crossed model fails at write time with
  `Conversation not found with id ...` after the message has already been sent.
- `Pipeline.excludeCheckUserIds` is an **exemption** list, not a target list.
  When `isCheckUser` is on, `generateFilter` restricts a user to
  `assigneeId`/`createdBy` tickets **unless** their id is in
  `excludeCheckUserIds` — the UI labels that field "Members who still see every
  ticket". Never invert this test; `sales_api`'s `checkItemPermByUser` uses the
  same semantics.
- Ticket reports count **live tickets by default**: `buildTicketMatch` treats an
  unset `state` as `active` (and a missing `state` field as active, for tickets
  written before it existed). `state: 'all'` is the only way to include archived
  and deleted tickets. Do not reintroduce an unfiltered default.
- `reportTicketPriority` returns a `priority: 0` ("no priority") row alongside
  `TICKET_PRIORITY_TYPES`, because the schema default is `0` and most tickets
  are never triaged. Summing every returned row gives the real ticket count, and
  the percentages are shares of it. `TICKET_PRIORITY_TYPES` itself must stay
  free of that row — import, export, and the priority field options read it.
- `Ticket.statusType` is a **denormalized copy** of `Status.type` and is only
  written by `updateTicket` when a ticket moves to a different status —
  `addTicket` and the widget's direct `Ticket.create` never set it, so every
  ticket created into a pipeline status and never moved still holds the schema
  default `0`. Never group or count on it directly: resolve the category from
  the ticket's `statusId` through `Status.type` and fall back to the stored copy
  only when the status is gone. `reportTicketStatusSummary` is the reference
  implementation: it reports per pipeline status, so `TICKET_DEFAULT_STATUSES`
  supplies the category name and colour, never the row itself. The same staleness affects the `statusType` filter in
  `src/modules/ticket/utils/generateFilter.ts` and the automation/export field,
  which are **not** fixed yet.
- A ticket report match built from `buildTicketMatch` / `buildTicketTagMatch` is
  **not** complete on its own: a ticket carries no customer or company field, so
  those two filters resolve to related ticket ids over tRPC. Every such match
  must be passed through `narrowTicketMatchByContacts` before it reaches an
  aggregation, otherwise the API accepts Customer and Company and then silently
  ignores them. `buildTicketPipeline` already does this; a new ticket report
  resolver must too. When a selected contact has no related tickets the result
  is `_id: { $in: [] }` — never a fall back to unfiltered.
- A saved report chart stores only configuration. `pickReportChartFilters` is
  the one gate: it drops empty values and never persists `limit`, `page`, or
  `groupPropertyValue`, which describe a viewing session (paging, an open
  drill-down) rather than the chart. Widening the stored filter set means adding
  the field to the `filters` subschema, the `ReportChartFilters` output type,
  and that key list together, or it will be silently dropped on save.
- Every resolver, model call, worker, and route resolves models from the request
  `subdomain`.
- Schemas are defined with `new Schema(...)` and explicit fields; do not
  introduce new `schemaWrapper` usage — existing usages stay as they are.

## Validation

- `pnpm nx lint frontline_api` (repository-wide pre-existing errors exist in
  `src/public/widget/messengerWidget.bundle.js` and some ticket/report files;
  lint the files you touched)
- `pnpm nx build frontline_api`
- `npx tsc -p backend/plugins/frontline_api/tsconfig.json --noEmit`
- No `test` target is defined in `project.json`; do not invent one.
- Smoke: connect an IMAP account without a `channelId` → a `Personal inbox`
  channel is created with one admin member and the integration attaches to it;
  a second connect reuses the same channel; the same holds for a non-mailbox
  kind such as a webhook; creating an integration against another user's
  personal `channelId` is rejected; `channelAddMembers` on it fails; no user's
  `getChannels` lists it — not even the owner's.
- Smoke: comment on a subscribed Facebook page post that matches an active
  comment trigger, then confirm the public comment reply is posted and the
  private reply arrives in Messenger without a `#10` or `Invalid parameter`
  entry in the `erxes-facebook:error` log.
- Smoke: open Call Reports for an integration with a configured queue and a date
  range covering `calls_cdrs` documents whose `actionType` contains
  `QUEUE[<queue>]`. Every tab must show numbers; an empty `calls_cdrs` renders
  every tab blank, which is expected, not a bug.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-15` — Call reports scope by integration, queue becomes a filter

- **Summary:** Every call report resolver was anchored on `queueId`, so a
  deployment that stopped routing through its queue reported nothing at all —
  IVR and direct-to-extension traffic was invisible even though it was the only
  traffic left. Reports now resolve an integration scope through
  `resolveReportScope` and bound their CDR reads on `inboxIntegrationId`,
  applying `QUEUE[<id>]` only when a queue is actually chosen. This also closes
  the gap where `callCarrierBreakdown`, `callHeatmap`, and `callTopNumbers` had
  no integration bound at all.
- **Affected areas:**
  `src/modules/reports/graphql/resolvers/callQueries.ts` (all nine report
  resolvers, `resolveReportScope` / `inboxScopeFilter` /
  `operatorUserIdByExtension` replacing `findQueueIntegration` and
  `readableQueues`), `src/modules/reports/graphql/schema/call.ts`,
  `ICallReportArgs` in `src/modules/reports/callReportService.ts`.
- **Contracts changed:** Nine report queries gained an optional
  `integrationId: String`; `queueId` stays optional and now accepts `"all"`.
  Existing callers keep working, and a queue-scoped call returns the same rows
  as before, additionally bounded to that queue's integration.

### `2026-08-15` — Follow-Me forwards excluded from call volume, credited to agents

- **Summary:** `FOLLOWME[<ext>]` legs — an extension's forward to a staff
  mobile, one `uniqueid` per attempt — were counted as distinct outbound
  customer calls, inflating Total Calls to 1,843 against 179 real calls and
  filling Top Numbers with operator mobiles. `buildCdrFilter` now drops them
  unless `includeForwarded: true`; `callGetAgentStats` and `callHistoryList` opt
  in, read the agent out of the `actionType`, and collapse forward attempts made
  within `FORWARDED_WINDOW_MS` into one call, so extensions reached only by
  Follow-Me finally appear on the leaderboard without triple-counting and their
  calls stay traceable in the history under the existing `FOLLOWME` outcome.
- **Affected areas:** `src/modules/reports/callReportService.ts`
  (`buildCdrFilter`, `agentOf`, `forwardedExtensionOf`, `withForwardedCallKeys`,
  `summariseAgentStats`),
  `src/modules/reports/graphql/resolvers/callQueries.ts` (`callGetAgentStats`,
  `callHistoryList`).
- **Contracts changed:** None — same query names, arguments, and return types.
  Values move: Total Calls, Top Numbers, carrier mix, heatmap, volume series,
  callbacks, and call history all shed forwarded legs, while per-agent totals
  gain the calls those agents took on their mobiles.

### `2026-08-14` — Instagram bot replies persist to the Instagram collection

- **Summary:** `actionCreateMessage` stored the sent bot reply through
  `FacebookConversationMessages`, whose `addMessage` looks the parent up in
  `FacebookConversations` and therefore threw
  `Conversation not found with id <instagram conversation id>` after the message
  had already been delivered; it now uses `InstagramConversationMessages`, so the
  reply is saved and shows up in the Instagram conversation.
- **Affected areas:**
  `src/modules/integrations/instagram/meta/automation/messages/index.ts`.
- **Contracts changed:** None

### `2026-08-14` — Per-leg agent attribution in call reports

- **Summary:** `summariseAgentStats` now consumes CDR legs instead of folded
  calls, so a queue call that rings several agents credits the answering agent
  and counts a miss for every other agent that rang, instead of attributing the
  whole call to whichever ringing leg came first; `agentOf` additionally
  recovers the operator from an outbound caller id shaped `<did><extension>`
  when the suffix matches a configured operator.
- **Affected areas:** `src/modules/reports/callReportService.ts`,
  `src/modules/reports/graphql/resolvers/callQueries.ts` (`callGetAgentStats`
  passes legs; `callHistoryList` resolves operator extensions before folding).
- **Contracts changed:** None — `callGetAgentStats` returns the same fields,
  with corrected per-agent counts.

### `2026-08-14` — Fixed inverted `isCheckUser` ticket visibility

- **Summary:** With "Show only tickets assigned to the user" enabled, the
  own-tickets restriction now applies to users **outside**
  `excludeCheckUserIds`; previously only the exempted members were restricted,
  so adding a member hid their tickets and removing them showed everything.
- **Affected areas:** `src/modules/ticket/utils/generateFilter.ts`.
- **Contracts changed:** None

### `2026-08-13` — Frontline admins see every call queue

- **Summary:** `seesEveryQueue` now also treats a `frontline:admin` entry in
  `user.permissionGroupIds` as full call-report access, so admins get every
  integration and queue instead of only the ones they operate.
- **Affected areas:**
  `src/modules/reports/graphql/resolvers/callQueries.ts` — `callReportIntegrations`,
  `callGetQueueStats`, and every resolver using `findQueueIntegration`.
- **Contracts changed:** None

### `2026-08-12` — Pipeline-scoped ticket properties

- **Summary:** Ticket pipelines now persist only validated Core ticket property
  ids for pipeline-specific detail forms.
- **Affected areas:** `src/modules/ticket/{@types,db,graphql,utils}`.
- **Contracts changed:** `Pipeline`, `createPipeline`, and `updatePipeline`
  gained optional `propertyIds: [String]`; `Pipeline` also exposes
  `isPropertySelectionConfigured: Boolean` for backward-compatible rendering.

### `2026-08-10` — Improve Facebook delivery diagnostics

- **Summary:** Suppressed typing indicators throughout comment-triggered bot flows and added privacy-safe Graph error metadata logging.
- **Affected areas:** `src/modules/integrations/facebook/utils.ts`, Facebook automation messages
- **Contracts changed:** None

### `2026-08-07` — Indexed knowledge base articles carry their category name

### `2026-08-10` — Multi-select real pipeline status filter for ticket reports

- **Summary:** Added `statusIds: [String]` to `TicketReportFilter` /
  `ReportChartFilters`, so ticket reports can filter by any number of real
  pipeline statuses (as opposed to `state`, the active/archived/deleted
  lifecycle flag, and distinct from the pre-existing, frontend-unused
  single-value `status` field). `buildTicketMatch` matches
  `statusId: { $in: filters.statusIds }`; the persisted-chart filter
  whitelist (`REPORT_CHART_FILTER_KEYS` / `pickReportChartFilters`) and the
  chart schema (`reportChartFiltersSchema`) both gained the field so it
  round-trips through save/restore like every other ticket filter.
- **Affected areas:**
  `src/modules/reports/{@types/reportFilters.ts,utils.ts,
graphql/schema/{ticket.ts,chart.ts},db/definitions/chart.ts}`.
- **Contracts changed:** `TicketReportFilter` and `ReportChartFilters` both
  gained `statusIds: [String]`. `status: String` is unchanged and still
  takes precedence if a caller sends both.
