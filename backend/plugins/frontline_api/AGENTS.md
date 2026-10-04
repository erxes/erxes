# `frontline_api` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/frontline_api`
- **Last synchronized:** `2026-10-05`

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
- Telegram bot credential validation, provider webhook status reads, and
  tenant-scoped bot records, customer identity mappings, conversation mappings,
  and message mappings.
- Response templates.
- Ticketing: boards, pipelines, statuses, tickets, activities, notes, ticket
  configs, plus ticket import/export handlers.
- Forms: form definitions, fields, and form submissions (with submission export).
- Surveys: channel-scoped survey definitions, the snapshot an agent posts into a
  messenger conversation, and the per-voter vote ledger behind the tallies.
- Knowledge base: topics, categories, articles, and the AI knowledge source
  provider that indexes articles.
- Help centers: the client portal config record behind a published help center
  site — its general settings (name, description, website, knowledge base and
  ticket feature groups), its appearance (logo pair, surface colours, fonts,
  form-element colours, accent colour, cover image, raw header/footer markup),
  its header wording (wordmark, home/forms/announcements tab labels, search
  placeholder) and its footer content (logo, description, copyright line, link
  columns).
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

- Surveys are a reusable definition (`title`, ordered `steps`, optional
  `durationHours`, optional `brandId`, `active`/`archived` status) owned by a
  channel through `channelId`. Each step is one question with its own
  `name`, `description`, ordered `options` and `allowMultiselect`, so a survey can
  ask several questions in sequence. Step 1 stays mirrored on the survey's
  top-level `question` / `options` / `allowMultiselect`, which is what every
  reader written against the single-question shape still sees. An agent posts one into a messenger
  conversation with `surveySendToConversation`,
  which writes a snapshot to the message's `extraData.survey` and bumps the
  survey's `sentCount` and sets `hasSurvey` on the conversation. Client portal
  users vote through `cpSurveyVote`; each vote recomputes the tallies, marks the
  conversation as customer-responded and unread, then republishes the message
  through `pConversationClientMessageInserted`, so the conversation rises in
  the agent's list and both the inbox and the portal update without a refresh.
- A survey option can arm a **ticket automation**: `ticketCreationEnabled`,
  `ticketCreationThreshold`, `ticketPipelineId` and `ticketStatusId`. Every vote written through `cpSurveySubmit` or `cpSurveyVote` counts
  that option's votes and, once the count reaches the threshold, creates one
  ticket in the configured status and records `ticketCreated` / `ticketId` back
  on the option. The ticket name is always derived —
  `<survey title, capped at 80 chars> — <option text>` — and cannot be set by
  hand; the question and the vote count live in the ticket's description. The ticket carries a `sourceSurvey` record naming the survey, step,
  option, question, option text, vote count and threshold.
- Every conversation filter query accepts `withSurvey: String` — `"true"` keeps
  only conversations carrying a survey (the denormalized `hasSurvey` flag). An
  `integrationType`-scoped list without `withSurvey` excludes them instead, so the
  inbox's `Messenger` row and its `Surveys` row are disjoint and add up.
- Answering a survey is a client portal surface, not a messenger widget one.
  Every `cp*` survey operation requires a signed-in client portal user; there is
  no guest path. `cpSurveys` lists every active survey — `channelId` and `brandId`
  are optional filters, so an unscoped call returns them all with the caller's
  own selections; `cpSurveyDetail` serves a survey by `code` for a channel, `cpSurveySubmit` resolves
  the respondent's erxes customer and opens a conversation carrying the survey
  snapshot. One client portal user may answer a given survey **once**: the vote
  ledger carries `cpUserId` and a partial unique index on
  `(surveyId, cpUserId)` enforces it, so a repeat submit — even one choosing
  different options — returns `alreadyVoted` and writes nothing.

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
- Validates a Telegram bot token with `getMe` through
  `telegramValidateToken`. The query requires `integrationsAdd`, returns bot
  identity and optional group settings, and exposes controlled validation errors.
- The internal `getTelegramWebhookInfo(token)` client reads the provider's
  current webhook URL, pending update count, and optional delivery details. It
  validates the response with Zod and does not change webhook configuration.
- The internal `verifyTelegramWebhookSecret` helper rejects missing, empty, or
  unequal secrets and compares equal-length UTF-8 buffers with `timingSafeEqual`.
  It lives in `src/modules/integrations/telegram/utils/webhookAuth.ts`.
- `telegramUpdateSchema` validates incoming update envelopes with a nonnegative
  safe-integer `update_id` and preserves additional event fields. It does not
  validate those event fields or process deliveries.
- `telegramMessageSchema` validates message identifiers, timestamp, chat,
  optional user or chat sender, text, and topic metadata. It accepts signed chat
  IDs and preserves additional fields as unknown. The internal message receiver
  invokes it before filtering supported messages or accessing persistence.
- `TelegramBots.verifyWebhookSecret(_id, receivedSecret?)` checks the supplied
  secret against the saved bot in the tenant's database and returns a boolean.
  Missing inputs, unknown bots, and incorrect secrets return `false`.
- `authenticateTelegramWebhook` reads the saved bot's `_id` route parameter and
  `X-Telegram-Bot-Api-Secret-Token` header, resolves tenant models, and calls the
  saved-bot verifier. It responds with `401` for missing or rejected credentials,
  `500` for verification failures, and calls `next()` on success. It runs before
  the controller on `POST /telegram/receive/:_id`.
- Registers `TelegramBots` on the tenant's database connection. Its
  `getBot(_id)` method returns the saved bot or throws `Telegram bot not found`.
- Registers `TelegramCustomers` on the tenant's database connection. Its
  `getCustomer(selector)` method returns the matching customer mapping or throws
  `Telegram customer not found`.
- The internal Telegram `createCoreCustomer` adapter forwards a validated
  sender's first and last names and the linked integration ID through
  `receiveInboxMessage` using the supplied subdomain. It returns a nonempty Core
  customer ID and rejects bridge failures or malformed success data. It does
  not look up or link Telegram customer mappings itself.
- The internal `getOrCreateTelegramCustomer` helper inserts or reuses a local
  mapping by the sender's string `userId`. It returns the mapping and whether
  this invocation inserted it, preserves existing profile and Core-link fields,
  and adopts a concurrent insert winner. It does not call Core or link records.
- The internal Telegram `getOrCreateCustomer` coordinator returns a mapping
  linked to a Core contact. It reuses an existing link, gives a competing
  creator four bounded waits to finish, and attempts linking if the mapping
  remains unlinked. A conditional write preserves a competing completed link;
  failures propagate and leave existing mappings available for retry.
- Registers `TelegramConversations` on the tenant's database connection. Its
  `getConversation(selector)` method returns the matching conversation mapping
  or throws `Telegram conversation not found`. Conversation identity combines
  the integration, chat, and topic.
- The internal `getOrCreateTelegramConversation` helper inserts or reuses that
  mapping and reports whether this invocation inserted it. It stores string
  chat IDs, defaults absent topics to zero, converts message time to a `Date`,
  and initializes the chat metadata and text preview. Existing metadata and
  inbox links are preserved; the helper does not create an inbox conversation.
- The internal `createInboxConversation` adapter forwards the mapping's
  integration, preview, and source timestamp plus a Core customer ID through
  the existing inbox bridge. It validates and returns the created inbox ID;
  it does not save that ID on the Telegram mapping. Its ID-response validator
  is shared with `createCoreCustomer`.
- The internal `getOrCreateConversation` coordinator requires a customer linked
  to Core, reuses completed inbox links, and waits briefly for a competing
  creator before attempting recovery. It conditionally saves the inbox ID and
  adopts a competing completed link without overwriting it. Failures propagate
  and leave the mapping available for retry.
- Registers `TelegramConversationMessages` on the tenant's database connection.
  Its `getMessage(selector)` method returns the matching message mapping or
  throws `Telegram conversation message not found`. A unique compound index
  rejects duplicate integration, chat, and message identities. The internal
  receiver writes these records through the message coordinator.
- The internal `getOrCreateTelegramMessage` helper inserts or reuses a message
  mapping by integration, chat, and provider message ID. It stores the local
  conversation ID, Core customer ID, text, and source timestamp; existing
  content and links remain unchanged. It reports local insertion ownership and
  adopts a concurrent insert winner without creating an inbox message.
- The internal `createInboxMessage` adapter forwards stored message content,
  customer, timestamp, and attachments to the supplied inbox conversation via
  `receiveInboxMessage`. It requests preview replacement and validates the
  returned inbox message ID. It does not persist the link, coordinate retries,
  or invoke Telegram.
- The internal `getOrCreateMessage` coordinator requires a linked customer and
  conversation, reuses completed message links, and waits briefly before
  recovering an unlinked mapping. It conditionally saves the created inbox
  message ID and adopts a competing completed link. Failures propagate while
  preserving mappings for retry.
- The internal `receiveTelegramMessage` handler validates a provider message
  and processes ordinary private human text through the customer, conversation,
  and message coordinators in order. Valid unsupported messages return `null`
  without persistence; invalid payloads, missing integration links, and storage
  failures propagate. It uses the supplied tenant models, subdomain, and saved
  bot. The authenticated Telegram webhook controller invokes this handler.
- `POST /telegram/receive/:_id` validates the update envelope and forwards new
  `message` updates to the private-text receiver. Other event types and valid
  unsupported messages receive `200` without persistence. Supported messages
  receive `200` after the receiver completes; Zod failures receive `400`, and
  other processing failures receive a generic `500` response.
- Saved Telegram bot metadata includes optional `erxesApiId`, the linked
  Frontline integration ID. It is nullable in GraphQL; unconnected bots omit it
  in storage.
- `TelegramBots.attachIntegration(_id, integrationId)` links an unconnected bot
  to an existing `telegram-messenger` integration in the supplied tenant. It
  rejects missing records, repeated connections, and reused integrations, and
  returns the updated bot without selecting credentials. The external
  integration creation flow invokes it through the Telegram creation adapter.
- The internal `telegramCreateIntegrations` adapter validates the
  `telegram-messenger` kind and a strict setup payload containing `sourceBotId`,
  resolves tenant models, and attaches the saved bot to the supplied integration.
  The `telegram` dispatcher case invokes it from the existing external
  integration mutation. It returns `{ status: 'success' }` or throws so the
  common creation flow rolls back the new integration on attachment failure.
- `TelegramBots.getWebhookInfo(_id)` reads webhook status with the saved bot's
  token. It returns provider information without changing the bot record or
  webhook configuration.
- `telegramBotWebhookInfo(_id)` exposes that status after checking
  `integrationsEdit`. It returns camel-case fields and converts provider error
  timestamps from Unix seconds into GraphQL `Date` values.
- Exposes `telegramBots` and `telegramBot(_id)` for reading saved bots after
  checking `showIntegrations`. Lists are ordered newest first; both queries
  return public metadata from the tenant's database without calling Telegram.
- `TelegramBots.createBot({ token, createdBy })` verifies the token before
  saving the provider's bot identity, capability flags, verification time, and
  a generated webhook secret. It rejects duplicate bot identities and returns
  the saved record without credentials.
- Exposes `telegramAddBot` through the federated GraphQL schema. The resolver
  checks `integrationsAdd` and takes `createdBy` from the authenticated user.
  Creation saves the bot record. The external integration mutation can link
  that saved bot to an inbox integration. The HTTP receiving route is mounted;
  provider webhook registration and a Telegram connection UI are not implemented
  yet.
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
- Converts an inbox conversation into a ticket (created here), a deal (created
  by `sales` over tRPC) or a task (created by `operation` over tRPC), relates the
  new item to the conversation and its customer, and refuses a second item of
  the same kind for one conversation.
- Read-only inbox, integration, and form-submission tRPC procedures are
  exposed to AI agents through `/agent-tools/manifest` and `/agent-tools/call`
  via `.meta(agentMeta(...))` annotations; every other procedure remains
  invisible to agents.
- Contributes permissions, notifications, segments, references, and
  import/export handlers to the platform through `meta/`.
- `widgetsMessengerConnect` stores messenger `companyData` on the core company
  as both `propertiesData` (keys matching a `core:company` field) and
  `trackedData` (every remaining key). The company is matched by `name`, then
  `email`, then `phone` — one `companies.findOne` query per selector, stopping
  at the first hit — so a repeat connect updates the existing company instead
  of creating a duplicate.

## Architecture

| Area                 | Path                                                                        | Responsibility                                                                                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Bootstrap            | `src/main.ts`                                                               | `startPlugin({ name: 'frontline', port: 3304 })`, wires tRPC, routes, meta, and every surface                                                                                                          |
| Models               | `src/connectionResolvers.ts`                                                | Per-subdomain model container for all modules                                                                                                                                                          |
| GraphQL              | `src/apollo/`                                                               | Aggregated `typeDefs` and `resolvers` across modules                                                                                                                                                   |
| tRPC                 | `src/init-trpc.ts`                                                          | `appRouter` for service-to-service calls                                                                                                                                                               |
| Agent tool metadata  | `src/trpc/agentMeta.ts`                                                     | Local `agentMeta` helper for agent-callable tRPC annotations                                                                                                                                           |
| HTTP                 | `src/routes.ts`                                                             | Mounts the `/facebook`, `/instagram`, `/mail`, `/telegram`, and (when enabled) `/callpro` webhook routers                                                                                                           |
| Platform extensions  | `src/meta/`                                                                 | automations, permissions, notifications, segments, references, import/export                                                                                                                           |
| Channels             | `src/modules/channel/`                                                      | Channel + ChannelMember models, schema, resolvers, role checks                                                                                                                                         |
| Inbox                | `src/modules/inbox/`                                                        | Conversations, messages, integrations, widget/clientportal schemas, `receiveInboxMessage`                                                                                                              |
| Conversation queries | `src/conversationQueryBuilder.ts`, `src/modules/inbox/conversationUtils.ts` | Mongo and Elasticsearch conversation filters (membership-scoped)                                                                                                                                       |
| Integrations         | `src/modules/integrations/<kind>/`                                          | facebook, instagram, mail, discord, call, callpro, trpc                                                                                                                                                |
| Telegram setup       | `src/modules/integrations/telegram/`                                        | Bot API client for identity and webhook status, permission-checked validation and saved-bot queries, creation mutation, bot schema and model, webhook secret comparison, internal creation adapter |
| Telegram customers   | `src/modules/integrations/telegram/@types/customers.ts`, `src/modules/integrations/telegram/db/` | Customer identity mapping interface, schema, and model loader |
| Telegram persistence | `src/modules/integrations/telegram/controller/store.ts` | Local customer, conversation, and message insert/reuse; Core customer and inbox conversation/message creation through the bridge; conditional linking with bounded waits |
| Telegram receiver | `src/modules/integrations/telegram/controller/receiveMessage.ts` | Validates and filters provider messages, then resolves the customer, conversation, and inbox message in order |
| Telegram webhook | `src/modules/integrations/telegram/routes.ts`, `src/modules/integrations/telegram/controller/webhook.ts` | Authenticated HTTP ingestion, update dispatch, and acknowledgment after processing |
| Telegram conversations | `src/modules/integrations/telegram/@types/conversations.ts`, `src/modules/integrations/telegram/db/` | Conversation mapping interface, schema, and model loader |
| Telegram messages | `src/modules/integrations/telegram/@types/conversationMessages.ts`, `src/modules/integrations/telegram/db/` | Message mapping interface, schema, and model loader |
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
| Conversation convert | `src/modules/inbox/services/conversationConvert{,Targets}.ts`               | Conversion orchestration and relations; one handler per target (permission, existing-item lookup, URL, create)                                                                                         |
| Forms                | `src/modules/form/`                                                         | Forms, fields, submissions                                                                                                                                                                             |
| Surveys              | `src/modules/survey/`                                                       | Survey definitions, vote ledger, message snapshot, tally refresh                                                                                                                                       |

> > > > > > > f367b4a36cb66a9d80ba39450bef5cd15fd95d21
> > > > > > > | Survey ticket automation | `src/modules/survey/ticketAutomation.ts` | Threshold evaluation, atomic single-ticket claim, ticket creation |
> > > > > > > | Knowledge base | `src/modules/knowledgebase/` | Topics, categories, articles, AI knowledge source |
> > > > > > > | Help center | `src/modules/helpcenter/` | Client portal configs: general settings and appearance for a published help center |
> > > > > > > | Reports | `src/modules/reports/` | Inbox/ticket report aggregations, `buildTicketMatch`, and the saved `ReportCharts` model |
> > > > > > > | Migrations | `src/migrations/` | Plugin-owned data migrations |

## Contracts

### Provides

- `POST /telegram/receive/:_id` — the route parameter is the tenant's saved bot
  record ID. Requires the matching `X-Telegram-Bot-Api-Secret-Token` header;
  responds with `401` for rejected credentials, `400` for Zod validation
  failures, `500` for other processing failures, and `200` after processing or
  intentionally skipping an update. Provider webhook registration is separate.
- `integrationsCreateExternalIntegration` accepts `kind: "telegram-messenger"`
  and `data: { sourceBotId }` to link a saved bot to the newly created inbox
  integration. `sourceBotId` is the saved erxes record ID. Omitting `channelId`
  uses the caller's personal channel. This path retains the common resolver's
  existing channel checks and, like Discord creation, has no explicit
  `integrationsAdd` action check.
- `telegramValidateToken(token: String!): TelegramTokenValidation!` — checks
  credentials for integration setup. Successful results include a string bot ID,
  bot name, and optional username and group settings; failed checks return
  `valid: false` with an error. Permission failures remain GraphQL errors.
- `telegramAddBot(token: String!): TelegramBot!` — creates a tenant-owned bot
  after checking `integrationsAdd`. Returns the erxes record ID, Telegram
  identity, optional group settings, verification time, timestamps, and creator.
  The only input is the token; credentials are excluded from `TelegramBot`.
  Permission, validation, and duplicate failures are GraphQL errors.
- `telegramBots: [TelegramBot!]!` — lists the tenant's saved bots newest first;
  returns an empty array when none are saved. Requires `showIntegrations`.
- `telegramBot(_id: String!): TelegramBot!` — reads a saved bot by its erxes
  record ID after checking `showIntegrations`; a missing bot is a GraphQL error.
  Both read queries use the public `TelegramBot` type and exclude credentials.
- `TelegramBot.erxesApiId: String` — the linked Frontline integration ID, or
  `null` when the saved bot has no integration link.
- `telegramBotWebhookInfo(_id: String!): TelegramWebhookInfo!` — reads the saved
  bot's current provider webhook status after checking `integrationsEdit`.
  Returns URL, certificate flag, pending update count, and optional IP address,
  error dates/message, connection limit, and allowed update kinds. Absent optional
  fields become `null`; permission, missing-bot, and provider failures are GraphQL
  errors. The token and webhook secret are not fields of this response type.
- Plugin meta `properties` (`src/meta/properties.ts`) — the `conversation` and
  `ticket` property types, each with the `systemFields` (`code`, `name`, `type`)
  core lists as the read-only "Basic information" group in Settings →
  Properties. A `code` must name a real field on the record; core-api reads
  this meta once per process, so a changed list shows after core-api restarts.

### Consumes

- Telegram Bot API `GET /bot<token>/getMe` and
  `GET /bot<token>/getWebhookInfo` — a shared request helper validates token
  syntax, limits requests to ten seconds, rejects redirects, and replaces raw
  transport and response errors with controlled messages. Each client validates
  its response with Zod; an empty webhook URL is a valid unconfigured state.
- Telegram customer creation uses the Frontline-local `receiveInboxMessage`
  action `get-create-update-customer`, which reaches Core through its published
  customer procedures. The adapter passes the integration ID and sender names;
  it does not supply an email or phone for matching existing Core customers.
- Telegram inbox conversation creation uses the Frontline-local
  `receiveInboxMessage` action `create-or-update-conversation` without an
  existing `conversationId`. The adapter supplies `createdAt` from the mapping's
  source timestamp; the inbox model uses it for both initial timestamps.
- Telegram inbox message creation uses the Frontline-local `receiveInboxMessage`
  action `create-conversation-message` with `metaInfo: 'replaceContent'`. This
  action stores the inbox message, updates its conversation, and publishes the
  existing inbox realtime events; the adapter returns its validated message ID.
- `core` over tRPC — `companies.findOne` (query), `companies.createCompany` and
  `companies.updateCompany` (mutations, `{ _id, doc }` / `{ doc }`),
  `customers.createMessengerCustomer` / `updateMessengerCustomer`,
  `conformity.create`, and `fields.generatePropertiesData`, which splits
  messenger `companyData` into `propertiesData` for keys that match a Core
  `core:company` field and `trackedData` for every remaining key.
- `automations` over tRPC — `automations.trigger`. The path is
  `automations.trigger`, not `triggers.trigger`; `sendTRPCMessage` swallows a
  wrong path or a query/mutation mismatch and returns `defaultValue`, so a
  typo here fails silently.

## Data and State

- `src/connectionResolvers.ts` supplies the plugin's per-subdomain model container.
- `src/modules/integrations/telegram/@types/bot.ts` defines the Telegram bot
  record interface and a document interface extending Mongoose `Document`:
  bot identity, credentials, group settings, verification time, timestamps,
  creator, and optional `erxesApiId` integration link. The document interface
  declares the erxes `_id`;
  `ITelegramBotCreateInput` accepts only `token` and `createdBy`.
- `src/modules/integrations/telegram/db/definitions/bots.ts` defines the bot
  schema with generated string IDs, a unique `botId` index, immutable bot and
  creator IDs, and automatic timestamps. A unique sparse `erxesApiId` index
  prevents multiple bot records from linking to the same integration while
  allowing multiple bots without a link. `token` and `webhookSecret` are
  excluded from queries by default.
- `src/modules/integrations/telegram/db/models/Bots.ts` defines
  `ITelegramBotModel` and `loadTelegramBotClass(models)`. `src/connectionResolvers.ts`
  registers the loader as `models.TelegramBots` with model name `telegram_bots`.
  `getBot` looks up the erxes `_id`; `botId` is the separate Telegram identity.
- `src/modules/integrations/telegram/@types/customers.ts`,
  `db/definitions/customers.ts`, and `db/models/Customers.ts` define the customer
  mapping document, schema, and `loadTelegramCustomerClass(models)`.
  `src/connectionResolvers.ts` registers `TelegramCustomers` as
  `customers_telegram`. Each mapping has a generated string `_id`, required
  unique string `userId`, required `integrationId`, optional name and username,
  and optional `erxesApiId` linking to the Core customer.
- `src/modules/integrations/telegram/@types/conversations.ts`,
  `src/modules/integrations/telegram/db/definitions/conversations.ts`, and
  `src/modules/integrations/telegram/db/models/Conversations.ts` define the
  conversation mapping and `loadTelegramConversationClass(models)`.
  `src/connectionResolvers.ts` registers `TelegramConversations` as
  `conversations_telegram`. A unique compound index covers `integrationId`,
  string `chatId`, and `messageThreadId`. The thread defaults to `0` and must be
  a nonnegative safe integer. Records also hold the chat type, optional title,
  required `timestamp`, content defaulting to an empty string, and optional
  `erxesApiId` linking to a Frontline inbox conversation.
- `src/modules/integrations/telegram/@types/conversationMessages.ts`,
  `src/modules/integrations/telegram/db/definitions/conversationMessages.ts`,
  and `src/modules/integrations/telegram/db/models/ConversationMessages.ts`
  define the message mapping and `loadTelegramConversationMessageClass(models)`.
  `src/connectionResolvers.ts` registers `TelegramConversationMessages` as
  `conversation_messages_telegram`. Records require string `integrationId`,
  `chatId`, `messageId`, and `conversationId`, plus `createdAt`. Content defaults
  to an empty string. Optional fields hold the inbox message link, edit time,
  Core customer ID, staff user ID, and attachments using the shared schema.
- `getBots(filter)` accepts a typed Mongoose filter and returns bot documents
  sorted by descending `createdAt`, retaining the default credential projection.
- `attachIntegration` checks the destination through `models.Integrations`,
  then conditionally updates the bot only while `erxesApiId` is absent. A
  nonmatching update distinguishes an unknown bot from an existing connection;
  duplicate integration links and other update failures return controlled errors.
- `verifyWebhookSecret` skips database access for missing inputs, explicitly
  selects `+webhookSecret`, and returns only the comparison result. It does not
  select the bot token, call Telegram, or modify the record. Database failures
  propagate to the caller.
- `getWebhookInfo(_id)` explicitly selects `+token` from the supplied tenant's
  bot model and passes it to the provider client. A missing bot throws before
  any provider request; the return value contains webhook information rather
  than the credential-bearing database document.
- `src/modules/integrations/telegram/@types/webhook.ts` defines
  `ITelegramWebhook`, the camel-case query response with optional `Date` values.
  It is a plain interface, not a persisted model or Mongoose document.
- `createBot` stores a fresh 32-byte random secret encoded as hex. It reads the
  inserted record through `getBot` so the result uses the schema's default
  credential projection; the direct result of `create` still contains secrets.
- Telegram token validation does not persist credentials or integration records.

## Local Invariants

- Check `integrationsAdd` before token validation or bot creation; keep permission
  checks outside the handler that converts provider failures into validation results.
- Check `showIntegrations` before either saved-bot metadata query accesses tenant
  models. `telegramBots` and `telegramBot` must not request credentials or contact
  Telegram.
- Telegram credentials must not appear in public API results or raw error messages.
  Reject surrounding whitespace instead of silently rewriting a pasted token.
- Telegram webhook secret comparison must reject empty values and check byte
  lengths before calling `timingSafeEqual`; compare the received value exactly
  without trimming or normalizing it.
- Telegram webhook authentication must resolve models from `getSubdomain(req)`
  and interpret the `_id` route parameter as the erxes bot record ID. Reject
  missing credentials before model initialization, keep error responses generic,
  and pass successful requests onward without acknowledging their payloads.
- Mount Telegram authentication before its webhook controller. Dispatch only
  the envelope's new `message` field, and resolve the saved bot through the same
  request subdomain. Await the receiver before acknowledging supported messages;
  unsupported event types may be acknowledged immediately after authentication
  and envelope validation. Never expose raw processing errors in HTTP responses.
- Keep Telegram supporting utilities in `src/modules/integrations/telegram/utils/`.
  `utils/update.ts` defines the Zod envelope schema and inferred `TelegramUpdate`
  type. Treat preserved event fields as unknown until their handler validates
  them; envelope validation alone does not make an event safe to process.
- `utils/message.ts` defines `telegramMessageSchema` and its inferred
  `TelegramMessage` type. Keep provider payload validation separate from
  persisted document types. Preserve optional senders/text and signed chat IDs;
  accepting message metadata does not implement media or message delivery.
- `receiveTelegramMessage` processes private text from a present human sender
  only. Ignore chat senders, blank or absent text, zero message IDs, and topic,
  thread, business, or guest contexts before persistence. Trimming checks
  emptiness without rewriting text. The caller supplies the authenticated bot
  and tenant context; the receiver is not an HTTP authentication boundary.
  Await customer and conversation linkage before creating or reusing a message,
  and let failures propagate to the caller.
- The `client.ts` types `TelegramBot` and `TelegramWebhookInfo` describe
  validated provider responses. Keep them separate from the saved-record types
  `ITelegramBot` and `ITelegramBotDocument` and the mapped query response
  `ITelegramWebhook`. Only persisted records need Mongoose document interfaces.
- Keep `token` and `webhookSecret` out of the `TelegramBot` GraphQL type.
  `telegramAddBot` must derive `createdBy` from request context, never an argument.
- An unconnected bot must omit `erxesApiId` in MongoDB; do not store an empty
  string or `null` as its unconnected value. `botId` identifies the Telegram
  bot; `erxesApiId` identifies the Frontline integration.
- Keep the missing-link condition inside the attachment update filter so
  concurrent requests cannot overwrite a connection. Check the destination's
  `telegram-messenger` kind through the supplied tenant's integration model.
  The attachment method only links records; the external creation flow owns
  integration creation and rollback.
- `telegramCreateIntegrations` treats parsed setup JSON as unknown and validates
  it before resolving tenant models. `sourceBotId` is the saved bot's erxes
  `_id`; accept no token or extra setup fields. Propagate attachment failures to
  the caller, which owns integration creation and rollback.
- Backend queries must explicitly select any Telegram credential fields they
  need; `select: false` controls query projection and does not encrypt storage.
- Callers of `TelegramBots.getWebhookInfo` must enforce integration permissions
  before loading credentials. The method must use the supplied tenant model,
  preserve stored verification timestamps, and return only provider information.
- `telegramBotWebhookInfo` must check `integrationsEdit` before invoking the
  model. Map optional Unix timestamps by testing for `undefined`, so a zero
  timestamp remains valid, and expose the update list as `allowedUpdates`.
- Keep Telegram bot model registration consistent with the other integrations:
  use the document interface, model interface, and class loader. The model
  loader imports the schema and uses the supplied tenant model container.
- Telegram customer identity is unique by `userId` within each tenant, across
  its integrations. Customer mappings use the supplied tenant model container;
  their `erxesApiId` refers to a Core customer, while `integrationId` records the
  originating Frontline integration. The mapping does not own the Core record.
- Local customer lookup uses `$setOnInsert` with the unique `userId` index;
  repeated messages must not overwrite an existing profile, originating
  integration, or Core link. `created` reports insertion by this invocation,
  not whether a Core contact exists. Only a MongoDB duplicate-key error on
  `userId` is handled as a concurrent insert; other database failures propagate.
- `createCoreCustomer` requires an already-validated, present Telegram sender
  and a linked Frontline integration ID. Forward the same request's subdomain
  through the inbox bridge and validate its returned `_id` before using it.
  This adapter creates a Core contact; it does not itself prevent repeated
  calls from creating multiple contacts for the same Telegram sender.
- `getOrCreateCustomer` must return only after observing a nonempty Core link.
  Existing unlinked mappings are reread after 250, 500, 750, and 1000 ms before
  attempting recovery. Write the link only while `erxesApiId` is null or absent,
  and adopt a competing saved link when the conditional write loses. These
  waits do not make Core creation idempotent: simultaneous recovery, slow Core
  calls, or a failed link write can leave an extra Core contact. Do not claim
  exactly-once contact creation or delete a mapping as generic error cleanup.
- Identify a Telegram conversation from message metadata using the integration,
  chat, and topic together within the supplied tenant. Store an absent topic as
  `messageThreadId: 0`; keep this internal default separate from outbound API
  parameters. Conversation `erxesApiId` refers to the Frontline inbox
  conversation and may be absent until linked. Metadata storage does not imply
  that webhook delivery or group/topic handling is implemented.
- `getOrCreateTelegramConversation` uses `$setOnInsert` with the full unique
  identity and preserves existing content, timestamp, chat metadata, and inbox
  link during lookup. Only a duplicate-key error on all three identity fields
  is adopted as a concurrent insert winner. `created` describes this local
  insertion, not inbox creation; failures from writes and rereads propagate.
- Call `createInboxConversation` only when creating the inbox record for an
  unlinked Telegram mapping, with the same tenant context and a Core customer
  ID. The returned `_id` identifies the Frontline inbox conversation. Validate
  that response before linking; creation alone is not idempotent, and the
  caller owns saving the link and coordinating competing requests.
- `getOrCreateConversation` requires `customer.erxesApiId` before model access
  and returns only after observing a nonempty inbox link. Existing unlinked
  mappings are reread after 250, 500, 750, and 1000 ms before recovery. Claim
  only null or absent links and adopt a competing saved link; propagate bridge,
  response-validation, database, and missing-row failures without deleting
  mappings. These waits are not a lock: simultaneous recovery, slow inbox
  creation, or a failed link write can leave an extra inbox conversation.
- Identify a Telegram message mapping by `integrationId`, `chatId`, and
  `messageId` together within the supplied tenant. Its `conversationId` refers
  to the local Telegram conversation mapping; its optional `erxesApiId` refers
  to the Frontline inbox message. `customerId` is a Core customer ID and
  `userId` is an erxes staff user ID. The unique index prevents duplicate local
  mappings; it does not make later writes to inbox records atomic or implement
  webhook retry handling.
- `getOrCreateTelegramMessage` uses `$setOnInsert` and returns `{ message,
  created }`. Preserve existing content, timestamps, customer/conversation IDs,
  and inbox links during lookup. Recover only a MongoDB duplicate-key error
  whose index pattern includes all three message identity fields; propagate
  other write failures and failed rereads. A reused local message without an
  inbox link must not be treated as successfully delivered.
- `createInboxMessage` takes the Frontline inbox conversation ID separately
  from the local message mapping. Do not forward the mapping's `conversationId`
  as the inbox destination. Preserve stored content, Core customer ID, source
  creation time, and attachments. The caller owns link persistence and retry
  coordination; repeated creation calls can create additional inbox messages,
  including when a bridge call fails after a partial write.
- `getOrCreateMessage` requires nonempty customer and conversation links before
  model access. It rereads existing unlinked mappings after 250, 500, 750, and
  1000 ms before recovery, claims only null or absent message links, and returns
  only after observing a saved inbox message ID. Do not delete mappings as
  error cleanup. Bounded waits do not guarantee exactly-once inbox delivery:
  slow creation, simultaneous recovery, partial bridge writes, or failed link
  writes can create additional inbox messages even when one local link wins.
- Callers of `TelegramBots.createBot` must enforce permissions and supply
  `createdBy` from the authenticated user. Derive bot identity and capabilities
  from `getMe`; reject duplicate identities without replacing saved credentials.
  Return controlled storage errors rather than raw database error details.
- Expose Telegram bot IDs as strings in GraphQL. Preserve absent optional
  capability fields separately from explicit `false` values.

## Validation

- `pnpm nx lint frontline_api`
- `pnpm nx build frontline_api`
- `pnpm exec eslint backend/plugins/frontline_api/src/modules/integrations/telegram backend/plugins/frontline_api/src/routes.ts --max-warnings=0`
- `pnpm exec prettier --check backend/plugins/frontline_api/src/modules/integrations/telegram backend/plugins/frontline_api/src/routes.ts`
- The project currently has no Nx test target.
- Telegram route checks: mount the real Frontline router with unrelated
  integration routers stubbed, and use isolated HTTP requests with stubbed tenant
  models and persistence. Verify authentication before processing, tenant
  forwarding, malformed payload rejection, unsupported-update acknowledgment,
  generic failure responses, and no success response before persistence finishes.
  These checks must not register a webhook or write live inbox records.
- Telegram receiver checks: use the actual message validator with stubbed
  persistence coordinators. Verify sequential dependencies, tenant forwarding,
  unchanged text, no writes for unsupported messages or malformed payloads,
  rejection of an unlinked bot for supported text, and propagation of each
  coordinator's failure without calling later coordinators.
- Telegram customer adapter checks: stub the inbox bridge, verify tenant and
  profile forwarding, optional last names, a single call per invocation, and
  a string ID result. Reject bridge errors and success data with a missing,
  empty, or nonstring ID; propagate thrown failures without creating live contacts.
- Telegram customer lookup checks: verify first insertion, repeat lookup,
  preserved profile/integration/Core links, optional names, distinct senders,
  tenant isolation, required fields, and exact string storage of large safe
  provider IDs. Concurrent first messages must yield one mapping and one
  `created: true`; only a duplicate on `userId` is recoverable. Stub the inbox
  bridge to confirm lookup never calls Core; clean up isolated test databases.
- Telegram customer linking checks: use isolated tenant databases and a stubbed
  Core bridge to verify first linking, existing-link reuse across integrations,
  concurrent first messages with a timely Core response, recovery of unlinked
  and null-linked mappings, and adoption of a late competing link. Exercise
  malformed Core data, transport errors, database failures, and missing rows;
  assert that failures propagate and do not delete mappings. Verify the known
  extra-contact risk during simultaneous recovery or after a failed link write.
- Telegram message model checks: verify saved defaults, required fields,
  shared attachment validation, optional inbox/customer/staff links, and
  `getMessage` lookups and missing-record errors. Reject duplicate identities,
  including concurrent inserts and attempts under another local conversation;
  allow different chats, integrations, messages, and tenant databases.
- Telegram message lookup checks: verify initial field mapping, unchanged
  records on repeat delivery, concurrent insertion ownership, and isolation
  across chats, integrations, and tenant databases. Check signed safe chat
  IDs and omitted text. Adopt only a duplicate on the expected compound index;
  reject other indexes, incomplete index patterns, nonduplicate failures, and
  missing winners. A failed reread must leave the insert available for retry.
  Use isolated databases and confirm that lookup never calls the inbox bridge.
- Telegram inbox message adapter checks: stub the bridge and verify exact
  tenant, action, preview flag, supplied inbox conversation ID, and stored
  message fields. Preserve empty text, omitted/empty attachments, and the local
  mapping. Return only the validated message ID; reject structured or thrown
  bridge failures and malformed success data without additional creation calls.
  These checks must not create live inbox records or call Telegram.
- Telegram message linking checks: use isolated tenant databases and a stubbed
  inbox bridge. Reject missing prerequisite links before writes; verify first
  linking, immediate reuse, concurrent first calls with a timely response,
  null/absent-link recovery, final-wait completion, and late competing links.
  Propagate bridge, response-validation, link-write, and missing-row failures
  while retaining retryable mappings. Verify tenant isolation and reproduce
  the extra-inbox-message risk during simultaneous recovery.
- Telegram conversation model checks: verify lookups, missing-record errors,
  optional inbox links, required fields, and content/topic defaults. Reject
  negative, fractional, unsafe, or null thread IDs. Duplicate compound
  identities, including concurrent inserts and absent versus explicit zero
  topics, must fail; different integrations, chats, topics, and tenants must
  remain independent.
- Telegram conversation lookup checks: verify initial field mapping, repeat
  reuse, preserved metadata and inbox links, absent versus zero topics, and
  separation by integration, chat, topic, and tenant database. Concurrent first
  messages must produce one mapping and one `created: true`. Check signed safe
  chat IDs, absent optional fields, rejected invalid inserts, exact duplicate
  index handling, and retry after a failed reread. The inbox bridge must not be
  called; use isolated databases and clean them up after checks.
- Telegram inbox creation adapter checks: stub the inbox bridge and verify
  exact tenant, integration, Core customer, preview, and `createdAt` forwarding
  in one creation request. Preserve empty previews and the supplied mapping.
  Reject bridge failures and malformed success IDs, return only the validated
  ID, and verify that shared response validation still works for Core customer
  creation. These checks must not create live inbox records.
- Telegram conversation linking checks: use isolated tenant databases and a
  stubbed inbox bridge. Reject an unlinked customer before writes; verify first
  linking, immediate reuse, concurrent first calls with a timely bridge
  response, null/absent-link recovery, and completion on the final wait.
  Preserve a late competing link and propagate malformed responses, bridge
  failures, failed link writes, and missing rows. Keep retryable mappings and
  verify tenant isolation plus the extra-record risk during simultaneous recovery.
- Telegram customer model checks: look up mappings by provider user ID and
  erxes record ID, reject missing records and missing required IDs, and allow
  an absent Core link. Verify that the unique user ID index rejects concurrent
  duplicates within a tenant while separate tenant databases remain isolated.
- Telegram message checks: accept private, group, channel-sender, and topic
  payloads, omitted optional fields, zero message IDs, and large safe IDs.
  Reject malformed metadata and unsafe or fractional IDs. Preserve unvalidated
  extra fields on the message, chat, and sender without treating them as typed.
- Telegram dispatch checks: the external integration mutation passes the tenant,
  new integration ID, and saved-bot ID to the adapter. A failed attachment rolls
  back only the integration created by that request; a successful attachment
  preserves it. Existing provider dispatch and personal-channel checks remain
  intact.
- Telegram creation adapter checks: invalid kinds, malformed JSON, and invalid
  or extra setup fields fail before model access. Forward the supplied subdomain,
  bot ID, and integration ID unchanged; return success only after attachment and
  propagate model initialization or attachment failures.
- Telegram link metadata check: the bot schema declares a unique sparse
  `erxesApiId` index, existing unconnected bots remain valid, and the running
  Frontline and gateway schemas expose the link as nullable `String` without
  exposing credential fields.
- Telegram attachment checks: reject missing IDs, unknown bots/integrations,
  and non-Telegram destinations. Verify successful linking, credential
  exclusion, rejection of reassignment and reused integrations, and both
  concurrent claims for one bot and competing bots for one integration. Use
  isolated test records; preserve the supplied tenant model and return
  controlled update errors.
- Telegram webhook secret checks: accept matching nonempty secrets; reject
  missing, empty, differing, or whitespace-altered values. Differing UTF-8 byte
  lengths must return `false` without throwing.
- Saved-bot secret checks: reject unknown bots and missing inputs; verify against
  the supplied tenant model only. Select the hidden webhook secret explicitly,
  return a boolean without credentials, and propagate database failures.
- Telegram middleware checks: verify `401` for missing or rejected credentials,
  `500` for model or verification failures, and exactly one `next()` call only
  after successful verification. Preserve the received secret and route tenant
  into model generation; authentication must not read or acknowledge the body.
- Telegram update checks: preserve accompanying event fields for valid update
  IDs; reject non-object inputs and missing, string, boolean, fractional,
  negative, non-finite, or unsafe IDs. Zero is accepted by the envelope schema.
- Telegram smoke scenario: a signed-in user with `integrationsAdd` validates a
  real bot token through the gateway and receives the bot identity and group
  settings. A rejected token returns `valid: false`; permission denial remains a
  GraphQL error and prevents the provider request.
- Telegram client checks: both read methods reject malformed tokens before
  requesting Telegram and return controlled errors for transport, HTTP, JSON,
  and response-schema failures. Webhook status accepts an empty URL and zero
  pending updates, preserves optional delivery details, and rejects negative or
  fractional counts. Read a test bot's identity and webhook status without
  printing credentials, changing its webhook, or consuming pending updates.
- Telegram model checks: successful creation returns provider-derived metadata
  without credentials; duplicate creation preserves the original record;
  missing creators and rejected tokens prevent writes; storage errors do not
  expose credentials. Verify absent capability fields separately from `false`.
- Saved-bot webhook checks: `getWebhookInfo` uses the stored token while ordinary
  reads still exclude credentials; a missing bot prevents the provider call,
  provider errors remain controlled, and saved timestamps remain unchanged.
- Webhook query smoke scenario: a signed-in user with `integrationsEdit` calls
  `telegramBotWebhookInfo` through the gateway using the saved bot's erxes ID.
  Verify empty URLs, false/zero values, optional `null` fields, update lists, and
  ISO date serialization. Permission denial must prevent model access; querying
  `token` or `webhookSecret` must fail GraphQL validation.
- Telegram creation smoke scenario: call `telegramAddBot` through the gateway
  while signed in with `integrationsAdd`; verify the returned record ID and bot
  identity. Repeating creation must reject the duplicate without replacing its
  credentials. Permission denial and invalid input must prevent creation;
  selecting credential fields or supplying `createdBy` must fail GraphQL validation.
- Telegram read smoke scenario: a user with `showIntegrations` can list saved
  bots and retrieve one by erxes `_id`; the list is newest first, a missing bot
  returns an error, and neither query exposes credentials or calls Telegram.
  Permission denial must prevent model access.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-10-05` — Telegram webhook route

- **Summary:** Connected secret-authenticated HTTP updates to the private-text receiver with validation, awaited processing, and controlled responses.
- **Affected areas:** `src/routes.ts`, `src/modules/integrations/telegram/routes.ts`, `src/modules/integrations/telegram/controller/webhook.ts`.
- **Contracts changed:** Added `POST /telegram/receive/:_id`; provider webhook registration remains separate.

### `2026-10-05` — Telegram private text receiver

- **Summary:** Added validation and filtering for ordinary private human text, followed by customer, conversation, and inbox-message linkage.
- **Affected areas:** `src/modules/integrations/telegram/controller/receiveMessage.ts`.
- **Contracts changed:** Added internal `receiveTelegramMessage({ models, subdomain, bot, payload })`; unsupported messages return `null`, while validation and persistence failures propagate. HTTP routing is not yet connected.

### `2026-10-05` — Telegram message inbox linking

- **Summary:** Added message lookup-and-link coordination with bounded waits, retryable unlinked mappings, and conditional link preservation.
- **Affected areas:** `src/modules/integrations/telegram/controller/store.ts`.
- **Contracts changed:** Added internal `getOrCreateMessage(models, subdomain, conversation, message, customer)`; no public API or webhook route invokes it yet.

### `2026-10-04` — Telegram inbox message creation adapter

- **Summary:** Added inbox message creation through the existing bridge, preserving stored message fields and validating the returned ID.
- **Affected areas:** `src/modules/integrations/telegram/controller/store.ts`.
- **Contracts changed:** Added internal `createInboxMessage(subdomain, inboxConversationId, message)`; link persistence and webhook routing remain separate.

### `2026-10-04` — Telegram message mapping lookup

- **Summary:** Added atomic message insert/reuse with insertion ownership and preservation of existing content and inbox links.
- **Affected areas:** `src/modules/integrations/telegram/controller/store.ts`.
- **Contracts changed:** Added internal `getOrCreateTelegramMessage(models, conversation, message, customerId)`; inbox delivery and webhook routing remain separate.

### `2026-10-04` — Telegram conversation inbox linking

- **Summary:** Added conversation lookup-and-link coordination with bounded waits, retryable unlinked mappings, and conditional link preservation.
- **Affected areas:** `src/modules/integrations/telegram/controller/store.ts`.
- **Contracts changed:** Added internal `getOrCreateConversation(models, subdomain, integrationId, message, customer)`; no public API or webhook route invokes it yet.

### `2026-10-04` — Telegram inbox conversation creation adapter

- **Summary:** Added typed inbox conversation creation through the existing bridge, preserving source time and validating the returned ID.
- **Affected areas:** `src/modules/integrations/telegram/controller/store.ts`.
- **Contracts changed:** Added internal `createInboxConversation(subdomain, conversation, customerId)`; no public API or webhook route invokes it yet.

### `2026-10-04` — Telegram conversation mapping lookup

- **Summary:** Added atomic local conversation insert/reuse using integration, chat, and topic identity while preserving existing metadata and inbox links.
- **Affected areas:** `src/modules/integrations/telegram/controller/store.ts`.
- **Contracts changed:** Added internal `getOrCreateTelegramConversation(models, integrationId, message)` returning `{ conversation, created }`; inbox creation and webhook delivery remain separate.

### `2026-10-04` — Telegram customer Core linking

- **Summary:** Added customer lookup-and-link coordination with bounded waits, retryable unlinked mappings, and conditional link preservation.
- **Affected areas:** `src/modules/integrations/telegram/controller/store.ts`.
- **Contracts changed:** Added internal `getOrCreateCustomer(models, subdomain, integrationId, sender)`; no public API or webhook route invokes it yet.

### `2026-10-04` — Telegram customer mapping lookup

- **Summary:** Added atomic local customer insert/reuse with insertion ownership and handling for concurrent sender mappings.
- **Affected areas:** `src/modules/integrations/telegram/controller/store.ts`.
- **Contracts changed:** Added internal `getOrCreateTelegramCustomer(models, integrationId, sender)` returning `{ customer, created }`.
