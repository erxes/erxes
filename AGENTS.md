# erxes core (new, Postgres) — agent and contributor guide

The new thin erxes core. It owns only what every plugin shares: organisations,
team members, sign-in, customers and companies, files, notifications,
payments, events, activity, automation and the plugin registry. Business
features (catalog products, orders, rooms, employees, tickets) belong to
plugins, which live in their own repos. Read `docs/design.md` before changing
anything structural.

## Layout

- `apps/core-api` — the core API (`/core/v1`), Express + oRPC (OpenAPI handler: plain REST + JSON), bundled with tsup.
  Code by feature in `src/modules/<feature>/<feature>.service.ts`; routes in
  `src/router.ts`; shared HTTP pieces in `src/http`, helpers in `src/lib`.
- `apps/core-ui` — the core UI (Rsbuild, React 18, React Query) and the Module
  Federation host for plugin UIs. Code by feature in `src/modules/<feature>/`
  (`app`, `auth`, `navigation`, `contacts`, `settings`, `plugins`); only
  cross-feature pieces live in `src/components` and `src/lib`.
- `packages/ui` — `erxes-ui`, copied from erxes `main` and compiled from source;
  shared with plugins as a Module Federation singleton. Keep changes
  backward-compatible: old plugins load against it.
- `packages/ui-modules` — the small part of old `ui-modules` that old plugin UIs
  import from the host (`PageHeader`). New code should not grow it.
- `packages/contract` — `@erxes/core-contract`: the API contract (zod + `@orpc/contract`)
  and event schemas. Core implements it; plugins call it with a typed client.
- `packages/db` — `@erxes/core-db`: Drizzle schema, client, migrator,
  `newId()`. Migrations in `packages/db/drizzle`.
- `docs/` — design decisions and the porting map from old erxes.

Apps import packages; packages never import apps. Add `apps/worker` only when
it is built.

## Rules

- **Thin core.** No business feature goes into core. If only one plugin needs
  it, it belongs in that plugin.
- **Contract first.** Every endpoint is declared in `packages/contract` with
  `oc.route({ method, path })` (paths are under `/core/v1`), zod input/output
  and stable error codes, then implemented in `apps/core-api/src/router.ts`
  (`authed.<group>.<name>.handler`, typed `context.actor`). Inputs are one
  object: path params, query or body merged (`{ id, ...changes }`). The
  OpenAPI document is served at `/core/v1/openapi.json`. Additive changes stay in v1; breaking changes go to
  `/core/v2`.
- **Tenancy.** Every core table has `org_id` (= the SaaS organisation `_id`).
  Every query filters by the caller's organisation (`req.actor.orgId`); never
  trust an organisation id from the body.
- **Ids are text** (`newId()`, 17 chars), so records imported from old erxes
  keep their Mongo `_id`.
- **Database.** Tables are `core_<name>` (`pgTable` from `packages/db/src/table.ts`);
  index and constraint names repeat the full table name. The database is shared
  with plugins (`<plugin>_<name>`): never read or write a plugin's tables.
  Schema change → edit `packages/db/src/schema`, run `pnpm db:generate`, commit
  the SQL. Never edit a released migration; never use `drizzle-kit push`.
- **Migrations** run with `pnpm db:migrate` as the owner role
  (`DATA_MIGRATION_URL`; `DATA_RUNTIME_ROLE` gets its grants after), in one
  transaction under `pg_advisory_xact_lock(hashtext('core:migrate'))`, tracked
  in `public.__drizzle_migrations_core`. The API migrates on start only in
  development (`DATA_MIGRATE_ON_START`). Only transaction-scoped locks (poolers).
- **Tenant isolation (row level security).** Every core table with `org_id`
  (and `core_organizations`) has RLS, forced, with policy `core_tenant`
  (`core_tenant_visible(org_id)`): rows are visible only when the transaction
  set `app.org_id` (or `app.system` for jobs). Code runs in scopes from
  `@erxes/core-db`: `withOrg(orgId, fn)` (every oRPC call for a member or
  plugin runs in one, set by the router middleware) and `withSystem(reason,
  fn)` (jobs, sign-in discovery, setup). Inside a scope `db()` is the scope's
  transaction; outside, RLS lets nothing through (fails closed). Express routes
  outside oRPC scope themselves. A new table with `org_id` needs RLS in its
  migration (`tenancy.test.ts` fails otherwise). The API's role must not
  bypass RLS (refused in production; `pnpm db:grant -- <role>` creates one).
  Services still filter by `org_id`: RLS is the safety net, not the filter.
- **Responses never carry credentials or `org_id`**: map rows to DTOs
  (`toUserDto`, …).
- **Errors** are oRPC's `{ code, status, message, data? }`: services throw
  `HttpError` (an `ORPCError`); invalid input is `INVALID_INPUT` with zod
  `issues`. Clients branch on `code` (`isApiError(error, 'CUSTOMER_EXISTS')`).
- **Settings** are read only in `apps/core-api/src/config.ts`. Names are unprefixed
  (`DATA_URL`, `PORT`, `CORE_JWT_SECRET`); secrets also accept `<NAME>_FILE`.
  Production throws on missing secrets.
- **Lists** use keyset paging (`CursorQuery` → `{ data, pageInfo, totalCount }`,
  newest first; `src/lib/keyset.ts`). The cursor is a record id. The UI reads
  them with `useCursorList` into `RecordTable.CursorProvider`.
- **UI parity.** Core UI follows old core-ui: the top bar (`CoreTab`: brand,
  app switcher, open-app tabs, settings, user menu), one `AppLayout` sidebar per
  app, pages built from `PageContainer` / `PageHeader` / `PageSubHeader` /
  `Filter` / `RecordTable`. Reuse erxes-ui parts before writing new ones.
- **Plugin UIs** load at runtime from the installed plugins' manifests (`ui`),
  plus `PUBLIC_PLUGINS` for development (`<remote>@<remoteEntry url>`,
  comma-separated; wins for the same remote): `./config` exports `CONFIG`
  (`name`, `path`, `icon`, `modules`), and the first module renders under
  `/<path>/*` (default export, or the PascalCase name: `./hr` → `Hr`).
- **Tests** run against a real Postgres: each test file creates and drops its
  own database (`apps/core-api/src/__tests__/db.ts`) when `DATA_TEST_URL` is set.

## Current state

- Organisations (`core_organizations`) and team members (`core_users`):
  list (keyset; search, status, role, ids), get, invite, update,
  disable/enable, with owner/admin/member rules (no self role change or self
  disable, only owners change owner rights, the organisation always keeps an
  active owner).
- Sign-in: email + password (scrypt) → HttpOnly `erxes_session` cookie or Bearer
  token (HS256 for now); status and role are re-read on every request; CSRF
  check for cookie writes. `pnpm bootstrap` creates an organisation and owner.
- First run: while the database has no organisation, `GET /setup` says so and
  `POST /setup` creates the organisation and its owner and signs in (the UI
  shows "Initial Configuration Steps"). `CORE_SETUP=false` turns it off where
  the SaaS side creates organisations.
- Customers (`core_customers`) and companies (`core_companies`): list (keyset;
  search, tag, owner, linked record, ids), get (merged ids resolve to the kept
  record), create, update, remove and merge (owners/admins), bulk tagging.
  One customer per primary email / phone and one company per name in an
  organisation (409 `CUSTOMER_EXISTS` / `COMPANY_EXISTS` names the existing
  one). Customers and companies link many-to-many (`core_customer_companies`).
- Tags (`core_tags`, per type) link through `core_customer_tags` /
  `core_company_tags` with foreign keys both ways, so deleting a tag or a record
  removes its links. Records still return `tagIds`.
- Custom fields (`core_fields`, "properties"): text, long text, number, date,
  yes/no, select, multi-select. Values live in each record's `custom_fields`
  JSON keyed by field id and are checked against the field on every write;
  deleting a field removes its values.
- Files (`core_files`): metadata in core, bytes in the storage driver
  (`FILES_STORAGE=local|s3`; S3, R2, MinIO). Upload in two steps:
  `POST /files` checks name, type and size against the organisation's settings
  (Settings › File upload, below the deployment's `FILES_MAX_SIZE_MB`; programs
  are always refused) and returns a signed PUT link; the client sends the bytes
  there (straight to the bucket for S3), then `POST /files/:id/complete` checks
  the stored object. `/files/:id/download` is the stable address (session or
  plugin key, then a short-lived link); risky types are only ever downloads.
  erxes-ui's upload hooks use core's storage through `setFileStorage`.
- **Sessions** carry the member's `sessionVersion`; password change (other
  sessions), admin reset, disable, enable and `POST /auth/sign-out-everywhere`
  raise it, so older tokens fail on the next request (and open streams get
  `bye`). Sign-in is limited per address (20/min) and per account (10
  failures in 15 minutes → 429, counted from the audit log, so it holds
  across replicas). Postgres TLS is verified (`DATA_SSL_CA`).
- **Jobs** (`core_jobs`, `src/modules/jobs`): `enqueueJob(tx, …)` in the
  business transaction (rolled back = never runs); dedupe keys; the worker
  claims with `SKIP LOCKED` and a lease (a dead worker's job is claimed again
  once the lease passes), retries with backoff, then `dead` (`retryDeadJobs`).
  `atomic` jobs commit their effects with their completion; others (HTTP)
  must be idempotent. Woken by NOTIFY `core_jobs`, polled every 2 s for
  delays. Register definitions in `jobs/registry.ts`.
- **Webhooks** (`core_webhooks`, `core_webhook_deliveries`): the `core.webhooks`
  event consumer queues a delivery per matching endpoint (`x.y.z`, `x.*`, `*`);
  `webhook.deliver` POSTs JSON signed `Erxes-Signature: t=…,v1=HMAC-SHA256(secret,
  "t.body")`, retries ~1 day, logs every attempt, turns an endpoint off after
  50 failures in a row. Secrets are sealed (`src/lib/secrets.ts`, AES-GCM,
  `CORE_ENCRYPTION_KEY`). Outbound calls go through `src/lib/outbound.ts`:
  https only and no private addresses outside development (SSRF; checked on
  the resolved address). `/events/types` lists core's and plugins' events.
- **Automations** (`src/modules/automations`, `core_automations`,
  `core_automation_versions`, `core_automation_runs`, `core_automation_run_steps`):
  trigger = event type + condition group (`conditions.ts`, no code is ever
  evaluated); steps = actions, delays, branches, stop; `{{subject.x}}`
  templates (`templates.ts`, paths only). The `core.automations` consumer
  starts one run per event and automation (reentry: always/once/daily); the
  `automation.advance` job runs one step at a time atomically with the run's
  progress, retries, and fails the run at that step (`onDead`). Activating
  checks the definition and publishes a version; runs keep theirs. Actions run
  as the member who activated it (permissions read at run time); their events
  carry `caused_by_run`/`depth` (an automation never triggers itself, chains
  stop at depth 5) and their audit entries name the automation. Core actions
  in `actions.ts`; plugin actions come from manifests and are POSTed to
  `<api.url>/automations/actions/<type>` with a core token
  (`verifyCoreCall`) and `Idempotency-Key`.
- **Email** (`src/modules/email`): templates render HTML + text; `sendEmail(tx,
  …)` queues the `email.send` job (rolled back = not sent). `EMAIL_DRIVER=log`
  in development (written to the log, `loggedEmails` in tests). Single-use
  links (`core_auth_tokens`, `<id>.<secret>`, only the secret's hash stored):
  invitations (7 days; resend replaces), password resets (30 minutes, at most
  5 an hour, never says whether an email exists; ends other sessions).
  `APP_URL` with `{subdomain}` builds links.
- **Concurrency.** Read-modify-write takes row locks in the request's
  transaction (`src/lib/locks.ts`: `lockRows`, `lockOrganization`, `lockKey`):
  contact custom fields, field changes vs. values (`FOR SHARE`), team changes
  (one per organisation, caller re-read inside), notification collapse.
  Files: uploads go to `uploads/<org>/<id>/<nonce>`; completion locks the row,
  checks and promotes exactly those bytes to the file's own key; cleanup claims
  with conditional updates; deletes leave a `deleting` tombstone purged when
  storage confirms. `races.test.ts` runs both sides of each race at once.
- **Operations.** `src/lib/log.ts`: JSON lines in production (`LOG_FORMAT`,
  `LOG_LEVEL`), secrets redacted, `requestId` on every line (`X-Request-Id`,
  echoed); one access line per request (path without query). `/health`
  (alive), `/ready` (database, and 503 while draining). SIGTERM: drain, end
  live streams, finish requests (15 s), stop jobs, close the pool.
- **Access map** (`src/http/access.ts`): every procedure has a policy —
  `public`, `member: 'any' | <permission>`, `plugin: <scope>` (or `manifest`)
  — checked by one oRPC middleware before the handler. `ACCESS satisfies
  Record<ProcedurePath, Policy>`: a procedure without an entry doesn't compile.
- **Permissions and roles** (`@erxes/core-contract` `CORE_PERMISSIONS`,
  `src/modules/roles`): actions like `contacts.delete`; plugins add theirs in
  their manifest (`hr.leave.approve`). A role (`core_roles`, per organisation)
  is a set of actions; `users.role` names one (composite FK). Built in:
  `owner` (everything, incl. owner-only `plugins.manage`, `audit.retention`),
  `admin` (`*`: every grantable action, also future plugin ones), `member`
  (editable); custom roles `r_<id>`. `can(actor, action)` /
  `requirePermission` in services; nobody creates or assigns a role wider than
  their own (`BEYOND_OWN_PERMISSIONS`). `/auth/me` returns `permissions`
  (UI: `useCan()`); plugin session tokens carry the member's actions for that
  plugin (`verifyPluginSession(...).can('hr.leave.approve')`).
- **Plugin connection** (`src/modules/plugins`, `@erxes/plugin-sdk`):
  - Registry `core_plugins` (client secret hashed; `CORE_PLUGIN_KEYS` registers
    them at startup, `pnpm plugin:secret -- <name>` rotates with 24 h overlap)
    and per-organisation `core_plugin_installations` with granted scopes
    (owners install/uninstall/approve in Settings › Plugins; auto-install for
    self-hosted and development, `PLUGINS_AUTO_INSTALL`).
  - Plugin servers: `POST /plugins/token` (client credentials, + `org`) → a
    15-minute ES256 token with the granted scopes; every request re-checks
    the installation, so uninstalling cuts a plugin off at once. Without `org`
    the token only updates the manifest (`PUT /plugins/manifest`: ui, api
    url, scopes, permissions, notification kinds, events). The secret itself
    is never accepted on API calls.
  - Plugin UIs: erxes-ui's `pluginFetch('hr', path)` / `pluginJson` call the
    plugin's API (manifest `api.url`) with a 5-minute session token (`POST
    /plugins/{name}/session`, `aud` = the plugin, `typ`
    `erxes-plugin-session+jwt`) that the plugin verifies with the JWKS
    (`verifyPluginSession`). Core's session cookie never leaves core.
  - Live: plugins call `core_live_signal(org, plugin, topic, user_ids)` in
    their transaction (or `POST /plugins/live`, `live:write`); the stream sends
    `plugin { plugin, topics }`; plugin UIs use erxes-ui's `useLiveSignal`.
- `context.caller` / `pluginOf` in the router. Plugin-only:
  `POST /notifications`, `POST /activities`; both take a `dedupeKey` (retry-safe)
  and a kind/type namespaced by the plugin (`hr.leave.requested`).
- Notifications (`core_notifications`): one inbox per source, like Atlassian —
  `core` and each plugin — gathered at `/notifications` (sidebar per inbox,
  unread counts per source) and `/notifications/<plugin>` for one plugin's
  inbox. Core notifies owners about records others assign, change (quick edits
  collapse into one, with `data.changes`), merge or delete, and about plugin
  events on their records; members about role and password changes (can't be
  muted). Each member mutes kinds or whole plugins (Settings › Notifications).
  Counts refresh every 30 s (no LISTEN/NOTIFY behind poolers).
- Activity (`core_activities`): the customer/company timeline (Activity tab):
  created, updated (with changes), tagged, merged, linked, plus plugin entries;
  moved on merge, deleted with the record. Plugin history stays in the plugin.
- Audit (`core_audit_logs`): sign-ins, team, contacts, tags, properties, files
  and settings with before/after values, IP and user agent, written in the same
  transaction as the change (`recordAudit`); Settings › Audit log for owners
  and admins. Hourly cleanup prunes old entries, unfinished uploads and old
  read notifications (`src/lib/maintenance.ts`).
- Event stream (`core_events`, transactional outbox): plugins on core's
  database publish with `SELECT core_publish_event(org, plugin, type, payload,
  subject_type, subject_id, summary, link, notify, dedupe_key, …)` inside their
  own transaction; others use `POST /events`. Core publishes `core.*` events in
  the same transaction as its changes. `src/modules/events/processor.ts` reads
  in commit order (`tx_id`, `seq`; only finished transactions) with a cursor
  per consumer (`core_event_consumers`, `FOR UPDATE SKIP LOCKED`), polling every
  second: subject + summary → timeline entry (+ owner notification in the
  plugin's inbox); `notify` → notifications. Consumers must be idempotent.
  A failing event doesn't block the stream: it goes to `core_event_failures`
  and is retried after 1 min, 5 min, 30 min, 2 h, 12 h, then is `dead`
  (Settings › Event delivery: retry or dismiss; `/events/failures`). Events are
  pruned after `EVENTS_RETENTION_DAYS` once every consumer passed them and none
  still retries them.
- Signing keys (`src/lib/signing.ts`): one ES256 key (`CORE_SIGNING_KEY`, PEM;
  development generates `data/keys/signing-key.pem`), public keys at
  `/core/v1/.well-known/jwks.json` (kid = RFC 7638 thumbprint; rotate through
  `CORE_SIGNING_KEYS_RETIRED`). Every token type has its own JOSE `typ`.
- Audit checkpoints (`core_audit_checkpoints`, append-only): every 10 minutes
  (and on `/audit/verify`) core checks the entries added since the last
  checkpoint and signs the chain head. Verify checks signatures and that each
  checkpoint's entry still has the signed hash — catching a consistently
  rewritten chain and entries cut off its end. `/audit/checkpoints` exports them.
- Audit log hardening: one log for core and plugins (`POST /audit`, or
  `core_record_audit()` in the plugin's transaction; `source` column); a
  per-organisation hash chain set by a trigger (`GET /audit/verify`);
  append-only in the database (updates, deletes and TRUNCATE raise; only the
  retention cleanup with `core.audit_prune` and organisation deletes remove
  rows); per-organisation retention (owners, ≤ AUDIT_RETENTION_DAYS); filters
  for dates, IP, source and text; counts capped at 10,000; CSV/JSON export
  (`GET /audit/export`, audited, formulas defused).
- Timeline notes: `customer.note` / `company.note` entries with @mentions
  (notify `core.note.mentioned`), attachments and pinning; the timeline filters
  by kind (notes, changes, plugins) and a company can include its customers'.
- Live updates: committed changes `NOTIFY` (migration 0008 triggers on
  notifications, activities, events); each API server holds one `LISTEN`
  connection (`src/modules/live/hub.ts`; `DATA_LISTEN_URL`, derived for Supabase
  as the session pooler on 5432) and serves `GET /core/v1/stream` (Server-Sent
  Events: `hello { mode }`, `inbox`, `timeline { targets }`, `resync`, `bye`;
  signals only, never data; coalesced, heartbeats, session re-checked, capped
  per member). The event processor runs on `NOTIFY` (30 s safety poll; 1 s
  without a listener). core-ui (`src/lib/live.ts`) keeps one stream per
  browser (Web Locks leader + BroadcastChannel), reopens it with backoff,
  refetches what changed, and polls only while the stream is down.
- Profile (Settings › Account › Profile, `/settings/profile`): the member's own
  picture (core file service), names, contact details, about and links through
  `users.update` on themselves; `POST /auth/password` changes their password with
  the current one; `GET /auth/sign-ins` lists their sign-ins from the audit log.
  Avatars accept a URL or a core file address (`ImageAddress`).
- Core UI: setup and sign-in (old core-ui look); Contacts (Customers, Leads,
  Companies) on RecordTable with inline editing, tag and custom field columns,
  filters, bulk tag / merge / delete, a detail side panel (`?customerId=`,
  `?companyId=`) and add forms (`=new`); Settings (Team members, Tags,
  Properties, Organization); theme and language in the user menu; plugin UIs
  through Module Federation.

## Validation

```sh
pnpm install
pnpm typecheck
DATA_TEST_URL=postgres://… pnpm test
pnpm build
pnpm db:check
```
