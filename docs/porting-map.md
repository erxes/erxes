# Porting map: old erxes → new core

What happens to each old core module. "Port" = bring the logic and its tests,
rewrite data access; "rewrite" = new design; "drop" = not in core.

`docs/inventory/old-erxes.json` lists old erxes at a fixed commit: core modules, plugins, every
`sendTRPCMessage` call with caller and target, event helper calls, `ui-modules` imports per plugin
and worker files. `pnpm inventory -- --repo <path to an old erxes checkout>` regenerates it from
git objects only, without touching that checkout's working tree. `--repo` is required; `--ref`
defaults to `origin/main`.

| Old (erxes `main`)                                                                | New                                                      | How                                              | Status                                    |
| --------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------- |
| `core-api/modules/organization` (team members)                                    | `apps/core-api/src/modules/users`                        | Rewrite (roles simplified to owner/admin/member) | Done (slice 1)                            |
| `core-api/modules/auth` (login, 2FA, `staffLogin.ts`)                             | `modules/auth`                                           | Port                                             | Password sign-in done; 2FA todo           |
| `core-api/modules/auth/routes/oauth/*` (authorize, token, JWKS, platform clients) | `modules/auth/oauth`                                     | Port                                             | Todo                                      |
| `core-api/modules/organization/identity`                                          | `core_organizations` + SaaS sync                         | Rewrite                                          | Todo                                      |
| `core-api/modules/contacts` (customers, companies)                                | `modules/customers`, `modules/companies`                 | Rewrite; port dedupe/merge rules                 | Done (customers, companies, links, merge) |
| `core-api/modules/tags`                                                           | `core_tags` + `core_customer_tags` / `core_company_tags` | Rewrite (join tables)                            | Done                                      |
| `core-api/modules/files`                                                          | `modules/files`                                          | Port storage adapters                            | Todo                                      |
| `core-api/modules/notifications`, `emailTemplates`                                | `modules/notifications`                                  | Port senders, templates                          | Todo                                      |
| payment plugin (QPay …)                                                           | `modules/payments`                                       | Port provider integrations                       | Todo                                      |
| `core-api/modules/logs`, `services/logs`                                          | `core_events`, `core_activities`, per-plugin audit       | Rewrite                                          | Todo                                      |
| `core-api/modules/automations`, `services/automations`                            | new engine                                               | Rewrite; keep node schemas + preflight ideas     | Todo                                      |
| `core-api/modules/permissions`                                                    | plugin access + seats; roles inside plugins              | Rewrite                                          | Todo                                      |
| `core-api/modules/products`                                                       | None (Commerce plugin owns its catalog)                  | Drop                                             | n/a                                       |
| `core-api/modules/segments`                                                       | facts-based segments (later)                             | Rewrite later                                    | n/a                                       |
| `core-api/modules/broadcast`, `forms`                                             | marketing/frontline plugins                              | Drop from core                                   | n/a                                       |
| `core-ui` shell (`CoreTab`, `AppLayout`, plugin loading)                          | `apps/core-ui/src/modules/{app,navigation,plugins}`      | Rewrite, same UX                                 | Done                                      |
| `core-ui` contacts (customers, leads, companies)                                  | `apps/core-ui/src/modules/contacts`                      | Rewrite on REST, same UX                         | Done (side panel without activity yet)    |
| `core-ui` settings › team members                                                 | `apps/core-ui/src/modules/settings/team-members`         | Rewrite on REST, same UX                         | Done (no structure fields, permissions)   |
| `libs/erxes-ui`                                                                   | `packages/ui`                                            | Copied; backward-compatible fixes only           | Done                                      |
| `core-api/modules/forms` fields (properties)                                      | `core_fields` + `custom_fields` jsonb                    | Rewrite                                          | Done (customers, companies)               |
| `core-ui` create owner (`/create-owner`)                                          | `/core/v1/setup` + `SetupPage`                           | Rewrite                                          | Done                                      |

## What core has today

Moved from `AGENTS.md`. Update it when a slice lands.

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
  plugin token, then a short-lived link); risky types are only ever downloads.
  erxes-ui's upload hooks use core's storage through `setFileStorage`.
- **Sessions** carry the member's `sessionVersion`; password change (other
  sessions), admin reset, disable, enable and `POST /auth/sign-out-everywhere`
  raise it, so older tokens fail on the next request (and open streams get
  `bye`). Sign-in is limited per address (20/min) and per account (10
  failures in 15 minutes → 429, counted from the audit log, so it holds
  across replicas). Postgres TLS is verified (`DATA_SSL_CA`).
- **Access map** (`src/http/access.ts`): every procedure has a policy:
  `public`, `member: any | manager | owner`, `plugin: <scope>` (or `manifest`),
  checked by one oRPC middleware before the handler. `ACCESS satisfies
  Record<ProcedurePath, Policy>`: a procedure without an entry doesn't compile.
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
- Notifications (`core_notifications`): one inbox per source, like Atlassian:
  `core` and each plugin, gathered at `/notifications` (sidebar per inbox,
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
  checkpoint's entry still has the signed hash, which catches a consistently
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
  Properties, Profile, Notifications, File upload, Audit log); theme and language in the user menu; plugin UIs
  through Module Federation.
