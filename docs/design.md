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
6. Files, notifications, payments.
7. Events, activity, webhooks.
8. Plugin registry (replaces `PUBLIC_PLUGINS`), then the automation engine.
