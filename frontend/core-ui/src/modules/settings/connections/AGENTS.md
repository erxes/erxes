# Workspace connections UI

## Scope and native paths

- Core UI owns this module and `src/pages/settings/workspace/ConnectionsSettingsPage.tsx`.
- Native settings route: `/settings/connections`, registered lazily under the existing settings `Suspense` in `SettingsRoutes.tsx`. `/settings/credentials` redirects here for existing links.
- List queries filter by name (debounced 300 ms) and category on the server. The API returns at most 200 latest matches; show the limit when reached. Preserve category choices from templates and previously fetched metadata while filtering.
- Workspace navigation and global settings search require the exact `credentialsRead` action after permissions load. The core permission module is `credentials`.
- API contract: `backend/core-api/src/modules/credentials/CONTRACT.md`. Do not add human-facing value retrieval or connection testing.

## UI invariants

- `credentialsRead` permits metadata, field-presence and grant-list reads only. `credentialsManage` controls credential writes; `credentialGrantsManage` independently controls grant issuance/revocation.
- Use native `erxes-ui` forms, sheets, dialogs and tables, `ui-modules` page headers/permissions, React Hook Form and Zod.
- Queries request metadata only. No stored field value is ever fetched or used as an input placeholder. Template and stable reference cannot change in the editor.
- Every field update explicitly keeps, replaces or clears. Only replace sends `value`; required fields cannot clear. Generic credentials support multiple unique custom keys and bounded free-form categories.
- Entry is provider-first: branded catalog → provider-specific configuration → metadata-only review → saved confirmation. Provider fields use visible human-readable labels, contextual help, account setup guides, and optional settings. New arbitrary key/value records are not offered; existing generic/AI records remain editable with their saved descriptors and category.
- The catalog is an explicit allowlist (`providers.ts`) intersected with server templates. Never infer provider identity from a user-entered key or expose unsupported templates as working integrations. Public non-secret defaults apply only on creation; edits never fetch saved values or silently replace them.
- Catalog card content fills the card width. Keep the arrow at the trailing inset and category at the bottom so different description lengths do not misalign a grid row. Preserve natural text wrapping and the compact horizontal layout used in setup.
- Status is derived from required-field presence and labelled Configured in lists or Account details saved in details, not Verified/Connected. No provider network checks, OAuth, automatic integration rewiring, or default-provider changes are performed by this UI.
- Provider logos are local assets or the existing Tabler brand icons. Never request a remote logo on a sensitive setup page. Step transitions respect reduced motion; focus follows the step heading. Back preserves input, changing provider resets it, and saving/dismissal resets the entire form.
- Keep `/settings/connections` and the legacy route covered by `src/providers/credentialPrivacy.ts`, in addition to the retained `credentials*` API-name privacy guards.
- Existing inputs start empty with a saved-value hint, not a stored-value placeholder. Typing selects replace; erasing a replacement returns to keep. Optional stored values have an explicit clear button; undo restores keep. New optional blank values remain clear. Never submit display hints as values.
- Sensitive inputs are masked. Form values exist only in the mounted form; dismissal resets/unmounts them. Never persist them to atoms, storage, URLs or logs.
- Credential create/update and grant issuance use a separate devtools-disabled Apollo client sharing the host's authenticated link. The host enables devtools mutation history and must not receive plaintext mutation variables. Sensitive mutations are `no-cache` with HTTP fetch `no-store`.
- Issued consumer tokens live only in the app-access component state and are cleared on dialog dismissal/unmount. Never use a mutation hook result, shared Apollo cache, Jotai or browser storage to hold them.
- Consumer plugin names match the backend identity constraint: 1–64 lowercase letters, digits or hyphens, beginning with a lowercase letter. Discard late issuance responses after dismissal or permission loss; mask the one-time token input.
- Mutation errors use fixed, redacted UI text, not raw server errors. Successful mutations immediately refetch the affected metadata list. Delete and revoke require confirmation.
- The detail page leads with **Use this connection**. Select installed workspace apps from `pluginsConfigState` (plus the built-in erxes workspace), generate access names internally, and label the action **Create setup instructions**. Do not ask ordinary users to invent plugin or grant names. Manual backend identifiers belong only to the explicitly selected developer option.
- Preparing access is not connecting an app: explain the one-time developer integration requirement before issuance and in the resulting instructions. Show access as allowed, not connected or verified. The developer receives the token/reference through an explicit private copy action; token material stays only in component memory and is cleared on close/unmount/permission loss. Discard late responses after permission changes.
- Connection IDs are read-only and collapsed under **Technical details (for developers)**, separate from the user’s next step. Saved confirmation leads to **Choose an app**.

## Validation

- `pnpm exec eslint frontend/core-ui/src/modules/settings/connections --max-warnings=0`
- `pnpm nx build core-ui`
- `pnpm exec jest --config frontend/core-ui/src/modules/settings/connections/jest.connections.cjs --runInBand`
- `pnpm exec tsc -p frontend/core-ui/tsconfig.app.json --noEmit` (project-wide check includes shared frontend libraries).
- Privacy tests assert no-cache/no-store sensitive transport and empty host mutation history on success and failure.
- Smoke: verify unreadable/readonly/manage/grant-only permissions, catalog search/category filters, provider defaults and labelled fields, required validation, Back/review navigation, redacted review, saved confirmation, optional clear/undo, legacy edits, mutation failure/retry, immediate list refresh, revoke/delete confirmation, and token/form dismissal cleanup. Check narrow screens, light/dark themes and reduced motion.
