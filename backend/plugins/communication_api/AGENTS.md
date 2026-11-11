# `communication_api` Plugin Guide

## Identity

- **Plugin:** `communication`
- **Project:** `communication_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/communication_api`
- **Last synchronized:** `2026-11-11`

## Scope

### Owns

- App-scoped private messaging under `src/modules/messaging/`: app enrollment
  and member identity, DIRECT and GROUP conversations, membership and roles,
  messages, read state, unread counts, typing, durable sync events,
  subscription tickets, private attachments, per-app devices, FCM push and
  notification preferences.
- The `communication_messaging_*` MongoDB collections and the
  `communication:messaging:*` Redis keys.
- Read-only staff oversight of every conversation in the organization
  (`src/modules/messaging/admin.ts`) and its `communicationMessagingViewAll`
  permission action.

### Does not own

- Any UI surface; `communication_ui` owns the admin pages.
- Any other plugin's models, routes, tRPC procedures, Client Portal identity
  or widget sessions.
- Staff users, permissions, brands or segments owned by `core-api`.
- The gateway's subscription transport, supergraph composition or `/pl:*`
  proxy, which are consumed as platform contracts.
- A second module. It is reserved and has no code, schema, models or routes.

## Current Capabilities

- Deployment-owned app admission from `COMMUNICATION_MESSAGING_APPS`: unique
  tenant/appId and issuer/audience pairs, pinned RSA keys of at least 2048 bits,
  per-app DIRECT/GROUP flags, optional private S3-compatible storage and
  optional FCM push. RS256 access tokens in `x-communication-messaging-token` select
  tenant, app and member scope.
- DIRECT pair uniqueness, GROUP owner/admin/member management (up to 50
  members), transactional idempotent sends, join-history boundaries, unread
  counts, monotonic read positions, typing heartbeats, 30-day retained event
  synchronization with reset detection, and member listing within one app.
- Single-use subscription tickets admit one `communicationMessagingWake`
  subscription that completes at the access token's expiry.
- Private attachment upload/download with MIME signature and size checks,
  membership and history revalidation, and expiry cleanup.
- Per-installation device registration, FCM HTTP v1 delivery with retry,
  backoff, jitter, Retry-After and generation-scoped token revocation, and
  ALL/MENTIONS/NONE preferences.
- Atomic Redis fixed-window rate limits that fail closed.
- Staff oversight: holders of an explicitly granted
  `communicationMessagingViewAll` list DIRECT and GROUP conversations by app,
  kind and member or group-name search, and read details, full history,
  members and bound attachments without being participants. Every successful
  access is audited; nothing is written to messaging data.
- Client contract, configuration, deployment and rollout are documented in
  `src/modules/messaging/README.md` and `operations.graphql`.

## Architecture

| Area                 | Path                                                                                    | Responsibility                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Bootstrap            | `backend/plugins/communication_api/src/main.ts`                                         | `startPlugin({ name: 'communication', port: 3306 })`; wires GraphQL, subscriptions, routes, worker |
| GraphQL schema       | `backend/plugins/communication_api/src/apollo/`                                         | Aggregates module types, root fields and resolvers into one subgraph                               |
| Gateway subscription | `backend/plugins/communication_api/src/apollo/subscription.ts`                          | Served at `/subscriptionPlugin.js`; consumes tickets and streams wake-ups in the gateway           |
| HTTP routes          | `backend/plugins/communication_api/src/routes.ts`                                       | Mounts module routers on the plugin's Express app                                                  |
| Messaging auth       | `backend/plugins/communication_api/src/modules/messaging/auth.ts`, `config.ts`          | App registry parsing and RS256 verification                                                        |
| Messaging domain     | `backend/plugins/communication_api/src/modules/messaging/conversations.ts`, `events.ts` | Transactions, membership, sends, reads, typing, tickets and sync                                   |
| Messaging delivery   | `backend/plugins/communication_api/src/modules/messaging/push.ts`, `worker.ts`          | Device registry, FCM outbox and per-app pollers                                                    |
| Messaging files      | `backend/plugins/communication_api/src/modules/messaging/attachments.ts`                | Private storage client and upload/download routes                                                  |
| Messaging data       | `backend/plugins/communication_api/src/modules/messaging/models.ts`                     | Schemas, indexes and the module's own model generator                                              |
| Messaging API        | `backend/plugins/communication_api/src/modules/messaging/graphql.ts`, `limits.ts`       | SDL, resolvers and per-member rate limits                                                          |
| Staff oversight      | `backend/plugins/communication_api/src/modules/messaging/admin.ts`                      | Read-only admin queries, admin attachment route, grant check and audit                             |
| Plugin meta          | `backend/plugins/communication_api/src/meta/`                                           | Permission action for the role editor; admin queries hidden from the AI agent                      |

A future module lives in `src/modules/<module>/` and registers only through
`src/apollo/schema/schema.ts`, `src/apollo/resolvers/queries.ts` and
`mutations.ts`, `src/routes.ts`, `src/apollo/subscription.ts` (typeDefs and
`generateResolvers`) and `onServerInit` in `src/main.ts`.

## Contracts

### Provides

- 8 queries and 12 mutations named `communicationMessaging*` with
  `CommunicationMessaging*` types, and the gateway subscription
  `communicationMessagingWake(ticket: String!): Boolean!`. Every resolver is marked
  `skipPermission` and authenticates the app token itself.
- `communicationMessagingSend`, `communicationMessagingCreateGroup`,
  `communicationMessagingPrepareAttachment`, `communicationMessagingSubscriptionTicket`
  and `communicationMessagingRegisterDevice` fail with `RATE_LIMITED` (with
  `retryAfter`) or `SERVICE_UNAVAILABLE` when Redis cannot count the request.
- `PUT` and `GET /messaging/attachments/:id`, reached through the gateway as
  `/pl:communication/messaging/attachments/:id`. `communicationMessagingPrepareAttachment`
  returns that path as `uploadPath`.
- Wake-ups on `graphqlPubsub` topic `communication:messaging:wake:[tenant,appId,memberId]`
  with payload `{ communicationMessagingWake: true }`.
- Staff queries `communicationMessagingAdminApps`, `…AdminConversations`,
  `…AdminConversation`, `…AdminMessages` and `…AdminParticipants` with
  `CommunicationMessagingAdmin*` types. Apps are addressed by an opaque
  `tenant/appId` key; pages hold at most 50 items. There are no admin
  mutations.
- `GET /messaging/admin/attachments/:id?app=<key>` (gateway path
  `/pl:communication/messaging/admin/attachments/...`) for staff, requiring the
  `x-communication-messaging-admin: 1` header.
- Permission action `communicationMessagingViewAll` in module `messaging` and
  the explicitly assigned predefined group `communication:messaging-viewer`
  (Communication Messaging Viewer), containing only that action at `all` scope.
- Audit records in the core logs service: `source: 'graphql'`,
  `action: 'communicationMessagingAdminAccess'`, with `userId`, `subdomain`
  and a payload of `accessType`, `accessedAt`, tenant, app, conversation or
  attachment IDs and counts.

### Consumes

- `startPlugin`, `createGenerateModels`, `schemaWrapper`, `markResolvers`,
  `graphqlPubsub`, `redis`, `apolloCommonTypes` and `apolloCustomScalars` from
  `erxes-api-shared/utils`.
- `checkPermissionGroup` and `getGroupActionsMap` from
  `erxes-api-shared/core-modules`, the request's `checkPermission`, and the
  gateway-verified `user` header (`extractUserFromHeader`).
- The `logs` worker queue (`sendWorkerQueue('logs', 'put_log')`); reading the
  records requires core `logsRead`.
- Gateway service discovery, supergraph composition, `/pl:communication` proxy
  and the subscription plugin loader.
- Firebase OAuth and FCM HTTP v1, and S3-compatible object storage through
  `aws-sdk` v2, using per-app server-side credentials.

## Data and State

- `communication_messaging_identities`, `_conversations`, `_memberships`,
  `_messages`, `_events`, `_attachments`, `_devices` and `_deliveries`, with
  every query scoped by `tenant` and `appId`. Models come from the verified
  token's tenant through the module's own `createGenerateModels` registry.
- Events and deliveries expire after 30 days through TTL indexes. Pending
  uploads expire after 15 minutes and unbound uploads after 24 hours.
- Redis keys `communication:messaging:ticket:<sha256>`,
  `communication:messaging:rate:<scope>` and `communication:messaging:typing:<scope>`.
- Object keys are `<sha256(tenant, appId)>/<uuid>` in each app's bucket.
- `communication_messaging_conversations` has an index on
  `{ tenant, appId, lastActivityAt: -1, _id: -1 }` for the oversight list.
- In-process state is limited to the parsed app registry and cached Firebase
  access tokens.

## Local Invariants

- Participant operations derive tenant, app and member scope only from a
  verified app access token; staff, portal and widget context never authorize
  them. Never add a tRPC router that reaches these collections.
- Staff oversight requires `checkPermission` and the action present in the
  user's resolved permission groups or custom permissions, so owners and
  allow-all app tokens are not admitted implicitly. The predefined group ID
  must not end in `:viewer`, because Core automatically assigns that suffix to
  users with no grants. Never mark the module or action `always` or add this
  action to an automatically assigned group. A SaaS organization sees only apps whose
  tenant equals its verified subdomain; a self-hosted deployment is one
  organization. Never take a tenant from the client.
- Oversight is read-only: no admin mutations, no transactions, no participant
  write helpers, no wake-ups. Each successful access is queued to the logs
  service before data is returned, and access is refused when it cannot be.
  Audit payloads hold identifiers only, never message text or file contents.
  Keep the admin queries in `meta.agent.hiddenOperations`.
- Public names use `communicationMessaging*` / `CommunicationMessaging*`; the
  header, environment variables, collections and Redis keys use the matching
  `communication-messaging`, `COMMUNICATION_MESSAGING_`, `communication_messaging_`
  and `communication:messaging:` prefixes. Renaming a collection, Redis key or
  wake-up topic needs a data and rolling-deploy plan.
- Register each messaging field, subscription and worker only here.
- `src/apollo/subscription.ts` is imported raw by the gateway in development:
  keep it free of TypeScript syntax and path aliases, and import only packages
  the gateway resolves.
- A ticket is consumed atomically when its subscription starts. The stream ends
  with an explicit `complete` at the stored access-token expiry.
- Rate limits are keyed by verified tenant, app, member and operation, count
  atomically in Redis, and fail closed.
- DIRECT pair keys and send idempotency use explicit UTF-16 ordering; locale
  sorting would change existing keys. Recipient counters use ordered bulk
  writes on the transaction session, followed by event inserts on that session.
  Never parallelize transaction commands.
- Each worker claims and finalizes one leased event or delivery before the next.
  Cleanup tasks settle before the poller's running guard is released. Push
  retry jitter uses `node:crypto.randomInt`.
- Modules do not import each other's internals. Move code to `src/` only when
  two modules actually share it.

## Validation

- `pnpm nx lint communication_api`
- `pnpm nx build communication_api`
- `pnpm nx run communication_api:schema:print`
- `pnpm nx run gateway:schema:compose` composes every subgraph and fails on a
  duplicate `communicationMessaging*` field.
- CI: `.github/workflows/ci-api-communication.yml` lints, tests and builds the plugin on
  changes to it or `erxes-api-shared` and pushes
  `erxes/erxes-next-communication_api` from `main`; `release.yml` tags that
  image and `release-plugin.yml` builds `communication_api@<version>` tags.
- `pnpm nx test communication_api` runs
  `src/modules/messaging/__tests__/admin.test.ts` (authorization, tenant scope,
  read-only access, audit and the attachment route).
- Smoke scenario with a configured app: register, open a DIRECT, send, sync,
  obtain a ticket and receive a wake-up through the gateway; then, as staff
  with the action, read that conversation and confirm unread counts and read
  positions are unchanged.
