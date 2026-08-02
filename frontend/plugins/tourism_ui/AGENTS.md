# `tourism_ui` Plugin Guide

## Identity

- **Plugin:** `tourism`
- **Project:** `tourism_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/tourism_ui`
- **Last synchronized:** `2026-08-03`

## Scope

### Owns

- Tourism management, property management, branches, tours, itineraries,
  elements, categories, amenities, settings, and relation UI.

### Does not own

- Tourism backend contracts, core host navigation, or another plugin's source.

## Current Capabilities

- Provides TMS and PMS routes and settings entries.
- Provides branch-scoped tourism dashboards and configurable record tables.
- Provides relation integration through the tourism module configuration.

## Architecture

| Area       | Path                                                      | Responsibility                                                          |
| ---------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| Federation | `frontend/plugins/tourism_ui/module-federation.config.ts` | Exposes tourism, TMS, PMS, and settings entries.                        |
| Routes     | `frontend/plugins/tourism_ui/src/modules/main/Main.tsx`   | Mounts combined tourism routes.                                         |
| TMS        | `frontend/plugins/tourism_ui/src/modules/tms`             | Owns branches, tours, itineraries, elements, categories, and amenities. |
| PMS        | `frontend/plugins/tourism_ui/src/modules/pms`             | Owns property-management UI.                                            |

## Contracts

### Provides

- Module Federation exposes `./config`, `./tourism`, `./tms`, `./pms`, and
  their settings entries.
- Navigation configuration rooted at `/tourism`.

### Consumes

- Public `erxes-ui`, `ui-modules`, Apollo Client, Jotai, and React Router APIs.
- Tourism GraphQL operations exposed by backend services.

## Data and State

- Apollo Client owns tourism server state; active language uses plugin Jotai
  state and forms use local React state.
- Branch dashboard record-table preferences persist by stable feature ID.

## Local Invariants

- Preserve branch ID and active-language context in TMS queries and mutations.
- Keep TMS and PMS code within their existing module boundaries.
- Five-or-more-column `RecordTable` surfaces must expose a column selector and
  use a unique stable table ID.

## Validation

- `pnpm nx lint tourism_ui`
- `pnpm nx build tourism_ui`
- Open branch amenities, categories, elements, itineraries, tour groups, and
  tours and verify column preferences persist after reload.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-03` — `Standardize tourism table column selectors`

- **Summary:** Added persisted selectors to every qualifying TMS branch dashboard record table.
- **Affected areas:** `src/modules/tms/branch-detail/dashboard`
- **Contracts changed:** `None`
