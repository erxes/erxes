# `frontline_api` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/frontline_api`
- **Last synchronized:** `2026-08-28`

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
  comments), Instagram, IMAP, Discord, Call (SIP/CDR), and Call Pro (webhook
  PBX).
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
- Read-only inbox, integration, and form-submission tRPC procedures are
  exposed to AI agents through `/agent-tools/manifest` and `/agent-tools/call`
  via `.meta(agentMeta(...))` annotations; every other procedure remains
  invisible to agents.
- Contributes permissions, notifications, segments, references, and
  import/export handlers to the platform through `meta/`.

## Architecture

| Area                 | Path                                                                        | Responsibility                                                                                          |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Bootstrap            | `src/main.ts`                                                               | `startPlugin({ name: 'frontline', port: 3304 })`, wires tRPC, routes, meta, and every surface           |
| Models               | `src/connectionResolvers.ts`                                                | Per-subdomain model container for all modules                                                           |
| GraphQL              | `src/apollo/`                                                               | Aggregated `typeDefs` and `resolvers` across modules                                                    |
| tRPC                 | `src/init-trpc.ts`                                                          | `appRouter` for service-to-service calls                                                                |
| Agent tool metadata  | `src/trpc/agentMeta.ts`                                                     | Local `agentMeta` helper for agent-callable tRPC annotations                                            |
| HTTP                 | `src/routes.ts`                                                             | Mounts `/facebook`, `/instagram`, and (when enabled) `/callpro` webhook routers                         |
| Platform extensions  | `src/meta/`                                                                 | automations, permissions, notifications, segments, references, import/export                            |
| Channels             | `src/modules/channel/`                                                      | Channel + ChannelMember models, schema, resolvers, role checks                                          |
| Inbox                | `src/modules/inbox/`                                                        | Conversations, messages, integrations, widget/clientportal schemas, `receiveInboxMessage`               |
| Conversation queries | `src/conversationQueryBuilder.ts`, `src/modules/inbox/conversationUtils.ts` | Mongo and Elasticsearch conversation filters (membership-scoped)                                        |
| Integrations         | `src/modules/integrations/<kind>/`                                          | facebook, instagram, imap, discord, call, callpro, trpc                                                 |
| Call Pro             | `src/modules/integrations/callpro/`                                         | `CALLPRO_ENABLED` gate, `/callpro/receive` webhook, mirrored line/caller/call, recording URL            |
| Call reporting       | `src/modules/reports/callReportService.ts`                                  | CDR filter, leg-to-call folding, and the per-queue/agent/number report computation                      |
| FB webhook           | `src/modules/integrations/facebook/controller/controller.ts`                | `/facebook/receive` ingestion: acks Meta first, then drains every entry/change and logs each event       |
| FB receipts          | `src/modules/integrations/facebook/controller/receiveDeliveryStatus.ts`     | Applies `message_deliveries` / `message_reads` watermarks to page-sent messages                          |
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
- GraphQL: every conversation filter query (`conversations`, `conversationCounts`,
  `conversationsTotalCount`, `conversationsGetLast`) accepts
  `automationStatus: String` — a comma-separated list of `responded`, `standby`,
  `handoff`. `responded` matches any conversation that carries an
  `automatedReplyControl.status` at all, so it is a superset of the other two;
  `standby` is `handoff_requested` and `handoff` is `human_active`.
  `conversationCounts` always returns a `responded` / `standby` / `handoff`
  count alongside `unassigned` / `participating` / `starred` / `resolved` /
  `awaitingResponse`.
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
- Agent-callable tRPC tools (admit-only via `.meta({ agent })`), each gated by
  the listed frontline permission action:
  - `inbox.conversations.findOne`, `inbox.conversations.count`,
    `inbox.getConversationsList`, `inbox.conversationMessages.findOne`,
    `inbox.conversationMessages.find` — `showConversations`
  - `inbox.conversations.changeStatus` — `conversationsChangeStatus`
  - `inbox.integrations.findOne`, `inbox.integrations.find`,
    `inbox.integrations.count`, `inbox.getIntegrationKinds` —
    `showIntegrations`
  - `form.submissionsByConversation` — `showFormSubmissions`
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
  `CallVolumePoint.noAnswer` and `HeatCell.noAnswer` count every call in the
  bucket that no human answered, in both directions — unlike
  `CallVolumePoint.abandoned`, which stays inbound-only.
- GraphQL `callHeatmapDaily(startDate, endDate, integrationId?, queueId?,
  direction?)` — the same CDR read as `callHeatmap`, bucketed by **calendar PBX
  day × hour** instead of day-of-week, for the spreadsheet export of the report.
  Only hours that carry calls produce a row; absent buckets mean zero.
- HTTP `POST /callpro/receive` — the Call Pro PBX pushes one call event
  (`numberTo`, `numberFrom`, `disp`, `callID`, `owner`). The route is only
  mounted when `CALLPRO_ENABLED=true`, so a deployment without Call Pro returns
  404. Public URL: `{DOMAIN}/gateway/pl:frontline/callpro/receive`
  (`{DOMAIN}/pl:frontline/...` outside production).
- GraphQL `callProConfig` — `{ enabled, webhookUrl }`. This is the only way the
  UI learns whether Call Pro is licensed; `webhookUrl` is null when it is not.
- GraphQL `callProIntegrationDetail(integrationId)` — the `phoneNumber` and
  `recordUrl` stored for a Call Pro line.
- GraphQL `callProCustomersByPhone(phone)` — every non-deleted core customer
  holding that number on `primaryPhone` or in `phones`.
- GraphQL `callProCustomerSelect(conversationId, customerId)` — attaches the
  customer an agent picked and clears `callProPotentialCustomerIds`. It rejects
  a customer that is not one of the recorded candidates.
- GraphQL `Conversation.callProAudio` — the Call Pro recording URL, resolved
  only for `kind === 'callpro'` conversations and only for the owner or the
  assignee.
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
- GraphQL Facebook reports — `reportFacebookPages`, `reportFacebookSummary`,
  `reportFacebookActivity`, `reportFacebookPosts`, `reportFacebookBots`. All but
  the first take a `FacebookReportFilter` (`date`, `fromDate`, `toDate`,
  `pageIds`, `limit`, `page`) and read only this plugin's own Facebook
  collections — no Graph API call, no Page Insights, and no automation-execution
  data from core. `reportFacebookPages` derives the page list from
  `FacebookIntegrations.facebookPageIds` and names each page from the inbox
  `Integrations.name` its `erxesApiId` points at, falling back to a bot bound to
  the page and then to the raw page id. Integration name comes first because
  only some pages have a messenger bot, while nearly every connected page has an
  admin-typed integration name; a page whose integration was deleted still falls
  through to its id.
- GraphQL: `reportFacebookSyncPostStats(pageIds: [String], limit: Int)` — the
  only Facebook report path that calls Meta. Requires an authenticated user,
  reads `/{pageId}/posts` with `comments.filter(stream).summary(true)`,
  `reactions.summary(true)`, and `shares`, and writes `metaCommentCount`,
  `metaReactionCount`, `metaShareCount`, `metaSyncedAt` onto matching post
  documents. It returns `{ pages, fetched, updated, missingInErxes, syncedAt,
  errors }` — `missingInErxes` is the number of Meta posts this deployment has
  no document for, which is the point of the comparison, not an error.
- `TicketReportFilter.pageIds: [String]` and `searchValue: String` — carried
  only so a saved Facebook chart round-trips its page selection and post search
  through `reportChartAdd`; ticket aggregations ignore both.
- `FacebookReportFilter.searchValue` matches **post content or post id** and is
  applied only by `reportFacebookPosts`, never by the summary, activity, or bot
  queries. The term is escaped before it becomes a `RegExp`, so a user typing
  `a.b(c` searches for that literal string instead of crashing the resolver.
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
  `CallPro*`, `Discord*`, `Imap*`, plus inbox (`Conversations`,
  `ConversationMessages`), channel, ticket, form, and knowledge base
  collections.
- Call Pro owns four collections: `integrations_callpro` (unique
  `phoneNumber`, `inboxId`), `customers_callpro` (unique `phoneNumber`),
  `conversations_callpro` (unique `callId`), and `logs_callpro` (the raw
  webhook payload, kept for support). Removing the integration clears the
  first three; the log is deliberately retained.
- `conversations.callProPotentialCustomerIds` / `callProPhone` — set only when
  one caller number matched several core customers. Both stay unset for the
  ordinary single-customer call, and the id list is emptied once an agent
  picks.
- `calls_sessions` — one document per PBX leg, keyed by a unique `uniqueid`,
  carrying the `conversationId` the leg belongs to. Sibling legs of the same
  call each get their own document but share one `conversationId`; the sibling
  lookup is bounded by `SIBLING_SESSION_WINDOW_MS` (60s of `updatedAt`
  recency) and served by the `{ customerPhone: 1, startedAt: -1 }` index.
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
- Facebook reports own no collection of their own. They aggregate
  `conversations_facebooks` (`timestamp`, `botId`/`isBot`),
  `conversation_messages_facebooks` (`createdAt`, `fromBot`, `userId`,
  `botId`), `comment_conversations_facebook` and
  `comment_conversations_reply_facebook` (`createdAt`, `postId`,
  `recipientId`), and `posts_conversations_facebooks` (`timestamp`, `postId`,
  `permalink_url`).
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
- `conversation_messages_facebooks` carries `deliveredAt` and `readAt`, set
  only from Meta's `message_deliveries` / `message_reads` receipts. They are
  never inferred from each other: a read message whose delivery receipt Meta
  skipped keeps `deliveredAt` unset, so read rate must be computed against
  messages sent, not against `deliveredAt`.
- `facebook_logs` holds two kinds of audit row, both expiring after 180 days
  through the schema's `createdAt` TTL index: `facebook-post-publish` from
  `postGuard.logPostAttempt`, and `facebook-webhook-event` written by
  `logWebhookEvent` for every ingested messaging/standby/comment/post change.
  The webhook rows carry `kind`, `pageId`, `identifier` (comment/post id) and,
  on failure, a truncated `error`. They are the only record of a dropped
  event, because Meta stops retrying once the endpoint has acked.

## Local Invariants

- `facebookWebhook` acknowledges Meta with `200 OK` **before** it does any
  work, and never throws afterwards — `routes.ts` would then write a second
  response onto a finished request. Meta requires the ack within 5 seconds and
  unsubscribes the page after an hour of failures, so no ingestion work may
  precede it.
- A `message_deliveries` / `message_reads` receipt must never reach
  `receiveMessage`. It carries no message, so it would create an empty
  conversation for the sender. Both the `messaging` and the `standby` paths
  test `getReceiptKind` first and route the event to `receiveDeliveryStatus`
  instead. The standby path matters: when another app is the primary receiver,
  every event — receipts included — arrives there and nowhere else, so
  skipping it silently loses all receipts for that page.
- A receipt only ever marks page-sent messages (`customerId: null`) and only
  those still missing the field, so a replayed webhook cannot move a stamp or
  backdate an inbound message.
- `SUBSCRIBED_FIELDS` is applied at subscribe time. Adding a field only
  affects pages subscribed afterwards; existing pages need `repairIntegrations`
  (the Repair action) to re-post `subscribed_apps`.
- The webhook drains **every** `entry` and every `entry.changes` item. Meta
  batches up to 1000 updates into one delivery, so returning after the first
  event silently discards the rest. Per-event failures are caught and logged,
  never propagated out of the loop.
- Call Pro stays invisible unless `CALLPRO_ENABLED=true`. That single env var
  gates the webhook route, the create/update handlers, `callProAudio`, and —
  through `callProConfig` — every UI surface. It is independent of the
  Grandstream `calls` integration; neither may be used to switch the other.
- A Call Pro call event never attributes a conversation to a guessed customer.
  When `callProCustomersByPhone` returns more than one match the conversation
  is created with no `customerId` and the candidate list instead, and only an
  agent's `callProCustomerSelect` attaches one.
- One physical call is one inbox conversation, even when the PBX files its legs
  under different `uniqueid`s (Follow Me / forward to an external number files
  the answered leg as a separate `Outbound` leg tagged `FOLLOWME[<ext>]`).
  Both ingestion paths must join an existing conversation before creating one.
  The CTI path first looks for the parent leg by `linkedid` — a forwarded child
  leg carries the originating call's id there, while a root leg carries its own
  `uniqueid` — and otherwise falls back to a recent `CallSessions` sibling with
  the same `customerPhone` (`CallSessions.findSibling`). The CDR path walks
  session → same-`uniqueid` CDR → time-overlapping CDR → sibling session; the
  CDR webhook payload carries no `linkedid` at all, so the overlap match is
  what ties its forwarded legs together. A phone-matched candidate is only
  accepted for a leg that belongs to an inbound call (`belongsToInboundCall`)
  or for a still-live session, so an agent's own callback to the same number
  stays its own conversation; a leg carrying a `linkedid` is exempt from that
  guard, because the id already proves it belongs to another call.
- The call reports count a forwarded call once, under the inbound call it came
  from. `withForwardedCallKeys` re-keys a `FOLLOWME` leg to its parent call's
  `uniqueid` when a non-forwarded leg with the same `src` overlaps it in time
  (`FORWARDED_PARENT_WINDOW_MS`), and only falls back to the synthetic
  `forwarded:<extension>:<index>` key when no parent is in the queried leg set.
  Reports other than the call history and agent stats never load forwarded legs
  at all — `buildCdrFilter` excludes them unless `includeForwarded` is set.
- The customer of a forwarded leg is the original caller, never the number the
  PBX dialled. In an `outgoing_call` CTI payload `caller` is the follow-me
  destination (the agent's mobile) and `callerName` carries the caller's own
  number, so the session takes its `customerPhone` from the parent leg, then
  from `callerIdName` when that looks like a phone number, and only then from
  the event's own party fields. That resolved number — never the raw event
  party — is what the phone-based sibling lookup searches on. On the CDR side
  `determinePrimaryPhone` already reads `src` for a `FOLLOWME` leg.
- Call timestamps coming off the PBX are local time without a zone. Every path
  parses them with `parseCdrDate` (which applies the `+08:00` PBX offset) —
  never `new Date(value)`, which files the stamp eight hours ahead.
- An inbound call conversation is assigned to the agent who actually answered
  it. The answering operator is resolved from the leg's answering extension
  (`dstanswer` / `dstchannel_ext`, via `resolveCdrOperator`) — never from
  `extractOperatorId` alone, which yields the queue number on Queue legs — and
  is handed to `create-or-update-conversation` as `userId`. The legacy `owner`
  lookup through `details.operatorPhone` is a fallback only; assignment must
  never depend on that optional profile field being set.
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
- The `automationStatus` filter is Mongo-only. It must not be added to
  `CommonBuilder` in `src/modules/inbox/conversationUtils.ts`, which builds the
  Elasticsearch queries behind `conversationCounts(only: ...)` — the ES index is
  filled by an external syncer and `automatedReplyControl.status` is not
  guaranteed to be mapped there.
- Conversations reference an integration, not a channel. Any per-channel
  conversation count must resolve the channel's integration ids first; never
  read `channels.conversationCount` / `channels.openConversationCount`, which
  are stale legacy fields.
- `conversationBotTypingStatus:<conversationId>` is fire-and-forget: a subscriber
  that is not connected when an event is published never receives it. A widget
  starting a new conversation learns its `conversationId` only from the
  `widgetsInsertMessage` response, so the `typing: true` that mutation publishes
  inline always reaches nobody. `generateAiContext` therefore re-publishes
  `typing: true` when the agent starts, and `receiveActions` clears it in a
  `finally`; neither may be dropped without replacing the other.
- Messenger availability is always derived, never read from storage.
  `messengerData.isOnline` on the integration document is only the operator's
  manual switch; `Integrations.isOnline()` is the one place that resolves it
  against `availabilityMethod`, `onlineHours`, and `timezone`. Every surface that
  reports availability — `widgetsMessengerConnect` / `cpConnect` via
  `getMessengerData`, `widgetsConversationDetail`, `widgetsMessengerSupporters` —
  must return that computed value, so the stored flag never leaks to a widget as
  `isOnline`.
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
- Queue cards must reconcile with the KPI total. `callGetQueueStats` groups the
  scoped calls by whatever queue their own legs carry and buckets the ones that
  never entered a queue under `NO_QUEUE` (`__no_queue__`); it must never drop a
  call because its queue is missing from `CallIntegrations.queues`. Queue 6500
  serves two DIDs on the reference deployment, so that whitelist silently hid 18
  of integration 11365555's 51 August calls from the Queues tab while every
  other tab still counted them. `CallIntegrations.queues` stays the filter list
  and the permission guard, not a display filter.
- Outbound calls are dropped whenever a specific queue is selected —
  `wantsOutboundCalls` in `callQueries.ts` decides this once for
  `callKpiScorecard`, `callVolumeSeries`, `callGetAgentStats`, and
  `callHistoryList`. An outbound leg never carries `QUEUE[..]`, so the outbound
  branch cannot be narrowed by the queue regex the inbound branch uses; before
  this rule the whole integration's outbound calls were added to a queue-scoped
  count and the KPI read 21 next to a 10-call queue card.
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
- `CallHistoryEntry.waitTime` is how long the caller was held, whichever way
  the call went: `callSpeedOfAnswer` for an answered call, `callRingSeconds`
  for one that ended unanswered. They read different fields because an
  unanswered leg has no `answer` stamp for `answer - start` to use — the ring
  is `duration - billsec` there. A queue rings several agents at once, so
  `callRingSeconds` takes the longest of the waiting legs, which is what the
  caller actually sat through. When no `Queue`/`Dial` leg carries a ring it
  falls back to the whole call, `max(end) - min(start)`. Subtracting `billsec`
  is useless there: an IVR files its menu as `billsec`, so `duration - billsec`
  reads zero on a call where the caller sat through the menu for 26 seconds and
  hung up. Nothing on a call nobody answered was a conversation, so the span is
  all wait. `null` only when no leg carries a usable timestamp.
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
- An IVR picking up the line is routing, not an outcome. `IVR` is therefore the
  **last** branch in `deriveCallStatusFromLegs`, after `BUSY` / `FAILED` /
  `NO ANSWER`, so it only labels a call that stayed in the menu and never
  reached an agent. Checking it earlier — as the original order did — swallowed
  every call that entered an IVR, since the menu answers the line on every one
  of them: on an IVR-fronted deployment the Call history emptied out and the
  No answer / Busy / Failed filters returned nothing. `VOICEMAIL` and
  `FOLLOWME` stay above the dispositions because both describe what actually
  became of the call.
- `callHistoryList` shows every call in range, IVR ones included. It must not
  filter a whole outcome class out of the list — the section promises "one row
  per call", and dropping a class both contradicts Total Calls and makes a
  customer unfindable by phone search.
- `calculateOccupancyRate` computes `workingTime / handlingTime`, which is the
  inverse of occupancy and exceeds 100% at low call volume. `callKpiScorecard`
  returns it as-is; neither it nor `firstCallResolution` is rendered by the UI
  today.
- `TicketConfig.propertyFields` is stored in display order: the array position
  is the order, so `order` is rewritten to `index + 1` and `groupOrder` to the
  rank of the group's first appearance on every save. Both are derived from the
  submitted array and never read from the submitted values. Never re-sort the
  incoming list by either — the client sends the list as the user arranged it,
  with each group's properties in one contiguous block.
  Every entry must resolve to an existing `frontline:ticket` field
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
- Status permissions are three separate rules and must stay separate.
  `Status.memberIds` (with `visibilityType: 'private'`) decides who may **see**
  the status, `canMoveMemberIds` who may move tickets **across** it, and
  `canEditMemberIds` who may edit the tickets sitting in it.
  `validateEditPermission` takes `editsFields` so a payload carrying nothing but
  `statusId` is treated as a move and never requires edit rights. An empty list
  means "everyone".
- A status change is checked at **both ends**: the status the ticket leaves and
  the status it lands in must each accept the user through `canMoveMemberIds`.
  This mirrors `sales_api`'s `checkMovePermission(stage)` +
  `checkMovePermission(destinationStage)` in
  `modules/sales/graphql/resolvers/mutations/utils.ts`, which is the reference
  implementation of the same board rule. Checking only the destination lets a
  user drag tickets out of a status they were never given move rights on.
- Status management (`addTicketStatus` / `updateTicketStatus` /
  `deleteTicketStatus`) is gated by the frontline permission action
  `ticketStatusesManage` through `context.checkPermission`, never by pipeline
  ownership — `Pipeline.userId` records who created a board, and boards migrated
  without one left the rule unenforceable. Any new status-management resolver
  must call the same action, and the action must stay listed in the
  `frontline:admin` default group in `src/meta/permissions.ts`.
- Status visibility is enforced on tickets, not only on status lists.
  `generateFilter` excludes `getHiddenStatusIds` from every ticket query and
  `getTicket` refuses a ticket whose status hides it. `canViewStatus` must keep
  returning `true` for a ticket with no status or with a deleted status — a
  ticket may never vanish because its status row is gone.
- `generateFilter` also serves `cpGetTickets` / `cpGetTicketTotalCount`, which
  run under `forClientPortal` and carry a `cpUser` — **`user` is undefined
  there**. Every team-level rule in it must be guarded by `userId`; an
  unconditional `user._id` crashes the portal ticket list.
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
- The Meta sync is **manual and bounded**: one button press, one page of
  results per page (`limit` capped at 100), no pagination loop and no cron. It
  updates existing post documents only — a Meta post erxes never received is
  counted into `missingInErxes` and never created, because
  `posts_conversations_facebooks` means "posts this deployment ingested" and
  the summary KPI counts it.
- `syncFacebookPostStats` calls Graph through a plain `fetch` on an
  **unversioned** `https://graph.facebook.com/...` URL, so Meta resolves the
  app's own oldest-available version. This deliberately bypasses the shared
  `graphRequest`, which pins `v7.0` globally via `graph.setVersion` — changing
  that pin would affect every Facebook code path, not just reports.
- Meta's comment total is requested as `comments.filter(stream)` so it counts
  replies too, matching what the report shows as `comments + replies`. Dropping
  the filter would silently compare top-level-only against a total that
  includes replies.
- In an **aggregation expression** a missing field is not `null`:
  `{ $in: ['$userId', [null, '']] }` is `false` when the document has no
  `userId` at all, which is the normal shape of an inbound customer message.
  `reportFacebookSummary` classifies outbound messages through
  `{ $ifNull: ['$userId', null] }` for exactly this reason — without it every
  customer message counted as staff-sent and `incomingMessages` collapsed to
  zero. Query-language `$match` has the opposite semantics (`{ botId: null }`
  does match a missing field), so the `$nin` filters elsewhere in this module
  are correct as written; do not "normalize" the two styles into one.
- Facebook report date fields are not interchangeable: messenger conversations
  and posts carry `timestamp`, messages and comments carry `createdAt`. Page
  scoping is `recipientId` on conversations, comments, and posts; messages hold
  no page, so `reportFacebook*` reach the page through a `$lookup` on
  `conversationId` and only when `pageIds` is set.
- A comment **reply document carries no `postId`**, even though
  `commentConversationReplySchema` declares the field — nothing on the write
  path fills it. Replies reach their post only through
  `parentId` → the parent comment's `comment_id` → that comment's `postId`, which
  is what `reportFacebookPosts` joins on (`localField: '__comments.comment_id'`,
  `foreignField: 'parentId'`). A lookup from the post straight to the reply
  collection by `postId` silently returns nothing, so the Replies column reads
  zero and `lastActivityAt` ignores replies.
- A reply written from erxes by an agent has `userId` set, so the distinct
  `commenters` count unions the comment authors with only the **agent-free**
  reply authors — an agent answering a post must never inflate "how many people
  engaged". The `replies` total does include agent replies, because Meta counts
  the page's own replies too and that column is compared against Meta's number.
- `posts_conversations_facebooks` can hold **several documents for one
  `postId`**: `getOrCreatePost` and `getOrCreatePostConversation` both do a
  `findOne` then `create`, and the `postId` index is not unique, so concurrent
  webhook deliveries for the same post each insert a row. `reportFacebookPosts`
  therefore `$group`s by `postId` before paging — without it the same post
  appears once per duplicate, each row showing identical counts because they all
  join on the same `postId`. Meta counts use `$max` in that group, because the
  sync writes with `updateOne` and only reaches one of the duplicates.
- `reportFacebookPosts` scopes the date range to the **post's own**
  `timestamp` and then counts that post's comments for its whole lifetime, so
  the card answers "posts published in this period and the engagement they
  eventually drew". It matches the `posts` figure in `reportFacebookSummary`;
  do not silently switch either one to comment-activity dating.
- Facebook automation coverage is measured from this plugin's own bot fields
  (`FacebookConversations.botId`/`isBot`, `FacebookConversationMessages.fromBot`
  and `botId`), never from core's `AutomationExecutions`. Core exposes
  per-automation `automationStats` and an undated
  `automationExecutionCounts(automationIds)`; neither is read from this service,
  and the raw `automations.executions.find` tRPC procedure destructures its
  input as `const { ...query } = input` and then queries `find({ query })`, so
  it matches nothing. Do not build on it.
- A saved report chart stores only configuration. `pickReportChartFilters` is
  the one gate: it drops empty values and never persists `limit`, `page`, or
  `groupPropertyValue`, which describe a viewing session (paging, an open
  drill-down) rather than the chart. Widening the stored filter set means adding
  the field to the `filters` subschema, the `ReportChartFilters` output type,
  and that key list together, or it will be silently dropped on save.
- Agent tool annotations are admit-only: never annotate webhook ingestion or
  notification plumbing (`inbox.integrations.receive`,
  `inbox.integrationsNotification`, `inbox.sendNotifications`,
  `inbox.conversationClientMessageInserted`), raw-mongo helpers
  (`inbox.conversationMessages.updateOne`, `inbox.updateConversationMessage`),
  bulk or destructive operations (`inbox.integrations.remove`,
  `inbox.removeConversation`, `inbox.removeCustomersConversations`,
  `inbox.changeCustomer`, `conversation.tag`), procedures that trust a
  caller-supplied `userId` (`inbox.createConversationAndMessage`,
  `inbox.createOnlyMessage`, `inbox.integrations.copyLeadIntegration`,
  `ticket.create`), widget-facing endpoints
  (`inbox.widgetsGetUnreadMessagesCount`), internal membership or relation
  plumbing (`inbox.updateUserChannels`, `inbox.getModuleRelation`,
  `relation.onRelationAdded`, `fields.getFieldList`), or the raw
  `inbox.channels.find`, which bypasses `visibleChannelsFilter` and would
  expose other users' personal channels. New procedures are agent-invisible
  unless explicitly annotated.
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
- Smoke: `GET /agent-tools/manifest` on the frontline service lists only the
  annotated procedures above; `ticket.create`, `inbox.removeConversation`,
  `inbox.conversationMessages.updateOne`, and `inbox.channels.find` never
  appear.
- Smoke: with `CALLPRO_ENABLED` unset, `POST /callpro/receive` must 404. With it
  set to `true`, create a Call Pro line and post
  `{ numberTo, numberFrom, disp, callID, owner }` — a conversation appears in
  the channel; re-posting the same `callID` with a new `disp` updates it rather
  than creating a second one; seeding two core customers on `numberFrom` makes
  the conversation open with the candidate picker and no `customerId`.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-28` — Delivery and read rates on the Facebook report

- **Summary:** `reportFacebookSummary` now also counts the page-sent messages
  Meta reported as delivered and as read, and returns both as counts and as a
  percentage of messages sent. The read rate is measured against messages
  sent rather than against delivered, because Meta sometimes skips the
  delivery receipt and `deliveredAt` is never inferred from `readAt`.
- **Affected areas:**
  `src/modules/reports/graphql/resolvers/facebookQueries.ts`
  (`reportFacebookSummary`), `src/modules/reports/graphql/schema/facebook.ts`.
- **Contracts changed:** `ReportFacebookSummary` gains `sentMessages`,
  `deliveredMessages`, `readMessages`, `deliveryRate`, and `readRate`. Additive
  only; existing fields are unchanged.

### `2026-08-28` — Delivery and read receipts are recorded

- **Summary:** The page subscribed to neither `message_deliveries` nor
  `message_reads`, so a sent automation message could only ever be reported as
  "the Graph API accepted it" — whether it reached the customer was
  unmeasurable. Both fields are now subscribed and their receipts applied to
  the page-sent messages they cover, by `mids` when Meta sends them and by
  watermark otherwise, giving `deliveredAt` / `readAt` on
  `conversation_messages_facebooks` and a `delivery` / `read` row per receipt
  in `facebook_logs`.
- **Affected areas:** `src/modules/integrations/facebook/constants.ts`
  (`SUBSCRIBED_FIELDS`),
  `src/modules/integrations/facebook/controller/receiveDeliveryStatus.ts`
  (new), `src/modules/integrations/facebook/controller/controller.ts`
  (receipt short-circuit in `processMessagingEvent` and `processStandbyEvents`),
  `src/modules/integrations/facebook/controller/receiveMessage.ts`
  (`sanitizeString` exported),
  `src/modules/integrations/facebook/db/definitions/conversationMessages.ts`
  (`deliveredAt`, `readAt`, `mid` index) and its `@types`.
- **Contracts changed:** None. `deliveredAt` / `readAt` are stored but not yet
  exposed on the `FacebookConversationMessage` GraphQL type. Existing pages
  keep their old subscription until repaired.

### `2026-08-28` — Facebook webhook stops discarding batched events

- **Summary:** `/facebook/receive` returned after the first `entry.changes`
  item, so every further comment or post in a batched Meta delivery was
  discarded and its automation never ran; two other paths (a non-page object,
  an entry with neither `messaging` nor `changes`) ended the handler without
  sending any response at all, which counts as a delivery failure and gets the
  page unsubscribed after an hour. The handler now acks `200 OK` first, then
  drains every entry and change with per-event error isolation, and records
  each ingested event in `facebook_logs` so a dropped one is still countable
  after the ack removes Meta's retries.
- **Affected areas:**
  `src/modules/integrations/facebook/controller/controller.ts`
  (`facebookWebhook`, new `processEntry` / `processChangeEvent` /
  `logWebhookEvent`, `processMessagingEvent` no longer takes `res`/`next` and
  now rethrows), `src/modules/integrations/facebook/routes.ts`.
- **Contracts changed:** None externally. `processMessagingEvent` is exported
  but has only ever been called from this file; the Instagram controller has
  its own local function of the same name.

### `2026-08-21` — A forwarded call stays one conversation

- **Summary:** An inbound call that Follow Me forwarded to an agent's mobile
  produced two inbox conversations — the queue leg as `NO ANSWER · Inbound` and
  the `FOLLOWME` leg, filed by the PBX under a second `uniqueid`, as
  `ANSWERED · Outbound`. The CTI path created the second one because it looked
  a session up by `uniqueid` alone, and the CDR path's existing FOLLOWME merge
  could never run once that session carried a `conversationId`. Both paths now
  adopt the call a leg belongs to before creating one — the CTI path by the
  child leg's `linkedid`, then by a recent sibling session for the same
  customer, and it takes a forwarded leg's customer from the parent leg or from
  `callerName` instead of filing the agent's mobile as the caller. The CDR path
  also merges any time-overlapping leg (not only `FOLLOWME`-tagged ones) and
  writes a resolved `conversationId` back onto a session that had none, and a
  customer-scoped Redis lock keeps sibling legs from racing each other into two
  conversations. Conversation content is now derived from every leg of the
  conversation and reports a `FOLLOWME` leg as `Inbound`, so a merged call
  reads `ANSWERED · Inbound` regardless of which leg's CDR lands last. Fixed
  the CTI `startedAt`/`endedAt` parsing that stored PBX local time eight hours
  ahead.
  The call history and agent stats fold a `FOLLOWME` leg into its parent call
  instead of listing it as a second, outgoing call placed to the agent's own
  mobile.
- **Affected areas:**
  `src/modules/reports/callReportService.ts` (`withForwardedCallKeys`),
  `src/modules/integrations/call/services/callEventService.ts`,
  `src/modules/integrations/call/services/cdrServices.ts`,
  `src/modules/integrations/call/services/cdrUtils.ts`
  (`getConversationContent`),
  `src/modules/integrations/call/db/models/CallSessions.ts`
  (`findSibling`), `src/modules/integrations/call/redlock.ts`
  (`acquireCustomerLock`).
- **Contracts changed:** None. `POST /call/event`, `/call/receiveCall`, and
  `/call/cdrReceive` keep their payloads; only how legs are grouped into a
  conversation changed.

### `2026-08-20` — The agent who answered a call is assigned to it

- **Summary:** A call conversation stayed unassigned because the CDR path
  looked the operator up with `extractOperatorId`, which returns the queue/DID
  number on the inbound Queue legs an agent actually answers, and then carried
  the match to the inbox as `owner` — the user's optional
  `details.operatorPhone`. Both the CDR and the CTI path now resolve the
  answering operator from the leg's answering extension
  (`resolveCdrOperator`) and pass that operator's `userId` straight to
  `create-or-update-conversation`, so assignment no longer depends on a
  profile field being filled in.
- **Affected areas:**
  `src/modules/integrations/call/services/cdrUtils.ts`,
  `src/modules/integrations/call/services/cdrServices.ts`,
  `src/modules/integrations/call/services/callEventService.ts`,
  `src/modules/inbox/receiveMessage.ts`.
- **Contracts changed:** None — `create-or-update-conversation` already
  accepted `userId`; the call paths now send it, and the create branch no
  longer leaks `owner`/`userId` onto the new conversation document.

### `2026-08-19` — Call Pro webhook integration

- **Summary:** Ported the Call Pro PBX integration from the legacy
  `plugin-integrations-api`: a `CALLPRO_ENABLED`-gated `/callpro/receive`
  webhook turns each call event into an inbox conversation with the caller
  attached and the recording URL resolved, and defers attribution to the agent
  when one number matches several customers.
- **Affected areas:** `src/modules/integrations/callpro/` (new),
  `src/connectionResolvers.ts`, `src/routes.ts`,
  `src/apollo/{schema/schema.ts,resolvers/queries.ts,resolvers/mutations.ts}`,
  `src/modules/inbox/{@types,db/definitions}/conversations.ts`,
  `src/modules/inbox/graphql/schemas/conversation.ts`,
  `src/modules/inbox/graphql/resolvers/customResolvers/conversation.ts`,
  `src/modules/inbox/graphql/resolvers/mutations/integrations.ts`
- **Contracts changed:** Added `POST /callpro/receive`; queries `callProConfig`,
  `callProIntegrationDetail`, `callProCustomersByPhone`; mutation
  `callProCustomerSelect`; `Conversation.callProPotentialCustomerIds` and
  `Conversation.callProPhone`; a resolver for the previously dangling
  `Conversation.callProAudio`; `callpro` cases in `sendCreateIntegration`,
  `sendUpdateIntegration`, and `sendRemoveIntegration`.

### `2026-08-19` — Call history reports the ring on unanswered calls

- **Summary:** `CallHistoryEntry.waitTime` was `null` for every call nobody
  answered, so the Waited column showed a dash on exactly the rows a supervisor
  wants to read — a No answer row said nothing about whether it rang for three
  seconds or three minutes. Unanswered calls now report `callRingSeconds`,
  taken from `duration - billsec` on the legs that held the caller, since an
  unanswered leg has no `answer` stamp for the existing helper to subtract. It
  falls back to the call's own span when the PBX filed no `Queue`/`Dial` ring,
  which is how an IVR-only call arrives — its menu time lands in `billsec`, so
  subtracting it would report zero.
- **Affected areas:**
  `src/modules/integrations/call/services/cdrUtils.ts` (`callRingSeconds`,
  `ICdrLegTiming.duration`), `src/modules/reports/callHistoryService.ts`,
  `src/modules/reports/graphql/schema/call.ts`.
- **Contracts changed:** None. `CallHistoryEntry.waitTime` keeps its type and
  unit; it is now populated for unanswered calls instead of always `null`.

### `2026-08-19` — Bot typing status survives conversation creation

- **Summary:** `generateAiContext` re-publishes
  `conversationBotTypingStatus:<conversationId>` with `typing: true` when the AI
  agent starts, so a widget that only learns its `conversationId` from the
  `widgetsInsertMessage` response still sees the indicator for the first message
  of a conversation and for the whole agent run. Also removed the debug
  `console.log` calls left in `widgetsInsertMessage`.
- **Affected areas:** `src/modules/inbox/meta/automation/workers.ts`,
  `src/modules/inbox/graphql/resolvers/mutations/widget.ts`.
- **Contracts changed:** None — same subscription and payload shape, published
  once more per agent run.

### `2026-08-19` — Messenger connect returns computed online state

- **Summary:** `getMessengerData` now computes availability with
  `Integrations.isOnline(integration)` and returns it as `messengerData.isOnline`
  instead of passing through the stored manual flag, so a widget connecting to an
  `availabilityMethod: "auto"` integration follows `onlineHours` and `timezone`.
  The same computed value drives the existing `hideWhenOffline` `showChat`
  suppression, which no longer recomputes it.
- **Affected areas:**
  `src/modules/inbox/graphql/resolvers/mutations/widget.ts` (`getMessengerData`,
  shared by `widgetsMessengerConnect` and `cpConnect`).
- **Contracts changed:** None — `MessengerConnectResponse.messengerData` is
  `JSON` and still carries `isOnline`, now with the derived value.

### `2026-08-19` — Ticket property fields carry their group's order

- **Summary:** `TicketPropertyField` gained `groupOrder`, the position of the
  property's group among the groups a configuration uses, so a consumer can
  rebuild the grouped layout the builder shows without inferring it from array
  positions. Like `order`, it is derived in `validateTicketPropertyFields` from
  the submitted array — the rank at which each `groupId` first appears — and
  never taken from the submitted values.
- **Affected areas:** `src/modules/ticket/@types/ticketConfig.ts`,
  `src/modules/ticket/db/definitions/ticketConfig.ts`,
  `src/modules/ticket/graphql/schemas/ticketConfig.ts`,
  `src/modules/ticket/utils/ticketConfig.ts`.
- **Contracts changed:** `TicketPropertyField` and `TicketPropertyFieldInput`
  gained an optional `groupOrder: Int`; stored configurations without it keep
  working and are backfilled on their next save.
