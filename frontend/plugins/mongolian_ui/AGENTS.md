# `mongolian_ui` Plugin Guide

## Identity

- **Plugin:** `mongolian`
- **Project:** `mongolian_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/mongolian_ui`
- **Last synchronized:** `2026-09-02`

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
- Provides main routes under `/mongolian`, including put responses, by-date
  summaries, duplicated put responses, sync Erkhet, and MS Dynamic workflows.
- Provides settings routes for eBarimt, MS Dynamic, product places, sync Erkhet,
  and exchange rates.
- Renders cursor-paginated `RecordTable` lists for put responses and related
  sync history/checking screens.
- Prints deal eBarimt responses in a popup receipt template that supports
  configured `headerText`, `footerText`, and optional receipt logo images.
- Uses `erxes-ui`, `ui-modules`, Apollo Client, Jotai, React Router, React Hook
  Form, Zod, and `react-i18next` following plugin-local patterns.
- Put response rows tolerate missing or invalid bill `date` values by falling
  back to `createdAt` or rendering an empty marker.

## Architecture

| Area | Path | Responsibility |
| ---- | ---- | -------------- |
| Module Federation | `frontend/plugins/mongolian_ui/module-federation.config.ts` | Public exposes for config, routes, widgets, and floating widget. |
| Navigation config | `frontend/plugins/mongolian_ui/src/config.tsx` | Plugin navigation groups and module paths. |
| Main routes | `frontend/plugins/mongolian_ui/src/modules/MongolianMain.tsx` | Route tree mounted under `/mongolian`. |
| Settings routes | `frontend/plugins/mongolian_ui/src/modules/MongolianSettings.tsx` | Settings route tree mounted in the core settings shell. |
| eBarimt | `frontend/plugins/mongolian_ui/src/modules/ebarimt` | eBarimt put responses, filters, tables, and settings UI. |
| eBarimt print | `frontend/plugins/mongolian_ui/src/modules/ebarimt/responded` | Popup receipt HTML for deal eBarimt responses. |
| Erkhet sync | `frontend/plugins/mongolian_ui/src/modules/erkhet-sync` | Erkhet checking, sync, and settings UI. |
| MS Dynamic | `frontend/plugins/mongolian_ui/src/modules/msdynamic` | MS Dynamic checking, sync history, and settings UI. |
| Product places | `frontend/plugins/mongolian_ui/src/modules/productplaces` | Product place settings and UI. |
| Exchange rates | `frontend/plugins/mongolian_ui/src/modules/exchangeRates` | Exchange rate list and related UI. |
| Pages | `frontend/plugins/mongolian_ui/src/pages` | Route-level page composition. |
| Widgets | `frontend/plugins/mongolian_ui/src/widgets` | Plugin widget exports only. |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./mongolian`,
  `./mongolianSettings`, `./widgets`, and `./floatingWidget`.
- Frontend routes mounted by `./mongolian`, including
  `/mongolian/put-response/*`, `/mongolian/sync-erkhet/*`, and
  `/mongolian/msdynamic/*`.
- Floating eBarimt response widget that listens for `ebarimtResponded` and
  opens printable deal receipt HTML.
- Settings routes mounted by `./mongolianSettings`, including `ebarimt/*`,
  `msdynamic/*`, `product-places/*`, `sync-erkhet/*`, and
  `exchange-rates/*`.

### Consumes

- Public UI and utility APIs from `erxes-ui` and `ui-modules`.
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
- `pnpm nx build mongolian_ui`
- No `test` target is currently defined in `project.json`; add and document one
  before introducing tested behavior.
- Put response smoke scenario: open `/mongolian/put-response/put-response` with
  rows where `date` is `null`; the table renders without `Invalid time value`
  and displays `createdAt` relatively when available.
- Deal eBarimt print smoke scenario: receive an `ebarimtResponded`
  subscription payload with `headerText`, `footerText`, and optional
  `receiptIcon`; the popup waits for receipt images before opening print.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-02` - Harden deal eBarimt print logo

- **Summary:** Deal eBarimt popup receipts now render configured header text near the logo, support an optional receipt icon, and wait for images before printing.
- **Affected areas:** `src/pages/EbarimtRespondedPage.tsx`, `src/modules/ebarimt/responded/components/PerResponse.tsx`, `src/modules/ebarimt/responded/components/Response.tsx`
- **Contracts changed:** None

### `2026-08-27` - Guard put response dates

- **Summary:** Put response list date cells now avoid `Invalid time value` when
  bill `date` is missing by falling back to `createdAt` or rendering `-`.
- **Affected areas:** `src/modules/ebarimt/put-response/components/PutResponseColumn.tsx`
- **Contracts changed:** None
