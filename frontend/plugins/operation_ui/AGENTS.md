# `operation_ui` Plugin Guide

## Identity

- **Plugin:** `operation`
- **Project:** `operation_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/operation_ui`
- **Last synchronized:** `2026-09-01`

## Scope

### Owns

- Operation routes and user interfaces for teams, projects, tasks, triage, cycles, milestones, templates, and GitHub integration settings.
- Operation-specific GraphQL documents, Apollo state updates, widgets, navigation, filters, and user feedback.

### Does not own

- Operation persistence, permissions, or GraphQL resolver behavior, which belong to `operation_api`.
- Core navigation infrastructure, shared UI primitives, or another plugin's source code.

## Current Capabilities

- Provides team-scoped project, task, triage, and cycle workflows with list, board, detail, filter, loading, and empty states.
- Orders loaded team tasks by the team's configured status choices and optimistically repositions a task after its status changes.
- Exposes Operation navigation, routes, settings, relation widgets, notification widgets, and automation widgets to the host application.

## Architecture

| Area              | Path                                                          | Responsibility                                                     |
| ----------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| Module Federation | `frontend/plugins/operation_ui/module-federation.config.ts`   | Exposes Operation routes, configuration, settings, and widgets.    |
| Routing           | `frontend/plugins/operation_ui/src/modules/OperationMain.tsx` | Defines Operation routes.                                          |
| Tasks             | `frontend/plugins/operation_ui/src/modules/task`              | Lists, filters, creates, edits, and displays task details.         |
| Plugin config     | `frontend/plugins/operation_ui/src/config.tsx`                | Registers navigation, settings, widgets, and search configuration. |

## Contracts

### Provides

- Module Federation exposes for Operation configuration, routes, settings, relation, notification, and automation widgets.
- Host routes beneath `/operation` and Operation settings routes beneath `/settings/operation`.

### Consumes

- Public `erxes-ui` and `ui-modules` components, hooks, state, and utilities.
- Operation GraphQL queries, mutations, and subscriptions through Apollo Client.

## Data and State

- Apollo Client owns Operation server data and optimistic task updates.
- Jotai owns plugin-wide UI state; component-local interactions use React state.
- Team status choices define the frontend order of loaded task records.

## Local Invariants

- Keep all implementation inside `frontend/plugins/operation_ui` and consume only public shared-package interfaces.
- Keep Module Federation exposes, route registrations, and named exports aligned.
- Update visible lists and details immediately after mutations through Apollo cache updates, refetching, or subscriptions.
- Preserve the existing server order within each status when grouping loaded tasks by team status.
- Use `erxes-ui` and `ui-modules` primitives rather than introducing another UI system.

## Validation

- `pnpm nx build operation_ui`
- Smoke test: change a task status in the team task table and verify the row immediately moves into the selected status group and stays there after the mutation completes.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-01` — Optimistically reorder tasks by status

- **Summary:** Loaded team tasks now follow configured status order, and Apollo optimistically moves a task when its status changes.
- **Affected areas:** `src/modules/task/hooks/useGetTasks.tsx`, `src/modules/task/hooks/useUpdateTask.tsx`, task update mutation.
- **Contracts changed:** The task update mutation now selects the updated `status` instead of the unused `tagIds` field.
