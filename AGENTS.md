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
- **Migrations** run at API startup in one transaction under
  `pg_advisory_xact_lock(hashtext('core:migrate'))`, tracked in
  `public.__drizzle_migrations_core`. Only transaction-scoped locks (poolers).
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
- **Plugins** load at runtime from `PUBLIC_PLUGINS`
  (`<remote>@<remoteEntry url>`, comma-separated): `./config` exports `CONFIG`
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
- Plugins call core with `CORE_PLUGIN_KEYS` (`Authorization: Bearer <key>` +
  `X-Erxes-Org`); `context.caller` / `pluginOf` in the router. Plugin-only:
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
