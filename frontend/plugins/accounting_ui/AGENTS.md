# `accounting_ui` Plugin Guide

## Identity

- **Plugin:** `accounting`
- **Project:** `accounting_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/accounting_ui`
- **Last synchronized:** `2026-08-04`

## Scope

### Owns

- Accounting navigation, transaction list and form pages, inventory and fixed asset accounting UI, accounting settings pages, and plugin-owned relation widgets.

### Does not own

- Core product, branch, department, customer, company, and shared UI implementations; those are consumed through public `ui-modules` and `erxes-ui` APIs.
- Backend accounting calculations or GraphQL schema contracts.

## Current Capabilities

- Displays, creates, updates, prints, and removes accounting transactions.
- Provides fund and debt currency rate adjustment list/detail routes under `/accounting/adjustment/fundRate` and `/accounting/adjustment/debRate`.
- Supports inventory income, out, move, sale, and sale return transaction forms with tax-aware amount editing.
- Fills inventory sale prices from product master `unitPrice`, income prices from the last completed inventory income price, and out/move cost prices from current inventory cost.
- Provides accounting settings, reports, remainder views, and fixed asset adjustment screens.

## Architecture

| Area            | Path                                               | Responsibility                                                                 |
| --------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ |
| Runtime         | `src/main.ts`                                      | Starts the accounting UI remote.                                               |
| Plugin config   | `src/config.tsx`                                   | Registers routes and navigation with the host.                                 |
| Transactions    | `src/modules/transactions`                         | Owns transaction tables, forms, GraphQL documents, hooks, and print documents. |
| Inventory pages | `src/modules/inventories`, `src/pages/inventories` | Own inventory remainder and reserve/safe remainder screens.                    |
| Settings        | `src/modules/settings`, `src/pages`                | Owns accounting account, tax, permission, and sync settings UI.                |

## Contracts

### Provides

- Module Federation exposes defined in `module-federation.config.ts`.
- Accounting routes exposed through `src/modules/AccountingMain.tsx` and navigation registered from `src/config.tsx`.
- Relation widget exports from `src/widgets/relation/RelationWidgets.tsx`.

### Consumes

- Accounting GraphQL queries and mutations from the accounting API plugin.
- Core product, branch, department, customer, and company data through public GraphQL and `ui-modules`.
- UI primitives, forms, tables, popovers, hotkey controls, and toast feedback from `erxes-ui`.

## Data and State

- Apollo Client owns server state for transaction details, lists, cost info, product unit prices, and mutation refreshes.
- Jotai atoms under `src/modules/transactions/transaction-form/states` hold transaction form UI state, tax percentages, follow transactions, and rendering selections.
- React Hook Form owns editable transaction group state.

## Local Invariants

- Inventory sale main row `unitPrice` is the selected product master `unitPrice`; related inventory cost/out rows use current inventory cost.
- Inventory income row `unitPrice` is the last completed income price for the selected product, defaulting to `0` when no prior income exists.
- Inventory out and move row `unitPrice` is current inventory cost, defaulting to `0` when no cost exists.
- Transaction forms must keep `amount = count * unitPrice` when count or unit price changes.
- Module Federation exposes, route paths, and named exports must stay aligned.

## Validation

- `pnpm nx build accounting_ui`
- Smoke scenario: in transaction form, change products in inventory sale, income, out, and move rows and verify `unitPrice` plus amount/follow cost values refresh without a manual page reload.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-04` — `Adjustment Route Merge Recovery`

- **Summary:** Fund and debt rate adjustment navigation and routes were merged into the current accounting main module while preserving fixed asset and inventory adjustment UI.
- **Affected areas:** `src/modules/AccountingMain.tsx`, `src/modules/adjustments/components/Header.tsx`, journal report type mapping.
- **Contracts changed:** Frontend routes `/accounting/adjustment/fundRate`, `/accounting/adjustment/fundRate/detail`, `/accounting/adjustment/debRate`, and `/accounting/adjustment/debRate/detail` remain available.

### `2026-08-03` — `Inventory Default Unit Prices`

- **Summary:** Inventory transaction rows now refill unit prices from the correct source when the selected product changes.
- **Affected areas:** `src/modules/transactions/transaction-form/graphql/queries/invCostInfo.ts`, inventory transaction row hooks and forms.
- **Contracts changed:** Consumes `getAccLastIncomePrice` and core `productDetail` queries for default unit price lookups.
