# `frontline_ui` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/frontline_ui`
- **Last synchronized:** `2026-08-03`

## Scope

### Owns

- Inbox, channels, integrations, calls, forms, tickets, knowledge base, reports,
  and Frontline-owned widgets and settings UI.

### Does not own

- Frontline backend contracts, core host navigation internals, or other plugin
  implementations.

## Current Capabilities

- Provides inbox, ticket, call, form, report, and knowledge-base routes.
- Provides automation, notification, relation, and floating widgets.
- Provides configurable record tables with persisted column preferences.

## Architecture

| Area | Path | Responsibility |
| --- | --- | --- |
| Federation | `frontend/plugins/frontline_ui/module-federation.config.ts` | Exposes Frontline entries, settings, and widgets. |
| Routes | `frontend/plugins/frontline_ui/src/modules/FrontlineMain.tsx` | Mounts primary Frontline routes. |
| Features | `frontend/plugins/frontline_ui/src/modules` | Owns feature UI, GraphQL documents, hooks, and state. |
| Widgets | `frontend/plugins/frontline_ui/src/widgets` | Owns Frontline extension widgets. |

## Contracts

### Provides

- Module Federation exposes for configuration, Frontline, settings,
  knowledge base, selectors, and widgets.
- Navigation modules under `frontline`, `frontline/ticket`, and
  `frontline/knowledgebase`.

### Consumes

- Public `erxes-ui`, `ui-modules`, Apollo Client, Jotai, and React Router APIs.
- Frontline GraphQL operations exposed by backend services.

## Data and State

- Apollo Client owns server-backed Frontline state; URL state, Jotai, and local
  React state own UI state.
- Record-table preferences persist by unique table ID, including integration
  type-specific table IDs where column sets differ.

## Local Invariants

- Keep integration-type behavior and cursor session keys aligned with routes.
- Keep Frontline widgets under `src/widgets` and feature code under `src/modules`.
- Five-or-more-column `RecordTable` surfaces must expose a column selector and
  use a unique stable table ID.

## Validation

- `pnpm nx lint frontline_ui`
- `pnpm nx build frontline_ui`
- Open forms, integrations, call queues, call agents, tickets,
  knowledge-base articles, report lists, and Facebook automation bots and
  verify column preferences persist after reload.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-03` — `Standardize Frontline table column selectors`

- **Summary:** Added persisted selectors to qualifying Frontline record tables that lacked them.
- **Affected areas:** `src/modules/forms`, `src/modules/integrations`, `src/modules/knowledgebase`, `src/modules/report`, `src/modules/ticket`, `src/pages/CallDetailPage.tsx`, `src/widgets/automations`
- **Contracts changed:** `None`
