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
- When the pipeline has a payment type with a score campaign, each stage shows
  "Refund loyalty points" (`PipelineStageRefundPoints` /
  `usePipelineStageRefundPoints`): checked by default on `Lost` stages while
  `refundPoints` is unset, and every change asks for confirmation first.
- In a deal's Payments tab a payment type with a score campaign asks loyalty's `loyaltyScoreSpendLimit` (`DealPointPaymentLimit` / `useDealPointLimit`) and shows the customer's points and the most it may pay; the row stays disabled without a customer, while loading, or when loyalty blocks spending, and typed amounts are capped at the limit. There is no hand refund: refunds follow stages.
- Deal detail renders only the properties selected on the deal's pipeline;
  legacy pipelines continue showing all deal properties until their selection is
  saved for the first time.
- Deal detail broker selection shows `Broker: None` until a broker type is
  chosen, then renders a matching entity selector with a `Select broker`
  placeholder.
- Deal detail header exposes an `Actions` dropdown (`DealsActions`) with
  duplicate, watch/unwatch, print, archive/restore, and remove; the same
  component is the bulk action menu in the deals list command bar. Print opens
  the shared `ui-modules` `PrintDocument` sheet (`sales:deal` content type)
  rendered outside the dropdown so closing the menu does not unmount it.
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
  bill, report visibility, and direct discount controls through
  `permissionConfig`.

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
| POS GraphQL         | `frontend/plugins/sales_ui/src/modules/pos/graphql`                                                  | Provides POS queries and mutations used by settings screens                      |
| POS types           | `frontend/plugins/sales_ui/src/modules/pos/types`                                                    | Describes POS configuration data consumed by the UI                              |

## Contracts

### Provides

- Sales routes and Module Federation UI entries registered by `src/config.tsx`.
- Product table view state through local React state only; no backend contract
  changes are required for expanded product management.

### Consumes

- `sales_api` GraphQL pipeline, deal, product, and POS contracts.
- Core properties through public `ui-modules` property hooks with
  `contentType: 'sales:deal'`.
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

## Local Invariants

- Property choices must come only from Core `sales:deal` fields.
- Deal property detail must filter by the deal's `pipelineId` selection.
- Pipeline and POS mutations must refresh or update Apollo state immediately.
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
- Deal detail start/close dates use the erxes-ui `DatePicker` input with
  `allowNull`; typing uses `YYYY-MM-DD`, the unfocused value shows as
  `MMM D, YYYY`, and clearing sends `null` so the backend unsets the date.

## Validation

- `pnpm nx build sales_ui`
- Deal product smoke scenario: open a deal's Products tab, toggle expanded view,
  filter products, edit a row, add products, save, close the expanded view, and
  verify the inline table shows the same state.
- POS settings smoke scenario: open POS permission tab, toggle cashier
  "SEE REPORT", save, and verify the value persists after reload.
