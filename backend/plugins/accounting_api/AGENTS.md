# `accounting_api` Plugin Guide

## Identity

- **Plugin:** `accounting`
- **Project:** `accounting_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/accounting_api`
- **Last synchronized:** `2026-08-04`

## Scope

### Owns

- Accounting transaction APIs, journals, reports, inventory accounting side effects, fixed asset accounting side effects, and plugin-owned migration routes.

### Does not own

- Core contacts, branches, departments, and products; those are consumed through public platform service contracts.
- Source-system migration scripts outside the erxes repository.

## Current Capabilities

- Creates, updates, links, removes, and reports accounting transactions.
- Supports main, cash, bank, receivable, payable, tax, inventory, and fixed asset journal handlers.
- Exposes fund and debt currency rate adjustment schemas, models, GraphQL queries, and mutations alongside current accounting modules.
- Exposes inventory price lookup helpers for current cost and last completed income price by product.
- Accepts Erkhet migration batches at `/pl:accounting/migration/erkhet/transactions`; by default it validates and resolves source codes, then raw-saves the supplied transaction documents without recalculating journal side effects.

## Architecture

| Area                    | Path                                               | Responsibility                                                                               |
| ----------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Runtime                 | `src/main.ts`                                      | Starts the accounting API plugin service.                                                    |
| Accounting transactions | `src/modules/accounting`                           | Owns transaction schemas, models, GraphQL resolvers, routes, and journal utilities.          |
| Fixed assets            | `src/modules/fixedAssets`                          | Owns fixed asset master data, instances, logs, and adjustment models.                        |
| Erkhet migration        | `src/modules/accounting/routes/erkhetMigration.ts` | Validates migration batches, resolves external codes to erxes IDs, and imports transactions. |

## Contracts

### Provides

- GraphQL accounting schema and resolvers from `src/modules/accounting/graphql`.
- GraphQL fund/debt rate adjustment queries and mutations through `adjustFundRates`, `adjustDebtRates`, `adjustFundRateAdd`, `adjustFundRateChange`, `adjustDebtRatesAdd`, and `adjustDebtRatesEdit`.
- GraphQL query `getAccLastIncomePrice(productIds: [String]): JSON`, returning each requested product's last completed inventory income unit price or `0`.
- HTTP route `/pl:accounting/migration/erkhet/transactions` for token-protected Erkhet batch imports.
- Transaction model methods such as `createPTransaction`, `updatePTransaction`, `createTransaction`, and `updateTransaction`.

### Consumes

- Core branches, departments, customers, companies, and products through `sendTRPCMessage`.
- Shared backend utilities from `erxes-api-shared`.

## Data and State

- Tenant-scoped MongoDB models generated through `generateModels(subdomain)`.
- Fund and debt rate adjustments persist in `adjust_fund_rates` and `adjust_debt_rates` with embedded account balance details.
- Accounting transaction documents store journal, side, details, source content IDs, parent/ptr grouping, and migration metadata in `extraData`.
- Fixed asset instance and adjustment collections are owned by this plugin.

## Local Invariants

- Migration import must remain tenant-scoped through request subdomain models.
- Erkhet migration raw-save mode must not invent accounting calculations that should come from Erkhet payloads.
- External source codes must be validated and resolved before transaction documents are saved.
- Fixed asset master records are matched by code during migration; missing codes must fail the batch.
- Last income price lookup must use completed business-active inventory income transactions and default missing product prices to `0`.

## Validation

- `pnpm nx build accounting_api`
- `pnpm nx test accounting_api`
- `node_modules/.bin/tsc -p backend/plugins/accounting_api/tsconfig.build.json --noEmit`
- Smoke scenario: send a dry-run Erkhet batch with `rawSave: true` and verify code resolution plus per-batch success/error rows.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-04` — `Fund Debt Rate Merge Recovery`

- **Summary:** Fund and debt rate adjustment schemas and resolvers were merged with current accounting fixed asset, inventory remainder, permission, and sync contracts.
- **Affected areas:** `src/apollo`, `src/connectionResolvers.ts`, `src/modules/accounting/db/definitions/adjust*Rate.ts`, `src/modules/accounting/db/models/Adjust*Rate.ts`, `src/modules/accounting/graphql/resolvers`.
- **Contracts changed:** Added fund/debt rate adjustment GraphQL contracts to the merged accounting schema.

### `2026-08-03` — `Inventory Last Income Price Query`

- **Summary:** Inventory price lookup now exposes last completed income unit prices with `0` defaults for products without purchase history.
- **Affected areas:** `src/modules/accounting/graphql/resolvers/queries/inventories.ts`, `src/modules/accounting/graphql/schemas/inventories.ts`.
- **Contracts changed:** Added GraphQL query `getAccLastIncomePrice(productIds: [String]): JSON`.

### `2026-08-03` — `Erkhet Raw Batch Migration`

- **Summary:** Erkhet migration now defaults to raw-saving normalized transaction batches after validation so source-side accounting calculations are preserved.
- **Affected areas:** `src/modules/accounting/routes/erkhetMigration.ts`, fixed asset migration payload handling.
- **Contracts changed:** `/pl:accounting/migration/erkhet/transactions` accepts optional `rawSave`; omitted or true uses raw batch persistence, false uses existing journal handlers.
