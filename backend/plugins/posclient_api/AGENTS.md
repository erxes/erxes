# `posclient_api` Plugin Guide

## Identity

- **Plugin:** `posclient`
- **Project:** `posclient_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/posclient_api`
- **Last synchronized:** `2026-09-13`

## Scope

### Owns

- POS client GraphQL API, local POS config sync, POS users, orders, covers, reports, and POS runtime mutations.

### Does not own

- Sales POS settings UI, sales API persistence, shared core services, gateway routing, or other plugin data models.

## Current Capabilities

- Authenticates POS users against POS client context.
- Serves POS client config, order, cover, user, and daily report GraphQL operations.
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

- Synced POS config fields including `adminIds`, `cashierIds`, `token`, and `permissionConfig`.
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

## Local Invariants

- POS client report queries must require a logged-in POS user.
- Cashiers may access `dailyReport` only when `permissionConfig.cashiers.seeReport` is true; admins remain allowed by `adminIds`.
- `poscProducts` and `poscProductsTotalCount` must share the same product filter builder so lists and counts stay consistent.
- Automatic pricing and loyalty/voucher recalculation must preserve existing `hand` discounts and replace only the matching automatic source entry.
- POS order item `unitPrice` is stored after discounts; discount base
  calculations must reconstruct the pre-discount base as
  `count * unitPrice + discountAmount`.

## Validation

- `pnpm nx build posclient_api`
- POS report smoke scenario: as a cashier without `seeReport`, `dailyReport` returns permission denied; after enabling it, the same cashier can fetch the report.
- POS product smoke scenario: querying `poscProducts(propertiesData: "<fieldId>:eq:<value>")` and `poscProductsTotalCount` returns the same filtered product set/count.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-13` — `Discount info type cleanup`

- **Summary:** POS discount info types now use a plain string with documented known values to avoid redundant literal-union Sonar warnings.
- **Affected areas:** `src/modules/posclient/utils/discountInfos.ts`
- **Contracts changed:** `None`

### `2026-09-13` — `Use POS discount base for hand discounts`

- **Summary:** POS discount calculations now treat stored `unitPrice` as post-discount, reconstruct the base from `unitPrice * count + discountAmount`, and remove zero-valued automatic discount infos.
- **Affected areas:** `src/modules/posclient/utils/{discountInfos.ts,directDiscount.ts,orderUtils.ts}`
- **Contracts changed:** `None`

### `2026-09-13` — `Persist POS discountInfos on item save`

- **Summary:** POS order item create/update mappings now carry calculated `discountInfos` through to storage so pricing discounts return to the frontend.
- **Affected areas:** `src/modules/posclient/graphql/resolvers/mutations/orders.ts`, `src/modules/posclient/utils/orderUtils.ts`
- **Contracts changed:** `None`

### `2026-09-12` — `Order item discount breakdowns`

- **Summary:** POS order items now persist `discountInfos` during order create/update and merge pricing, loyalty/voucher, and direct/manual discounts without losing the manual `hand` entry.
- **Affected areas:** `src/modules/posclient/{@types,db/definitions,graphql/schemas,utils}`, `src/modules/posclient/graphql/resolvers/mutations/orders.ts`
- **Contracts changed:** `OrderItemInput` and `PosOrderItem` may include `discountInfos: JSON`.

### `2026-09-05` — `Use the shared property filter util`

- **Summary:** Replaced the plugin's copied `propertiesData` operator table, condition parser, and path helpers with the shared implementation in `erxes-api-shared/core-modules`.
- **Affected areas:** `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/products.ts`, `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/cpProducts.ts`
- **Contracts changed:** `None` — the encoded filter string and resulting query are unchanged for plain fields.

### `2026-08-23` — `Filter POS products by properties`

- **Summary:** Added backend `propertiesData` filtering to POS product list and count queries.
- **Affected areas:** `backend/plugins/posclient_api/src/modules/posclient/graphql/schemas/product.ts`, `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/products.ts`
- **Contracts changed:** `poscProducts` and `poscProductsTotalCount` now accept `propertiesData: String`.

### `2026-08-12` — `Guard cashier reports`

- **Summary:** Restricted `dailyReport` to POS admins or cashiers with `permissionConfig.cashiers.seeReport`.
- **Affected areas:** `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/report.ts`
- **Contracts changed:** `dailyReport` now enforces `permissionConfig.cashiers.seeReport` for cashier users.
