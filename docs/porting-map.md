# Porting map: old erxes → new core

What happens to each old core module. "Port" means bring the logic and its tests and rewrite
data access. "Rewrite" means a new design. "Drop" means it is not in core.

| Old (erxes `main`)                                                                | New                                                       | How                                              | Status                                            |
| --------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| `core-api/modules/organization` (team members)                                    | `modules/users`                                           | Rewrite (roles simplified to owner/admin/member) | Done                                              |
| `core-api/modules/auth` (login, 2FA, `staffLogin.ts`)                             | `modules/auth`                                            | Port                                             | Done (password, TOTP 2FA)                         |
| `core-api/modules/auth/routes/oauth/*` (authorize, token, JWKS, platform clients) | `modules/oauth`, `lib/signing.ts`                         | Port                                             | Done                                              |
| `core-api/modules/organization/identity`                                          | `core_organizations` + `modules/saas`                     | Rewrite                                          | Done                                              |
| `core-api/modules/contacts` (customers, companies)                                | `modules/customers`, `modules/companies`, `modules/leads` | Rewrite; port dedupe/merge rules                 | Done (links, merge, lead stages)                  |
| `core-api/modules/tags`                                                           | `core_tags` + `core_customer_tags` / `core_company_tags`  | Rewrite (join tables)                            | Done                                              |
| `core-api/modules/files`                                                          | `modules/files`                                           | Port storage adapters                            | Done (S3)                                         |
| `core-api/modules/notifications`, `emailTemplates`                                | `modules/notifications`, `modules/email`                  | Port senders, templates                          | Done                                              |
| payment plugin (QPay …)                                                           | `modules/payments`, `packages/payment-gateways`           | Port provider integrations                       | Done (QPay; others todo)                          |
| `core-api/modules/logs`, `services/logs`                                          | `core_events`, `core_activities`, `modules/audit`         | Rewrite                                          | Done                                              |
| `core-api/modules/automations`, `services/automations`                            | `modules/automations`                                     | Rewrite; keep node schemas + preflight ideas     | Done                                              |
| `core-api/modules/permissions`                                                    | plugin access + seats, `modules/roles`                    | Rewrite                                          | Done                                              |
| `core-api/modules/products`                                                       | None (Commerce plugin owns its catalog)                   | Drop                                             | n/a                                               |
| `core-api/modules/segments`                                                       | facts-based segments (later)                              | Rewrite later                                    | n/a                                               |
| `core-api/modules/broadcast`, `forms`                                             | marketing/frontline plugins                               | Drop from core                                   | n/a                                               |
| `core-ui` shell (`CoreTab`, `AppLayout`, plugin loading)                          | `apps/core-ui/src/modules/{app,navigation,plugins}`       | Rewrite, same UX                                 | Done                                              |
| `core-ui` contacts (customers, leads, companies)                                  | `apps/core-ui/src/modules/contacts`, `leads`              | Rewrite on oRPC, same UX                         | Done (side panel with activity)                   |
| `core-ui` settings                                                                | `apps/core-ui/src/modules/settings`                       | Rewrite on oRPC, same UX                         | Done (team members, roles, payments, audit log …) |
| `libs/erxes-ui`                                                                   | `packages/ui`                                             | Copied, then cleaned up in place                 | Done (unused modules, Apollo and dayjs removed)   |
| `core-api/modules/forms` fields (properties)                                      | `core_fields` + `custom_fields` jsonb                     | Rewrite                                          | Done (customers, companies)                       |
| `core-ui` create owner (`/create-owner`)                                          | `/core/v1/setup` + `SetupPage`                            | Rewrite                                          | Done                                              |

Paths without a prefix are under `apps/core-api/src`.
