# `frontline_api` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/frontline_api`
- **Last synchronized:** `2026-09-21`

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

- Plugin meta `properties` (`src/meta/properties.ts`) — the `conversation` and
  `ticket` property types, each with the `systemFields` (`code`, `name`, `type`)
  core lists as the read-only "Basic information" group in Settings →
  Properties. A `code` must name a real field on the record; core-api reads
  this meta once per process, so a changed list shows after core-api restarts.

### Consumes

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

## Recent Changes

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

### `2026-09-17` — Property types declare system fields

- **Summary:** The `conversation` and `ticket` property types now declare
  `systemFields`, shown as the "Basic information" group in Settings →
  Properties.
- **Affected areas:** `src/meta/properties.ts`, `src/main.ts`
- **Contracts changed:** Plugin meta `properties.types[].systemFields` added.

### `2026-09-17` — Conversations convert into tickets, deals and tasks

- **Summary:** `conversationConvertToCard` stopped echoing its arguments and now
  creates the ticket, deal or task, relates it to the conversation and
  customer, and blocks a duplicate; `conversationConvertedItems` reports what a
  conversation was already converted into.
- **Affected areas:** `src/modules/inbox/services/conversationConvert{,Targets}.ts`,
  `src/modules/inbox/@types/conversationConvert.ts`,
  `src/modules/inbox/graphql/{schemas/conversation,resolvers/mutations/conversations,resolvers/queries/conversations}.ts`,
  `src/meta/permissions.ts`
- **Contracts changed:** `conversationConvertToCard` dropped `itemId`, gained
  `tagIds`, `branchIds`, `departmentIds`, and now enforces permissions; added
  `conversationConvertedItems` and `ConversationConvertedItem`; the
  `frontline:user` group gained `conversationConvertToCard`.

### `2026-09-15` — Call user integrations carry their name

- **Summary:** `callUserIntegrations` returns each integration's inbox name so
  the dialpad's `Call from` can tell integrations on one phone apart.
- **Affected areas:** `src/modules/integrations/call/graphql/{schema/call,resolvers/queries}.ts`
- **Contracts changed:** `CallsIntegrationDetailResponse` gains `name: String`.

### `2026-09-15` — An incoming call names the integration it rang

- **Summary:** `callAddCustomer` also returns the matched inbox integration's
  `_id` and `name`, so agents on a shared trunk see which integration a call
  came in on rather than its channel.
- **Affected areas:** `src/modules/integrations/call/graphql/{schema/call,resolvers/mutations}.ts`
- **Contracts changed:** `CallConversationDetail` gains
  `integration: CallConversationIntegration` (`_id`, `name`); new type
  `CallConversationIntegration`.

### `2026-09-15` — Call integrations may share a trunk

- **Summary:** `srcTrunk`, `dstTrunk` and `phone` are no longer unique, so
  integrations on one trunk can be split by queue; blank queue input is
  stored as `[]` and the queue index ignores empty queue lists.
- **Affected areas:** `src/modules/integrations/call/{indexes,helpers,utils}.ts`,
  `src/modules/integrations/call/db/definitions/integrations.ts`
- **Contracts changed:** `Duplicate srcTrunk detected.` and
  `Duplicate dstTrunk detected.` are no longer returned by
  `integrationsCreateExternalIntegration` or integration edit.

### `2026-09-10` — Polls became surveys, database included

- **Summary:** The whole feature was renamed from poll to survey — module,
  models, GraphQL contract, permissions, the `frontline_surveys` /
  `frontline_survey_votes` collections, `conversations.hasSurvey`,
  `extraData.survey` and `Ticket.sourceSurvey` — with
  `src/migrations/migratePollToSurvey.ts` moving existing data. Discord's own
  polls were deliberately left on `extraData.poll`.
- **Affected areas:** `src/modules/survey/**` (was `src/modules/poll/**`),
  `src/apollo/**`, `src/connectionResolvers.ts`, `src/conversationQueryBuilder.ts`,
  `src/meta/permissions.ts`, `src/modules/inbox/**`, `src/modules/ticket/**`,
  `src/migrations/migrate{PollToSurvey,SurveySteps}.ts`.
- **Contracts changed:** Every `poll*` / `cpPoll*` operation and every `Poll*`
  type was renamed to `survey*` / `cpSurvey*` / `Survey*`; `withPoll` became
  `withSurvey`; `Ticket.sourcePoll` became `Ticket.sourceSurvey`.

### `2026-09-10` — An agent's note threads as a mail reply

- **Summary:** A note mailed to the requester carried no `In-Reply-To` or
  `References`, so it arrived as a new conversation despite the `Re:` subject.
  The note-out path now threads on the ticket's latest inbound message, falling
  back to its latest message when the ticket has none. The helper module was
  renamed from `comments.ts` to `notes.ts`, with `mailTicketComment` and
  `commentFromMail` becoming `mailTicketNote` and `noteFromMail`, so the names
  match the `Note` model they have always written.
- **Affected areas:** `src/modules/integrations/mail/utils/notes.ts`,
  `src/modules/integrations/mail/controller/receiveMessage.ts`,
  `src/modules/ticket/graphql/resolvers/mutations/note.ts`
- **Contracts changed:** `None`

### `2026-09-10` — A mail ticket belongs to the customer who wrote in

- **Summary:** A ticket opened from mail is now created as `cp:<customerId>`
  rather than as the pipeline owner, so the requester owns it in the client
  portal and the activity timeline names them; the pipeline owner is kept as
  its only subscriber instead. `generateFilter` gained the matching visibility
  branches so an `isCheckUser` pipeline still shows those tickets to its agents
  while they are unclaimed, or to whoever subscribed to one.
- **Affected areas:** `src/modules/integrations/mail/utils/tickets.ts`,
  `src/modules/ticket/utils/generateFilter.ts`
- **Contracts changed:** `None`

### `2026-09-10` — Review fixes on the pipeline mail path

- **Summary:** An answer now goes to the sender of the ticket's newest inbound
  message instead of its first related customer, inbound addresses are stored
  lowercased so a mixed-case sender no longer opens a second ticket, Cloudflare
  requests carry a 20s abort deadline, a forwarding confirmation is recognised
  only from an automated-looking sender and only its https links on known
  provider hosts are kept, and index reconciliation is serialized per subdomain.
- **Affected areas:** `src/modules/integrations/mail/utils/{tickets,forwardVerification,indexes}.ts`,
  `src/modules/integrations/mail/utils/cloudflare/client.ts`,
  `src/modules/integrations/mail/controller/receiveMessage.ts`
- **Contracts changed:** `None`
