# Porting map: old erxes → new core

What happens to each old core module. "Port" = bring the logic and its tests,
rewrite data access; "rewrite" = new design; "drop" = not in core.

| Old (erxes `main`) | New | How | Status |
| --- | --- | --- | --- |
| `core-api/modules/organization` (team members) | `apps/core-api/src/modules/users` | Rewrite (roles simplified to owner/admin/member) | Done (slice 1) |
| `core-api/modules/auth` (login, 2FA, `staffLogin.ts`) | `modules/auth` | Port | Password sign-in done; 2FA todo |
| `core-api/modules/auth/routes/oauth/*` (authorize, token, JWKS, platform clients) | `modules/auth/oauth` | Port | Todo |
| `core-api/modules/organization/identity` | `core_organizations` + SaaS sync | Rewrite | Todo |
| `core-api/modules/contacts` (customers, companies) | `modules/customers`, `modules/companies` | Rewrite; port dedupe/merge rules | Done (customers, companies, links, merge) |
| `core-api/modules/tags` | `core_tags` + `core_customer_tags` / `core_company_tags` | Rewrite (join tables) | Done |
| `core-api/modules/files` | `modules/files` | Port storage adapters | Todo |
| `core-api/modules/notifications`, `emailTemplates` | `modules/notifications` | Port senders, templates | Todo |
| payment plugin (QPay …) | `modules/payments` | Port provider integrations | Todo |
| `core-api/modules/logs`, `services/logs` | `core_events`, `core_activities`, per-plugin audit | Rewrite | Todo |
| `core-api/modules/automations`, `services/automations` | new engine | Rewrite; keep node schemas + preflight ideas | Todo |
| `core-api/modules/permissions` | plugin access + seats; roles inside plugins | Rewrite | Todo |
| `core-api/modules/products` | — (Commerce plugin owns its catalog) | Drop | — |
| `core-api/modules/segments` | facts-based segments (later) | Rewrite later | — |
| `core-api/modules/broadcast`, `forms` | marketing/frontline plugins | Drop from core | — |
| `core-ui` shell (`CoreTab`, `AppLayout`, plugin loading) | `apps/core-ui/src/modules/{app,navigation,plugins}` | Rewrite, same UX | Done |
| `core-ui` contacts (customers, leads, companies) | `apps/core-ui/src/modules/contacts` | Rewrite on REST, same UX | Done (side panel without activity yet) |
| `core-ui` settings › team members | `apps/core-ui/src/modules/settings/team-members` | Rewrite on REST, same UX | Done (no structure fields, permissions) |
| `libs/erxes-ui` | `packages/ui` | Copied; backward-compatible fixes only | Done |
| `core-api/modules/forms` fields (properties) | `core_fields` + `custom_fields` jsonb | Rewrite | Done (customers, companies) |
| `core-ui` create owner (`/create-owner`) | `/core/v1/setup` + `SetupPage` | Rewrite | Done |
