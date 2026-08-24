# `posclient_api` Plugin Guide

## Identity

- **Plugin:** `posclient`
- **Project:** `posclient_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/posclient_api`
- **Last synchronized:** `2026-08-24`

## Scope

### Owns

- POS client GraphQL API, local POS config sync, POS users, orders, covers, reports, and POS runtime mutations.

### Does not own

- Sales POS settings UI, sales API persistence, shared core services, gateway routing, or other plugin data models.

## Current Capabilities

- Authenticates POS users against POS client context.
- Serves POS client config, order, cover, user, and daily report GraphQL operations.
- Serves POS product list and count queries with category, tag, price, remainder, discount, similarity, and product `propertiesData` filters.
- Similarity-aware POS searches return the starred representative when any
  product in that similarity group matches, while preserving standalone
  product matches.
- Calculates daily reports for authorized POS admins and cashiers with report permission.

## Architecture

| Area | Path | Responsibility |
| ---- | ---- | -------------- |
| GraphQL reports | `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/report.ts` | Calculates daily POS report totals and product summaries. |
| GraphQL products | `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/products.ts` | Builds tenant-scoped POS product/category filters, sorting, counts, similarity grouping, and remainder checks. |
| GraphQL schemas | `backend/plugins/posclient_api/src/modules/posclient/graphql/schemas` | Declares POS client GraphQL types and operations. |
| Config models | `backend/plugins/posclient_api/src/modules/posclient/db` | Stores synced POS client configuration and runtime data. |
| Sync utilities | `backend/plugins/posclient_api/src/modules/posclient/utils/syncUtils.ts` | Synchronizes sales POS configuration into POS client config. |

## Contracts

### Provides

- `dailyReport(posUserIds, dateType, startDate, endDate): DailyReport` GraphQL query.
- `poscProducts(..., propertiesData: String): [PoscProduct]` and `poscProductsTotalCount(..., propertiesData: String): Int` GraphQL queries.
- POS client GraphQL and tRPC contracts for order, cover, config, and user flows.

### Consumes

- Synced POS config fields including `adminIds`, `cashierIds`, `token`, and `permissionConfig`.
- Shared `erxes-api-shared` context, GraphQL, and date utility contracts.

## Data and State

- Tenant-scoped POS client collections are generated per `subdomain`.
- `Configs.permissionConfig.cashiers.seeReport` controls cashier access to `dailyReport`.
- Product `propertiesData` filters are encoded as `fieldId:operator:value` conditions separated by semicolons and are applied to `Products.propertiesData.<fieldId>`.

## Local Invariants

- POS client report queries must require a logged-in POS user.
- Cashiers may access `dailyReport` only when `permissionConfig.cashiers.seeReport` is true; admins remain allowed by `adminIds`.
- `poscProducts` and `poscProductsTotalCount` must share the same product filter builder so lists and counts stay consistent.
- Similarity-aware searches must resolve groups from the ungrouped match set;
  filtering to star product ids before searching hides groups whose non-starred
  variant is the only match.

## Validation

- `pnpm nx build posclient_api`
- POS report smoke scenario: as a cashier without `seeReport`, `dailyReport` returns permission denied; after enabling it, the same cashier can fetch the report.
- POS product smoke scenario: querying `poscProducts(propertiesData: "<fieldId>:eq:<value>")` and `poscProductsTotalCount` returns the same filtered product set/count.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-24` — `Preserve similarity groups in POS search`

- **Summary:** POS product search now returns a group's starred representative
  when any variant in that group matches the search.
- **Affected areas:** `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/products.ts`
- **Contracts changed:** `poscProducts` and `poscProductsTotalCount`
  similarity-search semantics now collapse matching groups to their starred
  products.

### `2026-08-23` — `Filter POS products by properties`

- **Summary:** Added backend `propertiesData` filtering to POS product list and count queries.
- **Affected areas:** `backend/plugins/posclient_api/src/modules/posclient/graphql/schemas/product.ts`, `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/products.ts`
- **Contracts changed:** `poscProducts` and `poscProductsTotalCount` now accept `propertiesData: String`.

### `2026-08-12` — `Guard cashier reports`

- **Summary:** Restricted `dailyReport` to POS admins or cashiers with `permissionConfig.cashiers.seeReport`.
- **Affected areas:** `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/report.ts`
- **Contracts changed:** `dailyReport` now enforces `permissionConfig.cashiers.seeReport` for cashier users.
