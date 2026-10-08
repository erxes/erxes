# `sales_ui` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/sales_ui`
- **Last synchronized:** `2026-10-08`

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
  setting.
- The POS Payment tab picks the score campaigns paid orders earn in
  (`EarnScoreCampaignsField`, `Pos.earnScoreCampaignId`): one campaign only,
  since two would both earn on the same order; chosen with loyalty's picker
  (`RecordPickerWidget`, New/Edit included), clearable, with warnings when
  inactive. Payment types'
  score campaign field (`OtherPaymentsField`, POS and deal product config) is
  the same picker. A chosen campaign that an active POS-order automation (this POS or
  any) also gives points in is flagged (`usePosEarnAutomations`). The POS
  Automations tab is listed last, beside the Loyalty tab.
- In a deal's Payments tab a payment type with a score campaign asks loyalty's `loyaltyScoreSpendLimit` (`DealPointPaymentLimit` / `useDealPointLimit`) and shows the customer's points and the most it may pay; the row stays disabled without a customer, while loading, or when loyalty blocks spending, and typed amounts are capped at the limit. There is no hand refund: refunds follow stages.
- Deal detail renders only the properties selected on the deal's pipeline;
  legacy pipelines continue showing all deal properties until their selection is
  saved for the first time.
- Deal detail broker selection shows `Broker: None` until a broker type is
  chosen, then renders a matching entity selector with a `Select broker`
  placeholder.
- Deal product management supports filtering, advanced product fields, tax
  fields, row editing, duplication, deletion, product bulk add, footer totals,
  save feedback, and an expanded dialog view for working with dense product
  tables.
- Deal product bulk add passes the deal pipeline id into the shared product
  chooser so enabled plugin remainder providers can resolve pipeline-scoped
  stock without sales importing those plugins.
- Deal product advanced view manages only product-level manual `hand` discounts
  while preserving automatic discount sources in `discountInfos`.
- Deal product tax controls live behind a separate Tax view toggle; Advanced
  view no longer owns tax columns or footer total tax controls.
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
  (this record / all), how the trigger names the buyer, and `returnTo`. Sales
  never names those plugins; tab labels come from their config.

## Architecture

| Area                | Path                                                                                                 | Responsibility                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Registration        | `frontend/plugins/sales_ui/src/config.tsx`                                                           | Sales routes, navigation, and remote registration                                |
| Dev server          | `frontend/plugins/sales_ui/rspack.config.ts`                                                         | Module Federation development serving and watch ignore rules                     |
| Pipeline editor     | `frontend/plugins/sales_ui/src/modules/deals/pipelines`                                              | Pipeline form, stages, product config, and property selection                    |
| Deal detail         | `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail`                                | Deal overview, properties, activity, products, and payments                      |
| Product management  | `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/product`                        | Deal product table, filters, expanded view, row actions, footer totals, and save |
| Product discounts   | `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/product/utils/discountInfos.ts` | Reconciles advanced-view row/footer discount edits into `hand` discount metadata |
| POS permission form | `frontend/plugins/sales_ui/src/modules/pos/components/permission`                                    | Manages admin and cashier POS permission controls                                |
| POS customer form   | `frontend/plugins/sales_ui/src/modules/pos/components/customerCreate`                                | POS customer registration settings and layout sheet                              |
| POS GraphQL         | `frontend/plugins/sales_ui/src/modules/pos/graphql`                                                  | Provides POS queries and mutations used by settings screens                      |
| POS types           | `frontend/plugins/sales_ui/src/modules/pos/types`                                                    | Describes POS configuration data consumed by the UI                              |

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
- `sales_api` `salesLoyaltyRules`, `salesLoyaltyRulesSave`, `SalesStage.loyaltyPoints`; core `automations` (competing-writer warning); `ui-modules` score campaign list (`useLoyaltyScoreCampaign`).
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

- Property choices must come only from Core `sales:deal` fields.
- Deal property detail must filter by the deal's `pipelineId` selection.
- Pipeline and POS mutations must refresh or update Apollo state immediately.
- An enabled POS customer form must keep `primaryEmail` or `primaryPhone`;
  the last one placed cannot be hidden. Featured (plugin-owned) customer
  properties are not offered.
- Deal product create, update, and delete flows must keep the table responsive
  without requiring a manual refresh.
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

## Validation

- `pnpm nx build sales_ui`
- Deal product smoke scenario: open a deal's Products tab, toggle expanded view,
  filter products, edit a row, add products, save, close the expanded view, and
  verify the inline table shows the same state.
- POS settings smoke scenario: open POS permission tab, toggle cashier
  "SEE REPORT", save, and verify the value persists after reload.
- POS customer smoke scenario: open the "Customer registration" tab, enable it,
  hide e-mail (phone stays locked on), add a property, rearrange in Edit
  layout, save, and verify the layout persists after reload.
- Source automations smoke scenario: open a POS's or a pipeline's
  "Automations" tab, connect a score campaign in the loyalty section, save in
  the builder, use the back link, and verify the automation is listed.
