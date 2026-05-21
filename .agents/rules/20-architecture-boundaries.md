# 20 — Architecture Boundaries

> The shape of the erxes monorepo. Violating these boundaries is the single biggest source of silent regressions.

## The diagram

```
                  [ API Gateway :4000 ]                     [ Core UI :3001 ]
                  Apollo Router + service discovery         Module Federation HOST
                          │                                        │
       ┌──────────────────┼─────────────────────┐     ┌────────────┼──────────────┐
       ▼                  ▼                     ▼     ▼            ▼              ▼
 [ core-api :3300 ]  [ sales_api :3305 ]  [ <plugin>_api ]  [ sales_ui :3005 ] [ <plugin>_ui ]
                            │                                        │
                            ├── GraphQL (Apollo Federation) ─────────┘
                            ├── tRPC v11
                            ├── Express REST routes
                            └── BullMQ (Redis)
```

## Three legal cross-plugin paths

| Path | When to use | How |
|---|---|---|
| **GraphQL Federation** | Cross-plugin reads, composed objects | `@key(fields: "_id")` on owned types; reference other plugins' types with `@external` |
| **tRPC** | Cross-plugin RPC with type safety | Plugin registers a router in `src/trpc/`; other plugins call via gateway proxy at `/trpc/` |
| **Redis pubsub / BullMQ** | Async events, fire-and-forget | `graphql-redis-subscriptions` for live data; BullMQ for background jobs |

## The illegal path: direct import across plugins

**NEVER:**
```ts
// ❌ from sales_api
import { Task } from '../../operation_api/src/modules/task/models/Task';
```

Plugins are independently deployable microservices. Direct imports create implicit coupling that breaks at runtime and bypasses subdomain isolation.

**If you need data from another plugin:** use one of the three legal paths above. If the integration is novel, escalate to a design discussion before coding.

## erxes-api-shared

`backend/erxes-api-shared/` is a **library**, built to `dist/`. All backend services import from `erxes-api-shared/*` (which resolves to its built dist).

- **Editing `erxes-api-shared`?** Run `pnpm nx build erxes-api-shared` before testing any dependent service.
- **CI builds it first** before any plugin (see any `.github/workflows/ci-plugin-*.yml`).
- **Don't put plugin-specific logic in it.** Only truly cross-cutting utilities, types, and core modules.

## Module Federation (frontend)

- **Host:** `core-ui` (port 3001)
- **Remotes:** `<plugin>_ui` (sales=3005, etc.)
- Each remote declares exposes in `module-federation.config.ts`
- **Shared core libraries** (`react`, `erxes-ui`, `@apollo/client`, `jotai`, `ui-modules`, …) are singletons across host + remotes
- **Plugin-specific deps stay inside the remote** — never auto-share something the host doesn't have

If a remote breaks `shared` config, the entire app fails to load. Touch `module-federation.config.ts` only if you know exactly what you're changing.

## Gateway dynamic routing

- Plugins register at startup via Redis (`joinErxesGateway`)
- Gateway routes:
  - GraphQL: composed via Apollo Federation
  - REST: proxied via `/pl:<service>/<path>`
  - tRPC: proxied via `/trpc/<path>`

A plugin that doesn't `joinErxesGateway` is invisible to the rest of the system, even if it's running.

## Service ports (canonical)

See [`../memory/stack.md`](../memory/stack.md) for the full port table. **Do not invent new ports.** If a plugin needs to run locally on a new port, update `stack.md` and ensure no collision.

## Common boundary violations to watch for

- Importing models from another plugin's `db/models/`
- Calling another plugin's internal service function directly (instead of via federation/tRPC)
- Sharing a Mongoose connection across plugins (each plugin uses its own connection, scoped by subdomain)
- Hard-coding another plugin's port (`http://localhost:3305`) instead of going through the gateway
