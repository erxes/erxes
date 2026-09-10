# `operation_ui` Plugin Guide

## Identity

- **Plugin:** `operation`
- **Project:** `operation_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/operation_ui`
- **Last synchronized:** `2026-09-09`

## Scope

### Owns

- Operation frontend routes, navigation, projects, tasks, teams, templates, triage, cycles, activity, integration surfaces, relation widgets, notification widgets, automation widgets, and search providers.

### Does not own

- Operation backend persistence or GraphQL resolvers, core UI primitives, shared libraries, or another plugin's source.

## Current Capabilities

- Runs as the `operation_ui` Module Federation remote on port `3006`.
- Registers operation navigation for projects, tasks, team, teams settings, and GitHub integration settings.
- Provides relation widgets for tasks and projects, a task status property input, notification widgets, and automation widgets.
- Development Rspack serving ignores generated dependency/cache/output folders to keep local file watchers bounded.

## Architecture

| Area                  | Path                                             | Responsibility                                      |
| --------------------- | ------------------------------------------------ | --------------------------------------------------- |
| Runtime               | `frontend/plugins/operation_ui/src/main.ts`      | Starts the operation UI remote.                     |
| Federation config     | `frontend/plugins/operation_ui/module-federation.config.ts` | Exposes config, routes, settings, widgets, notifications, and automation entry. |
| Dev server config     | `frontend/plugins/operation_ui/rspack.config.ts` | Module Federation development serving and watch ignore rules. |
| Plugin config         | `frontend/plugins/operation_ui/src/config.tsx`   | Registers navigation, modules, widgets, property inputs, and search providers. |
| Operation modules     | `frontend/plugins/operation_ui/src/modules`      | Owns operation feature UI and route composition.    |
| Pages                 | `frontend/plugins/operation_ui/src/pages`        | Provides route-level operation pages.               |
| Relation widgets      | `frontend/plugins/operation_ui/src/widgets/relation` | Provides relation widget exports.                   |
| Notification widgets  | `frontend/plugins/operation_ui/src/widgets/notifications` | Provides notification widget exports.               |
| Automation widgets    | `frontend/plugins/operation_ui/src/widgets/automations` | Provides automation remote entry exports.           |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./operation`, `./operationSettings`, `./relationWidget`, `./notificationWidget`, and `./automationsWidget`.
- Frontend navigation paths under `operation/*` and `settings/operation/*` registered from `src/config.tsx`.
- Relation widget names `tasks` and `projects`, plus property input `taskStatus`.

### Consumes

- Public UI APIs from `erxes-ui` and `ui-modules`.
- Operation API contracts through the plugin's local GraphQL documents and hooks.
- React Router host mounting contracts from core UI Module Federation.

## Data and State

- Apollo Client owns server state where operation feature hooks use GraphQL.
- React Hook Form and local React state own editable form and component-local state.
- Widget state remains scoped to operation widget modules.

## Local Invariants

- Keep operation-specific UI inside `frontend/plugins/operation_ui`.
- Module Federation exposes, route paths, widget names, and named exports must stay aligned.
- Use `erxes-ui` and `ui-modules`; do not import another plugin's source.
- Dev watch ignores must not include plugin source directories required for hot reload.

## Validation

- `pnpm nx build operation_ui`
- Smoke scenario: open operation projects, tasks, team, operation settings, relation widgets, and automation widget entry through the remote.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-09` — Bound dev watchers

- **Summary:** Operation UI Rspack development serving now ignores generated dependency, cache, coverage, temp, and output folders to reduce local watcher pressure.
- **Affected areas:** `rspack.config.ts`.
- **Contracts changed:** None.
