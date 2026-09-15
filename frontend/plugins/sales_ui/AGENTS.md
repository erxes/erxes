# `sales_ui` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/sales_ui`
- **Last synchronized:** `2026-09-14`

## Scope

### Owns

- Sales boards, pipelines, stages, deals, products, payments, and deal detail UI.

### Does not own

- Sales persistence or GraphQL resolvers; those live in `sales_api`.
- Core property definitions and shared UI primitives.

## Current Capabilities

- Runs as the sales Module Federation remote.
- Development Rspack serving ignores generated dependency/cache/output folders to keep local file watchers bounded.
- Pipeline create/edit supports general settings, stages, product configuration,
  and grouped selection of Core `sales:deal` properties.
- Deal detail renders only the properties selected on the deal's pipeline.
  Legacy pipelines continue showing all deal properties until their selection
  is saved for the first time.
- Deal product advanced view manages only product-level manual `hand`
  discounts while preserving automatic discount sources in `discountInfos`.
- Deal product footer discount inputs default to the current per-currency
  manual `hand` discount amount and percent while the adjacent totals show all
  discount sources.
- Clearing a row discount input without entering a value does not create or
  update a manual `hand` discount.
- Deal product tax controls live behind a separate Tax view toggle; Advanced
  view no longer owns tax columns or footer total tax controls.

## Architecture

| Area              | Path                                                                                                 | Responsibility                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Registration      | `frontend/plugins/sales_ui/src/config.tsx`                                                           | Sales routes, navigation, and remote registration                                 |
| Dev server        | `frontend/plugins/sales_ui/rspack.config.ts`                                                         | Module Federation development serving and watch ignore rules                      |
| Pipeline editor   | `frontend/plugins/sales_ui/src/modules/deals/pipelines`                                              | Pipeline form, stages, product config, and property selection                     |
| Deal detail       | `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail`                                | Deal overview, properties, activity, and products                                 |
| GraphQL           | `frontend/plugins/sales_ui/src/modules/deals/graphql`                                                | Sales client operations                                                           |
| Product discounts | `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/product/utils/discountInfos.ts` | Reconciles advanced-view row/footer discount edits into `hand` discount metadata. |

- POS, deal, order, cover, item, product, payment, appearance, delivery, and permission management screens for the sales frontend.

### Does not own

- Backend POS persistence, POS client runtime behavior, shared UI primitives, core settings infrastructure, or other plugin routes.

## Current Capabilities

- POS permission settings assign admins and cashiers.
- POS permission settings persist cashier temp bill, report visibility, and direct discount controls through `permissionConfig`.
- POS management screens read and write sales GraphQL contracts through the plugin's local documents and hooks.

## Architecture

| Area                | Path                                                              | Responsibility                                               |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| POS permission form | `frontend/plugins/sales_ui/src/modules/pos/components/permission` | Manages admin and cashier POS permission controls.           |
| POS GraphQL         | `frontend/plugins/sales_ui/src/modules/pos/graphql`               | Provides POS queries and mutations used by settings screens. |
| POS types           | `frontend/plugins/sales_ui/src/modules/pos/types`                 | Describes POS configuration data consumed by the UI.         |

## Contracts

### Provides

- Sales routes and Module Federation UI entries registered by `src/config.tsx`.

### Consumes

- `sales_api` GraphQL pipeline and deal contracts.
- Core properties through public `ui-modules` property hooks with
  `contentType: 'sales:deal'`.
- `erxes-ui` and `ui-modules` public components.

## Data and State

- Apollo Client owns pipeline/deal server state; React Hook Form owns pipeline
  editor state.
- `propertyIds` is submitted with pipeline create/edit and reloaded from
  `salesPipelineDetail`.
- Product advanced-view discount edits are stored as `discountInfos` entries
  with `type: 'hand'`; pricing/voucher/score entries remain automatic data.

## Local Invariants

- Property choices must come only from Core `sales:deal` fields.
- Deal property detail must filter by the deal's `pipelineId` selection.
- Pipeline mutations must refresh or update Apollo state immediately.
- Editing a row discount sets `hand` to the difference between requested total
  discount and existing automatic discount. Editing the footer total discount
  clears current `hand` for each matching currency row and adds the footer
  amount/percent on top of automatic discounts.
- Empty row discount inputs are treated as canceled edits; entering explicit
  `0` is still a real manual edit.
- Footer discount inputs display only the editable `hand` portion; total
  discount labels beside them aggregate automatic and manual discounts.
- Footer handle percent and amount drafts are mutually exclusive per currency;
  editing one clears the other so both inputs derive from the same `hand`
  discount state.
- Advanced view controls discount metadata and extended product fields; Tax
  view controls only product tax percent/amount columns and footer total tax.

## Validation

- `pnpm nx lint sales_ui`
- `pnpm nx build sales_ui`
- Open a pipeline editor, check properties from multiple groups, save, and
  verify a deal in that pipeline shows only those fields.
- Module Federation sales UI routes and exposed POS settings components.
- POS edit mutation payloads containing `permissionConfig.cashiers.seeReport`.

### Consumes

- `erxes-ui` and `ui-modules` public React components.
- Sales POS GraphQL queries and mutations from the sales API.

## Data and State

- Uses React Hook Form state for POS settings forms.
- Uses Apollo Client for POS detail loading and POS edit mutations.
- Persists report access as `permissionConfig.cashiers.seeReport` in the POS document.

## Local Invariants

- POS settings controls must remain backed by `erxes-ui` form primitives and must save through the existing POS edit mutation.
- Cashier report access must use the `permissionConfig.cashiers.seeReport` boolean key.

## Validation

- `pnpm nx build sales_ui`
- POS settings smoke scenario: open POS permission tab, toggle cashier "SEE REPORT", save, and verify the value persists after reload.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-14` — A deal's created row says what produced it

- **Summary:** `DealCreatedRow` now ends with `ActivityLogs.CreatedVia`, so a
  deal an automation opened reads "created deal X from campaign Y" with a link
  to the campaign. The suffix renders nothing for a deal someone made by hand.
- **Affected areas:**
  `src/modules/deals/cards/components/detail/DealActivityRows.tsx`
- **Contracts changed:** Consumes the new `ActivityLogs.CreatedVia` from
  `ui-modules`.

### `2026-09-13` — Sync footer handle discount inputs

- **Summary:** Deal product footer handle percent and amount inputs now clear
  the alternate draft per currency so both controls reflect the same manual
  `hand` discount state.
- **Affected areas:** `src/modules/deals/cards/components/detail/product/components/ProductFooter.tsx`.
- **Contracts changed:** None.

### `2026-09-13` — Fill handle discount footer inputs

- **Summary:** Deal product footer discount inputs now fill from the current
  per-currency manual `hand` discount amount and percent while aggregate labels
  still show all discounts.
- **Affected areas:** `src/modules/deals/cards/components/detail/product/components/ProductFooter.tsx`.
- **Contracts changed:** None.

### `2026-09-13` — Ignore empty row discount edits

- **Summary:** Deal product row discount percent/amount fields now ignore empty
  edits so blank inputs do not create manual `hand` discount entries.
- **Affected areas:** `src/modules/deals/cards/components/detail/product/components/product-table/getProductColumns.tsx`.
- **Contracts changed:** None.

### `2026-09-13` — Product Tax view toggle

- **Summary:** Added a separate Tax view toggle and moved product tax percent/amount columns plus footer total tax controls out of Advanced view.
- **Affected areas:** `src/modules/deals/cards/components/detail/product/components/{ProductFooter.tsx,product-list,product-table}`.
- **Contracts changed:** None.

### `2026-09-12` — Advanced product manual discounts

- **Summary:** Advanced-view product row and footer discount edits now update only `hand` discount metadata while preserving automatic discount sources.
- **Affected areas:** `src/modules/deals/cards/components/detail/product/{components,hooks,utils,productTableAtom.ts}`.
- **Contracts changed:** Deal product JSON may include `discountInfos` with manual `hand` entries.

### `2026-09-09` — `Bound Dev Watchers`

- **Summary:** Sales UI Rspack development serving now ignores generated dependency, cache, coverage, temp, and output folders to reduce local watcher pressure.
- **Affected areas:** `rspack.config.ts`.
- **Contracts changed:** None.

### `2026-09-05` — `Property groups share one card shell`

- **Summary:** The deal detail property groups render through `PropertyGroupShell` / `PropertyGroupCard` from `ui-modules`, so a plain group and a repeating one look the same instead of a secondary-button header beside a card tray.
- **Affected areas:** `src/modules/deals/cards/components/detail/DealPipelineProperties.tsx`
- **Contracts changed:** `None`

### `2026-08-12` — Select deal properties by group

- **Summary:** Pipeline property configuration now selects an entire Core deal
  property group with one checkbox instead of selecting fields one by one; the
  stored contract remains the group's field ids.
- **Affected areas:** `src/modules/deals/pipelines/components/PipelinePropertySelector.tsx`.
- **Contracts changed:** None.

### `2026-08-12` — Pipeline-scoped deal properties

- **Summary:** Sales pipelines now choose grouped Core deal properties; legacy
  pipelines retain show-all behavior until first save, then deal detail renders
  only the chosen fields.
- **Affected areas:** `src/modules/deals/{pipelines,cards,graphql,types,schemas}`.
- **Contracts changed:** Pipeline GraphQL reads and mutations now include
  `propertyIds`.

### `2026-08-12` — `Cashier report permission`

- **Summary:** Added a cashier report visibility switch to POS permission settings and persisted it in `permissionConfig.cashiers.seeReport`.
- **Affected areas:** `frontend/plugins/sales_ui/src/modules/pos/components/permission`, `frontend/plugins/sales_ui/src/modules/pos/types`
- **Contracts changed:** POS edit mutation payload may include `permissionConfig.cashiers.seeReport`.
