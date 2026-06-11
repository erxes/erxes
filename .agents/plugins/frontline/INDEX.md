# frontline plugin

**Backend:** `backend/plugins/frontline_api/` — port **3304**
**Frontend:** `frontend/plugins/frontline_ui/`

Customer-communication surfaces: shared inbox (conversations), tickets, channels, integrations (Facebook, Instagram, IMAP, Call/SIP), forms, knowledge base, response templates, reports. Eight conceptual modules.

> Status: **scaffolded 2026-05-22, not yet validated by a real wish.** See [`../../EXTENDING.md`](../../EXTENDING.md). Treat skill files as a strong starting point — and update them as soon as you find a gap during a real wish.

## Modules

| Module | Doc | Backend root | Frontend root |
|---|---|---|---|
| **inbox** | [modules/inbox.md](modules/inbox.md) | `backend/plugins/frontline_api/src/modules/inbox/` | `frontend/plugins/frontline_ui/src/modules/inbox/` |
| **ticket** | [modules/ticket.md](modules/ticket.md) | `backend/plugins/frontline_api/src/modules/ticket/` | `frontend/plugins/frontline_ui/src/modules/ticket/` |
| **channel** | [modules/channel.md](modules/channel.md) | `backend/plugins/frontline_api/src/modules/channel/` | `frontend/plugins/frontline_ui/src/modules/channels/` |
| **integrations** | [modules/integrations.md](modules/integrations.md) | `backend/plugins/frontline_api/src/modules/integrations/` | `frontend/plugins/frontline_ui/src/modules/integrations/`, `integrations-config/` |
| **form** | [modules/form.md](modules/form.md) | `backend/plugins/frontline_api/src/modules/form/` | `frontend/plugins/frontline_ui/src/modules/forms/` |
| **knowledgebase** | [modules/knowledgebase.md](modules/knowledgebase.md) | `backend/plugins/frontline_api/src/modules/knowledgebase/` | `frontend/plugins/frontline_ui/src/modules/knowledgebase/` |
| **response** | [modules/response.md](modules/response.md) | `backend/plugins/frontline_api/src/modules/response/` | `frontend/plugins/frontline_ui/src/modules/responseTemplate/` |
| **reports** | [modules/reports.md](modules/reports.md) | `backend/plugins/frontline_api/src/modules/reports/` | `frontend/plugins/frontline_ui/src/modules/report/` |

## External surfaces

### GraphQL federation
Owned types declared with `@key(fields: "_id")` (verify per-module schema file — counts subject to change):
- `Conversation` — `modules/inbox/graphql/schemas/conversation.ts`
- `Integration` — `modules/inbox/graphql/schemas/integration.ts`
- `Channel` — `modules/channel/graphql/schemas/channel.ts`
- `Form` — `modules/form/graphql/schema/form.ts`
- `KnowledgeBaseArticle` — `modules/knowledgebase/graphql/schemas/knowledgeBaseTypeDefs.ts`
- Provider-specific (Facebook posts/comments, Instagram messages) — under `modules/integrations/<provider>/graphql/schema/`

Extended (consumed from other plugins): `User`, `Customer`, `Tag`, `Company`, `Brand`, `Branch`, `Department`. Look in each module's `graphql/schemas/extensions.ts` if present.

Apollo root entry: `backend/plugins/frontline_api/src/apollo/schema/schema.ts` (and `apollo/typeDefs.ts`).

### tRPC routers
Merged in `backend/plugins/frontline_api/src/init-trpc.ts`:
- `integrationTrpcRouter` — `backend/plugins/frontline_api/src/modules/integrations/trpc/integration.ts`
- `inboxTrpcRouter` — `backend/plugins/frontline_api/src/modules/inbox/trpc/inbox.ts`
- `conversationTrpcRouter` — `backend/plugins/frontline_api/src/modules/inbox/trpc/conversation.ts` (procedures: `find`, `tag`)
- `fields.getFieldList` — inline; only `moduleType: 'facebook'` is implemented today (returns `[]` for other module types)

### Express routes
File: `backend/plugins/frontline_api/src/routes.ts`
- `/facebook` → `modules/integrations/facebook/routes.ts` (Meta webhook)
- `/instagram` → `modules/integrations/instagram/routes.ts` (Meta webhook)

IMAP and Call/SIP are initialized at server boot via `onServerInit` in `main.ts`, not Express routes.

### Subscriptions
GraphQL subscriptions are enabled (`hasSubscriptions: true` in `main.ts`). Subscription server lives in `backend/plugins/frontline_api/src/apollo/subscription.ts` (prod: `subscription.js`).

### Async workers
Provider-scoped:
- `modules/integrations/facebook/meta/automation/workers.ts`
- `modules/integrations/instagram/meta/automation/workers.ts`
- `modules/integrations/call/worker/callDashboard.ts` (call statistics aggregation)

Wired together in `meta/automations.ts` via `createCoreModuleProducerHandler`.

### Automation
File: `backend/plugins/frontline_api/src/meta/automations.ts`
- **Pluggable per provider.** `actions`, `triggers`, `bots` are concatenated from `facebookConstants` and `instagramConstants`. Adding a new provider's automation means extending those `*Constants` files and adding the provider to the `modules` object.
- **Handlers:** `receiveActions`, `checkCustomTrigger`, `getAdditionalAttributes`, `generateAiContext`, `setProperties` — all dispatched by `extractModuleName: (input) => input.moduleName`.
- There is **no ticket-level or conversation-level automation trigger** today. Wishes that say "when a ticket is closed, do X" must invent the trigger (this is NOVEL — see [`../../skills/frontline/add-frontline-automation.md`](../../skills/frontline/add-frontline-automation.md) pitfalls).

### Notifications
File: `backend/plugins/frontline_api/src/meta/notifications.ts` (+ `utils/notifications.ts`). Fires on assignment, reply, and ticket/conversation updates.

### After-process handlers
Files: `backend/plugins/frontline_api/src/meta/afterProcess.ts` + `meta/afterProcess/handlers.ts`. Side-effects (notifications, activity log) fanned out after mutations.

### Import/Export
Wired in `main.ts`. Only ticket import/export is registered today:
- Content type: `frontline:ticket.ticket`
- Handlers: `meta/import-export/import/importHandlers.ts`, `export/exportHandlers.ts`

### Tags & properties
Registered in `main.ts` (via `startPlugin` meta). Tag/property content types: `conversation`, `ticket`, `form`.

### Segments
**Not found** in `backend/plugins/frontline_api/src/meta/` as of this scan — frontline does not yet declare segment content types at the plugin meta level the way sales does. Conversations/tickets are referenced from sales segments as cross-plugin associations (see `backend/plugins/sales_api/src/modules/sales/meta/segments/segmentConfigs.ts`), but the inverse direction isn't wired. **A wish that says "segment-filter tickets by X" is NOVEL** and needs a `meta/segments.ts` to be added — mirror sales' pattern when doing this.

### Permissions
Wired per-mutation via `checkPermission('<key>')` calls in resolvers (verify against `modules/ticket/graphql/resolvers/mutations/index.ts`). Repo-wide pattern, identical to sales.

## Cross-plugin consumers
- **sales** — `Deal.sourceConversationIds[]` two-way links a deal to one or more frontline conversations. Sales also references frontline ticket via segment associations. See `backend/plugins/sales_api/src/modules/sales/meta/segments/segmentConfigs.ts`.
- **core** — federates `Conversation`, `Channel`, `Integration` references for composite responses.
- **operation** — segment association allows filtering related tasks (mirrors sales pattern).
- **client portal / forms widget** — embeds `cpForms` / `cpFormDetail` queries and KB articles.

## Cross-plugin dependencies
- **contacts (core)** — `sendTRPCMessage` to resolve `Customer` and `Company` field schemas; create/update customers from form submissions.
- **core** — `User`, `Tag`, `Brand`, `Branch`, `Department` references throughout.
- **automations (core-modules)** — frontline registers as an automation module via the `createCoreModuleProducerHandler` pattern.
- **importExport (core-modules)** — frontline registers ticket as an import/export type.

## Stack divergences vs. sales

Things that DO match sales:
- pnpm workspace structure, `_api`/`_ui` naming, Nx project shape
- `generateModels(subdomain)` multi-tenancy throughout
- `checkPermission('<key>')` pattern in resolvers
- Module-Federation UI exposed to `core-ui`
- Apollo Federation backend

Things that DIVERGE from sales (load-bearing for skill authors):
- **Federation surface:** Federation `@key` directives live inside each module's primary schema file, not centralized in an `extensions.ts`. There is no plugin-wide `extensions.ts` today.
- **REST entry:** `src/routes.ts` is provider-aggregated (`/facebook`, `/instagram`) — not a flat file like sales' `routes.ts`. Adding a new webhook route means creating a new provider router under `modules/integrations/<provider>/routes.ts` and mounting it.
- **`onServerInit`:** Frontline boots Call/SIP and IMAP listeners at server-init time (`main.ts` `onServerInit`). Sales has no such hook. Adding a long-lived listener for a new integration goes here.
- **Subscriptions:** Frontline has GraphQL subscriptions (`hasSubscriptions: true`). Sales' subscriptions file (`apollo/subscription.ts`) exists but is much thinner. New real-time push surfaces in frontline live in `apollo/subscription.ts`.
- **Automation extensibility:** Sales has a flat trigger/action registry. Frontline routes automation through a per-provider module pattern in `meta/automations.ts`. New automation triggers/actions must be added to a provider module — there is no "frontline-wide" automation trigger today.
- **Import/Export:** Only `frontline:ticket.ticket` is wired today. Adding import/export for conversations or forms requires a new content-type entry + handler files.
- **Segments:** Not declared as a top-level meta. Adding segment support for a frontline entity is a meta-level investment, not a per-field one.
- **Ticket `priority` is `Number`** (default 0), not `String` like sales' Deal priority. Skill `add-ticket-field` calls this out.

## Playwright tests
See [`tests/`](./tests/) — Playwright behavioral specs, one per module. Tests seed their own fixtures; fixture helpers are repo-wide ([`../../docs/sales/playwright-fixtures.md`](../../docs/sales/playwright-fixtures.md)).
