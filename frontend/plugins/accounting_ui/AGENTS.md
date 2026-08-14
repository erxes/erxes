# `accounting_ui` Plugin Guide

## Identity

- **Plugin:** `accounting`
- **Project:** `accounting_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/accounting_ui`
- **Last synchronized:** `2026-08-14`

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
- Accounting settings pages manage accounts, account categories, permissions, VAT, CTAX, and sync configuration.
- Journal report rendering groups backend rows recursively, filters by Erkhet-compatible transaction type plus erxes-native account/product/fixed-asset/customer/branch/department fields, renders account statement, trial balance, general ledger, main journal, main journal summary, fund, debt, inventory cost, inventory sale, inventory sale-cost, inventory sale-period, inventory price, inventory profit, inventory shipper, inventory document, inventory seller subsystem, and fixed asset report variants, derives table headers and footers from report column metadata, keeps date filter controls visually consistent, calculates parent/footer totals after render, hides all-zero rows unless users choose to show them, loads account-statement detail rows without mutating report state, and opens transaction edit screens from detail rows.

## Architecture

| Area              | Path                                       | Responsibility                                                                 |
| ----------------- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| Runtime           | `src/main.ts`                              | Starts the accounting UI remote.                                               |
| Plugin config     | `src/config.tsx`                           | Registers accounting routes and navigation with the host.                      |
| Route composition | `src/modules/AccountingMain.tsx`           | Wires accounting pages into the plugin router.                                 |
| Transactions      | `src/modules/transactions`                 | Owns transaction tables, forms, GraphQL documents, hooks, and print documents. |
| Adjustments       | `src/modules/adjustments`                  | Owns inventory, fixed asset, fund rate, debt rate, and closing adjustment UI.  |
| Journal reports   | `src/modules/journal-reports`              | Owns report selection, filters, grouped rendering, totals, and detail rows.    |
| Report configs    | `src/modules/journal-reports/types/reports` | Groups report titles, choices, and group rules by main, fund, debt, inventory, and fixed asset report families. |
| Report table layout | `src/modules/journal-reports/components/reportTableLayout.ts` | Maps each report code to header rows and footer column counts aligned with the recursive report renderer. |
| Report renderers  | `src/modules/journal-reports/components/includes/handlers` | Maps report families to Erkhet-style `calcReport` table calculators and detail-row renderers. |
| Settings          | `src/modules/settings`                     | Owns accounting settings forms, account tables, filters, and config hooks.     |
| Pages             | `src/pages`                                | Exposes route-level page components for accounting surfaces.                   |
| Relation widgets  | `src/widgets/relation/RelationWidgets.tsx` | Provides accounting relation widget exports.                                   |

## Contracts

### Provides

- Module Federation exposes defined in `module-federation.config.ts`.
- Accounting routes exposed through `src/modules/AccountingMain.tsx` and navigation registered from `src/config.tsx`.
- Accounting relation widget exports from `src/widgets/relation/RelationWidgets.tsx`.

### Consumes

- Accounting API GraphQL contracts for transactions, reports, settings, inventory/fixed asset adjustments, fund rate adjustments, and debt rate adjustments, including journal report `trKind` filters.
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
- Smoke scenario: generate account statement, trial balance, general ledger, main journal, main journal summary, fund, debt, inventory cost, inventory sale, inventory sale-cost, inventory sale-period, inventory price, inventory profit, inventory shipper, inventory document, inventory seller subsystem, and fixed asset journal reports with and without "Хоосон мөр харуулах" and "Гүйлгээний төрөл", verify parent/footer totals plus detail rows remain correct, and double-click an account statement detail row to open its transaction edit screen.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-14` — `Journal Report Table Layout`

- **Summary:** Journal report headers and footers now come from a shared layout registry so displayed columns stay aligned with the recursive renderer, date range filters use consistent formatting and layout, and renderer lookup uses the Erkhet-aligned `getCalcReport` name.
- **Affected areas:** `src/modules/journal-reports/components`.
- **Contracts changed:** None.

### `2026-08-14` — `Journal Report Detail Deduplication`

- **Summary:** Journal report detail rows are rebuilt from the latest query result instead of appended onto previous render state, preventing repeated account-statement detail rows after rerenders or refetches.
- **Affected areas:** `src/modules/journal-reports/components`.
- **Contracts changed:** None.

### `2026-08-14` — `Journal Report Structure`

- **Summary:** Journal report config and renderer registries were split by report family, while the report selector shows full wrapped names inside wider, scrollable, collapsed report groups.
- **Affected areas:** `src/modules/journal-reports/components`, `src/modules/journal-reports/types`.
- **Contracts changed:** None.

### `2026-08-14` — `Erkhet Journal Report Coverage`

- **Summary:** Journal report UI now exposes erxes-native product/fixed-asset/customer filters and renders fund, debt, fixed asset, inventory sale/cost/period/price/profit/shipper/document, and inventory seller subsystem variants alongside the main journal reports through the shared grouped report renderer.
- **Affected areas:** `src/modules/journal-reports/components`, `src/modules/journal-reports/types`.
- **Contracts changed:** None.

### `2026-08-13` — `Journal Report Rendering`

- **Summary:** Journal report rendering now mirrors the Erkhet generated-report templates more closely with transaction-kind filtering, scoped total calculation, all-zero row hiding, immutable detail grouping, and transaction navigation from account-statement detail rows.
- **Affected areas:** `src/modules/journal-reports/components`, `src/modules/journal-reports/graphql`, `src/modules/journal-reports/hooks`, `src/modules/journal-reports/states`, `src/modules/journal-reports/types`.
- **Contracts changed:** Consumes optional `trKind`, `trKinds`, and `getTrKind` journal report filters.

### `2026-08-13` — `Adjustment Detail Record Tables`

- **Summary:** Fund and debt rate adjustment detail result grids now use accounting `RecordTable` columns instead of raw HTML tables.
- **Affected areas:** `src/modules/adjustments/rate/components/AdjustFundRateDetail.tsx`, `src/modules/adjustments/debt/components/AdjustDebtRateDetail.tsx`.
- **Contracts changed:** None.

### `2026-08-11` — `Closing Detail Renderer Extraction`

- **Summary:** Closing adjustment detail table cell renderers and action controls were moved out of the parent component to satisfy static analysis.
- **Affected areas:** `src/modules/adjustments/closing/components/AdjustClosingDetail.tsx`.
- **Contracts changed:** None.

### `2026-08-11` — `Closing Transactions Tab`

- **Summary:** Closing adjustment detail now has calculation and transactions tabs, with generated transactions rendered through the transaction balance table columns.
- **Affected areas:** `src/modules/adjustments/closing/components/AdjustClosingDetail.tsx`.
- **Contracts changed:** None.

### `2026-08-11` — `Closing Group Read-Only Labels`

- **Summary:** Closing adjustment detail group headers now display branch and department as read-only `code - title` labels instead of selector inline cells.
- **Affected areas:** `src/modules/adjustments/closing/components/AdjustClosingDetail.tsx`.
- **Contracts changed:** None.

### `2026-08-11` — `Closing List Inline Accounts`

- **Summary:** Closing adjustment list account columns now render through `AccountsInline` instead of displaying raw account ids.
- **Affected areas:** `src/modules/adjustments/closing/components/AdjustClosingColumns.tsx`.
- **Contracts changed:** None.


### `2026-08-11` — `Hide Closing Begin Date`

- **Summary:** The closing adjustment create sheet no longer exposes `beginDate`; users select only the closing date and account fields.
- **Affected areas:** `src/modules/adjustments/closing/components/AddAdjustClosing.tsx`.
- **Contracts changed:** None.
