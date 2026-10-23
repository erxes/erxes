# `frontline_api` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/frontline_api`
- **Last synchronized:** `2026-10-23`

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
- Knowledge base: topics, categories, articles, scheduled article publishing,
  and the AI knowledge source provider that indexes articles.
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

- Telegram bot setup and webhook status; private chats, groups, channels and
  forum topics; text, files, media, polls, edits, observed reactions and visible
  fallbacks. Long replies split into complete ordered text chunks, with caption
  overflow sent after the media. Inbox replies use the provider dispatcher in
  `inbox/graphql/resolvers/mutations/conversationAutomation.ts`, while
  `conversationMessageMutations.ts` owns canonical storage and publication.

- Messenger `uiOptions` stores the appearance step: logo pair, colours,
  `heroStyleVariant`, `navigationVariant`, and the `isSupportInAppView` flag.
  `saveMessengerAppearanceData` lists every field explicitly — a new
  `uiOptions` field must be added there or it is silently dropped.
- The Erxes Messenger Message trigger (`frontline:inbox.messages`) can be
  scoped to one messenger through `config.integrationId`. The widget puts the
  message's `integrationId` on the trigger target; `checkCustomTrigger` rejects
  other messengers. An empty `integrationId` fires for every messenger — keep
  that, existing automations rely on it.
- A messenger ticket form only offers live property options: the config keeps
  the options it was saved with, and `widgetsMessengerConnect` re-reads them
  from core (`withLiveTicketOptions`) so an option archived since stops
  showing. Archived options are dropped when a config is saved, too.
- A ticket raised from a help center tells the person who raised it what
  happens to it: a confirmation when it is created, a notification when the
  team posts a reply the portal can see, and one when the ticket moves to a
  new status. Each is filed as a client portal notification against
  `frontline:ticket`, so the help center can link straight back to the ticket.
- A ticket holds a single `branchId` / `departmentId`, settable on both
  `createTicket` and `updateTicket`; changing them can move the ticket out of
  view for users on an `isCheckBranch` / `isCheckDepartment` pipeline.
- `src/migrations/migrateForms.ts` copies a v2 form field into
  `frontline_form_fields` when its `contentType` is `form` or its
  `contentTypeId` is a migrated form, and always writes `contentType: 'form'`,
  the exact value the `Form.fields` resolver reads. Re-running it overwrites
  the target field with the source copy.
- `src/migrations/migrateTickets.ts` migrates v2 `tickets_pipelines`,
  `tickets_stages`, `tickets`, `ticket_comments` and checklists into the
  frontline ticket collections. Pipelines and new tickets get `channelId` from
  `STATIC_CHANNEL_ID` (default `9H8jJQrCbXdWb4FoX`), and it is a dry run unless
  `DRY_RUN=false`. New tickets get `priority` from the v2 label
  (`low`/`minor` 1, `normal`/`medium` 2, `high`/`major` 3, `critical`/`urgent`
  4), `statusType` from the migrated status, all `assignedUserIds` as
  `assignedMembers`, the first `departmentIds`/`branchIds` entry as
  `departmentId`/`branchId`, and `propertiesData` parsed against
  `properties_fields`/`properties_groups` by `_id` (option values lowercased to
  match migrated options, `date` → `Date`, `number` → `Number`, multiple-group
  rows under `toPropertyGroupKey`; free text keeps its case). Already-migrated
  tickets are repaired in place: only empty `priority`/`statusType`/
  `assignedMembers`/`departmentId`/`branchId` are filled, and `propertiesData`
  is replaced only while it is empty or still the raw v2 copy, so values edited
  in v3 are kept. It reports property field ids with no definition and fields
  whose `contentType` is not `frontline:ticket` (the ticket detail only lists
  `frontline:ticket` fields). Ticket↔customer/company links live in v2
  `conformities` and are moved by core `migrateConformitiesToRelations`.
- `src/migrations/migrateCallProConversationCustomers.ts` repairs Call Pro
  conversations saved without `customerId`: it sets `callProPhone` from
  `conversations_callpros.recipientPhoneNumber`, links the customer when exactly
  one non-deleted core customer has that phone (and back-fills the empty
  `customers_callpros.erxesApiId`), and fills `callProPotentialCustomerIds`
  when several do. Customers are looked up in one `$in` query because
  `customers` phone fields may be unindexed. It is a dry run unless
  `DRY_RUN=false`, and backs up touched conversations into
  `conversations_bak_callpro_customers` before writing.
- `src/migrations/migrateLegacyIntegrations.ts` copies provider data from the
  legacy v2 `erxes_facebook` (`LEGACY_FACEBOOK_DB`) and v1 `erxes_integrations`
  (`LEGACY_INTEGRATIONS_DB`) databases into the frontline collections of the
  `MONGO_URL` database. v2 Facebook data is copied first so it wins over v1 on
  the `customers_facebooks.userId` and `conversations_facebooks`
  (`senderId`, `recipientId`) unique indexes; duplicate-key rejections are
  counted as `duplicates`, not failures. A provider integration is copied only
  when its inbox integration exists and no provider integration already claims
  that inbox. v1 `integrations` are split by `kind` into `facebook_integrations`
  and `integrations_callpros` (`erxesApiId` becomes `inboxId`); `chatfuel` is
  skipped. v1 `comments_facebooks` becomes `comment_conversations_facebooks`
  (`commentId` → `comment_id`, `timestamp` → `createdAt`), comments/posts get
  `integrationId` from the v1+v2 `facebook-post` page mapping, and v1 messages
  are copied only when their conversation exists. v2
  `facebook_messengers_bots` get the required `createdBy`/`updatedBy` from
  `BOT_OWNER_USER_ID` or the owner user, string persistent-menu `_id`s, and an
  unknown menu `type` becomes `button`. Legacy `_id`s are kept because
  provider rows and automations link by `_id`. It is insert-only and safe to
  re-run; it is a dry run unless `DRY_RUN=false`.
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
- A Facebook message action with an **Input** message waits for the person's
  next typed message (`meta/automation/messages/inputWait.ts`). It stores
  `conversations_facebooks.inputWait` (`executionId`, `actionId`,
  `replyConnectId`, `expiresAt` from the step's "Wait for"). The next typed
  direct message claims it once and resumes the run through `repeatOptions`
  with the trigger `botId` as the "If Reply" connect; the
  `facebookInputTimeout` queue resumes `ifNotReply` at expiry if nobody
  claimed it. Nothing is stored when neither branch is connected.
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

- Forms are taggable as `frontline:form`. Core `tagsTag` reaches the
  `form.tag` tRPC procedure (`modules/form/trpc/form.ts`), whose `tagObject`
  action writes `Forms.tagIds` and whose `count` action counts forms carrying a
  tag. The `forms`/`formsMain`/`cpForms`/`formsTotalCount` queries filter by
  `tagId`, expanded with the tag's `relatedIds` from core `tags.findOne`.
  `formsTotalCount.byTag` and `byChannel` count forms per tag and per channel,
  one aggregation each, over the caller's visible forms with the list's filters
  minus their own group: `byTag` drops `tagId`, `byChannel` drops `channelId`
  and `tagId`. Picking a channel or tag therefore never zeroes the other
  entries in the forms page sidebar.

- Ticket pipelines may persist a `createLayout`: rows (max 4) of placeable
  system codes (`TICKET_CREATE_LAYOUT_SYSTEM_CODES` in
  `modules/ticket/utils/pipelineCreateLayout.ts`) and `property:<fieldId>`.
  Saving validates it: unknown or fixed codes are refused, deleted properties
  dropped; `null` means the default form. There is no separate detail
  selection: `propertyIds` and `isPropertySelectionConfigured` were removed
  (old values stay in Mongo, unread).
- Ticket meta system fields: name, channel, pipeline, status are
  `alwaysFilled` + `outsideLayout`; description is `outsideLayout`; the
  placeable chips are `visibleToCreateByDefault`; number, labels, companies and
  attachments are `notOnCreate`. Core caches plugin meta until it restarts, so
  a meta change needs a core restart to show in rules.
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
- Lists the latest posts of the connected pages to a client portal
  (`facebookGetPosts`), the 2.x query sites use to show a brand's Facebook feed.
- Resolves the Meta app per integration kind, so page posting can run on its own
  `FACEBOOK_POST_APP_ID`/`FACEBOOK_POST_APP_SECRET` credentials while Messenger
  keeps the shared app.
- The **Form submitted** trigger (`frontline:form.submissions`) fires from
  `widgetsSaveLead` and `cpWidgetsSaveLead` after the submission rows are
  saved. The target is `TFormSubmittedTriggerTarget`: `_id` is the submission
  `groupId`, plus `formId`, `channelId`, `customerId`, `conversationId` and
  `fieldValues` keyed by form field id. Config is `{ channelId?, formId,
  conjunction: 'and' | 'or', conditions: [{ fieldId, operator, value? }] }`;
  `checkCustomTrigger` (`modules/form/meta/automation/workers.ts`) needs the
  exact `formId` and decides each condition with the shared
  `isAutomationConditionMatched`. `channelId` only narrows the UI form list.
  Its output sets `dynamicVariables`, so `resolveOutputVariables` lists the
  chosen form's fields as a **Form answers** group (`fieldValues.<fieldId>`,
  typed, with options); actions read them as
  `{{ trigger.fieldValues.<fieldId> }}`, resolved straight from the target.
- Runs Facebook/Instagram/Discord/mail/inbox/ticket/form automation triggers and actions,
  including bot message sequences with postback buttons and wait conditions.
- Takes turns on Facebook Messenger for AI replies: a typed direct message
  reaches automations through a delayed BullMQ trigger (2 s for text, 5 s for
  media-only; `FACEBOOK_REPLY_DEBOUNCE_TEXT_MS` / `_MEDIA_MS`), and
  `checkMessageTrigger` drops it when the same person has written since, so a
  burst is answered once by its last message. A message with only an image,
  video, audio or file (never a sticker or share) still starts a run.
  `generateAiContext` merges every customer message since the last reply into
  the input, shows media as `[media <messageId>-<index> <type>]` markers, and
  adds `facts.mediaIds` and `facts.openTickets` (tickets keeping the inbox
  conversation in `sourceConversationIds` that are not resolved or closed). `actionCreateMessage` skips an
  AI-written reply as `superseded-by-newer-message` when a newer customer
  message exists.
- AI long-term memory scopes: Facebook and Messenger `generateAiContext` set
  `memory.scopes` to the conversation (`frontline:facebook.conversation` /
  `frontline:inbox.conversation`) and `core:customer`
  (`modules/inbox/meta/automation/aiMemoryScopes.ts`). The automations service
  files what an agent's tool branches did under these scopes. **Create
  ticket** declares `defaultsWhenAfter` the AI agent `remember: { as:
'ticket', fields: ['name', 'number'] }`, so behind an agent's tool the
  ticket is remembered and a later turn names it as `ticketId`.
- Ticket automations: **Create ticket** attaches `attachmentIds` (media ids
  resolved only against the triggering conversation's messages) and relates
  the ticket to the inbox conversation and customer, as a manual convert does.
  (Media added to an existing ticket goes through Find object and Manage
  properties' `attachments` field; there is no separate add-to-ticket action.)
  Conversation media is stored on the ticket with a MIME `type` (from the URL
  extension, else `<kind>/*`), never the message's bare kind (`image`): the
  ticket detail's `erxes-ui` Attachments only shows MIME-typed files.
- Tickets are a **Find object** target (`frontline:tickets.tickets`, by `_id`
  or `number`; the result's `acceptsFollowUp` is `false` for a resolved/closed
  status type, so a later request about the same matter starts a new ticket
  instead of landing on a finished one), so a flow can
  reach an existing ticket — e.g. the id an AI
  agent picked from `facts.openTickets` — and Manage properties can update it
  through "Select target". In the automation field list (`usageType:
'automations'`) system-written fields (`number`, `updatedBy`,
  `statusChangedBy`, `statusChangedDate`, `createdBy`, `userId`,
  `sourceSurvey.*`) are hidden and an `attachments` field accepts conversation
  media ids. `ticketPropertyWrites.ts` resolves those ids to stored files
  (always add-unique) and turns a `concat` onto an editor-block description
  into new paragraphs instead of broken JSON.
- The knowledge base AI source, in whole-source scope, narrows by
  `config.topicIds`, `config.categoryIds` (each with its subtree) and
  `config.articleIds`; no rule means every published article.
- Logs Facebook Graph delivery failures with provider error metadata and request
  context while excluding outbound message content; comment-triggered bot flows
  do not send Messenger typing indicators.
- Marks a Facebook or Instagram integration broken through
  `FacebookIntegrations.markUnhealthy` / `InstagramIntegrations.markUnhealthy`
  (`selector`, `'page-token' | 'account-token'`, `error`). On the
  healthy → broken transition only, `notifyIntegrationBroken`
  (`src/modules/integrations/healthNotification.ts`) sends an `urgent`
  `integrationHealthBroken` notification to the members of the integration's
  channel; it stays one unread notification per integration until read.
- `facebookGetPages` and `instagramGetPages` throw the Graph error (prefixed
  `Facebook:` / `Instagram:`) instead of returning an empty list, and each
  page carries `usage` (`IntegrationPageUsage`: integration id/name, channel
  id/name of the inbox integration already holding it), built by
  `getPageUsage` in `src/modules/integrations/pageUsage.ts`.
- Facebook automation actions that fail on an access token report
  `PROVIDER_ERROR` instead of `UNKNOWN`.
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
  `sent` / `bounced` / `failed`) and a failed message — or one left `pending`
  for more than ten minutes after its last attempt (`deliveryAttemptedAt`,
  `MAIL_PENDING_STALE_MS`) — can be resent with `mailMessageRetry`, or from a
  ticket with `mailTicketNoteRetry`. `retrySend` claims the message atomically
  (`resendableFilter`), so two clicks never send it twice. Each attempt owns
  the message through its `deliveryAttemptedAt`: `deliver` writes the outcome
  only while that value is unchanged, so an attempt a retry has superseded can
  never overwrite the retry's status, integration health or conversation
  status. Nothing cancels a transport call already in flight, so attachment
  downloads time out after two minutes to keep an attempt well inside the
  ten-minute window. Once a mail
  is marked delivered, `deliver` never rejects: integration health and the
  requested conversation status are best-effort and logged on failure. A
  delivered reply whose conversation status was not applied keeps no
  `conversationStatusAppliedAt`, and `mailMessageRetry` then applies that
  status without sending the mail again. `mailCheckConnection` asks the worker to deliver a
  probe back, so an administrator can tell a broken delivery path from an inbox
  nobody has forwarded mail to yet.
- Answers mail through automations. Every inbound conversation mail that is not
  an auto-reply fires the **Email Received** trigger (`frontline:mail.messages`),
  filtered by inbox, sender, subject and body keywords (quoted history ignored);
  an unverified sender is skipped unless the trigger opts in. `generateAiContext`
  hands the AI Agent the mail's clean text plus the thread's last twelve older
  messages. **Draft Email Reply** (`frontline:mail.drafts.create`) stores the
  resolved reply as a `mail_drafts` record tied to the inbound mail it answers —
  one draft per mail (partial unique index on `sourceMessageId`; `createDraft`
  upserts and returns the existing draft), and a later mail never replaces an
  earlier draft — for a
  teammate to send (`mailDraftApprove`), edit (`mailDraftSave`) or delete
  (`mailDraftRemove`). **Send Email** (`frontline:mail.messages.create`) replies
  at once, flagged `automated` with `Auto-Submitted: auto-replied`, and refuses
  unverified senders, no-reply addresses, a second automatic reply to the same
  inbound mail (partial unique index on `sourceMessageId` for automated
  messages), and a fourth automatic reply to one conversation within an hour. Both actions rebuild the model's text as escaped
  `<p>`/`<br>` markup, so no model-written HTML is ever mailed; only known HTML
  tag names are treated as markup, so an angle-bracketed address or link such
  as `<support@acme.com>` survives as text. Every inbound mail body runs
  through `utils/textFormat.ts` (trigger filters and AI context), so its text
  normalization must stay linear-time: no regex with a repeated whitespace
  class next to another quantifier (use `split`/`trim` instead). Mail bodies
  and ticket-note HTML escape text through the single `escapeHtml` in
  `utils/html.ts`. A requested
  conversation resolve/open transition is stored on the message as
  `conversationStatusOnSent` and applied inside `deliver` only after Cloudflare
  reports it as sent, so a successful `mailMessageRetry` applies it too, except
  that a close is skipped when the conversation received inbound mail after the
  mail the reply answers — the `sourceMessageId` that automatic replies and
  sent drafts record — or, for a manual reply, after the reply was written. The
  transition goes through
  `Conversations.updateConversation` (so inbox segments watching `status` are
  notified), stamps `closedAt` when it closes, and publishes
  `conversationChanged:<conversationId>` so an open inbox refreshes; failed
  or bounced automation delivery fails the action instead of advancing the
  workflow. A draft reply records `draftId`; if approval throws after the mail
  left, the draft becomes `sent` rather than `pending`, so it cannot be sent
  twice. `mailRemoveIntegrations` deletes an inbox's drafts together with its
  mail messages. A `sending` draft older than `MAIL_DRAFT_SENDING_STALE_MS` is listed as
  `pending` and can be edited, deleted, or sent again. Approval is idempotent
  by `draftId`: when a message already exists for the draft it is never
  composed again — a delivered or bounced one is returned as is, a failed or
  stale-pending one is resent through `retrySend`, and a pending one that may
  still be in flight makes approval fail with the draft back to `pending`. Every draft query, edit,
  approval, and removal resolves the conversation's integration and applies
  `visibleChannelsFilter`; a permission alone never grants access to a draft in
  another channel. Draft events are published on the stable `os` tenant key
  outside SaaS (`VERSION !== 'saas'`), because inbound mail reaches the plugin
  through the webhook host (a tunnel or dedicated domain) while browsers
  subscribe through the gateway host; the `mailDraftChanged` subscription
  already listens on `os`. Before opening its stream the subscription rejects a
  caller without a signed-in user (`Login required`) and asks this plugin's
  `mail.canViewConversation` tRPC procedure, which loads the user from `core`
  and runs the same channel check, rejecting with `Forbidden` otherwise. Its
  events carry just `_id`, `conversationId`, and `status`, never the draft
  body, and the UI refetches through the access-checked
  `mailConversationDrafts` query. `src/apollo/subscription.ts` is downloaded
  and imported by the gateway, so it may import npm and workspace packages
  (such as `erxes-api-shared/utils`) only — never plugin modules through `~/`
  or `@/` — or the gateway fails to start.
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
- Converts an inbox conversation into a ticket (created here) or a deal
  (created by `sales` over tRPC), relates the new item to the conversation and
  its customer, and refuses a second item of the same kind for one
  conversation. There is no task target; `conversationConvertToCard` rejects
  `type: "task"` as an unsupported convert type.
- Agents use the public GraphQL API as the acting user; tRPC remains an
  internal service contract without agent metadata.
- A help center points at a client portal by **`clientPortalId`**, and keeps
  that portal's `domain` in `url` and its `token` in `erxesAppToken` as derived
  copies. The copies exist because `ClientPortal` is not a federated entity and
  because the published site finds its config by matching the request `origin`
  against `url` — a lookup that must stay inside this plugin's own collection.
  `withClientPortalFields` re-reads the portal through core's
  `clientPortals.get` tRPC procedure on **every write** and overwrites both
  copies, so a renamed domain or a rotated token heals on the next save; when
  the portal cannot be read or has no domain the submitted values are kept
  as-is rather than failing the save. Never write `url` or `erxesAppToken`
  without a `clientPortalId` from a UI surface, and never add a second place
  that resolves a portal.
- A help center config stores the published site's feature groups next to its
  general settings: `kbToggle`/`kbTopicId` for the knowledge base,
  `ticketToggle` with `ticketChannelId`/`ticketPipelineId`/`ticketStatusId`
  plus `formChannelId`/`formIds` for tickets and forms, and `cmsConfigs` — a
  list of `{ cmsId, cmsAppToken }`, one entry per content CMS whose
  announcements the site lists, each token belonging to that CMS's client
  portal. `normalizeHelpCenterConfig` is the single validation gate for all of
  them, composed from one normalizer per group (identity, knowledge base,
  tickets, CMS): it requires a title, rejects a non-http(s) website, requires
  `kbTopicId` when the knowledge base is on and a channel plus pipeline when
  tickets are on, refuses any CMS entry without an app token, blanks a disabled
  group, and de-duplicates `formIds`. Forms are scoped to their channel on
  write — `HelpCenterConfig.getChannelFormIds` drops every id that does not
  belong to `formChannelId`, so a channel change cannot leave a stale form on
  the site.
- Conversation and ticket segment `tagIds` lookups list their own tags
  (`frontline:conversation`, `frontline:ticket`) plus workspace tags
  (`query.variables`).
- Conversation and ticket segments declare a `propertiesData`
  `segmentFieldNamespaces` entry (`propertyType` `frontline:conversation`,
  `frontline:ticket`), so core lists their custom properties as segment fields
  and the members filter and evaluator resolve them.
- Contributes permissions, notifications, segments, references, and
  import/export handlers to the platform through `meta/`.
- `widgetsMessengerConnect` stores messenger `companyData` on the core company
  as both `propertiesData` (keys matching a `core:company` field) and
  `trackedData` (every remaining key). The company is matched by `name`, then
  `email`, then `phone` — one `companies.findOne` query per selector, stopping
  at the first hit — so a repeat connect updates the existing company instead
  of creating a duplicate.
- `pnpm nx run frontline_api:schema:print` writes the full subgraph schema, including the
  subscription fields from `src/apollo/subscription.ts`, to
  `generated/schema.graphql` without Redis, Mongo or a running service.

## Architecture

Telegram lives in `src/modules/integrations/telegram/`: `controller/` ingests,
reconciles and sends messages; `db/` owns provider mappings; `client.ts` owns
Bot API calls; `graphql/` owns bot setup, status, chat labels and link previews.
The root router mounts its authenticated webhook at `/telegram`.

| Area                     | Path                                                                                                                                                             | Responsibility                                                                                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bootstrap                | `src/main.ts`                                                                                                                                                    | `startPlugin({ name: 'frontline', port: 3304 })`, wires tRPC, routes, meta, and every surface                                                                                                                          |
| Models                   | `src/connectionResolvers.ts`                                                                                                                                     | Per-subdomain model container for all modules                                                                                                                                                                          |
| GraphQL                  | `src/apollo/`                                                                                                                                                    | Aggregated `typeDefs` and `resolvers` across modules                                                                                                                                                                   |
| Schema print             | `scripts/print-subgraph-schema.ts`                                                                                                                               | Prints the subgraph schema for `frontline_ui` codegen (`generated/`, gitignored)                                                                                                                                       |
| tRPC                     | `src/init-trpc.ts`                                                                                                                                               | `appRouter` for service-to-service calls                                                                                                                                                                               |
| HTTP                     | `src/routes.ts`                                                                                                                                                  | Mounts the `/facebook`, `/instagram`, `/mail`, and (when enabled) `/callpro` webhook routers                                                                                                                           |
| Platform extensions      | `src/meta/`                                                                                                                                                      | automations, permissions, notifications, segments, references, import/export                                                                                                                                           |
| Channels                 | `src/modules/channel/`                                                                                                                                           | Channel + ChannelMember models, schema, resolvers, role checks                                                                                                                                                         |
| Inbox                    | `src/modules/inbox/`                                                                                                                                             | Conversations, messages, integrations, widget/clientportal schemas, `receiveInboxMessage`                                                                                                                              |
| Conversation queries     | `src/conversationQueryBuilder.ts`, `src/modules/inbox/conversationUtils.ts`                                                                                      | Mongo and Elasticsearch conversation filters (membership-scoped)                                                                                                                                                       |
| Integrations             | `src/modules/integrations/<kind>/`                                                                                                                               | facebook, instagram, mail, discord, call, callpro, trpc                                                                                                                                                                |
| Mail integration         | `src/modules/integrations/mail/`                                                                                                                                 | Inbound webhook, threading, outbound send/retry                                                                                                                                                                        |
| Pipeline mail            | `src/modules/integrations/mail/utils/{pipeline,allocate,settings,scope}.ts`                                                                                      | Gives a ticket pipeline an address of its own, and keeps the two mail lanes apart                                                                                                                                      |
| Note ↔ mail              | `src/modules/integrations/mail/utils/{note*,tickets,thread}.ts`                                                                                                  | Mails an agent's note from the pipeline address as a reply on the requester's thread, and turns an inbound reply back into a note that carries the mail's attachments                                                  |
| Mail transports          | `src/modules/integrations/mail/utils/transports/`                                                                                                                | `index.ts` picks the Cloudflare account that signs for this workspace, `deliver.ts` runs the delivery pipeline (sender guard, suppression, delivery log), `cloudflare.ts` is the only `IMailTransport`                 |
| Mail provisioning        | `src/modules/integrations/mail/utils/cloudflare/`                                                                                                                | Cloudflare REST client, the fourteen-step provisioner, Email Sending onboarding and quota, the connection cache and its public shape                                                                                   |
| Mail worker bundle       | `src/modules/integrations/mail/worker/bundle.generated.ts`                                                                                                       | The minified worker uploaded to a tenant's account, regenerated by `npm run bundle` in `cloudflare/mail-worker`                                                                                                        |
| Call Pro                 | `src/modules/integrations/callpro/`                                                                                                                              | `CALLPRO_ENABLED` gate, `/callpro/receive` webhook, mirrored line/caller/call, recording URL                                                                                                                           |
| Call reporting           | `src/modules/reports/callReportService.ts`                                                                                                                       | CDR filter, leg-to-call folding, and the per-queue/agent/number report computation                                                                                                                                     |
| Call SLA report          | `src/modules/reports/callSlaService.ts`                                                                                                                          | Inbound answered ÷ offered, callbacks count as answered, missed reasons, series, queues, breaches                                                                                                                      |
| FB automation            | `src/modules/integrations/facebook/meta/automation/`                                                                                                             | Comment/message triggers and actions, bot message generation                                                                                                                                                           |
| FB page posting          | `src/modules/integrations/facebook/postService.ts`, `postGuard.ts`                                                                                               | Post publishing pipeline (validation, photo staging, cleanup, permalink) and its rate limit + audit log                                                                                                                |
| FB client portal         | `src/modules/integrations/facebook/graphql/resolvers/clientPortal.ts`                                                                                            | `facebookGetPosts`: recent posts of connected pages, read from a client portal session                                                                                                                                 |
| FB app resolution        | `src/modules/integrations/facebook/commonUtils.ts`                                                                                                               | `resolveFacebookApp`, `facebookAppSelector`, `facebookAccountSelector`                                                                                                                                                 |
| FB messenger services    | `src/modules/integrations/facebook/services/`                                                                                                                    | `messengerSend` (messaging params, bot text send with tag retry), `messageEvents` (reaction replace, message publish, reply-to), `automatedReplyControl`, `conversationSync`, `messageNormalization`, `messagePreview` |
| IG messenger services    | `src/modules/integrations/instagram/services/`, `normalizeMessage.ts`                                                                                            | `messageEvents` (sender reaction replace, inbox publish), `copyInstagramImage` (allow-listed image proxy), webhook payload normalization to the shared message contract                                                |
| Ticket                   | `src/modules/ticket/`                                                                                                                                            | Boards, pipelines, statuses, tickets, activities, notes                                                                                                                                                                |
| Forms                    | `src/modules/form/`                                                                                                                                              | Forms, fields, submissions                                                                                                                                                                                             |
| Surveys                  | `src/modules/survey/`                                                                                                                                            | Survey definitions, vote ledger, message snapshot, tally refresh                                                                                                                                                       |
| Survey ticket automation | `src/modules/survey/ticketAutomation.ts`                                                                                                                         | Threshold evaluation, atomic single-ticket claim, ticket creation                                                                                                                                                      |
| Knowledge base           | `src/modules/knowledgebase/`                                                                                                                                     | Topics, categories, articles, AI knowledge source                                                                                                                                                                      |
| Help center              | `src/modules/helpcenter/`                                                                                                                                        | Client portal configs: general settings and appearance for a published help center                                                                                                                                     |
| Reports                  | `src/modules/reports/`                                                                                                                                           | Inbox/ticket report aggregations, `buildTicketMatch`, and the saved `ReportCharts` model                                                                                                                               |
| Migrations               | `src/migrations/`                                                                                                                                                | Plugin-owned data migrations                                                                                                                                                                                           |
| Area                     | Path                                                                                                                                                             | Responsibility                                                                                                                                                                                                         |
| ---                      | ---                                                                                                                                                              | ---                                                                                                                                                                                                                    |
| Bootstrap                | `src/main.ts`                                                                                                                                                    | `startPlugin({ name: 'frontline', port: 3304 })`, wires tRPC, routes, meta, and every surface                                                                                                                          |
| Models                   | `src/connectionResolvers.ts`                                                                                                                                     | Per-subdomain model container for all modules                                                                                                                                                                          |
| GraphQL                  | `src/apollo/`                                                                                                                                                    | Aggregated `typeDefs` and `resolvers` across modules                                                                                                                                                                   |
| tRPC                     | `src/init-trpc.ts`                                                                                                                                               | `appRouter` for service-to-service calls                                                                                                                                                                               |
| HTTP                     | `src/routes.ts`                                                                                                                                                  | Mounts the `/facebook`, `/instagram`, `/mail`, and (when enabled) `/callpro` webhook routers                                                                                                                           |
| Platform extensions      | `src/meta/`                                                                                                                                                      | automations, permissions, notifications, segments, references, import/export                                                                                                                                           |
| Channels                 | `src/modules/channel/`                                                                                                                                           | Channel + ChannelMember models, schema, resolvers, role checks                                                                                                                                                         |
| Inbox                    | `src/modules/inbox/`                                                                                                                                             | Conversations, messages, integrations, widget/clientportal schemas, `receiveInboxMessage`                                                                                                                              |
| Conversation queries     | `src/conversationQueryBuilder.ts`, `src/modules/inbox/conversationUtils.ts`                                                                                      | Mongo and Elasticsearch conversation filters (membership-scoped)                                                                                                                                                       |
| Integrations             | `src/modules/integrations/<kind>/`                                                                                                                               | facebook, instagram, mail, discord, call, callpro, trpc                                                                                                                                                                |
| Mail integration         | `src/modules/integrations/mail/`                                                                                                                                 | Inbound webhook, threading, outbound send/retry                                                                                                                                                                        |
| Mail transports          | `src/modules/integrations/mail/utils/transports/`                                                                                                                | `index.ts` picks the Cloudflare account that signs for this workspace, `deliver.ts` runs the delivery pipeline (sender guard, suppression, delivery log), `cloudflare.ts` is the only `IMailTransport`                 |
| Mail provisioning        | `src/modules/integrations/mail/utils/cloudflare/`                                                                                                                | Cloudflare REST client, the fourteen-step provisioner, Email Sending onboarding and quota, the connection cache and its public shape                                                                                   |
| Mail automation          | `src/modules/integrations/mail/meta/automation/`                                                                                                                 | Email Received trigger and filter, AI context, reply resolution, Send Email and Draft Email Reply actions                                                                                                              |
| Mail drafts              | `src/modules/integrations/mail/db/models/Drafts.ts`, `src/modules/integrations/mail/utils/{access,draftEvents}.ts`, `src/modules/integrations/mail/trpc/mail.ts` | Per-inbound-mail AI drafts: channel-scoped access, edit, atomic send claim (`pending` → `sending` → `sent`), delete, minimal `mailDraftChanged` events, and the subscription's `mail.canViewConversation` access check |
| Mail worker bundle       | `src/modules/integrations/mail/worker/bundle.generated.ts`                                                                                                       | The minified worker uploaded to a tenant's account, regenerated by `npm run bundle` in `cloudflare/mail-worker`                                                                                                        |
| Call Pro                 | `src/modules/integrations/callpro/`                                                                                                                              | `CALLPRO_ENABLED` gate, `/callpro/receive` webhook, mirrored line/caller/call, recording URL                                                                                                                           |
| Call reporting           | `src/modules/reports/callReportService.ts`                                                                                                                       | CDR filter, leg-to-call folding, and the per-queue/agent/number report computation                                                                                                                                     |
| FB automation            | `src/modules/integrations/facebook/meta/automation/`                                                                                                             | Comment/message triggers and actions, bot message generation                                                                                                                                                           |
| FB page posting          | `src/modules/integrations/facebook/postService.ts`, `postGuard.ts`                                                                                               | Post publishing pipeline (validation, photo staging, cleanup, permalink) and its rate limit + audit log                                                                                                                |
| FB app resolution        | `src/modules/integrations/facebook/commonUtils.ts`                                                                                                               | `resolveFacebookApp`, `facebookAppSelector`, `facebookAccountSelector`                                                                                                                                                 |
| FB messenger services    | `src/modules/integrations/facebook/services/`                                                                                                                    | `messengerSend` (messaging params, bot text send with tag retry), `messageEvents` (reaction replace, message publish, reply-to), `automatedReplyControl`, `conversationSync`, `messageNormalization`, `messagePreview` |
| IG messenger services    | `src/modules/integrations/instagram/services/`, `normalizeMessage.ts`                                                                                            | `messageEvents` (sender reaction replace, inbox publish), `copyInstagramImage` (allow-listed image proxy), webhook payload normalization to the shared message contract                                                |
| Ticket                   | `src/modules/ticket/`                                                                                                                                            | Boards, pipelines, statuses, tickets, activities, notes                                                                                                                                                                |
| Conversation convert     | `src/modules/inbox/services/conversationConvert{,Targets}.ts`                                                                                                    | Conversion orchestration and relations; one handler per target (permission, existing-item lookup, URL, create)                                                                                                         |
| Forms                    | `src/modules/form/`                                                                                                                                              | Forms, fields, submissions                                                                                                                                                                                             |
| Surveys                  | `src/modules/survey/`                                                                                                                                            | Survey definitions, vote ledger, message snapshot, tally refresh                                                                                                                                                       |
| Survey ticket automation | `src/modules/survey/ticketAutomation.ts`                                                                                                                         | Threshold evaluation, atomic single-ticket claim, ticket creation                                                                                                                                                      |
| Channel resource moves   | `src/modules/channel/moveResources.ts`                                                                                                                           | Per-type move descriptors, `validateChannelMove`, and the `moveChannelResources` service behind `channelMoveResources`                                                                                                 |
| Knowledge base           | `src/modules/knowledgebase/`                                                                                                                                     | Topics, categories, articles, AI knowledge source                                                                                                                                                                      |
| Help center              | `src/modules/helpcenter/`                                                                                                                                        | Client portal configs: general settings and appearance for a published help center                                                                                                                                     |
| Reports                  | `src/modules/reports/`                                                                                                                                           | Inbox/ticket report aggregations, `buildTicketMatch`, and the saved `ReportCharts` model                                                                                                                               |
| Pipeline mail            | `src/modules/integrations/mail/utils/{pipeline,tickets,scope}.ts`                                                                                                | A ticket pipeline's own address: its settings, the status new mail opens a ticket in, and ticket creation from an inbound message                                                                                      |
| Survey ticket automation | `src/modules/survey/ticketAutomation.ts`                                                                                                                         | Threshold evaluation, atomic single-ticket claim, ticket creation                                                                                                                                                      |
| Knowledge base           | `src/modules/knowledgebase/`                                                                                                                                     | Topics, categories, articles, AI knowledge source                                                                                                                                                                      |
| Help center              | `src/modules/helpcenter/`                                                                                                                                        | Client portal configs: general settings and appearance for a published help center                                                                                                                                     |
| Reports                  | `src/modules/reports/`                                                                                                                                           | Inbox/ticket report aggregations, `buildTicketMatch`, and the saved `ReportCharts` model                                                                                                                               |
| Survey notifications     | `src/modules/survey/notifications.ts`                                                                                                                            | Client portal notification for an approved or rejected survey request                                                                                                                                                  |
| Migrations               | `src/migrations/`                                                                                                                                                | Plugin-owned data migrations                                                                                                                                                                                           |

## Contracts

### Provides

- Internal `contactFields.sync` tRPC mutation (`TContactFieldsSync`) — core broadcasts contact merges and removals to every plugin declaring `meta.contactFields` (frontline declares `frontline:ticket` in `main.ts`); applied with `applyContactFieldsSync`. Not agent-callable.
- `createTicket` / `updateTicket` accept `customerId` / `companyId` (one of each) and save them on the ticket; `getTickets` filters by them. Tickets made elsewhere save their customer the same way: mail (`createTicketFromMail`), the messenger widget, client portal (`cpCreateTicket`), conversation convert and the create-ticket automation. No core relation is made for a ticket: a ticket made from a conversation (convert or the create-ticket automation) keeps it in `sourceConversationIds` (indexed); convert's "already converted" check, the converted-items list, open-ticket facts (`findOpenConversationTickets`) and the ticket source-channel report read that field, and the conversation's form submissions are logged on the new ticket or deal directly (`inbox/utils/conversationFormSubmission.ts`). `backend/saas-migrations/core/commands/migrateConversationRelationsToSourceFields.ts` copies old conversation ↔ ticket / deal relations and `customerFieldData.sourceConversationIds` into the field. The `customer.tickets` / `company.tickets` segments and the ticket `customers` reference join on `customerId` / `companyId`.
- Telegram: `POST /telegram/receive/:_id` authenticates the stored webhook
  secret. `telegramBots`, `telegramConversationChats`, `telegramBotWebhookInfo` and
  `telegramMessageLinkPreviews` expose permission-checked setup/status and
  message metadata. `telegramAddBot`, `telegramUpdateBot`, `telegramDisconnectBot`
  and `telegramSetWebhook` own bot lifecycle. Canonical inbox messages retain
  the existing content/attachment/poll contracts plus `extraData.telegram`.
  `telegramDisconnectBot` pauses locally before provider cleanup; its Boolean
  reports whether remote webhook removal was confirmed.
  `telegramMessageLinkPreviews` returns `[TelegramLinkPreview!]!` (`type`,
  `url`, `title`, optional `description`, `provider { name }`, optional
  `image { url }`), never `JSON`; it is `[]` when the message is missing,
  internal, outside the user's visible channels, or has no links.

- GraphQL: help center configs — `helpCenterConfig(_id)`,
  `helpCenterConfigs(page, perPage, searchValue, brandId)`,
  `helpCenterConfigsTotalCount(searchValue, brandId)`;
  `helpCenterConfigUpdate(config: HelpCenterConfigInput!)` (create-or-update,
  keyed on `config._id`) and `helpCenterConfigRemove(_id)`. Reads check
  `showHelpCenter`, writes check `helpCenterManage`.
- GraphQL: `helpCenterGetConfigByDomain: HelpCenterConfig` —
  the published site's own bootstrap read, the help center counterpart of the
  1.x `clientPortalGetConfigByDomain` lookup. It is the **one public operation
  in this module** (`wrapperConfig.skipPermission`): the site calling it has no
  staff user, no `cpUser` and no client portal header yet, because the domain
  is how it discovers which help center it is. It takes no arguments: the
  query resolver's `getByHost` takes the domain from the request's `Origin`
  header alone, so a server-side caller must set that header itself. After the same
  normalization the write path applies, it returns the config whose `url`
  starts with that origin (escaped, case-insensitive, ending at a `/` or the
  end of the string), and throws `Not found` when no origin was supplied or no
  help center claims it. Never add a permission check to it, never drop the
  regex escape or the empty-origin guard (an empty pattern matches every
  config), and never widen it into a list.
- GraphQL: `HelpCenterConfig.brand` resolves the federated `Brand`; its
  `kbTopic` resolves the `KnowledgeBaseTopic` named by `kbTopicId`.
- GraphQL Facebook and Instagram settings: `facebookGetConfigs` /
  `instagramGetConfigs` return `[FacebookConfig]` / `[InstagramConfig]`
  (`_id`, `code`, `value: JSON`, like `CallConfig`), and `facebookCreatePost`
  returns `FacebookCreatePostResult` (`postId`, `permalinkUrl`). The
  `*UpdateConfigs`, `integrationsRepair` and `instagramRepair` results stay
  `JSON`.
- GraphQL Call Pro: `callProCustomersByPhone` returns `[Customer]`, the core
  federated entity this plugin extends by `_id`; the resolver still returns the
  core customer documents and the gateway resolves the selected fields from
  core.
- GraphQL ticket activity and notes: `TicketActivity._id` and `TicketNote._id`
  are non-null — every activity list, subscription payload, and note query or
  mutation (`ticketGetNote`, `ticketCreateNote`, `mailTicketNoteRetry`)
  resolves a stored document.
- GraphQL knowledge base: `KnowledgeBaseCategory._id` and
  `KnowledgeBaseParentCategory._id` are non-null — every category field
  (`categories`, `parentCategories`, `childrens`, list, detail, add, edit)
  resolves a stored category document. `KnowledgeBaseTopic` exposes `brand`,
  not `brandId`.
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
  `Channel`'s field-resolved counts (`memberCount`, `pipelineCount`,
  `responseTemplateCount`, `formCount`, `integrationCount`,
  `conversationCount`, `unreadConversationCount`), `hasTickets` and
  `integrationKinds` are non-null: every one of those resolvers returns a
  number, a boolean or an array.
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
- GraphQL `Conversation.automatedReplyControl` is
  `ConversationAutomatedReplyControl` (`status`, `pausedUntil`, `reason`,
  `updatedAt`, `updatedBy`, all nullable: `status` has only a Mongoose
  default), matching `automatedReplyControlSchema`. `propertiesData`,
  `customFieldsData` and `conversationCounts` stay `JSON`.
- GraphQL `ConversationMessage.providerData`, `replyTo` and `reactions` are
  `ConversationMessageProviderData`, `ConversationMessageReplyTo` and
  `[ConversationMessageReaction]`, matching the message subschemas. Every
  field stays nullable, including the Mongoose-required `replyTo.messageId`
  and `reactions.senderId`, since no stored data proved them. `extraData`,
  `botData` and `formWidgetData` stay `JSON`, as do the Facebook and
  Instagram message copies of these fields (stored as `Mixed`).
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
  Each entry's `_id`, `name` and counts are non-null; the list wrappers stay
  nullable.
- GraphQL `Integration` outputs: `healthStatus` is `IntegrationHealthStatus`
  (`status: String!`, `error`), `healthy` when the provider reports nothing;
  `facebookPage` is `[IntegrationFacebookPage!]` (`pageId: String!`, plus the
  Graph API `id` and `name`), `null` for non-Facebook kinds or when no page
  token resolves. `details` (kind-specific; mail returns `{ status, data }`),
  `instagramPage`, `leadData`, `messengerData` and `uiOptions` stay `JSON`.
- tRPC `appRouter` consumed by other services, including
  `inbox.updateUserChannels({ channelIds, userId })` — replaces a user's team
  channel memberships; never touches their personal channel.
- Agents discover the GraphQL schema and execute through the gateway as the
  acting user. Internal tRPC procedures carry no agent metadata.

- GraphQL Facebook bot and page contracts read as object types, not `JSON`:
  `FacebookMessengerBot._id` is non-null; its `account` is `FacebookBotAccount`
  (`_id`, `name`) and its `page` is `FacebookBotPage` (`id`, `name` from the
  Graph API, `null` when the page token is rejected).
  `facebookGetAccounts` returns `[FacebookAccount]` (`_id`, `kind`, `name`,
  never a token), `facebookGetPages` returns `[FacebookPage]` (`id`, `name`,
  `isUsed`; `[]` when the Graph API call fails), `facebookGetIntegrations`
  returns `[FacebookIntegrationRecord]` (`_id`, `kind`, `accountId`,
  `erxesApiId`, `facebookPageIds`), and `facebookGetBotPosts` /
  `facebookGetBotPost` return `FacebookPosts`. Bot remove and repair results
  stay `JSON`.
- GraphQL Instagram bot contracts mirror Facebook's: `InstagramMessengerBot._id`
  is non-null; its `account` is `InstagramBotAccount` (`_id`, `name`) and its
  `page` is `InstagramBotPage` (`id`, `name` from the Graph API, `null` when
  the call fails). `instagramGetAccounts` returns `[InstagramAccount]` (`_id`,
  `kind`, `name`; the resolver still loads the whole account, so the object
  type is what keeps the token off the wire), `instagramGetPages` returns
  `[InstagramPage]` (`id`, `name`, `isUsed`), and `instagramGetBotPosts` /
  `instagramGetBotPost` return `InstagramPosts`. Bot add, update, remove and
  repair results, `instagramGetIntegrations` and
  `instagramGetIntegrationDetail` stay `JSON`.
- GraphQL `DiscordParticipant` (from `discordConversationParticipants` and
  `discordChannelMembers.members`) has non-null `userId` and `name`: the
  participants resolver drops customers without a Discord user id and falls
  back to `Discord user` for the name, and channel members come from the
  Discord user id and `nick`, `global_name` or `username`. Keep both
  guarantees in any new resolver that returns this type. `customerId` and
  `avatar` stay nullable.
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
  carries non-null `mailData: MailThreadMessageData!` with the addresses,
  body, the quoted-reply split
  (`newContent` / `replies`), attachments, the delivery fields
  (`deliveryStatus`, `deliveryError`, `deliveryRetryable`, `bouncedRecipients`),
  and the inbound sender check (`envelopeFrom`, `senderMismatch`). Address and
  attachment entries use `MailThreadAddress` and `MailThreadAttachment`;
  attachment `size` is `Float`. Resolver-normalized lists, booleans and body
  are non-null; optional stored fields, including timestamps, remain nullable.
- GraphQL: `mailSendMail(...)` and `mailMessageRetry(_id!)` — both require
  `conversationMessageAdd` and return only the delivery outcome of the stored
  message as `MailDeliveryOutcome` (`_id`, `deliveryStatus`, `deliveryError`,
  non-null `bouncedRecipients`), so the
  caller reads what actually happened instead of assuming success. `mailSendMail`
  persists the message **before** the transport call, so a send failure never
  loses an agent's reply.
- GraphQL: `mailSendReaction` also returns `MailDeliveryOutcome`;
  `mailDraftApprove` returns that object with `draftId`. These structured
  results require field selections rather than the former JSON selection.
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
  `{ queue, integrationId }`. It returns `[CallQueueStatistic]`, and every
  counter stays nullable because that fallback row carries none.
- GraphQL `callsGetConfigs` returns `[CallConfig]` (`_id`, `code`, `value`).
  `value` stays `JSON` because the model stores it as a free-form `Object`.
- GraphQL `callsIntegrationDetail` and `callUserIntegrations` return
  `operators` as `[CallOperator]` (`userId`, `gsUsername`, `gsPassword`,
  `gsForwardAgent`), all nullable because the model stores operators as a
  free-form `Object`. The `CallIntegrationConfigs` input keeps
  `operators: JSON`.
- GraphQL `callExtensionList(integrationId)` returns `[CallExtension]`
  (`extension`, `fullname`, `status`) read from the PBX `listAccount` reply,
  filtered to the integration's operators. It returns `[]` when the PBX has no
  accounts and throws when the PBX request fails, never a string.
- GraphQL call reports — `callGetQueueStats`, `callGetAgentStats`,
  `getCallbackStats`, `callKpiScorecard`, `callVolumeSeries`,
  `callCarrierBreakdown`, `callHeatmap`, `callTopNumbers`. All eight read
  `CallCdrs` through `buildCdrFilter` and fold legs into calls before counting.
  They return nothing in a deployment whose PBX does not post CDRs.
  `CallVolumePoint.noAnswer` and `HeatCell.noAnswer` count every call in the
  bucket that no human answered, in both directions — unlike
  `CallVolumePoint.abandoned`, which stays inbound-only.
- `CallVolumePoint.day`, `CallDayHourCell.day` and `CallSlaPoint.day` are
  non-null: each bucket is keyed by the PBX day of a call that has a `start`,
  and calls without one are skipped, so every row carries its day.
- GraphQL `callHeatmapDaily(startDate, endDate, integrationId?, queueId?,
direction?)` — the same CDR read as `callHeatmap`, bucketed by **calendar PBX
  day × hour** instead of day-of-week, for the spreadsheet export of the report.
  Only hours that carry calls produce a row; absent buckets mean zero.
- GraphQL `callSlaReport(startDate, endDate, integrationId?, queueId?,
agentExtension?, callbackWindowMinutes?, breachLimit?)` — inbound-only service
  level built by `buildSlaReport` (`callSlaService.ts`): **answered ÷
  offered**, with no answer-time threshold — how long an answered caller
  waited never matters. A call is **offered** unless it was abandoned in under
  5 s (`SLA_DEFAULT_SHORT_ABANDON_SECONDS`, fixed — the API does not take it).
  A missed offered call **counts as answered** (it stays in the denominator,
  joins `answeredCalls` and is counted in `calledBackCalls`) when it was
  **called back**: an outbound call from the same inbox integrations to the
  same number (compared through `normalizeSlaPhone`, which drops `976` and
  leading zeros) that a human answered within `callbackWindowMinutes`
  (default 60, `0` turns it off, max 1440) of the missed call's end. Only our
  outbound calls count — the customer calling again does not. Outbound CDRs
  are read up to `endDate` + the window. Every offered call that was neither
  answered nor called back is a breach; one whose window is still open is
  flagged `isPendingCallback`. `serviceLevel` is `null` when nothing was
  offered. `breaches` holds the newest `breachLimit` (default 50, max 5000,
  `SLA_MAX_BREACH_LIMIT`) and `breachCount` the full total. A call belongs to
  the agent `foldLegsIntoCalls` assigns — the one who answered, else the first
  extension it rang — using the scope's operator extensions as
  `knownExtensions`. `agentExtension` narrows every figure to that agent, while
  `agents` always lists every agent in the unfiltered range, named through the
  core `users.find` tRPC query; breaches carry `agentName` the same way.
  Every unanswered call gets a `missedReason` from `missedReasonOf`, in this
  order: `SHORT_HANGUP`, `VOICEMAIL` (a `VM` leg answered), `BUSY` / `FAILED`,
  `IVR` (no `Queue`/`Dial` leg), `NOT_PICKED_UP` (a known operator extension
  rang) and `QUEUE_ABANDON`. With no known extensions any four-digit `dst`
  counts as an agent, which also matches queue numbers. `missedReasons`
  counts each reason and how many were called back; `missedByHour` buckets
  them by PBX (`+08:00`) hour. There is no outside-business-hours reason
  because the plugin has no business-hours setting. It shares
  `resolveReportScope` with the other call reports, ignores `direction`, and
  is a separate formula from `callKpiScorecard.serviceLevel` (answered-only
  denominator, fixed 20 s), so the two numbers differ.
- HTTP `POST /callpro/receive` — the Call Pro PBX pushes one call event
  (`numberTo`, `numberFrom`, `disp`, `callID`, `owner`). The route is only
  mounted when `CALLPRO_ENABLED=true`, so a deployment without Call Pro returns 404. Public URL: `{DOMAIN}/gateway/pl:frontline/callpro/receive`
  (`{DOMAIN}/pl:frontline/...` outside production). Every step of the
  webhook (raw body, integration lookup, customer/conversation get-or-create,
  state change, inbox response, member notification) and integration
  create/update/remove is written to stdout through
  `callpro/debuggers.ts` with `[callpro]` / `[callpro:error]` prefixes, as is every
  reason `Conversation.callProAudio` resolves to null (flag off, viewer not
  owner/assignee, missing `recordUrl`, lookup failure).
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
- GraphQL `reportTicketExport(filters)` — every matching ticket, unpaged, with
  ids resolved to display names (`assigneeName`, `createdByName`,
  `pipelineName`, `statusName`, `channelName`, `branchName`, `departmentName`,
  `tagNames`) plus raw `number` and `propertiesData`. Users, tags, branches and
  departments resolve through core tRPC `find`; statuses and channels through
  this plugin's models. Property values are returned raw; the UI maps option
  labels.
- GraphQL (client portal, `forClientPortal`): `facebookGetPosts(channelIds:
[String], brandIds: [String], limit: Int): [FacebookPosts!]!` keeps the 2.x
  name and arguments, so a site written against 2.x calls it unchanged. It
  selects the active (`isActive` not `false`) `facebook-post` inbox
  `Integrations`, narrowed by `brandId` and `channelId` when either list is
  non-empty (both lists narrow together; comma-joined ids, the form 2.0.7–2.11
  accepted, are split and empty values ignored), then reads
  their pages and page tokens from `FacebookIntegrations` by `erxesApiId`.
  Each page is fetched once through `fetchPagesPostsList`, and the posts are
  merged newest first and cut to `limit` (default 20, at most 100, below 1 is
  rejected). A page whose Graph API call fails is logged and skipped. Without
  a client portal token the call is rejected.
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
- `Ticket._id` is non-null; every other `Ticket` field stays nullable because
  the Mongoose schema requires none of them and `updateTicket` can clear them.
- `getAccessibleTicketStatuses(pipelineId!)` and
  `getTicketStatusesChoicesPipeline(pipelineId!)` return
  `[TicketStatusChoice!]!`; `value`, `label` and `type` are non-null. The
  accessible variant fills only `value`, `label`, `color`, `type`,
  `canMoveMemberIds` and `canEditMemberIds`; the pipeline variant adds
  `memberIds`, `departmentIds` and `visibilityType`.
- `TicketStatus.type` and `order` are non-null. `Status.updateStatus` drops a
  null `type` or `order` from its `$set`, so `updateTicketStatus` can never
  clear them; keep that guard if the method changes.
- `ITicketFilter.branchIds: [String]` / `departmentIds: [String]` — the ticket
  list's branch and department filters. `generateFilter` turns a non-empty list
  into `branchId` / `departmentId` `$in`, and the `ticketListChanged`
  subscription drops tickets outside the same lists so live updates match the
  query. They narrow on top of pipeline `isCheckBranch` / `isCheckDepartment`
  visibility, never replace it.
- `ITicketFilter.propertiesData: String` — the encoded property conditions
  (`fieldId:operator:value;…`) the shared `PropertiesFilter` writes. Both
  `generateFilter` and the `ticketListChanged` subscription build them with
  `buildPropertyFilter` from `erxes-api-shared/core-modules`; never hand-parse
  the string. The subscription checks a create/update through the
  `ticket.matchesProperties` tRPC query (`Ticket.exists` with those conditions)
  and lets deletes through so removals still reach the list.
- `src/apollo/subscription.ts` is downloaded and executed by the gateway, not by
  this service: it may import only packages the gateway resolves
  (`erxes-api-shared/utils`, `graphql-subscriptions`), never `~/` or `@/` plugin
  paths. Anything that needs models goes through a frontline tRPC procedure via
  `sendTRPCMessage`. Keep it free of TypeScript-only syntax (type aliases,
  annotations, `as` casts): in development the gateway saves the raw `.ts`
  source as `downloads/frontline.js` and Node imports it as plain ESM, so type
  syntax is a `SyntaxError` that drops every plugin's subscriptions.
- Internal notes share the `conversationMessageInserted:<conversationId>`
  topic with customer-visible messages. `conversationMessageInserted` delivers
  an `internal` message only when the subscription context has `user._id`
  (team member); `cpConversationMessageInserted` never delivers one. Internal
  notes are stored as BlockNote JSON, so a leak shows customers raw JSON.
  `sendNotifications({ internal: true })` skips the client portal mobile push
  and still notifies agents, with the note rendered by `noteContentToHtml`.
- Customer-facing queries that return `Conversation` (`widgetsConversations`,
  `cpConversations`, `cpConversation`, `cpConversationDetail`) wrap each result
  with `toCustomerConversationView` (`src/modules/inbox/utils/`), which sets
  `customerView: true`; `Conversation.messages` then excludes internal notes.
  Team-facing results never set it, so admin queries such as
  `reportConversationList` still list notes. Any new customer-facing query
  returning `Conversation` must wrap its results the same way.
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
  render the right control without querying core. `createdAt` / `updatedAt`
  are `Date`, like `Pipeline`'s. The widget bootstrap
  (`widgetsMessengerConnect`) returns the whole document as `ticketConfig: JSON`,
  so both lists reach the messenger widget without a schema change there.
- GraphQL: `widgetTicketCreated(name, description, attachments, statusId,
tagIds, propertiesData: JSON)` (the customer comes from the widget session) — the public messenger ticket
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
  address is also sent to the requester. `ticketCreateNote` runs
  `prepareTicketNoteMail` first: when the workspace cannot send
  (`assertSendableIntegration`) or the ticket has no customer email
  (`resolveTicketRecipient`), the mutation throws and no note is written. It
  then creates the note, mails it with `sendTicketNoteMail` and links the
  returned `mailMessageId` onto the note, so a failed note write can never
  leave a mail behind for the composer's retry to send again. If the send
  itself throws, the note is removed and the error rethrown, so a retry starts
  clean. A transport failure or bounce does not throw: `deliver` records it
  on the message and the note keeps its `mailMessageId`. An `isInternal` note
  stays inside the team's ticket detail and is never mailed.
  `ticketGetNotes(contentId!, isInternal)` is the agent-side list and requires
  `showTickets`.
- GraphQL: `mailTicketNoteRetry(noteId!): TicketNote` — requires
  `showTickets` and view access to the note's ticket (`findViewableTicket`),
  resends the note's outbound message through `retrySend` and returns the
  note so `mailDelivery` comes back fresh. `TicketNoteMailDelivery.retryable`
  says whether the failure looked temporary and `canRetry` (`canResend`) says
  whether the resend would be accepted now.
- GraphQL: `TicketNote.mailDelivery: TicketNoteMailDelivery` —
  `{ status, error, to, bouncedRecipients }` read from the outbound message
  behind `mailMessageId`. It is `null` for a note that was not mailed, for one
  created from inbound mail, and for a client portal caller, so a delivery
  error never reaches the requester.
- GraphQL: `mailTicketReplyTarget(ticketId!): MailTicketReplyTarget` —
  requires `showTickets` and view access to the ticket's pipeline and status,
  answers `null` when the ticket's pipeline has no connected mail address, and
  otherwise returns `{ from, to }`: the pipeline address and the address a
  non-internal note would be mailed to. `to` comes from
  `resolveTicketRecipient` (the latest inbound sender, else the related
  customer's `primaryEmail`), the same function `sendTicketMail` uses, and is
  `null` when neither exists.
- A mailed note sends every uploaded attachment with it (`toMailAttachments`
  passes each `{ name, url, type, size }` that has a `url`; the transport reads
  a storage key back itself). Cloudflare needs an HTML or text part, so a note
  with attachments but no text is mailed with `attachmentListToHtml` — a plain
  list of the file names — as its body. A note with neither is not mailed.
  An image the note shows by storage key (anything not starting with a URL
  scheme or `/`) is rewritten to `cid:<uuid>@erxes` and sent as an inline
  attachment (`inlineStorageImages`), so the requester sees it inside the
  mail; a key that cannot be read back fails the whole delivery, which then
  shows as Not delivered with the reason.
- A ticket note written by a customer — a `cp:` author, which covers inbound
  mail and `cpTicketCreateNote` — raises one `ticketCustomerReply`
  notification ("New message from the customer") for the ticket's assignee,
  assigned members and subscribers (`findCustomerReplyRecipients`, `cp:` ids
  dropped), or for the pipeline owner when nobody follows the ticket. Users
  the note @-mentions get only their mention notification. An agent's note
  notifies only the users it mentions. Messenger widget comments store a bare
  customer id, not a `cp:` author, so they raise no notification.
- An inbound mail on a pipeline ticket becomes a customer-authored note
  (`createdBy: cp:<customerId>`, `mailMessageId` set). `toNoteAttachments`
  copies every attachment that reached storage into `TicketNote.attachments`
  as `{ name, url, type, size }`, except an inline image whose `cid:` the body
  already shows. One that failed to store stays out of `attachments` and is
  served instead by `TicketNote.unsavedAttachments` (`toUnsavedAttachments`):
  `{ name, url, type, size, error, expiresAt }`, where `url` is the mail
  worker's signed link (or `null` when there is none) and `expiresAt` is the
  message's `createdAt` plus `MAIL_RETENTION_DAYS` (the R2 lifecycle that
  deletes it); client portal callers get an empty list. A mail with no text
  but a stored or unsaved attachment still becomes a note, because a note's
  `content` is required only when it carries neither attachments nor a
  `mailMessageId`.
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
  `helpCenterGetConfigByDomain` (the published site's own
  bootstrap read, the one operation in this module that skips the permission
  check), `helpCenterConfigUpdate(config: HelpCenterConfigInput!)`
  (create-or-update, keyed on `config._id`) and `helpCenterConfigRemove(_id)`.
  Reads check `showHelpCenter`, writes check `helpCenterManage`.
  `HelpCenterConfig` and `HelpCenterConfigInput` both carry `clientPortalId`
  with its derived `url` / `erxesAppToken`, `formChannelId`,
  `formIds`, `cmsConfigs` and the derived `cmsId` / `cmsAppToken` alongside the
  ticket and knowledge base fields.
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

- Mail agent GraphQL — `mailConversationDrafts(conversationId!)`,
  `mailInboxes` (connected channel mail inboxes for the trigger picker,
  limited to channels `visibleChannelsFilter` lets the caller see),
  `mailDraftSave(_id!, subject, body!)`, `mailDraftApprove(_id!)` (returns the
  sent message's delivery outcome plus `draftId`), `mailDraftRemove(_id!)`, and
  the subscription `mailDraftChanged(conversationId!): MailDraftChangedEvent`
  (`_id`, `conversationId`, `status`), open only to a signed-in user who can
  see the conversation's channel.
- Mail tRPC — `mail.canViewConversation` (query,
  `{ conversationId, userId }` → `boolean`), the internal access check the
  gateway runs before opening `mailDraftChanged`; not agent-annotated.
- Automation types — trigger `frontline:mail.messages` (target
  `TMailTriggerTarget`), actions `frontline:mail.messages.create` (Send Email)
  and `frontline:mail.drafts.create` (Draft Email Reply).
- Automation type — trigger `frontline:form.submissions` (target
  `TFormSubmittedTriggerTarget`, config `TFormSubmittedTriggerConfig` in
  `modules/form/meta/automation/types.ts`).
- Nx target `schema:print` uses the shared `scripts/print-subgraph-schema.ts` printer (cached, output `generated/schema.graphql`),
  consumed by `gateway:schema:compose`; `frontline_ui:codegen` uses that composed schema.

### Consumes

- `core` over tRPC — `users.findOne` (query, `{ query }`), which loads the
  active user for `mail.canViewConversation`.
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
- `core` over tRPC — `segment.fetchSegment`
  (`{ segmentId, cursor?, limit? }` → `{ ids, nextCursor? }`), which backs the
  conversation list `segment` filter. `segmentFilter` pages until `nextCursor`
  is empty; core caps each page, so one call is never the whole segment.
- `core` over tRPC — `notifications.sendMobileNotification` (mutation,
  `{ title, body, receivers, data }`), which pushes a new chat message to the
  assigned and participating agents' `deviceTokens`. The path is
  `notifications.*`, not `core.*`; a wrong path fails silently.
- `automations` over tRPC — `automations.trigger`. The path is
  `automations.trigger`, not `triggers.trigger`; `sendTRPCMessage` swallows a
  wrong path or a query/mutation mismatch and returns `defaultValue`, so a
  typo here fails silently.

## Data and State

- `frontline_tickets` owns one customer and one company as `customerId` / `companyId` (indexed, `default: null`; read only from the record — the migration must run before deploy, there is no relation fallback); frontline saves them itself and makes no core relation for them. Core's contact merge / remove reaches them through tRPC `contactFields.sync`. `backend/saas-migrations/core/commands/migrateRelationsToContactFields.ts` backfills tickets linked before: the first of old `customerIds` / `companyIds` arrays (kept as they are; only their indexes are dropped), else the oldest related contact; extra contacts are dropped. The create-ticket automation action saves `companyId` (old actions' `companyIds` give their first). `conversations` keep their single `customerId` and are not migrated.
- Models are generated per request subdomain. Telegram owns `telegram_bots`,
  `customers_telegram`, `conversations_telegram`, `conversation_messages_telegram`
  and `telegram_reactions`; canonical inbox history stays in Frontline's
  existing conversation collections and Core owns customer records.
- Telegram bot tokens and webhook secrets are server-only. Provider IDs are
  strings; deduplication, poll/reaction updates and reply lookup are scoped by
  tenant, integration and chat, with topic identity included where applicable.

## Local Invariants

- Ticket contacts are read only from `customerId` / `companyId`: mail recipients (`integrations/mail/utils/tickets.ts`), report contact filters (`narrowTicketMatchByContacts`), widget ticket ownership (`getOwnedTicketIds`, needs `models`) and `widgetTicketCheckProgressForget`. Never read a ticket's contacts or source conversations from core relations; customer ↔ company links remain core relations.
- A Form submitted condition on an array value (checkbox group, multi-select)
  matches when any option matches; `dne`/`numberdne`/`dnc` must hold for every
  option, and `is`/`ins` test the whole value. Number and boolean values are
  compared as text, because the rule value is text.

- A typed reply is never routed by the automation engine's `payload.btnId`
  wait (it has no payload); only `claimFacebookInputReply` resumes an Input
  step, and the claim and the timeout both unset `inputWait` atomically so
  exactly one of "If Reply" / "If Not Reply" runs.
- `updatePipeline` and `removePipeline` allow only the owner or an `admin`
  member of the pipeline's channel (and of the target channel when
  `updatePipeline` moves it), the same rule as `channelUpdate`.
  `createPipeline` still checks only that a user is signed in.
- Widget identity comes only from the signed session token in the
  `erxes-widget-token` header (`src/modules/inbox/widgetSession.ts`), issued
  by `widgetsMessengerConnect` as `sessionToken`. Widget operations take no
  `customerId`/`visitorId` arguments; anything addressed by id (conversation,
  ticket, comment) passes `assertOwnsConversation` / `assertOwnsTicket` and
  answers "not found" otherwise. A claimed email, phone or code never finds an
  existing customer; visitor ids are server-made, never browser fingerprints.
- Conversation subscriptions (`conversationMessageInserted`,
  `conversationChanged`, `conversationBotTypingStatus`,
  `conversationClientTypingStatusChanged`) admit staff (`context.user`) or a
  widget whose gateway-verified `context.widgetSession` owns the conversation
  (checked through the `conversation.find` tRPC); `conversationAdminMessageInserted`
  requires the session's own `customerId`. The widget sends its token as ws
  `connectionParams.widgetToken`. `src/apollo/subscription.ts` stays untyped JS.
- `widgetsTicketCustomersEdit` stores typed emails/phones in the lists and
  also as `primaryEmail`/`primaryPhone` (staff forms read only primaries), but
  only while no other customer holds that primary: core's `checkDuplication`
  would otherwise fail the whole save. A failed core update throws instead of
  returning `null`.
- Core's `customers.findOne` tRPC only filters by `_id`, `customerPrimaryEmail`,
  `customerPrimaryPhone` and `customerCode` and silently ignores other keys, so
  any other lookup (e.g. by `visitorId`) must use `customers.find` with a
  non-empty value — `findVisitorCustomer` does this.
- Widget ticket creation accepts only the start statuses of the messenger's own
  ticket configs and only name, description, attachments, tags and properties.
- Widget resolvers never log request arguments or customer documents: they
  carry visitors' emails, phones and custom data.
- The widget API has no endpoint that sends email to caller-chosen recipients
  or with caller-chosen content (`widgetsSendEmail` was removed as an open
  relay). Any widget email goes to the session's own customer with server-side
  content. Messenger replies are not emailed to the customer (only `lead`
  replies are), so the widget offers no "get notified by email" step
  (`widgetsSaveCustomerGetNotified` was removed).
- Facebook and Instagram `healthStatus` is written as broken only through
  `markUnhealthy`; a direct `updateOne` skips the channel notification.
- The integration `healthStatus` resolver answers `unknown`, never `healthy`,
  when the owning service cannot be reached.
- Set property handlers pass `targetActionId: action.targetActionId` to
  `getSetPropertySelector`, so a Manage properties action targeting an earlier
  action (Find object, Create) updates that action's record, not the trigger's.

- A media id (`<messageId>-<index>`, `facebook/meta/automation/utils/turnTaking.ts`)
  is the only way automation media reaches a ticket; `resolveConversationMedia`
  looks it up in the triggering conversation only, so no id can attach a file
  from another conversation. URLs never pass through the model.
- Automation ticket code resolves the inbox conversation through
  `resolveInboxConversationId`: Facebook targets carry the integration's own
  conversation id, never the inbox one.

- A `scheduled` article is published by a delayed BullMQ job on the
  `knowledgeBaseScheduledPublish` queue (`frontline`), never by a cross-tenant
  cron. `knowledgeBaseArticlesAdd` / `Edit` call `scheduleArticlePublish` with
  the saved article; each job carries its own `subdomain` and `articleId`, and
  `startScheduledPublishWorker` (started in `main.ts`) publishes only while the
  article is still `scheduled` with `scheduledDate <= now`. A reschedule
  therefore never cancels the old job: a stale job finds a later date or another
  status and does nothing. A queue failure is logged and never fails the save.
  Publishing sets `publishedAt` and queues the AI knowledge source refresh
  through `utils/refreshKnowledgeArticle.ts`, the one helper both the mutations
  and the worker use.
- Article `searchValue` matches `title`, `code`, `summary` and `content`
  (`buildQuery` in `knowledgeBaseQueries.ts`, shared with topics and
  categories, which also match `description`).
  `knowledgeBaseArticlesTotalCount` accepts the same `searchValue`, so a
  searched list and its count agree.
- `knowledgeBaseArticles` and `knowledgeBaseArticlesTotalCount` both build
  their selector with `buildArticleQuery`, which turns `topicIds` into the
  topics' category ids. An article's own `topicId` is never the filter: older
  and duplicated articles may lack it, and the list and its count must agree.
- `Category.updateDoc` moves a category to another topic (`doc.topicId`
  differing from the stored one) together with its whole subtree
  (`getSubtreeIds`) and every article in it (their `topicId` too). A moved
  category without a parent in the doc becomes a root (`parentCategoryId:
''`), and a parent from another topic is rejected. `''` and a missing
  `parentCategoryId` both mean a root category.
- Keep Telegram as an additive dispatcher case. Preserve other providers'
  delivery receipts, notifications, human-handoff state and message storage.
  Only Telegram chats without `customerId` may reply without a Core customer;
  a broken customer link must still fail. Internal notes never call Telegram.
- Telegram downloads enforce size/time/host bounds, persist to workspace
  storage and never expose token-bearing file URLs. Unsupported content gets
  a visible fallback. Transient ingestion failures remain retryable; uncertain
  outbound delivery must not be retried automatically.
- Absolute attachment URLs always use the bounded public HTTPS downloader,
  including URLs whose path is `/read-file`. Only relative `/read-file?key=`
  references and validated storage keys use workspace storage.
- A group upgrade stores `migratedToChatId` even when its service message is
  the first message seen for that group. Subsequent supergroup messages reuse
  the existing history, and replies target the new provider ID.
- Telegram text chunks contain at most 4096 code points; the first media caption
  contains at most 1024. Never truncate remaining text or trim chunk boundaries.
  Store every provider ID in one inbox message's `extraData.telegram.messageIds`;
  `textChunked` tells edit synchronization to concatenate without added separators.
  Common-field integration edits require no Telegram API call.
- Captionless Telegram media and polls still need conversation-list previews.
  Keep the filename/type/question fallback separate from message content so
  native attachment and poll bubbles do not gain artificial captions. Write
  the preview before publishing a new inbox message, including retry recovery.
- Disconnect must pause locally even when Telegram rejects the token. Removal
  detaches the bot and rotates its webhook secret before best-effort provider
  cleanup. Database failures still propagate. Inbox kind discovery includes
  `telegram-messenger`; URL/metadata parsing must avoid repeated suffix rescans.

- A ticket property option marked `deprecated` (archived) in core is never
  sent to the widget; records that already hold it keep it.

- Call Pro sends several webhooks per call, so `getOrCreateCustomer` in
  `src/modules/integrations/callpro/controller.ts` must never trust a
  `customers_callpros` row without `erxesApiId`: it links the core customer
  (`get-create-update-customer`) before returning, reuses the row a concurrent
  request inserted instead of failing, and deletes only a row it created
  itself. Every new Call Pro conversation stores `callProPhone`, so the caller
  number shows even when no customer is linked.
- Pipeline `isCheckUser` / `isCheckDepartment` / `isCheckBranch` filter which
  tickets a user sees; they never block opening a pipeline or creating a ticket
  in it (v2 parity). `validatePipelineAccess` only enforces private-pipeline
  membership. `buildVisibilityCondition` in
  `src/modules/ticket/utils/ticketVisibility.ts` exempts `role: 'system'`,
  `isOwner` and `excludeCheckUserIds` users; everyone else sees the OR of own
  (`createdBy`), assigned (`assigneeId`), own-department / own-branch tickets,
  and tickets of departments they supervise (core `departments.findWithChild`
  by `supervisorId`, intersected with the pipeline's `departmentIds`).
  `isCheckDate` stays an extra AND condition. `generateFilter` needs the
  request `subdomain` to resolve supervised departments.
- Staff pipeline rules (private-pipeline hiding and `isCheck*` visibility) never
  apply to client portal reads scoped by `createdBy`: `cpGetTickets` and
  `cpGetTicketTotalCount` pass `skipPipelineVisibility` to `generateFilter`, so
  a customer sees their own `cp:<id>` tickets in private pipelines. Without
  `createdBy` the staff rules still apply.
- `cpGetTicketPipelines` is readable with only a portal token (no `cpUser`
  required), so it never returns private pipelines and returns the
  `CpTicketPipeline` type (`_id`, `name`, `description`, `channelId`), never
  the staff `Pipeline` type with its member, department, numbering and
  `createdUser` fields. Keep any new client portal read on its own narrow type.
- A converted ticket's "Go to" URL (`conversationConvertedItems`, built in
  `src/modules/inbox/services/conversationConvertTargets.ts`) carries the
  ticket's `channelId` and `pipelineId` with `ticketId`; without them the
  tickets page falls back to the channel's first pipeline.
- Ticket activity logging (`createActivity` in
  `src/modules/ticket/utils/ticket.ts`) receives the whole ticket as `newDoc`
  (`{ ...ticket.toObject(), ...rest }`), so every field is compared on every
  update. `startDate`/`targetDate` must be compared by timestamp, never by
  reference: `toObject()` returns new `Date` instances and a reference compare
  logs a "changed start date X → X" activity on every unrelated edit.
- Instagram message state changes (reactions, deletions, read/delivery
  receipts) are written to both `instagram_conversation_messages` and the inbox
  `conversation_messages` row matched by `providerData.messageId`/`mid`, then
  published with `publishInstagramMessage`; updating only one side leaves the
  open timeline stale. Sender reactions are replaced through
  `replaceSenderReaction` so each sender keeps at most one reaction.
- `reactToConversationMessage` routes by integration kind through its
  `REACTION_HANDLERS` map (react + publish pair); a new reaction-capable kind is
  added there, never as another `if` branch.
- `scripts/print-subgraph-schema.ts` must exit the process itself: `erxes-api-shared/utils`
  opens a Redis client on import that would otherwise keep it alive.
- Stored timestamps are `Date` in the SDL, never `String`: a `String` field
  serializes a stored `Date` as epoch milliseconds.
- Mail thread serialization in `integrations/mail/utils/thread.ts` always
  supplies `attachments: message.attachments ?? []`; never rely on Mongoose
  defaults alone for the non-null attachment list. Preserve explicit
  defaults for references, bounced recipients, booleans and body. Delivery
  status remains `String` in the SDL so historical values can still be read.
- An argument a resolver cannot run without is non-null in the SDL:
  `responseTemplatesEdit(_id)`, `conversationMessageAdd(conversationId)`,
  `conversationMarkAsRead(_id)`, `ticketCreateNote(contentId)`,
  `addTicketStatus(type)`, and `[String!]!` for
  `channelAddMembers`/`channelRemoveMembers(memberIds)` and
  `formsRemove(_ids)`. The write methods still reject the empty values GraphQL
  lets through: `ResponseTemplates.updateResponseTemplate` (`_id`),
  `Note.createNote` (`contentId`, which also covers the client portal, widget
  and mail note paths) and `Status.addStatus` (`type`). `channelAddMembers`
  drops empty and repeated ids before inserting and rejects a list that ends
  up empty.
- `createPipeline(channelId: String!)` requires the channel, which the
  Mongoose schema already marks required, and `Pipeline.addPipeline` rejects
  an empty one. `updatePipeline` keeps `channelId` optional, so both
  mutations declare it themselves instead of through the shared
  `pipelineParams`.
- Every query, mutation and subscription declared in the SDL has a resolver,
  and every resolver is declared. Report resolvers are registered under
  `Query` only. `ticketPipelineChanged(_id: String!)` returns
  `PipelineSubscription`, the `{ type, pipeline }` payload the pipeline
  mutations publish.
- Every argument declared in the SDL is read by its resolver. The only
  exception is the shared cursor parameters from `erxes-api-shared`
  (`cursorMode`, `sortMode`, `aggregationPipeline`), which the plugin does not
  own. `integrationsSaveMessengerConfigs` and
  `integrationsSaveMessengerAppearanceData` take no `channelId`: the messenger
  create and edit mutations set the channel.
- Any request-driven value (filter, params, args, searchValue, queue) that
  reaches a `$regex` or `new RegExp()` goes through `escapeRegExp` from
  `erxes-api-shared/utils` first, called inline in the pattern. The
  plugin-local ESLint `no-restricted-syntax` rules in `eslint.config.js`
  (copied from operation_api) fail the lint otherwise. Three patterns are
  regexes on purpose and carry an `eslint-disable-next-line` with the reason:
  the admin-defined `customRegex` in `form/validationRegistry.ts`
  (length-capped, run with a timeout), the field `regexValidation` in
  `form/db/models/Forms.ts`, and `MAIL_TAG` in `mail/utils/textFormat.ts`,
  built from a constant tag list.
- Optional filter objects default to `{}` before use: `getTickets`,
  `cpGetTickets`, `cpGetTicketTotalCount` and `responseTemplates`.
  `userConversations` rejects a missing `_id`, because `$in: [undefined]`
  matches every conversation that has no `participatedUserIds` field.
  `frontlineFieldsBulkAction` accepts `updatedFields` without `newFields`.
- These arguments stay nullable on purpose: `conversationsAssign`
  `assignedUserId` (null unassigns), `callAddCustomer` `inboxIntegrationId` /
  `queueName` (either one finds the integration), the `updateTicketStatus`
  fields (a patch), `ticketCreateNote` `content` (a note may carry only
  attachments), and the `instagramGetPosts` filters (a missing one means no
  filter).

## Validation

- `pnpm nx run frontline_api:schema:print` - prints this subgraph's SDL to `generated/schema.graphql` (gitignored) offline, for `gateway:schema:compose`.
- `pnpm nx lint frontline_api` - runs ESLint with the plugin-local
  `eslint.config.js` (regex-escaping rules).
- `pnpm nx build frontline_api`
- `pnpm nx test frontline_api` — Jest over `src/**/*.test.ts` and the
  Telegram `src/**/*.spec.ts` suites (`jest.config.ts`, `tsconfig.spec.json`).
  Both suffixes are excluded from `tsconfig.build.json`; prefer `.test.ts` for
  new tests. Set `TELEGRAM_MONGO_TESTS=1` to include the isolated local Mongo suite.
- Knowledge base: schedule an article a few minutes ahead, confirm it stays
  `scheduled` and absent from the help center, then becomes `publish` with
  `publishedAt` at that time; reschedule another one later and confirm the old
  time does not publish it. Search articles by a word that appears only in a
  body and confirm the list and its total count both find it. Move a parent
  category to another topic and confirm its subcategories and their articles
  follow it, and that each topic's article list and total count agree.
- Mail agent: build an automation Email Received → AI Agent → Draft Email
  Reply, mail the inbox twice, and confirm each mail gets its own draft card;
  edit one, send it, delete the other. Swap the last step for Send Email and
  confirm the fourth reply within an hour is refused.
- Facebook Input step: Messenger trigger → Send Message with an Input (Wait
  for 1 minute), connect "If Reply" and "If Not Reply" to two text messages.
  Reply within the minute and get only the first; stay silent and get only
  the second; a reply does not start the automation again.
- Move a form, survey, response template, ticket pipeline and integration
  between two channels and confirm each leaves the source channel's list,
  appears in the destination's, and survives a reload.
- Call `facebookGetPosts(brandIds: [<brand>], limit: 5)` with a client
  portal's `x-app-token` and confirm it returns that brand's newest page posts
  across its connected Facebook post integrations; the same call without the
  token is rejected.
- Change a client portal's domain in core, then save the help center that
  points at it and confirm `url` and `erxesAppToken` followed the change while
  `clientPortalId` stayed put.
- Save a help center with two CMSes and confirm `cmsConfigs` holds both, that
  `cmsId` / `cmsAppToken` mirror the first entry, and that a config written
  before `cmsConfigs` existed still returns its single CMS as a one-entry list.
- Mail a pipeline address a message with a PDF and an inline image, and a
  second message with only an attachment. Confirm the ticket's first note
  lists the PDF but not the inline image, and the second message still becomes
  a note that lists its file.
- On that ticket, post a non-internal note with a PDF and text, then one with
  only a PDF. Confirm the requester receives both mails with the PDF attached,
  and that the second one's body lists the file name.
- Save a conversation's properties through `conversationEditCustomFields` and
  confirm the value round-trips on `Conversation.propertiesData`, a validation
  rejection throws instead of silently keeping the unvalidated input, and
  clearing every property to `{}` stays `{}` on the next read rather than
  reverting to any legacy value.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-10-19` — Conversation segment filter on the paged contract

- **Summary:** The inbox `segment` filter sends `{ segmentId, cursor, limit }` and collects every `ids` page; it used the pre-cutover `options` input and read `_id` from an array, so it matched nothing.
- **Affected areas:** `conversationQueryBuilder.ts` (+ `__tests__/conversationQueryBuilder.segment.test.ts`).
- **Contracts changed:** none provided; consumes core `segment.fetchSegment` paging.

### `2026-10-18` — Ticket remembered through action placement

- **Summary:** Create ticket declares what it remembers behind an AI agent (`defaultsWhenAfter`) instead of output `memorize` flags; ticket find object reports `acceptsFollowUp`; conversation media is stored on tickets with a MIME type.
- **Affected areas:** ticket automation constants, `findTicketObject.ts`, `conversationTickets.ts`.
- **Contracts changed:** `defaultsWhenAfter` on Create ticket; `acceptsFollowUp` on the find object result; `memorize` removed.

### `2026-10-17` — AI long-term memory scopes

- **Summary:** Messenger and Facebook AI context names the conversation and customer as memory scopes; ticket output marks the fields the agent remembers.
- **Affected areas:** Facebook and inbox automation context, ticket automation constants.
- **Contracts changed:** `TAiContext.memory.scopes`; `memorize` flag on ticket output variables.

### `2026-10-16` — AI agent turns, media and tickets on Messenger

- **Summary:** Debounced Messenger AI turns, media-only messages, media markers and open-ticket facts for the agent, ticket attachments and conversation relations, and topic/category scope for the knowledge base source.
- **Affected areas:** Facebook automation trigger and context, ticket automation actions, knowledge base AI provider.
- **Contracts changed:** `createTicket` config gains `attachmentIds`; AI context facts gain `mediaIds` and `openTickets`; knowledge source config accepts `topicIds`, `categoryIds`, `articleIds`.

### `2026-10-06` — Telegram group upgrades and attachment URLs

- **Summary:** Retains the reply target for first-seen group upgrades and downloads absolute attachment URLs from their stated host.
- **Affected areas:** Telegram conversation mapping, reply attachment reader and regression tests.
- **Contracts changed:** None; existing migration metadata and attachment input shapes are preserved.

### `2026-10-06` — Telegram previews and review hygiene

- **Summary:** Preserves captionless media and poll previews and documents Telegram lifecycle contracts while cleaning up test fixtures.
- **Affected areas:** Telegram ingestion/content adapters, module documentation and regression tests.
- **Contracts changed:** None; previews use the existing conversation content field.

### `2026-10-06` — Complete long Telegram replies and connection edits

- **Summary:** Sends long text and caption overflow in ordered parts and lets Telegram common-field edits complete successfully.
- **Affected areas:** Telegram reply delivery, edit synchronization, inbox integration dispatcher and regression tests.
- **Contracts changed:** Optional `extraData.telegram.textChunked` metadata; existing inbox and GraphQL shapes are preserved.

### `2026-10-06` — Telegram review fixes

- **Summary:** Restores Telegram kind discovery, permits local disconnect/removal during provider failures and bounds link parsing work.
- **Affected areas:** Inbox kind map, Telegram lifecycle, link previews and regression tests.
- **Contracts changed:** `telegramDisconnectBot` returns remote-cleanup confirmation after local deactivation; provider cleanup failures no longer block removal.

### `2026-10-06` — Telegram integration on the current inbox architecture

- **Summary:** Adds Telegram setup, webhook ingestion and replies through the existing provider dispatcher and inbox persistence flow.
- **Affected areas:** `src/modules/integrations/telegram`, inbox provider dispatch, model registration and routes.
- **Contracts changed:** Telegram bot lifecycle/status GraphQL and `/telegram/receive/:_id`; provider metadata uses `extraData.telegram`.
