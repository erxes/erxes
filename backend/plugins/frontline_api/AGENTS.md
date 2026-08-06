# `frontline_api` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/frontline_api`
- **Last synchronized:** `2026-08-06`

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
  comments), Instagram, IMAP, Discord, and Call (SIP/CDR).
- Response templates.
- Ticketing: boards, pipelines, statuses, tickets, activities, notes, ticket
  configs, plus ticket import/export handlers.
- Forms: form definitions, fields, and form submissions (with submission export).
- Knowledge base: topics, categories, articles, and the AI knowledge source
  provider that indexes articles.
- Frontline reports.
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
- Boots the Call app, the IMAP poller, and the Discord gateway client from
  `onServerInit`.
- Ticket boards/pipelines, response templates, forms, knowledgebase articles,
  and report aggregations.
- Contributes permissions, notifications, segments, references, and
  import/export handlers to the platform through `meta/`.

## Architecture

| Area                 | Path                                                                        | Responsibility                                                                                          |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Bootstrap            | `src/main.ts`                                                               | `startPlugin({ name: 'frontline', port: 3304 })`, wires tRPC, routes, meta, and every surface           |
| Models               | `src/connectionResolvers.ts`                                                | Per-subdomain model container for all modules                                                           |
| GraphQL              | `src/apollo/`                                                               | Aggregated `typeDefs` and `resolvers` across modules                                                    |
| tRPC                 | `src/init-trpc.ts`                                                          | `appRouter` for service-to-service calls                                                                |
| HTTP                 | `src/routes.ts`                                                             | Mounts `/facebook` and `/instagram` webhook routers                                                     |
| Platform extensions  | `src/meta/`                                                                 | automations, permissions, notifications, segments, references, import/export                            |
| Channels             | `src/modules/channel/`                                                      | Channel + ChannelMember models, schema, resolvers, role checks                                          |
| Inbox                | `src/modules/inbox/`                                                        | Conversations, messages, integrations, widget/clientportal schemas, `receiveInboxMessage`               |
| Conversation queries | `src/conversationQueryBuilder.ts`, `src/modules/inbox/conversationUtils.ts` | Mongo and Elasticsearch conversation filters (membership-scoped)                                        |
| Integrations         | `src/modules/integrations/<kind>/`                                          | facebook, instagram, imap, discord, call, trpc                                                          |
| FB automation        | `src/modules/integrations/facebook/meta/automation/`                        | Comment/message triggers and actions, bot message generation                                            |
| FB page posting      | `src/modules/integrations/facebook/postService.ts`, `postGuard.ts`          | Post publishing pipeline (validation, photo staging, cleanup, permalink) and its rate limit + audit log |
| FB app resolution    | `src/modules/integrations/facebook/commonUtils.ts`                          | `resolveFacebookApp`, `facebookAppSelector`, `facebookAccountSelector`                                  |
| Ticket               | `src/modules/ticket/`                                                       | Boards, pipelines, statuses, tickets, activities, notes                                                 |
| Forms                | `src/modules/form/`                                                         | Forms, fields, submissions                                                                              |
| Knowledge base       | `src/modules/knowledgebase/`                                                | Topics, categories, articles, AI knowledge source                                                       |
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
- HTTP routes in `src/routes.ts` and provider webhooks under
  `src/modules/integrations/*`: Express webhook routes `/facebook/*` and
  `/instagram/*`, including the OAuth entry points `/facebook/fblogin`,
  `/facebook/kind/:kind/fblogin`, and `/instagram/iglogin`.
- Automation constants (`triggers`, `actions`, `bots`, AI knowledge sources) and
  worker producers exported from `src/meta/automations.ts`.
- Permissions, notification types, segment definitions, references, and
  ticket/form-submission import-export handlers from `src/meta/`.

### Consumes

- `erxes-api-shared/utils`: `startPlugin`, `sendTRPCMessage`, `fetchEs`,
  `getEnv`, `sendWorkerQueue`, `getUniqueValue`, `randomAlphanumeric`,
  `schemaWrapper`, `mongooseStringRandomId`.
- `erxes-api-shared/core-modules`: `sendNotification`, `canGroup`,
  import/export producer handlers, automation types,
  `replaceOutputPlaceholders`, `splitType`, `sendAutomationTrigger`,
  `EXECUTE_WAIT_TYPES`, `attachmentSchema`.
- `core` over tRPC — brands, tags, users, structure,
  `configs.getFileUploadConfigs`, `users.findOne`.
- Facebook Graph API through `fbgraph` (`graphRequest` in
  `src/modules/integrations/facebook/utils.ts`).

## Data and State

- Tenant-scoped Mongo collections generated per `subdomain` through
  `generateModels`; all reads and writes are tenant-scoped.
- Collections are namespaced per module: `Facebook*`, `Instagram*`, `Call*`,
  `Discord*`, `Imap*`, plus inbox (`Conversations`, `ConversationMessages`),
  channel, ticket, form, and knowledge base collections.
- `channels.scope` — `'team' | 'personal'`, default `'team'`. Legacy documents
  have no `scope` field; all reads treat a missing value as `team`, so **no
  backfill migration is required**.
- Partial unique index `channels { createdBy: 1 }` with
  `partialFilterExpression: { scope: 'personal' }` — enforces at most one
  personal channel per user and makes concurrent creation race-safe (the loser
  catches duplicate-key `11000` and reuses the winner).
- Unique index `channelMembers { channelId: 1, memberId: 1 }`.
- Migrations under `src/migrations/` cover call conversation content, CDR dates,
  channels, forms, response templates, and tickets.
- Facebook upload configuration is cached in a module-level variable in
  `src/modules/integrations/facebook/utils.ts` and is **not** keyed by
  subdomain — treat it as a known cross-tenant hazard when touching that file.

## Local Invariants

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
- Conversations reference an integration, not a channel. Any per-channel
  conversation count must resolve the channel's integration ids first; never
  read `channels.conversationCount` / `channels.openConversationCount`, which
  are stale legacy fields.
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
- Automation operation and node type names stay prefixed with the plugin and
  module (`frontline:facebook.comments.create`).
- Facebook/Instagram automations must resolve their integration and bot from the
  request's own models; never read another plugin's collections.
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

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-06` — Knowledge base articles support whole-source AI indexing

- **Summary:** The knowledge base AI source now streams every published article
  through a cursor-paginated batch when the agent selects the whole scope,
  instead of only resolving an explicit article id list. Single-document
  refreshes narrow that batch with `candidateSourceIds`.
- **Affected areas:**
  `src/modules/knowledgebase/meta/automations.ts`
  (`frontlineAiKnowledgeProvider.loadAiKnowledgeDocumentBatch`),
  `src/meta/automations.ts` (knowledge source declaration)
- **Contracts changed:** The `knowledgebase.article` knowledge source declares
  `supportsFullScope: true`, and its `loadAiKnowledgeDocumentBatch` handler
  honours the new `scope: 'all' | 'selected'` producer input.
### `2026-08-06` — Conversation counts on channels and used integration kinds

- **Summary:** Added `Channel.conversationCount` /
  `Channel.unreadConversationCount` field resolvers, and gave
  `integrationsGetUsedTypesByChannel` its own return type carrying the same two
  counts per integration kind, folded from one aggregation over the matched
  channels' integrations.
- **Affected areas:**
  `src/modules/channel/graphql/{schemas/channel.ts,resolvers/customResolvers/channel.ts}`,
  `src/modules/inbox/graphql/{schemas/integration.ts,resolvers/queries/integrations.ts}`.
- **Contracts changed:** `Channel` gained two nullable `Int` fields;
  `integrationsGetUsedTypesByChannel` now returns
  `[integrationsGetUsedTypesByChannel]` instead of `[integrationsGetUsedTypes]`
  — same `_id` / `name` fields, plus the two counts.

### `2026-08-06` — Personal channels accept every integration kind

- **Summary:** Removed `PERSONAL_INTEGRATION_KINDS` and the kind check in
  `integrationsCreateExternalIntegration`. A personal channel now takes the same
  integrations a team channel does, and a create call with no `channelId` falls
  back to the caller's personal channel for any kind instead of erroring for
  everything but IMAP.
- **Affected areas:**
  `src/modules/inbox/graphql/resolvers/mutations/integrations.ts`,
  `src/modules/inbox/db/definitions/constants.ts`.
- **Contracts changed:** `integrationsCreateExternalIntegration` no longer
  rejects an omitted `channelId` for non-mailbox kinds; the ownership check on
  another user's personal channel is unchanged.

### `2026-08-06` — Fix the Facebook login callback behind the authorize redirector

- **Summary:** The OAuth `state` carries the integration kind as a
  `/kind/<kind>` path segment instead of a `?kind=` query string, and
  `/facebook/kind/:kind/fblogin` accepts the redirector callback, so returning
  from Facebook no longer lands on `/facebook` with `Cannot GET /facebook`.
- **Affected areas:**
  `src/modules/integrations/facebook/middlewares/loginMiddleware.ts`,
  `src/modules/integrations/facebook/routes.ts`
- **Contracts changed:** new HTTP route `GET /facebook/kind/:kind/fblogin`

### `2026-08-05` — `getMyChannels` sorting

- **Summary:** `getMyChannels` accepts `sortField` / `sortDirection` and sorts in
  Mongo, so the UI no longer has to order the list client-side. `sortField` is
  checked against an allowlist (`name`, `createdAt`) before it reaches the query,
  and the query is collated so `name` does not fall back to byte order.
- **Affected areas:**
  `src/modules/channel/graphql/{schemas,resolvers/queries}/channel.ts`.
- **Contracts changed:** `getMyChannels` gained optional `sortField: String` and
  `sortDirection: Int` arguments; default order is `createdAt` descending, where
  it was previously unspecified.

### `2026-08-05` — `getChannels` restricted to team scope

- **Summary:** `getChannels` now returns only team-scoped channels on all four
  branches; personal inboxes (including the caller's own) are excluded and
  remain reachable through `getPersonalChannel`. Added `teamChannelsOnly` in
  `src/modules/channel/utils.ts`, which also matches legacy documents written
  before `scope` existed, since the schema default is `team`.
- **Affected areas:** `src/modules/channel/utils.ts`,
  `src/modules/channel/graphql/resolvers/queries/channel.ts`.
- **Contracts changed:** `getChannels` no longer returns personal channels; its
  arguments and return type are unchanged.

### `2026-08-04` — `integrationsGetUsedTypesByChannel` resolver

- **Summary:** Implemented the already-declared query so it returns the active
  integration kinds used by the caller's visible channels, optionally narrowed
  by channel id and/or scope, resolving channel ids first and then a single
  `distinct('kind')` read; extracted `visibleChannelsFilter` so the channel
  visibility rule has one implementation.
- **Affected areas:**
  `src/modules/inbox/graphql/{resolvers/queries/integrations.ts,schemas/integration.ts}`,
  `src/modules/channel/utils.ts`,
  `src/modules/channel/graphql/resolvers/queries/channel.ts`.
- **Contracts changed:** `integrationsGetUsedTypesByChannel` gained an optional
  `scope: String` argument and its `channelId` relaxed from `String!` to
  `String`; the query itself was already declared and previously returned
  `undefined`.

### `2026-08-04` — Drop the unreachable `imageUrls` path from page posting

- **Summary:** `facebookCreatePost` only accepts uploaded image keys, so the
  never-called URL variant (`uploadUnpublishedPhoto`, its https-only check, and
  the `imageUrls` argument) is gone, along with a write-only `accountId` in the
  login middleware.
- **Affected areas:** `src/modules/integrations/facebook/postService.ts`,
  `.../utils.ts`, `.../graphql/schema/facebook.ts`,
  `.../middlewares/loginMiddleware.ts`
- **Contracts changed:** `facebookCreatePost` no longer accepts `imageUrls`

### `2026-08-04` — Extract the page-post publishing pipeline out of the resolver

- **Summary:** `facebookCreatePost` now delegates to `publishPagePost` in
  `postService.ts`, which owns image validation, unpublished-photo staging with
  cleanup, permalink lookup, and audit logging; account queries share one
  app-scope selector.
- **Affected areas:**
  `src/modules/integrations/facebook/postService.ts` (new),
  `.../graphql/resolvers/mutations.ts`, `.../graphql/resolvers/queries.ts`,
  `.../commonUtils.ts`, `.../db/definitions/accounts.ts`
- **Contracts changed:** `None`

### `2026-08-04` — Stop message-level Graph errors from marking integrations unhealthy

- **Summary:** Request-level Facebook Graph error codes no longer set
  `FacebookIntegrations.healthStatus` to `account-token`, which was showing a
  false token failure whenever an automation sent an invalid payload.
- **Affected areas:** `src/modules/integrations/facebook/utils.ts` (`sendReply`)
- **Contracts changed:** `None`

### `2026-08-03` — Lazy personal-channel provisioning

- **Summary:** Added the `getPersonalChannel` query so a personal channel is
  created the first time it is read, replacing any need to choose a scope at
  channel-creation time.
- **Affected areas:** `src/modules/channel/graphql/{schemas,resolvers/queries}/channel.ts`.
- **Contracts changed:** New query `getPersonalChannel: Channel` with
  get-or-create semantics.
