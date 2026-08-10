# `accounting_ui` Plugin Guide

## Identity

- **Plugin:** `accounting`
- **Project:** `accounting_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/accounting_ui`
- **Last synchronized:** `2026-08-11`

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
- Opens fund and debt rate adjustment create/edit forms in `AccountingSheet` panels.
- Uses system `dealCurrency` options for fund/debt adjustment main and foreign currency fields plus account currency selectors; rate adjustment main currency defaults from system `mainCurrency`.
- Fetches spot rate from the existing exchange-rate hook when adjustment date, main currency, and foreign currency are selected.
- Fund rate detail can calculate, show validation state, show account balances grouped by branch/department, run linked transactions, and display linked transaction rows.
- Debt rate detail can calculate, show validation state, show account/customer balances grouped by branch/department, run linked transactions, and display linked transaction ids.
- Closing adjustment detail can calculate temporary-account balances grouped by branch/department, show validation state, edit tax percentage per row, run closing transactions, publish, cancel, and show tax impact.
- Inventory transaction rows fill prices from product master, current inventory cost, or last completed inventory income price depending on journal behavior.
- Accounting settings pages manage accounts, account categories, permissions, VAT, CTAX, and sync configuration.

## Architecture

| Area              | Path                                       | Responsibility                                                                 |
| ----------------- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| Runtime           | `src/main.ts`                              | Starts the accounting UI remote.                                               |
| Plugin config     | `src/config.tsx`                           | Registers accounting routes and navigation with the host.                      |
| Route composition | `src/modules/AccountingMain.tsx`           | Wires accounting pages into the plugin router.                                 |
| Transactions      | `src/modules/transactions`                 | Owns transaction tables, forms, GraphQL documents, hooks, and print documents. |
| Adjustments       | `src/modules/adjustments`                  | Owns inventory, fixed asset, fund rate, debt rate, and closing adjustment UI.  |
| Settings          | `src/modules/settings`                     | Owns accounting settings forms, account tables, filters, and config hooks.     |
| Pages             | `src/pages`                                | Exposes route-level page components for accounting surfaces.                   |
| Relation widgets  | `src/widgets/relation/RelationWidgets.tsx` | Provides accounting relation widget exports.                                   |

## Contracts

### Provides

- Module Federation exposes defined in `module-federation.config.ts`.
- Accounting routes exposed through `src/modules/AccountingMain.tsx` and navigation registered from `src/config.tsx`.
- Accounting relation widget exports from `src/widgets/relation/RelationWidgets.tsx`.

### Consumes

- Accounting API GraphQL contracts for transactions, reports, settings, inventory/fixed asset adjustments, fund rate adjustments, and debt rate adjustments.
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
- Adjustment create/edit forms must use sheet layout consistent with accounting settings and adjustment forms.
- Fund/debt adjustment main and foreign currency selectors must use system `dealCurrency`; default main currency comes from `mainCurrency`.
- Account currency create/edit, inline edit, and filter selectors must use the same system `dealCurrency` options.
- Currency amount inputs display rounded values by default but expose configured edit precision while focused.
- Transaction currency amount synchronization must react to manual amount-field changes and avoid hook cycles.
- Module Federation exposes, route paths, and named exports must stay aligned.

## Validation

- `pnpm nx build accounting_ui`
- `pnpm exec tsc -p frontend/plugins/accounting_ui/tsconfig.app.json --noEmit --pretty false`
- Smoke scenario: create fund and debt rate adjustments, verify main/foreign currency options come from system `dealCurrency`, calculate details, run transactions, and confirm detail subscriptions/linked transaction display update without manual refresh.
- Smoke scenario: create a closing adjustment, calculate details, edit a row tax percent, run transactions, and confirm status plus tax impact refresh without a manual page reload.
- Smoke scenario: in cash, bank, payable, and receivable transaction forms, manually edit main and foreign currency amounts and verify paired amount syncing does not loop or lose precision after refetch.
- Smoke scenario: in inventory sale, income, out, and move rows, change products and verify `unitPrice` plus amount/follow cost values refresh without a manual page reload.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-11` — `Temporary Account Closing`

- **Summary:** Closing adjustment UI now routes to detail screens, separates calculation from transaction execution, supports per-row tax percent edits, and shows validation/tax-impact state.
- **Affected areas:** `src/modules/AccountingMain.tsx`, `src/pages/AdjustClosingDetailPage.tsx`, `src/modules/adjustments/closing`.
- **Contracts changed:** Consumes closing adjustment calculate, do-transaction, publish, cancel, detail validation, grouped details, and tax impact fields.

### `2026-08-10` — `Rate Adjustment Current State`

- **Summary:** Fund and debt rate adjustment UI is implemented with sheet forms, configured currency selectors, calculation/run actions, subscriptions, grouped result tables, and linked transaction display.
- **Affected areas:** `src/modules/adjustments/rate`, `src/modules/adjustments/debt`, `src/modules/settings/hooks/useCurrencyConfigs.tsx`, account currency selectors, and transaction currency form helpers.
- **Contracts changed:** Consumes fund/debt rate adjustment GraphQL contracts, `accountingAdjust*RateChanged` subscriptions, and core `configsByCode(codes)` for currency options.
