# `posclient_api` Plugin Guide

## Identity

- **Plugin:** `posclient`
- **Project:** `posclient_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/posclient_api`
- **Last synchronized:** `2026-11-12`

## Scope

### Owns

- POS client GraphQL API, local POS config sync, POS users, orders, covers, reports, and POS runtime mutations.

### Does not own

- Sales POS settings UI, sales API persistence, shared core services, gateway routing, or other plugin data models.

## Current Capabilities

- Cover terminal fetches reserve an idempotent entry through
  `posclientCoverTerminalResultSave`, then complete it with the original response.
  Completed entries persist only in their payment detail's `terminalResults`; payment amount saves preserve
  terminal history. Cover deletion first archives the full cover and terminal
  history to `OrderChangeLogs` (`source: cover`, `action: delete`, `coverId`);
  an audit failure blocks deletion. `utils/coverChangeLogs.ts` owns snapshot archival
  and guarded deletion; a confirmed no-op removes only its newly inserted audit
  record, so concurrent edits do not leave false deletion events. Deletion compares raw payment snapshots through
  `$expr` so Mongoose defaults cannot prevent deleting older or pipeline-created
  rows, while concurrent terminal changes remain protected. Pending entries block publishing. Publishing locks the cover while Sales receives the
  complete per-payment terminal history. Cover reads/writes require the current POS and user scope.
- Prints its federated SDL through the shared `schema:print` Nx target for gateway composition and frontend codegen.

- The cashier's earn preview (`previewLoyaltyEarn`) counts the POS's own earning campaigns (`config.earnScoreCampaignId`, synced from the sales POS) first, then any active automation's Adjust score, one rule per campaign.

- `cpOrdersAdd` and `cpOrdersEdit` require client portal context and accept
  `customerType: visitor` without a logged-in portal user. Other customer
  types require an authenticated `cpUser`. All orders still run
  the existing POS order validation and tenant-scoped creation flow.
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
- Order items keep an optional `conditionCode` (code of the core product condition a unit is sold under; saved by ordersAdd/Edit and the order-utils item writer, passed to loyalty `checkPricing`, synced to sales). Synced products keep core's `conditionCodes` (schema field; products synced before it existed need a re-sync).
- Shows the cashier the order's chosen customer's loyalty: `poscCustomerLoyalty(customerId, totalAmount, orderId)` passes loyalty's `ownerSummary` through (wallets, tiers, sale vouchers with `status` / `heldFor`; `orderId` lets the voucher this order holds read as its own); null when loyalty is not running.
- A picked voucher is held for its order (`utils/orderVoucher.ts`): `ordersAdd` makes the order's `_id` ahead (nanoid) and calls loyalty `voucher.hold` before pricing, releasing it if the save fails; `ordersEdit` releases the voucher taken off and holds the one picked; `cancelPosOrder` calls `voucher.releaseTarget`. `checkLoyalties` sends the order id as `discountInfo.targetId`. Vouchers are online-only: when loyalty cannot be reached the save fails with "Vouchers need a connection to loyalty…", never silently.
- Lets POS admins, and cashiers with `permissionConfig.cashiers.createCustomer`,
  register Core customers through the synced `customerCreateConfig` layout.
- Persists order item `discountInfos` so pricing, loyalty/voucher, score, and direct/manual discounts keep their source, amount, and percent breakdown.
- Adds POS order payments through atomic cash increments and paid-amount pushes so concurrent order updates do not overwrite recorded card payments.
- Settles an order when its paid invoices cover the order total: `paymentCallbackClient` calls `updateMobileAmount`, which reads the POS from the stored order, records each invoice once, confirms the sale, and settles. An overpaid order settles too: `mobileAmounts` keeps what each invoice paid, while `mobileAmount` and the receipt stay at the order total. A repeated callback for a paid order changes nothing.

## Architecture

| Area             | Path                                                                                        | Responsibility                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| GraphQL reports  | `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/report.ts`   | Calculates daily POS report totals and product summaries.                                                      |
| GraphQL products | `backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/queries/products.ts` | Builds tenant-scoped POS product/category filters, sorting, counts, similarity grouping, and remainder checks. |
| GraphQL schemas  | `backend/plugins/posclient_api/src/modules/posclient/graphql/schemas`                       | Declares POS client GraphQL types and operations.                                                              |
| Config models    | `backend/plugins/posclient_api/src/modules/posclient/db`                                    | Stores synced POS client configuration and runtime data.                                                       |
| Cover terminal results | `backend/plugins/posclient_api/src/modules/posclient/utils/coverTerminalResults.ts` | Reserves and completes immutable fetch entries and atomically stores their responses in payment terminal results. |
| Discount utils   | `backend/plugins/posclient_api/src/modules/posclient/utils/discountInfos.ts`                | Merges automatic discount metadata with preserved manual `hand` discounts.                                     |
| Customer create  | `backend/plugins/posclient_api/src/modules/posclient/utils/customerCreate.ts`               | Resolves the POS customer form, filters input to the layout, validates, and finds duplicates.                  |
| Sync utilities   | `backend/plugins/posclient_api/src/modules/posclient/utils/syncUtils.ts`                    | Synchronizes sales POS configuration into POS client config.                                                   |
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

- `schema:print` writes ignored `generated/schema.graphql`; `gateway:schema:compose` includes POS client types and queries used by Sales through the default gateway client.

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
- `poscCustomerForm: PosCustomerForm` returns `canCreate` and the resolved
  form `rows` (system fields plus live `core:customer` properties).
- `poscCustomerLoyalty(customerId: String!, totalAmount: Float): PosCustomerLoyalty` (logged-in POS user).
- A pricing discount on a line is titled with the names of the loyalty plans behind it (`'Pricing discount'` when loyalty gives none) and keeps loyalty's `reasons` (plan, window, matched moment) in `discountInfos[].reasons` (`Mixed`), so a saved order still says why it was discounted. `poscLoyaltyPreview` lines carry the same `reasons`.
- `poscPricingSchedule(productIds, customerId, orderId): [PosPricingSchedule]` passes loyalty `pricing.scheduleStatus` for the cart's products, the POS branch and department, and the order's stored `createdAt` (looked up in the current POS/sub-token scope like the preview): which scheduled plans are open, closing (`endsAt`), next opening (`startsAt`) or closed earlier today (`endedAt`).
- `poscLoyaltyPreview(items, customerId, couponCode, voucherId, orderId): PosLoyaltyPreview { lines, bonuses }` runs the same `checkPricing` then `checkLoyalties` an order save runs, without saving. `lines` holds each line whose price changes, keyed by the caller's line `key` (a product can sit on several lines under different conditions), with its discount percent and resulting `unitPrice`; the percent is negative when the line costs more (a condition may give less than a `posBase` plan baked in at sync). `bonuses` are the bonus products pricing would append as new lines (`{productId, name, count}`, name from the synced product); bonuses remain separate even when their product is already in the cart. Display only; the saved order stays authoritative.
- `poscLoyaltyEarnPreview(items, totalAmount, customerId, orderType)` (`utils/loyaltyEarn.ts`) reads core tRPC `automation.findActive` for active `sales:pos.orders.event` automations with a loyalty Adjust score, keeps the triggers a paid order of this POS would start (event `paid` or unset, `posId`/`posToken` this POS or empty, order type if set; payment type and branches before the action are not evaluated), and asks loyalty `score.earnPreview` with the actions' `campaignId`/`earnRowKeys`, counting the whole total as paid. Returns `{ hasRules, earns: [{walletName, points, reasons, error}] }`; without a customer only `hasRules`. Lookups use `throwOnError` so a broken preview shows instead of a silent zero.
- `poscProductConditions(productId)` reads the synced product's `conditionCodes` and resolves them through core tRPC `productConditions.find` (codes with no condition are left out), so a cart line can pick one. Cart lines never keep the product's codes themselves; a stored copy went stale when conditions changed after the line was added.
- `poscCouponCheck(code: String!, customerId: String, totalAmount: Float): String` runs loyalty `coupon.checkCoupon` with `throwOnError` and returns the campaign title, so the cashier sees a refused code before it reaches the order. It refuses every code unless `config.acceptCoupons` (synced from the sales POS, off by default) is on.
- `poscCustomersAdd(doc: JSON!): PosCustomerAddResult` returns either the
  created `customer` or an existing `duplicate` (same e-mail, phone, or code).

### Consumes

- Internal sales `pos.cancelOrder({_id, posToken, userId?})` returns
  `{cancelled: true}` only after token-scoped cancellation; failures propagate.
- Synced `isShowRemainder`, `isCheckRemainder`, and `checkExcludeCategoryIds`
  from sales POS configuration.
- Loyalty `score.checkSpend` validates point payment amounts against the order
  total and the owner's balance before payment completion. It is called with
  `throwOnError`, so a refusal stops the payment instead of being swallowed.
- Synced POS config fields including `adminIds`, `cashierIds`, `token`, `permissionConfig`, and `customerCreateConfig`.
- Loyalty tRPC `loyalty.ownerSummary` and `coupon.checkCoupon`.
- Core tRPC `fields.find`, `customers.findActiveCustomers`, and
  `customers.createCustomer`.
- Core tRPC `segment.fetchSegment` (`{ segmentId, cursor?, limit? }` →
  `{ ids, nextCursor? }`); `segmentProductIds` pages on `nextCursor` until it
  is empty.
- Synced eBarimt config fields including `hasCopy`, `hasSumQty`, and
  `isCleanTaxPrice`.
- Shared `erxes-api-shared` context, GraphQL, and date utility contracts.
- `erxes-api-shared/core-modules` property filtering: `withPropertyConditions`,
  `isPropertyPath`, `propertyFieldIdFromPath`, `propertyExistsFilter`,
  `propertyRegexFilter`. The plugin no longer keeps a local copy of the
  operator table or the condition parser.

## Data and State

- Each cover payment detail (`details[]`, identified by unique `paidType`) retains `terminalResults` (`_id`, bank, server time, optional response).
  An absent response denotes a pending fetch. Terminal text is derived from
  these entries; payment details have no duplicate description fields.
  Cover-level `description` stays the general cover note, separate from payment history,
  and publish sends its latest saved value unchanged to Sales.
- A newly opened POS client cover is persisted with `status: draft`; it becomes
  `new` after its calculated amounts are saved. Drafts do not advance the
  previous-cover boundary in `coverAmounts` and cannot be published.
- The admin-only `orderChangeLogs(source: "cover")` query exposes cover deletion
  snapshots after the live cover is removed. Cover snapshots include dates, amounts,
  payment details, terminal results, and the deleting POS user.
- Tenant-scoped POS client collections are generated per `subdomain`.
- Order change logs are stored in `posclient_order_change_logs` with
  `orderId`, `posToken`, `userId`, `createdAt`, and per-field old/new values.
  The `items` field contains complete before/after item snapshots, including
  additions, removals, quantity, price, discounts, and item status changes.
- Order change logs, including deleted cover snapshots, expire 40 days after server `createdAt` through the
  single-field `createdAt_1` TTL index (`expireAfterSeconds: 3456000`). MongoDB
  removes expired rows asynchronously. Existing non-TTL `createdAt_1` indexes
  must be converted with `collMod` when deploying; schema declarations alone
  do not change existing index options. This also expires older existing logs.
- Client cart logs use `source: cart`, optional `orderId`, `cartId`, `eventId`,
  `occurredAt` (client-reported action time), and `createdAt` (server receipt
  time). `itemActions` names removed/reduced items and their before/after counts.
  The POS frontend persists a retry outbox tied to the acting user and POS;
  unsent actions remain pending until that user is authenticated on that POS.
- `orderId` references a persisted order; `cartId` groups actions for one draft
  cart or uses `order:<orderId>` for a saved order. `eventId` identifies one
  client action and remains unchanged across retries. Backend order-change
  logs use `source: order`; client cart events use `source: cart`; cover deletion
  snapshots use `source: cover`. Cover create/edit/fetch/publish do not create audit events. Historical
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
- The remainder scheduler runs daily at 20:00 UTC (`0 20 * * *`, timezone `UTC`), which is 04:00 the following day in Ulaanbaatar, on `posclient-hourly-sync-remainder`; it dispatches tenant-scoped `posclient-sync-remainder` jobs that must include `subdomain` (SaaS organizations or `os` for self-hosted deployments). Organizations with missing, non-string, or blank subdomains are skipped before enqueueing, with an organization-ID warning.
- Worker startup removes the legacy `posclient-hourly-sync-remainder` scheduler from `posclient-sync-remainder` and cleans failed jobs from both remainder queues. Scheduler and tenant jobs are removed on completion or terminal failure. A job with missing, non-string, or blank tenant data completes with `{ skipped: true, reason: 'missing-subdomain' }` before model access; its warning includes job ID, name, and repeat key. Valid tenant sync errors still propagate. Queue metadata remains while the queues are in use.

## Local Invariants

- Every sync to sales `pos.createOrUpdateOrders` sends a flat input
  (`action`, `order`, `posToken`, ...). A delivery marked done sends
  `action: 'statusToDone'` the same way; wrapped in `query` it never ran.
- tRPC `createOrder` (orders an automation or AI agent creates) sends the new order to sales right away through `syncCreatedOrder` (`createOrUpdateOrders`, unpaid, with its items) so it can be looked up before payment; a failed sync never fails the create. Cashier-created orders still reach sales at payment or status change.
- POS pricing sends an order's `createdAt` as loyalty
  `pricing.checkPricing.orderCreatedAt` and no `date`, so checkout is loyalty's
  current time and the plan's `scheduleMoment` decides which of the two its
  schedule reads. Order edits (`ordersEdit`) pass the stored creation time,
  never a client replacement; saved-order loyalty previews load it in the
  current POS/sub-token scope. New orders and unsaved previews omit it, so
  loyalty treats the order as starting now.

- Pricing bonuses append separate zero-price order lines with unique IDs and
  `isPackage: true`, so the existing generated-item lifecycle removes and rebuilds
  them on each save. Never average a bonus into a paid line or reduce paid quantity.

- Terminal result IDs make reservation/completion retries idempotent. Completed
  responses are immutable; saving manual cover fields must retain every result.
  Reserve before calling a terminal. Covers with any reservation cannot be
  deleted; pending responses prevent the atomic `confirming` publish lock.
  An interrupted `confirming` publish can retry its stored snapshot; editing
  and new terminal requests remain locked until it is acknowledged.
- Product imports finish by removing the importing POS token from categories
  with no products carrying that token in that category or any descendant.
  Retain all ancestors using the slash-delimited code prefixes in `order`
  (`parent.order + code + '/'`) for categories with matching products;
  an empty sibling does not inherit its parent's retention. This runs after all
  groups are imported, including an empty import, and preserves other POS tokens
  and the category documents.

- `poscProducts` / `poscProductsTotalCount` with `isSimilarity` (sent only by
  the coffee-shop and restaurant POS themes) list each bulk-similarity group
  as its star product only, including while searching.

- An order converted to a deal sends its customer / company on the deal (`customerId` / `companyId` in the `sales` `deal.create` input); no core relation is made for it.

- `cpOrdersAdd` and `cpOrdersEdit` always require client portal context;
  only `customerType: visitor` bypasses the portal user requirement.
  The regular `ordersAdd` mutation continues to require an authenticated POS user.
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
  remainder persistence and the daily sync.
- POS client report queries must require a logged-in POS user.
- An order is priced `checkPricing` first, then `checkLoyalties` (the same order as the preview): a voucher or coupon comes off the priced amount, and a `posBase` plan's condition logic never reads a voucher discount as the discount sync baked in (which used to cancel it).
- `checkLoyalties` sends loyalty `undefined`, never `null`, for an unchosen `couponCode`/`voucherId`: loyalty's zod input rejects null and the swallowed error would drop every loyalty discount.
- `sendTRPCMessage` swallows errors unless `throwOnError` is set; a check whose failure must reach the cashier (like `poscCouponCheck`) passes it.
- `orderChangeLogs` must require a logged-in POS admin, filter by the current
  POS token, and verify any existing specified order belongs to the POS/sub-token scope.
  Removed orders remain searchable through POS-owned logs; unknown IDs return
  an empty list. Orders belonging to another POS return no entries.
  List requests are bounded to 100 entries per page.
- Cart log actor and POS token come from authenticated context; submitted
  actor IDs must match. Client timestamps are reported data, not trusted server
  receipt times. Snapshots are limited to 500 items and 512 KiB per event.
- Cashiers may access `dailyReport` only when `permissionConfig.cashiers.seeReport` is true; admins remain allowed by `adminIds`.
- `poscCustomersAdd` sends Core only fields placed in `customerCreateConfig.layout`, requires e-mail or phone, and always sets `state: 'customer'`, `createdVia: { source: 'pos', sourceId: posId, sourceName: posName, actorId: posUserId }` (the `schemaWrapper` provenance field; no core change); `ownerId` is the POS user only when `assignCashierAsOwner` is on. No offline queue: Core must be reachable.
- `poscProducts` and `poscProductsTotalCount` must share the same product filter builder so lists and counts stay consistent.
- Automatic pricing and loyalty/voucher recalculation must preserve existing `hand` discounts and replace only the matching automatic source entry.
- POS order item `unitPrice` is stored after discounts; discount base
  calculations must reconstruct the pre-discount base as
  `count * unitPrice + discountAmount`.
- Order payment mutations must append paid amounts and increment cash atomically; do not rebuild payment fields from a stale order snapshot.
- `cpOrdersAddPayment` and `cpOrdersSettlePayment` apply client amounts and bill types only for a logged-in POS user. Any other caller, including a signed-in portal customer, works from the order's paid invoices, as payment reports them, and fails with `FORBIDDEN` without them. Only invoices with one of the `ORDER_INVOICE_CONTENT_TYPES` count, the same four `sales` forwards to `paymentCallbackClient`. `cpOrdersAddPayment` runs `recordPaidInvoices`: it records them and settles, but on an eBarimt POS with no bill type on the order it leaves the receipt for the settle call. A paid pre-order deposit replies with the order, unpaid. `cpOrdersSettlePayment` runs `settleFromPaidInvoices`: on an unpaid order with no cashier it first applies a bill type of `1` or `3` and the register number sent with the call, then settles, waiting up to 10 seconds when paid invoices cover the total. Client amounts never reach the order, `billType: 9` is ignored on that path, and an already paid order returns as success so a repeated call is safe. The one exception: asking for a company on an order already settled with a citizen receipt fails with `CONFLICT`. A sale has one receipt, and it is never replaced through this path.
- `prepareSettlePayment` claims the order with an atomic `settlingAt` write first, then re-reads the order and its items and checks amounts on that copy. One caller settles; a losing callback returns with no receipt, and a losing cashier gets an error. Success or failure clears the claim, and a claim older than 60 seconds counts as dead. `ordersEdit` holds the same claim for the whole edit, so an order never changes under a settlement. A second edit that overlaps it is refused and can retry. Every path that settles or edits items must go through this claim.
- Invoice settlement never reads the POS token from the invoice: `order.posToken` decides the POS config. An order with no cashier (`userId` empty) has nobody to choose a bill type later, so it settles as `billType: '1'` when it has none, or when it is `'3'` without a register number. A cashier's order keeps waiting for the cashier's choice.

## Validation

- Order-date smoke: with a loyalty plan scheduled 18:00–21:00 and checked
  "when the order was created", open an order at 20:50, then preview and edit
  it after 21:00; both keep the discount. With "at checkout" both drop it. A
  new cart uses now. A preview of an
  order outside the current POS/sub-token scope returns Order not found.

- `node --test backend/plugins/posclient_api/src/modules/posclient/utils/__tests__/pricing.test.cjs`
- Pricing smoke: buy two A with an A bonus; retain two paid A at the original
  price and append a free A. Re-save and reduce quantity below the threshold;
  generated bonus lines must be rebuilt without duplication or stale bonuses.

- `node --test backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/mutations/__tests__/covers.test.cjs`
- Cover smoke: create a draft, fetch two terminal results, reload, edit the
  manual description, and publish; Sales receives both results. Reject deletion
  after reservation, publishing while pending, replacement of a completed
  response, and access from another POS/user. Retried completions append once.
- `pnpm nx run posclient_api:schema:print --skip-nx-cache`
- `pnpm nx run gateway:schema:compose --skip-nx-cache --parallel=2`

- CP creation/edit smoke: with client portal context, visitors without a
  portal user reach order validation; non-visitors require `cpUser`.
  Without client portal context, both mutations are rejected by the wrapper.
- Audit action smoke: create, edit, cancel and return an order; each event has
  the matching action and `source: order`. Cart removals/reductions have
  `source: cart`, `action: update` and item-specific details. Admin audit UI
  displays the action and keeps action-less historical entries readable.
- `pnpm nx build posclient_api`
- `node --test backend/plugins/posclient_api/src/modules/posclient/utils/__tests__/syncUtils.test.cjs`
- `node --test backend/plugins/posclient_api/src/worker/__tests__/remainder.test.cjs`
- `node --test backend/plugins/posclient_api/src/modules/posclient/graphql/resolvers/mutations/__tests__/orders.test.cjs`
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
- Invoice settlement smoke scenario: pay an invoice with `contentType: sales:order` and `contentTypeId` set to a portal order, with no `data.posToken` and eBarimt configured; the order gets `paidDate` and `billType: '1'` once. Check the invoice again, or send callbacks in parallel: no second receipt. Pay part of the total: no `paidDate`. Pay more than the total: the order settles and the receipt shows the total. A refused receipt leaves no claim, and the next check settles. A cashier's order with no bill type records the amount and stays unpaid.
- Portal payment smoke scenario: with app and POS tokens only, and again as a signed-in portal customer, `cpOrdersAddPayment` and `cpOrdersSettlePayment` on an unpaid order fail with `Order payment is not confirmed` and change nothing. With a paid invoice for the full total, both succeed and only the invoice amount is recorded. With eBarimt and `billType: 3` plus a register number on `cpOrdersAdd` or at settle before the callback, the receipt is a company one; at settle after the callback the call fails with a clear error and the citizen receipt stands. An invoice of another content type does not count. A paid pre-order deposit replies unpaid with no error. With a cashier's `pos-auth-token` both work as before.
- POS report smoke scenario: as a cashier without `seeReport`, `dailyReport` returns permission denied; after enabling it, the same cashier can fetch the report.
- POS customer smoke scenario: as a cashier with `createCustomer`, `poscCustomerForm.canCreate` is true; `poscCustomersAdd` with a new phone creates a customer with `createdVia.sourceId` = POS id; repeating it returns `duplicate` instead.
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
