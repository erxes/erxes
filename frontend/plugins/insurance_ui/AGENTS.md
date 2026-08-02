# `insurance_ui` Plugin Guide

## Identity

- **Plugin:** `insurance`
- **Project:** `insurance_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/insurance_ui`
- **Last synchronized:** `2026-08-03`

## Scope

### Owns

- Insurance vendors, vendor users, products, risks, types, contracts,
  customers, templates, regions, and insurance-specific widgets and settings.

### Does not own

- Insurance backend schemas, core host UI, or another plugin's data and source.

## Current Capabilities

- Provides insurance list, detail, edit, PDF, and settings routes.
- Provides insurance widgets and reusable insurance table components.
- Provides configurable insurance record tables with persisted preferences.

## Architecture

| Area       | Path                                                                    | Responsibility                                                   |
| ---------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Federation | `frontend/plugins/insurance_ui/module-federation.config.ts`             | Exposes configuration, insurance entries, settings, and widgets. |
| Routes     | `frontend/plugins/insurance_ui/src/modules/insurance/Main.tsx`          | Mounts insurance feature routes.                                 |
| Features   | `frontend/plugins/insurance_ui/src/modules/insurance`                   | Owns insurance pages, components, hooks, GraphQL, and types.     |
| Shared UI  | `frontend/plugins/insurance_ui/src/modules/insurance/components/shared` | Owns reusable insurance table and column factories.              |

## Contracts

### Provides

- Module Federation exposes `./config`, `./insurance`,
  `./insuranceSettings`, and `./widgets`.
- Navigation configuration rooted at `/insurance`.

### Consumes

- Public `erxes-ui`, `ui-modules`, Apollo Client, Jotai, and React Router APIs.
- Insurance GraphQL operations exposed by backend services.

## Data and State

- Apollo Client owns insurance server state; local React state owns forms and
  transient UI state.
- Shared record-table rendering receives an explicit stable table ID from each
  insurance surface.

## Local Invariants

- Reuse shared insurance column factories for common entity and contract fields.
- Keep insurance data access and UI within this plugin.
- Five-or-more-column `RecordTable` surfaces must expose a column selector and
  use a unique stable table ID.

## Validation

- `pnpm nx build insurance_ui`
- Open each insurance list and verify column visibility and order persist after
  reload.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-03` — `Resolve insurance table review findings`

- **Summary:** Moved translated labels out of TanStack callbacks and consolidated shared created-date column rendering.
- **Affected areas:** `src/modules/insurance/components/products`, `src/modules/insurance/components/vendors`, `src/modules/insurance/components/shared`
- **Contracts changed:** `None`

### `2026-08-03` — `Standardize insurance table column selectors`

- **Summary:** Added persisted selectors to all qualifying insurance record tables and their shared column factories.
- **Affected areas:** `src/modules/insurance/components`
- **Contracts changed:** `None`
