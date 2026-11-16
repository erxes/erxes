# `storage_ui` Plugin Guide

## Identity

- **Plugin:** `storage`
- **Project:** `storage_ui`
- **Layer:** Frontend UI
- **Path:** `frontend/plugins/storage_ui`
- **Last synchronized:** `2026-11-16`

## Scope

### Owns

- The storage screens: warehouse stock, RFID scan, work orders, tools, VAT reconciliation and packing-list printing.
- The storage settings route.

### Does not own

- Business rules, validation and stock math; these live in `storage_api`.
- Shared layout and navigation primitives (`erxes-ui`, `ui-modules`).

## Current Capabilities

- Warehouse tab: company filter, issue to a selected active work order with a quantity, break a sealed box, packing list in A4 or 13-row dot-matrix pages, printed by name or nickname.
- RFID tab: compare system packs with tag counts.
- Work orders tab: close to a completion %, reopen a cost line.
- Tools tab: accept handover, show financial and tax depreciation from server `monthsUsed`.
- VAT tab: auto reconcile; manual reconcile blocked when selected payables' TIN differs from the receipt.
- Mutation errors are shown in a dismissible banner; each action sends a new `requestKey`.

## Architecture

| Area | Path | Responsibility |
| --- | --- | --- |
| Federation | `frontend/plugins/storage_ui/module-federation.config.ts` | Remote name and exposes |
| Plugin config | `frontend/plugins/storage_ui/src/config.tsx` | `IUIConfig` (path, icon, modules) |
| Router | `frontend/plugins/storage_ui/src/modules/StorageMain.tsx` | `AppLayout`, main and settings routes |
| Main page | `frontend/plugins/storage_ui/src/pages/storage/IndexPage.tsx` | All storage tabs |
| GraphQL | `frontend/plugins/storage_ui/src/modules/storage/graphql/operations.ts` | Handwritten `storage*` operations |
| Types | `frontend/plugins/storage_ui/src/modules/storage/types.ts` | Query and mutation result types |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./storage`, `./storageSettings`, `./widgets`.
- Routes: `/storage/storage` (main page), `/storage/settings/storage` (settings).

### Consumes

- `storage_api` GraphQL operations prefixed `storage*` (see `operations.ts`).
- `erxes-ui` (`Badge`, `Button`, `Tabs`, `Table`, `IUIConfig`), `ui-modules` (`PageHeader`, settings routes), `@apollo/client`, `@tabler/icons-react`.

## Data and State

- Apollo cache only; queries are refetched after each mutation.
- Local React state: company filter, print mode and printer type, packing lines, selected work order and quantity, completion % inputs, VAT selections, error message.

## Local Invariants

- Every stock or cost mutation sends a fresh `requestKey` from `newRequestKey()`.
- Packing-line display names are computed at render time from the current print mode.
- No `any`; query results use the interfaces in `types.ts`.
- No imports from `core-ui` or other plugins.

## Validation

- `pnpm nx lint storage_ui`
- `pnpm nx build storage_ui`
- `pnpm nx test storage_ui`
- Smoke: `pnpm dev:uis`, open `/storage/storage`, issue an item to a work order and confirm the packing line and error banner behave.
