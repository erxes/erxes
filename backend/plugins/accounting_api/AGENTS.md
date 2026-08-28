# `accounting_api` Plugin Guide

## Identity

- **Plugin:** `accounting`
- **Project:** `accounting_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/accounting_api`
- **Last synchronized:** `2026-08-28`

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
- Fixed asset income transaction details create or update acquisition-backed fixed asset records from detail category, code, name, account, quantity, unit cost, and category depreciation defaults.
- Fixed asset income detail follow-info inputs store residual value and opening accumulated depreciation; opening depreciation values seed a transaction-linked published fixed asset adjustment independent of owner assignment rows.
- Fixed asset owner records in `fxa_owner_records` are optional responsible-user/serial allocation ledger rows for income, disposal, sale, move details, and direct owner-record operations; `action: "received"` increases an owner balance and `action: "handedOver"` decreases it, transaction-level `followInfos.ownerId` is used as a fallback when no explicit owner rows are sent, while financial quantity, cost, branch/department movement, and depreciation remain driven by transaction details.
- Provides `fxaOwnerRecords` and `fxaOwnerRecordsCount`, which list owner records with fixed asset, category-derived filtering, owner, action, status, created-date, and optional `balanceOnly` aggregate rows for selection sheets.
- Fixed asset out, sale, move, and move-in journals derive quantity and branch/department movement from transaction details; internal moves keep the same fixed asset id and use the generated `fxaMoveIn` transaction for the destination branch/department.
- Provides `fixedAssetLocationRemainder`, which returns fixed asset quantity at a branch/department/date location from business-active fixed asset transaction detail movements, excluding the edited transaction when requested.
- Fixed asset adjustment depreciation calculates straight-line, sum-of-years-digits, double-declining-balance, and declining-balance methods by day from transaction detail movements, caches period-end rows in `adjust_fxa_details`, and allocates depreciation by active branch/department quantity while ignoring responsible-user allocation.
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
- Accepts migration-only Erkhet transaction batches at `/pl:accounting/migration/erkhet/transactions`; the route trims and resolves source codes, syncs missing contacts, resolves fixed asset category/acquisition inputs and owner-record payloads, auto-selects active owner records for disposal/sale/move logs when Erkhet omits owner record ids, rejects missing references, and delegates persistence to `createPTransaction` or `updatePTransaction`.

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
| Fixed assets       | `src/modules/fixedAssets`                                   | Owns fixed asset categories, acquisition-backed fixed assets, optional owner-record ledger rows, and adjustment models. |
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
- GraphQL query `fixedAssetLocationRemainder(fixedAssetId, branchId, departmentId, date, excludeTransactionId)`, returning the transaction-history quantity for one fixed asset at one branch/department location.
- GraphQL query `fxaOwnerRecords(searchValue, ids, fixedAssetIds, fixedAssetId, categoryId, action, status, ownerId, balanceOnly, createdFrom, createdTo, transactionId, page, perPage, limit)`, returning owner-record ledger rows or fixed asset/owner balance rows when `balanceOnly` is true.
- GraphQL mutations `fixedAssetOwnerRecordsAdd`, `fixedAssetOwnerRecordsTransfer`, and `fixedAssetOwnerRecordsRemove`, allowing direct responsible-user owner record receive, transfer, cancel, and cleanup operations without creating accounting transactions.
- GraphQL query `fxaOwnerRecordsCount(searchValue, ids, fixedAssetIds, fixedAssetId, categoryId, action, status, ownerId, balanceOnly, createdFrom, createdTo, transactionId)`, returning the matching owner-record or balance-row count.
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
- Fixed asset category, fixed asset, fixed asset owner record, fixed asset adjustment, inventory remainder, reserve remainder, tax, and accounting setting collections remain owned by this plugin.
- Fixed asset income transactions may create system opening fixed asset adjustments with `_id` shaped as `fxa-opening:<transactionId>`; those adjustments are maintained from transaction detail follow-info values.
- Fixed asset income transaction `followInfos.fxaIncomeDetails` owns detail-level residual and opening depreciation inputs; `extraData.fxaOwnerRecords` owns only optional responsible-user/serial allocation rows.
- Fixed asset transaction details store `fixedAssetId` for existing assets and store `fixedAssetCategoryId`, `fixedAssetCode`, and `fixedAssetName` for acquisition input; income synchronization writes the generated fixed asset id back to the detail.
- Fixed asset documents store acquisition identity, account, unit cost, original quantity, current quantity cache, category depreciation defaults, acquisition date, depreciation start date, transaction id, and transaction detail id.
- Fixed asset owner records store optional responsible-user/serial allocation ledger rows with fixed asset, code, sequence, count, action, status, owner, transaction, and transaction-detail linkage; they must not store branch, department, cost, depreciation method, acquisition date, or financial movement source-of-truth fields.
- Erkhet opening fixed asset income transactions create acquisition-backed fixed asset rows from details and may store `extraData.fxaOwnerRecords` only when an opening responsible-user owner allocation exists.

## Local Invariants

- Every resolver that reads or mutates accounting data must use tenant-scoped `models` and enforce the relevant permission before data access.
- Fund/debt rate adjustments are calculated first and executed second; execution must fail when calculated details are missing.
- Closing adjustments are calculated first and executed second; tax percentages must be saved on detail entries before transaction execution when users edit them.
- Rate adjustment edits and removals must remove linked generated transactions and reset calculated state.
- Fund rate adjustment is organization-level; branch/department grouping belongs to details and generated transactions, not the root adjustment.
- Debt rate adjustment filters customer type only when a concrete customer id is selected; selecting only customer type must not exclude other customers.
- Exchange-difference transactions must be generated only through accounting journal handlers and must keep parent/detail transaction linkage.
- Erkhet migration imports must validate and resolve external source codes before delegating to transaction create/update methods, using source `sync_type/sync_id` as normalized `contentType/contentId` when present (`sale` maps to `sales:deal`; other sync types map to `erkhet:<sync_type>`) and falling back to `contentType: "erkhet:ptr"` plus the external pointer id for idempotent retries.
- Erkhet migration source codes must be trimmed before lookup and persistence metadata so leading/trailing whitespace in legacy Erkhet references does not block account, branch, department, product, fixed-asset, customer, or owner-record resolution.
- Erkhet reference migration is the only product and fixed-asset category bootstrap path; transaction migration must not create products or fixed asset categories and must strip obsolete detail follow-info keys before persistence.
- Inventory price lookup must use completed business-active inventory income transactions and default missing product prices to `0`.
- Inventory adjustment outgoing-cost fixes may adjust only related debit transactions in `main`, `receivable`, and `payable` journals; cash and bank debit amounts are explicit payment amounts and must not be rewritten by cost recalculation.
- Journal report filters that target transaction details must be applied after `$unwind` so unrelated detail rows from the same transaction are not included in report sums.
- Erkhet inventory and fixed-asset location filters map to erxes branch/department filters; report matching must accept either transaction root branch/department or detail-level branch/department while keeping selected dimensions combined with AND semantics.
- Erkhet transaction kind filters are adapter inputs only; report aggregation must translate them to current erxes transaction `journal` values instead of adding a separate persisted transaction-kind field.
- System opening fixed asset adjustments must stay published, dated one day before their acquisition transaction, and regenerated or removed from fixed asset income synchronization.
- Fixed asset income explicit owner-record counts must match the parent detail count for that detail when any owner rows are provided; details without owner rows are valid and create no owner record unless transaction-level `followInfos.ownerId` is present.
- Fixed asset disposal, sale, and move owner-record selections are optional, but when provided for a detail their selected counts must equal that detail count; saving removes prior owner-record rows for that transaction and writes fresh `handedOver` rows, while move writes a matching `received` row for the owner so owner balance remains net neutral.
- Fixed asset disposal, sale, and move quantities must come from transaction details; branch and department belong to each detail and mixed locations require multiple details.
- Fixed asset move source details must be paired with generated `fxaMoveIn` destination details so period/location reporting is derived from transaction history, not owner records.
- Fixed asset depreciation must be calculated once per fixed asset acquisition cost base and allocated across branch/department locations by active quantity for each day.
- Fixed asset current quantity cache must be rebuilt from business-active fixed asset income, out, sale, move, and move-in transaction details.
- Fixed asset location remainder must be calculated from business-active fixed asset transaction details and must support excluding the current edited transaction so edit forms do not double-count their own movement.
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

### `2026-08-28` — `Fixed Asset Owner Record Ledger`

- **Summary:** Simplified owner records into `received`/`handedOver` ledger rows keyed by fixed asset and owner, removed owner-record log registration, added balance-only aggregation for selection, direct owner-record mutations, and honored transaction-level owner fallback during journal save.
- **Affected areas:** `src/connectionResolvers.ts`, `src/apollo/schema/schema.ts`, `src/modules/fixedAssets`, `src/modules/accounting/utils/fixedAssets.ts`, `src/modules/accounting/utils/fxaIncome.ts`, `src/modules/accounting/routes/erkhetMigration.ts`.
- **Contracts changed:** `fxaOwnerRecords` and `fxaOwnerRecordsCount` now use `action`, `ownerId`, and `balanceOnly`; adds `fixedAssetOwnerRecordsAdd`, `fixedAssetOwnerRecordsTransfer`, and `fixedAssetOwnerRecordsRemove`; owner records no longer expose branch/department/current-state fields.

### `2026-08-28` — `Fixed Asset Location Remainder Query`

- **Summary:** Added a fixed asset location remainder query that totals transaction detail movements by fixed asset, branch, department, and date for disposal/move/sale form validation.
- **Affected areas:** `src/modules/fixedAssets/graphql/schemas/fixedAsset.ts`, `src/modules/fixedAssets/graphql/resolvers/queries/fixedAssets.ts`.
- **Contracts changed:** Adds `fixedAssetLocationRemainder(fixedAssetId: String!, branchId: String, departmentId: String, date: Date, excludeTransactionId: String): FixedAssetLocationRemainder`.

### `2026-08-28` — `Fixed Asset Owner Record Query`

- **Summary:** Renamed the owner allocation collection/model to fixed asset owner records and added paged owner-record list plus count filters for fixed asset, category, owner, action, status, and created date.
- **Affected areas:** `src/connectionResolvers.ts`, `src/modules/fixedAssets/@types/fxaOwnerRecord.ts`, `src/modules/fixedAssets/db/definitions/fxaOwnerRecord.ts`, `src/modules/fixedAssets/db/models/FxaOwnerRecords.ts`, `src/modules/fixedAssets/graphql/schemas/fxaOwnerRecord.ts`, `src/modules/fixedAssets/graphql/resolvers/queries/fixedAssets.ts`.
- **Contracts changed:** Adds `fxaOwnerRecords(searchValue, fixedAssetId, categoryId, action, ownerId, status, createdFrom, createdTo, transactionId, page, perPage, limit): [FxaOwnerRecord]` and `fxaOwnerRecordsCount(...): Int`; stores owner records in `fxa_owner_records`.

### `2026-08-28` — `Erkhet Fixed Asset Owner Records`

- **Summary:** Erkhet transaction migration now resolves fixed asset income category/acquisition fields and owner-record payloads, including active owner-record source selection for disposal, sale, and move logs.
- **Affected areas:** `src/modules/accounting/routes/erkhetMigration.ts`.
- **Contracts changed:** `/pl:accounting/migration/erkhet/transactions` accepts `fixedAssetCategoryId`, `fixedAssetCode`, `fixedAssetName`, and owner-record `extraData.fxaOwnerRecords` rows with `responsibleUserId` or `sourceResponsibleUserId` refs.

### `2026-08-28` — `Fixed Asset Owner Record Disposal Logs`

- **Summary:** Fixed asset out, sale, and move transactions can persist count-matched owner-record selections as `handedOver` ledger rows while keeping financial movement on transaction details.
- **Affected areas:** `src/modules/accounting/utils/fixedAssets.ts`, `src/modules/accounting/utils/fxaOut.ts`, `src/modules/accounting/utils/fxaMove.ts`.
- **Contracts changed:** Transaction `extraData.fxaOwnerRecords` entries may include `fxaOwnerRecordId` for disposal/sale/move owner-record selection.

### `2026-08-28` — `Fixed Asset Detail Movement Refactor`

- **Summary:** Fixed asset accounting now treats income details as acquisition cost bases, keeps owner records optional, and calculates adjustment depreciation from transaction detail movements by branch and department.
- **Affected areas:** `src/modules/accounting/utils/fxaIncome.ts`, `src/modules/accounting/utils/fxaOut.ts`, `src/modules/accounting/utils/fxaMove.ts`, `src/modules/accounting/utils/adjustFixedAssets.ts`, `src/modules/accounting/utils/fixedAssets.ts`, `src/modules/fixedAssets`.
- **Contracts changed:** Transaction details include `fixedAssetCategoryId`, `fixedAssetCode`, and `fixedAssetName`; `fxa_owner_records` no longer carries financial cost/depreciation fields and is owner-allocation metadata only.

### `2026-08-25` — `Erkhet Source Code Trim`

- **Summary:** Erkhet transaction migration now trims incoming source codes before reference lookup and follow-info metadata persistence.
- **Affected areas:** `src/modules/accounting/routes/erkhetMigration.ts`.
- **Contracts changed:** `/pl:accounting/migration/erkhet/transactions` tolerates leading or trailing whitespace in coded Erkhet references.
