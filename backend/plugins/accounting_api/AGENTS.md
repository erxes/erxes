# `accounting_api` Plugin Guide

## Identity

- **Plugin:** `accounting`
- **Project:** `accounting_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/accounting_api`
- **Last synchronized:** `2026-09-19`

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
- Permission metadata exposes VAT and CTAX row access through one `taxRow` module, exposes inventory/fixed-asset/fund-rate/debt-rate/closing adjustments as separate modules, and gates transaction reads/mutations by source journal while allowing generated follow journals, including `exchangeDiff`, through the source journal's permission.
- Permission metadata exposes safe remainder read, manage, remove, and system-count visibility actions; users without count visibility see safe remainder item system counts as zero and cannot apply difference filters.
- Fixed asset income transaction details create or update acquisition-backed fixed asset records from detail category, code, name, account, quantity, unit cost, and category depreciation defaults; multiple income details with the same acquisition code reuse one fixed asset and store acquisition quantity/cost from the supplied migration totals.
- Fixed asset categories store default annual depreciation percentages; fixed asset income copies the category's annual rate onto the generated fixed asset, and straight-line depreciation turns the annual percentage into monthly depreciation prorated by each month's day count.
- Fixed asset income detail follow-info inputs store residual value and `preDeprecation`; migration detail-level `preDeprecation` is mirrored into income follow info, seeds a transaction-linked published fixed asset adjustment and a `fxaDepIn` credit follow transaction, and reduces the paired opening balance `main` transaction to net book value independent of owner assignment rows.
- Fixed asset owner records in `fxa_owner_records` are optional responsible-user/serial allocation ledger rows for income, disposal, sale, move details, and direct owner-record operations; `action: "received"` increases an owner balance and `action: "handedOver"` decreases it, transaction-level `followInfos.ownerId` is used as a fallback when no explicit owner rows are sent, while financial quantity, cost, branch/department movement, and depreciation remain driven by transaction details.
- Erkhet fixed asset disposal and movement migration skips an optional owner-allocation row when its responsible user or matching received-owner balance is unavailable; the financial fixed asset transaction continues independently.
- Provides `fxaOwnerRecords` and `fxaOwnerRecordsCount`, which list owner records with fixed asset, category-derived filtering, owner, action, status, created-date, and optional `balanceOnly` aggregate rows for selection sheets.
- Fixed asset out, sale, move, and move-in journals derive quantity and branch/department movement from transaction details; internal moves keep the same fixed asset id, use the generated `fxaMoveIn` transaction for the destination branch and/or department, and generate accumulated-depreciation transfer follows as `fxaDepOut`/`fxaDepIn` when the move has prior depreciation.
- Provides `fixedAssetLocationRemainder`, which returns fixed asset quantity at a branch/department/date location from business-active fixed asset transaction detail movements, excluding the edited transaction's entire parent workflow when requested.
- Provides `fixedAssetLocationRemainders`, which lists positive fixed asset quantities grouped by fixed asset, branch, and department with fixed asset, category, location, date, and search filters using the same transaction movement aggregation helper as `fixedAssetLocationRemainder`.
- Fixed asset adjustment depreciation calculates straight-line, sum-of-years-digits, double-declining-balance, and declining-balance methods by day from transaction detail movements, caches period-end rows in `adjust_fxa_details`, allocates depreciation by active branch/department quantity while ignoring responsible-user allocation, and creates accounting transactions under the `fxaDep` journal.
- Stores related debit/credit account codes without nested subdocument ids, normalizes empty related-account overrides before transaction persistence, and recalculates related codes from all transactions sharing the same `ptrId`.
- Provides account, account category, permission, tax row, inventory, fixed asset, and journal report GraphQL contracts.
- Provides safe remainder GraphQL list, detail, item list/count, create, edit, remove, recalculate, submit, cancel, transaction-run, transaction-undo, item edit, item bulk edit, and item remove contracts guarded by safe remainder permissions.
- Generates journal report transaction/detail filters, Erkhet transaction-kind to erxes journal filters, grouping keys, date buckets, line records, shared drill-down rows for report bases marked `supportsMore`, and account/customer/product/fixed-asset/user/content enrichment from shared `ReportBase` definitions whose main entrypoints mirror Erkhet names such as `getFilter`, `getRecords`, `recordListWithValues`, and `getGroupRule`; filters support customer/company tags, product category/code/name, fixed-asset category/code/name, and created/modified/assigned users, account enrichment includes currency metadata, and product metadata enrichment is fetched from core in batches of at most 1000 ids.
- Calculates fund rate adjustments for cash/bank foreign-currency balances by day, validates that daily foreign-currency balances do not go negative, groups final balances by account/branch/department, stores calculated details, and runs linked `exchangeDiff` transactions after calculation.
- Calculates debt rate adjustments for receivable/payable balances by day, validates active accounts on debit-side balances and passive accounts on credit-side balances, groups final balances by account/customer/branch/department, stores calculated details, and runs linked `exchangeDiff` transactions after calculation.
- Calculates temporary account closings from the previous completed/published closing or first temporary-account transaction through the selected date, groups final balances by account/branch/department, validates active accounts on debit balances and passive accounts on credit balances, stores editable row tax percentages, and runs linked closing transactions after calculation.
- Publishes fund and debt adjustment subscription updates after calculation so detail screens can refresh without manual reloads.
- Currency transactions compare custom rates with the active exchange rate, create exchange-difference follow transactions only when rates differ, and fail clearly when the active rate is missing.
- Exposes inventory cost and last completed inventory income price helpers used by accounting transaction forms.
- Inventory income transaction details persist total line weight so additional expenses can be allocated by amount, count, or weight.
- Recalculates inventory adjustment outgoing costs by product, account, and effective branch/department location using detail-level branch/department before falling back to transaction root location, caches daily cost state, and keeps related main, receivable, and payable debit journal amounts aligned while preserving explicit cash/bank debit amounts.
- Accepts migration-only Erkhet reference batches at `/pl:accounting/migration/erkhet/references`; the route upserts core product categories/products, creates missing active worker users by unique email, skips existing user emails, upserts Mongolian exchange rates by date/currency and fails if create does not return a saved id, and upserts accounting fixed asset categories by source code before transactions are imported, while actual fixed asset rows are generated from `fxaIncome` transaction details.
- Accepts migration-only Erkhet transaction batches at `/pl:accounting/migration/erkhet/transactions`; the route trims and resolves source codes, syncs missing contacts, resolves inventory sale, movement, currency-difference, and fixed-asset follow-account/location codes by journal, resolves fixed asset category/acquisition inputs and owner-record payloads, skips only owner-record allocation rows whose responsible user was not synced, nets fixed-asset opening balance `main` rows by accumulated depreciation, resolves owner movements by fixed asset plus owner balance when Erkhet omits explicit owner rows, rejects missing non-owner references, and delegates the supplied transaction documents to `createPTransaction` or `updatePTransaction`.
- Erkhet fixed asset move migration may send `followInfos.fxaDisposalSummaries` with detail-level accumulated depreciation amounts; fixed asset move follow creation uses those summaries before falling back to adjustment-cache depreciation.

## Architecture

| Area               | Path                                                        | Responsibility                                                                                                          |
| ------------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Runtime            | `src/main.ts`                                               | Starts the accounting API plugin service.                                                                               |
| Apollo integration | `src/apollo`                                                | Registers accounting schema, resolvers, subscriptions, and federation wiring.                                           |
| Models             | `src/connectionResolvers.ts`                                | Generates tenant-scoped Mongoose models for accounting-owned collections.                                               |
| Accounting domain  | `src/modules/accounting`                                    | Owns accounting schemas, models, GraphQL resolvers, journal utilities, and routes.                                      |
| Journal reports    | `src/modules/accounting/utils/journalReports`               | Builds shared filters, aggregation groups, period splits, and display enrichment for journal reports.                   |
| Report bases       | `src/modules/accounting/utils/journalReports/strategies`    | Groups Erkhet-style report base definitions by main, fund, debt, inventory, and fixed asset report families.            |
| Report details     | `src/modules/accounting/utils/journalReports/details`       | Owns report-specific detail row lookups such as account statement more rows.                                            |
| Rate adjustments   | `src/modules/accounting/utils/adjust*Rates.ts`              | Owns fund/debt daily validation, grouping, calculation, and transaction execution.                                      |
| Closing adjustment | `src/modules/accounting/utils/adjustClosings.ts`            | Owns temporary account closing calculation, tax impact calculation, and transaction execution.                          |
| Fixed assets       | `src/modules/fixedAssets`                                   | Owns fixed asset categories, acquisition-backed fixed assets, optional owner-record ledger rows, and adjustment models. |
| Erkhet migration   | `src/modules/accounting/routes/erkhetReferenceMigration.ts` | Upserts required product references and fixed asset category references from Erkhet codes before transaction import.    |
| Erkhet migration   | `src/modules/accounting/routes/erkhetMigration.ts`          | Validates migration batches, resolves external codes, and imports transactions.                                         |

## Contracts

### Provides

- Accounting GraphQL schema and resolvers from `src/modules/accounting/graphql`.
- Fund rate GraphQL contracts: `adjustFundRates`, `adjustFundRateDetail`, `adjustFundRateAdd`, `adjustFundRateChange`, `adjustFundRateCalculate`, `adjustFundRateDoTransaction`, `adjustFundRateRun`, `adjustFundRateRemove`, and `accountingAdjustFundRateChanged(adjustId: String!)`.
- Debt rate GraphQL contracts: `adjustDebtRates`, `adjustDebtRateDetail`, `adjustDebtRatesAdd`, `adjustDebtRatesEdit`, `adjustDebtRateCalculate`, `adjustDebtRateDoTransaction`, `adjustDebtRatesRemove`, and `accountingAdjustDebtRateChanged(adjustId: String!)`.
- Closing adjustment GraphQL contracts: `adjustClosings`, `adjustClosingsCount`, `adjustClosingDetail`, `adjustClosingEntriesCount`, `adjustClosingAdd`, `adjustClosingEdit`, `adjustClosingCalculate`, `adjustClosingDoTransaction`, `adjustClosingRun`, `adjustClosingPublish`, `adjustClosingCancel`, and `adjustClosingRemove`.
- Adjustment detail fields include account/customer/branch/department grouping metadata, `mainBalance`, `currencyBalance`, `diff`, linked transaction ids, and validation state fields `beginDate`, `successDate`, `checkedAt`, `error`, and `warning`.
- GraphQL query `getAccLastIncomePrice(productIds: [String]): JSON`, returning each requested product's last completed inventory income unit price or `0`.
- GraphQL query `fixedAssetLocationRemainder(fixedAssetId, branchId, departmentId, date, excludeTransactionId)`, returning the transaction-history quantity for one fixed asset at one branch/department location.
- GraphQL query `fixedAssetLocationRemainders(searchValue, fixedAssetId, categoryId, branchId, departmentId, date, limit)`, returning positive fixed asset quantities grouped by fixed asset, branch, and department.
- Permission actions `readSafeRemainders`, `manageSafeRemainders`, `removeSafeRemainders`, and `viewSafeRemainderItemCounts` under the `safeRemainder` module.
- Fixed asset category GraphQL contracts expose `defaultAnnualDepreciationRate` and `defaultTaxAnnualDepreciationRate`; fixed asset contracts expose `annualDepreciationRate` and `taxAnnualDepreciationRate`. Useful-life years are derived UI/helper values only and are not persisted by the accounting API.
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
- Inventory transaction details may store an editable `weight` total used as the allocation basis for inventory income expenses.
- Accounting transaction indexes focus on journal, detail account, date-range, and cursor sort paths for transaction lists; journal reports prefilter indexed detail fields before unwind and keep exact detail matching after unwind.
- Journal reports do not persist state; they aggregate tenant-scoped transaction documents and enrich rows from accounting accounts, fixed assets, and core branch, department, customer, product, user, and synced-content public contracts.
- Fixed asset category, fixed asset, fixed asset owner record, fixed asset adjustment, inventory remainder, reserve remainder, tax, and accounting setting collections remain owned by this plugin.
- Fixed asset income transactions may create system opening fixed asset adjustments with `_id` shaped as `fxa-opening:<transactionId>` and paired `fxaDepIn` credit transactions; both are maintained from transaction detail follow-info values.
- Fixed asset income transaction `followInfos.fxaIncomeDetails` owns detail-level residual value and `preDeprecation` inputs; `extraData.fxaOwnerRecords` owns only optional responsible-user/serial allocation rows.
- Fixed asset transaction details store `fixedAssetId` for existing assets and store `fixedAssetCategoryId`, `fixedAssetCode`, and `fixedAssetName` for acquisition input; income synchronization writes the generated fixed asset id back to the detail.
- Fixed asset documents store acquisition identity, account, unit cost, original quantity, current quantity cache, category depreciation defaults, acquisition date, depreciation start date, transaction id, and transaction detail id.
- Fixed asset owner records store optional responsible-user/serial allocation ledger rows with fixed asset, code, sequence, count, action, status, owner, transaction, and transaction-detail linkage; they must not store branch, department, cost, depreciation method, acquisition date, or financial movement source-of-truth fields.
- Fixed asset owner records generated from transactions must assign a per-fixed-asset fallback sequence when the source row omits one so legacy databases with a unique `fixedAssetId + sequence` index do not reject multiple unsequenced owner rows.
- Erkhet opening fixed asset income transactions create acquisition-backed fixed asset rows from details and may store `extraData.fxaOwnerRecords` only when an opening responsible-user owner allocation exists.

## Local Invariants

- Every resolver that reads or mutates accounting data must use tenant-scoped `models` and enforce the relevant permission before data access.
- Transaction list/count/detail queries must intersect requested journals with the user's permitted source journals, including generated follow journals only through their source journal permission; `exchangeDiff` must not have standalone transaction permissions.
- Transaction detail and content-linked queries must load the whole parent/ptr work transaction when at least one transaction in that group is readable; rows without account-level read access are returned through the hidden transaction shape.
- Transaction create/update/remove mutations must check the source transaction journals in the submitted or persisted parent transaction before writing or deleting; generated follow journals must not get standalone permissions.
- Fund/debt rate adjustments are calculated first and executed second; execution must fail when calculated details are missing.
- Closing adjustments are calculated first and executed second; tax percentages must be saved on detail entries before transaction execution when users edit them.
- Rate adjustment edits and removals must remove linked generated transactions and reset calculated state.
- Fund rate adjustment is organization-level; branch/department grouping belongs to details and generated transactions, not the root adjustment.
- Debt rate adjustment filters customer type only when a concrete customer id is selected; selecting only customer type must not exclude other customers.
- Exchange-difference transactions must be generated only through accounting journal handlers and must keep parent/detail transaction linkage.
- Erkhet migration imports must validate and resolve external source codes before delegating to transaction create/update methods, using source `sync_type/sync_id` as normalized `contentType/contentId` when present (`sale` maps to `sales:deal`; other sync types map to `erkhet:<sync_type>`) and falling back to `contentType: "erkhet:ptr"` plus the external pointer id for idempotent retries.
- Erkhet migration source codes must be trimmed before lookup and persistence metadata so leading/trailing whitespace in legacy Erkhet references does not block account, branch, department, product, fixed-asset, customer, or owner-record resolution.
- Erkhet fixed asset migration owner-record rows are optional responsible-user allocation data; if the referenced user was intentionally not synced, skip that owner-record row while preserving the financial transaction and fixed asset income/out/sale/move processing.
- Missing source owner balance must not reject an Erkhet `fxaOut`, `fxaSale`, or `fxaMove` batch; omit only the unresolved owner-record row.
- Erkhet product reference and transaction lookup codes must remove all whitespace characters because legacy inventory codes may contain leading spaces, embedded tabs, or newlines that are not part of the business code.
- Erkhet inventory sale and sale-return migration must resolve `followInfos.saleOutAccountId` and `followInfos.saleCostAccountId` from account codes before invoking inventory journal handlers.
- Erkhet inventory movement migration must resolve `followInfos.moveInAccountId`, `followInfos.moveInBranchId`, and optional `followInfos.moveInDepartmentId` from source codes before invoking inventory move handlers.
- Erkhet currency transaction migration must resolve detail-level `followInfos.currencyDiffAccountId` from an account code before invoking currency adjustment handlers.
- Currency transaction handlers must fail with an explicit missing-rate error instead of calculating NaN; required rates are bootstrapped through reference migration before transaction import.
- Erkhet reference migration is the only product, worker-user, exchange-rate, and fixed-asset category bootstrap path; transaction migration must not create products, users, exchange rates, or fixed asset categories and must strip obsolete detail follow-info keys before persistence.
- Erkhet fixed asset category `dep_year` means annual depreciation percentage and must be sent to `/pl:accounting/migration/erkhet/references` as `defaultAnnualDepreciationRate`, never as useful life.
- Inventory price lookup must use completed business-active inventory income transactions and default missing product prices to `0`.
- Safe remainder item `preCount` must return `0` and `diffType` filters must be ignored for users without `viewSafeRemainderItemCounts` so they cannot compare the system inventory balance with counted inventory.
- Inventory adjustment outgoing-cost fixes may adjust only related debit transactions in `main`, `receivable`, and `payable` journals; cash and bank debit amounts are explicit payment amounts and must not be rewritten by cost recalculation.
- Inventory adjustment grouping must use detail-level branch/department when present and fall back to transaction root branch/department so mixed-location transaction rows cost against the correct location.
- Journal report filters that target transaction details must be applied after `$unwind` so unrelated detail rows from the same transaction are not included in report sums.
- Erkhet inventory and fixed-asset location filters map to erxes branch/department filters; report matching must accept either transaction root branch/department or detail-level branch/department while keeping selected dimensions combined with AND semantics.
- Erkhet transaction kind filters are adapter inputs only; report aggregation must translate them to current erxes transaction `journal` values instead of adding a separate persisted transaction-kind field.
- System opening fixed asset adjustments must stay published, dated one day before their acquisition transaction, and regenerated or removed from fixed asset income synchronization.
- Fixed asset income removal must ignore follow transactions generated by the same income transaction, including `fxaDepIn`, while still blocking removal when unrelated transactions use the fixed asset.
- Erkhet fixed asset opening sync must keep `fxaIncome` at gross acquisition cost, create `fxaDepIn` from `preDeprecation`, and keep the generated opening balance `main` row at net book value so the pointer balances.
- Fixed asset follow transactions (`fxaDepIn`, `fxaDepOut`, `fxaMoveIn`, `fxaSaleOut`, `fxaSaleCost`) must be created, updated, and removed from the fixed asset journal handlers; `fxaSale` follow accounts use `saleOutAccountId` and `saleCostAccountId`, while `fxaOut` must not require sale-only accounts; `commonRemove` owns cleanup so generated rows do not depend only on outer transaction deletion.
- Generated fixed asset income, out, and move follow transactions must inherit the root transaction's `ptrId`; fixed asset sale follows (`fxaSaleOut`, `fxaDepOut`, and `fxaSaleCost`) share a separate cost pointer from the revenue-side `fxaSale` pointer, matching inventory sale accounting.
- Fixed asset income explicit owner-record counts must not exceed the parent detail count for that detail; partially owner-assigned income quantities are valid and details without owner rows create no owner record unless transaction-level `followInfos.ownerId` is present.
- Fixed asset income code is the acquisition identity; Erkhet opening balances may split one acquisition across several branch/department details, but those details must resolve to one fixed asset master row and separate owner-record rows.
- Fixed asset disposal, sale, and move owner-record selections are optional, and selected counts are capped by the detail count instead of being required to exhaust it; saving removes prior owner-record rows for that transaction and writes fresh `handedOver` rows, while move writes a matching `received` row for the owner so owner balance remains net neutral.
- Fixed asset disposal, sale, and move quantities must come from transaction details; branch and department belong to each detail and mixed locations require multiple details.
- Fixed asset move source details must be paired with generated `fxaMoveIn` destination details, and any accumulated depreciation must be paired as source debit plus destination credit follow transactions so period/location reporting is derived from transaction history, not owner records; move destinations may be branch-only, department-only, or branch plus department.
- Fixed asset move depreciation follows must honor migration-supplied accumulated-depreciation summaries when present so historical moves can import depreciation without requiring a pre-existing adjustment cache.
- Fixed asset depreciation must be calculated once per fixed asset acquisition cost base and allocated across branch/department locations by active quantity for each day.
- Straight-line fixed asset depreciation must use annual depreciation percentage as the source of truth: annual rate / 12 gives monthly depreciation, and each day receives that month's daily prorated amount.
- Fixed asset disposal and sale summaries must use the latest completed or published fixed asset adjustment on or before the disposal transaction date; future, draft, running, or process adjustment details must not affect book value.
- Fixed asset current quantity cache must be rebuilt from business-active fixed asset income, out, sale, move, and move-in transaction details.
- Fixed asset location remainder must be calculated from business-active fixed asset transaction details and must exclude the current edited transaction's entire parent workflow so sibling root and generated movement rows do not reduce its available quantity during validation.
- Single fixed asset location remainder and grouped remainder list queries must share the same movement sign, branch, department, and positive-balance aggregation behavior.
- Automatic fixed asset adjustment calculation supports every fixed asset depreciation method except `manual`; `manual` must fail validation until an entered-depreciation detail flow exists.

## Validation

- `pnpm nx build accounting_api`
- `pnpm nx test accounting_api`
- `node_modules/.bin/tsc -p backend/plugins/accounting_api/tsconfig.build.json --noEmit`
- Smoke scenario: calculate a fund and debt rate adjustment, verify validation fields/details are stored, then run transactions and confirm linked `exchangeDiff` transactions are created.
- Smoke scenario: calculate a closing adjustment, edit a detail entry tax percent, run transactions, and verify `taxImpactValue`, grouped details, and linked transaction ids are stored.
- Smoke scenario: send a dry-run Erkhet references batch and verify product category/product plus fixed asset category rows report create/update actions without missing parent/category code errors.
- Smoke scenario: send a dry-run Erkhet batch and verify code resolution, contact match/create planning, idempotent create/update selection, and per-batch success/error rows.
- Smoke scenario: run `journalReportData` for account statement, trial balance, general ledger, main journal, main journal summary, fund, debt, inventory cost, inventory sale, inventory sale-cost, inventory sale-period, inventory price, inventory profit, inventory shipper, inventory document, inventory seller subsystem, and fixed asset reports with account/category/currency, Erkhet `trKind`, customer/product/fixed-asset/user/content grouping, and branch/department grouping filters, then verify grouped totals and `journalReportMore` detail rows match the selected account details.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-19` — `Inventory Income Weight Allocation`

- **Summary:** Inventory transaction details now persist total weight for weight-proportional inventory income expense allocation.
- **Affected areas:** Transaction detail schema, types, and GraphQL contracts.
- **Contracts changed:** `AccTrDetail` and `CommonTrDetailInput` expose optional `weight: Float`.

### `2026-09-18` — `Erkhet Transaction Tax Metadata`

- **Summary:** Erkhet migration now resolves transaction-owned VAT rows, creates or updates required CTAX constant rows by number, name, and percent, preserves automatic versus manual tax amounts, and keeps generated tax follows attached to their source transaction.
- **Affected areas:** `src/modules/accounting/routes/erkhetMigration.ts`, `src/modules/accounting/utils/taxTrs.ts`, `src/modules/accounting/utils/commonSave.ts`, and migration tests.
- **Contracts changed:** Migration transaction payloads may carry VAT/CTAX flags, row numbers, manual amount flags, amounts, and per-detail exclusion flags.

### `2026-09-17` — `Journal Report Context Filters`

- **Summary:** Journal reports now resolve customer/company tags, product category and search, fixed-asset category and search, and assigned-user filters while intersecting them with explicit selected ids.
- **Affected areas:** `src/modules/accounting/graphql`, `src/modules/accounting/utils/journalReports/maps.ts`.
- **Contracts changed:** Journal report queries accept `customerTagIds`, `companyTagIds`, `productCategoryId`, `productSearchValue`, `fixedAssetCategoryId`, `fixedAssetSearchValue`, and `assignedUserId`.

### `2026-09-17` — `Journal Report Foreign Currency Rows`

- **Summary:** Journal report account enrichment now includes account currency so main, fund, and debt balance reports can present transaction currency totals separately from base-currency totals.
- **Affected areas:** `src/modules/accounting/utils/journalReports/maps.ts`.
- **Contracts changed:** `journalReportData.records` JSON rows now include the `accountCurrency` enrichment field.

### `2026-09-17` — `Fund And Debt Report Details`

- **Summary:** Fund and debt reports now use their registered report-base journal rules with the shared summary filters and drill-down detail pipeline instead of failing as unsupported when `isMore` is enabled.
- **Affected areas:** `src/modules/accounting/utils/journalReports/index.ts`, `src/modules/accounting/utils/journalReports/maps.ts`.
- **Contracts changed:** None.

### `2026-09-17` — `Journal Report Product Lookup Batching`

- **Summary:** Journal report enrichment now fetches core product metadata in batches of 1000 ids so large inventory reports retain product codes and names.
- **Affected areas:** `src/modules/accounting/utils/journalReports/maps.ts`.
- **Contracts changed:** None.

### `2026-09-17` — `Fixed Asset Transaction Normalization`

- **Summary:** Unified fixed asset income, disposal, sale, move, depreciation, owner-allocation, remainder-validation, and Erkhet opening-sync behavior around transaction details and generated follow journals.
- **Affected areas:** `src/modules/accounting`, `src/modules/fixedAssets`, and accounting transaction import/export handling.
- **Contracts changed:** Adds `fxaDep`, `fxaDepIn`, `fxaDepOut`, `fxaSaleOut`, and `fxaSaleCost`; income detail follow info uses `preDeprecation`; sale follow accounts use `saleOutAccountId` and `saleCostAccountId`; move migration may supply `fxaDisposalSummaries`; remainder exclusion applies to the edited transaction's parent workflow.

### `2026-09-14` — `Transaction Index Cleanup`

- **Summary:** Consolidated transaction indexes around journal/account/date filters and `ptrNumber` cursor sorting, and added journal-report prefiltering for indexed detail fields before unwind.
- **Affected areas:** `src/modules/accounting/db/definitions/transaction.ts`, `src/modules/accounting/graphql/resolvers/queries/transactionsCommon.ts`, `src/modules/accounting/utils/journalReports/maps.ts`.
- **Contracts changed:** None.
