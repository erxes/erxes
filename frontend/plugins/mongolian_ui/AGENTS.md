# mongolian_ui Rules

## Architecture

- This plugin is the Module Federation remote `mongolian_ui`.
- Dev server port is `3007` from `project.json`.
- Public exposes are `./config`, `./mongolian`, `./mongolianSettings`,
  `./widgets`, and `./floatingWidget` in `module-federation.config.ts`.
- `./mongolian` points to `src/modules/MongolianMain.tsx`; routes are mounted
  under `/mongolian`.
- `./mongolianSettings` points to `src/modules/MongolianSettings.tsx`; settings
  routes are mounted under the core settings shell.
- `src/config.tsx` declares the navigation groups and the `mongolian/*` module
  paths. Every path there must resolve to a route in `MongolianMain.tsx` or
  `MongolianSettings.tsx`.
- Main routes: `/mongolian/put-response/*` (put responses, by-date,
  duplicated), `/mongolian/sync-erkhet/*` (history, deals, products, category,
  pos-order), `/mongolian/msdynamic/*` (sync-history, synced-orders, customers,
  products, categories, prices, pos-order-detail).
- Settings routes: `ebarimt/*`, `msdynamic/*`, `product-places/*`,
  `sync-erkhet/*`, `exchange-rates/*`.
- Feature internals belong under `src/modules/<integration>`: `ebarimt`,
  `erkhet-sync`, `msdynamic`, `productplaces`, `exchangeRates`.
- Each integration keeps settings under its own `settings` folder and shared
  pieces under its own `shared` or `components` folder — never in another
  integration's tree.
- Route-level composition lives in `src/pages`; MS Dynamic pages are nested in
  `src/pages/msdynamic`.
- `src/widgets` is for plugin widget exports, not general shared UI.
- Keep hooks, GraphQL documents, states, constants, and types near the feature
  they support.

## UI Conventions

- Use `erxes-ui` and `ui-modules` components before creating new primitives; do
  not import Radix directly.
- Use `@tabler/icons-react` for icons.
- Use `RecordTable` for every list page, with `RecordTable.CursorProvider` where
  the query is cursor-paginated.
- Keep table columns, command bars, filters, selects, and empty states in
  separate files like the nearby integrations already do.
- Column headers go through the integration's local `HeaderCell` wrapper where
  one exists, otherwise `RecordTable.InlineHead`. `HeaderCell` receives a
  translation key and calls `t()` itself.
- `more`, `checkbox`, and `select` are utility columns. When a table has a `more`
  column it must be the first entry of the column array and the first entry of
  `stickyColumns`.
- A table that offers column visibility, reordering, or pinning must pass a
  unique `tableId` to `RecordTable.Provider`; without it the shared preference
  storage is disabled. Prefix ids with `mongolian_` and never reuse one.
- All user-facing strings go through `useTranslation('mongolian')`.
- Provide loading, empty, success, and error states; every button needs a
  working handler.
- Do not introduce a new visual style, spacing system, UI library, or icon
  library.

## Data and GraphQL

- Use Apollo Client hooks already used in this plugin.
- GraphQL operations live in the feature's `graphql` folder when one exists.
- Name operations with the integration or module prefix plus the purpose, and
  keep the name unique repository-wide.
- Search the integration's `graphql` folder before adding an operation; eBarimt
  and Erkhet share several config queries through `mnConfigs`.
- For cursor lists, follow the `useRecordTableCursor`, `validateFetchMore`, and
  `RecordTable.CursorProvider` pattern already used by put responses and sync
  history.
- After create, update, or delete, update the Apollo cache or refetch so the
  table never needs a manual refresh.
- Do not change backend eBarimt, Erkhet, or MS Dynamic contracts from this
  frontend plugin unless explicitly requested.

## State and Routing

- Add routes in `MongolianMain.tsx` or `MongolianSettings.tsx` with lazy imports
  and `Suspense`, then mirror the path in `src/config.tsx`.
- Use Jotai only for state shared across sibling components, such as the detail
  atoms and to-sync selection atoms each integration already defines.
- Prefer URL query state (`useQueryState`) for filters, detail sheets, and table
  controls, matching nearby list pages.
- Use React Hook Form with Zod for config and settings forms.
- Keep hooks single-purpose and avoid hidden side effects.

## Good References

- Route entry:
  `src/modules/MongolianMain.tsx`

- Settings entry:
  `src/modules/MongolianSettings.tsx`

- Cursor-paginated record table:
  `src/modules/ebarimt/put-response/components/PutResponseRecordTable.tsx`

- Table with `more` menu, checkbox column, and command bar:
  `src/modules/ebarimt/settings/product-group/components/ProductGroupTable.tsx`

- Sync-check table with bulk selection:
  `src/modules/erkhet-sync/check-synced-deals/components/CheckSyncedDealsRecordTable.tsx`

- Sync history table with detail sheet:
  `src/modules/msdynamic/msdynamic-sync-history/components/MSDynamicSyncHistoryRecordTable.tsx`

## Forbidden

- Do not modify backend contracts for a frontend-only task.
- Do not import from another plugin or from an internal path inside a shared
  package.
- Do not share components, atoms, or GraphQL documents across integrations by
  reaching into another integration's folder; move them to a shared folder
  first.
- Do not add new UI, table, form, routing, state, icon, or date libraries.
- Do not move Module Federation exposes without updating all host references.
- Do not put feature-specific components in `src/widgets`.
- Do not hard-code Mongolian or English strings in components.

## Before Coding

1. Search for a similar implementation in the same integration
2. Reuse nearby patterns
3. Confirm the route exists in both the router and `src/config.tsx`
4. Check whether GraphQL operations already exist
5. Keep changes minimal and scoped to the feature

## Validation

- For documentation-only edits, verify referenced paths exist.
- For code changes, run `pnpm nx lint mongolian_ui` and
  `pnpm nx build mongolian_ui`.
- Run `pnpm nx test mongolian_ui` when tests, test setup, or tested behavior
  were touched.
- Fix TypeScript, lint, build, and Sonar warnings introduced by the change.

## Common Mistakes

- Using stale paths copied from another integration or plugin.
- Adding a route without adding the matching entry to `src/config.tsx`.
- Reusing a `tableId` across two tables, which makes them share stored column
  preferences.
- Placing a `more` column after the checkbox column, or leaving it out of
  `stickyColumns`.
- Passing an already-translated string to `HeaderCell`, which expects a key.
- Building a list with plain `Table` when `RecordTable` cursor behavior is
  expected.
- Changing backend schema or API assumptions from the UI layer.
