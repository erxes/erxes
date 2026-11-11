# New erxes core — design (living document)

## Decisions

| # | Decision | Status |
| --- | --- | --- |
| 1 | Thin core: identity, customers/companies, files, notifications, payments, events, activity, automation, plugin registry. No business features. | Agreed |
| 2 | Postgres + Drizzle for core data; tables `core_*`; database shared with plugins (`<plugin>_*`). | Agreed |
| 3 | The SaaS organization DB (Mongo) stays the registry and billing source. Core keeps a small `core_organizations` row per organisation with the same id, updated from the SaaS side. | Agreed |
| 4 | Contract-first HTTP API (`/core/v1`, `@erxes/core-contract`, oRPC + zod, served as plain REST with an OpenAPI document) for calls; events for changes; OAuth tokens for trust. tRPC only inside old erxes. | Agreed |
| 5 | Plugins are independent ("one plugin = one install"), each in its own repo, on published `@erxes/*` packages. | Agreed |
| 6 | Option C: write core fresh, port proven pieces with their tests, keep old erxes running and frozen, import organisations later per org. | Agreed |
| 7 | Text ids so Mongo `_id`s survive the import. | Agreed |
| 8 | Repo layout `apps/` + `packages/`; UI app will be `apps/core-ui`. | Agreed |
| 9 | Customers and companies (and their tags) in core; plugin records keep their own tags. | Agreed |
| 10 | Activity timeline in core, built from events; plugin-internal history stays in the plugin. | Agreed |
| 11 | Payments: gateway connections in core; payment records per plugin. | Agreed |
| 12 | Commerce (Ecom) owns its catalog; no product catalog in core. | Agreed |
| 13 | Automation: new event-based engine on Postgres (no segment gate, plugin manifests, idempotent actions). | Agreed |
| 14 | Lists use keyset (cursor) paging, newest first; the cursor is a record id. | Agreed |
| 18 | oRPC replaces ts-rest (contract-first, typed context and errors, OpenAPI built in, streaming for later events); the HTTP surface stays plain REST under `/core/v1`. | Agreed |
| 16 | Tags link through join tables per record type (`core_customer_tags`, `core_company_tags`) with foreign keys both ways — not id arrays. Custom field values stay in a `jsonb` column keyed by field id, checked against `core_fields`. | Agreed |
| 17 | First run: an installation without an organisation shows setup (create organisation + owner); off on SaaS (`CORE_SETUP=false`). | Agreed |
| 19 | Files: metadata in `core_files`, bytes in a storage driver (local or S3-compatible); two-step uploads through signed links so browsers upload straight to the bucket; storage keys live in server config, never in the database. | Agreed |
| 20 | Notifications: one inbox per source (core and each plugin), gathered in core like Atlassian's inbox; plugins create them with a plugin key and a dedupe key; members mute kinds or whole plugins; security notices can't be muted. | Agreed |
| 21 | Audit log in core for core's own changes (`core_audit_logs`), written in the same transaction; plugins keep their own audit. | Agreed |
| 22 | Event stream as a transactional outbox (`core_events`): published in the same transaction as the change, read in commit order by idempotent consumers (timeline, notifications; automations and webhooks next). | Agreed |
| 23 | One audit log per organisation for core and plugins, append-only in the database and hash-chained for tamper evidence. | Agreed |
| 24 | Live updates: Postgres LISTEN/NOTIFY to the API servers, Server-Sent Events to browsers (one per browser, shared by tabs), signals not data, polling only as a fallback. | Agreed |
| 25 | Reliable delivery and provable audit: failed events retry with backoff then wait as dead letters (never block the stream); audit chain heads are signed (ES256, key outside the database, public JWKS) so whole-chain rewrites and tail truncation are detected; live signals are sent once per statement. | Agreed |
| 26 | Plugin connection: a registry with per-organisation installations and granted scopes; plugin servers trade a client secret for 15-minute ES256 tokens (re-checked against the installation on every request); plugin UIs call their own API directly with a 5-minute per-plugin session token verified through core's JWKS; one access map gives every procedure an explicit policy. | Agreed |
| 27 | Tenant isolation in the database: forced row level security on every organisation table; code runs in `withOrg` / `withSystem` scopes (transaction-local settings, safe with poolers) and fails closed outside them; a runtime role without BYPASSRLS, migrations by the owner role with their own command. | Agreed |
| 28 | Permissions: actions (core's catalog plus plugin manifests) grouped into per-organisation roles — Owner, Admin (`*`), Member and custom ones; one role per member, no per-user grants; nobody grants beyond their own permissions; the access map names the permission of every procedure. (Not old erxes's permission groups: old groups become custom roles when organisations are imported.) | Agreed |
| 29 | One job queue in Postgres (`core_jobs`): enqueued in the business transaction, leased with SKIP LOCKED, retried with backoff, dead-lettered; webhooks and automations run on it (no Redis, no separate worker service). Outgoing webhooks are signed like Stripe's and protected against SSRF. | Agreed |
| 15 | Core UI keeps old core-ui's UX (top bar with app tabs, per-app sidebars, RecordTable pages) and stays the Module Federation host, sharing `erxes-ui` and the old singletons so existing plugin UIs load. | Agreed |

## Slices

1. Foundation + organisations + team members — **done**.
2. Sign-in: password — **done**; next: 2FA, OAuth server (authorize/token/JWKS,
   platform clients), RS256 access tokens, service tokens — port from old core.
3. Core UI: shell (top bar, apps, plugin host), Team members, Organization —
   **done**.
4. Customers and companies — **done**: dedupe, links, tags, custom fields,
   merge, detail panel, first-run setup. Next: find-or-create for plugins,
   consent, activity timeline (with events).
5. SaaS sync: create/update `core_organizations` from the SaaS side.
6. Files, notifications — **done**; payments next.
7. Activity timeline (notes, filters, rollup), audit log (plugins, hash chain,
   export) and the event stream — **done**; next: webhooks from the stream,
   plugin keys → registry OAuth clients, then the automation engine on events.
8. Plugin registry — **done** (manifests, installations, scopes, tokens, SDK); then the automation engine.
