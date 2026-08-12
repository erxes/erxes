# `sales_ui` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/sales_ui`
- **Last synchronized:** `2026-08-12`

## Scope

### Owns

- POS, deal, order, cover, item, product, payment, appearance, delivery, and permission management screens for the sales frontend.

### Does not own

- Backend POS persistence, POS client runtime behavior, shared UI primitives, core settings infrastructure, or other plugin routes.

## Current Capabilities

- POS permission settings assign admins and cashiers.
- POS permission settings persist cashier temp bill, report visibility, and direct discount controls through `permissionConfig`.
- POS management screens read and write sales GraphQL contracts through the plugin's local documents and hooks.

## Architecture

| Area | Path | Responsibility |
| ---- | ---- | -------------- |
| POS permission form | `frontend/plugins/sales_ui/src/modules/pos/components/permission` | Manages admin and cashier POS permission controls. |
| POS GraphQL | `frontend/plugins/sales_ui/src/modules/pos/graphql` | Provides POS queries and mutations used by settings screens. |
| POS types | `frontend/plugins/sales_ui/src/modules/pos/types` | Describes POS configuration data consumed by the UI. |

## Contracts

### Provides

- Module Federation sales UI routes and exposed POS settings components.
- POS edit mutation payloads containing `permissionConfig.cashiers.seeReport`.

### Consumes

- `erxes-ui` and `ui-modules` public React components.
- Sales POS GraphQL queries and mutations from the sales API.

## Data and State

- Uses React Hook Form state for POS settings forms.
- Uses Apollo Client for POS detail loading and POS edit mutations.
- Persists report access as `permissionConfig.cashiers.seeReport` in the POS document.

## Local Invariants

- POS settings controls must remain backed by `erxes-ui` form primitives and must save through the existing POS edit mutation.
- Cashier report access must use the `permissionConfig.cashiers.seeReport` boolean key.

## Validation

- `pnpm nx build sales_ui`
- POS settings smoke scenario: open POS permission tab, toggle cashier "SEE REPORT", save, and verify the value persists after reload.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-12` — `Cashier report permission`

- **Summary:** Added a cashier report visibility switch to POS permission settings and persisted it in `permissionConfig.cashiers.seeReport`.
- **Affected areas:** `frontend/plugins/sales_ui/src/modules/pos/components/permission`, `frontend/plugins/sales_ui/src/modules/pos/types`
- **Contracts changed:** POS edit mutation payload may include `permissionConfig.cashiers.seeReport`.
