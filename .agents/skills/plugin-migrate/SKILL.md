---
name: plugin-migrate
description: Move an existing erxes 3.x plugin (HR, frontline, operation …) onto the new erxes core (Postgres, branch postgre) — replace the gateway, Redis discovery, tRPC calls, gateway user headers, tenant lookups and legacy GraphQL with the manifest, @erxes/plugin-sdk tokens, core events and row-level security — in steps that keep the plugin working. Use when someone asks to migrate, port or convert a plugin (for example hr-plugin) to the new core, or asks what changes for a plugin between old erxes and the new core.
---

# Migrate an erxes 3.x plugin to the new core

The target structure is the one in the **plugin-new** skill; read it
first. This skill is the path from the old stack to it, for a plugin that
already runs on erxes 3.x (reference: `~/Documents/work/erxes/repos/hr-plugin`).

Work on a branch in the plugin repo. Keep each step shippable: tests green
after every step.

## 1. Inventory

Find every old-platform dependency before changing anything:

```sh
grep -rn "joinErxesGateway\|leaveErxesGateway\|ENABLED_PLUGINS\|REDIS_" backend/src
grep -rn "sendTRPCMessage" backend/src            # each core call (pluginName/module/action)
grep -rn "extractUserFromHeader\|req.headers.user" backend/src
grep -rn "legacy-graphql\|apollo\|gql\`" backend/src frontend/src
grep -rn "tenantId\|tenant_id\|subdomain" backend/src | grep -v __tests__ | wc -l
grep -rn "createErxesOAuthClient\|ERXES_OAUTH" backend/src
grep -rn "/pl:\|IUIConfig\|from 'ui-modules'" frontend/src
```

Write the list into the PR description; every item gets one row in the map
below.

## 2. Old → new map

| erxes 3.x                                                                                                                      | New core                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `joinErxesGateway` + Redis discovery; `ENABLED_PLUGINS*` on core                                                               | `CORE_PLUGIN_KEYS=<name>:<secret>` on core; plugin calls `core.registerManifest(manifest)` at startup; manifest `api.url` is its address                                                                                                                |
| Gateway route `/pl:<name>/…`, gateway CORS                                                                                     | Plugin UI calls `pluginFetch('<name>', path)`; the API is reached at `manifest.api.url` and allows the core-ui origin                                                                                                                                   |
| `extractUserFromHeader` (gateway `user` header)                                                                                | `verifyPluginSession(bearerOf(authorization), { coreUrl, plugin })` → `{ orgId, userId, role, permissions, can(), tier, access, canChange() }`                                                                                                          |
| erxes owner check (`isOwner`)                                                                                                  | `member.role === 'owner'` (`can()` already lets owners do everything)                                                                                                                                                                                   |
| Plugin permission catalog in its own `meta/`                                                                                   | manifest `permissions` (granted in core roles, carried in the session token). Plugin-specific reach (own / team / all) stays in the plugin, keyed by `member.userId`                                                                                    |
| `sendTRPCMessage({ pluginName: 'core', module: 'organization', action: 'identity' })`, subdomain → org cache, `<name>_tenants` | Not needed for member, core and event calls: the organisation id arrives in every token (`orgId`). Public routes: see section 5                                                                                                                         |
| `sendTRPCMessage(… 'users.find' …)`                                                                                            | No plugin scope reads team members yet. In the UI, call core with the member's own session; on the server, keep the ids you need (for example `erxes_user_id` on employees) and read names in the UI                                                    |
| `sendTRPCMessage(… 'notifications.sendEmail' …)`                                                                               | Team members: `core.forOrg(org).notifications.create({ userIds, kind, title, body, link })` (email follows each member's settings). Outside addresses (a new hire's personal email): keep the plugin's own mail sending for now and say so in AGENTS.md |
| Activity logs in the plugin                                                                                                    | Customer/company-related: events with `subject` + `summary` (timeline entry) or `activities.create`; own records: manifest `timelines` + `<RecordTimeline type id />`                                                                                   |
| Legacy GraphQL endpoints                                                                                                       | REST only; remove once no client uses them                                                                                                                                                                                                              |
| `createErxesOAuthClient` (standalone)                                                                                          | OAuth at `<core>/core/v1/oauth/*`; manifest `oauth.redirectUris`; `verifyErxesAccessToken()`                                                                                                                                                            |
| `IUIConfig` in `config.tsx`                                                                                                    | `CONFIG: { name, path, icon, modules, checkAccess? }` exported from `./config`                                                                                                                                                                          |
| `@erxes/ui`, `@erxes/ui-modules`, `@erxes/api-shared` npm aliases                                                              | `erxes-ui` from the host (singleton; types from `"erxes-ui": "npm:@erxes/ui@v2-next"`), `@erxes/core-contract` and `@erxes/plugin-sdk`; drop `@apollo/client` (the host doesn't provide it)                                                             |
| `UI_ENTRY_URL` served by old core                                                                                              | manifest `ui.entry`; development: core-ui `PUBLIC_PLUGINS=<name>_ui@http://localhost:<port>/remoteEntry.js`                                                                                                                                             |

The organisation id is the same value in both worlds (core ids are the SaaS
organisation `_id`), so existing `tenant_id` values stay valid.

## 3. Order of work

1. **Contract and SDK.** Add `@erxes/core-contract` and `@erxes/plugin-sdk`;
   write `core.ts` (client + manifest) and call `registerManifest` at startup
   behind a setting, next to the old gateway join, so both stacks work during
   the move.
2. **Auth.** Add the `member()` middleware (session token). Route by route,
   replace the gateway user header with it. Map permission checks to
   `member.can(...)` with the manifest's actions; keep the plugin's own reach
   rules. Tests: sign tokens the way core's tests do, or stub the verifier.
3. **Tenancy.** Take `orgId` from the token instead of the subdomain lookup.
   Delete the identity call and cache once no route needs them.
4. **Database** — choose:
   - **Move into core's database (recommended).** `pnpm db:plugin-role <name>`
     in core; copy the plugin's tables over with `pg_dump --table '<name>_*'`
     and restore as that role; tracking table `__drizzle_migrations_<name>`
     and lock `hashtext('<name>:migrate')`. Add one migration that turns
     tenancy on for every table, keeping the existing column:
     `SELECT core_enable_tenant_rls('hr_employees', 'tenant_id');`
     Then wrap every transaction to set the organisation first
     (`select set_config('app.org_id', $org, true)`): the plugin's
     transaction helper or tenant repository is the one place to change.
   - **Keep the own database.** Nothing moves; keep filtering by tenant in
     every query; publish events through `events.publish` after commit.
     Tables still without the plugin prefix get a rename migration first (HR
     already uses `hr_*`).
5. **Core calls.** Replace each `sendTRPCMessage` with the matching
   `core.forOrg(org).*` call or with the UI-side read (map above). Calls stay
   outside request transactions; a failing core call must not lose the
   plugin's own change (publish events in the transaction instead).
6. **What the new core adds.** Declare `events` (with `subject` when about a
   customer or company), `actions` for automations, `timelines` and
   `activityTypes`, `notificationKinds`; publish events where the plugin's
   records change. Optional, but this is what the move is for.
7. **UI.** `CONFIG` instead of `IUIConfig`; API base via `pluginFetch`;
   shared singletons per plugin-new §6; settings as a pinned footer
   link with its own layout and "Exit settings"; remove GraphQL usage.
8. **Standalone app.** Switch "Sign in with erxes" to the new OAuth endpoints
   and `verifyErxesAccessToken`; list redirect addresses in the manifest.
9. **Remove the old stack.** Gateway join, Redis settings, legacy GraphQL,
   `@erxes/api-shared`, tenant identity lookups, `ENABLED_PLUGINS` docs.
10. **Rename settings** to unprefixed names (`DATA_URL`, `PORT`, …), accepting
    the old names for one release.

## 4. Data cut-over (production)

1. Freeze writes in the old deployment (maintenance mode) or run the copy
   twice (full, then a short final delta while frozen).
2. Copy the plugin's tables into the target database as the plugin role; run
   the tenancy migration; compare row counts per table and per organisation.
3. Register the plugin on the new core, install it for each organisation,
   point the plugin at the new `DATA_URL` and `CORE_URL`, start it.
4. Smoke test per organisation: sign in, open the plugin, a read, a write, an
   event on a customer timeline, an automation with the plugin's trigger.
5. Keep the old database read-only for a rollback window.

## 5. Known gaps (raise with core, don't work around silently)

- **Public routes without sign-in** (job applications, kiosk check-ins) can't
  turn a subdomain into an organisation through core yet. Store a
  per-organisation public key in the plugin's own settings table (set by a
  member in the plugin's settings) and resolve it in the plugin.
- **Team members on the server** (names, emails for documents): no plugin
  scope yet; read them in the UI with the member's session.
- **Email to outside addresses**: no plugin email API yet.
- **Listing or searching customers**: plugins can get one by id or
  find-or-create by email or phone.

## 6. Done when

- No `joinErxesGateway`, `sendTRPCMessage`, `extractUserFromHeader`, legacy
  GraphQL or `@erxes/api-shared` import remains.
- Every member route uses the session verifier; core events and automation
  actions verify their tokens.
- Every tenant-owned table has `core_enable_tenant_rls` (shared database) or a
  tested tenant filter (own database).
- The plugin-new validation list passes, and AGENTS.md (root, backend,
  frontend) describes the new wiring and the gaps still open.
