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
- Advanced filters and views (`src/modules/views`): lists of customers,
  leads and companies take `filter` — JSON of the same condition group
  automations use (`subject.<field>` paths) — compiled to one SQL condition
  (`recordFilter.ts`): built-in fields, custom fields (`customFields.<id>`,
  typed casts, multi-select arrays), tags, owner (`me`), the linked
  company's fields (customers; "no company where …" for negative operators),
  customer count (companies), last activity, and relative dates
  (`within_last`, `more_than_ago`, `within_next`, `anniversary_within`,
  also in automation conditions); nested and/or groups, three levels; 400
  `INVALID_FILTER` otherwise. `GET /views/fields` lists what fits.
  Saved views (`core_views`): name, filter, search (columns and sort kept
  for later), private or shared (sharing and changing shared ones need
  `contacts.edit`); run live, so never stale. No separate segments: a view
  is the segment. UI: Advanced in the filter bar (the automation condition
  editor), views in the Contacts sidebar, Save / Update view; the filter and
  view live in the address (`advanced`, `view`).
- Import and export (`src/modules/transfer`; permissions `contacts.import`,
  `contacts.export`; Settings › Import & export):
  - Import (customers, leads, companies) from CSV (UTF-8, BOM, `,` `;` tab)
    or Excel (first sheet), ≤ 100,000 rows: uploaded through `/files`, parsed
    by job `import.parse` into `core_import_rows`, columns suggested from
    header names (English and Mongolian aliases, `columns.ts`). Options: mode
    (`create` skips matches, `update`, `upsert`), match by email / phone /
    code / id (companies: name), tags for every row, owner of new records,
    create missing tags and companies, run automations (off: events carry
    `_import.quiet`, automations and owner notices skip them).
  - Check (`import.check`) is a dry run: every row goes through the real
    services in a savepoint that is rolled back, so it reports exactly what
    the run will do. Run (`import.run`): batches of 200, a savepoint per row,
    the next batch queued in the same transaction (atomic jobs). Rows keep
    their action, error and record; errors download as CSV. Undo (30 days)
    sends created records to the recycle bin (no mass-deletion guard);
    updates stay.
  - Export (`export.run`): the list's own conditions (`customerListWhere` /
    `companyListWhere`: quick filters, advanced filter, search), chosen
    columns (tags, owner email and companies as text), CSV with BOM (formula
    cells kept as text) or Excel; ≤ 100,000 rows; the file is stored by core
    (`storeServerFile`; storage drivers gained `read`/`write`), audited
    (`contacts.exported`), and the member is notified.
- Tags (`core_tags`, per type) link through `core_customer_tags` /
  `core_company_tags` with foreign keys both ways, so deleting a tag or a record
  removes its links. Records still return `tagIds`.
- Custom fields (`core_fields`, "properties"): text, long text, number, date,
  yes/no, select, multi-select. Values are typed rows
  (`core_customer_field_values`, `core_company_field_values`: one row per
  value in a text / number / date / yes-no column, one per choice of a
  multi-choice field, each indexed; `src/modules/fields/fieldValues.ts`),
  checked against the field on every write; records still read and write
  `customFields: { [fieldId]: value }`. Deleting a field or a record removes
  its values (foreign keys). Big lists: counts stop at 10,000
  (`totalCapped`), search reads a trigram-indexed `search_text` column,
  `last_activity_at` is kept by a trigger on `core_activities`, a filter that
  hits the statement timeout is 400 `FILTER_TOO_SLOW`; `bench.yml` times
  every kind of filter on 1,000,000 customers.
- Leads (`src/modules/leads`): people and companies with `state = lead`,
  moving through the organisation's own stages (`core_lead_stages`: open /
  qualified / disqualified, at least one open; Settings › Lead stages), with a
  source and details, a disqualify reason, and conversion (`convertedAt`;
  converting lands in the first qualified stage). Every step is in
  `core_lead_events` (funnel, time in stage, conversion by source and owner,
  loss reasons: `GET /leads/report`). `/leads/move`, `/leads/convert`
  (`recordType` customer or company), events `core.lead.stage_changed` /
  `core.lead.converted`, automation actions to move and convert. UI:
  Contacts › Leads (Insights, People, Companies), table (stage pill after the
  name, stage filter) or board (Display; remembered in the browser), and the
  report also in the Reports app and as Home tiles. People and companies are
  peers: links carry a role, one main contact per company and an end date.
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
- **Timelines** (`src/modules/activities`): customers, companies, and plugin
  record types declared in a manifest's `timelines` (`hr.employee`, with an
  optional permission; `assertTimelineAccess`). Notes (mentions, files, pins,
  edit history in `data.history`), logged calls/meetings/emails/messages
  (`<target>.interaction`), reactions (`data.reactions`, row-locked toggle),
  search (`q`) and filters (member, source, dates, kind). Plugins add entries
  to customers, companies and their own types, and change or remove their own
  (`PATCH|DELETE /activities/{id|key:<dedupeKey>}`); `activityTypes` in the
  manifest give entries a label, colour and icon (fixed icon set). Plugin UIs
  embed core's timeline with erxes-ui's `<RecordTimeline type id />`.
- **Automations** (`src/modules/automations`, `core_automations`,
  `core_automation_versions`, `core_automation_runs`, `core_automation_run_steps`):
  - Triggers (`AutomationTrigger.kind`): `event` (type + conditions), `schedule`
    (hour/day/week/month at a time in an IANA zone, optionally for each record
    of an audience), `date` (N days before/after a record's date field,
    yearly for birthdays), `manual` (`POST /automations/{id}/start`, on chosen
    records or the audience). `triggers.ts`: `tickAutomations` every minute
    claims due ones (`next_run_at`), the `automation.fire` job enrolls.
  - Steps: action, delay, `wait_for` (event about the record, with a time
    limit; output `matched`), branch, switch (cases/otherwise), split (A/B by
    weight, stable per run), stop. Cursors address arms (`then`, `case:N`,
    `otherwise`, `path:N`).
  - Rules: re-entry (always/once/daily), `goal` (checked before each step and
    on every event about a waiting record → `goalReachedAt`), `maxRunsPerHour`
    (skips counted in `state.skippedByLimit`).
  - Templates (`templates.ts`): `{{path | filter: arg}}`; filters only from a
    fixed list (default, upper, lower, capitalize, trim, truncate, number,
    round, add_days, add_hours, date, join, count, first, json); `now`.
  - Execution: one atomic job per step; retries, then the run fails at the
    step and the activator is notified (collapsed hourly); failed runs resume.
    Actions run as the activating member; their events carry `caused_by_run` /
    `depth` (no self-triggering, depth ≤ 5); audit entries name the automation.
  - Core actions (`actions.ts`): update/tag customer and company, set a custom
    field, round-robin owner (`state.turns`), note, notify, email, POST with
    headers. Plugin actions from manifests (`verifyCoreCall`, Idempotency-Key).
  - Tools: dry run (`/test`), per-step stats (30 days), versions + restore,
    templates (`library.ts`), field catalog for pickers (`/automations/fields`).
  - UI (`apps/core-ui/src/modules/automations`): a flow canvas
    (`builder/FlowCanvas.tsx`) — trigger, then steps as cards top to bottom,
    branches/cases/A-B paths side by side, "+" on every line, per-step stats
    and problem badges, zoom — with an inspector for the selection (Settings,
    Trigger, or a step: `builder/StepSettings.tsx`). `builder/flowModel.ts`
    holds the pure tree operations, one-line summaries, client checks and
    earlier steps' outputs as condition fields (unit-tested). Unsaved-change
    marker and leave warning, ⌘S saves, Delete removes the selected step;
    turning on is blocked while steps are flagged. The list has search, a
    status filter and an on/off switch per automation.
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
  - Events to plugins (`src/modules/plugins/pluginEvents.ts`): manifest
    `subscriptions` (patterns, `core.payment.*`) → consumer `core.plugins` →
    job `plugin.event` POSTs `{ id, type, organizationId, createdAt, data }`
    to `<api.url>/events` with a 5-minute token (`typ`
    `erxes-core-event+jwt`, `aud` the plugin, `sha` = the body's SHA-256)
    and `Idempotency-Key: <event id>`; non-2xx retries for about two days.
    Not ordered (one failing event never holds up the rest): payloads carry
    totals (`paidAmount`, `refundedAmount`), so handlers use the latest state.
    Plugins check with `verifyCoreEvent(authorization, rawBody, …)`. They
    never get their own events; payment events only for their own invoices
    (`payments:read`), customer/company events with `customers:read`, the
    rest with `events:read`.
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
  muted). Settings › Notifications works by group, not kind by kind: core's
  groups (`CORE_NOTIFICATION_GROUPS`: assigned, records, mentions,
  automations, imports and exports, security) and each plugin as one group,
  each set to in erxes and email / in erxes only / off (`deliveryFor`; old
  per-kind mutes still silence what they named until settings are saved).
  Two switches: email (notification emails through the job queue, template
  `notification`) and browser (desktop notifications for new inbox items
  while erxes is in the background, `useDesktopNotifications`). Security is
  always on.
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
- Welcome steps: `core_users.onboarded_at` (`POST /auth/onboarded`, first time
  kept); core-ui's `OnboardingGuard` reads it from the session, so another
  browser doesn't show them again.
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
- Audit streaming (`src/modules/audit/streams.ts`, `core_audit_streams`,
  owner-only `audit.stream`; Audit log › Streaming): the log goes, as it is
  written and in chain order, to a log service — `erxes` (signed JSON with
  the chain hashes), `datadog` (logs intake) or `splunk` (HEC) — with an
  optional sealed auth header. `cursor_seq` moves only on 2xx, so outages
  lose nothing (retries back off to 15 min; owners are told after 10
  failures); entries pruned before delivery are sent as a named gap. One
  delivery loop per stream (`chain_id`; the row lock serialises rounds).
- Security alerts (`src/modules/audit/alerts.ts`, run by `recordAudit` in a
  savepoint): owners, in erxes and by email, when two-step sign-in is turned
  off, someone is made owner/admin, audit retention or streaming changes, a
  payment gateway is connected or its credentials change, or one account
  has `FAILED_SIGN_IN_ALERT` (10) failed sign-ins in 15 minutes; in erxes
  only for audit exports, new webhooks and role permission changes. Members
  hear (and get an email) about sign-ins from a device and address not seen
  in 90 days and about recovery codes used. Kinds `core.security.alert` and
  `core.security.new_sign_in` can't be muted; the member who acted isn't
  notified in erxes but is still emailed.
- SaaS with erxes.io (`src/modules/saas`, `SAAS=true`; self-hosted has none
  of this: every plugin, as Pro). erxes.io (repo `erxes/global-profile-v2`)
  owns organisations, the marketplace and Stripe billing: one subscription
  per organisation; each plugin is `free` / `plus` / `pro` with a status
  (`active`, `past_due` while Stripe retries, `canceling` until period end);
  bundles and gifts are plugin rows too; an ended paid period drops a
  freemium plugin to `free` and removes a paid-only one.
  - Core reads it: `GET <SAAS_PLATFORM_URL>/api/platform/organizations/plugins?subdomain=`
    with `Authorization: Bearer <SAAS_PLATFORM_TOKEN>` (erxes.io's
    `PLATFORM_API_TOKEN`) → `{ status, details: [{ code, tier, status }] }`,
    stored in `core_entitlements`; per-process cache 30 s, stale answers
    refreshed in the background, hourly for every workspace, and at once on
    `POST /core/v1/saas/organizations/{id}/refresh` (erxes.io after a
    purchase). erxes.io down: the last answer stays in force; never answered
    yet: let in.
  - Access per plugin (`accessOf`): in the plan → `full` (`warning` when
    `past_due`/`canceling`); gone from it → `read_only` for
    `SAAS_GRACE_DAYS` (core refuses its changes with 402 `READ_ONLY`), then
    `off` (installation disabled `Not in your plan`, data kept, tokens
    refused); bought again → back. Organisation `inactive`/`suspended` →
    403 `ORGANIZATION_DISABLED` (members keep `/plan`, `/auth/me`, sign-out).
    Enforced by `standingGuard` after authentication.
  - Plugins gate their own features by tier: `GET /plan/plugin` →
    `{ tier, status, access }`, and members' plugin session tokens carry
    `tier` and `access` (`verifyPluginSession(...).tier`, `.canChange()`).
  - erxes.io → core (Bearer `SAAS_PLATFORM_TOKEN`): `PUT
    /core/v1/saas/organizations/{id}` creates (with owner), renames,
    enables or disables a workspace; `GET` the same path returns usage.
    erxes.io still provisions old erxes by writing its Mongo: it should call
    this for new-core workspaces.
  - Sign-in hand-off: erxes.io's existing link, `/gateway/pl:core/core-login?token=`
    (also `/core/v1/saas/login`): HS256 `{ user: { email } }` signed with
    `SAAS_JWT_TOKEN_SECRET`, ≤ 5 minutes, the workspace from the address's
    subdomain (or `org`), each token once (`core_used_tokens`).
  - UI: Settings › Plan (each plugin's tier, status, access) and a banner
    (workspace disabled, plugin read-only, payment retrying).
- Payments (`src/modules/payments`, drivers in `@erxes/payment-gateways`):
  gateway connections per organisation (QPay, test; credentials sealed and
  checked with the gateway); invoices for a plugin's or core's record with
  `metadata` (≤ 8 KB, returned in events) and a `dedupeKey`; paid only after
  asking the gateway (callbacks are signed and just trigger a check; pending
  invoices are also checked by job). Settings › Payments: each plugin's
  default gateway and allowed gateways (`core_payment_plugin_settings`), the
  invoice list and refunds. Refunds (`core_payment_refunds`,
  `payments.refund` / `payments:write`): row-locked against what is left,
  retry-safe by `dedupeKey`; through the gateway (QPay refunds whole payments
  only) or `manual` to record money paid back outside erxes; a gateway's
  refusal is kept as a failed refund. Events `core.payment.paid | expired |
  cancelled | refunded`; audit `payment.refunded`.
- Plugin data defences:
  - each plugin connects as its own database role (`pnpm db:plugin-role -- <plugin>`
    creates `erxes_plugin_<plugin>`, NOBYPASSRLS, no access to `core_*` tables);
    it reaches core only through `core_publish_event`, `core_record_audit` and
    `core_live_signal` (SECURITY DEFINER; they check the caller is that plugin);
  - plugins call `core_enable_tenant_rls('<table>')` in their migrations to put
    their own tables under the same tenant policy;
  - after every migration run `LOCK_DOWN` revokes PUBLIC, `anon` and
    `authenticated` (Supabase API roles) from `core_*` tables;
  - recycle bin (`core_trash`, Settings › Recycle bin): deleted customers and
    companies keep a snapshot with tags, links and timeline for 30 days;
    restore needs `contacts.delete`, delete for good needs `trash.purge`
    (owners);
  - mass-deletion guard (`src/lib/deletionGuard.ts`, `core_deletion_counters`
    in 5-minute buckets, last 10 minutes counted): owners are told at
    `MASS_DELETE_ALERT` (100); at `MASS_DELETE_LIMIT` (500) a member's deletes
    stop with 429 `MASS_DELETE_STOPPED` and a plugin is suspended (installation
    disabled with `statusReason`; reinstalling resumes it). Owners are exempt.

## Validation

```sh
pnpm install
pnpm typecheck
DATA_TEST_URL=postgres://… pnpm test
pnpm build
pnpm db:check
```

CI (`.github/workflows/ci.yml`) runs the same on Postgres 16, then builds the
images, smoke-tests the stack in `deploy/` and pushes to GHCR. Never edit an
applied migration: `scripts/check-migrations.mjs` fails the build. See
`deploy/README.md`.
