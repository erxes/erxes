# `frontline_api` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/frontline_api`
- **Last synchronized:** `2026-09-02`

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
  comments), Instagram, Mail (Cloudflare Email Routing), Discord,
  Call (SIP/CDR), and Call Pro (webhook PBX).
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
- Boots the Call app and the Discord gateway client from `onServerInit`.
- Runs the **mail** channel: an inbox owns a generated catch-all address, a
  Cloudflare Worker posts every delivery to `POST /mail/receive` under an HMAC
  signature, and the controller turns it into a core customer, a conversation,
  and a stored message with its attachments uploaded to storage. Threading
  resolves by reply tag, then by `In-Reply-To`/`References`, then by an open
  conversation for the same customer whose latest message carries the same
  normalized subject. Replies always leave through **Cloudflare Email Sending** —
  the workspace's connected Cloudflare account when it has one, else the
  deployment's own Cloudflare account (`MAIL_SENDING_*`) — from the inbox's own address,
  with a per-conversation tagged `Reply-To`; delivery is recorded per message (`pending` →
  `sent` / `bounced` / `failed`) and a failed message can be resent with
  `mailMessageRetry`. `mailCheckConnection` asks the worker to deliver a
  probe back, so an administrator can tell a broken delivery path from an inbox
  nobody has forwarded mail to yet.
- A workspace can run the mail channel on **its own Cloudflare account**. It pastes
  an API token in Settings → Integrations config, picks one of its domains, and the
  plugin provisions the whole path there: Email Routing, an R2 bucket with its
  retention rule, the inbound and dead-letter queues, the worker script and its
  secret, the catch-all rule, and the domain's Email Sending onboarding. Inbox
  addresses are then generated on that domain, inbound mail is verified against that
  connection's own key, and replies leave from the inbox's own address on that
  domain. A workspace without one both receives and replies on the deployment's
  Cloudflare account, from its generated address on `MAIL_DOMAIN`. There is no
  SES or SendGrid path: mail enters and leaves through Cloudflare only.
- Ticket boards/pipelines, response templates, forms, knowledgebase articles,
  and report aggregations.
- Read-only inbox, integration, and form-submission tRPC procedures are
  exposed to AI agents through `/agent-tools/manifest` and `/agent-tools/call`
  via `.meta(agentMeta(...))` annotations; every other procedure remains
  invisible to agents.
- Contributes permissions, notifications, segments, references, and
  import/export handlers to the platform through `meta/`.

## Architecture

| Area                 | Path                                                                        | Responsibility                                                                                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Bootstrap            | `src/main.ts`                                                               | `startPlugin({ name: 'frontline', port: 3304 })`, wires tRPC, routes, meta, and every surface                                                                                                          |
| Models               | `src/connectionResolvers.ts`                                                | Per-subdomain model container for all modules                                                                                                                                                          |
| GraphQL              | `src/apollo/`                                                               | Aggregated `typeDefs` and `resolvers` across modules                                                                                                                                                   |
| tRPC                 | `src/init-trpc.ts`                                                          | `appRouter` for service-to-service calls                                                                                                                                                               |
| Agent tool metadata  | `src/trpc/agentMeta.ts`                                                     | Local `agentMeta` helper for agent-callable tRPC annotations                                                                                                                                           |
| HTTP                 | `src/routes.ts`                                                             | Mounts the `/facebook`, `/instagram`, `/mail`, and (when enabled) `/callpro` webhook routers                                                                                                           |
| Platform extensions  | `src/meta/`                                                                 | automations, permissions, notifications, segments, references, import/export                                                                                                                           |
| Channels             | `src/modules/channel/`                                                      | Channel + ChannelMember models, schema, resolvers, role checks                                                                                                                                         |
| Inbox                | `src/modules/inbox/`                                                        | Conversations, messages, integrations, widget/clientportal schemas, `receiveInboxMessage`                                                                                                              |
| Conversation queries | `src/conversationQueryBuilder.ts`, `src/modules/inbox/conversationUtils.ts` | Mongo and Elasticsearch conversation filters (membership-scoped)                                                                                                                                       |
| Integrations         | `src/modules/integrations/<kind>/`                                          | facebook, instagram, mail, discord, call, callpro, trpc                                                                                                                                                |
| Mail integration     | `src/modules/integrations/mail/`                                            | Inbound webhook, threading, outbound send/retry                                                                                                                                                        |
| Mail transports      | `src/modules/integrations/mail/utils/transports/`                           | `index.ts` picks the Cloudflare account that signs for this workspace, `deliver.ts` runs the delivery pipeline (sender guard, suppression, delivery log), `cloudflare.ts` is the only `IMailTransport` |
| Mail provisioning    | `src/modules/integrations/mail/utils/cloudflare/`                           | Cloudflare REST client, the fourteen-step provisioner, Email Sending onboarding and quota, the connection cache and its public shape                                                                   |
| Mail worker bundle   | `src/modules/integrations/mail/worker/bundle.generated.ts`                  | The minified worker uploaded to a tenant's account, regenerated by `npm run bundle` in `cloudflare/mail-worker`                                                                                        |
| Call Pro             | `src/modules/integrations/callpro/`                                         | `CALLPRO_ENABLED` gate, `/callpro/receive` webhook, mirrored line/caller/call, recording URL                                                                                                           |
| Call reporting       | `src/modules/reports/callReportService.ts`                                  | CDR filter, leg-to-call folding, and the per-queue/agent/number report computation                                                                                                                     |
| FB automation        | `src/modules/integrations/facebook/meta/automation/`                        | Comment/message triggers and actions, bot message generation                                                                                                                                           |
| FB page posting      | `src/modules/integrations/facebook/postService.ts`, `postGuard.ts`          | Post publishing pipeline (validation, photo staging, cleanup, permalink) and its rate limit + audit log                                                                                                |
| FB app resolution    | `src/modules/integrations/facebook/commonUtils.ts`                          | `resolveFacebookApp`, `facebookAppSelector`, `facebookAccountSelector`                                                                                                                                 |
| Ticket               | `src/modules/ticket/`                                                       | Boards, pipelines, statuses, tickets, activities, notes                                                                                                                                                |
| Forms                | `src/modules/form/`                                                         | Forms, fields, submissions                                                                                                                                                                             |
| Knowledge base       | `src/modules/knowledgebase/`                                                | Topics, categories, articles, AI knowledge source                                                                                                                                                      |
| Reports              | `src/modules/reports/`                                                      | Inbox/ticket report aggregations, `buildTicketMatch`, and the saved `ReportCharts` model                                                                                                               |
| Migrations           | `src/migrations/`                                                           | Plugin-owned data migrations                                                                                                                                                                           |

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
- HTTP: `POST /mail/receive` — the mail worker's inbound webhook. The body is
  capped at `15mb` by the `express.json` parser `startPlugin` installs, and is
  kept as a `Buffer` there for the HMAC check. That cap belongs to
  `erxes-api-shared`, so this plugin cannot raise it and a route-level parser
  cannot either — the global one has already consumed the stream. The worker's own
  deliveries stay well under it: it puts attachments in R2 and sends a signed
  `url`, so the body carries headers and text only. Base64 `content` is accepted
  too — the local fixtures use it — and there the attachment itself spends the
  cap. A payload over it is answered `413` and dead-lettered by the worker
  without a retry, since only 5xx and 401/403/408/425/429 are retried. The
  signature covers `${timestamp}.${rawBody}` and is keyed by `HMAC-SHA256(MAIL_WEBHOOK_SECRET, tenant)`, so both
  `x-erxes-signature` and `x-erxes-timestamp` are required. Answers `401` on a bad
  or missing signature or a timestamp more than five minutes off, and its `error`
  names which of those it was — a clock that has drifted reads as such instead of
  as a bad key, which is the difference between a five-minute fix and a hunt.
  Answers `400` on a
  payload without `messageId`/`to`/`from`, `404`
  for an address no integration owns, `429` when the inbox is over its inbound
  rate limit (with `retry-after`), `{ status: 'duplicate' }` for a message id
  already stored, and `{ status: 'ignored' }` for a self-addressed message. A
  failure returns a generic `500` — the exception text stays in the log. The
  payload carries `envelopeFrom` — the SMTP envelope sender Cloudflare observed,
  which a forwarder rewrites and the `From` header does not. It is
  provider-supplied metadata behind the mismatch and self-address checks, not
  proof of who sent the mail: nothing on either side evaluates SPF or DMARC, and
  a sending server can set the envelope as freely as the header. Each attachment
  arrives either as base64 `content` or as a signed `url` the plugin downloads
  before re-uploading it to erxes storage; the `200` body carries `keepStored: true` when any attachment could not
  be stored, which tells the worker to hold its copy instead of deleting it. A body
  carrying `probe: true` is answered `{ status: 'ok', probe: true }`
  immediately after the signature check — the reachability half of
  `mailCheckConnection`, which is why it is answered before the address lookup.
- GraphQL: `mailConversationDetail(conversationId!, limit): MailConversationMessages`
  — a `{ messages, hasMore }` window over the **newest** `limit` messages of a
  thread (default 20, server cap 500), returned oldest first. Each message
  carries `mailData` with the addresses, body, the quoted-reply split
  (`newContent` / `replies`), attachments, the delivery fields
  (`deliveryStatus`, `deliveryError`, `deliveryRetryable`, `bouncedRecipients`),
  and the inbound sender check (`envelopeFrom`, `senderMismatch`).
- GraphQL: `mailSendMail(...)` and `mailMessageRetry(_id!)` — both require
  `conversationMessageAdd` and return only the delivery outcome of the stored
  message (`_id`, `deliveryStatus`, `deliveryError`, `bouncedRecipients`), so the
  caller reads what actually happened instead of assuming success. `mailSendMail`
  persists the message **before** the transport call, so a send failure never
  loses an agent's reply.
- GraphQL: `mailCheckConnection: MailConnectionCheck` — requires
  `integrationsEdit`. Signs a request with this deployment's tenant key and posts
  it to the mail worker's `POST /verify`, which delivers a probe back to whatever
  endpoint it holds for the tenant. Returns `{ ok, tenant, endpoint, error }`; a
  wrong secret, a missing routing entry, an unreachable host and an unset
  `MAIL_WORKER_URL` all surface as `ok: false` with the reason rather than as a
  thrown error, because the caller is a diagnostic screen.
- GraphQL `mailSendingReadiness` — whether this workspace can reply at all, and
  from which domain: `{ ready, cloudflare { ready, domain, reason }, platform
{ ready, domain } }`. Requires `integrationsEdit`. The wizard blocks its sending
  step on `ready` and shows `cloudflare.reason` when it is false.
- GraphQL `mailCloudflareSendingQuota` — the connected account's sending allowance,
  read live from Cloudflare, `null` when no account is connected or the domain is
  not onboarded for sending. Requires `integrationsEdit`.
- GraphQL `mailCloudflareConnection` and `mailCloudflareZones(token)` — the stored
  connection (never its token or webhook secret) and the domains a token can reach,
  each carrying `eligible` and, when it is false, the `reason` connecting would fail.
- GraphQL `mailCloudflareConnect(token, zoneId)`, `mailCloudflareProvision` and
  `mailCloudflareDisconnect` — connect an account and run the provisioner, re-run it
  after a failure or a worker update, and hand the domain back. All five require
  `integrationsEdit`.
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
  mounted when `CALLPRO_ENABLED=true`, so a deployment without Call Pro returns 404. Public URL: `{DOMAIN}/gateway/pl:frontline/callpro/receive`
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
- Mail: `core` tRPC `customers.findOne` / `customers.createCustomer`,
  `uploadFileToStorage` for inbound attachments, `redis` for the inbound rate
  limit, `receiveInboxMessage` for conversation creation, and
  `sendAutomationTrigger`. Outbound never touches the workspace email provider —
  the mail module does not read `configs.getConfigs` at all.
- Cloudflare's REST API (`api.cloudflare.com/client/v4`) with a token a workspace
  supplied, for zones, Email Routing, R2, Queues, Workers scripts and Email
  Sending. Provisioning reaches it, and so does every reply
  (`POST /accounts/{id}/email/sending/send`); inbound mail never touches it.
- Mail: the mail worker's `POST /verify` at `MAIL_WORKER_URL`, used only by
  `mailCheckConnection`. Inbound mail never depends on it, so an unset
  `MAIL_WORKER_URL` costs the diagnostic and nothing else.
- Mail: `core` tRPC `emailSuppression.blocked` to drop addresses core has closed
  before a reply is handed to Cloudflare, and `emailDeliveries.create` /
  `emailDeliveries.recordHandoff` so every reply appears in Settings → Email
  Delivery under the `custom` provider. Sender verification is **not** consulted —
  Cloudflare signs for the onboarded domain the inbox address already lives on, so
  `emailSenders.alignedFrom` / `emailSenders.isAllowed` play no part in mail.

## Data and State

- Tenant-scoped Mongo collections generated per `subdomain` through
  `generateModels`; all reads and writes are tenant-scoped.
- Collections are namespaced per module: `Facebook*`, `Instagram*`, `Call*`,
  `CallPro*`, `Discord*`, plus inbox (`Conversations`,
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
- Mail collections: `mail_integrations` (one per inbox: `inboxId`, the generated
  `address`, `forwardFrom`, `senderName`, `healthStatus`, `error`), `mail_customers` (an
  `email` → core `contactsId` mirror, `email` unique), `mail_messages`,
  and `mail_cloudflare` — at most one document per workspace holding
  the connected account, zone, worker name and origin, the API token, the webhook
  secret, the deployed script version, `sendingEnabled` / `sendingTag` for Email
  Sending, and every provisioning step's outcome.
- `mail:cloudflare:{subdomain}` caches the zone, tenant, webhook secret and worker
  origin for 60 seconds, including a `none` marker for workspaces without a
  connection, so the inbound path does not read Mongo per message. It carries
  nothing outbound needs: the API token and `sendingEnabled` are read from Mongo by
  `readSendingAccount` when a reply is actually about to go out. `connect`,
  `provision` and `disconnect` all clear it.
- `mail_messages` carries a compound unique index
  `{ inboxIntegrationId: 1, messageId: 1 }` — the inbound dedup gate — plus
  indexes on `inboxConversationId`, `inReplyTo`, `references`, sparse `replyTag`,
  and `createdAt`. Outbound rows additionally hold `deliveryStatus`,
  `deliveryError`, `deliveryRetryable`, `bouncedRecipients`, and
  `providerMessageId` (sparse index — inbound threading looks replies up by it, but
  only rows written before Cloudflare became the transport ever carry one).
  Inbound rows hold `envelopeFrom` and `senderMismatch`.
- `ensureMailIndexes` reconciles those indexes on the tenant's own database the
  first time this process creates a mail inbox or receives mail for that
  subdomain, so a deployment never depends on someone remembering a migration. It
  drops `messageId_1` **only when that index is unique**, and creates the
  replacement lookup as `messageId_1_lookup`. It owns that key alone — the schema
  deliberately does not mark `messageId` with `index: true`, because mongoose's
  autoIndex would then keep trying to recreate `messageId_1` on a database where
  the legacy unique index of that name has been dropped, and MongoDB refuses a
  second index on the same key under a different name. A `messageId_1` mongoose
  already created on an older deployment still satisfies the lookup and is left
  alone. Failures are logged and the subdomain is left unreconciled so the next
  message retries.
- Inbound rate limiting lives in Redis under
  `mail:inbound:rate:{subdomain}:{inboxIntegrationId}`, a 60-second counter
  bounded by `MAIL_INBOUND_RATE_LIMIT` (default 120, `0` disables it). A Redis
  outage fails open.
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

## Local Invariants

- The plugin answers segment requests only about its own collections. No
  segment producer here may call another plugin: that shape is what produced
  the plugin-to-plugin RPC loop the Elasticsearch-era producers carried.
- The conversation collection must never get an event dispatcher. Every
  message written writes back to its conversation, so a dispatcher would make
  the highest-volume write in the product also the highest-volume segment
  event. `conversationsChanged` announces from the specific writes instead, and
  is given the update document so a message - which names only `updatedAt` and
  `messageCount` - announces nothing.
- A new write that moves `customerId`, `integrationId`, `assignedUserId`,
  `tagIds`, `status`, `closedAt`, `isBot` or `firstRespondedDate` on a
  conversation must call `conversationsChanged`. Nothing else will.
- Messages are declared in `segmentFields` but never in `contentTypes`: a
  single message is nobody's audience, and the declaration exists only to give
  the `customer.messages` relation a vocabulary.
- `ticketSchema` must stay wrapped in `schemaWrapper`: membership is written
  onto the record as `segmentIds`, and an unwrapped schema is a ticket segment
  that lists members and records none of them.
- Every field-joined relation needs an index on the path it groups by
  (`tickets.assigneeId`, `tickets.assignedMembers`). Without one the measure
  scans the collection.
- A ticket content type declaration must carry `contentType`. Without it the
  dispatcher's `frontline:tickets.tickets` maps to nothing and no write ever
  reaches a segment built on it.
- Ticket pipeline visibility rules (`isCheckUser`, `isCheckBranch`,
  `isCheckDepartment`, `isCheckDate`) are enforced by `generateFilter` on
  _every_ ticket list, not only pipeline-scoped ones. Without a
  `filter.pipelineId` the in-scope pipelines are loaded (by `channelId` when
  present) and each restricted pipeline contributes its own
  `{ pipelineId, <rule> }` branch to an `$or`, with unrestricted pipelines
  passing through a `$nin`. Adding a rule means extending
  `buildVisibilityCondition`, never the pipeline-scoped branch alone.
- Tickets in a private pipeline the user is not a member of are excluded from
  unscoped lists too, not just rejected on the pipeline-scoped query.
- `isCheckDate` means `createdAt >= start of the server's current day`.
- `excludeCheckUserIds` bypasses `isCheckUser` only, matching the settings UI
  where that member picker is nested under the "my tickets only" toggle.

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
- Outbound mail has exactly one entry point, `sendMail` in `utils/transports/`, and
  it is split in two: `deliver.ts` owns everything true of **any** transport — the
  `From`-versus-sending-domain guard, the empty-recipient guard, core suppression,
  the Email Delivery log lifecycle, and the `ISendMailResult` shape — while an
  `IMailTransport` owns only what its provider needs (payload shape, limits, error
  classification). Adding a transport means adding an `IMailTransport` and a branch
  in `resolveTransport`, never a second call site and never a second copy of the
  pipeline; a transport that re-implemented suppression or delivery logging would
  drift from the other one within a release.
- Both directions run on Cloudflare and nothing else. Inbound is Email Routing →
  the worker → `/mail/receive`; outbound is Email Sending on the same account.
  Never reintroduce an SES, SendGrid or SMTP lane: a second signer would mean a
  second suppression list, a second reputation and a second failure taxonomy, and
  the whole point of this module is that there is one of each.
- `resolveSigner` answers one question: which Cloudflare account signs for this
  workspace. The connected account wins; `readUsablePlatformAccount` is the
  deployment fallback and it deliberately returns `null` once a zone is connected,
  because the inboxes then live on that zone and the deployment cannot sign for
  them. The `From` is always `integration.address` — no lane ever rewrites the
  sender, so a reply can change signer without changing identity. When neither
  account can sign, `deliver.ts` refuses with a non-retryable `MailSendError`
  naming the domain, never a silent fall-through.
- `readSendingReadiness` and `assertSendableIntegration` ask
  `readUsablePlatformAccount`, not `readPlatformSendingAccount`, because they answer
  a different question — whether a **new** inbox can be created — and a new inbox
  on a workspace with a connected zone is addressed on that zone, where the
  deployment account cannot sign.
- The deployment's Cloudflare account is shared by every workspace, and on
  Cloudflare the daily quota **and** the suppression list are account-wide. That is
  why `checkPlatformSendRate` caps replies per workspace per day on that lane and
  only on that lane — a workspace signing with its own account spends its own
  allowance. Removing that cap hands one workspace the ability to exhaust the quota
  and poison the suppression list of every other one.
- A mail integration cannot be created or repointed without a working outbound
  path. `assertSendableIntegration` runs on both create and edit, and refuses with
  the same reason the UI shows. An inbox that receives but can never reply is not a
  degraded inbox, it is a broken one, so this gate is a product rule and not a
  convenience — never relax it to "warn and continue".
- `readSendingReadiness` is the single source for "can this workspace send at all":
  the Cloudflare account's state, the deployment credentials, plus every sending
  domain. The wizard, the edit dialog and the create gate all read it, so the
  button, the banner and the server can never disagree about why an inbox is
  refused. Its `ready` must stay the exact disjunction `resolveTransport` walks —
  a readiness that says yes where the transport says no is a wizard that ends in
  an undeliverable inbox.
- `resolveReplyToAddress` always returns the inbox address, tagged with the
  conversation tag when there is one. The `From` is that same address, so the
  reply comes home by construction and threading never depends on the customer's
  mail client preserving `References`.
- The domain picker and `checkZone` decide eligibility from the same two tests in
  `utils/cloudflare/zones.ts` — the zone must be active, and its apex MX must not
  already belong to another mail host. Duplicating either test would let the
  picker offer a domain that connecting then refuses. The picker is only a hint:
  a zone whose MX cannot be read stays selectable, because `checkZone` runs the
  tests again against live data and is the actual gate.
- Each test carries two wordings. The summary (`Mail already goes to …`) is what
  the picker prints under a domain name and has to stay short enough to sit
  there; the long form is what `checkZone` throws, where there is room to say
  what connecting would cost. Both come from the same source, so they cannot
  disagree about whether a zone is usable.
- `listZones` pages until a short page because the shared request helper drops
  Cloudflare's `result_info`; a single page would silently hide every zone past
  the fiftieth. `describeZones` then walks the result
  `ELIGIBILITY_CONCURRENCY` at a time — an account with hundreds of zones costs
  one MX lookup each — and sorts usable domains first.
- Every Cloudflare resource a workspace provisions carries its tenant in the
  name — `erxes-mail-<tenant>`, `erxes-mail-inbound-<tenant>`, its dead-letter
  queue likewise — so one Cloudflare account can serve more than one workspace.
  The R2 bucket stays shared because its objects are already keyed by tenant. A
  workspace that provisioned before this keeps whatever names its connection
  document holds: `connectCloudflare` only names a resource it is creating for
  the first time, so reconnecting never strands what a workspace is running on.
- Disconnecting deletes the worker and both queues it created. Each removal is
  tolerated on its own — a resource already gone must not stop the rest, and a
  disconnect must never fail because of one. Without this the tenant-scoped names
  would pile up dead resources on an account that may still serve other
  workspaces.
- A Cloudflare send that returns no `message_id` is logged, not swallowed. The
  id cannot be recovered afterwards — Email Sending keeps no sent-message lookup —
  so a message stored without it can never be threaded by header again.
- A reply's real `Message-ID` is the one Cloudflare assigns, not the one erxes
  generates. `sendEmail` returns it as `message_id` and the transport carries it
  back as `providerMessageId`, which is what `toWireReferences` puts on outgoing
  `References` and what inbound `In-Reply-To` is matched against. Dropping it
  silently breaks header threading — the stored `messageId` never appears on the
  wire, so no client can ever quote it back.
- A forwarded message is recognised by `Delivered-To`, not by the envelope sender.
  A forwarding mailbox hands the message over under its provider's own relay —
  Gmail uses a rotating `postmaster@mail-….google.com` — so the envelope can never
  carry the mailbox that `forwardFrom` names, and matching on it alone flagged
  every forwarded message as an unverified sender. `isForwardedBy` accepts either
  signal; the worker carries every `Delivered-To` hop, joined, because the
  forwarding mailbox is only one of them.
- A reply's display name is `integration.senderName`, falling back to the inbox
  integration's own `name`. `normalizeSenderName` rejects line breaks before it
  reaches a header — a name is caller-supplied text that lands in `From`, so this
  guard is what keeps it from carrying a second header — and caps the value at
  `MAIL_SENDER_NAME_MAX_LENGTH`. The name never changes the `From` address.
- The plugin never reads the workspace Mail Config and never consults
  `emailSenders`. What authorises the `From` is that the inbox's domain is
  onboarded for Email Sending on the Cloudflare account doing the signing.
- The Cloudflare `apiToken` is stored and never read back over GraphQL —
  `toPublicConnection` is the only serialiser and it has no token branch. It is not
  encrypted at rest yet.
- `readSendingAccount` answers only for the workspace's own Cloudflare account, and
  only when it is `connected` **and** `sendingEnabled`. A connected-but-not-onboarded
  account is an error, not a fallback. Both failure branches return
  `{ ok: false, reason }` naming the exact fix, because that reason is what the
  agent reads on the failed message and what the wizard shows before creation.
- The signing account's `domain` is mandatory on every branch and `deliver.ts`
  compares it against the `From` before the request. An empty domain must never
  make that comparison skippable: Cloudflare would answer with a bare
  `Sender domain not verified` that names neither the address nor the env var.
- The `From` on a reply **is** `integration.address`. That domain is onboarded on
  the account doing the sending, so Cloudflare's DKIM signs for it. The tagged
  `Reply-To` is what brings the answer back into the same conversation.
- Cloudflare owns the `Message-ID`: it is on the forbidden-header list
  (`E_HEADER_NOT_ALLOWED`), it is stamped on a **Cloudflare** domain, and the REST
  response returns only `delivered` / `permanent_bounces` / `queued`. So
  `providerMessageId` is unobtainable and is no longer written. `In-Reply-To` and
  `References` _are_ allowlisted and are still sent, which is why
  `buildThreadingHeaders` takes `includeMessageId` rather than being edited in place.
- Because our own `messageId` never reaches a real header, `toWireReferences`
  rewrites the chain before it goes out: an id belonging to one of our `SENT` rows
  is swapped for its legacy `providerMessageId`, or dropped. Emitting an id no
  client has ever seen breaks threading on the recipient's side. The stored
  `inReplyTo` / `references` are left untouched — inbound matching needs them.
- Threading therefore stands on two legs, and both must hold. A thread that started
  inbound survives on `findRelatedConversation`'s `{ messageId: { $in: references } }`
  branch, which matches the customer's own quoted ids against our stored inbound
  rows — deleting that branch breaks every reply chain. A thread that started
  outbound survives on the reply tag, which is why `createSendMail` mints one
  unconditionally rather than only when the conversation already has one.
- `createSendMail` refuses a message with no `conversationId`. Such a message was
  never deliverable in the first place — it stored an orphan row that no inbox view
  renders and no reply can thread back to — and Cloudflare removed the last header
  that could have rescued it.
- Suppression runs in `deliver.ts`, before the transport is called and before the
  delivery log is written: `emailSuppression.blocked` is asked about to/cc/bcc,
  closed addresses are filtered out, and when nothing is left in `to` the send is
  skipped entirely and every suppressed address is reported as `bounced`. Core's
  suppression list governs mail replies the same way it governs every other erxes
  email, and it cannot be bypassed by a new transport.
- Cloudflare's send API caps a message at `MAIL_SEND_MAX_BYTES` (5 MiB, its
  documented `email.sending.error.email.too_big`) **after** base64 encoding, 50
  recipients across to/cc/bcc, and 16 KB of headers. All three are
  checked before the request so the failure names the attachment or the recipient
  list instead of surfacing a bare 400, and a `References` chain that outgrows the
  header budget is trimmed from its second entry so the thread root survives.
- Email Sending is a **paid** product: it needs a Workers Paid plan ($5/month,
  3,000 messages included, $0.35 per 1,000 after), the domain onboarded once under
  Compute & AI · Email Service · Email Sending, and an **Account** · Email Sending ·
  Edit token permission — there is no zone-scoped equivalent. A free-plan account
  fails the zone endpoints with a bare `Unauthorized` (code 2036) that names none of
  this, which is why `explainFailure` treats any 401/403 as a permission problem —
  not only Cloudflare's generic code 10000 — and the hint leads with the plan.
- Email Sending onboarding is provisioned but **optional**: `enableEmailSending` and
  `checkSendingDns` are the only steps whose failure does not fail the connection.
  They record themselves as failed and `sendingEnabled` stays false, which costs the
  workspace its replies but keeps its inbound mail. Making them fatal would take
  inbound down over an outbound DNS conflict, because a connection in `error` status
  is invisible to `readConnectedCloudflare` and inbound verification loses its key.
- Only inbound mail announces itself as a client message. `receiveMessage`
  publishes through `pConversationClientMessageInserted` (the unread badge, the
  notification sound, and the thread), and the payload carries `createdAt` so the
  conversation list can reorder without the gateway having to resolve the message.
  A reply publishes `conversationMessageInserted:<conversationId>` directly — a
  mail message lives in `mail_messages`, so `conversationMessage(_id)` cannot
  resolve it, and announcing an agent's own reply as a client message rang the
  notification for every channel member.
- An outbound message is stored before it is handed to the transport, and its
  `deliveryStatus` is the only source of truth for the UI: `pending` → `sent`,
  `bounced` (Cloudflare returned a permanent bounce or core suppressed a recipient),
  or `failed`. Never report success from an HTTP 200 alone. `mailMessageRetry`
  accepts only a `failed` outbound message.
- A send failure is classified by its own transport into `MailSendError.retryable`
  (for Cloudflare, HTTP 408/425/429/5xx are transient), which is what the UI turns
  into "try again" versus "fix the configuration". `deliver.ts` wraps anything that
  reaches it without that type as retryable. A recipient Cloudflare returns under
  `permanent_bounces` is not a failure at all — it is `bounced`, like a core
  suppression.
- A generated inbox address is `<tenant>--<slug>-<suffix6>@MAIL_DOMAIN`, and the
  tenant comes from `resolveMailTenant` (`MAIL_TENANT`, else the request
  subdomain). The `--` separator is safe because `slugify` collapses runs of
  non-alphanumerics to a single `-`, so it can never appear inside a slug. The slug
  budget shrinks as the tenant grows, keeping the local part inside RFC 5321's 64
  octets even with a `+<tag10>` reply tag; a tenant over 41 characters is rejected
  at build time rather than producing an invalid address.
- `MAIL_TENANT` is ignored when `VERSION=saas`. The tenant is the identity a
  deployment answers as, not a credential, so a shared deployment must never be
  able to override it: one static value would give every organization the same
  address prefix and the same derived webhook key, funnelling all inbound mail to
  a single host. Ignoring it yields the correct value (the request subdomain),
  which is why it is dropped silently rather than rejected.
- When the tenant is derived from the subdomain it must survive `slugify`
  unchanged, otherwise `resolveMailTenant` throws. `slugify` collapses runs of
  non-alphanumerics, so `acme--corp` and `acme-corp` are both DNS-legal
  subdomains that would otherwise share one mail tenant. The check turns that
  silent collision into an error when the address is generated.
- The endpoint a provisioned worker posts to comes from `MAIL_RECEIVE_URL` when it
  is set, and from `DOMAIN` otherwise. The override exists because the plugin is
  not always reachable at the host `DOMAIN` names — a local run behind a tunnel is
  the ordinary case. The value is baked into the uploaded script, so changing it
  means running `mailCloudflareProvision` again.
- Inbound verification tries a **list** of keys, never one: the connected Cloudflare
  account's key first (`HMAC-SHA256(connection.webhookSecret, connection.tenant)`),
  then the deployment's platform key. That is what lets a workspace move onto its own
  account without losing mail that is still in flight on the platform worker, and it
  is why `verifySignature` takes keys rather than a subdomain. A workspace with no
  connection and no `MAIL_WEBHOOK_SECRET` gets an empty list and a `401` that says so.
- A workspace's Cloudflare API token never leaves the server. `MailCloudflareConnection`
  has no field for it, `toPublicConnection` is the only shape a resolver may return,
  and `mailCloudflareZones` takes a token as an argument without storing it. The token
  is stored as written, exactly as Facebook page tokens are — anyone who can read the
  tenant database can act on that Cloudflare account, which is the accepted risk.
- `worker/bundle.generated.ts` is generated, never edited. It is the minified worker
  from `cloudflare/mail-worker`, base64 encoded so no escaping can corrupt it, and it
  carries the sha256 prefix the UI compares against a connection's `scriptVersion` to
  offer an update. Change the worker, then run `npm run bundle` in
  `cloudflare/mail-worker` and commit the result, or every tenant keeps the old script.
- The provisioner is a fixed order of idempotent steps and the catch-all rule is
  always last, because that rule is what opens the mail flow — the bucket, the queues,
  the script and its secret must all exist before a message can arrive. Each step
  records its own outcome, so `mailCloudflareProvision` repairs a half-finished
  account instead of starting over.
- The worker's `MAIL_ROUTES` binding is optional. A tenant's own worker serves one
  install and gets no routing namespace, so `routeFor` must keep falling back to
  `ERXES_ENDPOINT`; reading the binding unguarded throws on every message there.
- An inbox address on a connected zone is exactly `<slug of the name>@<zone>` —
  no tenant prefix, no random suffix. That worker answers for a single install and
  the workspace owns the whole namespace, so an inbox named Support is reachable at
  `support@acme.com` and nowhere else. A name whose address is already taken is
  **rejected**, never silently decorated: a second Support inbox has to be named
  something else, because an address nobody chose is worse than an error. Without a
  connection the address stays `<tenant>--<slug>-<suffix>@MAIL_DOMAIN`, where both
  the prefix and the suffix are load-bearing: that domain is shared by every
  workspace, so a guessable address would collide and could be enumerated.
- The webhook is never signed with `MAIL_WEBHOOK_SECRET` itself. Both sides derive
  `HMAC-SHA256(MAIL_WEBHOOK_SECRET, tenant)` — the worker from the address it
  routed, the API from its **own** subdomain. Verifying with a tenant taken from
  the payload would defeat the whole scheme: the point is that a payload signed for
  one tenant fails at every other tenant's host. An install answering on its own
  domain is registered in the worker's routing namespace with a secret of its own,
  which becomes the master on both sides; the derivation, and everything in this
  plugin, is unchanged by that.
- An attachment that cannot be fetched or stored keeps the worker's signed source
  `url` plus an `error` explaining why, exactly as Discord's `rehostImageAttachments`
  falls back to the CDN URL. Inbound delivery still succeeds — one unreachable
  attachment must not cost the message.
- That fallback only works because the response carries `keepStored: true` when any
  attachment failed, and the worker skips its usual delete. Storing the reason
  without holding the object would leave a link that 404s a second later. The
  objects are then bounded by the bucket's retention rule, so a deployment with
  broken file storage does not accumulate mail forever.
- Every inbound message is scoped by `inboxIntegrationId` — dedup, thread lookup,
  and reply-tag lookup all carry it, so two inboxes that receive the same mail
  each keep their own copy.
- Threading order is fixed: reply tag, then `In-Reply-To`/`References`, then an
  open conversation for the same customer **whose latest message has the same
  normalized subject** (`Re:`/`Fwd:`-style prefixes stripped). Dropping that last
  check merges unrelated subjects into one thread.
- A message flagged `isAuto` (vacation/auto-responder headers) is stored and
  shown but never reopens a resolved conversation; that check plus the
  self-addressed guard is what stops an auto-reply loop. The self-addressed guard
  tests the `From` header **and** `envelopeFrom`.
- The customer of an inbound mail is still resolved from the `From` header, not
  from `envelopeFrom`. Mail reaches an inbox by forwarding, so the envelope
  routinely carries the forwarder rather than the person who wrote the mail —
  keying identity off it would collapse every customer of a forwarded inbox into
  one. The envelope is used for the `senderMismatch` flag instead, and that flag
  stays off when the envelope matches `integration.forwardFrom` or its domain.
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
- Smoke: turn on "Show only tickets assigned to the user" for one pipeline,
  then open the channel ticket list (no `pipelineId` in the URL); only that
  pipeline's rows are narrowed to the current user, other pipelines are intact.
- No `test` target is defined in `project.json`; do not invent one.
- Smoke: connect a mail inbox without a `channelId` → a `Personal inbox`
  channel is created with one admin member and the integration attaches to it;
  a second connect reuses the same channel; the same holds for a non-mailbox
  kind such as a webhook; creating an integration against another user's
  personal `channelId` is rejected; `channelAddMembers` on it fails; no user's
  `getChannels` lists it — not even the owner's.
- Smoke (mail): send a mail to an inbox address → a conversation with the stored
  message appears; reply from the UI → the recipient sees
  `From: <inbox>@<sending-domain>` with a DKIM signature for that domain and
  `Reply-To: <local>+<tag>@<domain>`, answering it lands in the same conversation,
  and the send shows up in Settings → Email Delivery as the `custom` provider with
  no workspace Mail Config configured at all; a new subject from the same customer
  opens a **new** conversation.
- Smoke (mail sending gate): on a workspace with no Cloudflare connection and no
  `MAIL_SENDING_ACCOUNT_ID` / `MAIL_SENDING_API_TOKEN`, the add-inbox wizard must
  refuse at its sending step and name the fix; calling
  `integrationsCreateExternalIntegration` directly must fail with the same reason. Attach a file over
  `MAIL_SEND_MAX_BYTES` → the reply fails before the request with a message naming
  the attachment, not a bare Cloudflare 400. Suppress the recipient in core →
  the reply is `bounced` with that address listed and no request is made.
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

<<<<<<< HEAD

### `2026-09-01` — `checkTargetMatch` producer removed

- **Summary:** The `checkTargetMatch` producer was deleted from the plugin-level
  automations object and from the ticket module's producers; automation target
  matching now runs through the segment engine, so the Elasticsearch-era
  selector round-trip has no caller left anywhere in the repository.
- **Affected areas:** `src/meta/automations.ts`,
  `src/modules/ticket/meta/automations/ticketAutomationsProducers.ts`.
- **Contracts changed:** `/automations` no longer answers `checkTargetMatch`.
  The `TAutomationProducers.CHECK_TARGET_MATCH` method no longer exists in
  `erxes-api-shared`.

### `2026-09-01` — Elasticsearch-era segment producers removed

- **Summary:** `associationFilter`, `esTypesMap`, `initialSelector` and
  `propertyConditionExtender` were deleted from the ticket module and from the
  plugin-level segment object; the plugin no longer makes any plugin-to-plugin
  segment call, and no plugin-to-plugin RPC loop can form.
- **Affected areas:** `src/meta/segments.ts`,
  `src/modules/ticket/meta/segments/index.ts`.
- **Contracts changed:** `/segments` no longer answers `associationFilter`,
  `esTypesMap`, `initialSelector` or `propertyConditionExtender`. No caller
  existed for any of them.

### `2026-09-01` — Conversations and messages reachable from a segment

- **Summary:** `frontline:inbox.conversations` is a segment content type with
  12 fields including a derived `integrationKind` channel; conversations and
  messages are both reachable from a customer segment
  (`customer.conversations`, `customer.messages`), which is what answers "came
  in from Facebook" and "wrote a comment saying 111". Conversation writes
  announce themselves from the four places that move a declared field rather
  than through a dispatcher.
- **Affected areas:** `src/modules/inbox/meta/segments/` (new);
  `src/modules/inbox/db/models/Conversations.ts`;
  `src/modules/inbox/trpc/conversation.ts`; `src/meta/segments.ts`;
  `src/connectionResolvers.ts`.
- **Contracts changed:** New segment content type
  `frontline:inbox.conversations`; new relations `customer.conversations`,
  `customer.messages`. `loadClass` for conversations now takes `subdomain`.

### `2026-09-01` — Tickets became a real segment content type

- **Summary:** `frontline:tickets.tickets` is now declared with its event
  content type, filterable on 24 user-facing fields, materialisable, and
  reachable from customer, company and team-member segments; the module moved
  off the Elasticsearch-era producers onto the shared evaluator.
- **Affected areas:** `src/modules/ticket/meta/segments/` (`fields/`,
  `collections.ts`, `members.ts`, `membership.ts`, `evaluate.ts`,
  `relations.ts`, `configs.ts`, `index.ts`); `src/meta/segments.ts`;
  `src/modules/ticket/db/definitions/ticket.ts` (schemaWrapper, join indexes).
- **Contracts changed:** Ticket content type now declares
  `contentType: 'frontline:tickets.tickets'`; new relations
  `customer.tickets`, `company.tickets`, `user.assignedTickets`.
  =======
  <<<<<<< HEAD

### `2026-09-02` — Ticket visibility rules apply outside pipeline-scoped lists

- **Summary:** All four pipeline visibility rules were dead on the channel
  ticket list: `generateFilter` only consulted the pipeline when the query
  carried a `filter.pipelineId`, and the channel page never sends one, so every
  ticket in the channel was returned. `isCheckDate` was additionally never
  referenced by any query, and `isCheckBranch`/`isCheckDepartment` only acted as
  pipeline access gates rather than the per-ticket filters their labels promise.
  Rules now live in `buildVisibilityCondition` and are applied per pipeline on
  unscoped lists, which also stops private-pipeline tickets leaking there.
- **Affected areas:** `src/modules/ticket/utils/generateFilter.ts`.
- # **Contracts changed:** None (`getTickets` arguments are unchanged).
  > > > > > > > cba2acc12f171a512ce661d11ce7c9a5481eb89c

### `2026-09-02` — IMAP integration removed

- **Summary:** The IMAP channel runtime was deleted in full — poller, client,
  message processing/saving, models, message broker, and GraphQL layer — along
  with every registration that referenced it.
- **Affected areas:** `src/modules/integrations/imap/` (deleted), `src/main.ts`,
  `src/connectionResolvers.ts`, `src/apollo/{resolvers,schema}`,
  `src/modules/inbox/graphql/resolvers/{customResolvers/integration.ts,mutations/integrations.ts}`,
  `src/modules/inbox/utils.ts`, `src/modules/inbox/trpc/inbox.ts`,
  `src/shared/types.ts`, `package.json`.
- **Contracts changed:** Removed GraphQL `imapConversationDetail`,
  `imapGetIntegrations`, `imapLogs`, `imapSendMail`, types `IMap` and
  `IMapIntegration`; `imap` is no longer an accepted integration kind for
  create/update/remove or `getIntegrationsKinds`; the `imap_customers`,
  `imap_integrations`, `imap_messages` and `imap_logs` models are no longer
  registered.
  > > > > > > > 8b1bde58e0fa2b2698872aef1fc19189dc98bd8d

### `2026-08-28` — Every zone is listed, and the picker says which are usable

- **Summary:** `listZones` asked for a single page of 50, so an account with more
  domains than that silently lost the rest — including, quite possibly, the only
  one it could use. It now pages until a short page. Eligibility reasons were
  reusing the full `checkZone` error, three lines of explanation per row; they now
  have a summary form for the picker while the long form stays on the thrown
  error. `describeZones` bounds the per-zone MX lookups to
  `ELIGIBILITY_CONCURRENCY` and returns usable domains first.
- **Affected areas:** `src/modules/integrations/mail/utils/cloudflare/zones.ts`,
  `.../cloudflare/{api,connect}.ts`.
- **Contracts changed:** None — `MailCloudflareZone.reason` is shorter prose.

### `2026-08-28` — The domain picker says which domains can actually be connected

- **Summary:** `mailCloudflareZones` returned every zone a token could reach, so a
  domain that already carries another provider's MX looked selectable and only
  failed at `checkZone`, three provisioning steps into Connect. The two tests
  `checkZone` runs now live in `utils/cloudflare/zones.ts` and the listing applies
  them per zone, returning `eligible` and the `reason`. A zone whose MX cannot be
  read stays eligible rather than being wrongly withheld — `checkZone` is still the
  gate, the picker only spends one extra MX lookup per zone to warn earlier.
- **Affected areas:** `src/modules/integrations/mail/utils/cloudflare/zones.ts`
  (new), `.../cloudflare/{connect,provision}.ts`,
  `src/modules/integrations/mail/@types/cloudflare.ts`,
  `src/modules/integrations/mail/graphql/schema/mail.ts`.
- **Contracts changed:** `MailCloudflareZone` gains `eligible` and `reason`.

### `2026-08-28` — One Cloudflare account can serve more than one workspace

- **Summary:** `connectCloudflare` named the worker, queue and dead-letter queue
  from module constants, so a second workspace connecting the same Cloudflare
  account collided on the queue name and provisioning died at `attachConsumer` —
  the account was effectively single-tenant, whatever domain was chosen. Those
  three names now carry the tenant, which is already resolved two lines above
  them; the R2 bucket stays shared because its objects are keyed by tenant
  anyway. Existing connections keep the names stored on their document, so
  nothing already provisioned is stranded. Disconnecting now deletes the worker
  and both queues, since tenant-scoped names would otherwise accumulate.
- **Affected areas:** `src/modules/integrations/mail/utils/cloudflare/connect.ts`,
  `src/modules/integrations/mail/utils/cloudflare/api.ts` (adds `deleteQueue`,
  `deleteScript`), `src/modules/integrations/mail/utils/cloudflare/provision.ts`
  (two guard messages no longer claim one account serves one workspace).
- **Contracts changed:** None. `provision.ts` already read every name from the
  connection document, and `buildScriptMetadata` already took them as arguments.

### `2026-08-28` — Header threading works again on sent replies

- **Summary:** `createCloudflareTransport` discarded the `message_id` Cloudflare
  returns, so every sent reply was stored with no `providerMessageId`. The
  machinery around it was already complete — `toWireReferences` swaps the internal
  id for the wire one, and inbound matching checks `providerMessageId` — but with
  the field empty the sent message was filtered out of outgoing `References`
  entirely and a customer reply quoting it could not be matched. Replies still
  threaded through the tagged `Reply-To` and the original inbound id, which is why
  this stayed hidden. The stored `from` on a sent message now also carries the
  display name that actually went out instead of repeating the address.
- **Affected areas:**
  `src/modules/integrations/mail/@types/cloudflare.ts`,
  `src/modules/integrations/mail/utils/transports/cloudflare.ts`,
  `src/modules/integrations/mail/db/models/Messages.ts`.
- **Contracts changed:** None — `providerMessageId` was already stored and
  returned; it was simply never populated for Cloudflare sends.

### `2026-08-28` — A forwarded message is no longer flagged as an unverified sender

- **Summary:** Mail arriving through a forwarding rule was always banded
  "Unverified sender". `isForwardedBy` compared the SMTP envelope sender against
  the inbox's `forwardFrom`, but a forwarder hands the message over under its own
  relay — Gmail's is a rotating `postmaster@mail-….google.com` — so no value of
  `forwardFrom` could ever match and the guard could not be satisfied at all. The
  worker now carries `Delivered-To` (every hop, joined, since the forwarding
  mailbox is only one of them) and `isForwardedBy` accepts a match on either that
  or the envelope sender. A genuine sender mismatch is still flagged.
- **Affected areas:**
  `src/modules/integrations/mail/controller/receiveMessage.ts`,
  `src/modules/integrations/mail/worker/bundle.generated.ts`,
  `cloudflare/mail-worker/src/parse.ts`,
  `cloudflare/mail-worker/fixtures/delivered-to.json`.
- **Contracts changed:** The inbound webhook payload's `headers` may now carry
  `delivered-to`. The worker bundle version changed, so a workspace running the
  worker on its own Cloudflare account has to press _Update worker_.

### `2026-08-27` — An inbox can choose the name recipients see

- **Summary:** Replies carried the inbox integration's `name` as their display
  name with no way to change it, so a mailbox called "support" appeared to
  recipients as `support`. A mail integration now owns an optional `senderName`,
  used for the `From` display name and falling back to the inbox name when empty.
  It is validated on create and edit: line breaks are rejected so the value cannot
  smuggle a second header, and length is capped at `MAIL_SENDER_NAME_MAX_LENGTH`.
  The `From` address itself is unchanged.
- **Affected areas:** `src/modules/integrations/mail/db/definitions/integrations.ts`,
  `src/modules/integrations/mail/@types/integration.ts`,
  `src/modules/integrations/mail/db/models/Messages.ts`,
  `src/modules/integrations/mail/{messageBroker,constants}.ts`.
- **Contracts changed:** `mailCreateIntegration` and `mailUpdateIntegration` accept
  `data.senderName`; `mailIntegrationDetails` returns it.

### `2026-08-27` — Mail sends through Cloudflare only; SES and SendGrid are gone

- **Summary:** Outbound mail now leaves through Cloudflare Email Sending on every
  path, matching the inbound side. A workspace that has connected its own
  Cloudflare account replies from its own zone; every other workspace replies from
  its generated address on `MAIL_DOMAIN` through the deployment's Cloudflare
  account, configured with `MAIL_SENDING_ACCOUNT_ID` and `MAIL_SENDING_API_TOKEN`.
  The workspace-owned SES/SendGrid sending domains — the model, its DNS-proof
  verification, the provider transport and the whole Settings → Integrations config
  → Sending domains panel — are removed, along with the per-inbox sender choice:
  an inbox always answers from its own address. `checkPlatformSendRate` still caps
  the shared lane, because a Cloudflare account shares its daily quota and its
  suppression list across every workspace on it.
- **Affected areas:** `src/modules/integrations/mail/utils/`
  (`platformConfig.ts` rewritten, `transports/{index,readiness,types}.ts`;
  `dnsProof.ts`, `sendingSerialize.ts`, `transports/provider.ts` deleted),
  `src/modules/integrations/mail/db/{definitions,models}/` (`sending.ts`,
  `SendingAccounts.ts` deleted; `integrations.ts` loses `sendingAccountId` /
  `sendingAddress`), `src/modules/integrations/mail/@types/{sending,integration}.ts`,
  `src/modules/integrations/mail/{messageBroker,constants}.ts`,
  `src/modules/integrations/mail/controller/receiveMessage.ts`,
  `src/modules/integrations/mail/graphql/`, `src/connectionResolvers.ts`.
- **Contracts changed:** removes the `mailSendingAccounts` query, the
  `mailSendingAccountAdd` / `mailSendingAccountVerify` / `mailSendingAccountRemove`
  mutations, the `MailSendingAccount` and `MailSendingDnsRecord` types and
  `MailSendingReadiness.accounts`; `mailCreateIntegration` and
  `mailUpdateIntegration` ignore `data.sendingAccountId` / `data.sendingAddress`.
  Env `MAIL_SENDING_DEFAULT_EMAIL_SERVICE`, `MAIL_SENDING_AWS_SES_*`,
  `MAIL_SENDING_AWS_REGION` and `MAIL_SENDING_SENDGRID_API_KEY` are replaced by
  `MAIL_SENDING_ACCOUNT_ID` and `MAIL_SENDING_API_TOKEN`. The
  `mail_sending_accounts` collection is orphaned and can be dropped.

### `2026-08-27` — Deprecated Messenger tags normalized to HUMAN_AGENT

- **Summary:** `sendReply` coerces the Meta-retired CONFIRMED_EVENT_UPDATE / POST_PURCHASE_UPDATE / ACCOUNT_UPDATE tags to `HUMAN_AGENT` before every Send API call, restoring replies to conversations older than 24 hours (retired tags fail with error 100 "Invalid parameter" since 2026-04-27).
- **Affected areas:** `src/modules/integrations/facebook/utils.ts` (`normalizeMessengerTag`, `HUMAN_AGENT_MESSENGER_TAG`, `sendReply`)
- **Contracts changed:** None

### `2026-08-26` — Mail automation and reply drafts removed

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
- **Summary:** The mail channel no longer registers automation. The
  `frontline:mail.messages` trigger, the `Send Email` and `Draft Email Reply`
  actions, their workers and the AI-context builder are gone, and so is the reply
  draft they were the only producer of — nothing else could create one, so the
  draft model, its GraphQL surface and its inbox card would have been unreachable
  code.
- **Affected areas:** `src/modules/integrations/mail/meta/` (deleted),
  `src/modules/integrations/mail/db/{models/Drafts.ts,definitions/drafts.ts}`,
  `@types/draft.ts`, `utils/draftEvents.ts` (deleted),
  `src/meta/automations.ts`, `src/connectionResolvers.ts`,
  `src/apollo/subscription.ts`,
  `src/modules/integrations/mail/{constants,messageBroker}.ts`,
  `.../mail/controller/receiveMessage.ts`, `.../mail/graphql/`.
- **Contracts changed:** Removed the `frontline:mail.messages` automation
  trigger, both mail automation actions, `MailDraft`, `mailConversationDraft`,
  `mailDraftSave`, `mailDraftApprove`, `mailDraftRemove`, and the
  `mailDraftChanged` subscription.
