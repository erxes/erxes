# `accounting_ui` Plugin Guide

## Identity

- **Plugin:** `accounting`
- **Project:** `accounting_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/accounting_ui`
- **Last synchronized:** `2026-09-02`

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
- Fixed asset income, out, move, and sale transaction rows can toggle detailed view to edit branch and department per detail.
- Fixed asset income rows capture acquisition category, code, name, count, unit cost, tax settings, and optional detail-level branch/department values; code and name are editable inline table cells that participate in transaction-form keyboard navigation, and the backend creates the fixed asset from the saved detail.
- Fixed asset category forms show both derived useful years and annual depreciation percentage; changing either field updates the other rounded to two decimals, while the backend stores the annual percentage as the canonical value.
- Fixed asset settings list income-created asset records without a direct add button; asset creation belongs to fixed asset income transactions.
- Fixed asset income detail sheets start with no owner-allocation rows by default; the owner-record add button shows the remaining quantity, lets users split the detail count into responsible-user/serial rows, and keeps residual value plus opening accumulated depreciation as detail-level follow-info.
- Fixed asset out, move, and sale rows select existing fixed assets directly, while the "Олон хөрөнгө нэмэх" sheet can filter by category and append multiple selected assets as separate details; selected rows refetch fixed asset location remainder whenever fixed asset, branch, department, or date changes, can optionally select active owner records up to the detail count, out/move cost is based on asset data, sale keeps user-entered sale price, and branch/department values stay on each detail.
- Fixed asset navigation includes an "Үндсэн хөрөнгө" section with an owner-record list and a branch/department fixed asset remainder page; the redundant fixed asset settings and direct internal-move shortcuts are not shown there.
- The in-form add-transaction dropdown can create cash, bank, receivable, payable, or main transaction tabs directly from a selected account by resolving the account journal and pre-filling the first detail account; journal-only additions start with an empty account.
- Related account override inputs keep focus while users type and persist custom debit and credit code lists independently.
- Empty related account overrides are omitted on submit so backend-calculated default debit/credit related accounts remain active, and the related-account editor falls back to default `dt/ct` codes when `customDt/customCt` are empty.
- Accounting settings pages manage accounts, account categories, permissions, VAT, CTAX, and sync configuration; VAT/CTAX row access is guarded by the unified tax-row permission actions.
- Journal report rendering groups backend rows recursively, filters by Erkhet-compatible transaction type plus erxes-native account/product/fixed-asset/customer/branch/department fields, renders account statement, trial balance, general ledger, main journal, main journal summary, fund, debt, inventory cost, inventory sale, inventory sale-cost, inventory sale-period, inventory price, inventory profit, inventory shipper, inventory document, inventory seller subsystem, and fixed asset report variants, derives table headers and footers from report column metadata, keeps date filter controls visually consistent, drills account rows into account statements with filter context, calculates parent/footer totals after render, hides all-zero rows unless users choose to show them, loads account-statement detail rows without mutating report state, and opens transaction edit screens from detail rows.

## Architecture

| Area                | Path                                                          | Responsibility                                                                                                  |
| ------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Runtime             | `src/main.ts`                                                 | Starts the accounting UI remote.                                                                                |
| Plugin config       | `src/config.tsx`                                              | Registers accounting routes and navigation with the host.                                                       |
| Route composition   | `src/modules/AccountingMain.tsx`                              | Wires accounting pages into the plugin router.                                                                  |
| Transactions        | `src/modules/transactions`                                    | Owns transaction tables, forms, GraphQL documents, hooks, and print documents.                                  |
| Fixed assets        | `src/modules/fixedAssets`                                     | Owns fixed asset navigation and owner-record operational list surfaces.                                         |
| Adjustments         | `src/modules/adjustments`                                     | Owns inventory, fixed asset, fund rate, debt rate, and closing adjustment UI.                                   |
| Journal reports     | `src/modules/journal-reports`                                 | Owns report selection, filters, grouped rendering, totals, and detail rows.                                     |
| Report configs      | `src/modules/journal-reports/types/reports`                   | Groups report titles, choices, and group rules by main, fund, debt, inventory, and fixed asset report families. |
| Report table layout | `src/modules/journal-reports/components/reportTableLayout.ts` | Maps each report code to header rows and footer column counts aligned with the recursive report renderer.       |
| Report renderers    | `src/modules/journal-reports/components/includes/handlers`    | Maps report families to Erkhet-style `calcReport` table calculators and detail-row renderers.                   |
| Settings            | `src/modules/settings`                                        | Owns accounting settings forms, account tables, filters, and config hooks.                                      |
| Pages               | `src/pages`                                                   | Exposes route-level page components for accounting surfaces.                                                    |
| Relation widgets    | `src/widgets/relation/RelationWidgets.tsx`                    | Provides accounting relation widget exports.                                                                    |

## Contracts

### Provides

- Module Federation exposes defined in `module-federation.config.ts`.
- Accounting routes exposed through `src/modules/AccountingMain.tsx` and navigation registered from `src/config.tsx`.
- Accounting relation widget exports from `src/widgets/relation/RelationWidgets.tsx`.

### Consumes

- Accounting API GraphQL contracts for transactions, reports, settings, inventory/fixed asset adjustments, fund rate adjustments, and debt rate adjustments, including journal report `trKind` filters.
- Fixed asset location remainder contract `fixedAssetLocationRemainder(fixedAssetId, branchId, departmentId, date, excludeTransactionId)` for disposal/move/sale row count limits.
- Fixed asset location remainder list contract `fixedAssetLocationRemainders(searchValue, fixedAssetId, categoryId, branchId, departmentId, date, limit)` for the fixed asset remainder page.
- Fixed asset owner-record query contract `fxaOwnerRecords(fixedAssetIds, status, balanceOnly)` for disposal/move/sale owner balance selection sheets.
- Fixed asset owner-record list contracts `fxaOwnerRecords(searchValue, fixedAssetId, categoryId, action, ownerId, status, createdFrom, createdTo, page, perPage)` and `fxaOwnerRecordsCount(...)`, plus direct `fixedAssetOwnerRecordsAdd`, `fixedAssetOwnerRecordsTransfer`, and `fixedAssetOwnerRecordsRemove` mutations for the fixed asset owner-record page.
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
- Fixed asset income detail state must preserve `fixedAssetCategoryId`, `fixedAssetCode`, and `fixedAssetName` through save/refetch so generated fixed assets remain editable from their source transaction detail.
- Fixed asset income code and name cells must use the same `PopoverScoped` plus `RecordTableInlineCell` pattern as numeric inline cells so shortcut navigation can focus and edit them.
- Fixed asset detail tables must tolerate an uninitialized `details` watch value during create-route bootstrap and render with an empty array until form defaults arrive.
- Fixed asset income owner sheet state must preserve `followInfos.fxaIncomeDetails` residual value and opening accumulated depreciation per detail; owner rows in `extraData.fxaOwnerRecords` are optional and represent responsible-user/serial allocation only.
- Fixed asset disposal, move, and sale forms must not require owner-record selection or a row-level category selector; category filtering belongs in the multi-add sheet, while quantity, branch, and department are owned by transaction details.
- Fixed asset disposal, move, and sale row count limits must be driven by `fixedAssetLocationRemainder` using the row fixed asset, row branch/department, form date, and current transaction id exclusion.
- Fixed asset disposal, move, and sale owner-record selection is optional per detail; when users select owner balance rows, the selected owner counts must not exceed the detail count and are saved through `extraData.fxaOwnerRecords` with `ownerId`.
- Fixed asset navigation should show the operational owner-record list and fixed asset remainder page; fixed asset master data remains under settings and internal movement remains an add-transaction action.
- Fixed asset category annual depreciation percentage is canonical in saved data; useful years are displayed and editable only as a derived helper rounded to two decimals.
- Fixed asset master rows are created by income transactions, so settings must not expose a direct "add fixed asset" action.
- Module Federation exposes, route paths, and named exports must stay aligned.
- Journal report total calculation must stay scoped to the rendered report table body and zero-row hiding must preserve rows explicitly marked with `data-draw-zero="1"`.
- Journal report headers and footers must stay aligned with each report config's two recursive grouping columns plus `colCount` value columns.
- Journal report inventory and fixed-asset location filtering is represented by branch/department selectors because erxes transaction details carry branch/department instead of Erkhet `inv_location`/`fxa_location` ids.

## Validation

- `pnpm nx build accounting_ui`
- `pnpm exec tsc -p frontend/plugins/accounting_ui/tsconfig.app.json --noEmit --pretty false`
- Smoke scenario: create fund and debt rate adjustments, verify main/foreign currency options come from system `dealCurrency`, calculate details, run transactions, and confirm detail subscriptions/linked transaction display update without manual refresh.
- Smoke scenario: create a closing adjustment, calculate details, edit a row tax percent, run transactions, and confirm status plus tax impact refresh without a manual page reload.
- Smoke scenario: in cash, bank, payable, and receivable transaction forms, manually edit main and foreign currency amounts and verify paired amount syncing does not loop or lose precision after refetch.
- Smoke scenario: in inventory sale, income, out, and move rows, change products and verify `unitPrice` plus amount/follow cost values refresh without a manual page reload.
- Smoke scenario: in fixed asset income, out, move, and sale forms, enable "Дэлгэрэнгүй харагдац" and verify each detail row can store independent branch and department values.
- Smoke scenario: in fixed asset income, enter category/code/name/count/unit cost, verify keyboard shortcuts can reach and edit code/name cells, open the detail owner sheet, verify it starts empty, confirm the owner-record add button shows the remaining quantity in red while positive and disables at zero, optionally add owner rows whose counts total the detail count, set residual/opening depreciation values, save, refetch, and verify the generated fixed asset plus optional owner records remain.
- Smoke scenario: in fixed asset out, move, and sale forms, select a fixed asset in a single row, verify branch/department default from the transaction header, change row branch/department and confirm the count limit refreshes from that location, open the owner-record sheet and select active owner balance rows below or equal to the detail count, open "Олон хөрөнгө нэмэх", filter by category, append multiple assets as separate details, verify out/move cost fields fill from the asset cost base, sale keeps user-entered sale price, and detail branch/department values persist from the detailed view.
- Smoke scenario: open `/accounting/fixed-assets/owner-records`, verify the "Үндсэн хөрөнгө" navigation group appears, filter owner records by search, fixed asset, category, owner, action, status, and created date, then use Үүсгэх/Шилжүүлэх/Цуцлах actions to create direct owner-record ledger rows without leaving the page.
- Smoke scenario: open `/accounting/fixed-assets/remainders`, verify the "Үлдэгдэл" navigation item appears without the fixed asset settings or direct internal-move shortcuts, filter by search, fixed asset, category, branch, department, and date, and confirm rows show positive fixed asset quantities grouped by branch and department.
- Smoke scenario: generate account statement, trial balance, general ledger, main journal, main journal summary, fund, debt, inventory cost, inventory sale, inventory sale-cost, inventory sale-period, inventory price, inventory profit, inventory shipper, inventory document, inventory seller subsystem, and fixed asset journal reports with and without "Хоосон мөр харуулах" and "Гүйлгээний төрөл", verify parent/footer totals plus detail rows remain correct, and double-click an account statement detail row to open its transaction edit screen.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-02` — `Tax Row Permission Guard`

- **Summary:** Updated accounting settings import visibility to use the unified tax-row import permission.
- **Affected areas:** `src/modules/settings/components/AccountingTopbar.tsx`.
- **Contracts changed:** Consumes `taxRowsImportManage` instead of the old VAT-specific import action.

### `2026-09-02` — `Fixed Asset Annual Depreciation Rate`

- **Summary:** Fixed asset category forms now synchronize useful years with annual depreciation percentage and send the annual percentage as the canonical saved value, while fixed asset settings no longer expose direct asset creation and fixed asset income rows expose opening accumulated depreciation in advanced view.
- **Affected areas:** `src/modules/settings/components/AccountingTopbar.tsx`, `src/modules/settings/fixed-assets`, `src/modules/inventories/safeRemainders`, `src/modules/transactions/types`, `src/modules/transactions/transaction-form/graphql/queries/fixedAssets.ts`, `src/modules/transactions/transaction-form/components/documents`, `src/modules/transactions/transaction-form/components/forms/FxaIncomeForm`, `src/modules/transactions/transaction-form/components/forms/FxaOutForm`, `src/modules/transactions/transaction-form/components/forms/FxaMoveForm`, `src/modules/transactions/transaction-form/components/forms/FxaSaleForm`.
- **Contracts changed:** Consumes `defaultAnnualDepreciationRate`, `defaultTaxAnnualDepreciationRate`, `annualDepreciationRate`, and `taxAnnualDepreciationRate`.

### `2026-08-29` — `Fixed Asset Remainder Navigation`

- **Summary:** Replaced the fixed asset settings and direct internal-move shortcuts in the accounting sidebar with a fixed asset remainder page filtered by asset, category, branch, department, search, and date.
- **Affected areas:** `src/config.tsx`, `src/modules/AccountingMain.tsx`, `src/modules/fixedAssets`, `src/pages/fixed-assets/FxaRemaindersPage.tsx`, `src/modules/settings/fixed-assets/graphql/queries/fixedAssets.ts`.
- **Contracts changed:** Consumes `fixedAssetLocationRemainders`.

### `2026-08-29` — `Fixed Asset Owner Partial Disposal`

- **Summary:** Fixed asset out, move, and sale owner-record sheets now treat the detail quantity as a maximum and allow partially owner-assigned disposal quantities.
- **Affected areas:** `src/modules/transactions/transaction-form/components/forms/FxaOwnerRecordsSheet.tsx`.
- **Contracts changed:** None.

### `2026-08-29` — `Fixed Asset Owner Ledger`

- **Summary:** Updated owner-record list, filters, income allocation rows, disposal/move/sale selection sheets, and direct owner-record action sheets for owner ledger rows with `received`/`handedOver` actions and balance-only selection.
- **Affected areas:** `src/modules/fixedAssets`, `src/modules/settings/fixed-assets`, `src/modules/transactions/transaction-form/components/forms/FxaIncomeForm/FxaIncomeOwnerRecordsSheet.tsx`, `src/modules/transactions/transaction-form/components/forms/FxaOwnerRecordsSheet.tsx`.
- **Contracts changed:** Owner record UI now consumes ledger fields only: `action`, `ownerId`, `balanceOnly`, `fixedAssetOwnerRecordsAdd`, `fixedAssetOwnerRecordsTransfer`, and `fixedAssetOwnerRecordsRemove`.

### `2026-08-28` — `Fixed Asset Owner Record List`

- **Summary:** Added a fixed asset owner-record navigation group, 20-row paged list, filters, and direct receive, transfer, and cancel sheets that do not create accounting transactions.
- **Affected areas:** `src/config.tsx`, `src/modules/AccountingMain.tsx`, `src/modules/fixedAssets`, `src/pages/fixed-assets`, `src/modules/settings/fixed-assets/graphql/queries/fixedAssets.ts`, `src/modules/settings/fixed-assets/hooks/useFxaOwnerRecords.tsx`.
- **Contracts changed:** Consumes `fxaOwnerRecords` and `fxaOwnerRecordsCount` with owner/action/status list filters and 20-row page variables.

### `2026-08-28` — `Fixed Asset Location Remainder Refresh`

- **Summary:** Fixed asset out, move, and sale rows now refetch location-specific remainder when fixed asset, branch, department, or date changes and clamp count from that result.
- **Affected areas:** `src/modules/settings/fixed-assets/graphql/queries/fixedAssets.ts`, `src/modules/settings/fixed-assets/hooks/useFixedAssetLocationRemainder.tsx`, `src/modules/transactions/transaction-form/components/forms/FxaOutForm`, `src/modules/transactions/transaction-form/components/forms/FxaMoveForm`, `src/modules/transactions/transaction-form/components/forms/FxaSaleForm`.
- **Contracts changed:** Consumes `fixedAssetLocationRemainder`.

### `2026-08-28` — `Fixed Asset Owner Record Selection`

- **Summary:** Fixed asset out, move, and sale rows now expose an owner-record sheet that lists active owner allocations for the row asset/location and saves count-matched selections through transaction extra data.
- **Affected areas:** `src/modules/transactions/transaction-form/components/forms/FxaOwnerRecordsSheet.tsx`, `src/modules/transactions/transaction-form/components/forms/FxaOutForm`, `src/modules/transactions/transaction-form/components/forms/FxaMoveForm`, `src/modules/transactions/transaction-form/components/forms/FxaSaleForm`, `src/modules/transactions/transaction-form/graphql/queries/fixedAssets.ts`, `src/modules/transactions/transaction-form/contants`.
- **Contracts changed:** Transaction `extraData.fxaOwnerRecords` entries use `ownerId` and count; `fxaOwnerRecords` selection uses `balanceOnly` owner balances while branch/department quantity remains validated by transaction-detail location remainder.

### `2026-08-28` — `Fixed Asset Disposal Bulk Selection`

- **Summary:** Fixed asset out, move, and sale detail rows keep direct asset selection, and their add-row controls now include a category-filtered bulk asset picker that appends selected assets as separate details with count and cost data loaded from fixed asset queries.
- **Affected areas:** `src/modules/settings/fixed-assets/graphql/queries/fixedAssets.ts`, `src/modules/settings/fixed-assets/components/SelectFixedAssetsBulk.tsx`, `src/modules/settings/fixed-assets/components/SelectFixedAsset.tsx`, `src/modules/transactions/transaction-form/components/forms/FxaOutForm`, `src/modules/transactions/transaction-form/components/forms/FxaMoveForm`, `src/modules/transactions/transaction-form/components/forms/FxaSaleForm`.
- **Contracts changed:** None.

### `2026-08-28` — `Fixed Asset Detail Bootstrap Guard`

- **Summary:** Fixed asset income, out, move, and sale detail tables now render safely when form details are not initialized during create-route bootstrap, and disposal follow-transaction effects no longer reference removed owner-record selection state.
- **Affected areas:** `src/modules/transactions/transaction-form/components/forms/Fxa*Form/FixedAssetForm.tsx`, `src/modules/transactions/transaction-form/components/forms/hooks/useFxaDisposalFollowTrs.ts`.
- **Contracts changed:** None.
