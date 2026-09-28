# `accounting_ui` Plugin Guide

## Identity

- **Plugin:** `accounting`
- **Project:** `accounting_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/accounting_ui`
- **Last synchronized:** `2026-09-25`

## Scope

### Owns

- Accounting routes, navigation, transaction list/detail/form experiences, accounting settings, journal reports, inventory/fixed asset accounting UI, and accounting-owned relation widgets.
- Fund and debt rate adjustment list, detail, form, calculation, transaction-run, subscription, and linked transaction display surfaces.
- Temporary account closing adjustment list, form, detail, calculation, row tax-percent edit, transaction-run, publish, and cancel surfaces.

### Does not own

- Backend accounting calculations, persistence, GraphQL schema definitions, or transaction journal handlers.
- Core product, branch, department, customer, company, organization settings, and shared UI implementations; consume them through public `ui-modules`, `erxes-ui`, and GraphQL APIs.
- Other plugin UIs, routes, state, or implementation details.

## Current Capabilities

- Displays, creates, updates, prints, and removes accounting transactions.
- Exports accounting main and journal record transaction lists through the platform import/export UI using the current frontend filters or selected rows.
- Transaction record rows place each detail amount in the debit or credit column using the transaction-level side.
- Transaction record tables initialize journal-specific columns before the table provider mounts so structural action and checkbox columns retain their fixed width.
- Keeps cash, bank, payable, and receivable transaction main-currency and foreign-currency amounts manually editable while syncing the paired amount from exchange rates without update cycles.
- Provides adjustment navigation and pages for inventory, fixed asset, fund rate, and debt rate adjustments.
- Provides closing adjustment navigation and pages for temporary account closing.
- Opens fund, debt, and closing adjustment create/edit forms in `AccountingSheet` panels where those forms exist.
- Uses system `dealCurrency` options for fund/debt adjustment main and foreign currency fields plus account currency selectors; rate adjustment main currency defaults from system `mainCurrency`.
- Fetches spot rate from the existing exchange-rate hook when adjustment date, main currency, and foreign currency are selected.
- Fund rate detail can calculate, show validation state, show account balances grouped by branch/department, run linked transactions, and display linked transaction rows.
- Debt rate detail can calculate, show validation state, show account/customer balances grouped by branch/department, run linked transactions, and display linked transaction ids.
- Fund and debt rate adjustment detail account balance grids, plus fund linked transaction rows, render with `RecordTable` instead of raw HTML tables.
- Closing adjustment list renders account fields inline, and detail can calculate temporary-account balances grouped by branch/department, show validation state, render read-only branch/department code-title labels plus account inline names, edit tax percentage per row in collapsible `RecordTable` groups, show generated transactions in a `TBalance`-style transactions tab, run closing transactions, publish, cancel, and show tax impact.
- Inventory transaction rows fill prices from product master, current inventory cost, or last completed inventory income price depending on journal behavior.
- Inventory out and internal movement rows show active unit cost and amount as read-only values; inventory sale unit price remains editable because it is the sale price, while its generated inventory and cost-of-goods rows retain the fetched active cost across sale quantity edits and are costed by the backend on save.
- Inventory income, out, move, sale, and sale-return bulk product additions fetch journal-specific fill data once, then append rows with the same price, cost, amount, and weight rules as single-row product selection.
- The inventory cost adjustment journal has an independent form, supports single or bulk product selection, hides quantity input, shows current remainder and unit cost, accepts a per-unit cost delta, calculates the after-adjustment unit cost, and submits cost-only rows.
- Inventory income can allocate additional expenses by amount, count, or editable total line weight; line weight initializes from core product weight multiplied by count.
- Fixed asset income, out, move, and sale transaction rows can toggle detailed view to edit branch and department per detail.
- Transaction balance rows display branch and department from each transaction detail when present, so generated follow rows with source/destination locations are shown at their row location instead of the root transaction location.
- Fixed asset income rows capture acquisition category, code, name, count, unit cost, tax settings, and optional detail-level branch/department values; code and name are editable inline table cells that participate in transaction-form keyboard navigation, and the backend creates the fixed asset from the saved detail.
- Fixed asset category forms show both derived useful years and annual depreciation percentage; changing either field updates the other rounded to two decimals, while the backend stores the annual percentage as the canonical value.
- Fixed asset settings list income-created asset records without a direct add button; asset creation belongs to fixed asset income transactions.
- Fixed asset income detail sheets start with no owner-allocation rows by default; the owner-record add button shows the remaining quantity, lets users split the detail count into responsible-user/serial rows, and keeps residual value plus `preDeprecation` as detail-level follow-info.
- Fixed asset out, move, and sale rows select existing fixed assets directly, while the "Олон хөрөнгө нэмэх" sheet can filter by category and append multiple selected assets as separate details; selected rows refetch fixed asset location remainder whenever fixed asset, branch, department, or date changes, can optionally select active owner records up to the detail count, out/move cost is based on asset data, sale keeps user-entered sale price, branch/department values stay on each detail, `fxaOut` only asks for accumulated depreciation account, and generated sale/depreciation follow previews use `fxaSaleOut`, `fxaDepOut`, and `fxaSaleCost`.
- Fixed asset out, move, and sale edit forms preserve persisted detail counts while location remainder loads; the remainder limits subsequent user edits but must not rewrite saved values during form initialization.
- Fixed asset disposal follow previews run only for unsaved transactions; persisted edit forms keep Mongo-backed main details and generated follow transactions until the backend recalculates them on save.
- Fixed asset navigation includes an "Үндсэн хөрөнгө" section with an owner-record list and a branch/department fixed asset remainder page; the redundant fixed asset settings and direct internal-move shortcuts are not shown there.
- The in-form add-transaction dropdown can create cash, bank, receivable, payable, or main transaction tabs directly from a selected account by resolving the account journal and pre-filling the first detail account; journal-only additions start with an empty account.
- Related account override inputs keep focus while users type and persist custom debit and credit code lists independently.
- Empty related account overrides are omitted on submit so backend-calculated default debit/credit related accounts remain active, and the related-account editor falls back to default `dt/ct` codes when `customDt/customCt` are empty.
- Accounting settings pages manage accounts, account categories, permissions, VAT, CTAX, and sync configuration; VAT/CTAX row access is guarded by the unified tax-row permission actions.
- Journal report rendering groups backend rows recursively, uses a declarative report-to-filter map to show and submit only applicable account, contact, inventory, fixed-asset, organization, user, and report controls, filters by Erkhet-compatible transaction type plus erxes-native category/search/tag/ownership fields, renders account statement, trial balance, general ledger, main journal, main journal summary, fund, debt, inventory cost, inventory sale, inventory sale-cost, inventory sale-period, inventory price, inventory profit, inventory shipper, inventory document, inventory seller subsystem, and fixed asset report variants, signs inventory movement totals by transaction side so debit cost adjustments increase and credit adjustments decrease value, shows foreign-currency balance rows separately beneath non-MNT account leaves without adding them to base-currency totals, derives table headers and footers from report column metadata, keeps date filter controls visually consistent, shows table-body loading skeletons while report or drill-down data loads, drills account rows into account statements with filter context, calculates parent/footer totals after render, hides all-zero rows unless users choose to show them, loads account-statement detail rows without mutating report state, opens transaction edit screens from detail rows, and downloads the rendered result as a formatted Excel workbook.
- Development Rspack serving ignores generated dependency/cache/output folders to keep local file watchers bounded.

## Architecture

| Area                | Path                                                                        | Responsibility                                                                                                  |
| ------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Runtime             | `src/main.ts`                                                               | Starts the accounting UI remote.                                                                                |
| Dev server config   | `rspack.config.ts`                                                          | Configures Module Federation development serving and ignores generated folders during watch mode.               |
| Plugin config       | `src/config.tsx`                                                            | Registers accounting routes and navigation with the host.                                                       |
| Route composition   | `src/modules/AccountingMain.tsx`                                            | Wires accounting pages into the plugin router.                                                                  |
| Transactions        | `src/modules/transactions`                                                  | Owns transaction tables, forms, GraphQL documents, hooks, and print documents.                                  |
| Cost adjustment     | `src/modules/transactions/transaction-form/components/forms/InvJustifyForm` | Owns inventory cost-adjustment fields, product rows, calculations, bulk add, and removal UI.                    |
| Transaction export  | `src/pages/TransactionListPage.tsx`, `src/pages/TrRecordListPage.tsx`       | Provides filtered and selected-row export actions for main and journal record lists.                            |
| Fixed assets        | `src/modules/fixedAssets`                                                   | Owns fixed asset navigation and owner-record operational list surfaces.                                         |
| Adjustments         | `src/modules/adjustments`                                                   | Owns inventory, fixed asset, fund rate, debt rate, and closing adjustment UI.                                   |
| Journal reports     | `src/modules/journal-reports`                                               | Owns report selection, filters, grouped rendering, totals, and detail rows.                                     |
| Report configs      | `src/modules/journal-reports/types/reports`                                 | Groups report titles, choices, and group rules by main, fund, debt, inventory, and fixed asset report families. |
| Report table layout | `src/modules/journal-reports/components/reportTableLayout.ts`               | Maps each report code to header rows and footer column counts aligned with the recursive report renderer.       |
| Report Excel export | `src/modules/journal-reports/utils/exportJournalReportExcel.ts`             | Converts the currently rendered report, totals, and expanded detail tables into a formatted `.xlsx` workbook.   |
| Report renderers    | `src/modules/journal-reports/components/includes/handlers`                  | Maps report families to Erkhet-style `calcReport` table calculators and detail-row renderers.                   |
| Settings            | `src/modules/settings`                                                      | Owns accounting settings forms, account tables, filters, and config hooks.                                      |
| Pages               | `src/pages`                                                                 | Exposes route-level page components for accounting surfaces.                                                    |
| Relation widgets    | `src/widgets/relation/RelationWidgets.tsx`                                  | Provides accounting relation widget exports.                                                                    |

## Contracts

### Provides

- Module Federation exposes defined in `module-federation.config.ts`.
- Accounting routes exposed through `src/modules/AccountingMain.tsx` and navigation registered from `src/config.tsx`.
- Accounting relation widget exports from `src/widgets/relation/RelationWidgets.tsx`.
- Export actions for `accounting:account.transactions` on `/accounting/main` and `/accounting/records`.

### Consumes

- Accounting API GraphQL contracts for transactions, reports, settings, inventory/fixed asset adjustments, fund rate adjustments, and debt rate adjustments, including journal report `trKind` filters.
- Inventory cost adjustment transactions consume the `invJustify` journal contract and the existing `getAccCurrentCost` helper for current unit cost and remainder display; debit means cost increase and credit means cost decrease.
- Platform import/export contract for `accounting:account.transactions` filtered and selected-id exports.
- Fixed asset location remainder contract `fixedAssetLocationRemainder(fixedAssetId, branchId, departmentId, date, excludeTransactionId)` for disposal/move/sale row count limits.
- Fixed asset location remainder list contract `fixedAssetLocationRemainders(searchValue, fixedAssetId, categoryId, branchId, departmentId, date, limit)` for the fixed asset remainder page.
- Fixed asset owner-record query contract `fxaOwnerRecords(fixedAssetIds, status, balanceOnly)` for disposal/move/sale owner balance selection sheets.
- Fixed asset owner-record list contracts `fxaOwnerRecords(searchValue, fixedAssetId, categoryId, action, ownerId, status, createdFrom, createdTo, page, perPage)` and `fxaOwnerRecordsCount(...)`, plus direct `fixedAssetOwnerRecordsAdd`, `fixedAssetOwnerRecordsTransfer`, and `fixedAssetOwnerRecordsRemove` mutations for the fixed asset owner-record page.
- Transaction journal labels and generated fixed-asset follow previews consume the fixed-asset journal names `fxaDep`, `fxaDepIn`, `fxaDepOut`, `fxaSaleOut`, and `fxaSaleCost`.
- Fixed asset sale follow account fields use `saleOutAccountId` and `saleCostAccountId`; fixed asset income/out/move forms do not store a root `fixedAssetAccountId` because the asset account comes from transaction details.
- Fixed asset category settings consume `defaultAnnualDepreciationRate` and `defaultTaxAnnualDepreciationRate`; useful years are UI-derived as `100 / annualRate` and are not sent to or read from the backend.
- Fund rate adjustment contracts: `adjustFundRates`, `adjustFundRateDetail`, `adjustFundRateAdd`, `adjustFundRateChange`, `adjustFundRateCalculate`, `adjustFundRateDoTransaction`, `adjustFundRateRemove`, and `accountingAdjustFundRateChanged`.
- Debt rate adjustment contracts: `adjustDebtRates`, `adjustDebtRateDetail`, `adjustDebtRatesAdd`, `adjustDebtRatesEdit`, `adjustDebtRateCalculate`, `adjustDebtRateDoTransaction`, `adjustDebtRatesRemove`, and `accountingAdjustDebtRateChanged`.
- Closing adjustment contracts: `adjustClosings`, `adjustClosingsCount`, `adjustClosingDetail`, `adjustClosingEntriesCount`, `adjustClosingAdd`, `adjustClosingEdit`, `adjustClosingCalculate`, `adjustClosingDoTransaction`, `adjustClosingRun`, `adjustClosingPublish`, `adjustClosingCancel`, and `adjustClosingRemove`.
- Core system currency settings through `configsByCode(codes)` for `dealCurrency` and `mainCurrency`.
- Core product, branch, department, customer, company, and team member selectors through public `ui-modules` APIs.
- UI primitives, form components, tables, sheets, comboboxes, filters, toasts, and currency inputs from `erxes-ui`.

## Data and State

- Apollo Client owns server state, mutation refreshes, subscriptions, and detail/list cache updates.
- React Hook Form owns editable accounting transaction and adjustment form state.
- Inventory income detail form state stores total line weight; product or count changes recalculate it from core product weight, while direct weight edits persist until either source changes.
- Inventory cost adjustment detail state stores `count: 0`, `unitPrice` as the absolute per-unit cost delta, and `amount` as delta multiplied by current remainder; quantity is display-only, while editing after-unit cost derives the delta and increase/decrease side from its difference against current unit cost.
- Inventory row defaults initialize count to one; bulk-added rows also initialize all count-derived amount and weight values, batch journal-specific last-price, product, or current-cost lookup before append, and preserve sale/sale-return follow-journal unit cost by generated detail id.
- Jotai atoms under `src/modules/transactions/transaction-form/states` hold transaction form UI state, tax percentages, follow transactions, and rendering selections.
- URL query state owns selected detail ids and account table filters where existing accounting patterns use query params.
- Rate adjustment detail subscriptions replace the loaded detail with the published calculated detail payload.
- Closing detail state is owned by Apollo queries/refetches; percent edits and calculate/run mutations refetch detail state immediately.

## Local Invariants

- GraphQL operation names in new accounting UI code must be prefixed with `Accounting`.
- Create/update/remove/calculate/run mutations must show success/error feedback and refresh or subscribe so users do not need a manual reload.
- Fund/debt adjustment transaction execution is separate from calculation; UI must expose both states and not run transactions before details are calculated.
- Closing adjustment transaction execution is separate from calculation; UI must let users edit row tax percentages before running transactions.
- Closing adjustment generated transactions must be shown in a separate tab using the transaction balance table pattern.
- Closing adjustment detail group headers must display branch and department as read-only `code - title` labels, not selector triggers.
- Closing adjustment create form does not expose `beginDate`; the backend calculates it from the previous closing or first temporary-account transaction.
- Adjustment create/edit forms must use sheet layout consistent with accounting settings and adjustment forms.
- Fund/debt adjustment main and foreign currency selectors must use system `dealCurrency`; default main currency comes from `mainCurrency`.
- Account currency create/edit, inline edit, and filter selectors must use the same system `dealCurrency` options.
- Currency amount inputs display rounded values by default but expose configured edit precision while focused.
- Transaction currency amount synchronization must react to manual amount-field changes and avoid hook cycles.
- Transaction record debit and credit cells must read side from the transaction record root, not from its detail.
- Transaction record column sets must be derived before `RecordTable.Provider` mounts and remount when switching between standard and inventory/fixed-asset layouts.
- Inventory income weight allocation must use persisted detail total weight; missing core product weight defaults to one per item, and manual detail weight remains unchanged until product or count changes.
- Inventory cost adjustment forms must not expose editable quantity; one required side selector labeled `Өртгийн өөрчлөлт` controls whether the entered per-unit delta increases or decreases after-unit cost, and editing after-unit cost must update the delta, amount, and side so both inputs remain algebraically consistent.
- Inventory cost adjustment UI must remain in `forms/InvJustifyForm` as an independent journal form; `InvOutForm` must contain only inventory-out behavior and must not accept an adjustment-mode flag.
- Inventory out and internal movement forms must not allow unit cost or cost amount edits; changing product, account, quantity, or source location must refresh active cost, and editing an existing movement must exclude both its source and generated destination transactions from that lookup.
- Inventory move, sale, and sale-return follow details must retain each source detail `_id` as `originId`; quantity edits update only that source row's generated follow details, preserve every other row's fetched active cost, and ignore transient current-cost responses that do not contain the selected product.
- Inventory add actions must append count-one details; bulk add must calculate amount from the filled unit price, income must also initialize total weight, and quantity-neutral `invJustify` must remain count zero.
- In-form balancing transaction creation must calculate debit, credit, and difference from watched `trDocs`, never from the structural `useFieldArray.fields` snapshot.
- Fixed asset income detail state must preserve `fixedAssetCategoryId`, `fixedAssetCode`, and `fixedAssetName` through save/refetch so generated fixed assets remain editable from their source transaction detail.
- Fixed asset income code and name cells must use the same `PopoverScoped` plus `RecordTableInlineCell` pattern as numeric inline cells so shortcut navigation can focus and edit them.
- Fixed asset detail tables must tolerate an uninitialized `details` watch value during create-route bootstrap and render with an empty array until form defaults arrive.
- Fixed asset income owner sheet state must preserve `followInfos.fxaIncomeDetails` residual value and `preDeprecation` per detail; owner rows in `extraData.fxaOwnerRecords` are optional and represent responsible-user/serial allocation only.
- Fixed asset disposal, move, and sale forms must not require owner-record selection or a row-level category selector; category filtering belongs in the multi-add sheet, while quantity, branch, and department are owned by transaction details.
- Fixed asset disposal, move, and sale row count limits must be driven by `fixedAssetLocationRemainder` using the row fixed asset, row branch/department, form date, and current transaction id exclusion.
- Loading or refetching a fixed asset location remainder must not mutate an existing transaction detail count; apply the limit only when the user changes the count.
- Fixed asset disposal preview hooks must never rebuild saved main or follow rows from master-data queries; tab and T-balance remounts must leave Mongo-backed amounts, counts, sides, and generated `fxaDepOut` rows unchanged.
- Fixed asset disposal, move, and sale owner-record selection is optional per detail; when users select owner balance rows, the selected owner counts must not exceed the detail count and are saved through `extraData.fxaOwnerRecords` with `ownerId`.
- Fixed asset navigation should show the operational owner-record list and fixed asset remainder page; fixed asset master data remains under settings and internal movement remains an add-transaction action.
- Fixed asset category annual depreciation percentage is canonical in saved data; useful years are displayed and editable only as a derived helper rounded to two decimals.
- Fixed asset master rows are created by income transactions, so settings must not expose a direct "add fixed asset" action.
- Module Federation exposes, route paths, and named exports must stay aligned.
- Journal report total calculation must stay scoped to the rendered report table body and zero-row hiding must preserve rows explicitly marked with `data-draw-zero="1"`.
- Journal report headers and footers must stay aligned with each report config's two recursive grouping columns plus `colCount` value columns.
- Journal report Excel export must use the rendered visible rows so calculated totals, zero-row visibility, grouping, and expanded detail data match the result users see.
- Journal report inventory and fixed-asset location filtering is represented by branch/department selectors because erxes transaction details carry branch/department instead of Erkhet `inv_location`/`fxa_location` ids.
- Inventory report remainder and cost movement totals must derive their sign from transaction side; debit adds and credit subtracts, including cost-only `invJustify` rows.
- Journal report filter visibility and submitted query parameters must be declared in `src/modules/journal-reports/types/reportFilters.ts`; adding a field to a form without mapping it to applicable reports and its backend query parameter is not allowed.

## Validation

- `pnpm nx build accounting_ui`
- `pnpm exec tsc -p frontend/plugins/accounting_ui/tsconfig.app.json --noEmit --pretty false`
- Smoke scenario: create fund and debt rate adjustments, verify main/foreign currency options come from system `dealCurrency`, calculate details, run transactions, and confirm detail subscriptions/linked transaction display update without manual refresh.
- Smoke scenario: create a closing adjustment, calculate details, edit a row tax percent, run transactions, and confirm status plus tax impact refresh without a manual page reload.
- Smoke scenario: in cash, bank, payable, and receivable transaction forms, manually edit main and foreign currency amounts and verify paired amount syncing does not loop or lose precision after refetch.
- Smoke scenario: open `/accounting/main` and `/accounting/records`, apply journal/search/date/account filters, export without selection, then select rows and export again to verify filtered and selected-id exports start successfully.
- Smoke scenario: in inventory sale, income, out, and move rows, change products and verify `unitPrice` plus amount/follow cost values refresh without a manual page reload; in a sale row, change quantity repeatedly and verify both generated follow transactions keep the fetched active unit cost.
- Smoke scenario: create inventory cost increase and decrease transactions, add multiple products, verify current remainder/current unit cost display, enter per-unit deltas, confirm after-unit cost and total amount recalculate, then save without changing quantity.
- Smoke scenario: in inventory income, out, move, sale, and sale return, use "Олон бараа нэмэх" and verify one journal-specific bulk lookup fills every selected row with count one plus matching amount/weight/follow values; then change one row's product, including back to its initial product, and verify only that row's fill values refresh.
- Smoke scenario: in fixed asset income, out, move, and sale forms, enable "Дэлгэрэнгүй харагдац" and verify each detail row can store independent branch and department values.
- Smoke scenario: in fixed asset income, enter category/code/name/count/unit cost, verify keyboard shortcuts can reach and edit code/name cells, open the detail owner sheet, verify it starts empty, confirm the owner-record add button shows the remaining quantity in red while positive and disables at zero, optionally add owner rows whose counts total the detail count, set residual value and `preDeprecation`, save, refetch, and verify the generated fixed asset plus optional owner records remain.
- Smoke scenario: in fixed asset out, move, and sale forms, select a fixed asset in a single row, verify branch/department default from the transaction header, change row branch/department and confirm the count limit refreshes from that location, open the owner-record sheet and select active owner balance rows below or equal to the detail count, open "Олон хөрөнгө нэмэх", filter by category, append multiple assets as separate details, verify out/move cost fields fill from the asset cost base, sale keeps user-entered sale price, and detail branch/department values persist from the detailed view.
- Smoke scenario: open `/accounting/fixed-assets/owner-records`, verify the "Үндсэн хөрөнгө" navigation group appears, filter owner records by search, fixed asset, category, owner, action, status, and created date, then use Үүсгэх/Шилжүүлэх/Цуцлах actions to create direct owner-record ledger rows without leaving the page.
- Smoke scenario: open `/accounting/fixed-assets/remainders`, verify the "Үлдэгдэл" navigation item appears without the fixed asset settings or direct internal-move shortcuts, filter by search, fixed asset, category, branch, department, and date, and confirm rows show positive fixed asset quantities grouped by branch and department.
- Smoke scenario: generate account statement, trial balance, general ledger, main journal, main journal summary, fund, debt, inventory cost, inventory sale, inventory sale-cost, inventory sale-period, inventory price, inventory profit, inventory shipper, inventory document, inventory seller subsystem, and fixed asset journal reports with and without "Хоосон мөр харуулах" and "Гүйлгээний төрөл", verify parent/footer totals plus detail rows remain correct, and double-click an account statement detail row to open its transaction edit screen.
- Smoke scenario: generate each journal report with filters, optionally expand account-statement details, click "Excel татах", and verify the downloaded `.xlsx` contains the visible headers, grouped rows, calculated totals, and expanded detail rows.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-25` — `Bulk Inventory Quantity Initialization`

- **Summary:** Inventory row defaults now use count one, multi-add fills count-derived values immediately, move and sale-return follow details retain per-source state, and balancing tabs calculate their difference from live watched transaction documents instead of stale field-array snapshots.
- **Affected areas:** Inventory out, move, sale, and sale-return bulk-add row mapping; move and sale-return follow-detail synchronization; and in-form balancing transaction creation. Income, fixed-asset, and quantity-neutral inventory-adjustment behavior remain unchanged.
- **Contracts changed:** None.

### `2026-09-25` — `Inventory Cost Adjustment And Active Cost Flow`

- **Summary:** Inventory cost increases and decreases share one quantity-neutral adjustment form with bidirectional delta/after-cost editing; out and movement costs are read-only active costs; sale follow details retain source identity and active cost across repeated quantity edits; inventory reports sign adjustments by transaction side.
- **Affected areas:** Inventory journal constants, standalone `InvJustifyForm`, form schema/defaults, add and print mappings, out/movement/sale row calculations, current-cost queries, follow previews, and inventory report helpers.
- **Contracts changed:** Uses `invJustify` plus transaction side as the cost-adjustment contract and supplies optional `excludedTransactionIds` to `getAccCurrentCost` while editing inventory out, adjustment, and movement transactions.

### `2026-09-23` — `Journal Report Excel Export`

- **Summary:** Journal report results can be downloaded as formatted Excel workbooks using the currently rendered headers, visible rows, totals, and expanded details.
- **Affected areas:** `src/pages/GenJournalReport.tsx` and `src/modules/journal-reports` report header/export utilities.
- **Contracts changed:** None; export uses the existing rendered journal report query result.

### `2026-09-23` — `Transaction List Export`

- **Summary:** Accounting main and journal record lists now expose platform export actions that use the current frontend filters or selected rows.
- **Affected areas:** `src/pages/TransactionListPage.tsx`, `src/pages/TrRecordListPage.tsx`, transaction command bars, and transaction filter variable helpers.
- **Contracts changed:** Consumes `accounting:account.transactions` export metadata guarded by `transactionsExportManage`.

### `2026-09-23` — `Transaction Records And Batched Inventory Fill`

- **Summary:** Transaction records classify detail amounts by the transaction-level side and preserve fixed structural-column widths across journal layouts, while inventory multi-add batches each journal's fill lookup and later product changes refill only the changed row.
- **Affected areas:** Transaction record debit/credit cells and journal-specific column layout; inventory income, out, move, sale, and sale-return bulk-add controls; row product-change handling; and sale follow-cost initialization.
- **Contracts changed:** Adds plugin-local `accountingBulkIncomeProductFill` over existing `getAccLastIncomePrice` and `productsMain` fields; other journals reuse `accountingGetAccCurrentCost` with multiple product ids.

### `2026-09-19` — `Inventory Income Weight Allocation`

- **Summary:** Inventory income can allocate additional expenses by editable total line weight calculated from product weight and count.
- **Affected areas:** Inventory income expense rules, detail state, advanced table columns, product lookup, and allocation calculation.
- **Contracts changed:** Consumes optional core product `weight` and accounting transaction detail `weight`.

### `2026-09-18` — `Transaction Delete Filter Return`

- **Summary:** Transaction edit links now preserve the current list URL so deleting a transaction returns to the previously filtered list.
- **Affected areas:** `src/modules/transactions/components`, `src/modules/transactions/transaction-form`, and transaction navigation utilities.
- **Contracts changed:** None.

### `2026-09-18` — `Inventory Sale Edit Preservation`

- **Summary:** Inventory sale and return edit forms preserve persisted unit prices, amounts, and VAT/CTAX state until the user selects a different product.
- **Affected areas:** Inventory sale row effects and transaction default values.
- **Contracts changed:** None.
