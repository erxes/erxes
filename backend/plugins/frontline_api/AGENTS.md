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
- External integration runtimes hosted in this service: IMAP, Facebook,
  Instagram, Discord, and calls.
- Tickets (boards, pipelines, stages), response templates, forms, knowledgebase,
  and frontline reports.

### Does not own

- Users, brands, tags, permission groups, and segments — read through core via
  tRPC, never modelled here.
- Any UI surface; `frontline_ui` owns routes, forms, and rendering.
- Other plugins' collections or service implementations.

## Current Capabilities

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
- Ticket boards/pipelines, response templates, forms, knowledgebase articles,
  and report aggregations.

## Architecture

| Area                 | Path                                                             | Responsibility                                                       |
| -------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| Bootstrap            | `src/main.ts`                                                    | `startPlugin({ name: 'frontline', port: 3304 })`, tRPC, routes, meta  |
| Channels             | `src/modules/channel`                                            | Channel + ChannelMember models, schema, resolvers, role checks        |
| Inbox                | `src/modules/inbox`                                              | Conversations, messages, integrations, widget/clientportal schemas    |
| Conversation queries | `src/conversationQueryBuilder.ts`, `src/modules/inbox/conversationUtils.ts` | Mongo and Elasticsearch conversation filters (membership-scoped) |
| Integration runtimes | `src/modules/integrations/{imap,facebook,instagram,discord,call}` | Provider connections, webhooks, message brokers                      |
| Tickets              | `src/modules/ticket`                                             | Boards, pipelines, stages, ticket lifecycle                          |
| Migrations           | `src/migrations`                                                 | One-off data migrations owned by this plugin                         |

## Contracts

### Provides

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
- GraphQL: `integrationsGetUsedTypesByChannel` returns
  `[integrationsGetUsedTypesByChannel]` (its own type, not the shared
  `integrationsGetUsedTypes`), carrying `conversationCount` and
  `unreadConversationCount` per kind for the matched channels.
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
- tRPC `inbox.updateUserChannels({ channelIds, userId })` — replaces a user's
  team channel memberships; never touches their personal channel.
- GraphQL: `integrationsGetUsedTypes` and
  `integrationsGetUsedTypesByChannel(channelId: String, scope: String)` — the
  integration kinds that currently have at least one active integration:
  repository-wide for the former, and for the latter within the caller's
  visible channels, optionally narrowed by channel id and/or channel scope.
  Both return `[{ _id: kind, name: label }]` filtered through the
  `getIntegrationsKinds()` label map. `scope: "team"` also matches legacy
  channels that have no `scope` field. The by-channel query requires an
  authenticated user and never reveals another user's personal inbox.
- HTTP routes in `src/routes.ts` and provider webhooks under
  `src/modules/integrations/*`.

### Consumes

- `erxes-api-shared/utils`: `startPlugin`, `sendTRPCMessage`, `fetchEs`,
  `getUniqueValue`, `schemaWrapper`, `mongooseStringRandomId`.
- `erxes-api-shared/core-modules`: `sendNotification`, `canGroup`,
  import/export producer handlers.
- Core via tRPC for brands, tags, users, and structure.

## Data and State

- Tenant-scoped Mongo collections generated per `subdomain` through
  `generateModels`.
- `channels.scope` — `'team' | 'personal'`, default `'team'`. Legacy documents
  have no `scope` field; all reads treat a missing value as `team`, so **no
  backfill migration is required**.
- Partial unique index `channels { createdBy: 1 }` with
  `partialFilterExpression: { scope: 'personal' }` — enforces at most one
  personal channel per user and makes concurrent creation race-safe (the loser
  catches duplicate-key `11000` and reuses the winner).
- Unique index `channelMembers { channelId: 1, memberId: 1 }`.

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
- Every resolver, model call, worker, and route resolves models from the request
  `subdomain`.
- Do not introduce new `schemaWrapper` usage; existing usages stay as they are.

## Validation

- `pnpm nx build frontline_api`
- `npx tsc -p backend/plugins/frontline_api/tsconfig.json --noEmit`
- `pnpm nx lint frontline_api` (repository-wide pre-existing errors exist in
  `src/public/widget/messengerWidget.bundle.js` and some ticket/report files;
  lint the files you touched)
- Smoke: connect an IMAP account without a `channelId` → a `Personal inbox`
  channel is created with one admin member and the integration attaches to it;
  a second connect reuses the same channel; the same holds for a non-mailbox
  kind such as a webhook; creating an integration against another user's
  personal `channelId` is rejected; `channelAddMembers` on it fails; no user's
  `getChannels` lists it — not even the owner's.
- `project.json` defines no `test` target for this project.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

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

### `2026-08-03` — Lazy personal-channel provisioning

- **Summary:** Added the `getPersonalChannel` query so a personal channel is
  created the first time it is read, replacing any need to choose a scope at
  channel-creation time.
- **Affected areas:** `src/modules/channel/graphql/{schemas,resolvers/queries}/channel.ts`.
- **Contracts changed:** New query `getPersonalChannel: Channel` with
  get-or-create semantics.

### `2026-07-31` — `scope` argument on `channelAdd`

- **Summary:** `channelAdd` accepts an explicit `scope`, defaulting to `team`,
  with personal-channel invariants enforced at the mutation boundary.
- **Affected areas:** `src/modules/channel/graphql/{schemas,resolvers/mutations}/channel.ts`.
- **Contracts changed:** `channelAdd` gained an optional `scope: String`.

### `2026-07-31` — Personal channels

- **Summary:** Added `scope` to channels so a user gets a private single-member
  inbox that personal-mailbox integrations (IMAP) attach to by default, with no
  invite path and no new conversation-filter branch.
- **Affected areas:** `src/modules/channel/**`,
  `src/modules/inbox/graphql/{resolvers/mutations/integrations.ts,schemas/integration.ts}`,
  `src/modules/inbox/db/definitions/constants.ts`,
  `src/modules/inbox/db/models/Integrations.ts`.
- **Contracts changed:** `Channel.scope` added (nullable String);
  `integrationsCreateExternalIntegration.channelId` relaxed from `String!` to
  `String`; `channelAddMembers` now errors on personal channels.
