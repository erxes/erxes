# `posclient_api` Plugin Guide

## Identity

- **Plugin:** `posclient`
- **Project:** `posclient_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/posclient_api`
- **Last synchronized:** `2026-10-08`

## Scope

### Owns

- POS client GraphQL API, local POS config sync, POS users, orders, covers, reports, and POS runtime mutations.

### Does not own

- Sales POS settings UI, sales API persistence, shared core services, gateway routing, or other plugin data models.

## Current Capabilities

- Order audit events have independent `source` and `action` fields: new backend
  logs use `source: order`, cart logs use `source: cart`, and operations are
  `create`, `update`, `cancel`, or `return`. Order creation includes its items
  in one event; cart removals/reductions use `update` with `itemActions` details.
- Cancels unpaid orders without successful eBarimt, even when synced, retaining
  card/mobile and prepaid-payment safeguards. Synced cancellation requires
  sales acknowledgement before local order/item/failed-receipt cleanup.
- Keeps returned orders, their items, original receipts and return attempts;
  a failed fiscal return never marks the order returned. Cancellation and
  return changes are recorded in POS-local audit logs.
- Syncs and exposes `isShowRemainder` independently from stock validation.
- Authenticates POS users against POS client context.
- Serves POS client config, order, cover, user, and daily report GraphQL operations.
- Stores order and order-item change logs inside POS client data and exposes
  them only to POS admins. Order edits and order/item status changes capture
  previous and resulting values together.
- Records client-reported cart item removals and quantity reductions even
  before an order is first saved, with cart/event IDs, acting POS user,
  action time, receipt time, full item snapshots, and item-specific actions.
- Persists synced eBarimt receipt toggles, including `hasCopy`, `hasSumQty`,
  and `isCleanTaxPrice`, in POS client config.
- Serves POS product list and count queries with category, tag, price, remainder, discount, similarity, and product `propertiesData` filters.
- Calculates daily reports for authorized POS admins and cashiers with report permission.
- Persists order item `discountInfos` so pricing, loyalty/voucher, score, and direct/manual discounts keep their source, amount, and percent breakdown.
- Adds POS order payments through atomic cash increments and paid-amount pushes so concurrent order updates do not overwrite recorded card payments.

## Architecture

| Area               | Path                                                                                        | Responsibility                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| GraphQL reports    | `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/report.ts`   | Calculates daily POS report totals and product summaries.                                                            |
| GraphQL products   | `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/products.ts` | Builds tenant-scoped POS product/category filters, sorting, counts, similarity grouping, and remainder checks.       |
| GraphQL schemas    | `backend/plugins/posclient_api/src/modules/posclient/graphql/schemas`                       | Declares POS client GraphQL types and operations.                                                                    |
| Config models      | `backend/plugins/posclient_api/src/modules/posclient/db`                                    | Stores synced POS client configuration and runtime data.                                                             |
| Order logs         | `backend/plugins/posclient_api/src/modules/posclient/db/models/OrderChangeLogs.ts`          | Persists POS client order and item change snapshots.                                                                 |
| Order snapshots    | `backend/plugins/posclient_api/src/modules/posclient/utils/orderChangeLogs.ts`              | Compares persisted order fields and sorted item snapshots, excluding item creation timestamps and Mongo metadata.    |
| Order cancellation | `backend/plugins/posclient_api/src/modules/posclient/utils/cancelOrder.ts`                  | Validates cancellation, requires sales acknowledgement when synced, and cleans local order/item/receipt data.        |
| Order return       | `backend/plugins/posclient_api/src/modules/posclient/utils/returnOrder.ts`                  | Runs authenticated admin returns, validates payment totals, preserves the order, records audit, publishes and syncs. |
| Order payment      | `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/mutations/orders.ts` | Validates and records POS order payments, then syncs prepaid orders to sales when required.                          |
| Order receipts     | `backend/plugins/posclient_api/src/modules/posclient/utils/orderReceipts.ts`                | Shared POS receipt selector, success/unresolved checks, and validated fiscal return responses.                       |
| Discount utils     | `backend/plugins/posclient_api/src/modules/posclient/utils/discountInfos.ts`                | Merges automatic discount metadata with preserved manual `hand` discounts.                                           |
| Sync utilities     | `backend/plugins/posclient_api/src/modules/posclient/utils/syncUtils.ts`                    | Synchronizes sales POS configuration into POS client config.                                                         |

## Contracts

### Provides

- `dailyReport(posUserIds, dateType, startDate, endDate): DailyReport` GraphQL query.
- `orderChangeLogs(orderId, orderNumber, source, userId, startDate, endDate, page, perPage): [OrderChangeLog]`
  GraphQL query for POS admins; omitting `orderId` includes unsaved carts.
  `source` accepts `cart` or `order`; `order` includes backend logs whose
  source is unset. Order ID, source, user, and action-date filters combine.
  The audit page searches by a trimmed, case-insensitive literal substring of
  the order number; regex metacharacters are escaped. The API resolves all
  matching order IDs within the current POS/sub-token scope. `orderId` remains
  available for order-detail history queries.
- `posclientCartChangeLogCreate(doc: PosclientCartChangeLogInput!): OrderChangeLog`
  accepts authenticated client-reported removals/reductions, validates their
  snapshots, and deduplicates retries by POS token and event ID.
- `poscProducts(..., propertiesData: String): [PoscProduct]` and `poscProductsTotalCount(..., propertiesData: String): Int` GraphQL queries.
- POS client GraphQL and tRPC contracts for order, cover, config, and user flows.
- `OrderItemInput`, `PosOrderItem`, and stored order items may include `discountInfos: JSON`.

### Consumes

- Internal sales `pos.cancelOrder({_id, posToken, userId?})` returns
  `{cancelled: true}` only after token-scoped cancellation; failures propagate.
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
- Order change logs are stored in `posclient_order_change_logs` with
  `orderId`, `posToken`, `userId`, `createdAt`, and per-field old/new values.
  The `items` field contains complete before/after item snapshots, including
  additions, removals, quantity, price, discounts, and item status changes.
- Client cart logs use `source: cart`, optional `orderId`, `cartId`, `eventId`,
  `occurredAt` (client-reported action time), and `createdAt` (server receipt
  time). `itemActions` names removed/reduced items and their before/after counts.
  The POS frontend persists a retry outbox tied to the acting user and POS;
  unsent actions remain pending until that user is authenticated on that POS.
- `orderId` references a persisted order; `cartId` groups actions for one draft
  cart or uses `order:<orderId>` for a saved order. `eventId` identifies one
  client action and remains unchanged across retries. Backend order-change
  logs use `source: order`; client cart events use `source: cart`. Historical
  logs may lack `source` or `action`; no speculative backfill is performed.
- `OrderChangeLog.user` resolves the acting `userId` from tenant-scoped
  `PosUsers` and is registered in the runtime Apollo resolver map at
  `src/apollo/resolvers/index.ts`; custom resolver definitions alone do not
  register fields with the running service.
- `OrderChangeLog.orderNumber` resolves the POS-scoped order number, falling
  back to the cancellation snapshot for deleted orders, including their earlier
  events. Missing numbers remain null; IDs are never presented as numbers.
- `Configs.permissionConfig.cashiers.seeReport` controls cashier access to `dailyReport`.
- Order item discounts store the aggregate `discountAmount`/`discountPercent` plus per-source `discountInfos`.
- Product `propertiesData` filters are encoded as `fieldId:operator:value` conditions separated by semicolons and are parsed by the shared property filter util; a `g:<groupId>/<fieldId>` key targets one row of a repeating group through `$elemMatch`.
- The hourly remainder repeatable job runs on `posclient-hourly-sync-remainder`; it dispatches tenant-scoped `posclient-sync-remainder` jobs that must include `subdomain`.

## Local Invariants

- GraphQL `ordersReturn` delegates to `returnPosOrder`; payment, permission,
  receipt and sync logic belongs to the service, not the resolver. Receipt
  selectors/checks are shared with cancellation through `orderReceipts.ts`.
- Cancellation snapshots are written through `saveOrderCancellationSnapshot`
  and retain the full original order plus normalized item values in one event.
  Snapshot readers may reuse an already loaded order to avoid a second read.
- New audit writes must specify an operation action. `source` identifies
  origin, never the operation. Unchanged update snapshots create no event.
- Non-array eBarimt return results throw `TypeError` with the reported message
  before updating order payment or return status.
- Any order with `paidDate` must be returned, never cancelled, even without
  eBarimt or with `billType: '9'` (internal/temporary receipt). Receipt type
  alone does not close an unpaid draft; non-fiscal returns need no eBarimt config.
- Any successful receipt, including inactive originals and return rows,
  forbids deletion. Unresolved receipt requests must be reconciled first.
- eBarimt return failure leaves order payment/status unchanged. Successful
  returns mark originals inactive, preserve return rows, and mark the order
  unsynced so normal sync can retry if immediate sales sync fails.
- Cancel cleanup deletes only non-successful POS-local `put_responses`;
  audit snapshots survive deletion. Mongolian receipt copies are not owned here.
- `isShowRemainder` controls display remainder fetching and Erkhet remainder
  requests; `isCheckRemainder` controls order validation using synced per-token
  `isCheckRems` flags, which include category exclusions. Validation can fetch
  Core inventory balances with display disabled. `saveRemainder` controls
  remainder persistence and the existing hourly sync.
- POS client report queries must require a logged-in POS user.
- `orderChangeLogs` must require a logged-in POS admin, filter by the current
  POS token, and verify any existing specified order belongs to the POS/sub-token scope.
  Removed orders remain searchable through POS-owned logs; unknown IDs return
  an empty list. Orders belonging to another POS return no entries.
  List requests are bounded to 100 entries per page.
- Cart log actor and POS token come from authenticated context; submitted
  actor IDs must match. Client timestamps are reported data, not trusted server
  receipt times. Snapshots are limited to 500 items and 512 KiB per event.
- Cashiers may access `dailyReport` only when `permissionConfig.cashiers.seeReport` is true; admins remain allowed by `adminIds`.
- `poscProducts` and `poscProductsTotalCount` must share the same product filter builder so lists and counts stay consistent.
- Automatic pricing and loyalty/voucher recalculation must preserve existing `hand` discounts and replace only the matching automatic source entry.
- POS order item `unitPrice` is stored after discounts; discount base
  calculations must reconstruct the pre-discount base as
  `count * unitPrice + discountAmount`.
- Order payment mutations must append paid amounts and increment cash atomically; do not rebuild payment fields from a stale order snapshot.

## Validation

- Audit action smoke: create, edit, cancel and return an order; each event has
  the matching action and `source: order`. Cart removals/reductions have
  `source: cart`, `action: update` and item-specific details. Admin audit UI
  displays the action and keeps action-less historical entries readable.
- `pnpm nx build posclient_api`
- `node --test backend/plugins/posclient_api/src/modules/posclient/utils/__tests__/cancelOrder.test.cjs`
- `node --test backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/customResolvers/__tests__/orderChangeLog.test.cjs`
- Audit number smoke: existing and cancelled orders show their order number;
  unsaved carts and logs without a recoverable number do not display an ID
  as a number. Earlier events use the POS-owned cancellation snapshot after deletion.
- Cancellation/return smoke: cancel a synced unpaid order with only failed
  receipts; verify sales acknowledgement precedes local cleanup. Reject
  deletion for successful/unresolved receipts. A failed receipt return must
  retain the original payment/status; successful and retried returns must
  preserve original receipts, return attempts, items, and acting-user logs.
- Paid-order smoke: both local and sales cancellation reject orders with
  `paidDate`, including closed internal receipts without eBarimt; recording
  a non-fiscal return preserves the order with `status: return` and audit data.
- POS remainder smoke scenario: show-only loads stock without blocking orders;
  check-only validates Core balances with display disabled; category-excluded
  products bypass validation; enabling `saveRemainder` persists fetched stock.
- POS report smoke scenario: as a cashier without `seeReport`, `dailyReport` returns permission denied; after enabling it, the same cashier can fetch the report.
- POS product smoke scenario: querying `poscProducts(propertiesData: "<fieldId>:eq:<value>")` and `poscProductsTotalCount` returns the same filtered product set/count.
- POS order change log smoke scenario: changing a paid order's due date,
  branch, delivery info, or description creates a POS-local log entry; a
  cashier receives permission denied for `orderChangeLogs`, while an admin can
  read the entry. Editing order items (add/remove, quantity, price, discount)
  records both item snapshots and affected order totals in one entry; changing
  order/item status also records the resulting item values. Unchanged values
  do not create a log entry.
- Cart audit smoke scenario: without saving an order, reduce/remove a selected
  product or discard the cart; admins can filter logs by actor and action date
  and inspect full before/after lists. Cashiers can create their own audit
  events but cannot read logs. Repeated event IDs produce one log; cross-user
  submissions and cross-POS order references are rejected.
- Audit events can retain references to orders that were removed before an
  offline event was delivered; an existing referenced order must belong to
  the current POS or sub-token scope.
- Audit filter smoke scenario: filter by order number and `source: cart` or
  `source: order` together with user/date filters; unset-source backend entries
  appear under `order`. Clearing filters resets pagination to the first page.
