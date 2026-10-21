# Workspace credentials UI

## Scope and native paths

- Core UI owns this module and `src/pages/settings/workspace/CredentialsSettingsPage.tsx`.
- Native settings route: `/settings/credentials`, registered lazily under the existing settings `Suspense` in `SettingsRoutes.tsx`.
- List queries filter by name (debounced 300 ms) and category on the server. The API returns at most 200 latest matches; show the limit when reached. Preserve category choices from templates and previously fetched metadata while filtering.
- Workspace navigation and global settings search require the exact `credentialsRead` action after permissions load. The core permission module is `credentials`.
- API contract: `backend/core-api/src/modules/credentials/CONTRACT.md`. Do not add human-facing value retrieval or connection testing.

## UI invariants

- `credentialsRead` permits metadata, field-presence and grant-list reads only. `credentialsManage` controls credential writes; `credentialGrantsManage` independently controls grant issuance/revocation.
- Use native `erxes-ui` forms, sheets, dialogs and tables, `ui-modules` page headers/permissions, React Hook Form and Zod.
- Queries request metadata only. No stored field value is ever fetched or used as an input placeholder. Template and stable reference cannot change in the editor.
- Every field update explicitly keeps, replaces or clears. Only replace sends `value`; required fields cannot clear. Generic credentials support multiple unique custom keys and bounded free-form categories.
- Entry uses compact `key = value` rows. Template/existing keys are read-only; generic keys are editable on creation. Optional description/category and custom field options are collapsed by default.
- Existing inputs start empty with a saved-value hint, not a stored-value placeholder. Typing selects replace; erasing a replacement returns to keep. Optional stored values have an explicit clear button; undo restores keep. New optional blank values remain clear. Never submit display hints as values.
- Sensitive inputs are masked. Form values exist only in the mounted form; dismissal resets/unmounts them. Never persist them to atoms, storage, URLs or logs.
- Credential create/update and grant issuance use a separate devtools-disabled Apollo client sharing the host's authenticated link. The host enables devtools mutation history and must not receive plaintext mutation variables. Sensitive mutations are `no-cache` with HTTP fetch `no-store`.
- Issued consumer tokens live only in the consumer-access component state and are cleared on dialog dismissal/unmount. Never use a mutation hook result, shared Apollo cache, Jotai or browser storage to hold them.
- Consumer plugin names match the backend identity constraint: 1–64 lowercase letters, digits or hyphens, beginning with a lowercase letter. Discard late issuance responses after dismissal or permission loss; mask the one-time token input.
- Mutation errors use fixed, redacted UI text, not raw server errors. Successful mutations immediately refetch the affected metadata list. Delete and revoke require confirmation.

## Validation

- `pnpm nx lint core-ui`
- `pnpm nx build core-ui`
- `pnpm nx test core-ui --runInBand --testPathPattern=src/modules/settings/credentials/__tests__`
- `pnpm exec tsc -p frontend/core-ui/tsconfig.app.json --noEmit` (project-wide check includes shared frontend libraries).
- Privacy tests assert no-cache/no-store sensitive transport and empty host mutation history on success and failure.
- Smoke: verify unreadable/readonly/manage/grant-only permissions, required validation, optional clear, multiple generic keys, immutable template/reference, mutation failure/retry, immediate list refresh, revoke/delete confirmation, and token/form dismissal cleanup.
