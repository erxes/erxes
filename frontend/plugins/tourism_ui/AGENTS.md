# `tourism_ui` Plugin Guide

## Identity

- **Plugin:** `tourism`
- **Project:** `tourism_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/tourism_ui`
- **Last synchronized:** `2026-10-18`

## Scope

### Owns

- Tourism frontend routes, navigation, PMS and TMS modules, main tourism route composition, pages, widgets, assets, hooks, utilities, and search providers.

### Does not own

- Tourism backend persistence or GraphQL resolvers, core UI primitives, shared libraries, or another plugin's source.

## Current Capabilities

- Runs as the `tourism_ui` Module Federation remote on port `3011`.
- Registers tourism navigation for PMS and TMS.
- Exposes PMS, PMS settings, TMS, TMS settings, tourism main routes, and plugin config through Module Federation.
- Development Rspack serving ignores generated dependency/cache/output folders to keep local file watchers bounded.

## Architecture

| Area              | Path                                                      | Responsibility                                                 |
| ----------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| App sidebar | `frontend/plugins/tourism_ui/src/Sidebar.tsx` | `TourismSidebar`: the plugin's whole app sidebar, rendered by the `./tourism` entry through `AppLayout` |
| Runtime           | `frontend/plugins/tourism_ui/src/main.ts`                 | Starts the tourism UI remote.                                  |
| Federation config | `frontend/plugins/tourism_ui/module-federation.config.ts` | Exposes config, PMS, TMS, settings, and tourism route entries. |
| Dev server config | `frontend/plugins/tourism_ui/rspack.config.ts`            | Module Federation development serving and watch ignore rules.  |
| Plugin config     | `frontend/plugins/tourism_ui/src/config.tsx`              | Registers navigation, modules, and search providers.           |
| PMS module        | `frontend/plugins/tourism_ui/src/modules/pms`             | Owns PMS route composition and UI.                             |
| TMS module        | `frontend/plugins/tourism_ui/src/modules/tms`             | Owns TMS route composition and UI.                             |
| Main module       | `frontend/plugins/tourism_ui/src/modules/main`            | Owns shared tourism route composition.                         |
| Pages             | `frontend/plugins/tourism_ui/src/pages`                   | Provides route-level PMS and TMS pages.                        |
| Widgets           | `frontend/plugins/tourism_ui/src/widgets`                 | Provides plugin widget exports.                                |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./pms`, `./tms`, and `./tourism`.
- Frontend navigation paths under `tourism/pms` and `tourism/tms` registered from `src/config.tsx`.

### Consumes

- Public UI APIs from `erxes-ui` and `ui-modules`.
- Tourism API contracts through the plugin's local GraphQL documents and hooks.
- React Router host mounting contracts from core UI Module Federation.

## Data and State

- Apollo Client owns server state where tourism feature hooks use GraphQL.
- React Hook Form, local React state, hooks, and utilities remain scoped to tourism feature modules.
- Static assets are owned under `src/assets`.

## Local Invariants

- The plugin owns its whole app sidebar. `src/modules/main/Main.tsx` (the `./tourism`
  expose) wraps its routes in `erxes-ui` `AppLayout` (`id="tourism"`) with
  `TourismSidebar`. Core-ui draws only the top `CoreTab` bar; `navigationGroup` in
  `src/config.tsx` supplies just the tab name, icon and `defaultPath` and takes
  no `content`/`subGroup`.
- Page-level side menus render `Sidebar.Panel` from `erxes-ui`, which keeps its own open state (`sidebarPanelOpenState`), separate from the plugin's `AppLayout` sidebar. The panel sits beside the page header, never under it: the page is a row of the panel and a column holding the header and content. The panel passes its heading as `label`, which renders a 40px title row with optional `actions` and the collapse toggle on the right, level with the page header; when collapsed, the toggle moves into the header's panel slot. Do not add a second heading or an in-panel `Sidebar.PanelTrigger` row. Keep `<Sidebar collapsible="none">` for sidebars inside sheets and dialogs. `BranchDetailView` takes the branch page header as `header` and renders it in its loading and not-found states too.
- Keep tourism-specific UI inside `frontend/plugins/tourism_ui`.
- Module Federation exposes, route paths, and named exports must stay aligned.
- Use `erxes-ui` and `ui-modules`; do not import another plugin's source.
- Dev watch ignores must not include plugin source directories required for hot reload.

## Validation

- `pnpm nx build tourism_ui`
- Smoke scenario: open tourism PMS, TMS, PMS settings, and TMS settings routes through the remote.
