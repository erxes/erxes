# `frontline_api` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/frontline_api`
- **Last synchronized:** `2026-10-06`

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
- Telegram bot credential validation, provider webhook status and registration,
  media, replies, edits, polls and observed reactions for private chats, groups, channels and forum topics, and tenant-scoped
  bot records, customer identity mappings, conversation mappings, and message mappings.
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
- Telegram setup verifies/saves bots, attaches them to existing inbox integrations,
  registers or reconnects signed webhooks, reads provider status, refreshes bot
  metadata, replaces same-bot tokens, and disconnects without deleting history.
- Telegram receives `message`, `channel_post` and their edited variants. Text,
  photos, documents, voice/audio/video, animation, video notes, stickers and live
  photos use existing content/attachments. Contacts, locations, venues and dice
  become readable content; unsupported content becomes a visible notice.
- Group/supergroup/channel senders and group/private forum topics are supported.
  Topic names are learned from topic service messages. Edited content replaces the
  same canonical message using the existing subscription; stale edits are rejected.
- Telegram replies reuse the inbox mutation's existing attachment, poll and reply
  fields. Photos/videos, audio-only and document-only batches use native albums;
  other combinations send sequentially. Compatible uploads use native audio,
  voice, video or animation methods. Internal notes stay local.
- Poll results reuse `extraData.poll`; standalone poll updates refresh that card.
  New polls are anonymous regular polls (2–10 answers, 1–168 hours). Reactions are
  observed provider state, including retractions and anonymous count snapshots;
  they require bot admin rights and explicit webhook registration. Outgoing album
  reactions aggregate the parts represented by the canonical bubble.
- Telegram media is downloaded into workspace storage through the public shared
  storage API. Inbound files are bounded at 20 MiB; oversize files become visible
  notices. Outbound files are preflighted with a 50 MiB total reply limit, using
  multipart uploads and a caption on the first file only.
- Telegram inbound message linking uses renewable Mongo leases and deterministic
  inbox IDs to recover webhook retries after partial writes. Outbound provider
  calls are never automatically retried; partial/uncertain sends return explicit
  errors instead of reporting an unconfirmed delivery as successful.
- Telegram group upgrades retain a `migratedToChatId` alias for future replies
  and, when no conversation at the new ID exists, reuse the original history.
  Human senders keep customer identities; anonymous/channel senders do not create
  fake Core contacts. Chat labels are available through a membership-scoped query.
- Telegram link previews read URLs from a stored, visible, non-internal message
  and return the existing inbox embed shape. Metadata fetches are public HTTPS
  only, revalidate and pin DNS through redirects, and cap time, bytes and links.
  Preview failures retain an ordinary clickable link; cached results are scoped
  by tenant and URL. Automatic forum-topic header references do not create false
  quoted-reply cards; explicit quotes remain available.
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
| Telegram setup       | `src/modules/integrations/telegram/`                                        | Bot identity, credentials, lifecycle, signed webhook setup/status, permission-checked GraphQL and integration linking |
| Telegram customers   | `src/modules/integrations/telegram/@types/customers.ts`, `src/modules/integrations/telegram/db/` | Customer identity mapping interface, schema, and model loader |
| Telegram persistence | `src/modules/integrations/telegram/controller/store.ts` | Tenant mapping, deterministic inbox linking, media persistence and renewable message processing leases |
| Telegram updates | `src/modules/integrations/telegram/controller/{sync,polls,reactions,eventLease}.ts` | Ordered edits, poll results and reaction projections onto existing canonical messages |
| Telegram reaction state | `src/modules/integrations/telegram/@types/reactions.ts`, `src/modules/integrations/telegram/db/models/Reactions.ts` | Tenant-scoped actor snapshots and anonymous count snapshots |
| Telegram receiver | `src/modules/integrations/telegram/controller/receiveMessage.ts` | Validates and filters provider messages, then resolves the customer, conversation, and inbox message in order |
| Telegram payloads | `src/modules/integrations/telegram/utils/{message,update,content}.ts` | Typed update/message validation, media and structured content normalization, and visible unsupported-content notices |
| Telegram previews | `src/modules/integrations/telegram/utils/{linkPreview,publicAddress}.ts` | Bounded public HTTPS metadata reads, tenant cache and existing inbox embed normalization |
| Telegram downloads | `src/modules/integrations/telegram/utils/downloadFile.ts` | Resolves provider file metadata, validates and encodes the download path, and retrieves bounded file bytes with timeout and cleanup |
| Telegram attachment storage | `src/modules/integrations/telegram/utils/attachments.ts` | Downloads one file, sanitizes its display name, uploads through workspace storage using an isolated temporary directory, and returns an inbox attachment |
| Telegram replies | `src/modules/integrations/telegram/controller/sendMessage.ts` | Preflights text/files/polls and quote targets, resolves chat/topic, sends native media/albums or text, and saves accepted provider IDs |
| Telegram reply dispatch | `src/modules/integrations/telegram/messageBroker.ts`, `src/modules/inbox/graphql/resolvers/mutations/conversations.ts` | Validates the reply envelope, resolves tenant models, routes Telegram replies, and reuses canonical inbox storage and publishing |
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

| Survey ticket automation | `src/modules/survey/ticketAutomation.ts` | Threshold evaluation, atomic single-ticket claim, ticket creation |
| Knowledge base | `src/modules/knowledgebase/` | Topics, categories, articles, AI knowledge source |
| Help center | `src/modules/helpcenter/` | Client portal configs: general settings and appearance for a published help center |
| Reports | `src/modules/reports/` | Inbox/ticket report aggregations, `buildTicketMatch`, and the saved `ReportCharts` model |
| Migrations | `src/migrations/` | Plugin-owned data migrations |

## Contracts

### Provides

- `POST /telegram/receive/:_id`: saved bot ID plus matching
  `X-Telegram-Bot-Api-Secret-Token`; `401` rejected authentication, `400` malformed
  payload, generic `500` retryable processing failure, `200` handled/skipped update.
- `telegramValidateToken(token)` and `telegramAddBot(token)` require
  `integrationsAdd`; creation derives the creator from the authenticated user.
- `telegramBots` / `telegramBot(_id)` require `showIntegrations` and return
  public metadata only. `TelegramBot.erxesApiId` is the nullable inbox link.
- `telegramBotWebhookInfo(_id)`, `telegramSetWebhook(_id, url)`,
  `telegramUpdateBot(_id, token?)`, and `telegramDisconnectBot(_id)` require
  `integrationsEdit`. Status timestamps are GraphQL Dates; credentials are never
  public fields. Registration/disconnect return booleans; update returns metadata.
- `telegramConversationChats(conversationIds: [String!]!)` requires
  `showConversations`, accepts at most 100 IDs, and restricts chat metadata to
  integrations in channels visible to the acting user. Returns inbox conversation
  ID, provider chat ID/type/title, topic ID and optional topic name.
- `telegramMessageLinkPreviews(messageId: String!): JSON` requires
  `showConversations` plus visible-channel membership. Reads links only from a
  stored non-internal Telegram message; returns at most two existing-shape embeds.
- `integrationsCreateExternalIntegration` retains `kind: 'telegram-messenger'`
  and `data: { sourceBotId }`; the saved bot ID is linked atomically. The common
  channel authorization and rollback path remain unchanged. Removal unregisters
  the webhook, drops pending updates, detaches the bot and rotates its secret.
- `sendTelegramReply({ models, subdomain, payload })` returns the existing nested
  broker success shape with `{ conversationId, content, displayContent, extraData }`.
  `extraData.telegram.messageIds` contains accepted provider IDs. Canonical
  outgoing writes/subscriptions remain owned by `conversationMessageAdd`.
- Plugin meta `properties` (`src/meta/properties.ts`) — the `conversation` and
  `ticket` property types, each with the `systemFields` (`code`, `name`, `type`)
  core lists as the read-only "Basic information" group in Settings →
  Properties. A `code` must name a real field on the record; core-api reads
  this meta once per process, so a changed list shows after core-api restarts.

### Consumes

- Telegram Bot API identity, webhook status/register/delete, file lookup,
  sendMessage, sendPhoto, sendDocument, sendAudio, sendVoice, sendVideo,
  sendAnimation, sendMediaGroup and sendPoll. Requests reject redirects and expose
  controlled failures; ordinary calls time out at 10 seconds, multipart at 60.
- Fixed-host Telegram file downloads use a 30-second timeout and byte bounds.
  The adapter consumes public `uploadFileToStorage`, `readFileStreamFromStorage`,
  `sanitizeFilename`, and `IAttachment` from `erxes-api-shared`, forwarding the tenant.
- Frontline-local `receiveInboxMessage` bridges human senders to Core contacts,
  creates/updates deterministic inbox conversations, and creates canonical inbox
  messages with existing realtime publication. No shared inbox schema changes.
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

- `src/connectionResolvers.ts` supplies per-subdomain models. Telegram follows
  the local type → schema → class loader → model registration pattern.
- `telegram_bots`: unique provider `botId`, generated local `_id`, creator,
  names/capabilities, verification timestamp and unique sparse `erxesApiId`.
  `token` / `webhookSecret` are `select: false`, not encrypted by that setting.
- `customers_telegram`: unique provider `userId` within the tenant, originating
  integration and optional `erxesApiId` pointing to Core. New contacts use a stable
  `telegram-<mapping _id>` Core ID and public Core lookup/create contracts to
  converge concurrent creation and recover a missing local link.
- `conversations_telegram`: unique `(integrationId, chatId, messageThreadId)`,
  chat type/title/topic name, timestamp/preview and inbox `erxesApiId`. Ordinary chats use
  topic zero. Optional `migratedToChatId` redirects upgraded-group replies.
- `conversation_messages_telegram`: unique `(integrationId, chatId, messageId)`,
  local conversation ID, source timestamp, content, existing attachment array,
  human customer or staff user, optional sender label and canonical message link.
  `processingToken` / `processingUntil` implement a renewable processing lease.
  `attachmentFileIds` avoids downloading unchanged media on caption edits;
  processed edit/update versions reject stale delivery. Poll ID/state and message
  metadata are adapter-owned optional fields.
- `telegram_reactions`: unique `(integrationId, chatId, messageId, actorId)`;
  actor snapshots carry provider date/update ID for idempotent ordering. The
  reserved `counts` actor represents an anonymous aggregate. Short event leases
  serialize projection with message edits; canonical version fields reject stale
  poll/reaction projections.
- New canonical inbound IDs are `telegram-<local mapping _id>`; pre-existing
  canonical links are reused unchanged. Inbox `extraData.telegram` carries chat/
  sender/provider IDs, album/edit/quote metadata and reaction display state;
  polls reuse existing `extraData.poll`. No shared schema was changed.
- All added persisted fields are optional. Existing unique indexes and message
  shapes remain valid; this change requires no destructive data migration.
- Link metadata is not persisted on the canonical message. An in-process cache
  keys by tenant and URL, retains results for five minutes and holds at most 200
  entries; concurrent reads share the in-flight promise.

## Local Invariants

- Enforce setup permissions before credential access. Derive actors from request
  context; generate models from the authenticated request's subdomain. Chat metadata
  must apply channel visibility, not only tenant membership.
- Bot tokens/secrets never enter GraphQL results, browser storage, file URLs exposed
  to clients, or raw error messages. Validate token syntax without silently trimming it.
- Preview fetches accept no arbitrary URL query argument: resolve a stored visible
  message first. Keep public-address validation and pinned DNS on every metadata
  redirect, no credentials/cookies, at most two URLs, two redirects, five seconds
  and 512 KiB of streamed HTML. Metadata failure must preserve the usable link.
- `sourceBotId` is the local saved-bot ID. An unconnected bot omits `erxesApiId`;
  conditional attachment may not overwrite another connection. Preserve common
  creation rollback and channel checks rather than adding a parallel lifecycle.
- Replacement tokens must resolve to the same provider bot ID. Webhook URLs must
  be HTTPS and end with `/telegram/receive/<saved-bot-id>` without query, fragment
  or credentials. Register message/channel posts, both edited variants, poll and
  reaction/count events, preserving pending updates.
  Disconnect keeps history and pauses the integration; successful registration reactivates it.
- Authenticate the webhook before dispatch. Compare nonempty equal-length secret
  buffers with `timingSafeEqual`; preserve generic HTTP errors. Validate each
  message after validating its envelope and await processing before acknowledging.
- Human group authors may have Core contacts, but the group/channel itself is not
  a single customer. The inbox reply mutation permits Telegram conversations
  without a customer; delivery uses the validated chat mapping. Missing linked
  customers and other integrations retain the existing customer requirement.
  Never create a fake human for `sender_chat`. Topic IDs apply
  only when `is_topic_message` is true. Business, guest and channel direct-message
  modes are separate delivery contracts and are not registered. Scheduled
  `message_id: 0` and the connected bot's own echoes are not imported.
- Never silently discard ordinary message content: map it to the existing inbox
  contract or retain a visible fallback. Ordinary deletions have no Bot API event;
  do not infer a deletion from a missing update. Replies must reference a mapped
  message in this integration, current chat and topic.
- Preserve raw text in mappings and escape it before inbox HTML rendering. Reuse
  the existing attachment schema and renderer. Do not expose Telegram token URLs.
- Downloads validate/encode path segments and enforce 20 MiB at metadata, headers
  and streamed bytes. Permanent size-limit failures become a visible notice;
  transient failures remain retryable. Always abort/release readers on exit.
- Workspace upload uses a unique temporary directory, fixed private filename
  (`0600`), sanitized display basename, actual byte size and cleanup in `finally`.
- Outgoing files use workspace storage keys or HTTPS public URLs. Resolve and pin
  public DNS addresses, reject private/reserved targets and redirects, and bound
  time and bytes. Preflight all files before sending any; max ten files and 50 MiB
  total. Compatible JPEG/PNG up to 10 MiB use sendPhoto; supported signatures
  route audio/voice/video/animation to native methods, with documents as fallback.
  Image keys missing from object storage use public `readFileFromStorage`, as
  Mail does, to support Cloudflare Images. That shared fallback buffers before
  its size check; streaming failures and non-image keys must not use it.
- Preserve editor HTML for the inbox; send plain text (4096 code points) or a
  first-file caption (1024). Internal notes never leave erxes. Polls use the
  existing poll input and quoted replies use a validated provider message ID.
  Strip editor markup before unescaping text so literal angle-bracket tags and
  entity spellings are preserved in outgoing Telegram replies and captions.
- Await provider acceptance and local mapping storage before success. Report partial
  sends/ambiguous timeouts explicitly and never retry outbound sends automatically.
  Provider delivery and canonical inbox writes cannot be made atomic by this adapter.
- Inbound processing claims a two-minute token-fenced Mongo lease, renewed every
  30 seconds. Reuse stored attachments, deterministic IDs and canonical records
  after partial failure. Release only the owned lease. Re-publish existing inbox
  events during recovery; subscribers deduplicate canonical message IDs.
- New customer links use a deterministic Core ID derived from the local mapping,
  the public Core find/create contract, and lookup after a competing insert.
  Preserve existing links and conditional linking. Do not claim distributed
  exactly-once creation or delete mappings as generic error cleanup.
- Group upgrades store an alias instead of rewriting the unique chat key. If both
  histories already exist, keep both and route future replies to the upgraded chat.
- Keep application exports named, no new `any`, no new dependencies and no source
  changes outside Frontline. Test doubles may cast at the Mongoose boundary.

## Validation

- `pnpm nx lint frontline_api` (inferred ESLint target).
- `pnpm nx build frontline_api` (TypeScript and alias compilation).
- `pnpm nx test frontline_api` (plugin-owned Jest target).
- `pnpm exec tsc -p backend/plugins/frontline_api/tsconfig.spec.json --noEmit --incremental false`.
- `pnpm exec eslint backend/plugins/frontline_api/src/modules/integrations/telegram --max-warnings=0`.
- Jest tests under Telegram `__tests__/` cover provider-shaped parsing, chat/topic
  routing, multipart sends, partial failures, leases/recovery, file bounds and
  storage cleanup, setup lifecycle and permissions. Most tests stub external
  boundaries. `TELEGRAM_MONGO_TESTS=1 pnpm nx test frontline_api --skipNxCache`
  additionally exercises production Mongoose schemas/indexes and concurrency in
  a unique disposable database on local MongoDB port 27017; it never uses a
  development tenant database. Provider/storage/Core transport remain stubbed.
- The Jest transform includes the reply utility's ESM dependencies only; do not
  transform every dependency or introduce a new runtime dependency for tests.
- Live smoke: use a dedicated test bot; create/connect from settings, inspect status,
  send text/media/polls/replies in private/group/channel/topic contexts, edit
  received messages, react/retract, rename topics, and check fallback notices;
  verify realtime display, internal-note isolation, and disconnect/reconnect.
  Test duplicate webhooks and attachment limits without touching production data.
- Report existing project lint/type failures separately from changed-file diagnostics.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-10-06` — Live Telegram delivery and preview corrections

- **Summary:** Preserved literal replies and inbox snippets, allowed customerless group/channel sends, fixed CDN-only image reads and implicit topic quotes, and added bounded link previews.
- **Affected areas:** Telegram reply/content/attachment/preview adapters, query resolver/schema, inbox message mutation and regression tests.
- **Contracts changed:** Added `telegramMessageLinkPreviews(messageId: String!): JSON`, gated by `showConversations` and channel membership; canonical inbox schemas are unchanged.

### `2026-10-06` — Telegram lifecycle, media and message updates

- **Summary:** Added setup/lifecycle, chat/topic routing, media and visible fallbacks, native albums/polls/replies, ordered edits/reactions and retry-safe inbox/contact linking.
- **Affected areas:** `src/modules/integrations/telegram/`, model registration, integration removal dispatch, plugin test configuration.
- **Contracts changed:** Added `telegramUpdateBot`, `telegramDisconnectBot`, `telegramConversationChats`; webhook registration includes channel posts, edits, polls and reactions; existing inbox content/attachment/poll/reply contracts retained.

### `2026-10-06` — Telegram attachment storage adapter

- **Summary:** Added workspace storage for downloaded Telegram files with sanitized names, actual byte sizes, controlled errors, and temporary-file cleanup.
- **Affected areas:** `src/modules/integrations/telegram/utils/attachments.ts`.
- **Contracts changed:** Added internal `storeTelegramAttachment(...): Promise<IAttachment>` using the existing inbox attachment contract; message receiver wiring remains separate.

### `2026-10-06` — Telegram file downloader

- **Summary:** Added bounded file downloads with encoded provider paths, controlled errors, timeout, and request cleanup.
- **Affected areas:** `src/modules/integrations/telegram/utils/downloadFile.ts`.
- **Contracts changed:** Added internal `downloadTelegramFile(token, fileId): Promise<Buffer>` and `MAX_TELEGRAM_DOWNLOAD_BYTES`; no public API or inbox attachment contract change.

### `2026-10-05` — Telegram file lookup client

- **Summary:** Added provider file metadata lookup with validated download paths and controlled request failures.
- **Affected areas:** `src/modules/integrations/telegram/client.ts`.
- **Contracts changed:** Added internal `getTelegramFile(token, fileId): Promise<TelegramFile>`; no public API change or media receiver wiring.

### `2026-10-05` — Telegram media payload validation

- **Summary:** Added validation for optional photo, document, and caption payloads while preserving the existing text receiver scope.
- **Affected areas:** `src/modules/integrations/telegram/utils/message.ts`.
- **Contracts changed:** Internal `TelegramMessage` includes typed `caption`, `photo`, and `document` fields; no public API or stored attachment contract change.

### `2026-10-05` — Telegram inbox reply dispatch

- **Summary:** Connected private text replies to Telegram through the existing inbox mutation, preserving local internal notes and canonical message updates.
- **Affected areas:** `src/modules/integrations/telegram/messageBroker.ts`, `src/modules/inbox/graphql/resolvers/mutations/conversations.ts`.
- **Contracts changed:** Added internal `handleTelegramIntegration`; existing `conversationMessageAdd` now dispatches `telegram-messenger` replies with no GraphQL schema change.

### `2026-10-05` — Telegram private text reply handler

- **Summary:** Added validated private-chat replies using saved bot credentials, followed by provider message mapping persistence and explicit partial-success errors.
- **Affected areas:** `src/modules/integrations/telegram/controller/sendMessage.ts`.
- **Contracts changed:** Added internal `sendTelegramReply({ models, payload }): Promise<ITelegramReplyResult>`; inbox broker and dispatcher wiring remain separate.

### `2026-10-05` — Telegram text-sending client

- **Summary:** Added validated plain-text sending with numeric chat IDs, a 4096-code-point limit, and controlled provider errors.
- **Affected areas:** `src/modules/integrations/telegram/client.ts`.
- **Contracts changed:** Added internal `sendTelegramMessage(token, chatId, text): Promise<TelegramMessage>`; no public API change or inbox reply wiring.

### `2026-10-05` — Telegram webhook registration mutation

- **Summary:** Exposed saved-bot webhook registration through a permission-checked GraphQL mutation.
- **Affected areas:** `src/modules/integrations/telegram/graphql/schema/telegram.ts`, `src/modules/integrations/telegram/graphql/resolvers/mutations.ts`.
- **Contracts changed:** Added `telegramSetWebhook(_id: String!, url: String!): Boolean!` with an `integrationsEdit` permission check.
