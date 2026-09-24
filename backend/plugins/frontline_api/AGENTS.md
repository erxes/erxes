# `frontline_api` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/frontline_api`
- **Last synchronized:** `2026-09-24`

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

- A ticket raised from a help center tells the person who raised it what
  happens to it: a confirmation when it is created, a notification when the
  team posts a reply the portal can see, and one when the ticket moves to a
  new status. Each is filed as a client portal notification against
  `frontline:ticket`, so the help center can link straight back to the ticket.
- A ticket an automation creates records `createdVia` — what produced it, which
  run, and for whom — and is created as that actor when no conversation agent
  applies.
- Two Facebook workflow templates ship with the plugin through
  `automations.constants.workflowTemplates`: `frontline.facebook.comment-then-dm`
  (public comment reply, then a Messenger message) and
  `frontline.facebook.reply-and-ticket` (reply, then create a ticket). They are
  code, never tenant documents, so they exist on a fresh deployment and cannot
  go stale; a copy is materialized only when someone installs one. Both begin
  from an existing message/comment target, so neither is offered on a broadcast
  campaign, whose steps run against a customer. The ticket one declares
  `frontline:tickets.channel|pipeline|status` requirements that are answered
  before it can be installed.
- Surveys are a reusable definition (`title`, ordered `steps`, optional
  `durationHours`, optional `brandId`, `active`/`archived` status) owned by a
  channel through `channelId`. Each step is one question with its own `name`,
  `description`, ordered `options` and `allowMultiselect`, so a survey can ask
  several questions in sequence. Step 1 stays mirrored on the survey's
  top-level `question` / `options` / `allowMultiselect`, which is what every
  reader written against the single-question shape still sees. An agent posts
  one into a messenger conversation with `surveySendToConversation`, which
  writes a snapshot to the message's `extraData.survey`, bumps the survey's
  `sentCount` and sets `hasSurvey` on the conversation. Client portal users
  vote through `cpSurveyVote`; each vote recomputes the tallies, marks the
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
| HTTP                     | `src/routes.ts`                                                             | Mounts the `/facebook`, `/instagram`, `/mail`, and (when enabled) `/callpro` webhook routers                                                                                                           |
| Platform extensions      | `src/meta/`                                                                 | automations, permissions, notifications, segments, references, import/export                                                                                                                           |
| Channels                 | `src/modules/channel/`                                                      | Channel + ChannelMember models, schema, resolvers, role checks                                                                                                                                         |
| Inbox                    | `src/modules/inbox/`                                                        | Conversations, messages, integrations, widget/clientportal schemas, `receiveInboxMessage`                                                                                                              |
| Conversation queries     | `src/conversationQueryBuilder.ts`, `src/modules/inbox/conversationUtils.ts` | Mongo and Elasticsearch conversation filters (membership-scoped)                                                                                                                                       |
| Integrations             | `src/modules/integrations/<kind>/`                                          | facebook, instagram, mail, discord, call, callpro, trpc                                                                                                                                                |
| Mail integration         | `src/modules/integrations/mail/`                                            | Inbound webhook, threading, outbound send/retry                                                                                                                                                        |
| Pipeline mail            | `src/modules/integrations/mail/utils/{pipeline,allocate,settings,scope}.ts` | Gives a ticket pipeline an address of its own, and keeps the two mail lanes apart                                                                                                                      |
| Note ↔ mail              | `src/modules/integrations/mail/utils/{notes,tickets,thread,noteContent}.ts` | Mails an agent's note from the pipeline address as a reply on the requester's thread, and turns an inbound reply back into a note                                                                      |
| Mail transports          | `src/modules/integrations/mail/utils/transports/`                           | `index.ts` picks the Cloudflare account that signs for this workspace, `deliver.ts` runs the delivery pipeline (sender guard, suppression, delivery log), `cloudflare.ts` is the only `IMailTransport` |
| Mail provisioning        | `src/modules/integrations/mail/utils/cloudflare/`                           | Cloudflare REST client, the fourteen-step provisioner, Email Sending onboarding and quota, the connection cache and its public shape                                                                   |
| Mail worker bundle       | `src/modules/integrations/mail/worker/bundle.generated.ts`                  | The minified worker uploaded to a tenant's account, regenerated by `npm run bundle` in `cloudflare/mail-worker`                                                                                        |
| Call Pro                 | `src/modules/integrations/callpro/`                                         | `CALLPRO_ENABLED` gate, `/callpro/receive` webhook, mirrored line/caller/call, recording URL                                                                                                           |
| Call reporting           | `src/modules/reports/callReportService.ts`                                  | CDR filter, leg-to-call folding, and the per-queue/agent/number report computation                                                                                                                     |
| FB automation            | `src/modules/integrations/facebook/meta/automation/`                        | Comment/message triggers and actions, bot message generation                                                                                                                                           |
| FB page posting          | `src/modules/integrations/facebook/postService.ts`, `postGuard.ts`          | Post publishing pipeline (validation, photo staging, cleanup, permalink) and its rate limit + audit log                                                                                                |
| FB app resolution        | `src/modules/integrations/facebook/commonUtils.ts`                          | `resolveFacebookApp`, `facebookAppSelector`, `facebookAccountSelector`                                                                                                                                 |
| Ticket                   | `src/modules/ticket/`                                                       | Boards, pipelines, statuses, tickets, activities, notes                                                                                                                                                |
| Forms                    | `src/modules/form/`                                                         | Forms, fields, submissions                                                                                                                                                                             |
| Surveys                  | `src/modules/survey/`                                                       | Survey definitions, vote ledger, message snapshot, tally refresh                                                                                                                                       |
| Survey ticket automation | `src/modules/survey/ticketAutomation.ts`                                    | Threshold evaluation, atomic single-ticket claim, ticket creation                                                                                                                                      |
| Knowledge base           | `src/modules/knowledgebase/`                                                | Topics, categories, articles, AI knowledge source                                                                                                                                                      |
| Help center              | `src/modules/helpcenter/`                                                   | Client portal configs: general settings and appearance for a published help center                                                                                                                     |
| Reports                  | `src/modules/reports/`                                                      | Inbox/ticket report aggregations, `buildTicketMatch`, and the saved `ReportCharts` model                                                                                                               |
| Migrations               | `src/migrations/`                                                           | Plugin-owned data migrations                                                                                                                                                                           |
| Area                     | Path                                                                        | Responsibility                                                                                                                                                                                         |
| --------------------     | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
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
| Survey ticket automation | `src/modules/survey/ticketAutomation.ts`                                    | Threshold evaluation, atomic single-ticket claim, ticket creation                                                                                                                                      |
| Channel resource moves   | `src/modules/channel/moveResources.ts`                                      | Per-type move descriptors, `validateChannelMove`, and the `moveChannelResources` service behind `channelMoveResources`                                                                                 |
| Knowledge base           | `src/modules/knowledgebase/`                                                | Topics, categories, articles, AI knowledge source                                                                                                                                                      |
| Help center              | `src/modules/helpcenter/`                                                   | Client portal configs: general settings and appearance for a published help center                                                                                                                     |
| Reports                  | `src/modules/reports/`                                                      | Inbox/ticket report aggregations, `buildTicketMatch`, and the saved `ReportCharts` model                                                                                                               |
| Pipeline mail            | `src/modules/integrations/mail/utils/{pipeline,tickets,scope}.ts`           | A ticket pipeline's own address: its settings, the status new mail opens a ticket in, and ticket creation from an inbound message                                                                      |
| Survey ticket automation | `src/modules/survey/ticketAutomation.ts`                                    | Threshold evaluation, atomic single-ticket claim, ticket creation                                                                                                                                      |
| Knowledge base           | `src/modules/knowledgebase/`                                                | Topics, categories, articles, AI knowledge source                                                                                                                                                      |
| Help center              | `src/modules/helpcenter/`                                                   | Client portal configs: general settings and appearance for a published help center                                                                                                                     |
| Reports                  | `src/modules/reports/`                                                      | Inbox/ticket report aggregations, `buildTicketMatch`, and the saved `ReportCharts` model                                                                                                               |
| Survey notifications     | `src/modules/survey/notifications.ts`                                       | Client portal notification for an approved or rejected survey request                                                                                                                                  |
| Migrations               | `src/migrations/`                                                           | Plugin-owned data migrations                                                                                                                                                                           |

## Contracts

### Provides

- GraphQL: help center configs — `helpCenterConfig(_id)`,
  `helpCenterConfigs(page, perPage, searchValue, brandId)`,
  `helpCenterConfigsTotalCount(searchValue, brandId)`;
  `helpCenterConfigUpdate(config: HelpCenterConfigInput!)` (create-or-update,
  keyed on `config._id`) and `helpCenterConfigRemove(_id)`. Reads check
  `showHelpCenter`, writes check `helpCenterManage`.
- GraphQL: `helpCenterGetConfigByDomain(clientPortalName: String): HelpCenterConfig` —
  the published site's own bootstrap read, the help center counterpart of the
  1.x `clientPortalGetConfigByDomain` lookup. It is the **one public operation
  in this module** (`wrapperConfig.skipPermission`): the site calling it has no
  staff user, no `cpUser` and no client portal header yet, because the domain
  is how it discovers which help center it is. Like the 1.x signature it
  mirrors, `clientPortalName` is accepted but not read: the query resolver's
  `getByHost` takes the domain from the request's `Origin` header alone, so a
  server-side caller must set that header itself. After the same
  normalization the write path applies, it returns the config whose `url`
  starts with that origin (escaped, case-insensitive, ending at a `/` or the
  end of the string), and throws `Not found` when no origin was supplied or no
  help center claims it. Never add a permission check to it, never drop the
  regex escape or the empty-origin guard (an empty pattern matches every
  config), and never widen it into a list.
- GraphQL: `HelpCenterConfig.brand` resolves the federated `Brand`; its
  `kbTopic` resolves the `KnowledgeBaseTopic` named by `kbTopicId`.
- Nothing in this module is named `clientPortal*`, and it must stay that way.
  `core-api` owns the real client portal — portal users, auth, OAuth — and
  already publishes its own `ClientPortalConfigInput` with different fields; two
  subgraphs declaring one input name with different fields is a federation
  composition error, and the two domains are unrelated besides. A help center's
  settings are `helpCenterConfig*` operations over `HelpCenterConfig` types in
  `frontline_help_center_configs`.
- GraphQL: surveys — `surveyList(searchValue, status, channelId, cursor params)`,
  `surveyDetail(_id)`, `surveyTotalCount(searchValue, status, channelId)`; `surveyAdd`,
  `surveyEdit` (both taking `brandId` and `steps: [SurveyStepInput!]`, with the
  legacy `question` / `options` arguments now optional), `surveyRemove(_ids)`,
  `surveyToggleStatus(_ids, status)`, and
  `surveySendToConversation(_id, conversationId)` which returns the created
  `ConversationMessage`. `Survey.steps` always returns at least one step, synthesising
  it from the top-level fields for a survey saved before steps existed.
  `Survey.results` is a field resolver that aggregates the
  vote ledger across every conversation the survey was sent to; it reports
  `steps: [SurveyStepResult!]!` with a per-step `totalVotes` and per-step
  percentages, and `options` remains the flat list across every step.
- GraphQL (client portal): `cpSurveys(searchValue, channelId, brandId,
cursor params)` returns `CpSurveyListResponse` — a cursor page of
  `{ survey, votedOptionIds }` over active surveys only. `cpSurveyDetail(channelId,
surveyCode)`, `cpSurveyVotes(conversationId)` and
  `cpSurveySubmit(surveyCode, optionIds)` take no `visitorId`; the caller is read
  from the client portal session.
- GraphQL (public widget, `skipPermission`): `widgetsSurveyConnect(channelId,
surveyCode, cachedCustomerId)` returns the active survey plus the caller's
  previous selection; `widgetsSurveySubmit(surveyCode, optionIds,
cachedCustomerId)` files a site answer as a new conversation.
- GraphQL (public widget, `skipPermission`): `widgetsSurveyVotes(conversationId,
customerId, visitorId)` returns the voter's own selections for the
  conversation; `widgetsSurveyVote(messageId, optionIds, customerId, visitorId)`
  records a vote and returns the refreshed `ConversationMessage`.

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
- GraphQL: `mailPipelineConnect(pipelineId!, senderName, forwardFrom)`,
  `mailPipelineUpdate(pipelineId!, senderName, forwardFrom)`,
  `mailPipelineForwardVerified(pipelineId!)` (all `MailPipelineIntegration`)
  and `mailPipelineDisconnect(pipelineId!): Boolean` — all require
  `integrationsEdit` **and** pipeline access. Connect derives the address from
  the pipeline name and writes one `mail_integrations` row carrying
  `pipelineId`; disconnect marks that row disabled rather than deleting it, so a
  later connect revives the same row, the same address and the same thread
  scope. A pipeline address can be written to directly or reached by forwarding
  from an existing mailbox named in `forwardFrom`.
- Setting or changing `forwardFrom` opens a verification window on the row
  (`forwardPendingAt`, `MAIL_FORWARD_VERIFICATION_WINDOW_MS`, 24h). While that
  window is open, an inbound message that looks like a forwarding confirmation
  is stored on the row as `forwardVerification` and answered `ignored` instead
  of opening a ticket, so the provider's confirmation code never becomes a
  junk ticket and is never dropped by the auto-reply filter. The window closes
  when `mailPipelineForwardVerified` is called, when `forwardFrom` is cleared,
  or when 24h elapse. `MailPipelineIntegration.awaitingForwardVerification`
  answers whether the window is still open.
- GraphQL: `mailPipelineIntegration(pipelineId!): MailPipelineIntegration` —
  requires `showIntegrations` and pipeline access, and answers `null` for a
  pipeline with no address or a disconnected one.
- GraphQL: a note that is not `isInternal` on a pipeline that owns a mail
  address is also sent to the requester, and the note carries the
  `mailMessageId` of the message it produced. An `isInternal` note stays inside
  the team's ticket detail and is never mailed. `ticketGetNotes(contentId!,
isInternal)` is the agent-side list and requires `showTickets`.
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
  `clientPortalId` comes from `cpUsers.get`, not from the survey. Ticket
  events file the same way with `kind: 'user'` and no `allowMultiple`, which
  upserts one live notification per `(contentType, contentTypeId, cpUser)` —
  the newest ticket event replaces the previous unread one instead of stacking.
  The portal account behind a ticket is resolved from its `cp:<id>` author with
  `cpUsers.get` by `{ id }` and then by `{ erxesCustomerId }`, because a ticket
  records whichever of the two the portal session carried.
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

### `2026-09-24` — A portal ticket tells the person who raised it what happened

- **Summary:** Tickets raised from a help center now file client portal
  notifications: a confirmation on `cpCreateTicket`, a reply notification when
  a non-internal note is written by someone who is not the portal author, and a
  status notification naming the status the ticket moved to. The portal account
  is resolved from the ticket's `cp:<id>` author, nobody is notified about
  their own change, and a failed notification never fails the ticket write.
- **Affected areas:** `src/modules/ticket/utils/cpNotifications.ts` (new),
  `src/modules/ticket/graphql/resolvers/mutations/clientPortal.ts`,
  `src/modules/ticket/db/note.ts`,
  `src/modules/ticket/db/models/Ticket.ts`
- **Contracts changed:** `None` — the notifications go through the existing
  `core` tRPC procedures `cpUsers.get` and `cpNotifications.create`.

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

### `2026-09-21` — The ticket action says it needs someone to act for

- **Summary:** `Create ticket` now declares `requiresActor: true`. The ticket it
  opens is assigned from the run's `createdVia.actorId` when the conversation
  names nobody, so the builder can tell whether an automation about to go live
  will create records that belong to a person. Assignment itself is unchanged.
- **Affected areas:**
  `src/modules/ticket/meta/automations/ticketAutomationsConstants.ts`
- **Contracts changed:** The action descriptor carries `requiresActor`, a field
  `erxes-api-shared` added for every plugin to use.

### `2026-09-21` — Automation actions state their outcome instead of returning quietly

- **Summary:** Every automation action this plugin owns now answers with the
  shared outcome envelope, so the engine stops reading "did not throw" as
  success. Facebook reports `window-closed` and `send-blocked` as skips, the
  inbox bot reports `no-conversation`, `nothing-to-send` and `no-reply-text`,
  and a `collectionType` none of these modules handles is now a stated
  `CONFIG_INVALID` failure rather than a silent no-op. Instagram is left
  untouched on purpose.
- **Affected areas:**
  `src/modules/integrations/facebook/meta/automation/{messages,comments}/index.ts`,
  `src/modules/integrations/facebook/meta/automation/workers.ts`,
  `src/modules/integrations/discord/meta/automation/workers.ts`,
  `src/modules/inbox/meta/automation/workers.ts`,
  `src/modules/ticket/meta/automations/ticketAutomationsProducers.ts`
- **Contracts changed:** The `receiveActions` producer may now answer with
  `{ outcome, result }` from `erxes-api-shared/core-modules`
  (`buildSkippedAction` / `buildFailedAction`). Plain results are unchanged and
  still count as success.

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
