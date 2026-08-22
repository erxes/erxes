# `accounting_api` Plugin Guide

## Identity

- **Plugin:** `accounting`
- **Project:** `accounting_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/accounting_api`
- **Last synchronized:** `2026-08-21`

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
- Fixed asset income follow-info inputs can store per-instance residual value and opening accumulated depreciation, and opening depreciation values seed a transaction-linked published fixed asset adjustment for later depreciation calculations.
- Fixed asset adjustment depreciation calculates straight-line, sum-of-years-digits, double-declining-balance, and declining-balance methods by day; manual depreciation is reserved for a separate entered-detail flow.
- Stores related debit/credit account codes without nested subdocument ids, normalizes empty related-account overrides before transaction persistence, and recalculates related codes from all transactions sharing the same `ptrId`.
- Provides account, account category, permission, VAT, CTAX, inventory, fixed asset, and journal report GraphQL contracts.
- Generates journal report transaction/detail filters, Erkhet transaction-kind to erxes journal filters, grouping keys, date buckets, line records, and account/customer/product/fixed-asset/user/content enrichment from shared `ReportBase` definitions whose main entrypoints mirror Erkhet names such as `getFilter`, `getRecords`, `recordListWithValues`, and `getGroupRule`.
- Calculates fund rate adjustments for cash/bank foreign-currency balances by day, validates that daily foreign-currency balances do not go negative, groups final balances by account/branch/department, stores calculated details, and runs linked `exchangeDiff` transactions after calculation.
- Calculates debt rate adjustments for receivable/payable balances by day, validates active accounts on debit-side balances and passive accounts on credit-side balances, groups final balances by account/customer/branch/department, stores calculated details, and runs linked `exchangeDiff` transactions after calculation.
- Calculates temporary account closings from the previous completed/published closing or first temporary-account transaction through the selected date, groups final balances by account/branch/department, validates active accounts on debit balances and passive accounts on credit balances, stores editable row tax percentages, and runs linked closing transactions after calculation.
- Publishes fund and debt adjustment subscription updates after calculation so detail screens can refresh without manual reloads.
- Exposes inventory cost and last completed inventory income price helpers used by accounting transaction forms.
- Recalculates inventory adjustment outgoing costs and keeps related main, receivable, and payable debit journal amounts aligned while preserving explicit cash/bank debit amounts.
- Accepts migration-only Erkhet reference batches at `/pl:accounting/migration/erkhet/references`; the route upserts core product categories/products and accounting fixed asset categories/master records by source code before transactions are imported.
- Accepts migration-only Erkhet transaction batches at `/pl:accounting/migration/erkhet/transactions`; the route resolves source codes, syncs missing contacts, resolves fixed asset income instance payloads, rejects missing product/fixed-asset references, and delegates persistence to `createPTransaction` or `updatePTransaction`.

## Architecture

| Area               | Path                                                        | Responsibility                                                                                               |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Runtime            | `src/main.ts`                                               | Starts the accounting API plugin service.                                                                    |
| Apollo integration | `src/apollo`                                                | Registers accounting schema, resolvers, subscriptions, and federation wiring.                                |
| Models             | `src/connectionResolvers.ts`                                | Generates tenant-scoped Mongoose models for accounting-owned collections.                                    |
| Accounting domain  | `src/modules/accounting`                                    | Owns accounting schemas, models, GraphQL resolvers, journal utilities, and routes.                           |
| Journal reports    | `src/modules/accounting/utils/journalReports`               | Builds shared filters, aggregation groups, period splits, and display enrichment for journal reports.        |
| Report bases       | `src/modules/accounting/utils/journalReports/strategies`    | Groups Erkhet-style report base definitions by main, fund, debt, inventory, and fixed asset report families. |
| Report details     | `src/modules/accounting/utils/journalReports/details`       | Owns report-specific detail row lookups such as account statement more rows.                                 |
| Rate adjustments   | `src/modules/accounting/utils/adjust*Rates.ts`              | Owns fund/debt daily validation, grouping, calculation, and transaction execution.                           |
| Closing adjustment | `src/modules/accounting/utils/adjustClosings.ts`            | Owns temporary account closing calculation, tax impact calculation, and transaction execution.               |
| Fixed assets       | `src/modules/fixedAssets`                                   | Owns fixed asset master data, instances, logs, and adjustment models.                                        |
| Erkhet migration   | `src/modules/accounting/routes/erkhetReferenceMigration.ts` | Upserts required product and fixed-asset reference data from Erkhet codes before transaction import.         |
| Erkhet migration   | `src/modules/accounting/routes/erkhetMigration.ts`          | Validates migration batches, resolves external codes, and imports transactions.                              |

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
- HTTP route `/pl:accounting/migration/erkhet/references`.
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
- Fixed asset income transactions may create system opening fixed asset adjustments with `_id` shaped as `fxa-opening:<transactionId>`; those adjustments are maintained only from the acquisition transaction's instance inputs.
- Fixed asset income transaction `followInfos.fxaIncomeInstances` owns per-instance residual and opening depreciation inputs; instance documents store residual value for depreciation calculation but do not store opening accumulated depreciation.

## Local Invariants

- Every resolver that reads or mutates accounting data must use tenant-scoped `models` and enforce the relevant permission before data access.
- Fund/debt rate adjustments are calculated first and executed second; execution must fail when calculated details are missing.
- Closing adjustments are calculated first and executed second; tax percentages must be saved on detail entries before transaction execution when users edit them.
- Rate adjustment edits and removals must remove linked generated transactions and reset calculated state.
- Fund rate adjustment is organization-level; branch/department grouping belongs to details and generated transactions, not the root adjustment.
- Debt rate adjustment filters customer type only when a concrete customer id is selected; selecting only customer type must not exclude other customers.
- Exchange-difference transactions must be generated only through accounting journal handlers and must keep parent/detail transaction linkage.
- Erkhet migration imports must validate and resolve external source codes before delegating to transaction create/update methods, using source `sync_type/sync_id` as normalized `contentType/contentId` when present (`sale` maps to `sales:deal`; other sync types map to `erkhet:<sync_type>`) and falling back to `contentType: "erkhet:ptr"` plus the external pointer id for idempotent retries.
- Erkhet reference migration is the only product and fixed-asset master-data bootstrap path; transaction migration must not create products or fixed asset master records and must strip obsolete detail follow-info keys before persistence.
- Inventory price lookup must use completed business-active inventory income transactions and default missing product prices to `0`.
- Inventory adjustment outgoing-cost fixes may adjust only related debit transactions in `main`, `receivable`, and `payable` journals; cash and bank debit amounts are explicit payment amounts and must not be rewritten by cost recalculation.
- Journal report filters that target transaction details must be applied after `$unwind` so unrelated detail rows from the same transaction are not included in report sums.
- Erkhet inventory and fixed-asset location filters map to erxes branch/department filters; report matching must accept either transaction root branch/department or detail-level branch/department while keeping selected dimensions combined with AND semantics.
- Erkhet transaction kind filters are adapter inputs only; report aggregation must translate them to current erxes transaction `journal` values instead of adding a separate persisted transaction-kind field.
- System opening fixed asset adjustments must stay published, dated one day before their acquisition transaction, and regenerated or removed from fixed asset income instance synchronization.
- Automatic fixed asset adjustment calculation supports every fixed asset depreciation method except `manual`; `manual` must fail validation until an entered-depreciation detail flow exists.

## Validation

- `pnpm nx build accounting_api`
- `pnpm nx test accounting_api`
- `node_modules/.bin/tsc -p backend/plugins/accounting_api/tsconfig.build.json --noEmit`
- Smoke scenario: calculate a fund and debt rate adjustment, verify validation fields/details are stored, then run transactions and confirm linked `exchangeDiff` transactions are created.
- Smoke scenario: calculate a closing adjustment, edit a detail entry tax percent, run transactions, and verify `taxImpactValue`, grouped details, and linked transaction ids are stored.
- Smoke scenario: send a dry-run Erkhet references batch and verify product category/product plus fixed asset category/master rows report create/update actions without missing parent/category code errors.
- Smoke scenario: send a dry-run Erkhet batch and verify code resolution, contact match/create planning, idempotent create/update selection, and per-batch success/error rows.
- Smoke scenario: run `journalReportData` for account statement, trial balance, general ledger, main journal, main journal summary, fund, debt, inventory cost, inventory sale, inventory sale-cost, inventory sale-period, inventory price, inventory profit, inventory shipper, inventory document, inventory seller subsystem, and fixed asset reports with account/category/currency, Erkhet `trKind`, customer/product/fixed-asset/user/content grouping, and branch/department grouping filters, then verify grouped totals and `journalReportMore` detail rows match the selected account details.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-21` — `Inventory Related Debit Cost Sync`

- **Summary:** Inventory out adjustment recalculation now updates related main, receivable, or payable debit transaction amounts to preserve pointer balance while leaving cash/bank debit amounts unchanged.
- **Affected areas:** `src/modules/accounting/utils/inventories.ts`, `src/modules/accounting/db/models/Transactions.ts`, `src/modules/accounting/utils/__tests__/inventories.test.ts`.
- **Contracts changed:** None.

### `2026-08-21` — `Fixed Asset Depreciation Methods`

- **Summary:** Fixed asset adjustment calculation now supports straight-line, sum-of-years-digits, double-declining-balance, and declining-balance depreciation methods by day while keeping manual method validation explicit.
- **Affected areas:** `src/modules/accounting/utils/adjustFixedAssets.ts`, `src/modules/accounting/utils/__tests__/fixedAssets.test.ts`.
- **Contracts changed:** None.

### `2026-08-21` — `Fixed Asset Opening Depreciation`

- **Summary:** Fixed asset income synchronization now reads residual value and opening accumulated depreciation from transaction followInfos and seeds transaction-linked opening depreciation adjustment details.
- **Affected areas:** `src/modules/accounting/utils/fxaIncome.ts`, `src/modules/accounting/utils/fixedAssets.ts`, `src/modules/fixedAssets`, `src/modules/accounting/utils/__tests__/fixedAssets.test.ts`.
- **Contracts changed:** Fixed asset income `followInfos.fxaIncomeInstances` accepts optional `salvageValue` and `openingAccumulatedDepreciation`.

### `2026-08-21` — `Erkhet Contract Cleanup`

- **Summary:** Tightened Erkhet migration contracts so product and fixed-asset master data must arrive through the reference route and obsolete detail follow-info keys are stripped before transaction persistence.
- **Affected areas:** `src/modules/accounting/routes/erkhetMigration.ts`, `src/modules/accounting/routes/erkhetReferenceMigration.ts`.
- **Contracts changed:** `/pl:accounting/migration/erkhet/transactions` no longer creates missing products from embedded inventory metadata; `/pl:accounting/migration/erkhet/references` remains the reference bootstrap path.

### `2026-08-21` — `Erkhet Reference Bootstrap`

- **Summary:** Added a migration-only Erkhet reference route that upserts product categories, products, fixed asset categories, and fixed asset master records before transaction import.
- **Affected areas:** `src/routes.ts`, `src/modules/accounting/routes/erkhetReferenceMigration.ts`.
- **Contracts changed:** Adds `/pl:accounting/migration/erkhet/references` accepting coded product and fixed-asset reference payloads with dry-run reporting.

### `2026-08-18` — `Erkhet Migration Wrapper`

- **Summary:** The Erkhet migration route now resolves account, branch, department, product, fixed-asset, and contact codes and delegates source-content-aware idempotent batches to transaction create/update methods.
- **Affected areas:** `src/modules/accounting/routes/erkhetMigration.ts`.
- **Contracts changed:** `/pl:accounting/migration/erkhet/transactions` accepts Erkhet-coded `trDocs` with fixed asset income instance payloads, resolves references, and creates or updates by normalized `sync_type/sync_id` content references when present (`sale` to `sales:deal`, others to `erkhet:<sync_type>`) or `contentType: "erkhet:ptr"` plus external pointer id otherwise.

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
