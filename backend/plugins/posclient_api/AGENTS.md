# `posclient_api` Plugin Guide

## Identity

- **Plugin:** `posclient`
- **Project:** `posclient_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/posclient_api`
- **Last synchronized:** `2026-08-12`

## Scope

### Owns

- POS client GraphQL API, local POS config sync, POS users, orders, covers, reports, and POS runtime mutations.

### Does not own

- Sales POS settings UI, sales API persistence, shared core services, gateway routing, or other plugin data models.

## Current Capabilities

- Authenticates POS users against POS client context.
- Serves POS client config, order, cover, user, and daily report GraphQL operations.
- Calculates daily reports for authorized POS admins and cashiers with report permission.

## Architecture

| Area | Path | Responsibility |
| ---- | ---- | -------------- |
| GraphQL reports | `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/report.ts` | Calculates daily POS report totals and product summaries. |
| GraphQL schemas | `backend/plugins/posclient_api/src/modules/posclient/graphql/schemas` | Declares POS client GraphQL types and operations. |
| Config models | `backend/plugins/posclient_api/src/modules/posclient/db` | Stores synced POS client configuration and runtime data. |
| Sync utilities | `backend/plugins/posclient_api/src/modules/posclient/utils/syncUtils.ts` | Synchronizes sales POS configuration into POS client config. |

## Contracts

### Provides

- `dailyReport(posUserIds, dateType, startDate, endDate): DailyReport` GraphQL query.
- POS client GraphQL and tRPC contracts for order, cover, config, and user flows.

### Consumes

- Synced POS config fields including `adminIds`, `cashierIds`, `token`, and `permissionConfig`.
- Shared `erxes-api-shared` context, GraphQL, and date utility contracts.

## Data and State

- Tenant-scoped POS client collections are generated per `subdomain`.
- `Configs.permissionConfig.cashiers.seeReport` controls cashier access to `dailyReport`.

## Local Invariants

- POS client report queries must require a logged-in POS user.
- Cashiers may access `dailyReport` only when `permissionConfig.cashiers.seeReport` is true; admins remain allowed by `adminIds`.

## Validation

- `pnpm nx build posclient_api`
- POS report smoke scenario: as a cashier without `seeReport`, `dailyReport` returns permission denied; after enabling it, the same cashier can fetch the report.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-12` — `Guard cashier reports`

- **Summary:** Restricted `dailyReport` to POS admins or cashiers with `permissionConfig.cashiers.seeReport`.
- **Affected areas:** `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/report.ts`
- **Contracts changed:** `dailyReport` now enforces `permissionConfig.cashiers.seeReport` for cashier users.
