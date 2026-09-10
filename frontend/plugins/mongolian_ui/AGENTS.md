# `mongolian_ui` Plugin Guide

## Identity

- **Plugin:** `mongolian`
- **Project:** `mongolian_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/mongolian_ui`
- **Last synchronized:** `2026-09-11`

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
- Product places settings include stage, split, print, and default product
  filter configuration screens under `settings/mongolian/product-places/*`.
- Product places configuration screens render code-scoped `mnConfigs` rows in
  `RecordTable` lists and manage create/edit/delete through a right-side
  `Sheet`; place, split, and print config rows display board, pipeline, and
  stage names rather than raw ids.
- Product places default product filters query Mongolian configs with
  `dealsProductsDefaultFilter`, store one config document per user with
  `subId` equal to the selected user id, and persist multi-segment selections
  in that config value; the config list renders users through the shared member
  display instead of raw ids.
- Product places segment pickers use the shared `ui-modules` `SelectSegment`
  component with `core:products.products` for product segment selection.
- Product places listens to the `productPlacesResponded` subscription from the
  floating widget and opens printable receipt HTML for the current user.
- Renders cursor-paginated `RecordTable` lists for put responses and related
  sync history/checking screens.
- Prints deal eBarimt responses in a popup receipt template that supports
  configured `headerText`, `footerText`, and optional receipt logo images.
- Uses `erxes-ui`, `ui-modules`, Apollo Client, Jotai, React Router, React Hook
  Form, Zod, and `react-i18next` following plugin-local patterns.
- Put response rows tolerate missing or invalid bill `date` values by falling
  back to `createdAt` or rendering an empty marker.

## Architecture

| Area              | Path                                                              | Responsibility                                                   |
| ----------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| Module Federation | `frontend/plugins/mongolian_ui/module-federation.config.ts`       | Public exposes for config, routes, widgets, and floating widget. |
| Dev server config | `frontend/plugins/mongolian_ui/rspack.config.ts`                  | Module Federation development serving and watch ignore rules.    |
| Navigation config | `frontend/plugins/mongolian_ui/src/config.tsx`                    | Plugin navigation groups and module paths.                       |
| Main routes       | `frontend/plugins/mongolian_ui/src/modules/MongolianMain.tsx`     | Route tree mounted under `/mongolian`.                           |
| Settings routes   | `frontend/plugins/mongolian_ui/src/modules/MongolianSettings.tsx` | Settings route tree mounted in the core settings shell.          |
| eBarimt           | `frontend/plugins/mongolian_ui/src/modules/ebarimt`               | eBarimt put responses, filters, tables, and settings UI.         |
| eBarimt print     | `frontend/plugins/mongolian_ui/src/modules/ebarimt/responded`     | Popup receipt HTML for deal eBarimt responses.                   |
| Erkhet sync       | `frontend/plugins/mongolian_ui/src/modules/erkhet-sync`           | Erkhet checking, sync, and settings UI.                          |
| MS Dynamic        | `frontend/plugins/mongolian_ui/src/modules/msdynamic`             | MS Dynamic checking, sync history, and settings UI.              |
| Product places    | `frontend/plugins/mongolian_ui/src/modules/productplaces`         | Product place settings and UI.                                   |
| Exchange rates    | `frontend/plugins/mongolian_ui/src/modules/exchangeRates`         | Exchange rate list and related UI.                               |
| Pages             | `frontend/plugins/mongolian_ui/src/pages`                         | Route-level page composition.                                    |
| Widgets           | `frontend/plugins/mongolian_ui/src/widgets`                       | Plugin widget exports only.                                      |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./mongolian`,
  `./mongolianSettings`, `./widgets`, and `./floatingWidget`.
- Frontend routes mounted by `./mongolian`, including
  `/mongolian/put-response/*`, `/mongolian/sync-erkhet/*`, and
  `/mongolian/msdynamic/*`.
- Floating eBarimt response widget that listens for `ebarimtResponded` and
  opens printable deal receipt HTML.
- Floating product-places response widget that listens for
  `productPlacesResponded` and prints the JSON receipt content returned by the
  backend.
- Settings routes mounted by `./mongolianSettings`, including `ebarimt/*`,
  `msdynamic/*`, `product-places/*`, `sync-erkhet/*`, and
  `exchange-rates/*`.

### Consumes

- Public UI and utility APIs from `erxes-ui` and `ui-modules`.
- Shared `SelectSegment` and `SelectMember` from `ui-modules` for product-place
  segment and assignee selection.
- Apollo GraphQL contracts exposed by the Mongolian backend and platform
  services used by the existing feature GraphQL documents.
- React Router host mounting contracts from core UI Module Federation.
- Translation namespace `mongolian`.

## Data and State

- Apollo Client owns server state for queries and mutations in each feature's
  `graphql` folder.
- Jotai atoms are used only for plugin-local shared UI state such as detail
  rendering flags and table total counts.
- URL query state powers filters, detail sheets, and cursor controls through
  existing filter and cursor hooks.
- Cursor-paginated tables use `RecordTable.CursorProvider`, feature-specific
  session keys, and unique `tableId` values prefixed with `mongolian_`.

## Local Invariants

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
- Deal eBarimt print smoke scenario: receive an `ebarimtResponded`
  subscription payload with `headerText`, `footerText`, and optional
  `receiptIcon`; the popup waits for receipt images before opening print.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-11` - Product places stage display

- **Summary:** Product places place, split, and print config rows now render board, pipeline, and stage names in the table instead of raw ids, and the old route-disconnected config UI was removed.
- **Affected areas:** `src/modules/productplaces/components/ProductPlacesConfigManager.tsx`, `src/modules/productplaces/types.ts`, removed legacy product-place config components, hooks, and helpers.
- **Contracts changed:** None.

### `2026-09-11` - Product filter user display

- **Summary:** Product places default-filter config rows now render the selected user through the shared member display instead of showing the raw user id.
- **Affected areas:** `src/modules/productplaces/components/ProductPlacesConfigManager.tsx`.
- **Contracts changed:** None.

### `2026-09-10` - Product places config tables

- **Summary:** Product places place, split, print, and default-filter settings now list all configs by code and manage add/edit/delete through a shared right-side sheet; default filters store one user-to-segments config per row.
- **Affected areas:** `src/modules/productplaces/components/ProductPlacesConfigManager.tsx`, `src/modules/productplaces/selects/SelectShared.tsx`, `src/pages/productplaces`.
- **Contracts changed:** `dealsProductsDefaultFilter` now stores one config per user with `subId` set to the user id and `value.segmentIds` as the default product segments.

### `2026-09-10` - Multi product-place segments

- **Summary:** Product-place place, split, and default-filter settings now support multiple product segments through shared `SelectSegment`, and default filters use shared member selection.
- **Affected areas:** `src/modules/productplaces/components`, `src/modules/productplaces/types`.
- **Contracts changed:** `dealsProductsDefaultFilter` entries now persist `segmentIds` arrays, while legacy `segmentId` entries remain readable.

### `2026-09-10` - Use shared segment selector

- **Summary:** Product places segment fields now use the shared `ui-modules` `SelectSegment` component, the default-filter page passes through `dealsProductsDefaultFilter` configs correctly, and the plugin-local segment selector was removed.
- **Affected areas:** `src/modules/productplaces/components`, `src/modules/productplaces/containers`, `src/modules/productplaces/graphql`, `src/modules/productplaces/selects`.
- **Contracts changed:** None.

### `2026-09-09` - Restore product places printing

- **Summary:** Product places subscription printing now consumes the full JSON receipt payload, uses typed receipt data, removes the stale mock-user container, and fixes product-place select/condition compile issues.
- **Affected areas:** `src/pages/productplaces/ProductPlacesRespondedPage.tsx`, `src/modules/productplaces`.
- **Contracts changed:** `productPlacesResponded` now requests `content` as JSON instead of a narrowed nested selection.

### `2026-09-09` - Bound dev watchers

- **Summary:** Mongolian UI Rspack development serving now ignores generated dependency, cache, coverage, temp, and output folders to reduce local watcher pressure.
- **Affected areas:** `rspack.config.ts`
- **Contracts changed:** None

### `2026-09-02` - Harden deal eBarimt print logo

- **Summary:** Deal eBarimt popup receipts now render configured header text near the logo, support an optional receipt icon, and wait for images before printing.
- **Affected areas:** `src/pages/EbarimtRespondedPage.tsx`, `src/modules/ebarimt/responded/components/PerResponse.tsx`, `src/modules/ebarimt/responded/components/Response.tsx`
- **Contracts changed:** None

### `2026-08-27` - Guard put response dates

- **Summary:** Put response list date cells now avoid `Invalid time value` when
  bill `date` is missing by falling back to `createdAt` or rendering `-`.
- **Affected areas:** `src/modules/ebarimt/put-response/components/PutResponseColumn.tsx`
- **Contracts changed:** None
