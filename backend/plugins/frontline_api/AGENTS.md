# `frontline_api` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/frontline_api`
- **Last synchronized:** `2026-09-29`

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
  tenant-scoped bot records.
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
  It does not yet authenticate an HTTP receiver.
- Registers `TelegramBots` on the tenant's database connection. Its
  `getBot(_id)` method returns the saved bot or throws `Telegram bot not found`.
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
  Creation saves the bot record; webhook registration and inbox binding are
  separate integration capabilities that are not implemented yet.
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
| HTTP                 | `src/routes.ts`                                                             | Mounts the `/facebook`, `/instagram`, `/mail`, and (when enabled) `/callpro` webhook routers                                                                                                           |
| Platform extensions  | `src/meta/`                                                                 | automations, permissions, notifications, segments, references, import/export                                                                                                                           |
| Channels             | `src/modules/channel/`                                                      | Channel + ChannelMember models, schema, resolvers, role checks                                                                                                                                         |
| Inbox                | `src/modules/inbox/`                                                        | Conversations, messages, integrations, widget/clientportal schemas, `receiveInboxMessage`                                                                                                              |
| Conversation queries | `src/conversationQueryBuilder.ts`, `src/modules/inbox/conversationUtils.ts` | Mongo and Elasticsearch conversation filters (membership-scoped)                                                                                                                                       |
| Integrations         | `src/modules/integrations/<kind>/`                                          | facebook, instagram, mail, discord, call, callpro, trpc                                                                                                                                                |
| Telegram setup       | `src/modules/integrations/telegram/`                                        | Bot API client for identity and webhook status, permission-checked validation and saved-bot queries, creation mutation, bot schema and model, webhook secret comparison |
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
  and creator. The document interface declares the erxes `_id`;
  `ITelegramBotCreateInput` accepts only `token` and `createdBy`.
- `src/modules/integrations/telegram/db/definitions/bots.ts` defines the bot
  schema with generated string IDs, a unique `botId` index, immutable bot and
  creator IDs, and automatic timestamps. `token` and `webhookSecret` are excluded
  from queries by default.
- `src/modules/integrations/telegram/db/models/Bots.ts` defines
  `ITelegramBotModel` and `loadTelegramBotClass(models)`. `src/connectionResolvers.ts`
  registers the loader as `models.TelegramBots` with model name `telegram_bots`.
  `getBot` looks up the erxes `_id`; `botId` is the separate Telegram identity.
- `getBots(filter)` accepts a typed Mongoose filter and returns bot documents
  sorted by descending `createdAt`, retaining the default credential projection.
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
- The `client.ts` types `TelegramBot` and `TelegramWebhookInfo` describe
  validated provider responses. Keep them separate from the saved-record types
  `ITelegramBot` and `ITelegramBotDocument` and the mapped query response
  `ITelegramWebhook`. Only persisted records need Mongoose document interfaces.
- Keep `token` and `webhookSecret` out of the `TelegramBot` GraphQL type.
  `telegramAddBot` must derive `createdBy` from request context, never an argument.
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
- Callers of `TelegramBots.createBot` must enforce permissions and supply
  `createdBy` from the authenticated user. Derive bot identity and capabilities
  from `getMe`; reject duplicate identities without replacing saved credentials.
  Return controlled storage errors rather than raw database error details.
- Expose Telegram bot IDs as strings in GraphQL. Preserve absent optional
  capability fields separately from explicit `false` values.

## Validation

- `pnpm nx lint frontline_api`
- `pnpm nx build frontline_api`
- `pnpm exec eslint backend/plugins/frontline_api/src/modules/integrations/telegram --max-warnings=0`
- `pnpm exec prettier --check backend/plugins/frontline_api/src/modules/integrations/telegram`
- The project currently has no Nx test target.
- Telegram webhook secret checks: accept matching nonempty secrets; reject
  missing, empty, differing, or whitespace-altered values. Differing UTF-8 byte
  lengths must return `false` without throwing.
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

### `2026-09-29` — Telegram webhook secret comparison

- **Summary:** Added a provider-local helper for exact webhook secret comparison with empty-value and byte-length guards.
- **Affected areas:** `src/modules/integrations/telegram/webhookAuth.ts`.
- **Contracts changed:** Added internal `verifyTelegramWebhookSecret(expectedSecret, receivedSecret?)`; public APIs unchanged.

### `2026-09-29` — Telegram webhook status query

- **Summary:** Exposed saved-bot webhook status through a permission-checked query with camel-case fields and converted error timestamps.
- **Affected areas:** `src/modules/integrations/telegram/@types/webhook.ts`, `src/modules/integrations/telegram/graphql/`.
- **Contracts changed:** Added `TelegramWebhookInfo`, `telegramBotWebhookInfo(_id: String!): TelegramWebhookInfo!`, and internal response interface `ITelegramWebhook`.

### `2026-09-29` — Telegram saved-bot webhook lookup

- **Summary:** Added webhook status lookup by saved bot ID using the tenant's stored credential without modifying the bot or returning its credential fields.
- **Affected areas:** `src/modules/integrations/telegram/db/models/Bots.ts`.
- **Contracts changed:** Added internal `ITelegramBotModel.getWebhookInfo(_id): Promise<TelegramWebhookInfo>`; public APIs unchanged.

### `2026-09-29` — Telegram webhook status client

- **Summary:** Added a read-only webhook status client sharing token validation, timeout, and controlled request errors with bot identity validation.
- **Affected areas:** `src/modules/integrations/telegram/client.ts`.
- **Contracts changed:** Added internal `getTelegramWebhookInfo(token)`, `TelegramWebhookInfo`, and `getTelegramResponse(token, method)` exports; public APIs unchanged.

### `2026-09-29` — Telegram saved-bot queries

- **Summary:** Added permission-checked list and detail queries for saved Telegram bots, returning public metadata from the tenant's database.
- **Affected areas:** `src/modules/integrations/telegram/db/models/Bots.ts`, `src/modules/integrations/telegram/graphql/`.
- **Contracts changed:** Added `telegramBots: [TelegramBot!]!`, `telegramBot(_id: String!): TelegramBot!`, and `ITelegramBotModel.getBots(filter)`.

### `2026-09-29` — Telegram bot creation API

- **Summary:** Exposed permission-checked bot creation through GraphQL, with the authenticated creator and a credential-free return type.
- **Affected areas:** `src/modules/integrations/telegram/graphql/`, `src/apollo/schema/schema.ts`, `src/apollo/resolvers/mutations.ts`.
- **Contracts changed:** Added `TelegramBot` and `telegramAddBot(token: String!): TelegramBot!`.

### `2026-09-28` — Telegram bot creation

- **Summary:** Added internal bot creation that verifies credentials before saving, rejects duplicate identities, and returns the record without secrets.
- **Affected areas:** `src/modules/integrations/telegram/@types/bot.ts`, `src/modules/integrations/telegram/db/models/Bots.ts`.
- **Contracts changed:** Added `ITelegramBotCreateInput` and `IModels.TelegramBots.createBot({ token, createdBy })`; public APIs unchanged.

### `2026-09-28` — Telegram bot storage and model registration

- **Summary:** Registered a tenant-scoped Telegram bot model with lookup by erxes record ID and credentials omitted from ordinary queries.
- **Affected areas:** `src/modules/integrations/telegram/@types/bot.ts`, `src/modules/integrations/telegram/db/definitions/bots.ts`, `src/modules/integrations/telegram/db/models/Bots.ts`, `src/connectionResolvers.ts`.
- **Contracts changed:** Added internal `ITelegramBot`, `ITelegramBotDocument`, `telegramBotSchema`, `ITelegramBotModel`, and `loadTelegramBotClass` exports, plus `IModels.TelegramBots.getBot(_id)`; public APIs unchanged.

### `2026-09-25` — Telegram bot token validation

- **Summary:** Added permission-checked Telegram credential validation with bot identity and group settings.
- **Affected areas:** `src/modules/integrations/telegram/`, `src/apollo/schema/schema.ts`, `src/apollo/resolvers/queries.ts`.
- **Contracts changed:** Added `TelegramTokenValidation` and `telegramValidateToken(token: String!): TelegramTokenValidation!`.

### `2026-09-21` — Messenger company writes actually reach Core

- **Summary:** Every Core call in the company branch of
  `widgetsMessengerConnect` used the wrong tRPC method or input shape, and
  `sendTRPCMessage` swallows the resulting errors, so messenger `companyData`
  silently produced no company at all: `companies.findOne` was called as a
  mutation with `{ query: { companyData } }` (matching no selector key),
  `updateCompany` received `{ query: { _id, doc } }` instead of `{ _id, doc }`,
  `createCompany` was called as a query with `{ query: { ...companyData } }`
  instead of a mutation with `{ doc }`, and the follow-up automation trigger
  used the non-existent `triggers.trigger` path. All four now match the
  published contracts, and lookup cascades name -> email -> phone, so the
  company, its `trackedData`, and the customer-company conformity are written.
- **Affected areas:**
  `src/modules/inbox/graphql/resolvers/mutations/widget.ts`
  (`findMessengerCompany` helper, company branch of
  `widgetsMessengerConnect`).
- **Contracts changed:** None. Consumed contracts corrected: Core
  `companies.findOne` (query), `companies.updateCompany` / `createCompany`
  (mutations), and automations `automations.trigger`.
