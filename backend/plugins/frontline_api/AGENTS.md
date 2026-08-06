# `frontline_api` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/frontline_api`
- **Last synchronized:** `2026-08-06`

## Scope

### Owns

- Omnichannel inbox: channels, integrations, conversations, conversation
  messages, response templates.
- Channel integrations and their webhook ingestion, message delivery, and bot
  automation: Facebook (Messenger + Page comments), Instagram, IMAP, Discord,
  and Call (SIP/CDR).
- Ticketing: pipelines, statuses, tickets, activities, notes, ticket configs,
  plus ticket import/export handlers.
- Forms: form definitions, fields, and form submissions (with submission export).
- Knowledge base: topics, categories, articles, and the AI knowledge source
  provider that indexes articles.
- Plugin-owned automation triggers/actions/bots contributed to the platform
  automation engine.

### Does not own

- The automation execution engine, wait conditions, or trigger dispatch — those
  live in `erxes-api-shared/core-modules` and are consumed, not modified.
- Customers, users, teams, permissions storage, file upload configuration, and
  segments infrastructure — owned by `core-api` and reached over tRPC.
- Meta/Facebook app registration and page tokens beyond what is stored on this
  plugin's own integration and account documents.
- Frontend routes, forms, and translations — see `frontline_ui`. The `frontline`
  i18n namespace is served from `backend/gateway/src/locales/{en,mn}/frontline.json`,
  which is gateway-owned, not plugin-owned.

## Current Capabilities

- Runs as a federated subgraph plus tRPC service on port `3304`, with GraphQL
  subscriptions enabled.
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
- Contributes permissions, notifications, segments, references, and
  import/export handlers to the platform through `meta/`.

## Architecture

| Area                | Path                                                               | Responsibility                                                                                          |
| ------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Bootstrap           | `src/main.ts`                                                      | `startPlugin({ name: 'frontline', port: 3304 })`, wires every surface                                   |
| Models              | `src/connectionResolvers.ts`                                       | Per-subdomain model container for all modules                                                           |
| GraphQL             | `src/apollo/`                                                      | Aggregated `typeDefs` and `resolvers` across modules                                                    |
| tRPC                | `src/init-trpc.ts`                                                 | `appRouter` for service-to-service calls                                                                |
| HTTP                | `src/routes.ts`                                                    | Mounts `/facebook` and `/instagram` webhook routers                                                     |
| Platform extensions | `src/meta/`                                                        | automations, permissions, notifications, segments, references, import/export                            |
| Inbox               | `src/modules/inbox/`                                               | Conversations, messages, widget mutations, `receiveInboxMessage`                                        |
| Channels            | `src/modules/channel/`                                             | Channels and channel membership                                                                         |
| Integrations        | `src/modules/integrations/<kind>/`                                 | facebook, instagram, imap, discord, call, trpc                                                          |
| FB automation       | `src/modules/integrations/facebook/meta/automation/`               | Comment/message triggers and actions, bot message generation                                            |
| FB page posting     | `src/modules/integrations/facebook/postService.ts`, `postGuard.ts` | Post publishing pipeline (validation, photo staging, cleanup, permalink) and its rate limit + audit log |
| FB app resolution   | `src/modules/integrations/facebook/commonUtils.ts`                 | `resolveFacebookApp`, `facebookAppSelector`, `facebookAccountSelector`                                  |
| Ticket              | `src/modules/ticket/`                                              | Pipelines, statuses, tickets, activities, notes                                                         |
| Forms               | `src/modules/form/`                                                | Forms, fields, submissions                                                                              |
| Knowledge base      | `src/modules/knowledgebase/`                                       | Topics, categories, articles, AI knowledge source                                                       |
| Migrations          | `src/migrations/`                                                  | Plugin-owned data migrations                                                                            |

## Contracts

### Provides

- GraphQL subgraph on port `3304` (queries, mutations, subscriptions) federated
  by the gateway.
- tRPC `appRouter` consumed by other services.
- Express webhook routes `/facebook/*` and `/instagram/*`, including the OAuth
  entry points `/facebook/fblogin`, `/facebook/kind/:kind/fblogin`, and
  `/instagram/iglogin`.
- Automation constants (`triggers`, `actions`, `bots`, AI knowledge sources) and
  worker producers exported from `src/meta/automations.ts`.
- Permissions, notification types, segment definitions, references, and
  ticket/form-submission import-export handlers from `src/meta/`.

### Consumes

- `erxes-api-shared/utils` — `startPlugin`, `sendTRPCMessage`, `getEnv`,
  `sendWorkerQueue`, `randomAlphanumeric`.
- `erxes-api-shared/core-modules` — automation types, `replaceOutputPlaceholders`,
  `splitType`, `sendAutomationTrigger`, `EXECUTE_WAIT_TYPES`, `attachmentSchema`.
- `core` over tRPC — `configs.getFileUploadConfigs`, `users.findOne`.
- Facebook Graph API through `fbgraph` (`graphRequest` in
  `src/modules/integrations/facebook/utils.ts`).

## Data and State

- Every model is generated per `subdomain` through `generateModels`; all reads
  and writes are tenant-scoped.
- Collections are namespaced per module: `Facebook*`, `Instagram*`, `Call*`,
  `Discord*`, `Imap*`, plus inbox (`Conversations`, `ConversationMessages`),
  ticket, form, and knowledge base collections.
- Migrations under `src/migrations/` cover call conversation content, CDR dates,
  channels, forms, response templates, and tickets.
- Facebook upload configuration is cached in a module-level variable in
  `src/modules/integrations/facebook/utils.ts` and is **not** keyed by
  subdomain — treat it as a known cross-tenant hazard when touching that file.

## Local Invariants

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
- Schemas are defined with `new Schema(...)` and explicit fields; `schemaWrapper`
  must not be introduced.
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

## Validation

- `pnpm nx lint frontline_api`
- `pnpm nx build frontline_api`
- No `test` target is defined in `project.json`; do not invent one.
- Smoke: comment on a subscribed Facebook page post that matches an active
  comment trigger, then confirm the public comment reply is posted and the
  private reply arrives in Messenger without a `#10` or `Invalid parameter`
  entry in the `erxes-facebook:error` log.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-06` — Fix the Facebook login callback behind the authorize redirector

- **Summary:** The OAuth `state` carries the integration kind as a
  `/kind/<kind>` path segment instead of a `?kind=` query string, and
  `/facebook/kind/:kind/fblogin` accepts the redirector callback, so returning
  from Facebook no longer lands on `/facebook` with `Cannot GET /facebook`.
- **Affected areas:**
  `src/modules/integrations/facebook/middlewares/loginMiddleware.ts`,
  `src/modules/integrations/facebook/routes.ts`
- **Contracts changed:** new HTTP route `GET /facebook/kind/:kind/fblogin`

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
