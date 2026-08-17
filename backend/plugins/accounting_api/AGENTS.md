# `accounting_api` Plugin Guide

## Identity

- **Plugin:** `accounting`
- **Project:** `accounting_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/accounting_api`
- **Last synchronized:** `2026-08-17`

## Scope

### Owns

- Tenant-scoped accounting APIs for accounts, transactions, journals, reports, permissions, tax rows, inventory accounting, fixed asset accounting, and accounting-owned migrations.
- Fund and debt currency rate adjustment persistence, calculation, validation, transaction execution, and subscriptions.
- Temporary account closing adjustment calculation, tax impact persistence, and transaction execution.

### Does not own

- Core contacts, branches, departments, products, team members, and organization settings; consume them only through public platform contracts.
- Frontend UI state, routes, forms, or presentation.
- Other plugins' data models or implementation details.

## Current Capabilities

- Creates, updates, removes, links, prints, and reports accounting transactions across main, cash, bank, receivable, payable, tax, inventory, fixed asset, and exchange-difference journals.
- Stores related debit/credit account codes without nested subdocument ids, normalizes empty related-account overrides before transaction persistence, and recalculates related codes from all transactions sharing the same `ptrId`.
- Provides account, account category, permission, VAT, CTAX, inventory, fixed asset, and journal report GraphQL contracts.
- Generates journal report transaction/detail filters, Erkhet transaction-kind to erxes journal filters, grouping keys, date buckets, line records, and account/customer/product/fixed-asset/user/content enrichment from shared `ReportBase` definitions whose main entrypoints mirror Erkhet names such as `getFilter`, `getRecords`, `recordListWithValues`, and `getGroupRule`.
- Calculates fund rate adjustments for cash/bank foreign-currency balances by day, validates that daily foreign-currency balances do not go negative, groups final balances by account/branch/department, stores calculated details, and runs linked `exchangeDiff` transactions after calculation.
- Calculates debt rate adjustments for receivable/payable balances by day, validates active accounts on debit-side balances and passive accounts on credit-side balances, groups final balances by account/customer/branch/department, stores calculated details, and runs linked `exchangeDiff` transactions after calculation.
- Calculates temporary account closings from the previous completed/published closing or first temporary-account transaction through the selected date, groups final balances by account/branch/department, validates active accounts on debit balances and passive accounts on credit balances, stores editable row tax percentages, and runs linked closing transactions after calculation.
- Publishes fund and debt adjustment subscription updates after calculation so detail screens can refresh without manual reloads.
- Exposes inventory cost and last completed inventory income price helpers used by accounting transaction forms.
- Accepts token-protected Erkhet transaction migration batches at `/pl:accounting/migration/erkhet/transactions`; raw-save mode preserves source-side accounting calculations after validation and code resolution.

## Architecture

| Area               | Path                                                     | Responsibility                                                                                               |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Runtime            | `src/main.ts`                                            | Starts the accounting API plugin service.                                                                    |
| Apollo integration | `src/apollo`                                             | Registers accounting schema, resolvers, subscriptions, and federation wiring.                                |
| Models             | `src/connectionResolvers.ts`                             | Generates tenant-scoped Mongoose models for accounting-owned collections.                                    |
| Accounting domain  | `src/modules/accounting`                                 | Owns accounting schemas, models, GraphQL resolvers, journal utilities, and routes.                           |
| Journal reports    | `src/modules/accounting/utils/journalReports`            | Builds shared filters, aggregation groups, period splits, and display enrichment for journal reports.        |
| Report bases       | `src/modules/accounting/utils/journalReports/strategies` | Groups Erkhet-style report base definitions by main, fund, debt, inventory, and fixed asset report families. |
| Report details     | `src/modules/accounting/utils/journalReports/details`    | Owns report-specific detail row lookups such as account statement more rows.                                 |
| Rate adjustments   | `src/modules/accounting/utils/adjust*Rates.ts`           | Owns fund/debt daily validation, grouping, calculation, and transaction execution.                           |
| Closing adjustment | `src/modules/accounting/utils/adjustClosings.ts`         | Owns temporary account closing calculation, tax impact calculation, and transaction execution.               |
| Fixed assets       | `src/modules/fixedAssets`                                | Owns fixed asset master data, instances, logs, and adjustment models.                                        |
| Erkhet migration   | `src/modules/accounting/routes/erkhetMigration.ts`       | Validates migration batches, resolves external codes, and imports transactions.                              |

## Contracts

### Provides

- Accounting GraphQL schema and resolvers from `src/modules/accounting/graphql`.
- Fund rate GraphQL contracts: `adjustFundRates`, `adjustFundRateDetail`, `adjustFundRateAdd`, `adjustFundRateChange`, `adjustFundRateCalculate`, `adjustFundRateDoTransaction`, `adjustFundRateRun`, `adjustFundRateRemove`, and `accountingAdjustFundRateChanged(adjustId: String!)`.
- Debt rate GraphQL contracts: `adjustDebtRates`, `adjustDebtRateDetail`, `adjustDebtRatesAdd`, `adjustDebtRatesEdit`, `adjustDebtRateCalculate`, `adjustDebtRateDoTransaction`, `adjustDebtRatesRemove`, and `accountingAdjustDebtRateChanged(adjustId: String!)`.
- Closing adjustment GraphQL contracts: `adjustClosings`, `adjustClosingsCount`, `adjustClosingDetail`, `adjustClosingEntriesCount`, `adjustClosingAdd`, `adjustClosingEdit`, `adjustClosingCalculate`, `adjustClosingDoTransaction`, `adjustClosingRun`, `adjustClosingPublish`, `adjustClosingCancel`, and `adjustClosingRemove`.
- Adjustment detail fields include account/customer/branch/department grouping metadata, `mainBalance`, `currencyBalance`, `diff`, linked transaction ids, and validation state fields `beginDate`, `successDate`, `checkedAt`, `error`, and `warning`.
- GraphQL query `getAccLastIncomePrice(productIds: [String]): JSON`, returning each requested product's last completed inventory income unit price or `0`.
- GraphQL queries `journalReportData` and `journalReportMore`, returning account, trial balance, general-ledger, main-journal, main-journal-summary, fund, debt, inventory-cost, inventory-sale, inventory-sale-cost, inventory-sale-period, inventory-price, inventory-profit, inventory-shipper, inventory-document, inventory-seller-subsystem, and fixed-asset report rows with account permission filters, account/product/fixed-asset/customer/content metadata filters, branch/department child filters, Erkhet-compatible `trKind`/`trKinds`/`getTrKind` filters, detail-level currency/account matching, line-record projection, and group metadata enrichment.
- Transaction model methods such as `createPTransaction`, `updatePTransaction`, `createTransaction`, `updateTransaction`, and removal helpers used by accounting-owned flows.
- HTTP route `/pl:accounting/migration/erkhet/transactions`.

### Consumes

- Core branch, department, customer, company, product, and organization data through `sendTRPCMessage`, GraphQL, HTTP, or shared platform contracts.
- Shared backend utilities, cursor pagination helpers, pubsub, and service startup APIs from `erxes-api-shared`.

## Data and State

- All Mongoose models are generated per request `subdomain`; never bypass tenant-scoped `models`.
- Fund adjustments persist in `adjust_fund_rates`; details are grouped by account/branch/department.
- Debt adjustments persist in `adjust_debt_rates`; details are grouped by account/customer/branch/department.
- Closing adjustments persist in `adjust_closings`; details are grouped by branch/department and contain temporary account balance rows with editable tax percentages.
- Rate adjustment calculation stores `status: "process"`, validation period metadata, grouped details, and warning/error state.
- Rate adjustment transaction execution creates linked `exchangeDiff` parent/child transactions, stores transaction ids on the adjustment/details, and marks status `complete`.
- Closing calculation stores `status: "process"`, `beginDate`, `successDate`, `checkedAt`, grouped details, `error`, and `warning`; transaction execution creates linked `main` journal parent/child transactions and marks status `complete`.
- Accounting transaction documents store journal, side, date, status, details, branch/department/customer context, parent transaction linkage, and plugin-specific `extraData`.
- Journal reports do not persist state; they aggregate tenant-scoped transaction documents and enrich rows from accounting accounts, fixed assets, and core branch, department, customer, product, user, and synced-content public contracts.
- Fixed asset instance, fixed asset adjustment, inventory remainder, reserve remainder, tax, and accounting setting collections remain owned by this plugin.

## Local Invariants

- Every resolver that reads or mutates accounting data must use tenant-scoped `models` and enforce the relevant permission before data access.
- Fund/debt rate adjustments are calculated first and executed second; execution must fail when calculated details are missing.
- Closing adjustments are calculated first and executed second; tax percentages must be saved on detail entries before transaction execution when users edit them.
- Rate adjustment edits and removals must remove linked generated transactions and reset calculated state.
- Fund rate adjustment is organization-level; branch/department grouping belongs to details and generated transactions, not the root adjustment.
- Debt rate adjustment filters customer type only when a concrete customer id is selected; selecting only customer type must not exclude other customers.
- Exchange-difference transactions must be generated only through accounting journal handlers and must keep parent/detail transaction linkage.
- Erkhet migration raw-save mode must validate and resolve external source codes but must not recalculate source-side accounting results.
- Inventory price lookup must use completed business-active inventory income transactions and default missing product prices to `0`.
- Journal report filters that target transaction details must be applied after `$unwind` so unrelated detail rows from the same transaction are not included in report sums.
- Erkhet inventory and fixed-asset location filters map to erxes branch/department filters; report matching must accept either transaction root branch/department or detail-level branch/department while keeping selected dimensions combined with AND semantics.
- Erkhet transaction kind filters are adapter inputs only; report aggregation must translate them to current erxes transaction `journal` values instead of adding a separate persisted transaction-kind field.

## Validation

- `pnpm nx build accounting_api`
- `pnpm nx test accounting_api`
- `node_modules/.bin/tsc -p backend/plugins/accounting_api/tsconfig.build.json --noEmit`
- Smoke scenario: calculate a fund and debt rate adjustment, verify validation fields/details are stored, then run transactions and confirm linked `exchangeDiff` transactions are created.
- Smoke scenario: calculate a closing adjustment, edit a detail entry tax percent, run transactions, and verify `taxImpactValue`, grouped details, and linked transaction ids are stored.
- Smoke scenario: send a dry-run Erkhet batch with `rawSave: true` and verify code resolution plus per-batch success/error rows.
- Smoke scenario: run `journalReportData` for account statement, trial balance, general ledger, main journal, main journal summary, fund, debt, inventory cost, inventory sale, inventory sale-cost, inventory sale-period, inventory price, inventory profit, inventory shipper, inventory document, inventory seller subsystem, and fixed asset reports with account/category/currency, Erkhet `trKind`, customer/product/fixed-asset/user/content grouping, and branch/department grouping filters, then verify grouped totals and `journalReportMore` detail rows match the selected account details.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-17` — `Related Account Storage Shape`

- **Summary:** Related account storage no longer creates nested `_id` values, transaction updates clear omitted custom overrides, and pointer status refreshes trim or unset empty custom related-account overrides while recalculating default debit and credit codes.
- **Affected areas:** `src/modules/accounting/db/definitions/transaction.ts`, `src/modules/accounting/db/models/Transactions.ts`, `src/modules/accounting/db/models/utils.ts`.
- **Contracts changed:** None.

### `2026-08-16` — `Related Account Override Normalization`

- **Summary:** Transaction create/update paths now discard empty related-account override payloads before persistence, and pointer status refreshes recalculate related accounts from every transaction sharing the same `ptrId`.
- **Affected areas:** `src/modules/accounting/@types/transaction.ts`, `src/modules/accounting/db/models/Transactions.ts`, `src/modules/accounting/db/models/utils.ts`.
- **Contracts changed:** None.

### `2026-08-14` — `Erkhet Report Naming`

- **Summary:** Journal report internals now use Erkhet-aligned names such as `ReportBase`, `getFilter`, `getRecords`, `recordListWithValues`, and `getGroupRule`.
- **Affected areas:** `src/modules/accounting/utils/journalReports`.
- **Contracts changed:** None.

### `2026-08-14` — `Journal Report Balance Boundaries`

- **Summary:** Journal report aggregation now matches Erkhet date splitting with opening rows before the begin date and between rows from the begin date, preserves explicit journal filters by intersecting strategy filters, and groups branch/department from detail-level values before falling back to transaction root values.
- **Affected areas:** `src/modules/accounting/utils/journalReports`.
- **Contracts changed:** None.

### `2026-08-14` — `Journal Report Strategy Structure`

- **Summary:** Journal report strategy definitions were split into main, fund, debt, inventory, and fixed-asset modules with generic record handling and separate detail-row handlers.
- **Affected areas:** `src/modules/accounting/utils/journalReports`.
- **Contracts changed:** None.

### `2026-08-14` — `Erkhet Journal Report Coverage`

- **Summary:** Journal report aggregation now supports main journal, fund, debt, fixed asset, inventory sale/cost/price/profit/shipper/document, and inventory seller subsystem report families through shared strategy definitions and erxes-native filter mapping.
- **Affected areas:** `src/modules/accounting/utils/journalReports`, `src/modules/accounting/graphql`.
- **Contracts changed:** None beyond the existing journal report query contract.

### `2026-08-13` — `Journal Report Builder`

- **Summary:** Journal report aggregation now uses shared strategy definitions, Erkhet-compatible transaction-kind filters, grouping keys, detail-level matching, and enrichment for account statement, trial balance, and inventory cost reports.
- **Affected areas:** `src/modules/accounting/utils/journalReports`.
- **Contracts changed:** `journalReportData` and `journalReportMore` accept optional `trKind`, `trKinds`, and `getTrKind` filter arguments.

### `2026-08-11` — `Temporary Account Closing`

- **Summary:** Temporary account closing adjustments now calculate grouped balances, preserve editable tax percentages, validate final balance sides, and run linked closing transactions after calculation.
- **Affected areas:** `src/modules/accounting/db/definitions/adjustClosingEntry.ts`, `src/modules/accounting/db/models/AdjustClosing.ts`, `src/modules/accounting/graphql`, `src/modules/accounting/utils/adjustClosings.ts`, `src/apollo`.
- **Contracts changed:** Adds `adjustClosingCalculate`, `adjustClosingDoTransaction`, `adjustClosingPublish`, `adjustClosingCancel`, validation fields, grouped details, tax impact value, and transaction id fields.

### `2026-08-10` — `Rate Adjustment Current State`

- **Summary:** Fund and debt rate adjustments are implemented with daily validation, grouped calculation details, separate transaction execution, subscriptions, and permission-protected resolvers.
- **Affected areas:** `src/modules/accounting/db/definitions/adjust*Rate.ts`, `src/modules/accounting/db/models/Adjust*Rate.ts`, `src/modules/accounting/graphql`, `src/modules/accounting/utils/adjust*Rates.ts`, `src/apollo`.
- **Contracts changed:** Provides fund/debt rate adjustment GraphQL queries, mutations, subscriptions, validation fields, grouped detail fields, and linked transaction ids.
