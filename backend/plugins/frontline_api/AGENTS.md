# `frontline_api` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/frontline_api`
- **Last synchronized:** `2026-08-10`

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
- Frontline reports.
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
- Boots the Call app, the IMAP poller, and the Discord gateway client from
  `onServerInit`.
- Ticket boards/pipelines, response templates, forms, knowledgebase articles,
  and report aggregations.
- Contributes permissions, notifications, segments, references, and
  import/export handlers to the platform through `meta/`.

## Architecture

| Area                 | Path                                                                       | Responsibility                                                                                          |
| -------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Bootstrap            | `src/main.ts`                                                              | `startPlugin({ name: 'frontline', port: 3304 })`, wires tRPC, routes, meta, and every surface            |
| Models               | `src/connectionResolvers.ts`                                               | Per-subdomain model container for all modules                                                           |
| GraphQL              | `src/apollo/`                                                              | Aggregated `typeDefs` and `resolvers` across modules                                                    |
| tRPC                 | `src/init-trpc.ts`                                                         | `appRouter` for service-to-service calls                                                                |
| HTTP                 | `src/routes.ts`                                                            | Mounts `/facebook` and `/instagram` webhook routers                                                     |
| Platform extensions  | `src/meta/`                                                                | automations, permissions, notifications, segments, references, import/export                            |
| Channels             | `src/modules/channel/`                                                     | Channel + ChannelMember models, schema, resolvers, role checks                                          |
| Inbox                | `src/modules/inbox/`                                                       | Conversations, messages, integrations, widget/clientportal schemas, `receiveInboxMessage`                |
| Conversation queries | `src/conversationQueryBuilder.ts`, `src/modules/inbox/conversationUtils.ts` | Mongo and Elasticsearch conversation filters (membership-scoped)                                        |
| Integrations         | `src/modules/integrations/<kind>/`                                         | facebook, instagram, imap, discord, call, trpc                                                          |
| Call reporting       | `src/modules/integrations/call/services/callReportService.ts`              | CDR filter, leg-to-call folding, and the per-queue/agent/number report computation                      |
| FB automation        | `src/modules/integrations/facebook/meta/automation/`                       | Comment/message triggers and actions, bot message generation                                            |
| FB page posting      | `src/modules/integrations/facebook/postService.ts`, `postGuard.ts`         | Post publishing pipeline (validation, photo staging, cleanup, permalink) and its rate limit + audit log |
| FB app resolution    | `src/modules/integrations/facebook/commonUtils.ts`                         | `resolveFacebookApp`, `facebookAppSelector`, `facebookAccountSelector`                                  |
| Ticket               | `src/modules/ticket/`                                                      | Boards, pipelines, statuses, tickets, activities, notes                                                 |
| Forms                | `src/modules/form/`                                                        | Forms, fields, submissions                                                                              |
| Knowledge base       | `src/modules/knowledgebase/`                                               | Topics, categories, articles, AI knowledge source                                                       |
| Migrations           | `src/migrations/`                                                          | Plugin-owned data migrations                                                                            |

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
  request's own models; never read another plugin's collections.
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

### `2026-08-10` — Ticket property values from the messenger widget

- **Summary:** `widgetTicketCreated` accepts `propertiesData: JSON`
  (`{ [fieldId]: value }`) and stores it on the ticket after narrowing it to the
  `propertyFields` of the pipeline's ticket config, enforcing the required ones,
  and validating the values through core `fields.validateFieldValues`.
  `TicketPropertyField` also gained `type` and `options`, both copied from the
  core field definition on every `ticketSaveConfig`, so the widget can render a
  select, radio, checkbox, switch, or date control instead of a text box.
- **Affected areas:**
  `src/modules/inbox/graphql/resolvers/mutations/widget.ts`,
  `src/modules/inbox/graphql/schemas/widget.ts`,
  `src/modules/ticket/@types/ticketConfig.ts`,
  `src/modules/ticket/db/definitions/ticketConfig.ts`,
  `src/modules/ticket/graphql/schemas/ticketConfig.ts`,
  `src/modules/ticket/utils/ticketConfig.ts`.
- **Contracts changed:** `widgetTicketCreated` gained the optional
  `propertiesData: JSON` argument; `TicketPropertyField` /
  `TicketPropertyFieldInput` gained optional `type: String` and
  `options: [TicketPropertyFieldOption]`.

### `2026-08-10` — Speed of answer folded per call

- **Summary:** `callKpiScorecard.averageSpeed` no longer always returns `0`.
  `cdrUtils.ts` gained `legRingSeconds`, `callSpeedOfAnswer`, and
  `averageSpeedOfAnswer`, which fold inbound legs by `uniqueid` and read the
  ring time off the leg that actually held the caller instead of averaging
  `answer - start` over legs selected by `disposition`, all of which are
  stamped at their own `start`.
- **Affected areas:** `src/modules/integrations/call/services/cdrUtils.ts`,
  `src/modules/integrations/call/graphql/resolvers/queries.ts`,
  `ICdrLeg.answer` in `src/modules/integrations/call/services/callReportService.ts`.
- **Contracts changed:** None — `CallKpiScorecard.averageSpeed` keeps its shape
  and unit (seconds).

### `2026-08-10` — Ticket property fields in the messenger ticket config

- **Summary:** A messenger ticket form configuration can now include ticket
  custom properties in addition to the four built-in fields: `TicketConfig`
  gained `propertyFields`, each entry naming a `frontline:ticket` field with its
  own label, placeholder, required flag, and position. `ticketSaveConfig`
  validates every entry against core's `fields` collection over tRPC, drops
  duplicates, and renumbers `order` from the submitted array position.
- **Affected areas:** `src/modules/ticket/@types/ticketConfig.ts`,
  `src/modules/ticket/db/definitions/ticketConfig.ts`,
  `src/modules/ticket/graphql/schemas/ticketConfig.ts`,
  `src/modules/ticket/graphql/resolvers/mutations/ticketConfig.ts`,
  `src/modules/ticket/utils/ticketConfig.ts` (new).
- **Contracts changed:** `TicketConfig.propertyFields: [TicketPropertyField]`
  and `TicketConfigInput.propertyFields: [TicketPropertyFieldInput]` added; both
  are optional, so existing callers and stored configs are unaffected.

### `2026-08-10` — Call report queries rewritten as filter-fetch-compute

- **Summary:** All eight report queries now follow the same shape as
  `callCalculate*` — build a CDR filter, fetch the legs, compute in JS —
  replacing roughly 1,300 lines of `$addFields`/`$switch`/`$group` pipelines
  with `callReportService.ts`. `callKpiScorecard` delegates to `statistics.ts`,
  which fills in `firstCallResolution` and `occupancy` (previously hard-coded
  `null`) and drops an unexplained `+38` seconds from `averageAnsweredTime`.
  Fixes carried by the rewrite: wait time is `duration - billsec` rather than
  the non-existent `$waittime`, so Avg Wait is no longer always `0`; the agent
  extension comes from `dstchannelExt` when `dst` holds the DID; the carrier
  breakdown folds legs into calls, where it used to count legs; queue and
  callback stats bound only `start`, so a call finishing after the range is no
  longer dropped; and the queue filter is anchored on `QUEUE[<id>]` so `650`
  cannot match `QUEUE[6500]`.
- **Affected areas:**
  `src/modules/integrations/call/services/callReportService.ts`,
  `src/modules/integrations/call/graphql/resolvers/queries.ts`.
- **Contracts changed:** `None` — same query names, arguments, and return
  types. Values move: wait-time figures, `firstCallResolution`, `occupancy`,
  and the carrier breakdown all report differently because they were wrong
  before.

### `2026-08-10` — Call reports stay on `CallCdrs`; queue list and carriers fixed

### `2026-08-06` — Conversation counts on channels and used integration kinds

- **Summary:** Added `Channel.conversationCount` /
  `Channel.unreadConversationCount` field resolvers, and gave
  `integrationsGetUsedTypesByChannel` its own return type carrying the same two
  counts per integration kind, folded from one aggregation over the matched
  channels' integrations.
- **Affected areas:**
  `src/modules/channel/graphql/{schemas/channel.ts,resolvers/customResolvers/channel.ts}`,
  `src/modules/inbox/graphql/{schemas/integration.ts,resolvers/queries/integrations.ts}`.
- **Contracts changed:** `Channel` gained two nullable `Int` fields;
  `integrationsGetUsedTypesByChannel` now returns
  `[integrationsGetUsedTypesByChannel]` instead of `[integrationsGetUsedTypes]`
  — same `_id` / `name` fields, plus the two counts.

### `2026-08-06` — Personal channels accept every integration kind

- **Summary:** Removed `PERSONAL_INTEGRATION_KINDS` and the kind check in
  `integrationsCreateExternalIntegration`. A personal channel now takes the same
  integrations a team channel does, and a create call with no `channelId` falls
  back to the caller's personal channel for any kind instead of erroring for
  everything but IMAP.
- **Affected areas:**
  `src/modules/inbox/graphql/resolvers/mutations/integrations.ts`,
  `src/modules/inbox/db/definitions/constants.ts`.
- **Contracts changed:** `integrationsCreateExternalIntegration` no longer
  rejects an omitted `channelId` for non-mailbox kinds; the ownership check on
  another user's personal channel is unchanged.

### `2026-08-06` — Fix the Facebook login callback behind the authorize redirector

- **Summary:** The OAuth `state` carries the integration kind as a
  `/kind/<kind>` path segment instead of a `?kind=` query string, and
  `/facebook/kind/:kind/fblogin` accepts the redirector callback, so returning
  from Facebook no longer lands on `/facebook` with `Cannot GET /facebook`.
- **Affected areas:**
  `src/modules/integrations/facebook/middlewares/loginMiddleware.ts`,
  `src/modules/integrations/facebook/routes.ts`
- **Contracts changed:** new HTTP route `GET /facebook/kind/:kind/fblogin`

### `2026-08-05` — `getMyChannels` sorting

- **Summary:** `getMyChannels` accepts `sortField` / `sortDirection` and sorts in
  Mongo, so the UI no longer has to order the list client-side. `sortField` is
  checked against an allowlist (`name`, `createdAt`) before it reaches the query,
  and the query is collated so `name` does not fall back to byte order.
- **Affected areas:**
  `src/modules/channel/graphql/{schemas,resolvers/queries}/channel.ts`.
- **Contracts changed:** `getMyChannels` gained optional `sortField: String` and
  `sortDirection: Int` arguments; default order is `createdAt` descending, where
  it was previously unspecified.

### `2026-08-05` — `getChannels` restricted to team scope

- **Summary:** `getChannels` now returns only team-scoped channels on all four
  branches; personal inboxes (including the caller's own) are excluded and
  remain reachable through `getPersonalChannel`. Added `teamChannelsOnly` in
  `src/modules/channel/utils.ts`, which also matches legacy documents written
  before `scope` existed, since the schema default is `team`.
- **Affected areas:** `src/modules/channel/utils.ts`,
  `src/modules/channel/graphql/resolvers/queries/channel.ts`.
- **Contracts changed:** `getChannels` no longer returns personal channels; its
  arguments and return type are unchanged.
