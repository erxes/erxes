# `accounting_ui` Plugin Guide

## Identity

- **Plugin:** `accounting`
- **Project:** `accounting_ui`
- **Layer:** Frontend UI
- **Path:** `frontend/plugins/accounting_ui`
- **Last synchronized:** `2026-08-03`

## Scope

### Owns

- Accounting transaction, transaction-record, adjustment, inventory,
  journal-report, synchronization-check, and accounting-settings UI.
- Accounting navigation, routes, relation widgets, GraphQL documents, Apollo
  hooks, Jotai state, forms, hotkey scopes, and record-table configuration.

### Does not own

- Accounting backend schemas, resolvers, services, or tenant data storage.
- Core navigation, shared UI primitives, or another plugin's source and private
  contracts.

## Current Capabilities

- Lists, creates, edits, prints, filters, and manages accounting transactions
  and transaction records.
- Provides transaction forms for cash, bank, receivable, payable, inventory,
  tax, and journal workflows.
- Manages inventory adjustments, remainders, safe remainders, reserve
  remainders, accounts, account categories, VAT/city-tax rows, permissions, and
  synchronization configuration.
- Generates journal reports and exposes transaction relationships through the
  host widget contract.
- Checks and synchronizes eligible deals and orders through published GraphQL
  operations.

## Architecture

| Area                   | Path                                                                                               | Responsibility                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Federation entry       | `frontend/plugins/accounting_ui/src/config.tsx`                                                    | Declares accounting navigation, module path, and relation-widget metadata.                    |
| Main routes            | `frontend/plugins/accounting_ui/src/modules/AccountingMain.tsx`                                    | Mounts transaction, adjustment, inventory, report, and sync-check pages.                      |
| Settings routes        | `frontend/plugins/accounting_ui/src/modules/AccountingSettings.tsx`                                | Mounts accounts, categories, tax rows, sync configuration, and permissions.                   |
| Transactions           | `frontend/plugins/accounting_ui/src/modules/transactions`                                          | Owns transaction lists, records, forms, printing, filters, table behavior, and hotkey scopes. |
| Inventories            | `frontend/plugins/accounting_ui/src/modules/inventories`                                           | Owns remainder, safe-remainder, and reserve-remainder screens.                                |
| Adjustments            | `frontend/plugins/accounting_ui/src/modules/adjustments`                                           | Owns accounting adjustment lists, forms, and details.                                         |
| Reports                | `frontend/plugins/accounting_ui/src/modules/journal-reports`                                       | Owns journal-report configuration, rendering, pagination, and totals.                         |
| Sync checks            | `frontend/plugins/accounting_ui/src/modules/check-synced`                                          | Owns deal/order eligibility checks, selections, and sync actions.                             |
| Settings               | `frontend/plugins/accounting_ui/src/modules/settings`                                              | Owns accounting configuration, accounts, tax rows, permissions, and sync mappings.            |
| Pages                  | `frontend/plugins/accounting_ui/src/pages`                                                         | Composes route-level accounting screens from local modules.                                   |
| Widgets                | `frontend/plugins/accounting_ui/src/widgets/relation`                                              | Exposes transaction relation widgets to the host.                                             |
| Cursor-table reference | `frontend/plugins/accounting_ui/src/modules/transactions/components/TransactionTable.tsx`          | Reference for cursor pagination, sticky columns, and command bars.                            |
| Form-table reference   | `frontend/plugins/accounting_ui/src/modules/transactions/transaction-form/components/TBalance.tsx` | Reference for transaction-form rows, balance data, and table hotkeys.                         |

## Contracts

### Provides

- Module Federation remote `accounting_ui` on development port `3008`.
- Exposes `./config`, `./accounting`, `./accountingSettings`, and
  `./relationWidget` from `module-federation.config.ts`.
- Main routes under `/accounting`: transaction list and records, transaction
  create/edit/print, inventory adjustments, journal reports, sync checks,
  remainders, safe remainders, and reserve remainders.
- Settings routes for accounts, account categories, VAT rows, city-tax rows,
  deal/order sync mappings, and permissions.
- Navigation configuration and transaction relation widgets consumed by the
  host.

### Consumes

- Public `erxes-ui` components, record-table APIs, query-state and hotkey
  helpers, plus public `ui-modules` selectors.
- Apollo Client, Jotai, React Router, React Hook Form, Zod, and
  `react-i18next` through plugin-owned components and hooks.
- Published accounting, core, sales, inventory, and organization GraphQL
  operations used by local feature hooks.

## Data and State

- Apollo Client owns server data and cursor-pagination state. Keep GraphQL
  documents and hooks inside the feature that consumes them.
- Mutations must refetch or update the affected query so transaction,
  inventory, adjustment, and settings lists update without a manual refresh.
- Jotai owns cross-component selection, detail, transaction-form, and hotkey
  state; do not introduce atoms for component-local state.
- URL query state owns filters, selected records, sheet state, journal context,
  and route-shareable list state where implemented.
- Cursor session keys in `src/modules/accountsSessionKeys.ts` and feature-local
  cursor constants must remain stable.
- Record-table preference ids must be stable, unique to one table surface, and
  prefixed with `accounting_`.

## Local Invariants

- Keep `config.tsx`, `AccountingMain.tsx`, `AccountingSettings.tsx`, navigation
  entries, and Module Federation exposes aligned whenever routes change.
- Feature internals stay under their owning `transactions`, `inventories`,
  `adjustments`, `journal-reports`, `check-synced`, or `settings` directory.
  Never reach into another plugin for components, state, GraphQL documents, or
  source types.
- Use `erxes-ui` and `ui-modules` components before adding local primitives. Do
  not import Radix directly or introduce another UI, table, form, icon, state,
  or date library.
- Use `@tabler/icons-react` for icons and the `accounting` translation namespace
  for new or modified user-facing strings.
- Use `RecordTable` for list pages and `RecordTable.CursorProvider` for
  cursor-paginated queries. Preserve loading skeletons, empty states, command
  bars, and fetch-more behavior.
- Keep columns, filters, command bars, hooks, GraphQL documents, state, and
  feature types near the surface they support.
- `more`, `checkbox`, and `select` are utility columns. When a table has a
  `more` column, keep it first in both the column array and `stickyColumns`.
- Every table with column preferences needs a unique, stable
  `accounting_`-prefixed `tableId`; never reuse an id across table surfaces.
- Transaction forms must preserve journal-specific detail rows, debit/credit
  balancing, `RecordTableHotkeyProvider` scope, validation, and mutation
  feedback.
- Accounting configuration and sync screens consume published contracts;
  frontend work must not redefine backend accounting schema or resolver
  behavior.
- Add no button without a handler, mutation without success/error feedback,
  list without loading and empty states, or form without validation.
- Before coding, search the owning module for a matching table, form, hook, or
  GraphQL pattern and keep the change within that feature.

## Validation

- `pnpm nx lint accounting_ui`
- `pnpm nx build accounting_ui`
- `pnpm nx test accounting_ui`
- Smoke-test the affected route directly, including loading, empty, success,
  error, mutation-feedback, and persisted table-state behavior where
  applicable.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-03` — Add fixed-asset detail column selector

- **Summary:** Added persistent column selection to the seven-column fixed-asset adjustment detail table.
- **Affected areas:** `src/modules/adjustments/fxa/components/AdjustFixedAssetDetail.tsx`
- **Contracts changed:** None
