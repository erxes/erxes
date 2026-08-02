# `payment_ui` Plugin Guide

## Identity

- **Plugin:** `payment`
- **Project:** `payment_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/payment_ui`
- **Last synchronized:** `2026-08-03`

## Scope

### Owns

- Payment settings, payment-method management, invoice UI, payment widgets,
  and payment relation widgets.

### Does not own

- Payment backend processing, core host internals, or another plugin's source.

## Current Capabilities

- Provides payment settings navigation and payment-method configuration.
- Provides invoice and relation widgets.
- Provides configurable payment and invoice record tables.

## Architecture

| Area       | Path                                                       | Responsibility                                |
| ---------- | ---------------------------------------------------------- | --------------------------------------------- |
| Federation | `frontend/plugins/payment_ui/module-federation.config.ts`  | Exposes configuration, settings, and widgets. |
| Payment    | `frontend/plugins/payment_ui/src/modules/payment`          | Owns invoice and payment module UI.           |
| Settings   | `frontend/plugins/payment_ui/src/modules/settings/payment` | Owns payment-method settings UI.              |
| Widgets    | `frontend/plugins/payment_ui/src/widgets`                  | Owns payment extension widgets.               |

## Contracts

### Provides

- Module Federation exposes `./config`, `./paymentSettings`, `./widgets`, and
  `./relationWidget`.
- Settings navigation for the `payment` plugin.

### Consumes

- Public `erxes-ui`, `ui-modules`, Apollo Client, and React Router APIs.
- Payment and invoice GraphQL operations exposed by backend services.

## Data and State

- Apollo Client owns payment and invoice server state; local React state owns
  transient dialogs and forms.
- Payment record-table preferences persist by stable table ID.

## Local Invariants

- Keep payment-provider credentials and forms inside payment settings.
- Keep payment UI and GraphQL documents within this plugin.
- Five-or-more-column `RecordTable` surfaces must expose a column selector and
  use a unique stable table ID.

## Validation

- `pnpm nx build payment_ui`
- Open invoices and payment settings and verify column preferences persist
  after reload.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-03` — `Align payment validation documentation`

- **Summary:** Removed validation commands not defined by the payment UI project.
- **Affected areas:** Plugin documentation
- **Contracts changed:** `None`

### `2026-08-03` — `Standardize payment table column selectors`

- **Summary:** Added persisted selectors to invoice and payment-method record tables.
- **Affected areas:** `src/modules/payment`, `src/modules/settings/payment`
- **Contracts changed:** `None`
