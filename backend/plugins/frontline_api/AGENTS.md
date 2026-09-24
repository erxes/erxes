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
  comments), Instagram, WhatsApp (Cloud API), Mail (Cloudflare Email Routing),
  Discord, Call (SIP/CDR), and Call Pro (webhook PBX).
- Response templates.
- Ticketing: boards, pipelines, statuses, tickets, activities, notes, ticket
  configs, plus ticket import/export handlers.
- Forms: form definitions, fields, and form submissions (with submission export).
- Surveys: channel-scoped survey definitions, the snapshot an agent posts into a
  messenger conversation, and the per-voter vote ledger behind the tallies.
- Knowledge base: topics, categories, articles, and the AI knowledge source
  provider that indexes articles.
- Help centers: the client portal config record behind a published help center
  site — its general settings (name, description, website, the knowledge base,
  ticket and form feature groups, and the CMS behind its announcements), its
  appearance (logo pair, surface colours, fonts,
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
- `cpSurveyVotes` reads back cast selections. It filters on `customerId` when
  one is given and on the caller's `voterId` otherwise, so a portal that knows
  only the erxes customer still gets that customer's votes even when the vote
  was written under a different voter id; `conversationId` narrows either form
  and at least one of the two arguments must be present.
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
  action). The same mutation **rejects** a request by moving it to `rejected`,
  which `changeStatus` accepts only when every named survey is still `pending`
  and only with a non-empty `reason`, stored on the survey as
  `rejectionReason` (trimmed, capped at 500 characters) and served to the
  requester through every survey read. A rejected survey stays invisible to
  the portal's voting reads and cannot be sent to a conversation, but it is
  kept rather than deleted so the requester keeps their work. Every other
  status change clears `rejectionReason`, as does a requester's edit, so the
  note never outlives the rejection that produced it.
- Reviewing a request notifies the requester. `surveyToggleStatus` reads which
  of the named surveys are client portal requests still waiting on a decision
  (`createdCpUserId` set, status `pending` or `rejected`), and after the status
  write sends each of those requesters one client portal notification over
  tRPC — `Survey request approved` (`success`) or `Survey request rejected`
  (`warning`, carrying `rejectionReason` as the message), both stamped
  `contentType: 'frontline:survey'` with the survey `_id`. Archiving,
  unarchiving or any change to a survey nobody requested notifies no one. The
  notification is best effort: a failed tRPC call returns its `defaultValue`
  instead of failing the mutation. `cpSurveyAdd` requires a `channelId` whose channel exists and holds
  an active messenger integration, and copies that integration's `brandId` onto
  the survey, so an approved request is votable rather than dead on arrival.
  `Survey.createdCpUser` resolves the requester's name over tRPC for the
  agent's approval queue.
- Attachments belong to a **question**, not to the survey. Every step carries
  up to `MAX_SURVEY_ATTACHMENTS` (5) files through `SurveyStepInput` and
  `CpSurveyStepInput`, so agents and client portal requesters use the same
  field. `normalizeSurveyAttachments` runs inside `normalizeSurveySteps`: it
  drops an entry with a blank `url`, trims, falls back to the url for a missing
  name, coerces `size` to a number, and throws past the limit rather than
  silently truncating. The plugin stores metadata only — the file itself is
  uploaded through core's file upload API before the mutation — and any step
  write replaces that step's whole list. `SurveyStep.attachments` serves them
  back, and `buildSurveySnapshot` copies them into the message snapshot, so a
  respondent sees the files with the question they belong to.
- `cpSurveyRequests` is the requester's own queue: it lists only surveys whose
  `createdCpUserId` is the caller, in every status, so a portal can show a
  request while it waits for approval and hand its `_id` to `cpSurveyEdit` or
  `cpSurveyRemove`. `searchValue`, `channelId` and `status` narrow it, options
  come back through the same voting-only projection as every other client
  portal read, and a call without a signed-in client portal user is rejected.
- The requester may revise or withdraw an unreviewed request with
  `cpSurveyEdit` and `cpSurveyRemove`. Both go through
  `Surveys.getCpSurveyRequest`, which refuses a survey whose
  `createdCpUserId` is not the caller and one whose status is neither `pending`
  nor `rejected`, so an approved or archived survey is an agent's to change
  while a rejected one can still be revised or withdrawn by its requester. An
  edit always writes the status back to `pending`, so revising a rejected
  request resubmits it for review. An edit replays
  the same voting-only projection and validation as `cpSurveyAdd` and holds
  the status at `pending`; moving the request to another `channelId`
  re-resolves that channel's active messenger integration and re-stamps
  `brandId`. A remove deletes the survey through `Surveys.removeSurveys`, so
  the vote ledger is cleaned with it.

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
- Receives WhatsApp Cloud API webhooks at `/whatsapp/receive` and turns inbound
  text messages into customers, conversations, and inbox messages, matched to
  the integration by `metadata.phone_number_id` — a field that is unique per
  tenant, and whose create/update reject a phone number already used by
  another integration (`A WhatsApp integration for this phone number already
  exists`, with a lost E11000 race mapped to the same error). Creating or
  updating an integration subscribes the WABA to the Meta app
  (`/{wabaId}/subscribed_apps`) — without that subscription Meta accepts the
  webhook URL but never delivers — and removing the last integration on a WABA
  unsubscribes it.
  `GET /whatsapp/receive` answers Meta's verification handshake against the
  `WHATSAPP_VERIFY_TOKEN` config only, rejecting a missing/empty token and
  mismatching tokens with 403;
  `POST /whatsapp/receive` verifies Meta's `X-Hub-Signature-256` HMAC-SHA256
  over the raw request body against `FACEBOOK_APP_SECRET` (fail-closed 403)
  before any payload is processed, and `GET /whatsapp/get-status` reports
  integration health or `Integration not found`.
- Sends WhatsApp agent replies and bot messages as text first (when there is
  sanitized content) and then one Cloud API media message per attachment
  (`sendWhatsappMedia`, type detected from the attachment mime prefix with
  `document` as the fallback); an attachment without a `url` throws instead of
  being skipped, content is rejected only when there is neither text nor
  attachments, and the local message stores the attachments next to the `mid`
  of the first outbound send.
- Stores the Facebook `accountId` on each WhatsApp integration, so when
  `loginMiddleware` renews the Facebook account's token it also `$set`s the
  refreshed `accessToken` onto every `WhatsappIntegrations` row with that
  `accountId` (per-row failures are logged with `debugError`, never thrown).
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
- A help center config stores the published site's feature groups next to its
  general settings: `kbToggle`/`kbTopicId` for the knowledge base,
  `ticketToggle` with `ticketChannelId`/`ticketPipelineId`/`ticketStatusId`
  plus `formChannelId`/`formIds` for tickets and forms, and `cmsId` with the
  `cmsAppToken` of that CMS's client portal for the announcements the site
  lists. `normalizeHelpCenterConfig` is the single validation gate for all of
  them, composed from one normalizer per group (identity, knowledge base,
  tickets, CMS): it requires a title, rejects a non-http(s) website, requires
  `kbTopicId` when the knowledge base is on and a channel plus pipeline when
  tickets are on, refuses a `cmsId` without an app token, blanks a disabled
  group, and de-duplicates `formIds`. Forms are scoped to their channel on
  write — `HelpCenterConfig.getChannelFormIds` drops every id that does not
  belong to `formChannelId`, so a channel change cannot leave a stale form on
  the site.
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
| HTTP                     | `src/routes.ts`                                                             | Mounts the `/facebook`, `/instagram`, `/mail`, `/whatsapp`, and (when enabled) `/callpro` webhook routers                                                                                                  |
| Platform extensions      | `src/meta/`                                                                 | automations, permissions, notifications, segments, references, import/export                                                                                                                           |
| Channels                 | `src/modules/channel/`                                                      | Channel + ChannelMember models, schema, resolvers, role checks                                                                                                                                         |
| Inbox                    | `src/modules/inbox/`                                                        | Conversations, messages, integrations, widget/clientportal schemas, `receiveInboxMessage`                                                                                                              |
| Conversation queries     | `src/conversationQueryBuilder.ts`, `src/modules/inbox/conversationUtils.ts` | Mongo and Elasticsearch conversation filters (membership-scoped)                                                                                                                                       |
| Integrations             | `src/modules/integrations/<kind>/`                                          | facebook, instagram, whatsapp, mail, discord, call, callpro, trpc                                                                                                                                         |
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
| Survey notifications     | `src/modules/survey/notifications.ts`                                       | Client portal notification for an approved or rejected survey request                                                                                                                                  |
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
  `CpSurveyStepInput.attachments: [AttachmentInput]` attaches files to a
  question and `SurveyStep.attachments: [Attachment]` returns them.
- `cpSurveyRequests(searchValue: String, channelId: String, status: String, limit, cursor, direction, cursorMode, orderBy): SurveyListResponse`
  — the caller's own survey requests in every status, newest first by default.
- `cpSurveyEdit(_id: String!, title: String!, channelId: String, question: String, options: [CpSurveyOptionInput!], steps: [CpSurveyStepInput!], allowMultiselect: Boolean, durationHours: Int): Survey`
  — the requester's own revision of a still-`pending` or `rejected` request;
  `channelId` is optional and keeps the current channel when omitted.
- `cpSurveyRemove(_id: String!): String` — the requester withdraws a
  still-`pending` request and gets the removed `_id` back.
- GraphQL: help center configs — `helpCenterConfig(_id)`,
  `helpCenterConfigs(page, perPage, searchValue, brandId)`,
  `helpCenterConfigsTotalCount(searchValue, brandId)`,
  `helpCenterGetConfigByDomain(clientPortalName)` (the published site's own
  bootstrap read, the one operation in this module that skips the permission
  check), `helpCenterConfigUpdate(config: HelpCenterConfigInput!)`
  (create-or-update, keyed on `config._id`) and `helpCenterConfigRemove(_id)`.
  Reads check `showHelpCenter`, writes check `helpCenterManage`.
  `HelpCenterConfig` and `HelpCenterConfigInput` both carry `formChannelId`,
  `formIds`, `cmsId` and `cmsAppToken` alongside the ticket and knowledge base
  fields.
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

### Consumes

- `core` over tRPC — `cpUsers.get` (query, `{ id }`), which backs
  `Survey.createdCpUser`; `companies.findOne` (query), `companies.createCompany` and
  `companies.updateCompany` (mutations, `{ _id, doc }` / `{ doc }`),
  `customers.createMessengerCustomer` / `updateMessengerCustomer`,
  `conformity.create`, and `fields.generatePropertiesData`, which splits
  messenger `companyData` into `propertiesData` for keys that match a Core
  `core:company` field and `trackedData` for every remaining key.
- `core` over tRPC — `cpNotifications.create`
  (mutation, `{ cpUserIds, clientPortalId, eventType, data }`), which files a
  client portal notification for a survey requester. `data.type` must be one
  of `info | success | warning | error`, and `kind: 'system'` with
  `allowMultiple: true` keeps each review outcome a separate notification
  instead of overwriting the previous one for the same `contentTypeId`. The
  `clientPortalId` comes from `cpUsers.get`, not from the survey.
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

### `2026-09-23` — Shared Graph POST helper (Sonar new-code duplication)

- **Summary:** `sendWhatsappText` / `sendWhatsappMedia` now delegate to a
  single `graphPost(path, accessToken, payload?, fallbackError?)` helper
  (placed above its callers) instead of each owning its own fetch + error
  path, removing the triplicated Graph request boilerplate that was inflating
  new-code duplication above Sonar’s 3% gate. Error shape and
  `MetaGraphError` behavior are unchanged.
- **Affected areas:** `src/modules/integrations/whatsapp/utils.ts`
- **Contracts changed:** None.

### `2026-09-23` — CI review round: webhook mid dedup, plugin-before-core update, config key rejection

- **Summary:** The inbound webhook now checks
  `WhatsappConversationMessages.findOne({ mid })` immediately after content
  extraction — before `getOrCreateCustomer` and the conversation sync — so a
  Meta redelivery returns before a conversation can be reopened;
  `integrationsEditCommonFields` awaits `sendUpdateIntegration` and throws on
  `{ status: 'error' }` before the core `Integrations.updateOne`, so a
  rejected `phoneNumberId` never leaves core holding bad details (every
  update handler reads only its own plugin collection, so the reorder is
  safe for all kinds); `whatsappUpdateConfigs` rejects unknown
  `configsMap` keys with an actionable error instead of silently dropping
  them (the UI sends only `WHATSAPP_VERIFY_TOKEN`); and
  `WhatsappConversationMessages.createMessage` maps a duplicate-`mid`
  E11000 to the existing message, making `addMessage` /
  `handleWhatsappMessage` retries idempotent on the local store. A full
  outbound-intent outbox for Meta-side send idempotency remains deferred.
- **Affected areas:**
  `src/modules/integrations/whatsapp/controller/receiveMessage.ts`,
  `src/modules/integrations/whatsapp/graphql/resolvers/mutations.ts`,
  `src/modules/integrations/whatsapp/db/models/ConversationMessages.ts`,
  `src/modules/inbox/graphql/resolvers/mutations/integrations.ts`
- **Contracts changed:** `whatsappUpdateConfigs` now throws on an unknown
  config key; `integrationsEditCommonFields` validates the plugin update
  before writing core. No schema or GraphQL type change.

### `2026-09-23` — WhatsApp integration gaps closed: unique phone routing, media replies, token refresh

- **Summary:** `whatsapp_integrations.phoneNumberId` is now unique per tenant
  and `whatsappCreateIntegration` / `updateIntegration` reject a number
  already used by another integration before writing (a lost E11000 race on
  create maps to the same friendly error), so the webhook's
  `findOne({ phoneNumberId })` cannot mis-route messages. Dead surfaces are
  gone: GraphQL `whatsappGetIntegrations` / `whatsappGetIntegrationDetail`
  with their `IKindParams` / `IDetailParams`, the per-integration
  `verifyToken` field (create/update `$set`, schema, type) and the handshake's
  per-integration branch — `GET /whatsapp/receive` matches only a non-empty
  `WHATSAPP_VERIFY_TOKEN` config, which `whatsappUpdateConfigs` still
  allow-lists — and the unreachable `doc.internal` branch of
  `handleWhatsappMessage` (the inbox returns internal messages before
  dispatch). Outbound replies now send every attachment through the Cloud API
  media message (`sendWhatsappMedia`, type from the mime prefix, default
  `document`) after the text, throw when an attachment has no `url`, reject
  empty content only when there is neither text nor attachments, and store the
  attachments on the local message. WhatsApp integrations store the Facebook
  `accountId`, and `loginMiddleware` `$set`s their copied `accessToken` to
  the renewed account token after the Facebook repair loop.
- **Affected areas:**
  `src/modules/integrations/whatsapp/{db/definitions/integrations,@types/{integrations,utils},helpers,controller/controller,handleWhatsappMessage,utils,graphql/schema/whatsapp,graphql/resolvers/queries}.ts`,
  `src/modules/integrations/facebook/middlewares/loginMiddleware.ts`
- **Contracts changed:** removed queries `whatsappGetIntegrations` and
  `whatsappGetIntegrationDetail` (and `IKindParams` / `IDetailParams`);
  `whatsapp_integrations` unique index on `phoneNumberId`, field `accountId`
  added, field `verifyToken` removed; handshake accepts only
  `WHATSAPP_VERIFY_TOKEN`; new `sendWhatsappMedia` / `whatsappMediaTypeFromMime`
  utils.

### `2026-09-23` — WhatsApp integrations harden webhook, permissions, and data integrity

- **Summary:** Create or update a WhatsApp integration still calls
  `POST /{wabaId}/subscribed_apps` so Meta delivers webhooks, and still
  refuses a phone number whose Cloud API `status` is not `CONNECTED` — but the
  whole path is now verified and typed end to end: the `GET /whatsapp/receive`
  handshake rejects a missing `hub.verify_token` with 403 (an empty config can
  no longer match an empty query), `POST /whatsapp/receive` verifies Meta's
  `X-Hub-Signature-256` HMAC-SHA256 over `req.rawBody` against
  `FACEBOOK_APP_SECRET` before any payload is parsed (fail-closed 403), and
  Graph API failures surface as a typed `MetaGraphError` carrying the Meta
  `error.code` so only `100 Unsupported get request` is suppressed while auth
  and rate-limit errors propagate. WhatsApp GraphQL resolvers now enforce the
  registered permissions (`integrationsEdit` / `showIntegrations` /
  `showConversations`), `whatsappUpdateConfigs` allow-lists
  `WHATSAPP_VERIFY_TOKEN` as a non-empty string, integration list/detail
  projections exclude `accessToken`, and message pagination clamps
  `limit`/`skip`. On update, a changed `phoneNumberId`/`businessAccountId` is
  re-validated against the stored token with the same `assertPhoneReady`
  logic create uses; `$set` only touches known fields. Removing an already
  deleted plugin integration returns success-shaped so core deletion proceeds,
  while any other remove failure throws and blocks deletion;
  `integrationsEditCommonFields` checks `integrationsEdit` explicitly (the
  group wrapper skips permission). Customer upsert is atomic on
  `{userId, integrationId}` (compound unique index) with duplicate-key
  recovery, and a failed core-customer sync leaves the mirror row for the next
  webhook instead of deleting it. Inbound non-text messages are logged and
  dropped via `debugWhatsapp`; text messages publish once through
  `receiveInboxMessage` `create-conversation-message` (no double
  `pConversationClientMessageInserted` + `graphqlPubsub.publish`); local
  `mid` is unique (sparse index) with E11000-safe insert and rollback if the
  inbox mirror fails. Config upsert is a single `findOneAndUpdate`, schemas use
  explicit `{ type: ... }`, `addMessage` preserves `doc.userId` when the
  optional argument is omitted, `whatsappStatus` and
  `GET /whatsapp/get-status` report `Integration not found` for a missing
  integration, `whatsappGetIntegrationDetail` requires `erxesApiId: String!`,
  and the outbound HTML sanitizer is a single-pass `</p>` → newline +
  `stripHtml`. Cross-store idempotency on shared `ConversationMessages.mid` is
  skipped: the shared schema has no `mid` field.
- **Affected areas:** `src/modules/integrations/whatsapp/{controller/{controller,receiveMessage,store},helpers,utils,messageBroker,handleWhatsappMessage,db/{definitions/*,models/{Customers,Config,ConversationMessages}},@types/utils,graphql/{schema/whatsapp,resolvers/{mutations,queries}}}.ts`,
  `src/modules/inbox/graphql/resolvers/mutations/integrations.ts`,
  `src/connectionResolvers.ts`
- **Contracts changed:** `whatsappGetIntegrationDetail(erxesApiId: String!)`;
  `IWhatsappIncomingMessage` gains non-text media fields;
  `loadWhatsappCustomerClass(models)` now requires models;
  `IWhatsappCustomerModel.getOrCreateByPhone`;
  `whatsapp_customers` compound unique index on `{userId, integrationId}`;
  `whatsapp_conversation_messages` sparse unique index on `mid`;
  webhook handshake 403 on mismatch/empty token; webhook 403 on bad/missing
  `X-Hub-Signature-256`.

### `2026-09-23` — A survey question carries attachments

- **Summary:** Each survey step takes up to five `AttachmentInput` files,
  normalized inside `normalizeSurveySteps`, stored on the step, served back as
  `SurveyStep.attachments` and copied into the conversation snapshot so a
  respondent sees them with the question. Agents (`SurveyStepInput`) and
  client portal requesters (`CpSurveyStepInput`) use the same field.
- **Affected areas:** `src/modules/survey/db/definitions/surveys.ts`,
  `src/modules/survey/db/models/Surveys.ts`,
  `src/modules/survey/@types/survey.ts`,
  `src/modules/survey/utils.ts`,
  `src/modules/survey/graphql/schema/survey.ts`
- **Contracts changed:** `SurveyStepInput` and `CpSurveyStepInput` take
  `attachments: [AttachmentInput]`; `SurveyStep` exposes
  `attachments: [Attachment]`; the survey-level `Survey.attachments` field and
  the `cpSurveyAdd` / `cpSurveyEdit` `attachments` arguments added earlier the
  same day are gone.

### `2026-09-23` — Agents reject a survey request with a reason, and the requester is told

- **Summary:** Survey status gains `rejected`; `surveyToggleStatus` moves a
  request there only from `pending` and only with a non-empty `reason`, which
  is stored and served as `Survey.rejectionReason` and cleared by any later
  status change or requester edit. Approving or rejecting a request now also
  files a client portal notification for its requester over `core`'s
  `cpNotifications.create`. `surveyTotalCount.byStatus` reports the
  count, the portal's voting reads keep ignoring it, and its requester may
  still edit it — which resubmits it as `pending` — or remove it.
- **Affected areas:** `src/modules/survey/db/definitions/surveys.ts`,
  `src/modules/survey/db/models/Surveys.ts`,
  `src/modules/survey/@types/survey.ts`,
  `src/modules/survey/notifications.ts`,
  `src/modules/survey/graphql/schema/survey.ts`,
  `src/modules/survey/graphql/resolvers/mutations/surveys.ts`,
  `src/modules/survey/graphql/resolvers/queries/surveys.ts`
- **Contracts changed:** `surveyToggleStatus` accepts `reason: String`;
  `Survey` exposes `rejectionReason: String`; survey `status` accepts
  `rejected` and `surveyTotalCount.byStatus` reports a `rejected` count.

### `2026-09-23` — A client portal user manages their own survey requests

- **Summary:** `cpSurveyRequests` lists the caller's own requests in every
  status, and `cpSurveyEdit` / `cpSurveyRemove` let the requester revise or
  delete one while it is still `pending`; both mutations refuse another user's
  request and a request that has already been approved or archived, an edit
  keeps the voting-only projection and the `pending` status and re-stamps
  `brandId` when the channel changes, and a remove clears the vote ledger with
  the survey.
- **Affected areas:** `src/modules/survey/db/models/Surveys.ts`,
  `src/modules/survey/graphql/resolvers/mutations/clientPortal.ts`,
  `src/modules/survey/graphql/resolvers/queries/clientPortal.ts`,
  `src/modules/survey/graphql/schema/survey.ts`
- **Contracts changed:** added query `cpSurveyRequests` and mutations
  `cpSurveyEdit` and `cpSurveyRemove`.

### `2026-09-23` — `cpSurveyVotes` reads a customer's votes

- **Summary:** `cpSurveyVotes` takes `conversationId`, `customerId` or both;
  a `customerId` returns that customer's vote selections regardless of the
  caller's voter id, while a `customerId`-less call keeps the previous
  caller-scoped `voterId` filter, and a call with neither argument is rejected.
- **Affected areas:**
  `src/modules/survey/graphql/resolvers/queries/clientPortal.ts`,
  `src/modules/survey/graphql/schema/survey.ts`
- **Contracts changed:** `cpSurveyVotes(conversationId: String, customerId: String)`
  — `conversationId` is no longer required.

### `2026-09-22` — A help center stores its forms and the CMS behind its announcements

- **Summary:** A help center config now keeps the ticket channel's forms
  (`formChannelId`, `formIds`) and the content CMS its announcements come from
  (`cmsId`, `cmsAppToken`); `normalizeHelpCenterConfig` was split into one
  normalizer per group (identity, knowledge base, tickets, CMS), which refuses
  a `cmsId` without an app token and de-duplicates `formIds`, and
  `HelpCenterConfig.getChannelFormIds` drops on write every form that does not
  belong to `formChannelId`.
- **Affected areas:**
  `src/modules/helpcenter/{@types/helpCenterConfig,db/definitions/helpCenterConfig,db/models/HelpCenterConfig,graphql/schemas/helpCenterConfig,utils/helpCenterConfig}.ts`
- **Contracts changed:** `HelpCenterConfig` and `HelpCenterConfigInput` gained
  `formChannelId`, `formIds`, `cmsId` and `cmsAppToken`;
  `frontline_help_center_configs` carries the same four fields.

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
