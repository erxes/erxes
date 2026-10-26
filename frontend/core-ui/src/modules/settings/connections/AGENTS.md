# Connections settings (core-ui)

Settings → Connections (`/settings/connections`): the list, create and edit of
the core Connection module. Backend contract and security rules:
`backend/core-api/src/modules/connections/AGENTS.md`.

## Layout

| Path | Responsibility |
| --- | --- |
| `graphql/index.ts` | `connections`, `connectionsTypes`, `connectionsAdd/Edit/Remove/Test` documents |
| `hooks/` | Queries and mutations; adds/removes refetch the list, edits/tests update the normalized `Connection` |
| `form.ts` | Zod form schema (each row carries its own rules), rows from a type + connection, mutation input |
| `state.ts` | `connectionSheetAtom`: the open create/edit sheet |
| `components/ConnectionsSettings.tsx` | Page: header, table, sheet |
| `components/ConnectionsRecordTable.tsx` | `RecordTable` with loading (`role="status"`), error + Retry, empty states |
| `components/ConnectionSheet.tsx` | erxes-ui `Sheet` with the form, Test connection, Delete (confirm) |
| `components/ConnectionFieldsInput.tsx` | Schema fields and custom key rows (key, value, Secret switch, remove) |
| `components/ConnectionAppearanceField.tsx` | erxes-ui `IconPicker` or `Upload` logo |

Wiring: `SettingsWorkspacePath.Connections`, the lazy route in
`app/components/SettingsRoutes.tsx` behind `PermissionRouteGuard
action="showConnections"`, the developer sidebar entry and
`SETTINGS_PERMISSION_MAP` (`settings/constants/data.ts`).

## Rules

- Name and an icon or logo are required; type fields render from the type's
  schema (`connectionsTypes`), never from hard-coded vendor forms.
- Secrets are write-only: a saved one shows "Saved" with Replace and is never
  prefilled; the input is masked (`type="password"`). A kept secret is sent
  without `value`; only a replaced one carries a value.
- A saved connection's type is fixed: its sealed values belong to it.
- A saved secret's key is read-only: a sealed value stays bound to its key, so
  renaming means removing the row and adding a new one.
- When a connection's type is unavailable (its plugin is disabled or removed),
  the sheet says so, offers no test, and saves only the name and icon (no
  `fields`); Save stays disabled until one of them changes. Delete still works.
- "Test connection" appears only when the type has a test and tests the saved
  values; results are toasts and the row status (Verified / Failed /
  Incomplete / Not tested).
- Changes are behind `manageConnections` (`Can`); viewers see the list only.
- Removing a logo clears the form value; the upload is not deleted until the
  change is saved.
- erxes-ui / ui-modules components only; no new primitives.

## Validation

- `pnpm nx test core-ui` — `__tests__/ConnectionsSettings.test.tsx` renders the
  real page with real erxes-ui components and Apollo `MockedProvider`
  (`jsdomPolyfills.ts` fills in what jsdom lacks; the email editor erxes-ui
  bundles is stubbed). Use Node 22 (CI).
- `pnpm nx build core-ui`; eslint on this folder.
