# `insurance_ui` Plugin Guide

## Identity

- **Plugin:** `insurance`
- **Project:** `insurance_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/insurance_ui`
- **Last synchronized:** `2026-10-18`

## Scope

### Owns

- Insurance frontend routes, navigation, search providers, pages, widgets, assets, and module UI under `src/modules/insurance`.

### Does not own

- Insurance backend persistence or GraphQL resolvers, core UI primitives, shared libraries, or another plugin's source.

## Current Capabilities

- Runs as the `insurance_ui` Module Federation remote on port `3002`.
- Registers insurance navigation and routes for types, products, risks, vendors, vendor users, customers, regions, and contracts.
- Exposes insurance config, main routes, settings routes, and widgets through Module Federation.
- Development Rspack serving ignores generated dependency/cache/output folders to keep local file watchers bounded.

## Architecture

| Area              | Path                                             | Responsibility                                      |
| ----------------- | ------------------------------------------------ | --------------------------------------------------- |
| App sidebar | `frontend/plugins/insurance_ui/src/Sidebar.tsx` | `InsuranceSidebar`: the plugin's whole app sidebar, rendered by the `./insurance` entry through `AppLayout` |
| Runtime           | `frontend/plugins/insurance_ui/src/main.ts`      | Starts the insurance UI remote.                     |
| Federation config | `frontend/plugins/insurance_ui/module-federation.config.ts` | Exposes config, insurance routes, settings, and widgets. |
| Dev server config | `frontend/plugins/insurance_ui/rspack.config.ts` | Module Federation development serving and watch ignore rules. |
| Plugin config     | `frontend/plugins/insurance_ui/src/config.tsx`   | Registers navigation, modules, and search providers. |
| Insurance module  | `frontend/plugins/insurance_ui/src/modules/insurance` | Owns insurance route composition and feature UI.     |
| Pages             | `frontend/plugins/insurance_ui/src/pages/insurance` | Provides route-level insurance pages.               |
| Widgets           | `frontend/plugins/insurance_ui/src/widgets`      | Provides plugin widget exports.                     |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./insurance`, and `./widgets`.
- Frontend navigation paths under `insurance/*` registered from `src/config.tsx`.

### Consumes

- Public UI APIs from `erxes-ui` and `ui-modules`.
- Insurance API contracts through the plugin's local GraphQL documents and hooks.
- React Router host mounting contracts from core UI Module Federation.

## Data and State

- Apollo Client owns server state where insurance feature hooks use GraphQL.
- React local state and form state belong inside the insurance feature modules.
- Static assets are owned under `src/assets`.

## Local Invariants

- The plugin owns its whole app sidebar. `src/modules/insurance/Main.tsx` (the `./insurance`
  expose) wraps its routes in `erxes-ui` `AppLayout` (`id="insurance"`) with
  `InsuranceSidebar`. Core-ui draws only the top `CoreTab` bar; `navigationGroup` in
  `src/config.tsx` supplies just the tab name, icon and `defaultPath` and takes
  no `content`/`subGroup`.
- Keep insurance-specific UI inside `frontend/plugins/insurance_ui`.
- Module Federation exposes, route paths, and named exports must stay aligned.
- Use `erxes-ui` and `ui-modules`; do not import another plugin's source.
- Dev watch ignores must not include plugin source directories required for hot reload.

## Validation

- `pnpm nx build insurance_ui`
- Smoke scenario: open the insurance navigation and verify insurance type, product, risk, vendor, customer, region, and contract routes load through the remote.
