# `operation_ui` Plugin Guide

## Identity

- **Plugin:** `operation`
- **Project:** `operation_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/operation_ui`
- **Last synchronized:** `2026-08-03`

## Scope

### Owns

- Tasks, projects, teams, cycles, templates, operation settings, activities,
  and operation-owned widgets.

### Does not own

- Operation backend contracts, core host internals, or another plugin's source.

## Current Capabilities

- Provides task, project, team, triage, cycle, and detail routes.
- Provides relation, notification, and automation widgets.
- Provides configurable operation record tables with persisted preferences.

## Architecture

| Area       | Path                                                          | Responsibility                                              |
| ---------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| Federation | `frontend/plugins/operation_ui/module-federation.config.ts`   | Exposes operation entries, settings, and widgets.           |
| Routes     | `frontend/plugins/operation_ui/src/modules/OperationMain.tsx` | Mounts operation routes.                                    |
| Features   | `frontend/plugins/operation_ui/src/modules`                   | Owns task, project, team, cycle, template, and activity UI. |
| Widgets    | `frontend/plugins/operation_ui/src/widgets`                   | Owns operation extension widgets.                           |

## Contracts

### Provides

- Module Federation exposes configuration, operation, settings, relation,
  notification, and automation widget modules.
- Navigation modules rooted at `/operation`.

### Consumes

- Public `erxes-ui`, `ui-modules`, Apollo Client, Jotai, and React Router APIs.
- Operation GraphQL operations exposed by backend services.

## Data and State

- Apollo Client owns operation server state; Jotai, URL state, and local React
  state own UI state.
- Record-table preferences persist by stable table ID.

## Local Invariants

- Preserve team context in team-scoped task, project, triage, and cycle routes.
- Keep operation feature code and widgets within this plugin.
- Five-or-more-column `RecordTable` surfaces must expose a column selector and
  use a unique stable table ID.

## Validation

- `pnpm nx build operation_ui`
- Open a team's cycles table and verify column preferences persist after reload.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-03` — `Resolve cycle table documentation findings`

- **Summary:** Clarified Module Federation ownership and removed validation commands not defined by the project.
- **Affected areas:** Plugin documentation
- **Contracts changed:** `None`

### `2026-08-03` — `Standardize cycle table column selector`

- **Summary:** Added a persisted selector to the qualifying cycles record table.
- **Affected areas:** `src/modules/cycle/components`
- **Contracts changed:** `None`
