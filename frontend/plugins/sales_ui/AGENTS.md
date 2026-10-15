# `sales_ui` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/sales_ui`
- **Last synchronized:** `2026-10-15`

## Scope

### Owns

- Sales boards, pipelines, stages, deals, deal detail UI, deal products,
  payments, POS settings, POS management screens, and sales Module Federation
  route/widget registration.

### Does not own

- Sales persistence or GraphQL resolvers; those live in `sales_api`.
- Backend POS persistence, POS client runtime behavior, core property
  definitions, shared UI primitives, core settings infrastructure, or other
  plugin routes.

## Current Capabilities

- POS Summary displays order aggregates from `posOrdersGroupSummary`, with
  filters, payment columns, and totals. Its table has no row selection or
  create/delete actions; summary rows are report groups, not stored records.
- POS product settings independently persist `isShowRemainder` for display and
  `isCheckRemainder` for preventing negative stock, with category exclusions.

- Runs as the sales Module Federation remote.
- Development Rspack serving ignores generated dependency/cache/output folders
  to keep local file watchers bounded.
- Pipeline create/edit supports general settings, stages, product
  configuration, and grouped selection of Core `sales:deal` properties.
- "Score earn configuration" (`deals/loyaltyRules`, button beside Add
  pipeline, dialog state in `loyaltyRulesDialogOpenAtom`) edits the whole
  `salesLoyaltyRules` list at once in three groups — every board and every
  pipeline of a board by probability, specific stages of one pipeline by id —
  the campaign field is loyalty's picker (`RecordPickerWidget` for
  `loyalty:score.campaigns`, with New and Edit; absent without loyalty),
  validated per row (zod, translated issue keys), warning where a row replaces
  a wider rule of its campaign and when active deal automations already give
  points in the same campaigns (`useLoyaltyRuleNotes`), and on rows whose
  campaign is not active (`SalesScoreCampaignOptions`; only active campaigns
  give points). Each stage of the
  pipeline being edited shows what the saved rules make of it
  (`PipelineStageLoyaltyBadge`, query `SalesStageLoyaltyPoints`, only asked by
  the editor) with a link back to the dialog; stages no longer carry a refund
  setting. With loyalty enabled (`isEnabled('loyalty')`) the dialog has a
  Points and a Tier tab (`useLoyaltyRulesDialog`): the Tier tab edits
  `salesLoyaltyTierRules` in the same three groups (`LoyaltyTierRuleRow`,
  `useLoyaltyTierRulesForm`), each row a customer wallet with tiers
  (`SalesLoyaltyTierWallets` → loyalty `loyaltyAccountTypes`), where the
  tier is set, a From/To band per tier and "only upgrade"
  (`TierBandsFields`, `tierBands.ts`); changing the wallet clears its bands,
  and a narrower row is flagged since one tier rule decides a stage. Stage
  badges also show the tier a stage sets (`SalesStageLoyaltyPoints.tier`).
  With loyalty on, deals show the net points they moved: a "Loyalty points"
  column in the list table (`DealLoyaltyPointsCell`) and a line at the foot of
  a board card (`DealLoyaltyPointsBadge`, only when non-zero). One
  `DealLoyaltyTotalsProvider` per view (around `DealsRecordTable`, and around
  `GenericBoard` in `DealsBoard` with every loaded card's id) asks
  `loyaltyScoreTargetTotals` once and keeps the last answer while columns load
  (`previousData`); a card dragged outside the provider shows none.
  Loyalty's settings tab on a pipeline or POS gets what sales already does
  there as `context.config.loyalty` (`loyaltyBuiltInConfig`: a pipeline's
  stages' earning campaigns and tier wallets via `usePipelineLoyaltyBuiltIn`,
  a POS's `earnScoreCampaignId` and `earnTier` wallet via `usePosDetail`). Save
  validates and saves only the changed forms, switches to the tab holding
  an error, and closes once both are saved.
- With loyalty on, a deal's Products tab shows one voucher line
  (`modules/deals/loyaltyVouchers`: `DealVoucherRow`, `DealVoucherDialog`,
  `useDealVouchers`) for the first customer: the chosen voucher and coupon as
  removable chips, one usable voucher applied in a click, and a dialog listing
  the customer's vouchers (`loyaltyOwnerSaleVouchers`, grouped by campaign and
  value, unusable ones greyed with the reason) and a coupon input checked with
  `loyaltyCouponCheck` before it is saved. A choice is saved as
  `extraData.voucherId` / `couponCode` together with the products, so the
  backend holds the voucher and prices the deal again. Once loyalty reports
  the pick `settled` (used in an earning stage), the line is read-only: chips
  without remove, no picks or dialog, and a "used on this deal" note.
- The POS Payment tab's `AcceptCouponsField` turns on the till's coupon
  input (`Pos.acceptCoupons`, off by default).
- The POS Payment tab picks the score campaigns paid orders earn in
  (`EarnScoreCampaignsField`, `Pos.earnScoreCampaignId`): one campaign only,
  since two would both earn on the same order; chosen with loyalty's picker
  (`RecordPickerWidget`, New/Edit included), clearable, with warnings when
  inactive. Payment types'
  score campaign field (`OtherPaymentsField`, POS and deal product config) is
  the same picker. A chosen campaign that an active POS-order automation (this POS or
  any) also gives points in is flagged (`usePosEarnAutomations`). Below it,
  with loyalty enabled, one wallet's tier set by the paid amount
  (`PosEarnTierField`, `Pos.earnTier` JSON `{accountTypeId, bands,
  onlyUpgrade}`, clearable to `null`; saving refuses a wallet without bands). Both come from the `posDetail` query (`graphql/queries.ts` `posCommonFields`), which the tab loads and saves back; a field missing there is saved as empty. The POS
  Automations tab is listed last, beside the Loyalty tab.
- In a deal's Payments tab a payment type with a score campaign asks loyalty's `loyaltyScoreSpendLimit` (`DealPointPaymentLimit` / `useDealPointLimit`) and shows the customer's points and the most it may pay; the row stays disabled without a customer, while loading, or when loyalty blocks spending, and typed amounts are capped at the limit. There is no hand refund: refunds follow stages.
- Deal detail renders only the properties selected on the deal's pipeline;
  legacy pipelines continue showing all deal properties until their selection is
  saved for the first time.
- Deal detail chips (priority, assignee, dates, labels, tags, branch,
  department, broker) render as a field group: a muted label segment, then the
  value and a chevron, e.g. `Broker | None ⌄`; the stage chip has no label.
  The broker entity selector that follows is
  labelled by its type (`Customer`, `Company`, `User`) with a `Select broker`
  placeholder.
- Deal detail header shows a `⋯` actions menu (`DealsActions`
  `variant="menu"`) with watch/unwatch, duplicate, print (shared
  `PrintDocument` sheet), archive/unarchive, and remove for archived deals.
  These actions appear only there, not in the detail overview body.
- Deal detail overview lays fields out in three rows: stage, start date, close
  date, assignee and priority; then labels, tags, branch, department and
  broker; then checklist and attachment upload.
- Deal product management supports filtering, advanced product fields, tax
  fields, row editing, duplication, deletion, product bulk add, footer totals,
  save feedback, and an expanded dialog view for working with dense product
  tables.
- Deal product rows default their UOM to the selected product's base UOM when
  adding or replacing a product. Normal view edits UOM, unit price, and quantity
  through `uomInfo: { uom, ratio, unitPrice, quantity }` immediately after the
  product column. Advanced groups base unit price, base quantity, then the fixed
  52px read-only base UOM immediately after the entry columns, including saved
  table orders, and also shows the saved ratio. Entry info is filled from base
  fields when empty or partial; updates preview base-unit calculations locally.
  The selector includes saved units even when removed from the product.
  Deal detail fetches product `uom` and `subUoms` so these choices remain
  available after reload without opening the product chooser.
  Empty row UOMs use the product's base UOM in the table and save payload.
  Empty row currencies use the first configured `dealCurrency` (or `MNT`
  without a configured currency) in local state, table totals, and save payloads.
- Deal product bulk add passes the deal pipeline id into the shared product
  chooser so enabled plugin remainder providers can resolve pipeline-scoped
  stock without sales importing those plugins.
- Deal product advanced view manages only product-level manual `hand` discounts
  while preserving automatic discount sources in `discountInfos`.
- Deal product tax controls live behind a separate Tax view toggle; Advanced
  view no longer owns tax columns or footer total tax controls.
  The `VAT applied` row column is present only with Tax view enabled.
- POS permission settings assign admins and cashiers and persist cashier temp
  bill, report visibility, customer creation, and direct discount controls
  through `permissionConfig`.
- POS "Customer registration" tab (`CustomerCreate` /
  `useCustomerCreateConfig`) enables cashier-side customer creation, picks
  whether the cashier becomes owner, toggles which system fields and Core
  `core:customer` properties show, and arranges them with the shared
  `ui-modules` `LayoutEditor`. Properties deleted or archived since saving
  show a warning and are stripped on the next save. "Add field" (gated by
  `fieldsManage`) opens the shared `ui-modules` `PropertyAddSheet` for
  `core:customer` and places the new property on the form, visible.
- POS and pipeline "Automations" tabs (`PosAutomations`, `PipelineAutomations`)
  share `modules/automations` (`SourceAutomations` / `useSourceAutomations`,
  query `SalesSourceAutomations`): they list the automations whose trigger runs
  on this record or on every record of its kind (no `posId` / `pipelineId`,
  "All POS" / "All pipelines" badge), open new ones through
  `buildAutomationSeedLink` ("Other automation"), and carry `returnTo` on seeds
  and edit links; each row deletes its automation after a confirm
  (`SalesSourceAutomationRemove`, evicted from the Apollo cache so every list
  showing it drops it).
- Other plugins' sections (`relationSettingsWidgets`, from `ui-modules`
  `useRelationSettingsModules`) become their own tabs: POS sidebar items keyed
  `relation.<pluginName>.<name>` (`POS_RELATION_TAB_PREFIX`, saved POS only)
  and pipeline form tabs (saved pipeline only). Each renders
  `RelationSettingsWidget` (`PosRelationSettings` / `PipelineRelationSettings`)
  with a purchase context from `usePosPurchaseContext` /
  `usePipelinePurchaseContext`: the trigger a plugin may use (POS paid order
  event; `sales:sales.deals.probability` Won — registered deal trigger types
  are plural, the Automations list also matches legacy singular ones), scopes
  (this record / all), how the trigger names the buyer, and `returnTo`. Each
  scope also carries `history`: how the buyer's past purchases there read as
  a customer segment (deals: `customer.deals`, `stageProbability` Won, the
  pipeline when scoped, dated by `stageChangedDate`; POS: `customer.posOrders`,
  not returned, the POS when scoped, dated by `paidDate`; both sum
  `totalAmount`). Sales never names those plugins; tab labels come from their
  config.

## Architecture

| Area                | Path                                                                                                 | Responsibility                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Registration        | `frontend/plugins/sales_ui/src/config.tsx`                                                           | Sales routes, navigation, and remote registration                                |
| Dev server          | `frontend/plugins/sales_ui/rspack.config.ts`                                                         | Module Federation development serving and watch ignore rules                     |
| Pipeline editor     | `frontend/plugins/sales_ui/src/modules/deals/pipelines`                                              | Pipeline form, stages, product config, and property selection                    |
| Deal detail         | `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail`                                | Deal overview, properties, activity, products, and payments                      |
| Product management  | `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/product`                        | Deal product table, filters, expanded view, row actions, footer totals, and save |
| Product discounts   | `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/product/utils/discountInfos.ts` | Reconciles advanced-view row/footer discount edits into `hand` discount metadata |
| Deal vouchers       | `frontend/plugins/sales_ui/src/modules/deals/loyaltyVouchers`                                        | Voucher and coupon line on a deal's Products tab, saved with the products        |
| POS permission form | `frontend/plugins/sales_ui/src/modules/pos/components/permission`                                    | Manages admin and cashier POS permission controls                                |
| POS customer form   | `frontend/plugins/sales_ui/src/modules/pos/components/customerCreate`                                | POS customer registration settings and layout sheet                              |
| POS GraphQL         | `frontend/plugins/sales_ui/src/modules/pos/graphql`                                                  | Provides POS queries and mutations used by settings screens                      |
| POS types           | `frontend/plugins/sales_ui/src/modules/pos/types`                                                    | Describes POS configuration data consumed by the UI                              |
| GraphQL tooling     | `frontend/plugins/sales_ui/codegen.ts`, `frontend/plugins/sales_ui/schema/platform.graphql`           | Validates documents against the exported Sales schema and consumed public contracts |

## Contracts

### Provides

- Deal trigger forms' optional stage fields (`SalesTriggerStageField`) pass
  `autoSelectFirst={false}`: `SelectStage` otherwise picks the first stage and
  silently narrows the trigger.
- POS order event trigger form: the POS field (`SelectPos.FormItem` with
  `emptyLabel`) lists "Any POS" first; choosing it clears `posId` so the
  trigger matches every POS (single-mode `SelectPos` otherwise cannot be
  unselected).
- Sales routes and Module Federation UI entries registered by `src/config.tsx`.
- Product table view state through local React state only; no backend contract
  changes are required for expanded product management.

### Consumes

- `sales_api` GraphQL pipeline, deal, product, and POS contracts.
- For type-generation tooling, `pnpm nx run sales_api:schema:print` exports
  Sales' schema to `backend/plugins/sales_api/generated/schema.graphql`.
  `codegen.ts` combines this Sales subgraph with `schema/platform.graphql`,
  a snapshot of the public Core, Accounting, Loyalty, Mongolian, Operation,
  Payment, and POS client fields selected by Sales documents. Each snapshot
  definition identifies its source; it is tooling input, not runtime API SDL.
- `sales_api` `salesLoyaltyRules`, `salesLoyaltyRulesSave`, `salesLoyaltyTierRules`, `salesLoyaltyTierRulesSave`, `SalesStage.loyaltyPoints`, `Pos.earnTier`; loyalty `loyaltyAccountTypes` (tier wallets); core `automations` (competing-writer warning); `ui-modules` score campaign list (`useLoyaltyScoreCampaign`).
- Core properties through public `ui-modules` property hooks with
  `contentType: 'sales:deal'` and, for the POS customer form,
  `contentType: 'core:customer'`.
- `ui-modules` `LayoutEditor` and `PropertyAddSheet` for the POS customer form.
- `erxes-ui` and `ui-modules` public React components.

## Data and State

- Apollo Client owns pipeline/deal/POS server state; React Hook Form owns
  pipeline and POS settings forms.
- Product table filters, Advanced view, Tax view, expanded view, and edit sheet
  open state are local React state inside the deal product detail surface.
- `propertyIds` is submitted with pipeline create/edit and reloaded from
  `salesPipelineDetail`.
- Product advanced-view discount edits are stored as `discountInfos` entries
  with `type: 'hand'`; pricing/voucher/score entries remain automatic data.
- POS report access persists as `permissionConfig.cashiers.seeReport` in the
  POS document.
- Cashier customer creation persists as
  `permissionConfig.cashiers.createCustomer`; admins are always allowed.
- `customerCreateConfig` = `{ enabled, assignCashierAsOwner, layout }`, where
  `layout` rows hold system field codes and `property:<fieldId>` entries.
  Placement is visibility: a field not in `layout` is hidden.

## Local Invariants

- GraphQL documents are literal strings so codegen can read their complete
  variables, arguments, and selections. Do not reintroduce JavaScript string
  interpolation into query, mutation, or subscription documents.
- Give distinct GraphQL operations unique Sales-prefixed names, including
  queries selecting the same backend field for different screens. Before
  renaming an operation, check repository-wide string references such as
  Apollo `refetchQueries` and `include`; preserve the document's exports,
  variables, arguments, and selections.
  Check generated TypeScript names too: operation names differing only in
  letter case can generate the same PascalCase identifiers.
- POS report operations use their report context in their names (Orders,
  ByItems, Covers, Items, or Summary), even when their selections are identical.
  Keep document exports stable for their existing hooks and selectors.
- Follow the `operation_ui` reference for codegen changes; inspect its existing
  implementation and, when needed, its merged migration diff before introducing
  a different pattern. Keep explicit Apollo refetch target names at their
  callers. When splitting a reused operation name, retain every intended target
  and update those names with the renamed operations. Legacy names
  `Deals`, `SalesStages`, `posList`, and `posDetail` still target shared or
  other-plugin queries; do not remove them solely because Sales uses new names.
- Keep public-contract snapshots faithful to their owning SDL, including
  arguments and nullability. Do not add fields to the snapshot to make an
  unsupported operation validate. Including a contract does not register its
  service with the runtime gateway.
- Product tags use Core's `tags(limit: ...) { list { ... } }` contract. Sales
  board counts take no arguments; assigned-user counts take `pipelineId` and
  `stackBy`.
  Stage conversion statistics select `compareNextStage` and the
  `initialDealsTotalCount`, `stayedDealsTotalCount`, and
  `inProcessDealsTotalCount` fields provided by Sales.
- Before removing an unsupported document, verify its hook, named or object
  exports, and federation entry points have no consumers. Follow Operation's
  migration pattern of removing an unused hook together with its unsupported
  document; do not invent a backend operation to keep unused frontend code.
- POS Summary row `_id` values come from the report's `paidDate` group key.
  Do not pass them to POS configuration or order deletion mutations.
- POS settings do not receive a `Pos.type` field: the Sales SDL and settings
  query do not expose one. Do not derive settings tabs or badges from it.
- POS item detail forms use `pos-items/types/posItemType.ts`; the Items report
  does not mount a separate POS selector. Orders hooks import their named
  documents directly from `orders/graphql/queries`.
- POS By Items displays product sales aggregates and does not own catalog
  product deletion. Do not wire its report rows to Core's `productsRemove`.
- Codegen scans all Sales UI TypeScript documents, excluding only its generated
  `src/gql/` output. Generated files are ignored by Git and ESLint. Its scalar
  mapping is `Date` input `string | Date`, output `string`, and `JSON` as `unknown`.
- `build` and `serve` depend on `codegen`, which first runs the uncached
  `sales_api:schema:print` target. Codegen caches its output against the exported
  SDL, `schema/**/*.graphql`, `codegen.ts`, and authored TypeScript documents.
- `codegen:watch` has no dependencies and must not be a dependency of `serve`:
  the watcher never exits. With Sales enabled, `pnpm dev:uis` generates types,
  starts the watcher, then starts the host and Sales remote.

- Whether loyalty is on is read at runtime (`useLoyaltyEnabled`, the loaded `pluginsConfigState`), never with `isEnabled('loyalty')`: that reads a build-time env that deployments such as SaaS do not set, which hid the Tier tab, the deal list's points column and the board card badge.
- Expandable navigation rows end in the host sidebar's chevron:
  `IconChevronRight` (`size-3.5`, muted) inside a span that rotates 90° when
  open, never a filled caret, so the rotation stays on the compositor and
  matches the main sidebar.
- Expandable group rows (boards, POS) use `rounded-lg`; an active board row is
  gray (`bg-foreground/5 text-foreground`) while its active pipeline item keeps
  the purple `Sidebar.MenuButton` active tint, so the two never stack purple.
- Page-level side menus render `Sidebar.Panel` from `erxes-ui`, which keeps its own open state (`sidebarPanelOpenState`), separate from the host's context column. Never stack two headings: a menu without a heading passes one as `label` (header row with the heading, optional `actions` and the collapse toggle); a menu that starts with its own heading row (group label, collapsible or accordion trigger) omits `label` and ends that row with `Sidebar.PanelTrigger`. Keep `<Sidebar collapsible="none">` for sidebars inside sheets and dialogs. `LeftSidebarLoading` renders the same panel with the trigger beside its first placeholder row.
- Property choices must come only from Core `sales:deal` fields.
- Deal detail chips render through `DealChipTrigger`; every chip except stage
  passes a translated `label` by default so the field is named.
- Deal property detail must filter by the deal's `pipelineId` selection.
- Pipeline and POS mutations must refresh or update Apollo state immediately.
- Pipeline archive keeps optional hook variables intact; the row action supplies
  the required `_id` when it invokes the mutation.
- POS category mappings use `SelectCategory`'s `value`/`onValueChange` contract
  in single mode, normalizing string/array values and clearing to an empty id.
- Stage name inputs use a mutable nullable ref so React Hook Form registration
  and autofocus both receive the same input element. Sortable drag overlays stay
  portaled to `document.body`; its React 18 portal assertion is confined to the
  React DOM boundary where installed type packages resolve different versions.
- POS creation refetches the explicit POS query names that are currently active,
  preserving each query's variables. Unmounted report queries must not produce
  Apollo unknown-query warnings.
- An enabled POS customer form must keep `primaryEmail` or `primaryPhone`;
  the last one placed cannot be hidden. Featured (plugin-owned) customer
  properties are not offered.
- Deal product create, update, and delete flows must keep the table responsive
  without requiring a manual refresh.
- Root row `uom`, `unitPrice`, and `quantity` remain in base units for totals
  and integrations. `uomInfo` holds input values: base price is info price
  multiplied by ratio, base quantity is info quantity divided by ratio.
  Backend repeats this calculation before persistence. Never refresh a saved ratio from current catalog
  data; a new selection takes the current product ratio. Base units use 1.
- UOM choices in both views include the product base and sub-UOMs, the cached base
  UOM, and saved selection. Invalid catalog ratios are disabled.
- Replacing a product resets its base UOM, price, and entry info; duplication
  preserves the info. Advanced base price/quantity edits update entry values.
  UOM entry defaults and selection changes use `utils/productUom.ts`; table
  filtering and saved ordering share the same entry/base column-id groups.
- `uomInfo` is the only entry-unit metadata field; missing info is filled from
  base-unit fields rather than an alternate metadata format.
  Backend omits info for base-unit selections. Acknowledgements compare such
  saves with root price/quantity, and the UI reconstructs editable base info.
- Deal product selectors may pass sales context such as `pipelineId` into
  shared `ui-modules` selectors, but must not import another plugin directly.
- Expanded product view must render the same product workspace as the inline
  view so filters, table edits, add products, totals, and save behavior remain
  identical.
- Editing a row discount sets `hand` to the difference between requested total
  discount and existing automatic discount.
- Editing the footer total discount clears current `hand` for each matching
  currency row and adds the footer amount/percent on top of automatic
  discounts.
- Empty row discount inputs are treated as canceled edits; entering explicit
  `0` is still a real manual edit.
- Footer handle percent and amount drafts are mutually exclusive per currency;
  editing one clears the other so both inputs derive from the same `hand`
  discount state.
- Advanced view controls discount metadata and extended product fields; Tax view
  controls only product tax percent/amount columns and footer total tax.
- Deal start/close date selects: every variant opens a popover holding
  `DatePicker` in `inline` mode (typed input above the calendar). The `input`
  variant (used by deal detail) renders a labelled `DealChipTrigger` showing
  the date (red plus an "Ended N days ago" badge for a past close date) and an
  X button that clears it; `DealChipTrigger` swaps its chevron for that X only
  when `onClear` is passed. Other variants keep their own trigger, with the
  "Ended" badge as the trigger for a past close date. A padded `YYYY-MM-DD` or
  a calendar pick commits immediately; unpadded `YYYY-M-D` commits on Enter or
  blur; clearing sends `null` so the backend unsets the date.

## Validation

- Export the API schema with `pnpm nx run sales_api:schema:print --skip-nx-cache`.
- `pnpm nx run sales_ui:codegen --skip-nx-cache`
- `pnpm nx build sales_ui`
- Codegen startup smoke: with `src/gql/` absent, both the production build and
  `ENABLED_PLUGINS=sales pnpm dev:uis` must generate it before booting. During
  development, editing a GraphQL document must trigger the codegen watcher.
- `node --test frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/product/utils/__tests__/productUom.test.cjs`
- Deal UOM smoke scenario: in normal view select a sub-UOM, edit its price and
  quantity, save and reload; verify Advanced shows base price/quantity and the
  saved ratio. Switching units alone preserves totals; changing catalog ratios
  must not change a saved ratio. Duplicate a row and replace its product to
  verify info preservation and reset, respectively.
- Deal product smoke scenario: open a deal's Products tab, toggle expanded view,
  filter products, edit a row, add products, save, close the expanded view, and
  verify the inline table shows the same state.
- POS settings smoke scenario: open POS permission tab, toggle cashier
  "SEE REPORT", save, and verify the value persists after reload.
- POS customer smoke scenario: open the "Customer registration" tab, enable it,
  hide e-mail (phone stays locked on), add a property, rearrange in Edit
  layout, save, and verify the layout persists after reload.
- Tier rules smoke scenario: open "Score earn configuration", switch to Tier,
  add an every-board row, pick a wallet, set bands, save, reopen and verify
  the row; set a POS's tier in its Payment tab, save and verify after reload.
- Source automations smoke scenario: open a POS's or a pipeline's
  "Automations" tab, connect a score campaign in the loyalty section, save in
  the builder, use the back link, and verify the automation is listed.
