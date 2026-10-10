# `sales_api` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/sales_api`
- **Last synchronized:** `2026-10-11`

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

- POS catalog sync checks loyalty base pricing in batches of 100 products,
  with at most four concurrent requests, and merges discounts by product id
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

## Architecture

| Area                       | Path                                                      | Responsibility                                                                                       |
| -------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Runtime                    | `src/main.ts`, `src/connectionResolvers.ts`, `src/trpc`   | Start the plugin, load tenant-scoped models, and expose tRPC procedures.                             |
| Sales models               | `src/modules/sales/db`                                    | Store deals, boards, pipelines, stages, labels, and sales metadata.                                  |
| Sales GraphQL              | `src/modules/sales/graphql`, `src/apollo`                 | Provide sales schemas, resolvers, mutations, queries, and subscriptions.                             |
| References and automations | `src/modules/sales/meta`                                  | Provide reference values, automation constants, and after-process behavior.                          |
| Segment fields             | `src/modules/sales/meta/segments/fields`                  | Declare which `sales:sales.deals` fields are filterable, with their operators, input and mongo path. |
| Segment evaluation         | `src/modules/sales/meta/segments/evaluate`                | Resolve a batch of deals against the value refs a segment plan assigns to this plugin.               |
| Relation measures          | `src/modules/sales/meta/segments/evaluate/relations.ts`   | Fold a relation into deals for a batch, over a core-resolved edge table or a stored join.            |
| Stage-derived filters      | `src/modules/sales/meta/segments/evaluate/stageFilter.ts` | Rewrite pipeline, board and probability conditions into the stage ids they name.                     |
| Documents                  | `src/modules/sales/documents`                             | Generate sales document content and amount mappings.                                                 |
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
- Sales tells loyalty what a purchase paid with points and when it is undone
  (`modules/sales/utils/dealPoints.ts`): `planDealPoints` decides per deal
  create, edit or move (a new deal passes its `customerIds` and a pre-made
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
  (`spendOrderPoints`, also after `posOrderChangePayments`), `score.earn` for
  the POS's one `earnScoreCampaignId` once paid (`planOrderPoints` /
  `earnOrderPoints`), `score.applyPurchaseTier` for the POS's one `earnTier`
  (`{accountTypeId, bands, onlyUpgrade}`, checked by `validateEarnTier`) with
  the order's `totalAmount` (with the order, named `POS #number`, and its
  cashier as target and actor), and `score.refund` for returned orders (the tier
  stays), still without throwing.
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
- Product changes reach POS clients through `afterMutation` (`meta/productUtils.ts`);
  core's bulk `productsSetConditionCodes` / `productCategorySetConditionCodes`
  bypass `productsEdit`, so each touched product in a POS's groups is resent.
- POS product sync calculates tax rules from the POS-specific `posInEbarimt`
  config document's `value`; selected VAT and city-tax rules are fetched through
  Mongolian `productRules.find` with a `data` filter before sending products.
- Read-only deal, stage, pipeline, POS, and POS-order tRPC procedures are
  exposed to AI agents through `/agent-tools/manifest` and `/agent-tools/call`
  via `.meta(agentMeta(...))` annotations; every other procedure remains
  invisible to agents.

## Architecture

| Area                | Path                                                    | Responsibility                                                        |
| ------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| Bootstrap           | `src/main.ts`                                           | Starts and registers the sales plugin                                 |
| Runtime             | `src/main.ts`, `src/connectionResolvers.ts`, `src/trpc` | Start the plugin, load tenant-scoped models, and expose tRPC          |
| Agent tool metadata | `src/trpc/agentMeta.ts`                                 | Local `agentMeta` helper for agent-callable tRPC annotations          |
| Models              | `src/modules/sales/db`                                  | Sales Mongoose schemas and models                                     |
| GraphQL             | `src/modules/sales/graphql`, `src/apollo`               | Sales schemas, resolvers, mutations, queries, and subscriptions       |
| Pipeline validation | `src/modules/sales/utils/pipelineProperties.ts`         | Validates pipeline property ids through Core tRPC                     |
| References          | `src/modules/sales/meta`                                | Sales reference values, automation constants, and after-process logic |
| Documents           | `src/modules/sales/documents`                           | Generate sales document content and amount mappings                   |
| POS and ecommerce   | `src/modules/pos`, `src/modules/ecommerce`              | Provide sales-owned POS and ecommerce behavior                        |

## Contracts

### Provides

- Internal `pos.cancelOrder({_id, posToken, userId?})` tRPC mutation returns
  `{cancelled: true}` after cancelling the POS order; it is not agent-callable.
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

## Data and State

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
- POS order items keep the optional `conditionCode` (core product condition code) the POS client sold a line under, for reporting.
- POS `customerCreateConfig.layout` rows hold customer system field codes from
  `POS_CUSTOMER_SYSTEM_FIELDS` and `property:<fieldId>` entries.

## Local Invariants

- Catalog pricing batches preserve `prioritizeRule: 'only'`, `totalAmount: 0`,
  quantity 1, and the request's tenant, branch, and department. Failed pricing
  calls abort sync instead of returning a partially discounted catalog.
- Catalog pricing may have at most four requests in flight; never launch all
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
- A deal carries no customer or company id. `customer.deals` and
  `company.deals` are declared `join: { via: 'relation' }`, and core resolves
  the edges from its own relation records and sends them on the request. Never
  declare a field join on a path the deal schema does not store, and never
  query core's collections to find the link.
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
- Agent-callable tRPC tools (admit-only via `.meta({ agent })`), each gated by
  the listed sales permission action:
  - `deal.findOne`, `deal.find`, `deal.count`, `deal.getLink` — `showDeals`
  - `stage.findOne`, `stage.find` — `showDeals`
  - `pipeline.findOne` — `pipelinesWatch`
  - `pos.findOne`, `pos.find` — `posRead`
  - `pos.ordersDeliveryInfo`, `orders.findOne`, `orders.find` — `posOrderRead`
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
- Agent tool annotations are admit-only: never annotate raw-mongo helpers
  (`deal.aggregate`, `deal.updateOne`, `orders.updateOne`), system-user
  procedures (`deal.create`, `deal.updateOne`), procedures that trust a caller
  supplied `user` object (`deal.createItem`, `deal.editItem`), POS device-sync
  endpoints (`pos.createOrUpdateOrders*`, `pos.confirmCover`), token-scoped
  lookups (`pos.ecommerceGetBranches`), destructive bulk operations
  (`deal.removeItem`), or internal plumbing (`deal.subscriptionWrapper`,
  `deal.tag`, `deal.getFilterParams`, `deal.replaceContent`,
  `deal.contentIds`, `deal.generateInternalNoteNotif`, `deal.notifiedUserIds`,
  `deal.createCommentActivityLog`, `documents.editorAttributes`,
  `fields.getFieldList`). New procedures are agent-invisible unless explicitly
  annotated.

## Validation

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
- Smoke scenario: `GET /agent-tools/manifest` on the sales service lists only
  the annotated procedures above; `deal.create`, `deal.updateOne`, and
  `deal.subscriptionWrapper` never appear.
- Smoke scenario: complete and resync a POS client order with a matching
  `cardsConfig` branch; the order keeps one `convertDealId`, and the second
  sync updates that deal instead of creating another.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

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

### `2026-09-29` — Purchases handed to loyalty

- **Summary:** Deal and POS triggers declare a purchase for loyalty's Adjust score action; point payments and refunds go to loyalty's `score.spend` / `score.refund` instead of `consumeTargetChange`.
- **Affected areas:** `src/modules/{sales,pos}/meta/automations/{purchase,constants}.ts`, `salesRefernceCustomResolvers.ts`, `mutations/{loyaltyUtils,utils}.ts`, `pos/utils.ts`, `pos/graphql/resolvers/mutations/orders.ts`.
- **Contracts changed:** Deal and POS trigger outputs `paidAmount`, `purchaseItems`; trigger `actionInputs`.

### `2026-09-21` — The deal action says it needs someone to act for

- **Summary:** `Create deal` now declares `requiresActor: true` on its action
  descriptor. The deal it opens takes an owner from the run's
  `createdVia.actorId`, and the builder reads this declaration to decide
  whether putting an automation live is worth saying whose name its records
  will carry. Nothing about how the deal is created changed.
- **Affected areas:** `src/modules/sales/meta/automations/constants.ts`
- **Contracts changed:** The action descriptor carries `requiresActor`, a field
  `erxes-api-shared` added for every plugin to use.

### `2026-09-14` — A deal an automation opened records what produced it

- **Summary:** Deals created by an automation now carry `createdVia` — the
  configuration that produced them, the run that did it, and whose
  configuration it was — and take that actor as `userId` when the execution
  target carries none, instead of being left ownerless.
- **Affected areas:**
  `src/modules/sales/meta/automations/action/createDealAction.ts`,
  `src/modules/sales/@types/deal.ts`
- **Contracts changed:** Consumes the new `TCreatedVia` and
  `IExecution.createdVia` from `erxes-api-shared`; `createdVia` itself is added
  to every schema by `schemaWrapper`.

### `2026-09-17` — Property types declare system fields

- **Summary:** The `deal` property types now declare `systemFields`, shown
  as the "Basic information" group in Settings → Properties.
- **Affected areas:** `src/meta/properties.ts` (`deal`), `src/main.ts`
- **Contracts changed:** Plugin meta `properties.types[].systemFields` added.

### `2026-09-13` — Discount info type cleanup

- **Summary:** Deal product discount info types now use a plain string with
  documented known values to avoid redundant literal-union Sonar warnings.
- **Affected areas:** `src/modules/sales/utils/discountInfos.ts`.
- **Contracts changed:** None.

### `2026-09-12` — Deal product discount breakdowns

- **Summary:** Deal products now persist `discountInfos` and merge automatic pricing/voucher discounts with preserved manual `hand` discounts before recalculating totals.
- **Affected areas:** `src/modules/sales/db/definitions/deals.ts`, `src/modules/sales/@types/deal.ts`, `src/modules/sales/utils/discountInfos.ts`, `src/modules/sales/db/models/Deals.ts`, `src/modules/sales/graphql/resolvers/mutations/{deals,loyaltyUtils,utils}.ts`.
- **Contracts changed:** Deal `productsData` JSON may now include product-level `discountInfos`.
