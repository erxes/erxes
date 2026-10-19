# `mongolian_ui` Plugin Guide

## Identity

- **Plugin:** `mongolian`
- **Project:** `mongolian_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/mongolian_ui`
- **Last synchronized:** `2026-10-18`

## Scope

### Owns

- Mongolian integration frontend surfaces for eBarimt, Erkhet sync, MS Dynamic,
  product places, exchange rates, plugin navigation, routes, widgets, local
  GraphQL documents, and plugin UI state.

### Does not own

- Backend contracts, core UI host behavior, shared frontend libraries, another
  plugin's source, or cross-plugin data access.

## Current Capabilities

- Exposes the Module Federation remote `mongolian_ui` on port `3007`.
- Development Rspack serving ignores generated dependency/cache/output folders to keep local file watchers bounded.
- Provides main routes under `/mongolian`, including put responses, by-date
  summaries, duplicated put responses, sync Erkhet, and MS Dynamic workflows.
- Provides settings routes for eBarimt, MS Dynamic, product places, sync Erkhet,
  and exchange rates.
- Mongolian settings shells preserve a bounded content height so settings
  tables and forms scroll inside their main pane rather than escaping the host
  settings viewport.
- POS-in eBarimt settings include receipt behavior toggles for copy printing,
  summary quantity display, and clean tax price display.
- Product places settings include stage, split, print, and default product
  filter configuration screens under `mongolian/settings/product-places/*`.
- Product places configuration screens render code-scoped `mnConfigs` rows in
  `RecordTable` lists and manage create/edit/delete through a right-side
  `Sheet`; place, split, and print config rows display board, pipeline, and
  stage names rather than raw ids.
- Product places board, pipeline, and stage pickers and inline table displays
  use the shared sales selectors from `ui-modules`; plugin-local duplicate
  sales selectors are intentionally absent.
- Product places product, tag, branch, and department selectors use shared
  `ui-modules` selectors; plugin-local duplicate selectors are intentionally
  absent.
- Product places default product filters query Mongolian configs with
  `dealsProductsDefaultFilter`, store one config document per user with
  `subId` equal to the selected user id, and persist multi-segment selections
  in that config value; the config list renders users through the shared member
  display instead of raw ids.
- Product places segment pickers use the shared `ui-modules` `SelectSegment`
  component with `core:products.products` for product segment selection.
- Product places listens to the `productPlacesResponded` subscription from the
  floating widget and opens printable receipt HTML only when the payload
  `sessionCode` matches the current tab's `sessionStorage.sessioncode`.
- Renders cursor-paginated `RecordTable` lists for put responses and related
  sync history/checking screens.
- Put response pagination preserves the full loaded range's start/end cursors,
  prepends backward pages, and allows only one load-more request at a time.
- Registers a product remainder provider that lets shared product choosers
  overlay Erkhet remainders when a `remainderConfig` exists for the active
  sales pipeline.
- Prints deal eBarimt responses in a popup receipt template that supports
  configured `headerText`, `footerText`, and optional receipt logo images.
- Uses `erxes-ui`, `ui-modules`, Apollo Client, Jotai, React Router, React Hook
  Form, Zod, and `react-i18next` following plugin-local patterns.
- Put response rows tolerate missing or invalid bill `date` values by falling
  back to `createdAt` or rendering an empty marker.

## Architecture

| Area               | Path                                                                       | Responsibility                                                     |
| ------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| App sidebar | `frontend/plugins/mongolian_ui/src/Sidebar.tsx` | `MongolianSidebar` (app sidebar) and `MongolianSidebarFooter` (Settings link), rendered by the `./mongolian` entry through `AppLayout` |
| Module Federation  | `frontend/plugins/mongolian_ui/module-federation.config.ts`                | Public exposes for config, routes, widgets, and floating widget.   |
| Dev server config  | `frontend/plugins/mongolian_ui/rspack.config.ts`                           | Module Federation development serving and watch ignore rules.      |
| Navigation config  | `frontend/plugins/mongolian_ui/src/config.tsx`                             | Plugin navigation groups and module paths.                         |
| Main routes        | `frontend/plugins/mongolian_ui/src/modules/MongolianMain.tsx`              | Route tree mounted under `/mongolian`.                             |
| Settings routes    | `frontend/plugins/mongolian_ui/src/modules/MongolianSettings.tsx`          | Settings route tree mounted by the plugin's own `settings/*` route.            |
| eBarimt            | `frontend/plugins/mongolian_ui/src/modules/ebarimt`                        | eBarimt put responses, filters, tables, and settings UI.           |
| eBarimt print      | `frontend/plugins/mongolian_ui/src/modules/ebarimt/responded`              | Popup receipt HTML for deal eBarimt responses.                     |
| Erkhet sync        | `frontend/plugins/mongolian_ui/src/modules/erkhet-sync`                    | Erkhet checking, sync, and settings UI.                            |
| Product remainders | `frontend/plugins/mongolian_ui/src/modules/erkhet-sync/product-remainders` | Provides the Module Federation product chooser remainder provider. |
| MS Dynamic         | `frontend/plugins/mongolian_ui/src/modules/msdynamic`                      | MS Dynamic checking, sync history, and settings UI.                |
| Product places     | `frontend/plugins/mongolian_ui/src/modules/productplaces`                  | Product place settings and UI.                                     |
| Exchange rates     | `frontend/plugins/mongolian_ui/src/modules/exchangeRates`                  | Exchange rate list and related UI.                                 |
| Pages              | `frontend/plugins/mongolian_ui/src/pages`                                  | Route-level page composition.                                      |
| Widgets            | `frontend/plugins/mongolian_ui/src/widgets`                                | Plugin widget exports only.                                        |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./mongolian`,
  `./widgets`, and `./floatingWidget`.
- Frontend routes mounted by `./mongolian`, including
  `/mongolian/put-response/*`, `/mongolian/sync-erkhet/*`, and
  `/mongolian/msdynamic/*`.
- Floating eBarimt response widget that listens for `ebarimtResponded` and
  opens printable deal receipt HTML.
- Floating product-places response widget that listens for the session-scoped
  `productPlacesResponded` payload and prints the JSON receipt content returned
  by the backend.
- Product chooser remainder provider through `CONFIG.widgets.productRemainderProviders`.
- Settings routes under `/mongolian/settings/*`, including `ebarimt/*`,
  `msdynamic/*`, `product-places/*`, `sync-erkhet/*`, and
  `exchange-rates/*`.
- POS-in eBarimt config values may include `hasCopy`, `hasSumQty`, and
  `isCleanTaxPrice` booleans for POS receipt behavior.

### Consumes

- Public UI and utility APIs from `erxes-ui` and `ui-modules`.
- Shared sales `SelectBoard`, `SelectPipeline`, and `SelectStage` components
  from `ui-modules` for product-place stage configuration and table display.
- Shared product, tag, branch, and department selectors from `ui-modules` for
  product-place condition and split configuration forms.
- Shared `SelectSegment` and `SelectMember` from `ui-modules` for product-place
  segment and assignee selection.
- Apollo GraphQL contracts exposed by the Mongolian backend and platform
  services used by the existing feature GraphQL documents.
- Shared `ui-modules` product chooser remainder provider contract.
- React Router host mounting contracts from core UI Module Federation.
- Translation namespace `mongolian`.

## Data and State

- Apollo Client owns server state for queries and mutations in each feature's
  `graphql` folder.
- Product chooser remainder overlays are fetched on demand through Apollo
  queries and are not stored in plugin-local Jotai state.
- Jotai atoms are used only for plugin-local shared UI state such as detail
  rendering flags and table total counts.
- URL query state powers filters, detail sheets, and cursor controls through
  existing filter and cursor hooks.
- Cursor-paginated tables use `RecordTable.CursorProvider`, feature-specific
  session keys, and unique `tableId` values prefixed with `mongolian_`.
- Sync Erkhet settings config tables share `ErkhetConfigRecordTable`, which owns
  row selection, sticky structural columns, and vertical scrolling for the list
  pane.

## Local Invariants

- The plugin owns its whole app sidebar. `src/modules/MongolianMain.tsx` (the `./mongolian`
  expose) wraps its routes in `erxes-ui` `AppLayout` (`id="mongolian"`) with
  `MongolianSidebar`. Core-ui draws only the top `CoreTab` bar; `navigationGroup` in
  `src/config.tsx` supplies just the tab name, icon and `defaultPath` and takes
  no `content`/`subGroup`.
- `MongolianSidebarFooter` pins a Settings link to the bottom of the app
  sidebar. The plugin owns its settings at `/mongolian/settings/*`, served by its
  own entry: the entry's top-level `<Routes>` sends `settings/*` to
  `MongolianSettingsLayout` (`src/Sidebar.tsx`, an `AppLayout` titled
  "<Plugin> settings" with a Back link to the app) and `*` to the app
  `AppLayout`. Settings pages render inside `PluginSettingsRoutes`
  (`ui-modules`), which also serves `tags` and `properties/*` scoped to
  this plugin's types; the settings sidebar appends
  `PluginSharedSettingsNavigation`, which lists Tags/Properties only when the
  plugin registers those types. Core organization settings never list
  plugin settings, `config.tsx` has no `settingsNavigation`, and there is
  no `./mongolianSettings` expose; old `/settings/mongolian/…` URLs are redirected
  by core. The settings navigation renders no `Sidebar.GroupLabel`.
- Page header breadcrumbs follow the shared pattern: crumbs are default ghost `Button`s (no `font-semibold`), the first crumb carries a 16px icon in the default text color, crumbs are separated by `Separator.Inline` or `Breadcrumb.Separator`, and settings pages carry no favorite toggle.
- Page-level side menus render `Sidebar.Panel` from `erxes-ui`, which keeps its own open state (`sidebarPanelOpenState`), separate from the plugin's `AppLayout` sidebar. The panel sits beside the page header, never under it: the page is a row of the panel and a column holding the header and content. The panel passes its heading as `label`, which renders a 40px title row with optional `actions` and the collapse toggle on the right, level with the page header; when collapsed, the toggle moves into the header's panel slot. Do not add a second heading or an in-panel `Sidebar.PanelTrigger` row. Keep `<Sidebar collapsible="none">` for sidebars inside sheets and dialogs. `SettingsLayout`, `ErkhetSettings`, `PutResponseLayout`, `SyncErkhetLayout` and `MsdynamicLayout` render their panel beside the header column.
- Use `erxes-ui` and `ui-modules`; do not import Radix primitives directly.
- Keep integration-specific files inside the owning integration folder unless a
  shared plugin folder already exists for that concern.
- All user-facing strings go through `useTranslation('mongolian')`.
- GraphQL operations live near the feature they serve and use unique
  module-prefixed operation names.
- `more`, `checkbox`, and `select` utility table columns stay first when present
  and are listed in `stickyColumns`.
- Module Federation exposes, `src/config.tsx` navigation paths, and route
  definitions must stay aligned.
- Do not modify backend contracts or shared libraries from a frontend-only
  Mongolian UI task.
- Settings route shells must keep `min-h-0`/bounded overflow on flex content
  panes so nested tables and forms remain scrollable.
- Put response cursor skeletons receive query loading state, including fetch-more;
  page merges use the public `mergeCursorData` helper to preserve both boundaries.
- The product remainder provider must no-op when no sales `pipelineId` or no
  `remainderConfig` exists for that pipeline.

## Validation

- `pnpm exec eslint frontend/plugins/mongolian_ui/src`
- `pnpm exec eslint frontend/plugins/mongolian_ui/src/modules/productplaces frontend/plugins/mongolian_ui/src/pages/productplaces`
- `pnpm nx build mongolian_ui`
- No `test` target is currently defined in `project.json`; add and document one
  before introducing tested behavior.
- Product places smoke scenario: configure split/place/print settings for a
  sales stage, move a deal with products into that stage, and verify the
  floating widget prints branch, department, product, customer, header, and
  footer data without a manual refresh.
- Put response smoke scenario: open `/mongolian/put-response/put-response` with
  rows where `date` is `null`; the table renders without `Invalid time value`
  and displays `createdAt` relatively when available.
- Put response pagination smoke scenario: open the list from its first page,
  scroll forward through multiple pages, and verify no backward request appears
  after appending a page; backward loads prepend rows and preserve the end cursor.
- Deal eBarimt print smoke scenario: receive an `ebarimtResponded`
  subscription payload with `headerText`, `footerText`, and optional
  `receiptIcon`; the popup waits for receipt images before opening print.
