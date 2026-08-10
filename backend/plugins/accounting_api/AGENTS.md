# `accounting_api` Plugin Guide

## Identity

- **Plugin:** `accounting`
- **Project:** `accounting_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/accounting_api`
- **Last synchronized:** `2026-08-10`

## Scope

### Owns

- Tenant-scoped accounting APIs for accounts, transactions, journals, reports, permissions, tax rows, inventory accounting, fixed asset accounting, and accounting-owned migrations.
- Fund and debt currency rate adjustment persistence, calculation, validation, transaction execution, and subscriptions.

### Does not own

- Core contacts, branches, departments, products, team members, and organization settings; consume them only through public platform contracts.
- Frontend UI state, routes, forms, or presentation.
- Other plugins' data models or implementation details.

## Current Capabilities

- Creates, updates, removes, links, prints, and reports accounting transactions across main, cash, bank, receivable, payable, tax, inventory, fixed asset, and exchange-difference journals.
- Provides account, account category, permission, VAT, CTAX, inventory, fixed asset, and journal report GraphQL contracts.
- Calculates fund rate adjustments for cash/bank foreign-currency balances by day, validates that daily foreign-currency balances do not go negative, groups final balances by account/branch/department, stores calculated details, and runs linked `exchangeDiff` transactions after calculation.
- Calculates debt rate adjustments for receivable/payable balances by day, validates active accounts on debit-side balances and passive accounts on credit-side balances, groups final balances by account/customer/branch/department, stores calculated details, and runs linked `exchangeDiff` transactions after calculation.
- Publishes fund and debt adjustment subscription updates after calculation so detail screens can refresh without manual reloads.
- Exposes inventory cost and last completed inventory income price helpers used by accounting transaction forms.
- Accepts token-protected Erkhet transaction migration batches at `/pl:accounting/migration/erkhet/transactions`; raw-save mode preserves source-side accounting calculations after validation and code resolution.

## Architecture

| Area               | Path                                               | Responsibility                                                                     |
| ------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Runtime            | `src/main.ts`                                      | Starts the accounting API plugin service.                                          |
| Apollo integration | `src/apollo`                                       | Registers accounting schema, resolvers, subscriptions, and federation wiring.      |
| Models             | `src/connectionResolvers.ts`                       | Generates tenant-scoped Mongoose models for accounting-owned collections.          |
| Accounting domain  | `src/modules/accounting`                           | Owns accounting schemas, models, GraphQL resolvers, journal utilities, and routes. |
| Rate adjustments   | `src/modules/accounting/utils/adjust*Rates.ts`     | Owns fund/debt daily validation, grouping, calculation, and transaction execution. |
| Fixed assets       | `src/modules/fixedAssets`                          | Owns fixed asset master data, instances, logs, and adjustment models.              |
| Erkhet migration   | `src/modules/accounting/routes/erkhetMigration.ts` | Validates migration batches, resolves external codes, and imports transactions.    |

## Contracts

### Provides

- Accounting GraphQL schema and resolvers from `src/modules/accounting/graphql`.
- Fund rate GraphQL contracts: `adjustFundRates`, `adjustFundRateDetail`, `adjustFundRateAdd`, `adjustFundRateChange`, `adjustFundRateCalculate`, `adjustFundRateDoTransaction`, `adjustFundRateRun`, `adjustFundRateRemove`, and `accountingAdjustFundRateChanged(adjustId: String!)`.
- Debt rate GraphQL contracts: `adjustDebtRates`, `adjustDebtRateDetail`, `adjustDebtRatesAdd`, `adjustDebtRatesEdit`, `adjustDebtRateCalculate`, `adjustDebtRateDoTransaction`, `adjustDebtRatesRemove`, and `accountingAdjustDebtRateChanged(adjustId: String!)`.
- Adjustment detail fields include account/customer/branch/department grouping metadata, `mainBalance`, `currencyBalance`, `diff`, linked transaction ids, and validation state fields `beginDate`, `successDate`, `checkedAt`, `error`, and `warning`.
- GraphQL query `getAccLastIncomePrice(productIds: [String]): JSON`, returning each requested product's last completed inventory income unit price or `0`.
- Transaction model methods such as `createPTransaction`, `updatePTransaction`, `createTransaction`, `updateTransaction`, and removal helpers used by accounting-owned flows.
- HTTP route `/pl:accounting/migration/erkhet/transactions`.

### Consumes

- Core branch, department, customer, company, product, and organization data through `sendTRPCMessage`, GraphQL, HTTP, or shared platform contracts.
- Shared backend utilities, cursor pagination helpers, pubsub, and service startup APIs from `erxes-api-shared`.

## Data and State

- All Mongoose models are generated per request `subdomain`; never bypass tenant-scoped `models`.
- Fund adjustments persist in `adjust_fund_rates`; details are grouped by account/branch/department.
- Debt adjustments persist in `adjust_debt_rates`; details are grouped by account/customer/branch/department.
- Rate adjustment calculation stores `status: "process"`, validation period metadata, grouped details, and warning/error state.
- Rate adjustment transaction execution creates linked `exchangeDiff` parent/child transactions, stores transaction ids on the adjustment/details, and marks status `complete`.
- Accounting transaction documents store journal, side, date, status, details, branch/department/customer context, parent transaction linkage, and plugin-specific `extraData`.
- Fixed asset instance, fixed asset adjustment, inventory remainder, reserve remainder, tax, and accounting setting collections remain owned by this plugin.

## Local Invariants

- Every resolver that reads or mutates accounting data must use tenant-scoped `models` and enforce the relevant permission before data access.
- Fund/debt rate adjustments are calculated first and executed second; execution must fail when calculated details are missing.
- Rate adjustment edits and removals must remove linked generated transactions and reset calculated state.
- Fund rate adjustment is organization-level; branch/department grouping belongs to details and generated transactions, not the root adjustment.
- Debt rate adjustment filters customer type only when a concrete customer id is selected; selecting only customer type must not exclude other customers.
- Exchange-difference transactions must be generated only through accounting journal handlers and must keep parent/detail transaction linkage.
- Erkhet migration raw-save mode must validate and resolve external source codes but must not recalculate source-side accounting results.
- Inventory price lookup must use completed business-active inventory income transactions and default missing product prices to `0`.

## Validation

- `pnpm nx build accounting_api`
- `pnpm nx test accounting_api`
- `node_modules/.bin/tsc -p backend/plugins/accounting_api/tsconfig.build.json --noEmit`
- Smoke scenario: calculate a fund and debt rate adjustment, verify validation fields/details are stored, then run transactions and confirm linked `exchangeDiff` transactions are created.
- Smoke scenario: send a dry-run Erkhet batch with `rawSave: true` and verify code resolution plus per-batch success/error rows.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-10` — `Rate Adjustment Current State`

- **Summary:** Fund and debt rate adjustments are implemented with daily validation, grouped calculation details, separate transaction execution, subscriptions, and permission-protected resolvers.
- **Affected areas:** `src/modules/accounting/db/definitions/adjust*Rate.ts`, `src/modules/accounting/db/models/Adjust*Rate.ts`, `src/modules/accounting/graphql`, `src/modules/accounting/utils/adjust*Rates.ts`, `src/apollo`.
- **Contracts changed:** Provides fund/debt rate adjustment GraphQL queries, mutations, subscriptions, validation fields, grouped detail fields, and linked transaction ids.
