# `operation_ui` Plugin Guide

## Identity

- **Plugin:** `operation`
- **Project:** `operation_ui`
- **Layer:** Frontend UI
- **Path:** `frontend/plugins/operation_ui`
- **Last synchronized:** `2026-08-05`

## Scope

### Owns

- Operation routes, navigation, pages, settings, and widgets for tasks, projects, teams, cycles, and triage.
- Operation-specific GraphQL documents, Apollo state integration, and client-side feature state.

### Does not own

- Operation backend schemas, resolvers, persistence, or tenant isolation.
- Core application routing, shared UI primitives, or another plugin's source and state.

## Current Capabilities

- Provides task, project, team, cycle, and triage pages under the `operation` route.
- Provides operation settings, relation widgets, notification widgets, automation widgets, and task-status property input integration.
- Provides operation and team navigation for the core workspace shell.

## Architecture

| Area         | Path                                                          | Responsibility                                                                  |
| ------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Federation   | `frontend/plugins/operation_ui/module-federation.config.ts`   | Exposes plugin entry points and defines host-owned shared dependencies.         |
| Registration | `frontend/plugins/operation_ui/src/config.tsx`                | Registers routes, navigation, modules, settings, and widgets with the host.     |
| Routes       | `frontend/plugins/operation_ui/src/modules/OperationMain.tsx` | Maps operation paths to pages and nested layouts.                               |
| Features     | `frontend/plugins/operation_ui/src/modules`                   | Owns task, project, team, cycle, triage, activity, template, and navigation UI. |
| Pages        | `frontend/plugins/operation_ui/src/pages`                     | Composes route-level operation pages.                                           |
| Widgets      | `frontend/plugins/operation_ui/src/widgets`                   | Exposes relation, notification, and automation integrations.                    |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./operation`, `./operationSettings`, `./relationWidget`, `./notificationWidget`, and `./automationsWidget`.
- Host route registration rooted at `operation`.
- Relation widgets for tasks and projects and a task-status property input.

### Consumes

- Public `erxes-ui` and `ui-modules` APIs.
- Apollo Client and operation backend GraphQL contracts.
- The core host's React, React DOM, React Router, and React Router DOM singleton instances.

## Data and State

- Server state is managed through Apollo Client and feature-local GraphQL documents.
- Plugin-wide client state uses Jotai atoms under the owning feature modules; component-local state remains local.
- This frontend project owns no database collections.

## Local Invariants

- `core_ui` is the sole runtime provider of `react-router` and `react-router-dom`; this remote consumes them without private fallbacks.
- Module Federation expose names, `CONFIG` registration, and operation routes must remain aligned.
- Mutations must update Apollo state or refetch affected queries so operation views update without a manual refresh.
- Imports stay within this plugin or public `erxes-ui` and `ui-modules` interfaces.

## Validation

- `pnpm nx lint operation_ui`
- `pnpm nx build operation_ui`
- `pnpm nx test operation_ui`
- Start `core-ui` with `--devRemotes=operation_ui`, open `/operation/tasks`, and verify the remote resolves React Router from `core_ui` without a Router-context error.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-05` — Enforce host-owned router singletons

- **Summary:** The operation remote now consumes the host's React Router packages without bundling private fallback copies.
- **Affected areas:** Module Federation shared dependency configuration and federated operation routing.
- **Contracts changed:** `react-router` and `react-router-dom` are now required host-provided singleton dependencies for `operation_ui`.
