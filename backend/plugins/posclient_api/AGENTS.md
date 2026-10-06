# `posclient_api` Plugin Guide

## Identity

- **Plugin:** `posclient`
- **Project:** `posclient_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/posclient_api`
- **Last synchronized:** `2026-10-03`

## Scope

### Owns

- POS client GraphQL API, local POS config sync, POS users, orders, covers, reports, and POS runtime mutations.

### Does not own

- Sales POS settings UI, sales API persistence, shared core services, gateway routing, or other plugin data models.

## Current Capabilities

- Syncs and exposes `isShowRemainder` independently from stock validation.
- Authenticates POS users against POS client context.
- Serves POS client config, order, cover, user, and daily report GraphQL operations.
- Persists synced eBarimt receipt toggles, including `hasCopy`, `hasSumQty`,
  and `isCleanTaxPrice`, in POS client config.
- Serves POS product list and count queries with category, tag, price, remainder, discount, similarity, and product `propertiesData` filters.
- Calculates daily reports for authorized POS admins and cashiers with report permission.
- Persists order item `discountInfos` so pricing, loyalty/voucher, score, and direct/manual discounts keep their source, amount, and percent breakdown.

## Architecture

| Area             | Path                                                                                        | Responsibility                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| GraphQL reports  | `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/report.ts`   | Calculates daily POS report totals and product summaries.                                                      |
| GraphQL products | `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/products.ts` | Builds tenant-scoped POS product/category filters, sorting, counts, similarity grouping, and remainder checks. |
| GraphQL schemas  | `backend/plugins/posclient_api/src/modules/posclient/graphql/schemas`                       | Declares POS client GraphQL types and operations.                                                              |
| Config models    | `backend/plugins/posclient_api/src/modules/posclient/db`                                    | Stores synced POS client configuration and runtime data.                                                       |
| Discount utils   | `backend/plugins/posclient_api/src/modules/posclient/utils/discountInfos.ts`                | Merges automatic discount metadata with preserved manual `hand` discounts.                                     |
| Sync utilities   | `backend/plugins/posclient_api/src/modules/posclient/utils/syncUtils.ts`                    | Synchronizes sales POS configuration into POS client config.                                                   |

## Contracts

### Provides

- `dailyReport(posUserIds, dateType, startDate, endDate): DailyReport` GraphQL query.
- `poscProducts(..., propertiesData: String): [PoscProduct]` and `poscProductsTotalCount(..., propertiesData: String): Int` GraphQL queries.
- POS client GraphQL and tRPC contracts for order, cover, config, and user flows.
- `OrderItemInput`, `PosOrderItem`, and stored order items may include `discountInfos: JSON`.

### Consumes

- Synced `isShowRemainder`, `isCheckRemainder`, and `checkExcludeCategoryIds`
  from sales POS configuration.
- Loyalty `score.checkSpend` validates point payment amounts against the order
  total before payment completion.
- Synced POS config fields including `adminIds`, `cashierIds`, `token`, and `permissionConfig`.
- Synced eBarimt config fields including `hasCopy`, `hasSumQty`, and
  `isCleanTaxPrice`.
- Shared `erxes-api-shared` context, GraphQL, and date utility contracts.
- `erxes-api-shared/core-modules` property filtering: `withPropertyConditions`,
  `isPropertyPath`, `propertyFieldIdFromPath`, `propertyExistsFilter`,
  `propertyRegexFilter`. The plugin no longer keeps a local copy of the
  operator table or the condition parser.

## Data and State

- Tenant-scoped POS client collections are generated per `subdomain`.
- `Configs.permissionConfig.cashiers.seeReport` controls cashier access to `dailyReport`.
- Order item discounts store the aggregate `discountAmount`/`discountPercent` plus per-source `discountInfos`.
- Product `propertiesData` filters are encoded as `fieldId:operator:value` conditions separated by semicolons and are parsed by the shared property filter util; a `g:<groupId>/<fieldId>` key targets one row of a repeating group through `$elemMatch`.
- The hourly remainder repeatable job runs on `posclient-hourly-sync-remainder`; it dispatches tenant-scoped `posclient-sync-remainder` jobs that must include `subdomain`.

## Local Invariants

- `isShowRemainder` controls display remainder fetching and Erkhet remainder
  requests; `isCheckRemainder` controls order validation using synced per-token
  `isCheckRems` flags, which include category exclusions. Validation can fetch
  Core inventory balances with display disabled. `saveRemainder` controls
  remainder persistence and the existing hourly sync.
- POS client report queries must require a logged-in POS user.
- Cashiers may access `dailyReport` only when `permissionConfig.cashiers.seeReport` is true; admins remain allowed by `adminIds`.
- `poscProducts` and `poscProductsTotalCount` must share the same product filter builder so lists and counts stay consistent.
- Automatic pricing and loyalty/voucher recalculation must preserve existing `hand` discounts and replace only the matching automatic source entry.
- POS order item `unitPrice` is stored after discounts; discount base
  calculations must reconstruct the pre-discount base as
  `count * unitPrice + discountAmount`.

## Validation

- `pnpm nx build posclient_api`
- POS remainder smoke scenario: show-only loads stock without blocking orders;
  check-only validates Core balances with display disabled; category-excluded
  products bypass validation; enabling `saveRemainder` persists fetched stock.
- POS report smoke scenario: as a cashier without `seeReport`, `dailyReport` returns permission denied; after enabling it, the same cashier can fetch the report.
- POS product smoke scenario: querying `poscProducts(propertiesData: "<fieldId>:eq:<value>")` and `poscProductsTotalCount` returns the same filtered product set/count.
