---
name: plugin-new
description: Build a new plugin for the new erxes core (Postgres, branch postgre) — its own repo, REST API, Postgres tables, Module Federation UI and optional standalone app — connected through the manifest, @erxes/plugin-sdk tokens, events, timelines, automation triggers and actions. Use when someone asks to create, scaffold or design an erxes plugin or product (hotel, shop, tickets, HR …) for the new core, asks how a plugin talks to core (customers, events, automations, payments, notifications), or asks what a plugin's manifest should contain. For moving an existing erxes 3.x plugin, use plugin-migrate.
---

# New plugin for the erxes core

A plugin is a product of its own: its own repo, API, tables, UI and release.
Core shares people (team members, customers, companies), files, products,
payments, notifications, events, timelines and automations. A plugin never reads or
writes `core_*` tables and never imports core code; it reaches core only
through the channels below, using `@erxes/plugin-sdk`.

Sources of truth (read before deciding anything structural):

- core repo `AGENTS.md`, section **Plugin connection** and **Automations**
- `packages/contract/src/plugins.ts` (`PluginManifest`, `PLUGIN_SCOPES`)
- `packages/plugin-sdk/src/index.ts` (every helper used here)
- `apps/core-api/src/http/policies.ts` (which procedures a scope opens)
- `apps/core-api/src/__tests__/plugins.test.ts` → "works end to end through
  @erxes/plugin-sdk": a working plugin in 100 lines
- the architecture page: https://claude.ai/artifact/QDZJgn3kNaGtWZNTQrmjHS

## 0. Decide first (ask if not given)

| Input              | Rule                                                                           | Example                        |
| ------------------ | ------------------------------------------------------------------------------ | ------------------------------ |
| Plugin name        | `^[a-z][a-z0-9_]{0,39}$`, not `core`; prefixes everything                      | `shop`                         |
| Display name       | menu and page titles                                                           | `Shop`                         |
| Database           | **shared** (tables in core's database, own role — default) or **own** database | shared                         |
| Ports              | unique across plugins: API, UI remote, standalone                              | `3345`, `3045`, `3046`         |
| Core features used | customers, timelines, events/automations, payments, notifications, files, live | customers, events, automations |
| Standalone app     | own address with "Sign in with erxes"?                                         | no                             |

Everything below uses `shop`.

## 1. The seven channels

| #   | Direction              | What                                                 | How                                                                                                             |
| --- | ---------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | plugin → core          | declare what the plugin adds                         | `core.registerManifest(manifest)` at startup (`PUT /core/v1/plugins/manifest`)                                  |
| 2   | plugin → core          | call core for an organisation                        | `createCoreClient(...).forOrg(orgId).<group>.<procedure>(input)` — 15-min ES256 token, scopes from the manifest |
| 3   | core-ui → plugin UI    | load the UI                                          | Module Federation remote `shop_ui` exposing `./config`                                                          |
| 4   | plugin UI → plugin API | a member's request                                   | `pluginFetch('shop', path)` adds a 5-min session token; API checks `verifyPluginSession()`                      |
| 5   | core → plugin API      | events it subscribed to                              | `POST <api>/events`, check `verifyCoreEvent()`; retried ~2 days                                                 |
| 6   | core → plugin API      | automation actions                                   | `POST <api>/automations/actions/<type>`, check `verifyCoreCall()`; `Idempotency-Key: <run>:<step>`              |
| 7   | plugin DB tx → core    | events, audit, live, in the plugin's own transaction | `core_publish_event()`, `core_record_audit()`, `core_live_signal()` (shared database only)                      |

## 2. Repository layout

```text
shop-plugin/
  package.json, pnpm-workspace.yaml, tsconfig.base.json, .env.example
  Dockerfile               # one image: API + built UI remote (+ standalone app)
  .github/workflows/ci.yml # lint, typecheck, test (real Postgres), build, image
  AGENTS.md                # what exists, rules, validation (keep it current)
  backend/
    drizzle.config.ts      # tablesFilter ['shop_*'], migrations table __drizzle_migrations_shop
    drizzle/               # generated SQL (commit it; never edit an applied one)
    src/
      main.ts              # migrate → registerManifest → server
      config.ts            # all env reading
      core.ts              # createCoreClient + the manifest
      db/                  # client, withOrg(), table.ts (pgTableCreator 'shop_'), migrate.ts, schema/
      http/auth.ts         # member(), coreCall(), coreEvent() middlewares
      routes/              # /api/* (members), /events, /automations/actions/*, /public/*
      modules/<module>/    # service + routes + __tests__
  frontend/
    module-federation.config.ts   # name shop_ui, exposes ./config and ./shop
    src/config.tsx                # CONFIG
    src/modules/ShopMain.tsx      # AppLayout + routes under /shop/*
    src/modules/settings/         # own settings layout with "Exit settings"
```

## 3. Register the plugin with core

1. In core's environment: `CORE_PLUGIN_KEYS=shop:<secret of 32+ chars>`
   (comma-separated for several). Rotate later with `pnpm plugin:secret shop`
   in `apps/core-api` (the old secret keeps working for 24 h).
2. In the plugin's environment: `CORE_URL` (core's address, no `/core/v1`),
   `PLUGIN_SECRET`.
3. At startup:

```ts
// backend/src/core.ts
import { createCoreClient } from '@erxes/plugin-sdk';
import type { PluginManifest } from '@erxes/core-contract';
import { config } from './config';

export const core = createCoreClient({
  coreUrl: config.coreUrl,
  plugin: 'shop',
  clientSecret: config.pluginSecret,
});

export const manifest: PluginManifest = {
  title: 'Shop',
  version: config.version,
  ui: { remote: 'shop_ui', entry: `${config.publicUrl}/ui/remoteEntry.js` },
  api: { url: `${config.publicUrl}/api` },
  scopes: [
    'customers:read',
    'customers:write',
    'events:write',
    'activities:write',
    'notifications:write',
    'live:write',
  ],
  permissions: [
    { action: 'shop.order.view', label: 'View orders', group: 'Orders' },
    { action: 'shop.order.manage', label: 'Create and change orders', group: 'Orders' },
  ],
  notificationKinds: [{ kind: 'shop.order.assigned', label: 'An order is assigned to me' }],
  events: [{ type: 'shop.order.placed', label: 'Order placed', subject: 'customer' }],
  subscriptions: ['core.customer.merged'],
  actions: [
    {
      type: 'shop.coupon.create',
      label: 'Create a coupon',
      subject: 'customer',
      fields: [{ key: 'percent', label: 'Discount %', type: 'number', required: true }],
    },
  ],
  timelines: [{ type: 'shop.order', label: 'Order', permission: 'shop.order.view' }],
  activityTypes: [
    { type: 'shop.order.placed', label: 'Order', icon: 'IconShoppingCart', color: '#2b8650' },
  ],
};

// main.ts: await core.registerManifest(manifest);
```

4. Installation: development and self-hosted install it automatically
   (`PLUGINS_AUTO_INSTALL`); on SaaS an owner installs it in Settings › Plugins
   and approves its scopes. A new version asking for more scopes waits for the
   owner's approval; until then tokens carry only the approved ones.

Manifest rules: every type, kind, permission and timeline starts with the
plugin name (`NAMESPACE_REQUIRED` otherwise). Events that concern a customer
or company declare `subject` and are published with `subject`: automations
they start then get that record's fields and may run customer/company actions.
Action `fields[].type`: text, longtext, number, boolean, date, select,
members, tags, json, custom_field, lead_stage, recipients (`placeholder`,
`description`, `sameTypeAs` also allowed). `activityTypes[].icon` must be one
of the fixed icon names listed in the contract.

## 4. Database

**Shared database (default).** Tables live in core's PostgreSQL, owned by the
plugin's role, under core's row-level security.

1. Create the role once from the core repo: `pnpm db:plugin-role shop`
   (prints a password once) → plugin `DATA_URL=postgres://erxes_plugin_shop:…@…/…`.
   The role has no rights on `core_*` tables, can't bypass RLS, and can call
   only `core_publish_event`, `core_record_audit`, `core_live_signal`,
   `core_enable_tenant_rls`.
2. Every table: name `shop_<table>` (`pgTableCreator((name) => \`shop_${name}\`)`),
   full prefixed names for indexes and constraints, and `org_id text not null`
   (the core organisation id; ids are text).
3. Every migration that creates a table also turns tenancy on — append to the
   generated SQL (drizzle-kit generate, then add the line, in one go):

   ```sql
   SELECT core_enable_tenant_rls('shop_orders');            -- column org_id
   SELECT core_enable_tenant_rls('shop_legacy', 'tenant_id'); -- another column name
   ```

4. Migrator: one transaction, `pg_advisory_xact_lock(hashtext('shop:migrate'))`,
   tracking table `public.__drizzle_migrations_shop`. Never `drizzle-kit push`;
   never edit an applied migration. Only transaction-scoped locks (poolers).
5. Every transaction sets the organisation first, or RLS shows nothing:

   ```ts
   export const withOrg = <T>(orgId: string, fn: (tx: Tx) => Promise<T>) =>
     db.transaction(async (tx) => {
       await tx.execute(sql`select set_config('app.org_id', ${orgId}, true)`);
       return fn(tx);
     });
   ```

   Services still filter by `org_id`; RLS is the safety net.

6. Publish events in the same transaction as the change (they exist only if
   it commits; `p_dedupe_key` makes a retry harmless):

   ```sql
   SELECT core_publish_event(
     p_org_id => $1, p_source => 'shop', p_type => 'shop.order.placed',
     p_payload => $2::jsonb, p_subject_type => 'customer', p_subject_id => $3,
     p_summary => 'Order #1042 placed', p_link => '/shop/orders/o_1042',
     p_dedupe_key => 'order:o_1042');
   ```

   With `subject` + `summary` the event becomes a timeline entry on that
   customer; `p_notify` sends notifications. `core_record_audit(...)` writes
   the shared audit log; `core_live_signal(org, 'shop', topics, user_ids)`
   refreshes open screens.

**Own database.** Same prefixes and `org_id` column, but no core functions:
filter by `org_id` in every query, publish events with
`core.forOrg(org).events.publish({ events: [{ type, payload, subject, summary, dedupeKey }] })`
after commit (keep an outbox row if the event must not be lost), and signal
with `core.signal(org, topics)`.

Tests: one throwaway database per test file (copy core's
`apps/core-api/src/__tests__/db.ts` approach); CI runs them on Postgres 16.

## 5. The API

```ts
// backend/src/http/auth.ts
import { bearerOf, verifyCoreCall, verifyCoreEvent, verifyPluginSession } from '@erxes/plugin-sdk';

const opts = { coreUrl: config.coreUrl, plugin: 'shop' };

/** A member's request from the plugin UI. */
export const member = async (req) => {
  const token = bearerOf(req.headers.authorization);
  if (!token) throw unauthorized();
  return verifyPluginSession(token, opts); // { orgId, userId, role, can(), tier, access, canChange() }
};
```

- Check permissions with `m.can('shop.order.manage')` (owners can everything).
  Refuse changes when `!m.canChange()` (plan left: read-only); gate paid
  features on `m.tier` (`free` / `plus` / `pro`; self-hosted is `pro`).
- `POST /events`: verify with `verifyCoreEvent(req.headers.authorization, rawBody, opts)`
  (needs the raw body — mount `express.raw` there). Use the event id as the
  idempotency key; answer 2xx only after handling. Events arrive unordered and
  may repeat; payloads carry totals, so act on the latest state.
- `POST /automations/actions/<type>`: `verifyCoreCall(bearerOf(...), opts)`
  → `{ orgId, userId, automationId, runId, stepId }`. Body
  `{ input, context: { event, subject, steps } }`. Make it idempotent on the
  `Idempotency-Key` header; the JSON you answer is the step's output
  (`{{steps.<step id>.output.<field>}}`). A non-2xx answer is retried, then
  fails the run with your message.
- Calling core from the API (never from the browser):

```ts
const shop = core.forOrg(orgId);
const { customer, created } = await shop.customers.findOrCreate({
  primaryEmail,
  firstName,
  source: 'shop',
});
await shop.activities.create({
  targetType: 'customer',
  targetId: customer.id,
  type: 'shop.order.placed',
  summary: 'Order #1042',
  dedupeKey: 'order:o_1042',
});
await shop.notifications.create({
  userIds: [ownerId],
  kind: 'shop.order.assigned',
  title: 'Order #1042 is yours',
});
```

What each scope opens (check `policies.ts` for the full list):

| Scope                              | Procedures                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| `customers:read`                   | `customers.get`, `companies.get`; customer/company events at `/events`                             |
| `customers:write`                  | `customers.findOrCreate` (by email or phone; safe to call twice)                                   |
| `activities:write`                 | `activities.create`, `.update`, `.remove` — timeline entries, addressed by id or `key:<dedupeKey>` |
| `events:write` / `events:read`     | `events.publish`; other plugins' events at `/events`                                               |
| `notifications:write`              | `notifications.create` (to team members; kind in `notificationKinds`)                              |
| `payments:read` / `payments:write` | invoices and refunds for its own records; `core.payment.*` events for its own invoices             |
|                                    | and for invoices with a line for it (`lines[].plugin`), which it can read but not cancel           |
| `products:read`                    | `products.list` (its own; `all: true` for the whole catalog), `.get`, `.lookup`, categories,       |
|                                    | `fields.list({ contentType: 'product' })` to label `product.customFields`                          |
| `products:write`                   | `products.create` (it uses what it creates), `.update`, `.archive`, `.restore`, `.use`;            |
|                                    | a taken code answers 409 with `data.productId`: `use` that product instead of copying it           |
| (any installed plugin)             | `organizations.current`: the organisation's `country` and `currency` (bill and show prices in it)  |

Money is an integer in the currency's smallest unit (`currencyDigits(currency)`
from the contract: USD and MNT 2, JPY 0). Local rules (tax receipts, local
gateways) belong in plugins; name the countries yours is made for in the
manifest (`countries: ['MN']`).
| `files:read` / `files:write` | core's file service (two-step upload) |
| `audit:write`, `live:write` | `audit.record`, `plugins.signal` |

Not open to plugins today: listing or searching customers and companies,
reading team members, and emailing addresses outside the team. Use the
plugin UI (the member's own session) for team lookups, or ask core for a new
scope rather than working around it.

## 6. The UI

- Module Federation remote `shop_ui`; shared singletons with
  `{ singleton: true, requiredVersion: false, import: false }`: `react`,
  `react/jsx-runtime`, `react/jsx-dev-runtime`, `react-dom`,
  `react-dom/client`, `react-router`, `react-router-dom`, `erxes-ui`, `jotai`,
  `react-i18next`, `@tanstack/react-query` (the `SHARED` list in
  `apps/core-ui/rsbuild.config.ts`). A shared name matches only that exact
  import, so a remote that leaves out `react/jsx-runtime` bundles its own and
  breaks when its React version differs from the host's.
- `./config` exports `CONFIG: { name: 'shop', path: 'shop', icon, modules, checkAccess? }`;
  the first module renders under `/shop/*` (default export, or the PascalCase
  name `Shop`).
- Data: `pluginFetch('shop', '/orders')` / `pluginJson(...)` from erxes-ui
  (session token added; the API address comes from the manifest).
- Live: `useLiveSignal('shop', ['orders'], refetch)`.
- Timelines: `<RecordTimeline type="shop.order" id={order.id} />` (type listed
  in the manifest's `timelines`).
- Settings: a pinned `AppLayoutFooterLink` to `shop/settings`, opening the
  plugin's own settings layout with "Exit settings" (as core's Contacts does).
- Build only from erxes-ui components; i18n with en and mn.
- Development: in core-ui's env
  `PUBLIC_PLUGINS=shop_ui@http://localhost:3045/remoteEntry.js`; deployed,
  core-ui loads `manifest.ui.entry`.

## 7. Standalone app (optional)

"Sign in with erxes" is OAuth 2.1 + PKCE at `<core>/core/v1/oauth/*`
(discovery at `/.well-known/openid-configuration`). List redirect addresses in
the manifest (`oauth.redirectUris`, `{subdomain}` allowed), verify access
tokens with `verifyErxesAccessToken(token, opts)` (same member fields plus
`scope`).

## 8. Customers in the plugin's app (optional)

Core signs customers in (decision 42); a plugin never builds sign-up, sign-in,
codes or password resets. One account per organisation: a customer signed in to
one plugin's app is signed in to every other's without typing anything again.

1. Manifest: `customerApp: { redirectUris: ['https://{subdomain}.shop.example.com/callback'] }`.
2. The app sends customers to `<core>/core/v1/customer-oauth/authorize` with
   `response_type=code`, `client_id=shop`, `redirect_uri`, `state` and a PKCE
   S256 challenge (`organization=<subdomain>` when neither address names it;
   `prompt=login` to ask again). Core shows its sign-in page (a code by email
   or SMS), then sends the browser back with `code`.
3. The app trades it at `POST /customer-oauth/token` (form:
   `grant_type=authorization_code`, `client_id`, `code`, `redirect_uri`,
   `code_verifier`) for a 15-minute `access_token` and a 90-day
   `refresh_token` (`grant_type=refresh_token`; rotates on every use, an old
   one used again ends the session). Sign out: `POST /customer-oauth/revoke`
   with `token` and `client_id`.
4. The plugin's API serves customers under `/customer/*` only, each route
   checking `verifyCustomerToken(req.headers.authorization, { coreUrl })` →
   `{ orgId, customerId, clientId }`, and keys every query by `orgId` and
   `customerId` from the token, never from the request.
5. The app may call core's `/core/v1/customer/me` (profile, logins, sessions)
   with the same token. Subscribe to `core.customer.signed_up` for welcome flows.

## 9. Validation before calling it done

1. `pnpm lint && pnpm typecheck && pnpm test` (tests on a real Postgres) and
   `pnpm build`; `pnpm db:check` if the repo has it.
2. No table, index or constraint without the `shop_` prefix; every table with
   `org_id` has `core_enable_tenant_rls` in its migration.
3. Run against a local core: `CORE_PLUGIN_KEYS` set, plugin registers its
   manifest, Settings › Plugins shows it installed, the UI opens at `/shop`,
   a member request passes `verifyPluginSession`, an event from the plugin
   appears on the customer's Activity tab, and an automation using the
   plugin's trigger and action runs (Automations › Runs).
4. `AGENTS.md` describes only what exists.
