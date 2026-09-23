# `frontline_api` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/frontline_api`
- **Last synchronized:** `2026-09-23`

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

- Ticket creation-date filtering follows Operation: `createdDate: String`
  accepts `in-past`, `no-date`, or an ISO cutoff (created on or before that
  instant). Customer/company filters reuse Frontline contact-relation logic.

- Surveys are a reusable definition (`title`, ordered `steps`, optional
  `durationHours`, optional `brandId`, `pending`/`active`/`archived` status)
  owned by a channel through `channelId`. Each step is one question with its own
  `name`, `description`, ordered `options` and `allowMultiselect`, so a survey can
  ask several questions in sequence. Step 1 stays mirrored on the survey's
  top-level `question` / `options` / `allowMultiselect`, which is what every
  reader written against the single-question shape still sees. An agent posts one into a messenger
  conversation with `surveySendToConversation`,
  which writes a snapshot to the message's `extraData.survey` and bumps the
  survey's `sentCount` and sets `hasSurvey` on the conversation. Client portal
  users vote through `cpSurveySubmit`; each vote recomputes the tallies, marks the
  conversation as customer-responded and unread, then republishes the message
  through `pConversationClientMessageInserted`, so the conversation rises in
  the agent's list and both the inbox and the portal update without a refresh.
- A survey option can arm a **ticket automation**: `ticketCreationEnabled`,
  `ticketCreationThreshold`, `ticketPipelineId` and `ticketStatusId`. Every vote written through `cpSurveySubmit` counts
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
- A client portal user may also **request** a survey with `cpSurveyAdd`. The
  request is moderated, never live: `Surveys.createCpSurvey` forces
  `status: 'pending'`, stamps `createdCpUserId` instead of `createdUserId`, and
  maps every option through a voting-only projection, so a portal caller can
  never arm an option's ticket automation. `pending` is invisible to every
  client portal read — `cpSurveys` filters on `active` and `getActiveSurvey`
  backs `cpSurveyDetail` and `cpSurveySubmit` — and `surveySendToConversation`
  and the ticket automation both refuse a non-`active` survey, so nothing
  reaches a customer until an agent approves it by moving the status to
  `active` through `surveyToggleStatus` (permission `surveyToggleStatus`; no new
  action). `cpSurveyAdd` requires a `channelId` whose channel exists and holds
  an active messenger integration, and copies that integration's `brandId` onto
  the survey, so an approved request is votable rather than dead on arrival.
  `Survey.createdCpUser` resolves the requester's name over tRPC for the
  agent's approval queue.

- A channel-owned resource moves between channels through one mutation,
  `channelMoveResources`. It covers integrations, ticket pipelines, forms,
  surveys and response templates: each is owned by a channel through its own
  flat `channelId`, and the move rewrites only that field. Validation runs
  before any write — the destination must exist, differ from the source and be
  visible to the caller; every selected id must still exist and still sit in
  the source channel; and the destination must not already hold a resource of
  that type with the same `name` (`title` for surveys). Moving a pipeline also
  rewrites the denormalized `channelId` on its tickets, and moving a form also
  moves the lead integration named by `form.integrationId`; if that cascade
  fails the primary update is rolled back, so a failed move leaves the resource
  on its original channel. Permission is the owning module's existing edit
  action — `integrationsEdit`, `updateTicket`, `formsEdit`, `surveyEdit`,
  `responseTemplatesEdit` — not a new one.

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

| Area                     | Path                                                                        | Responsibility                                                                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Bootstrap                | `src/main.ts`                                                               | `startPlugin({ name: 'frontline', port: 3304 })`, wires tRPC, routes, meta, and every surface                                                                                                          |
| Models                   | `src/connectionResolvers.ts`                                                | Per-subdomain model container for all modules                                                                                                                                                          |
| GraphQL                  | `src/apollo/`                                                               | Aggregated `typeDefs` and `resolvers` across modules                                                                                                                                                   |
| tRPC                     | `src/init-trpc.ts`                                                          | `appRouter` for service-to-service calls                                                                                                                                                               |
| Agent tool metadata      | `src/trpc/agentMeta.ts`                                                     | Local `agentMeta` helper for agent-callable tRPC annotations                                                                                                                                           |
| HTTP                     | `src/routes.ts`                                                             | Mounts the `/facebook`, `/instagram`, `/mail`, and (when enabled) `/callpro` webhook routers                                                                                                           |
| Platform extensions      | `src/meta/`                                                                 | automations, permissions, notifications, segments, references, import/export                                                                                                                           |
| Channels                 | `src/modules/channel/`                                                      | Channel + ChannelMember models, schema, resolvers, role checks                                                                                                                                         |
| Inbox                    | `src/modules/inbox/`                                                        | Conversations, messages, integrations, widget/clientportal schemas, `receiveInboxMessage`                                                                                                              |
| Conversation queries     | `src/conversationQueryBuilder.ts`, `src/modules/inbox/conversationUtils.ts` | Mongo and Elasticsearch conversation filters (membership-scoped)                                                                                                                                       |
| Integrations             | `src/modules/integrations/<kind>/`                                          | facebook, instagram, mail, discord, call, callpro, trpc                                                                                                                                                |
| Mail integration         | `src/modules/integrations/mail/`                                            | Inbound webhook, threading, outbound send/retry                                                                                                                                                        |
| Mail transports          | `src/modules/integrations/mail/utils/transports/`                           | `index.ts` picks the Cloudflare account that signs for this workspace, `deliver.ts` runs the delivery pipeline (sender guard, suppression, delivery log), `cloudflare.ts` is the only `IMailTransport` |
| Mail provisioning        | `src/modules/integrations/mail/utils/cloudflare/`                           | Cloudflare REST client, the fourteen-step provisioner, Email Sending onboarding and quota, the connection cache and its public shape                                                                   |
| Mail worker bundle       | `src/modules/integrations/mail/worker/bundle.generated.ts`                  | The minified worker uploaded to a tenant's account, regenerated by `npm run bundle` in `cloudflare/mail-worker`                                                                                        |
| Call Pro                 | `src/modules/integrations/callpro/`                                         | `CALLPRO_ENABLED` gate, `/callpro/receive` webhook, mirrored line/caller/call, recording URL                                                                                                           |
| Call reporting           | `src/modules/reports/callReportService.ts`                                  | CDR filter, leg-to-call folding, and the per-queue/agent/number report computation                                                                                                                     |
| FB automation            | `src/modules/integrations/facebook/meta/automation/`                        | Comment/message triggers and actions, bot message generation                                                                                                                                           |
| FB page posting          | `src/modules/integrations/facebook/postService.ts`, `postGuard.ts`          | Post publishing pipeline (validation, photo staging, cleanup, permalink) and its rate limit + audit log                                                                                                |
| FB app resolution        | `src/modules/integrations/facebook/commonUtils.ts`                          | `resolveFacebookApp`, `facebookAppSelector`, `facebookAccountSelector`                                                                                                                                 |
| Ticket                   | `src/modules/ticket/`                                                       | Boards, pipelines, statuses, tickets, activities, notes                                                                                                                                                |
| Conversation convert     | `src/modules/inbox/services/conversationConvert{,Targets}.ts`               | Conversion orchestration and relations; one handler per target (permission, existing-item lookup, URL, create)                                                                                         |
| Forms                    | `src/modules/form/`                                                         | Forms, fields, submissions                                                                                                                                                                             |
| Surveys                  | `src/modules/survey/`                                                       | Survey definitions, vote ledger, message snapshot, tally refresh                                                                                                                                       |
| Pipeline mail            | `src/modules/integrations/mail/utils/{pipeline,tickets,scope}.ts`           | A ticket pipeline's own address: its settings, the status new mail opens a ticket in, and ticket creation from an inbound message                                                                      |
| Survey ticket automation | `src/modules/survey/ticketAutomation.ts`                                    | Threshold evaluation, atomic single-ticket claim, ticket creation                                                                                                                                      |
| Knowledge base           | `src/modules/knowledgebase/`                                                | Topics, categories, articles, AI knowledge source                                                                                                                                                      |
| Help center              | `src/modules/helpcenter/`                                                   | Client portal configs: general settings and appearance for a published help center                                                                                                                     |
| Reports                  | `src/modules/reports/`                                                      | Inbox/ticket report aggregations, `buildTicketMatch`, and the saved `ReportCharts` model                                                                                                               |
| Migrations               | `src/migrations/`                                                           | Plugin-owned data migrations                                                                                                                                                                           |

## Contracts

### Provides

- `channelMoveResources(resourceType: ChannelResourceType!, resourceIds: [String!]!, sourceChannelId: String!, targetChannelId: String!): ChannelMoveResourcesResult`
  — moves channel-owned resources between channels. `ChannelResourceType` is
  `integration | pipeline | form | survey | responseTemplate`;
  `ChannelMoveResourcesResult` carries `movedIds`, `movedCount`,
  `sourceChannelId`, `targetChannelId` and `targetChannelName`.
- `cpSurveyAdd(title: String!, channelId: String!, question: String, options: [CpSurveyOptionInput!], steps: [CpSurveyStepInput!], allowMultiselect: Boolean, durationHours: Int): Survey`
  — a signed-in client portal user's survey request, created as `pending`.
  `CpSurveyOptionInput` carries `text` and `order` only; there is no client
  portal input that can set an option's ticket-automation fields.
- Plugin meta `properties` (`src/meta/properties.ts`) — the `conversation` and
  `ticket` property types, each with the `systemFields` (`code`, `name`, `type`)
  core lists as the read-only "Basic information" group in Settings →
  Properties. A `code` must name a real field on the record; core-api reads
  this meta once per process, so a changed list shows after core-api restarts.
- GraphQL: `mailPipelineConnect(pipelineId!, senderName, forwardFrom, statusId)`
  and `mailPipelineUpdate(pipelineId!, senderName, forwardFrom, statusId)` —
  `statusId` names the status a new mail ticket opens in and must belong to that
  pipeline or the mutation fails; an empty string clears it and an omitted
  argument on update leaves it unchanged. `MailPipelineIntegration.statusId`
  answers an empty string once that status no longer belongs to the pipeline, so
  a form never resubmits a deleted status, and inbound mail falls back to the
  pipeline's first status, sorted by `type` then `order`.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-21` — A pipeline address chooses the status its tickets open in

- **Summary:** A pipeline's mail row can name the status a new mail ticket opens
  in; it is validated against the pipeline on connect and update, and an empty
  or since-deleted status falls back to the pipeline's first status, now picked
  by `type` then `order` instead of `order` alone.
- **Affected areas:** `src/modules/integrations/mail/utils/{pipeline,tickets}.ts`,
  `src/modules/integrations/mail/controller/receiveMessage.ts`,
  `src/modules/integrations/mail/graphql/resolvers/customResolvers/pipelineIntegration.ts`,
  `src/modules/integrations/mail/{@types/integration,db/definitions/integrations,graphql/schema/mail}.ts`
- **Contracts changed:** `mailPipelineConnect` and `mailPipelineUpdate` accept
  `statusId: String`; `MailPipelineIntegration` exposes `statusId`;
  `mail_integrations` carries `statusId`.

### Consumes

- `core` over tRPC — `cpUsers.get` (query, `{ id }`), which backs
  `Survey.createdCpUser`; `companies.findOne` (query), `companies.createCompany` and
  `companies.updateCompany` (mutations, `{ _id, doc }` / `{ doc }`),
  `customers.createMessengerCustomer` / `updateMessengerCustomer`,
  `conformity.create`, and `fields.generatePropertiesData`, which splits
  messenger `companyData` into `propertiesData` for keys that match a Core
  `core:company` field and `trackedData` for every remaining key.
- `automations` over tRPC — `automations.trigger`. The path is
  `automations.trigger`, not `triggers.trigger`; `sendTRPCMessage` swallows a
  wrong path or a query/mutation mismatch and returns `defaultValue`, so a
  typo here fails silently.

## Validation

- `pnpm nx lint frontline_api`
- `pnpm nx build frontline_api`
- `pnpm nx test frontline_api` — Jest over `src/**/*.test.ts`
  (`jest.config.ts`, `tsconfig.spec.json`). Test files are excluded from
  `tsconfig.build.json`, so a new one must keep the `.test.ts` suffix.
- Move a form, survey, response template, ticket pipeline and integration
  between two channels and confirm each leaves the source channel's list,
  appears in the destination's, and survives a reload.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-23` — Operation-style ticket date filter

- **Summary:** Replaced ticket creation-date ranges with Operation-style
  single-cutoff filtering, preserving ticket visibility and contact constraints.
- **Affected areas:** `src/modules/ticket/{@types/ticket,graphql/schemas/ticket,graphql/resolvers/queries/ticket}.ts`.
- **Contracts changed:** `ITicketFilter.createdDate: String` replaces filter inputs
  `createdAt` and `createdAtTo`; the ticket record still exposes `createdAt`.

### `2026-09-22` — Client portal users request surveys for approval

- **Summary:** `cpSurveyAdd` lets a signed-in client portal user submit a
  survey against a channel that has an active messenger integration; it is
  stored as the new `pending` status with `createdCpUserId` and voting-only
  options, stays hidden from every client portal read and from
  `surveySendToConversation` until an agent approves it with
  `surveyToggleStatus`, and `Survey.createdCpUser` names the requester.
- **Affected areas:** `src/modules/survey/db/definitions/surveys.ts`,
  `src/modules/survey/db/models/Surveys.ts`,
  `src/modules/survey/@types/survey.ts`,
  `src/modules/survey/graphql/schema/survey.ts`,
  `src/modules/survey/graphql/resolvers/mutations/clientPortal.ts`,
  `src/modules/survey/graphql/resolvers/customResolvers/survey.ts`,
  `src/modules/survey/graphql/resolvers/queries/surveys.ts`
- **Contracts changed:** added mutation `cpSurveyAdd`, inputs
  `CpSurveyOptionInput` / `CpSurveyStepInput`, type `SurveyCpRequester` and
  `Survey.createdCpUserId` / `Survey.createdCpUser`; survey `status` accepts
  `pending` and `surveyTotalCount.byStatus` now reports it.

### `2026-09-21` — Channel-owned resources move between channels

- **Summary:** Added `channelMoveResources`, one mutation that moves
  integrations, ticket pipelines, forms, surveys or response templates from one
  channel to another by rewriting their `channelId` only. It validates the
  destination, the caller's visibility of both channels, that every selected id
  still sits in the source channel, and that no same-named resource of that
  type already sits in the destination, all before the first write. A pipeline
  move cascades onto its tickets' denormalized `channelId` and a form move onto
  its lead integration, with a rollback of the primary update if the cascade
  fails. The plugin also gained a Jest target for the move's pure validation.
- **Affected areas:** `src/modules/channel/moveResources.ts`,
  `src/modules/channel/moveResources.test.ts`,
  `src/modules/channel/graphql/{schemas/channel,resolvers/mutations/channel}.ts`,
  `jest.config.ts`, `tsconfig.spec.json`, `tsconfig.build.json`,
  `project.json`
- **Contracts changed:** Added mutation `channelMoveResources`, enum
  `ChannelResourceType` and type `ChannelMoveResourcesResult`.

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
