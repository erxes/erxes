# `posclient_api` Plugin Guide

## Identity

- **Plugin:** `posclient`
- **Project:** `posclient_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/posclient_api`
- **Last synchronized:** `2026-10-06`

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
- Order items keep an optional `conditionId` (the core product condition a unit is sold under; saved by ordersAdd/Edit and the order-utils item writer, passed to loyalty `checkPricing`, synced to sales). Synced products keep core's `conditionGroupId` (schema field; products synced before it existed need a re-sync), and `PosOrderItem.conditionGroupId` resolves it from the product.
- Shows the cashier the order's chosen customer's loyalty: `poscCustomerLoyalty` passes loyalty's `ownerSummary` through (wallets, tiers, sale vouchers); null when loyalty is not running.
- Lets POS admins, and cashiers with `permissionConfig.cashiers.createCustomer`,
  register Core customers through the synced `customerCreateConfig` layout.
- Persists order item `discountInfos` so pricing, loyalty/voucher, score, and direct/manual discounts keep their source, amount, and percent breakdown.

## Architecture

| Area             | Path                                                                                        | Responsibility                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| GraphQL reports  | `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/report.ts`   | Calculates daily POS report totals and product summaries.                                                      |
| GraphQL products | `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/products.ts` | Builds tenant-scoped POS product/category filters, sorting, counts, similarity grouping, and remainder checks. |
| GraphQL schemas  | `backend/plugins/posclient_api/src/modules/posclient/graphql/schemas`                       | Declares POS client GraphQL types and operations.                                                              |
| Config models    | `backend/plugins/posclient_api/src/modules/posclient/db`                                    | Stores synced POS client configuration and runtime data.                                                       |
| Discount utils   | `backend/plugins/posclient_api/src/modules/posclient/utils/discountInfos.ts`                | Merges automatic discount metadata with preserved manual `hand` discounts.                                     |
| Customer create  | `backend/plugins/posclient_api/src/modules/posclient/utils/customerCreate.ts`               | Resolves the POS customer form, filters input to the layout, validates, and finds duplicates.                  |
| Sync utilities   | `backend/plugins/posclient_api/src/modules/posclient/utils/syncUtils.ts`                    | Synchronizes sales POS configuration into POS client config.                                                   |

## Contracts

### Provides

- `dailyReport(posUserIds, dateType, startDate, endDate): DailyReport` GraphQL query.
- `poscProducts(..., propertiesData: String): [PoscProduct]` and `poscProductsTotalCount(..., propertiesData: String): Int` GraphQL queries.
- POS client GraphQL and tRPC contracts for order, cover, config, and user flows.
- `OrderItemInput`, `PosOrderItem`, and stored order items may include `discountInfos: JSON`.
- `poscCustomerForm: PosCustomerForm` returns `canCreate` and the resolved
  form `rows` (system fields plus live `core:customer` properties).
- `poscCustomerLoyalty(customerId: String!, totalAmount: Float): PosCustomerLoyalty` (logged-in POS user).
- `poscLoyaltyPreview(items, customerId, couponCode, voucherId): [PosLoyaltyPreviewLine]` runs the same `checkPricing` then `checkLoyalties` an order save runs, without saving, and returns each line's total discount percent and resulting `unitPrice` (display only; the saved order stays authoritative) keyed by the caller's line `key` (a product can sit on several lines under different conditions); bonus lines pricing adds are left out.
- `poscLoyaltyEarnPreview(items, totalAmount, customerId, orderType)` (`utils/loyaltyEarn.ts`) reads core tRPC `automation.findActive` for active `sales:pos.orders.event` automations with a loyalty Adjust score, keeps the triggers a paid order of this POS would start (event `paid` or unset, `posId`/`posToken` this POS or empty, order type if set; payment type and branches before the action are not evaluated), and asks loyalty `score.earnPreview` with the actions' `campaignId`/`earnRowKeys`, counting the whole total as paid. Returns `{ hasRules, earns: [{walletName, points, reasons, error}] }`; without a customer only `hasRules`. Lookups use `throwOnError` so a broken preview shows instead of a silent zero.
- `poscProductConditionGroups(ids)` reads core's product condition groups (core tRPC `productConditionGroups.find`) so a cart line can pick a condition.
- `poscCouponCheck(code: String!, customerId: String, totalAmount: Float): String` runs loyalty `coupon.checkCoupon` with `throwOnError` and returns the campaign title, so the cashier sees a refused code before it reaches the order.
- `poscCustomersAdd(doc: JSON!): PosCustomerAddResult` returns either the
  created `customer` or an existing `duplicate` (same e-mail, phone, or code).

### Consumes

- Synced `isShowRemainder`, `isCheckRemainder`, and `checkExcludeCategoryIds`
  from sales POS configuration.
- Loyalty `score.checkSpend` validates point payment amounts against the order
  total before payment completion.
- Synced POS config fields including `adminIds`, `cashierIds`, `token`, `permissionConfig`, and `customerCreateConfig`.
- Loyalty tRPC `loyalty.ownerSummary` and `coupon.checkCoupon`.
- Core tRPC `fields.find`, `customers.findActiveCustomers`, and
  `customers.createCustomer`.
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
- `checkLoyalties` sends loyalty `undefined`, never `null`, for an unchosen `couponCode`/`voucherId`: loyalty's zod input rejects null and the swallowed error would drop every loyalty discount.
- `sendTRPCMessage` swallows errors unless `throwOnError` is set; a check whose failure must reach the cashier (like `poscCouponCheck`) passes it.
- Cashiers may access `dailyReport` only when `permissionConfig.cashiers.seeReport` is true; admins remain allowed by `adminIds`.
- `poscCustomersAdd` sends Core only fields placed in `customerCreateConfig.layout`, requires e-mail or phone, and always sets `state: 'customer'`, `createdVia: { source: 'pos', sourceId: posId, sourceName: posName, actorId: posUserId }` (the `schemaWrapper` provenance field; no core change); `ownerId` is the POS user only when `assignCashierAsOwner` is on. No offline queue: Core must be reachable.
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
- POS customer smoke scenario: as a cashier with `createCustomer`, `poscCustomerForm.canCreate` is true; `poscCustomersAdd` with a new phone creates a customer with `createdVia.sourceId` = POS id; repeating it returns `duplicate` instead.
- POS product smoke scenario: querying `poscProducts(propertiesData: "<fieldId>:eq:<value>")` and `poscProductsTotalCount` returns the same filtered product set/count.
