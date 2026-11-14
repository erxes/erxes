# `sales_api` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/sales_api`
- **Last synchronized:** `2026-11-14`

## Scope

### Owns

- Sales boards, pipelines, stages, deals, labels, checklists, and plugin-owned
  sales data and API contracts.
- Sales-owned POS and ecommerce API behavior.
- Sales deal, pipeline, board, stage, ecommerce, and POS API behavior
  implemented under `backend/plugins/sales_api`.
- Sales-owned GraphQL, tRPC, Mongoose models, metadata, reference resolvers,
  documents, and after-process handlers.

### Does not own

- Core property definitions, users, teams, shared platform packages, or other
  plugins' data.
- Sales user interfaces; those live in `sales_ui`.
- Core API, gateway, shared libraries, frontend plugin code, loyalty score
  campaign internals, accounting, Mongolian integrations, or other plugins.
- Direct source imports from another plugin; cross-service access must use
  published GraphQL, tRPC, HTTP, event, or federation contracts.

## Current Capabilities

- Two templates for core's Templates page ship through
  `startPlugin({ meta: { templates } })` (`src/meta/templates/`):
  starter automations built on `templateHelpers.ts` (`emailStep` writes the
  maily `contentJson` beside its html; `OPEN_DEAL_CONDITIONS` = active, not a
  Won/Lost stage): `sales.deal-lost` (probability `Lost` → team notification,
  email asking why), `sales.stale-deal` (membership trigger on a listed
  segment `stageChangedDate` 7 days later, re-checked nightly → notify
  `{{ trigger.assignedUserIds }}`), `sales.deal-round-robin` (segment trigger
  on active deals created today → `transform` exposes `assignedUserIds` →
  `split` reads that step (`target`; split conditions cannot read the record)
  → `pickMember` → `setProperty assignedUserIds` → notify),
  `sales.big-deal-approval` (membership trigger, `once`, on open deals with
  `totalAmount numberigt` the `core:text` limit written into the segment
  part → `approval` → notify approved/rejected) and `sales.pos-review` (a
  solution: POS order `paid` → 1 day → frontline rating link → email; a
  second journey alerts the team on a 1 or 2 from that form). Lookup segment
  fields (`assignedUserIds`) only take equals/not equals, so "nobody
  assigned" is a split condition, never a segment.
  `sales.sales-employee` (v8, a solution), built on frontline node types
  (hidden without frontline), and `sales.deal-won` (v3, an automation: one
  journey, no parts — notifies the chosen team and emails the deal's
  customer, trigger `sales:sales.deals.probability` fixed to
  `{ probability: 'Won' }` so no pipeline/stage picker is needed; the email
  step reads `{{ trigger.customers.primaryEmail }}`, the generic reference
  path every `exposure: 'reference'` output field supports). Its email's
  subject and body are the template's own literal text in the step (body as
  maily `contentJson` plus its html in `content`: the builder's editor opens
  only from `contentJson`, so a body without it opens empty), not a
  `core:emails.content` requirement: that requirement's wizard reuses the
  builder's rich editor, which needs a live automation it does not have yet,
  and breaks there; the org rewords the email in the builder after
  installing, same as any other action. Only `core:emails.sender` (a real
  per-org pick) stays a requirement. Sales employee's one Messenger journey: an AI agent part (Product, Customer, POS
  order and Loyalty account lookups, offer rules in its instructions, and the
  whole product catalog as knowledge: core `product.knowledge` with
  `scope: 'all'`, which an unscoped source needs to index anything) replies
  itself. Helper tools, each a workflow whose result it tells the customer:
  `place_order` (Create POS order of type delivery from `[{code, count}]`
  lines, address and phone in the description; returns number, total and
  `onlinePaymentUrl`; a `split` on the created order's `totalAmount` against
  the `bigOrder` answer hands an order at or above it to an available sales
  person, so the limit holds whatever the agent concluded) and `hand_over` (`pickMember` with a required
  fallback, then handoff). The `request_discount` handoff tool first has the agent tell the customer
  it was asked (a handoff ends the agent's turn with no text), then
  `approval`; an AI agent step words each decision, sent with frontline's
  customer message action. Two core segment parts (`core:segments.segment`,
  owned by automations): "paid or not from the chat" (`paidDate` set, or not a
  delivery order) and "orders from the chat" (delivery orders). Payment
  reminder journey: POS order event `created` on the chosen POS, wait 2
  hours, `if` not settled, message the customer with
  `{{ trigger.onlinePaymentUrl }}`. Paid journey: event `paid`, `if` from the
  chat, thank the customer. Delivered journey (`deliveryCompleted`, from the
  chat): a frontline rating form part's link, sent with the delivered text.
  Low rating (form submitted, rating below 3): Find object on the order
  (`aboutRecordId`), notify the leads. Returned journey (from the chat):
  notify the leads, then message the customer. `src/meta/templates/__tests__` runs `validateTemplate` and
  checks the installed shape against the engine's config schemas.
- The Create POS order action accepts an order line by product `code` as well
  as `productId` (`action/resolveProductCodes.ts`, core `products.find`); an
  unknown code fails the step instead of dropping the line. Prices stay with
  posclient, which sets each line from the product's POS price.

- Pipelines persist `productIds`, `tagIds`, and `excludeTagIds` for deal product selection. Core reads them through the existing tenant-scoped `pipeline.findOne` contract.

- POS product groups store `productIds` (include), `tagIds`, and `excludeTagIds` alongside category/product exclusions. Category, tag and explicit-product includes form a union; category, tag and product exclusions apply to that whole union, including explicitly included products. Include and exclude tags expand through Core `tags.findWithChild` in the request tenant. Empty groups retain their empty-catalog behavior.
- POS sync retains the included category tree minus excluded category descendants, plus the direct categories of products matched by tags or explicit ids. Each group resolves its trees once, then reuses those ids for the product query and category payload. Product changes add their direct category before the product or remove products that no longer match. Tag assignment/tree and category changes resync affected POS catalogs through the existing token-scoped import contract.

- POS cover `details[]` stores immutable terminal fetch results
  per `paidType`, including zero-amount terminal rows received from POS client.
  `PosCoverDetail` exposes `terminalResults` without duplicate description fields; the cover-level
  description remains the POS client's general closing note, preserved by
  `pos.confirmCover` and exposed unchanged through `posCoverDetail`.

- Removing a Sales POS cover first unpublishes it through POS client's
  `posclient.covers.remove` tRPC query. Only an acknowledgement for the same
  cover with `status: reconf` permits Sales deletion, allowing POS client to
  edit and publish that cover again.
- `pnpm nx run sales_api:schema:print` exports the existing subgraph schema,
  including subscriptions, to `generated/schema.graphql` for type-generation
  tooling without starting the Sales service or executing resolvers.
- Deal product rows persist optional `uomInfo: { uom, ratio, unitPrice, quantity }`
  for entry values. Writes derive base price (`info.unitPrice * ratio`), base
  quantity (`info.quantity / ratio`), taxes and amount before totals/discounts.
  Partial info uses base fields; missing base UOMs are fetched in one tenant-scoped
  Core products query. `uomInfo` is the only supported entry-unit metadata field.
  Base-unit selections copy entry price/quantity directly and omit `uomInfo`
  from persistence; only a different selected unit needs stored metadata.
  `utils/productUom.ts` separates missing-base-unit lookup from input
  normalization, and validates the incoming ratio once before conversion.
- Deal product GraphQL discount checks accept fractional `quantity` values, so
  pricing and loyalty calculations stay aligned with POS weighted products.
- Deal creation, saving, and product-row creation/editing fill missing or blank
  currencies from the tenant's first Core `dealCurrency` configuration value
  (fallback `MNT`) before calculating totals, preserving explicit currencies.
- POS catalog sync checks loyalty base pricing in batches of 100 products,
  with at most eight concurrent requests, and merges discounts by product id
  before applying them to prices. Product-group pushes propagate POS client
  transport/import errors instead of silently reporting success.
- Internal POS cancellation removes token-owned unpaid synced POS orders without
  successful/unresolved eBarimt receipts and refunds their loyalty points.
  Returned orders are retained; missing orders allow idempotent retries.
- POS configuration exposes `isShowRemainder` for remainder display separately
  from `isCheckRemainder` and validation category exclusions.
- POS configuration stores `customerCreateConfig` (`enabled`,
  `assignCashierAsOwner`, `layout`) for POS client customer registration and
  syncs it to POS client.

- A deal an automation creates records `createdVia` — what produced it, which
  run, and for whom — and falls back to that actor as the deal's `userId` when
  the target does not name one.
- Create deal accepts product lines: `items` (JSON text of
  `{ productId, quantity | count, unitPrice? }`) or, when empty, `productIds`
  (one of each). `action/dealProducts.ts` prices a line from the line or the
  Core product, computes row `amount`, ticks the row and drops missing
  products; `Deals.createDeal` fills currency and totals. `items` and
  `productIds` are never stored as deal fields.
- Create deal publishes its own output (`targetId`, `name`, `number`,
  `totalAmount`, `onlinePaymentUrl`); deal triggers expose `onlinePaymentUrl`
  too. `resolveDealPaymentUrl.ts` re-reads the deal and asks Payment's
  `getOrCreateInvoiceUrl` for `totalAmount − mobileAmount` with the deal
  pipeline's `paymentIds` and `contentType: 'sales:deal'`; it returns `''`
  when nothing is owed or no online payment is configured. Paying lands in the
  existing `sales:deal` payments callback (`mobileAmounts`). Pricing plans and
  loyalty discounts are not applied to automation lines.

- Runs as the sales federated GraphQL and tRPC plugin service.
- Exposes deals, pipelines, boards, stages, labels, product/payment data, sales
  references, POS, and ecommerce behavior.
- Sales pipelines persist validated Core `sales:deal` property ids.
- Deal stage lists have compound indexes aligned with cursor ordering and a
  covered stage/status/parent count path.
- The unscoped deal list uses a parent/order/id/status index for its default
  card ordering.
- Declares the filterable `sales:sales.deals` segment fields and resolves a
  batch of them through the `evaluateFields` segment producer. The `tagIds`
  lookup asks for `sales:deal` tags plus workspace tags (`query.variables`).
- Registers three core import-export export types in `main.ts`:
  `sales:sales.deals` (`dealsExportManage`), `sales:pos.posOrders`
  (`posOrdersExportManage`) and `sales:pos.posItems` (`posItemsExportManage`).
  Deals export one row per deal (board/pipeline/stage, labels, tags, contacts,
  users, branches, departments, products summary, amounts, payments) plus one
  column per live `sales:deal` property; a property group already stored as
  rows on deals becomes numbered columns (`toPropertyRowColumnKey`, at most 20).
  POS orders export one row per order (POS name, cashier, customer by
  `customerType`, items summary, amounts, payment types, converted deal).

## Architecture

| Area                       | Path                                                      | Responsibility                                                                                       |
| -------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Schema export              | `scripts/print-subgraph-schema.ts`                        | Print the Sales subgraph and subscriptions for GraphQL type-generation tooling.                      |
| Runtime                    | `src/main.ts`, `src/connectionResolvers.ts`, `src/trpc`   | Start the plugin, load tenant-scoped models, and expose tRPC procedures.                             |
| Sales models               | `src/modules/sales/db`                                    | Store deals, boards, pipelines, stages, labels, and sales metadata.                                  |
| Sales GraphQL              | `src/modules/sales/graphql`, `src/apollo`                 | Provide sales schemas, resolvers, mutations, queries, and subscriptions.                             |
| References and automations | `src/modules/sales/meta`                                  | Provide reference values, automation constants, and after-process behavior.                          |
| Segment fields             | `src/modules/sales/meta/segments/fields`                  | Declare which `sales:sales.deals` fields are filterable, with their operators, input and mongo path. |
| Segment evaluation         | `src/modules/sales/meta/segments/evaluate`                | Resolve a batch of deals against the value refs a segment plan assigns to this plugin.               |
| Relation measures          | `src/modules/sales/meta/segments/evaluate/relations.ts`   | Fold a relation into deals for a batch, over a core-resolved edge table or a stored join.            |
| Stage-derived filters      | `src/modules/sales/meta/segments/evaluate/stageFilter.ts` | Rewrite pipeline, board and probability conditions into the stage ids they name.                     |
| Documents                  | `src/modules/sales/documents`                             | Generate sales document content and amount mappings.                                                 |
| Export                     | `src/meta/export`, `src/modules/{sales,pos}/meta/export`  | Route export collections, build export headers and rows, and resolve core names per batch.           |
| POS and ecommerce          | `src/modules/pos`, `src/modules/ecommerce`                | Provide sales-owned POS and ecommerce behavior.                                                      |
| Benchmark data             | `scripts/benchmarks/seed-deals.js`                        | Seed resumable, deterministic high-volume deal data directly through mongosh.                        |

- Sales pipelines persist `propertyIds`; create and edit validate every id
  against Core `sales:deal` fields before writing it. A separate configured
  flag preserves legacy show-all behavior without making an empty selection
  ambiguous.
- Deals, pipelines, boards, stages, labels, products data, payments data, and
  sales references are exposed through sales-owned APIs.
- Sales record references provide deal display names, links, labels, product
  amount helpers, and `excludeLoyaltyAmount`.
- `excludeLoyaltyAmount` returns the deal total amount minus payments made
  through pipeline payment types that have a `scoreCampaignId`
  (`dealPaidAmount`).
- Deal and POS order triggers give loyalty's Adjust score action a purchase
  through `actionInputs`: deals map `totalAmount` → `unUsedTotalAmount`
  (ticked products), `paidAmount` → `paidAmount`, `items` → `purchaseItems`;
  POS orders map `totalAmount`, `paidAmount` (total minus point payments) and
  `purchaseItems`. Earning is decided by automations, never by sales.
- A POS order keeps the ids of the loyalty entries it caused in
  `pos_orders.scoreLogIds` the same way: `spendOrderPoints`,
  `earnOrderPoints` and `refundOrderPoints` (`modules/pos/utils.ts`) link
  what loyalty returns through `PosOrders.addScoreLogs`; `createOrUpdate`
  drops `scoreLogIds` from a synced document, so the POS client never
  overwrites them. `salesPosScoreLogs` / `salesPosScoreLogInsights` /
  `salesPosScoreLogTimeline` (`modules/pos/utils/orderScoreLogs.ts`,
  `posOrderRead`) take the order list's filters (`generateFilterPosQuery`)
  plus `posIds`, `orderIds`, `branchIds`; insights group by POS (`byPos`),
  cashier (`byCashier`, `userId`), branch, customers and `topOrders`.
  `salesDealScoreLogs` and `salesPosScoreLogs` take an optional `kind`
  (`SalesScoreLogKind`) and `period` (`SalesScoreLogPeriod`: interval,
  timezone, key): the matching records' ids go to loyalty
  `score.filterIds` (`drilledIds`, batches of 1000) and the page lists only
  those. Insights return `entryCount` (every entry, recalculations
  included). A cancelled order is deleted
  after its refund, so its entries are no longer listed here.
- Deal and POS sums share `modules/sales/utils/scoreLogSums.ts`
  (`loyaltyTotals` batching `score.totalsByIds`, `sumScoreLogs` over
  sources with a group, people and branches) and `scoreLogTimeline` in
  `dealScoreLogTimeline.ts`; each source only maps its records.
- A deal keeps the ids of the loyalty entries it caused in `scoreLogIds`:
  `syncDealPoints` links what `score.spend`, `score.earn` (`scoreLogIds`,
  else `scoreLogId` / `_id` from an older loyalty) and `score.refund` return
  through `Deals.addScoreLogs` (a recalculation's reversal and replacement
  both), also when a later call
  in the same sync fails. `salesDealScoreLogs(page, perPage, …deal list
filters)` (`utils/dealScoreLogs.ts`, `showDeals`) runs the deal list's
  `generateFilter`, unwinds the ids and returns one page of
  `{dealId, dealName, stageId, stageName, pipelineId, pipelineName, boardId,
boardName, scoreLogId}` (each deal's entries together, latest linked
  first, at most 50). Without `pipelineId` it spans every pipeline the user
  may open (`utils/pipelineVisibility.ts` `visiblePipelinesQuery`, the same
  rule `salesPipelines` uses) with each pipeline's `isCheckUser` /
  `isCheckDepartment` rule applied (`visibleDealsScope`); `boardIds` /
  `pipelineIds` narrow it. `salesDealScoreLogInsights(…same filters)`
  (`dealScoreLogInsights`) reads every matching deal's ids, asks loyalty
  `score.totalsByIds` in batches of 1000 and returns `totals` per action,
  `net`, `dealCount`, `customerCount`, `byPipeline`, `topDeals` (ten deals by
  points earned), `byAssignee` / `byBranch` (ten each; a deal with several
  assignees or branches counts in full for each) and `topEarners` /
  `topSpenders` (customers) (earned = add, spent
  = subtract, refunded = refund + return, other = expire + set; a row with
  loyalty's `recalculates` counts apart as `recalculatedEarned` /
  `recalculatedSpent` (pipelines and periods: `recalculated`), never as a
  refund; `topDeals` and the rankings read what is earned or spent now; the kinds add up to `net`). `salesDealScoreLogTimeline(interval:
day|week|month, timezone, …same filters)` (`utils/dealScoreLogTimeline.ts`)
  asks loyalty `score.timelineByIds` in batches of 1000 and returns the last
  30 days, 26 ISO weeks or 12 months in that zone (default UTC), empty
  periods as zeros, each with the kinds, `recalculated`, `net` and
  `cumulative` (everything
  the deals moved before plus each period's net: the deals' running net, not
  a wallet balance; expiry and resets are not linked to deals); nothing is stored. The client asks loyalty
  `loyaltyScoreLogsByIds` for that page. Entries written without sales
  (automations, by hand) are not linked; those written before this field are
  linked once by `backend/saas-migrations/sales/commands/linkDealScoreLogs.ts`
  (ids only, safe to rerun, `DRY_RUN=true` counts).
- Sales tells loyalty what a purchase paid with points and when it is undone
  (`modules/sales/utils/dealPoints.ts`): `planDealPoints` decides per deal
  create, edit or move (a new deal passes its `customerId` as `customerIds` and a pre-made
  `_id`, since it has no relations yet), `checkDealPoints` asks loyalty's `score.checkSpend` before the
  deal is saved (a point payment without a customer, or one loyalty refuses,
  fails the save), and `syncDealPoints` records `score.spend` after it,
  putting the deal's payments and stage back if that fails (a new deal is
  removed instead). A copied deal drops its point payments
  (`withoutPointPayments`): it is a new order, not a second payment. Entering a stage
  that refunds calls `score.refund`; leaving one spends the point payments
  again. Where deals earn and refund comes from `sales_loyalty_rules`
  (`utils/loyaltyRules.ts`): `everyBoard` and `everyPipeline` (one board) rules
  name stages by probability, `specificStages` rules (one pipeline) by id, and
  per campaign only the narrowest rule reaching a stage counts (override, not
  union). In an earning stage every save restates the purchase with
  `score.earn` (`dealScoreTotal`, `dealPaidAmount`, `dealPurchaseItems`) for the
  first customer, so edits and a return from a refund stage are counted; no
  customer means no earn and no error. Stage `refundPoints` is no longer read.
  A purchase also sets one wallet's tier by its amount from
  `sales_loyalty_tier_rules` (same places as points rules, but only the
  single narrowest tier rule reaching a stage counts, whatever wallet it
  names: `resolveLoyaltyTierRule`): after the earns, `syncDealPoints` calls
  loyalty `score.applyPurchaseTier` with the rule's bands and `onlyUpgrade`
  and `dealScoreTotal`, naming the deal (`targetName`: its name, else
  `#number`) and the saving user so loyalty logs the change. Tiers are never refunded or set in a refund stage.
  Deals written outside the deal mutations go through `syncWrittenDealPoints`
  (read before, compared after): tRPC `deal.create` / `deal.updateOne`,
  invoice-created deals, automation create-deal actions (after the source
  relation, so its customer earns) and set-property updates. A new write path
  that puts a deal into a stage must do the same.
  Removing deals refunds them (`Deals.removeDeals`). All loyalty calls throw;
  with loyalty disabled they do nothing. POS order sync calls `score.spend`
  (`spendOrderPoints`, its own sync step and `throwOnError`, also after
  `posOrderChangePayments`), `score.earn` for
  the POS's one `earnScoreCampaignId` once paid (`planOrderPoints` /
  `earnOrderPoints`), `score.applyPurchaseTier` for the POS's one `earnTier`
  (`{accountTypeId, bands, onlyUpgrade}`, checked by `validateEarnTier`) with
  the order's `totalAmount` (with the order, named `POS #number`, and its
  cashier as target and actor), and `score.refund` for returned orders (the tier
  stays), still without throwing. Each loyalty step of a paid or returned
  sync runs on its own, so a refused voucher never skips the earning. A
  returned order also gives its vouchers back (`voucher.returnTarget`); the
  paid order's voucher is used through `confirmLoyalties` (target `pos` + order
  id, the same pair posclient held it under; a repeat sync changes nothing).
- A deal save prices `checkPricing` first, then `checkLoyalties`, so loyalty discounts sit on the priced amount; `checkLoyalties` keeps the bonus lines pricing just laid down.
- Deal pricing sends the deal's `createdAt` as loyalty `pricing.checkPricing.orderCreatedAt` and no `date`: checkout is the save, and the plan's `scheduleMoment` decides which of the two its schedule reads. A new deal has no `createdAt` yet and counts as starting now.
- A deal's voucher and coupon (`extraData.voucherId` / `couponCode`) are used
  only where the deal earns: `syncDealPoints` calls loyalty `confirmLoyalties`
  (target `sales` + deal id) after the customer check, and a refund stage calls
  `voucher.returnTarget` after `score.refund`, then `voucher.releaseTarget`.
  Deal saves no longer redeem them on every edit. Saving products with
  `extraData` holds the picked voucher for the deal's first customer
  (`syncDealVoucher` in `editDeal`, before pricing; it releases the previous
  pick and refuses a deal without a customer), and `checkLoyalties` sends
  `discountInfo {voucherId, couponCode, targetId}` so the deal is priced with
  them. Removing a deal returns the vouchers it used and releases the ones it held. Pricing and loyalty
  restate their own `discountInfos` (`pricing`, `voucher`) on every save
  (`dropDiscountInfo`, which resets `discount` at once so an emptied list is
  never rebuilt as a manual discount), so a plan, voucher or coupon that no
  longer applies takes its discount with it.
- The deal automation output `productsData.*` resolves a field as all products
  joined (`productsData.name`), one product by index (`productsData.0.name`,
  names looked up in core per item), or the product count
  (`productsData.$count`), so an email row written per item reads each product.
- POS and ecommerce modules provide sales-owned order and integration behavior.
- POS order card conversion uses sales-owned deal model helpers directly,
  updates an existing `convertDealId` deal when present, and creates one only
  when the order has no valid converted deal; copied descriptions combine the
  order description with `deliveryInfo.description`.
- POS config sync merges Mongolian eBarimt receipt toggles into the POS payload
  sent to POS client sync.
- POS order and deal triggers declare `actionInputs` for loyalty's Adjust score
  and Set tier (`LOYALTY_SET_TIER_ACTION`, `totalAmount`: the order total /
  the deal's `unUsedTotalAmount`), so tier bands read the purchase without
  loyalty knowing sales.
- The POS order event trigger's set-property targets are the order itself and
  "Order customer" (`targetField` on `customerId`), so a POS automation can
  update the buyer's properties, e.g. a purchase counter a reward is built on.
- The POS order automation `link` output (`pos/meta/automations/constants.ts`)
  is the Orders page URL with the side panel query key:
  `/sales/pos/<posId>/orders?panel=<encoded /detail/sales:pos.orders/<_id>>`.
  Keep it in the format `sales_ui` opens; do not emit `pos_order_id`.
- Product changes reach POS clients through `afterMutation` (`meta/productUtils.ts`);
  core's bulk `productsSetConditionCodes` / `productCategorySetConditionCodes`
  bypass `productsEdit`, so each touched product in a POS's groups is resent.
- POS product sync calculates tax rules from the POS-specific `posInEbarimt`
  config document's `value`; selected VAT and city-tax rules are fetched through
  Mongolian `productRules.find` with a `data` filter before sending products.
- Agent CRM access uses the public GraphQL API; tRPC stays internal.

## Architecture

| Area                | Path                                                    | Responsibility                                                        |
| ------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| Bootstrap           | `src/main.ts`                                           | Starts and registers the sales plugin                                 |
| Runtime             | `src/main.ts`, `src/connectionResolvers.ts`, `src/trpc` | Start the plugin, load tenant-scoped models, and expose tRPC          |
| Models              | `src/modules/sales/db`                                  | Sales Mongoose schemas and models                                     |
| GraphQL             | `src/modules/sales/graphql`, `src/apollo`               | Sales schemas, resolvers, mutations, queries, and subscriptions       |
| Pipeline validation | `src/modules/sales/utils/pipelineProperties.ts`         | Validates pipeline property ids through Core tRPC                     |
| References          | `src/modules/sales/meta`                                | Sales reference values, automation constants, and after-process logic |
| Agent metadata      | `src/meta/agent.ts`                                     | Core AI assistant skill and agent-hidden client portal operations     |
| Documents           | `src/modules/sales/documents`                           | Generate sales document content and amount mappings                   |
| POS and ecommerce   | `src/modules/pos`, `src/modules/ecommerce`              | Provide sales-owned POS and ecommerce behavior                        |

## Contracts

### Provides

- Import-export `getExportHeaders` / `getExportData` producers for module
  `sales` (collection `deals`) and module `pos` (collections `posOrders`,
  `posItems`).
- Internal `contactFields.sync` tRPC mutation (`TContactFieldsSync`) — core broadcasts contact merges and removals to every plugin declaring `meta.contactFields` (sales declares `sales:deal` in `main.ts`); applied with `applyContactFieldsSync`. Not agent-callable.
- Internal `pos.cancelOrder({_id, posToken, userId?})` tRPC mutation returns
  `{cancelled: true}` after cancelling the POS order; it is not agent-callable.
- Plugin meta `agent` (`src/meta/agent.ts`, `IAgentPluginMeta`) — the
  text-only `pipeline-analysis` skill (mounted by core as
  `sales-pipeline-analysis`: boards → pipelines → stages, `salesStages`
  counts/amounts, `dealsTotalCount`, `dealsTotalAmounts`, `deals`) and
  `hiddenOperations` listing every `forClientPortal` `cp*` query/mutation, so
  the agent does not discover them. Hiding is visibility only: they stay
  callable with their resolver permissions.
- Plugin meta `properties` (`src/meta/properties.ts`) — the `deal` property
  types, each with the `systemFields` (`code`, `name`, `type`) core lists as
  the read-only "Basic information" group in Settings → Properties. A
  `code` must name a real field on the record; core-api reads this meta
  once per process, so a changed list shows after core-api restarts.
- `properties.valueUsage` on `/properties` — answers which deals hold a
  `sales:deal` property value through the shared `measurePropertyValueUsage`:
  `part: 'samples'` (first deal names) or `part: 'counts'` (total and
  per-option counts). Core uses it to decide whether a property's type,
  options or the property itself can change freely; any other content type
  answers `unknownValueUsage(part)`.
- Federated sales GraphQL contracts for deals, stages, pipelines, boards, POS,
  and ecommerce modules.
- Query `salesDealScoreLogs` → `SalesDealScoreLogList { list: [SalesDealScoreLog], totalCount }`.
- Sales-owned tRPC and record-reference contracts.
- `segmentFields` and a `propertiesData` `segmentFieldNamespaces` entry
  (`propertyType` `sales:deal`) for
  `sales:sales.deals`, `segmentRelations` for `customer.deals` and
  `company.deals`, and the `evaluateFields`, `listSegmentMembers` and
  `countSegmentMembers` segment producers on `/segments`.

### Consumes

- Mongolian `putResponses.find` verifies synced receipt state before POS
  deletion when that optional plugin is enabled; failed/unconfirmed reads
  block deletion. Loyalty `score.refund` reverses cancelled POS order points.
- Core public contracts for fields, products, customers, companies, users,
  branches, departments, and related records.
- Public `erxes-api-shared` utilities, types, and extension points.
- `erxes-api-shared/core-modules` `sendNotification` with `event`
  (`TSalesNotificationEvent`) for deal notifications; core sends email and
  push on the channels each recipient's settings resolve to.

## Data and State

- `deals` owns one customer and one company as `customerId` / `companyId` (indexed, `default: null`; read only from the record — the migration must run before deploy, there is no relation fallback); sales saves them itself and makes no core relation for them. `dealsAdd` / `dealsEdit`, `cpDealsAdd`, the agent `deal.add` tool and the `deal.create` / `deal.createItem` tRPC take them on the doc; copies take the source deal's; automations set them with `setDealContacts` (`modules/sales/utils.ts`). `Deal` exposes `customerId` / `companyId` and keeps `customers` / `companies` (0–1 items). `backend/saas-migrations/core/commands/migrateRelationsToContactFields.ts` backfills deals linked before (first of old arrays, else the oldest related contact).
- Tenant-scoped Mongo collections are loaded through plugin connection
  resolvers.
- Deal stage browsing uses `stageId`; its total count filters archived and
  child deals through the compound count index.
- The unscoped deal list defaults to `order` then `_id` ordering and must avoid
  a blocking sort across the full collection.
- Deal monetary state is stored in `productsData`, product-level
  `discountInfos`, `totalAmount`, `unUsedTotalAmount`, `bothTotalAmount`,
  `mobileAmount`, `mobileAmounts`, and `paymentsData`.
- Pipeline documents store validated Core deal field ids in `propertyIds`.
- `deals.scoreLogIds` and `pos_orders.scoreLogIds` (indexed) hold only ids
  of loyalty `score_logs`; points and balances are never copied to sales.
  `backend/saas-migrations/sales/commands/linkDealScoreLogs.ts` and
  `linkPosOrderScoreLogs.ts` backfill entries written before the links.
- POS order items keep the optional `conditionCode` (core product condition code) the POS client sold a line under, for reporting.
- POS `customerCreateConfig.layout` rows hold customer system field codes from
  `POS_CUSTOMER_SYSTEM_FIELDS` and `property:<fieldId>` entries.

## Local Invariants

- POS order event triggers read a field set for the first time from
  `eventUpdateDescription.added` as well as `updated` (a new order's first
  `paidDate` or `returnInfo` arrives as added); an update is never taken for a
  create. "Delivery completed" means status `done`: posclient creates an order
  with no kitchen step as `complete`, which is not a delivery. `statusToDone`
  writes the done status onto the sales order so the event fires, and skips
  the delivery deal when the POS keeps no delivery stage. Create POS order
  passes posclient's refusal through (`throwOnError`) so the run says why.
- Automation node and template icons (`icon` in automation constants and
  `meta/templates`) are Tabler names the erxes-ui icon registry has
  (the keys of `ALL_ICONS` in
  `frontend/libs/erxes-ui/src/modules/icons/components/TablerIcons.ts`; an
  aliased import such as `IconMessageCircle` is not one); any
  other name draws as a placeholder in the builder and the template gallery.
- Export handlers read the inner payload through `unwrapExportPayload`: the
  module producer passes `data`, not the `{ subdomain, data }` envelope the
  shared types describe. Deal and POS order rows always carry `_id` and are
  read in `_id` order, because the export worker pages with the last `_id`
  (or an index into `ids`). Filters reuse the list filters
  (`generateFilter`, `generateFilterPosQuery`) with no user, since export jobs
  run without one; user-dependent filters therefore narrow, never widen.
- A deal list not scoped to one `pipelineId` must keep to
  `visibleDealsScope`: `generateFilter` applies a pipeline's "own deals only"
  rule only for a single `pipelineId`.
- `Deals.addScoreLogs` only `$addToSet`s ids and sends no db event log, so
  deal-updated automations and segments do not run on point movements. Never
  store a score, total or balance next to the ids: loyalty is the only ledger.
- Deal product permissions: `dealsEdit` (or `dealsAdd` for new and copied deals)
  is enough to add product rows, change quantities and enter discounts.
  `dealsProductsEdit` is required only when a saved row's `unitPrice` changes
  (`utils/productPricePermissions.ts`); new rows are not checked. Removing rows
  requires `dealsProductsDelete`, both in `dealsDeleteProductData` and in a
  full-array `dealsEdit` save. The Sales User default group includes
  `dealsProductsDelete`; only Sales Admin includes `dealsProductsEdit`.

- `createBoardItem` sets `createdAt` at `models.Deals.create`, overriding any
  supplied date, including when copying an existing deal.
- POS model `posAdd` and `posEdit` always persist `onServer: true`, even when
  callers submit `false` or omit the field. This applies to GraphQL and tRPC
  creation; transport-side `onServer`/offline routing checks remain in place.
- Every automation action declares a `configSchema` (`src/modules/sales/meta/automations/configSchemas.ts` and `src/modules/pos/meta/automations/configSchemas.ts`) with exactly what its handler reads or refuses: create deal (`stageId`, `name`), create checklist (`name`) and create POS order (`posId` or `posToken`; amounts may be `{{ }}` placeholders). Write each field in the shape the builder form writes (text, not numbers or lists, where the form writes text). Change the schema with the handler; core publishes it to authors as `configJsonSchema` and enforces it when a flow goes live. Create deal also declares `validateConfig` (`src/modules/sales/meta/automations/configValidators.ts`): its `stageId` exists. POS `posToken` is builder-only.
- Deal notifications are sent from `modules/sales/utils/notifications.ts`, not
  `modules/sales/utils.ts` (the barrel rule below). Each passes `event`:
  assigned or removed users get `sales:deals:dealAssignee` (also on deal
  create), an archive/activate `sales:deals:dealStatus`, any other update
  `sales:deals:dealUpdated`. The meta names in `src/meta/notifications.ts` are
  the keys users' settings are saved under; renaming one drops saved choices.
- A deal's contacts are read only from `customerId` / `companyId`: `getCustomerIds` / `getCompanyIds(subdomain, models, dealId)` (`modules/sales/utils.ts`), the deal loader, documents, list filters (`customerId`, `companyId` args on `deals`, archived deals and stages; customer phone search; `relationType` core:customer/company) and automation targets ("Deal customer/company" are `targetField`s; "Customer/Company deals" select by the field in `getDealSetPropertySelector`). Never call `relation.getRelationIds` for a deal's contacts. Importing the `erxes-api-shared/core-modules` barrel from `modules/sales/utils.ts` breaks test schemas (import cycle); keep it out.
- `src/meta/agent.ts` hints and hidden names must exist in the sales SDL, hints
  must not be hidden, and hidden names stay limited to client portal `cp*`
  operations (`src/meta/__tests__/agent.test.ts`). A new `cp*` operation with
  `forClientPortal` belongs in `hiddenOperations`.
- Set property handlers pass `targetActionId: action.targetActionId` to
  `getSetPropertySelector`, so a Manage properties action targeting an earlier
  action (Find object, Create) updates that action's record, not the trigger's.
- Find object targets (`findSalesObject`, `sales/meta/automations/findObject.ts`):
  deal (`_id`, `name`, `number`) and POS order `sales:pos.orders` (`_id`,
  `number`; `customerId` only for customer-owned orders, `customerType`
  empty or `customer`). `newest` sorts by `createdAt`. The POS order target
  declares an AI agent `lookup` (`customerField: 'customerId'`, by
  `number`) with its own narrow output (number, status, dates, amounts,
  type), never the POS order trigger output with tokens and register numbers.
  Orders an automation creates are synced unpaid from posclient at once, so
  they are found before payment. `syncOrderFromClient` runs paid-only work
  (Order paid trigger, loyalty, deal) only with `paidDate`, and pushes an
  order to a sub-branch's offline POS only once paid.

- POS configuration, order items/payments, and aggregate report values remain
  JSON scalar outputs. Order details return an items array; item reports unwind
  it into a single object. Frontend narrowing must preserve those contracts,
  including nullable payment fields and existing numeric screen values.
  Stored order payment entries may omit `type` or contain `type: null`;
  frontend parsing must not make that optional field required.
  The deal relation panel (`posOrders(dealId)`) also reads `paidAmounts` as a
  JSON array of `{ type, title, amount }` entries.
- Deal product rows, payments, pipeline payment types, and pipeline event data
  remain JSON scalar contracts. Sales UI validates the fields it consumes;
  changing these outputs to object selections requires a coordinated API and
  caller migration. Do not change their scalar shape solely for frontend types.

- `generated/schema.graphql` is generated and gitignored; edit the owning SDL
  files and re-run `schema:print` instead of editing the exported schema.
  The exported schema must preserve the runtime field types, nullability, and
  subscription definitions; document conversion does not redefine the API.
  The exporter exits explicitly because shared utility imports open Redis
  clients that would otherwise keep the command running.
- `sales_api:schema:print` opts into the shared `nx.json` printer default.
  Its cache inputs include Sales source, the shared printer, and shared Apollo SDL helpers.
  `gateway:schema:compose` consumes this export; `sales_ui:codegen` hashes the composed SDL.
  Every Sales UI document is generated-typed and lint-enforced, so renaming or
  removing an SDL field fails the `sales_ui` codegen/build; update the UI
  documents in the same change.
- Public fields owned by other services come from the composed gateway schema, not Sales runtime SDL. Do not add backend fields just to satisfy frontend codegen.
- `Pos` has no `type` field in its public GraphQL contract. Frontend settings
  must use the existing configuration fields rather than inventing this field
  in handwritten types or codegen inputs.
- Deal and pipeline watch methods use atomic `$addToSet`/`$pull` updates and
  return the updated record, or null if it no longer exists. Repeated requests
  must not duplicate watchers or remove another user; concurrent requests must
  preserve each user's change. Initialize legacy null/missing arrays only with
  a conditional update. Preserve deal-watch activity logging.
- Label assignment returns `success` after publishing the updated deal. Stage
  sorting returns `ok` even for an empty stage. An archive with no stages
  returns an empty list, zero count, and empty pagination metadata.
- Deal-number lookup escapes the configured prefix after date substitution
  with the shared `escapeRegExp` helper. Anchor the prefix at the start (`^`)
  in both pipeline and deal fallback lookups so longer, unrelated prefixes
  cannot supply the counter. Keep the numeric `[0-9]+$` suffix as regex syntax;
  date placeholders, padding, and reset behavior stay intact.
- Request text used in regex patterns goes through `escapeRegExp` from
  `erxes-api-shared/utils`. The plugin-local ESLint config follows Operation's
  rule and requires escaping at each construction site, covering both
  `new RegExp(...)` and `RegExp(...)`. The guard checks only the first (pattern)
  argument; flags do not need regex escaping. Prefer escaped string
  `$regex` values with `$options`, including queries sent over tRPC.
  Phone lookup first limits input to digits, escapes them, then adds fixed
  `\D*` separators; its two documented lint exceptions preserve formatted-phone
  matching. Stage/archive fuzzy searches use the public `regexSearchText`
  helper, which escapes metacharacters itself; do not double-escape its input.
- Every Sales Query/Mutation field must have an explicitly registered
  resolver, and every registered root resolver must appear in SDL. The
  `resolverParity` tests compare the assembled registries and declarations.
  Resolver execution tests share `src/__tests__/helpers/graphql.ts` to select
  real SDL fields without duplicating the test schema setup.
  POS product-group writes use `productGroupsBulkInsert`; client-portal
  pipeline reads use `cpSalesPipelines`. Do not declare unimplemented aliases.
- `posEdit._id`, `dealsWatch._id`, `productGroupsBulkInsert.posId`, and
  `posSlotBulkUpdate.posId` are required in the SDL; resolvers also reject empty
  strings after checking permissions and before querying or mutating data.
- Preserve nullable argument signatures where existing caller documents use
  nullable variables. POS order detail still requires an id at runtime; POS
  bulk saves require arrays and valid row identifiers; deal product mutations
  require their target ids and object/array payloads; checklist creation needs
  a parent id and reordering needs an integer destination. Reject malformed
  inputs before writes. Empty arrays remain valid for clearing POS groups or
  slots and for an empty deal-product selection; position `0` is valid.
  Tightening those SDL arguments requires coordinating their caller documents,
  including `mongolian_ui`'s nullable POS order-detail id.
- Deal product JSON create/edit inputs require a non-empty string `productId`
  and finite price/quantity (root values or authoritative `uomInfo` values).
  Validate every incoming row before model access, including client-portal
  mutations. Preserve zero values, missing currency defaults, and legacy rows
  without entry-unit metadata; leave ratio/conversion validation to the UOM
  normalizer. Supplied root/entry UOM, currency, and pricing fields must have
  valid types, including the unit name inside `uomInfo`.
- `productsData.uomInfo` is the entry input; derive root `uom`, `quantity`,
  `unitPrice`, and amounts in base units before calculating deal totals.
  Preserve saved ratios, and sync info values after server-side pricing changes
  so later saves cannot restore stale input prices. Integrations use root fields.
- Default missing product-row currencies before calculating deal totals; read
  Core `configs.getConfig` with the current tenant's `subdomain`.
- Catalog pricing batches preserve `prioritizeRule: 'only'`, `totalAmount: 0`,
  quantity 1, and the request's tenant, branch, and department. Failed pricing
  calls abort sync instead of returning a partially discounted catalog.
- Catalog pricing may have at most eight requests in flight; never launch all
  catalog batches at once. Product-group sync opts into `throwOnError` when
  sending through `sendPosclientMessage`.
- Non-array synced eBarimt receipt results throw `TypeError` before deletion.
- POS cancellation requires matching `posId` and `posToken`; paid orders
  (`paidDate` set), including internal/temporary receipts without eBarimt,
  must be returned rather than cancelled. Returned orders
  and orders with successful/unresolved synced receipts must not be deleted.
- Receipt verification and loyalty failures propagate before order deletion.
  Cancellation affects `PosOrders` (embedded items included), not independently
  converted deals or Mongolian-owned receipt copies.
- Preserve tenant isolation through the request `subdomain` for every model and
  service access.
- `posAdd`/`posEdit` reject an enabled `customerCreateConfig` whose layout lacks
  both `primaryEmail` and `primaryPhone` or places an unknown code
  (`validateCustomerCreateConfig`).
- Cross-service access must use published GraphQL, tRPC, HTTP, event, or
  federation contracts.
- Deal stage-list indexes must retain cursor ordering and keep the common
  stage/status/parent count query covered.
- The default unscoped list query must remain aligned with the
  parent/order/id/status compound index.
- Deal amount calculations must preserve existing `tickUsed` semantics.
- Pipeline property ids must belong to Core `sales:deal` fields.
- `properties.valueUsage` runs only the query core hands it (`path`,
  `optionValues`); the path is core's to resolve, never rebuilt here.
- Segment content types use the `plugin:module.record` form the event
  dispatcher emits - `sales:sales.deals` - so a segment type and the event that
  moves it are the same string. `eventTypes` is declared only when they differ,
  which happens when two types share a collection.
- A relation states the segment types and the record types separately.
  `subjectType`/`relatedType` are segment content types; `subjectRecordType`/
  `relatedRecordType` are how core's relation records name the same things.
  They are different namings and one field serving both meant a rename on
  either side silently broke the other.
- No segment producer may derive its module from the content-type string.
  `splitType('sales:deal')[1]` is `deal`, and no module has that name. The
  content-type producers (`listSegmentMembers`, `countSegmentMembers`,
  `applyMembership`) route through `segmentModuleForContentType`, which reads
  the modules' own `contentTypes` declarations.
- `evaluateFields` is routed by the requests, through
  `createSegmentEvaluateFieldsHandler`, never by the input's `subjectType` like
  the other segment producers. A relation is measured from the subject that
  owns it, so the batch arrives with a subject type this plugin does not own -
  routing on it looks for a module named after another plugin's content type
  and fails at runtime. The same rule applies inside the module: no resolver
  may gate on `subjectType`.
- Anything added to `modules/sales/meta/segments/segments.ts` must also be
  passed through `src/meta/segments.ts`. The plugin-level object is what
  service discovery serialises, so a key declared only on the module is
  invisible to core and fails at runtime rather than at build time.
- Segment fields and evaluators are one file per content type under
  `meta/segments/fields/` and `meta/segments/evaluate/`, with an `index.ts`
  keying them by content type. Shared field builders come from
  `erxes-api-shared`; do not re-declare operator sets locally.
- A deal keeps its customer and company itself: `customer.deals` and
  `company.deals` are field joins (`on: 'related'`, `customerId` /
  `companyId`), and the deal `customers` / `companies` references are
  `kind: 'field'` on the same paths. Never query core's collections to find
  the link.
- A relation measure costs one query per request for the whole batch: a grouped
  aggregation for a field join, one `find` over the resolved related ids for a
  relation join. Never a query per subject.
- Both joins must fold an empty set the same way, so the same measure means the
  same thing however the two ends are linked.
- Only a stored numeric field can back a `sum`/`avg`/`min`/`max` measure. A
  derived field has no path to aggregate, so it is reported as unavailable
  rather than silently measured as zero.
- A relation predicate that does not compile in full makes the whole measure
  unavailable. Dropping the part that would not compile would count deals the
  segment asked to exclude.
- Stage-derived conditions in a relation predicate are rewritten to the
  `stageId` values they name before compiling, and the matching stages are
  chosen with the shared evaluator so the rewrite cannot drift from what the
  condition means elsewhere. No matching stage compiles to an empty `In`, which
  matches nothing - never to a dropped condition.
- `evaluateFields` must answer a whole batch in a bounded number of queries:
  one find for every projected field, and at most two more for the
  stage-derived `pipelineId`, `boardId` and `stageProbability`. Never one query
  per subject.
- A ref this plugin cannot answer - an undeclared field, a field owned by
  another content type, a relation - must be reported in `unavailable`.
  Returning it as an absent value would decide membership against a value that
  was never read.
- `totalAmount`, `unUsedTotalAmount` and `bothTotalAmount` are declared
  `projected` because the deal mutations persist them next to `productsData`.
  A write path that changes `productsData` without calling `getTotalAmounts`
  would make those segment fields wrong.
- Federated sales GraphQL contracts including `salesPipelineDetail`,
  `salesPipelinesAdd`, and `salesPipelinesEdit`.
- Agents discover the GraphQL schema and execute through the gateway as the
  acting user. Internal tRPC procedures carry no agent metadata.

- tRPC service contracts under `src/trpc` and module-specific `trpc`
  directories for platform and cross-plugin callers (not agent-visible).
- GraphQL `salesLoyaltyRules` and `salesLoyaltyRulesSave(rules)` (whole
  configuration replaced at once, `pipelinesEdit` permission, validated by
  `loyaltyRuleIssue`); `salesLoyaltyTierRules` and
  `salesLoyaltyTierRulesSave(rules)` (same, validated by
  `loyaltyTierRuleIssue`); `Pos.earnScoreCampaignId`; `Pos.earnTier` (JSON); `Pos.acceptCoupons`
  (Boolean, off by default; synced to posclient, where it shows the coupon input);
  `SalesStage.loyaltyPoints`
  (what the saved rules make of a stage, for the pipeline editor's badges:
  `earns`, `refunds`, and the `tier` rule it sets, none in a refund stage).
- Record reference resolvers under `src/modules/sales/meta/references`.
- Sales metadata and automation contracts under `src/modules/sales/meta`.

### Consumes

- Core `fields.find` over tRPC for `sales:deal` property validation.
- `erxes-api-shared` core types, utilities, and core module extension points.
- Public platform contracts for products, customers, companies, users,
  branches, departments, and related records.
- Loyalty tRPC `score.spend` / `score.earn` / `score.refund` with
  loyalty-owned inputs; sales never sends whole deals or orders to loyalty.
- Mongolian `mnConfigs` values for `EBARIMT` and POS-specific
  `posInEbarimt` eBarimt settings.
- Loyalty-facing sales deal payloads through published target/reference
  contracts, not loyalty internals.
- Deals keep their customer (`customerId`), never the inbox conversation they came from: there is no `sourceConversationIds` field, no conversation convert (`salesConvertToInfo` and the "converted" activity log are gone), and the create-deal automations attach the triggering conversation's customer. Stored `sourceConversationIds` values are left in place but nothing reads them.

## Data and State

- Tenant-scoped Mongoose models are generated per `subdomain`.
- Pipeline documents store a unique array of selected Core field ids in
  `propertyIds`; no property definitions are duplicated in sales storage.
- Tenant-scoped Mongo collections are loaded through plugin connection
  resolvers.
- Deal monetary state is stored in `productsData`, `totalAmount`,
  `unUsedTotalAmount`, `bothTotalAmount`, `mobileAmount`, `mobileAmounts`, and
  `paymentsData`.
- Pipeline payment type configuration may attach `scoreCampaignId` to payment
  types used by loyalty-related references.
- Loyalty rules live in `sales_loyalty_rules` (points) and
  `sales_loyalty_tier_rules` (tier by amount); a POS keeps its own
  `earnScoreCampaignId` and `earnTier`.

## Local Invariants

- Never accept a pipeline property id outside Core `sales:deal` fields.
- Preserve tenant isolation by using the request `subdomain` for every model,
  service, resolver, worker, and route access.
- Pipeline stage updates and property selections remain one pipeline mutation.
- Checked pipeline deal queries preserve master branch department-user
  visibility and compose with existing filters through `$and`.
- Do not fetch department visibility data when the pipeline has no
  `departmentIds`.
- `excludeLoyaltyAmount` must calculate from the deal total minus
  score-campaign payment amounts, so missing or empty `paymentsData` returns
  the full total amount.
- Deal amount fallbacks should preserve the existing `tickUsed` semantics used
  by sales totals.
- POS order card conversion must not call the sales plugin through its own
  tRPC route; use local deal model helpers and publish deal subscriptions
  locally so completed POS-client orders keep one converted deal per order.
- Product-level `discountInfos` records auto discounts by source
  (`pricing`, `voucher`, `score` when applicable) and keeps direct/manual
  discounts under `hand`; auto recalculation must not erase `hand`.
- Agent-facing deal reads are always bounded and strictly shaped: `deal.find`
  clamps `limit` to 1–100 (default 20) on every path and rejects unknown input
  keys by name, `deal.count` takes `{ filter? }` — an agent's unbounded
  `deal.find {}` over 1.27M deals crash-looped this service (exit 139) on
  2026-08-20, and wrapper-shaped input silently matched nothing.
- A segment content type is named the way the event dispatcher names it
  (`sales:sales.deals`, `sales:pos.orders`). A declaration under any other name
  is never matched to a write, which is a segment that silently never updates.
- A collection a module exposes to segments is declared in its own
  `meta/segments/collections.ts` and nowhere else. A content type added to the
  source but not to the membership map - or the other way round - is a segment
  that lists members and records none of them.
- Every field-joined relation needs an index on the path it groups by
  (`pos_orders.customerId`). Without one the measure scans the collection.
- Relation measurement and field reading belong to
  `evaluateOwnedSegmentFields`; never re-implement a fold, a projection or a
  join here. Sales states its collections, its declarations and its stage
  rewrites, and nothing else.
- The plugin answers segment requests only about its own collections. No
  segment producer here may call another plugin: that shape is what produced
  the plugin-to-plugin RPC loop the Elasticsearch-era producers carried.
- Never compile a deal segment filter without passing through the `timeZone`
  the caller supplied. Dropping it silently moves every day boundary by the
  organization's offset, and the same record then answers one way to a query
  and another way to an event.
- Every stage-derived deal field (`pipelineId`, `boardId`, `stageProbability`)
  must declare `sales:sales.stages` in `dependsOn` with `via: 'stageId'`.
  Editing a stage changes those values on every deal in it with no write to a
  deal, so without the declaration nothing re-checks their segments. A pipeline
  moved to another board is one hop further than `via` reaches and stays
  uncovered.
- Document attribute replacement must emit block-level results (`table`,
  `image`) as siblings of the block that held the attribute, never inside its
  inline `content` array: Core's `blocksToHtml` renders inline content as text
  only, so a table left inline is dropped and `productsInfo` prints nothing.
- `replaceDealContent` must emit one processed document per `replacerId`, in
  `replacerIds` order: `Deals.find({ _id: { $in } })` returns Mongo natural
  order, which does not match the order the caller selected the deals in.
- Do not introduce new `schemaWrapper` usage in backend schemas.

## Validation

- POS filter smoke: save category/tag/product includes and each exclusion, reopen, sync, and verify the include union minus all exclusions appears. Tag-only/product-only groups must include each product's direct category; moving or removing tags/products must remove obsolete POS membership.
- `pnpm nx test sales_api --runInBand --testPathPattern="(productGroupFilter|catalogSync|posProductSync|getProductPricing)"`

- Permission regression: `requiredInputs.test.ts` covers denied deletion before model
  access and product-row deletion without product-edit permission.

- `node --test backend/plugins/sales_api/src/modules/pos/db/definitions/__tests__/coverDetails.test.cjs`
- `node --test backend/plugins/sales_api/src/modules/pos/db/models/__tests__/posOnServer.test.cjs`
- Cover smoke: confirm in POS client (editing is locked), remove in Sales
  (POS client becomes editable), edit and confirm again. A POS client failure
  must keep the Sales cover available for retry.
- `pnpm nx test sales_api` (`src/modules/sales/meta/automations/__tests__/builderConfigContract.test.ts`: action schemas accept every config in the neighbouring `builderActionConfigs.json`, which the builder wrote)
- `pnpm nx test sales_api` (`src/modules/sales/meta/automations/__tests__/configSchemas.test.ts`)
- `pnpm exec tsc --noEmit -p backend/plugins/sales_api/tsconfig.json`
- `pnpm nx run sales_api:schema:print --skip-nx-cache` prints this subgraph offline for `gateway:schema:compose`.
- `pnpm nx lint sales_api`
- POS catalog sync smoke: sync more than 100 products with base pricing and
  verify discounts apply to products on both sides of each batch boundary.
- `pnpm nx build sales_api`
- `node --test backend/plugins/sales_api/src/modules/pos/utils/__tests__/cancelOrder.test.cjs`
- POS cancellation smoke: token-owned unpaid order without successful eBarimt is
  removed; receipt/loyalty service failures retain it, cross-POS and returned
  orders are rejected, and a missing order is an idempotent successful retry.
- Paid POS order smoke: `pos.cancelOrder` rejects an order with `paidDate`
  before receipt/refund service calls or deletion, including `billType: '9'`.
- `pnpm nx build:packageJson sales_api`
- `pnpm nx test sales_api`
- Agent smoke: with sales running, the core agent's capabilities catalog
  (`agentsTools`) omits `cpDeals` and lists `deals`, and a pipeline question
  activates `sales-pipeline-analysis`.
- Smoke scenario: with an `everyBoard` rule (Won earns, Lost refunds) move a
  deal with a customer to Won, edit its products, move it to Lost and back;
  the customer's points follow the current amount and end equal to one Won.
- Smoke scenario: an automation sets a deal's stage to Won (set property) or
  creates one there; the deal's customer earns as from the deal form.
- Smoke scenario: query deals by `stageId` and verify `totalCount` does not
  fetch deal documents.
- Smoke scenario: query deals without a stage using default order and verify
  the winning plan has no blocking `SORT` stage.
- Create or edit a pipeline with valid and invalid deal property ids; valid ids
  persist and an invalid id is rejected.
- Smoke scenario: resolve `sales:deal.excludeLoyaltyAmount` for a deal with
  empty `paymentsData`; it should return the deal total amount, not `0`.
- Smoke scenario: print several deals at once; page N of the output is the
  deal in row N of the print selection table.
- Smoke scenario: print a deal document whose template embeds the
  `productsInfo` attribute; the processed HTML contains a `<table>` with one
  row per `productsData` item.
- Agent smoke: discover a sales GraphQL operation and run it through the
  gateway as the acting user; denied resolver permissions remain denied.

- Smoke scenario: complete and resync a POS client order with a matching
  `cardsConfig` branch; the order keeps one `convertDealId`, and the second
  sync updates that deal instead of creating another.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-11-08` — Deal creation time for pricing schedules

- **Summary:** Deal pricing passes the deal's creation time to loyalty, so a pricing plan scheduled by when the order was created reads it.
- **Affected areas:** `modules/sales/graphql/resolvers/mutations/loyaltyUtils.ts`.
- **Contracts changed:** consumes loyalty `pricing.checkPricing.orderCreatedAt`.

### `2026-11-05` — POS orders link their loyalty entries

- **Summary:** POS orders keep `scoreLogIds` from loyalty's spend, earn and refund answers; `salesPosScoreLogs`, `salesPosScoreLogInsights` and `salesPosScoreLogTimeline` list and sum them across POSes. Deal and POS sums share `scoreLogSums.ts`.
- **Affected areas:** `modules/pos/{utils.ts,utils/orderScoreLogs.ts,@types/orders.ts,db/definitions/orders.ts,db/models/Orders.ts,graphql/schemas/orders.ts,graphql/resolvers/queries/orders.ts}` (+ `__tests__/orderScoreLogs.test.ts`), `modules/sales/utils/{scoreLogSums,dealScoreLogs,dealScoreLogTimeline}.ts`, `backend/saas-migrations/sales/commands/linkPosOrderScoreLogs.ts`.
- **Contracts changed:** `PosOrder` field `scoreLogIds`; new queries `salesPosScoreLogs`, `salesPosScoreLogInsights`, `salesPosScoreLogTimeline`.

### `2026-11-05` — Recalculations link both entries; points over time

- **Summary:** A recalculated deal links loyalty's reversal and replacement (`scoreLogIds`); insights and the timeline count recalculations apart (totals keep what was first given, rankings read what is earned or spent now). `salesDealScoreLogTimeline` gives the points per day, week or month.
- **Affected areas:** `modules/sales/utils/{dealPoints,dealScoreLogs,dealScoreLogTimeline}.ts` (+ `__tests__/{dealPoints,dealScoreLogInsights,dealScoreLogTimeline}.test.ts`), `modules/sales/graphql/{schemas/deal.ts,resolvers/queries/deals.ts}`.
- **Contracts changed:** consumes loyalty `score.earn` / `score.spend` `scoreLogIds`, `score.totalsByIds` `recalculates` and `score.timelineByIds`; new query `salesDealScoreLogTimeline`.

### `2026-11-05` — Deals link the loyalty entries they caused

- **Summary:** Deals keep `scoreLogIds` from loyalty's spend, earn and refund answers; `salesDealScoreLogs` pages those links with the deal list's filters so the UI can list point movements per pipeline and stage.
- **Affected areas:** `modules/sales/{@types/deal.ts,db/definitions/deals.ts,db/models/Deals.ts,utils/dealPoints.ts,utils/dealScoreLogs.ts,graphql/schemas/deal.ts,graphql/resolvers/queries/deals.ts}`, `utils/__tests__/dealPoints.test.ts`.
- **Contracts changed:** `Deal` schema field `scoreLogIds`; new queries `salesDealScoreLogs`, `salesDealScoreLogInsights`; consumes loyalty `score.earn.scoreLogId`, `score.totalsByIds`.

### `2026-10-24` — Deal notifications reach email and push

- **Summary:** Deal notifications went straight to core `notifications.create` with no event, so they never reached email or push. They now go through the shared `sendNotification` with an `event` key. Meta adds `dealUpdated`; the `note` module (no sender) is gone.
- **Affected areas:** `src/meta/notifications.ts`, `modules/sales/utils/notifications.ts` (moved from `modules/sales/utils.ts`), `modules/sales/graphql/resolvers/mutations/utils.ts`.
- **Contracts changed:** notifications meta events; consumes `sendNotification` instead of core `notifications.create`.

### `2026-10-14` — Vouchers used once, returned with the order

- **Summary:** POS returns give vouchers back and a refused voucher no longer skips the points; a deal holds its picked voucher, prices with it and its coupon, uses them only in an earning stage and returns or releases them in a refund stage or on removal.
- **Affected areas:** `modules/pos/utils.ts`, `modules/sales/utils/dealPoints.ts` (+ test), `modules/sales/db/models/Deals.ts`, `modules/sales/graphql/resolvers/mutations/{utils,loyaltyUtils}.ts` (deal `confirmLoyalties` helper removed).
- **Contracts changed:** Consumes loyalty tRPC `voucher.returnTarget`, `voucher.hold`, `voucher.release`, `voucher.releaseTarget`.

### `2026-10-09` — Purchases set a tier without automations

- **Summary:** One tier per purchase, configured beside the points rules: deals by the narrowest tier rule at their stage, POS orders by the POS's `earnTier`; both call loyalty `score.applyPurchaseTier` and never undo it.
- **Affected areas:** `modules/sales/utils/{loyaltyRules,dealPoints}.ts` (+ tests), `modules/sales/db/{definitions/loyaltyRules.ts,models/LoyaltyTierRules.ts}`, `modules/sales/graphql/{schemas/loyaltyRule.ts,resolvers/*/loyaltyRules.ts}`, `connectionResolvers.ts`, `modules/pos/{orderPoints.ts,utils.ts,@types/pos.ts,db/definitions/pos.ts,db/models/Pos.ts,graphql/schemas/pos.ts}` (+ tests).
- **Contracts changed:** `salesLoyaltyTierRules`, `salesLoyaltyTierRulesSave`, `Pos.earnTier`; calls loyalty `score.applyPurchaseTier`.

### `2026-10-08` — Deals and POS earn without automations

- **Summary:** Earning follows where a deal stands, configured as board/pipeline/stage rules in sales; paid POS orders earn in the POS's campaigns. Rules replace the stage `refundPoints` setting.
- **Affected areas:** `modules/sales/utils/{loyaltyRules,dealPoints}.ts` (+ tests), `modules/sales/db/{definitions,models}/loyaltyRules`, `modules/sales/graphql/{schemas/loyaltyRule.ts,resolvers/*/loyaltyRules.ts}`, `modules/sales/meta/automations/purchase.ts`, `modules/pos/{orderPoints.ts,utils.ts}` (+ tests), POS schema, `trpc/deal.ts`, `meta/payments/createDealFromPayment.ts`, `meta/automations/{automationHandlers.ts,action/createDealAction.ts,action/createAction.ts}`; jest test target added.
- **Contracts changed:** `salesLoyaltyRules`, `salesLoyaltyRulesSave`, `SalesStage.loyaltyPoints`, `Pos.earnScoreCampaignId`; calls loyalty `score.earn`.

### `2026-10-01` — POS card conversion reuses deals

- **Summary:** Completed POS client orders now create converted card deals
  through local sales model helpers instead of the sales plugin's own tRPC
  route, resyncing an order with `convertDealId` updates that deal, and copied
  descriptions include both the order and delivery descriptions.
- **Affected areas:** `src/modules/pos/utils.ts`.
- **Contracts changed:** None.

### `2026-10-01` — Point payments checked first, refunds by stage

- **Summary:** A deal's point payment is checked with loyalty before the deal is saved (created, edited or moved) and no longer fails silently; copies drop point payments; stages carry a `refundPoints` setting (unset = `Lost` refunds), leaving a refunding stage spends again, and removed deals are refunded.
- **Affected areas:** `modules/sales/utils/dealPoints.ts`, `graphql/resolvers/mutations/{utils,loyaltyUtils}.ts`, `db/models/Deals.ts`, stage type, schema and GraphQL.
- **Contracts changed:** `SalesStage.refundPoints`; deal creation, edits, moves and removals may now fail with loyalty's error.
