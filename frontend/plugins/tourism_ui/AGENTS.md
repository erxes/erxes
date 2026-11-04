# `tourism_ui` Plugin Guide

## Identity

- **Plugin:** `tourism`
- **Project:** `tourism_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/tourism_ui`
- **Last synchronized:** `2026-10-19`

## Scope

### Owns

- Tourism frontend routes, navigation, PMS and TMS modules, main tourism route composition, pages, assets, hooks, utilities, and search providers.

### Does not own

- Tourism backend persistence or GraphQL resolvers, core UI primitives, shared libraries, or another plugin's source.

## Current Capabilities

- Runs as the `tourism_ui` Module Federation remote on port `3011`.
- Registers tourism navigation for PMS and TMS.
- Exposes PMS, TMS, tourism main routes, and plugin config through Module Federation.
- Development Rspack serving ignores generated dependency/cache/output folders to keep local file watchers bounded.

## Architecture

| Area              | Path                                                      | Responsibility                                                                                          |
| ----------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| App sidebar       | `frontend/plugins/tourism_ui/src/Sidebar.tsx`             | `TourismSidebar`: the plugin's whole app sidebar, rendered by the `./tourism` entry through `AppLayout` |
| Runtime           | `frontend/plugins/tourism_ui/src/main.ts`                 | Starts the tourism UI remote.                                                                           |
| Federation config | `frontend/plugins/tourism_ui/module-federation.config.ts` | Exposes config, PMS, TMS, and tourism route entries.                                                    |
| Dev server config | `frontend/plugins/tourism_ui/rspack.config.ts`            | Module Federation development serving and watch ignore rules.                                           |
| Plugin config     | `frontend/plugins/tourism_ui/src/config.tsx`              | Registers navigation, modules, and search providers.                                                    |
| PMS module        | `frontend/plugins/tourism_ui/src/modules/pms`             | Owns PMS route composition and UI.                                                                      |
| TMS module        | `frontend/plugins/tourism_ui/src/modules/tms`             | Owns TMS route composition and UI.                                                                      |
| Main module       | `frontend/plugins/tourism_ui/src/modules/main`            | Owns shared tourism route composition.                                                                  |
| Pages             | `frontend/plugins/tourism_ui/src/pages`                   | Provides route-level PMS and TMS pages.                                                                 |
| Codegen           | `frontend/plugins/tourism_ui/codegen.ts`                  | Validates documents against the composed gateway schema; generates the gitignored `src/gql` types.      |
| Cursor lists      | `frontend/plugins/tourism_ui/src/utils/cursorList.ts`     | Adapts nullable list items and `PageInfo` booleans for `erxes-ui` cursor helpers.                       |
| Attachments       | `frontend/plugins/tourism_ui/src/utils/attachment.ts`     | Builds `AttachmentInput` and form values from stored attachments.                                       |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./pms`, `./tms`, and `./tourism`.
- Frontend navigation paths under `tourism/pms` and `tourism/tms` registered from `src/config.tsx`.

### Consumes

- Public UI APIs from `erxes-ui` and `ui-modules`, plus one non-public hook:
  PMS `SelectProducts` imports `useProducts` from
  `ui-modules/modules/products/hooks/useProducts`.
- Tourism, core-api (`productCategories`, `User.details`), payment_api
  (`payments`) and loyalty_api (`pricingPlans`) GraphQL APIs through Apollo
  Client, typed from the composed gateway schema
  (`backend/gateway/generated/schema.graphql`, built by
  `gateway:schema:compose`). The PMS payment and pricing-plan selectors query
  the payment and loyalty plugins, so those queries fail at runtime when
  either plugin is not enabled.
- React Router host mounting contracts from core UI Module Federation.

## Data and State

- Apollo Client owns server state. Every hook infers its data and variables
  from a `gql()` document, and each module's response types are derived from
  the generated query types (`types/*.ts`, or the hook that owns the query).
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
- Codegen validates every document under `src` except tests against the
  composed gateway schema, which holds every backend's subgraph. A field from
  core-api or another plugin needs no local copy; fix a validation error in
  the document, or in the backend that owns the field.
- Codegen drops `${...}` interpolation text, so interpolated field strings are
  invisible to it. Share fields through a local `gql` fragment spread by name.
- Every document is `gql()` from `~/gql` and Apollo hooks take no type
  arguments; `eslint.config.js` enforces both with operation's rules.
- Operation names are unique repo-wide and prefixed with the plugin or module
  (`PmsPayments`, `BmsTours`); codegen rejects a name used by two documents
  with different bodies inside the plugin.
- Generated lists hold nullable items. Compact them with `compactList` inside
  `useMemo`: a new array on every render re-runs effects keyed on it, so branch
  language props come from `useBranchLanguages`, not an inline conversion.
- Cursor lists merge and expose `pageInfo` through `src/utils/cursorList.ts`,
  copied from operation while core's `PageInfo` keeps nullable booleans.
- Mutation inputs never spread query objects: Apollo adds `__typename`, which
  input types reject. Pick fields explicitly (pricing options, itinerary day
  elements) and build attachments with `toAttachmentInput`, which sends
  `name: ''` when the stored attachment has none.
- JSON scalars are read through helpers. `customFieldsData`, custom field
  group `fields` and PMS `paymentTypes`/`discount` are written back whole, so
  their readers keep every entry behind a documented cast. TMS and PMS
  `uiOptions`, PMS `pipelineConfig` and itinerary `personCost` go through
  typed guards (`tms/utils/branchUiOptions`, `pms/utils/branchOptions`,
  `itinerary/utils/personCost`).
- Variable types match the SDL argument types. Codegen rejects a nullable
  variable passed to a non-null argument, such as `$ids: [String!]!` on the
  element, amenity, itinerary and tour removes and `$id: String!` on
  `BmsBranchEdit`.
- `tsconfig.json` maps `ui-modules/*` as well as `ui-modules`. The `useProducts`
  import above and `ui-modules`' own deep self-imports need it, or the type
  check reports hundreds of shared-library errors.
- `src/gql/` is generated and gitignored. `pnpm nx build`, `pnpm nx serve` and
  `pnpm dev:uis` regenerate it; calling Rspack directly skips codegen and leaves
  it stale.

## Validation

- `pnpm nx lint tourism_ui`
- `pnpm nx run gateway:schema:compose --parallel=2`
- `pnpm nx run tourism_ui:codegen --skip-nx-cache`
- `pnpm nx build tourism_ui`
- `npx tsc -p frontend/plugins/tourism_ui/tsconfig.app.json --noEmit | rg tourism_ui`
  prints nothing.
- The skill's untyped-document `rg` over `frontend/plugins/tourism_ui/src`
  prints nothing.
- Smoke scenario: open `tourism/tms`, a TMS branch at
  `tourism/tms/branches/:branchId`, and `tourism/pms` through the remote.
