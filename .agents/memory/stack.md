# Stack & Versions

> Canonical reference for what's installed and which port belongs to what.

## Runtime

| Thing | Version |
|---|---|
| Node.js | 18.16.9+ |
| pnpm | 9.12.3+ (REQUIRED — package.json `engines`) |
| TypeScript | 5.7.3 |
| Nx | 20.0.8 |

## Backend

| Thing | Version | Notes |
|---|---|---|
| Express | latest | HTTP framework |
| Apollo Server | v4 | GraphQL |
| @apollo/subgraph | latest | Federation |
| tRPC | v11 | Type-safe RPC |
| Mongoose | 8.13.2 | MongoDB ODM |
| ioredis | latest | Redis client |
| BullMQ | 5.40.0 | Job queue |
| Elasticsearch | 7 | Optional search |
| graphql-redis-subscriptions | latest | GraphQL subs |
| jsonwebtoken | latest | JWT auth |
| WorkOS | latest | SSO |

## Frontend

| Thing | Version | Notes |
|---|---|---|
| React | 18.3.1 | |
| Rspack | 1.0.5 | Bundler (Webpack-compatible, Rust-based) |
| @module-federation/enhanced | 0.6.6 | Module Federation |
| TailwindCSS | 4.1.17 | |
| Radix UI | latest | Component primitives (via `erxes-ui`) |
| Jotai | latest | Atomic state |
| Apollo Client | latest | GraphQL client |
| React Router | v7 | Routing |
| React Hook Form | latest | Forms |
| Zod | latest | Schema validation |
| react-i18next | latest | i18n |
| Blocknote | latest | Rich text editor |
| @tabler/icons-react | latest | Icons |
| Recharts | latest | Charts |

## Apps (standalone)

- `apps/client-portal-template/` — Next.js 16, customer portal
- `apps/posclient-front/` — Next.js 14, POS client (PWA)
- `apps/frontline-widgets/` — Customer-facing widgets

## Ports (canonical)

| Service | Port |
|---|---|
| Gateway | 4000 |
| Core API | 3300 |
| Core UI (host) | 3001 |
| **sales_api** | **3305** |
| operation_api | 3306 |
| frontline_api | 3307 (varies) |
| accounting_api | 3308+ |
| content_api | 3309+ |
| ... | (see plugin's project.json) |
| **sales_ui** | **3005** |
| operation_ui | 3006 |
| BullMQ Board | `4000/bullmq-board` |

**Do not invent new ports.** Check each plugin's `project.json` for the authoritative port.

## Required env vars

```bash
MONGO_URL=mongodb://localhost:27017/erxes
REDIS_HOST=localhost
REDIS_PORT=6379
ENABLED_PLUGINS=operation,sales,frontline   # comma-separated
DOMAIN=http://localhost:3000
REACT_APP_API_URL=http://localhost:4000
DISABLE_CHANGE_STREAM=true                  # dev only
```

Optional: `SAAS_MODE=true`

## Adding a dependency

```bash
# Backend plugin
pnpm --filter <plugin>_api add <package>

# Frontend plugin
pnpm --filter <plugin>_ui add <package>

# Shared lib (use sparingly)
pnpm --filter erxes-api-shared add <package>
```

**Never** `npm` or `yarn`. **Never** edit `package.json` directly to add a dep — let pnpm resolve.

Before adding: check if the dep already exists at a different version elsewhere in the monorepo. Version drift across plugins is a slow-burn pain.
