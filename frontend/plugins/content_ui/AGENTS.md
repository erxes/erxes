# `content_ui` Plugin Guide

## Identity

- **Plugin:** `content`
- **Project:** `content_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/content_ui`
- **Last synchronized:** `2026-08-13`

## Scope

### Owns

- CMS and Web Builder routes, navigation, pages, widgets, GraphQL documents,
  client state, translations, and user feedback.

### Does not own

- Backend CMS data, GraphQL contracts, core UI primitives, or other plugins.

## Current Capabilities

- Provides CMS content, category, page, menu, custom-field, and media workflows.
- Provides Web Builder configuration and editing surfaces.
- Preserves blank lines and Tab-indented block structure when CMS posts are
  saved and reopened in the post editor.
- Allows individual CMS custom-field file uploads up to 630 MiB through the
  platform's chunked-upload contract.

## Architecture

| Area          | Path                                                  | Responsibility                            |
| ------------- | ----------------------------------------------------- | ----------------------------------------- |
| Configuration | `frontend/plugins/content_ui/src/config.tsx`          | Registers content navigation and modules. |
| CMS           | `frontend/plugins/content_ui/src/modules/cms`         | Owns CMS routes and feature UI.           |
| Web Builder   | `frontend/plugins/content_ui/src/modules/web-builder` | Owns Web Builder UI.                      |
| Pages         | `frontend/plugins/content_ui/src/pages`               | Provides route-level pages.               |
| Widgets       | `frontend/plugins/content_ui/src/widgets`             | Provides plugin widget exports.           |

## Contracts

### Provides

- Module Federation exposes `./config` and `./content`.
- Routes mounted under `/content`, including `/content/cms` and
  `/content/web-builder`.

### Consumes

- Public `erxes-ui` and `ui-modules` APIs.
- Content plugin GraphQL APIs through Apollo Client.

## Data and State

- Apollo Client owns server state, Jotai owns shared client state, and local
  React state owns component-local interactions.

## Local Invariants

- This plugin is the Module Federation remote `content_ui`.
- Dev server port is `3003` from `project.json`.
- Public exposes are `./config` and `./content` in
  `module-federation.config.ts`.
- `./content` points to `src/modules/cms/Main.tsx`; routes are mounted under
  `/content`.
- CMS routes live under `/content/cms`; Web Builder routes live under
  `/content/web-builder`.
- Route-level CMS pages also exist under `src/pages/cms`; follow the nearby
  route/page split before adding new files.
- Main feature internals belong under `src/modules/cms` or
  `src/modules/web-builder`.
- CMS shared layout/components belong under `src/modules/cms/shared`.
- CMS posts store interoperable HTML with the non-lossy BlockNote document in
  `data-erxes-editor-document`; reopening a post must prefer that document and
  use the HTML only as a legacy fallback.
- The CMS post form uses the public `Editor` in its default JSON mode, matching
  Sales; HTML conversion belongs to the CMS submission boundary.
- `src/widgets` is for plugin widget exports, not general shared CMS UI.
- Keep hooks, GraphQL documents, states, constants, and types near the feature
  they support.

### UI Conventions

- Match existing CMS page structure: header, optional CMS sidebar, content area,
  and drawers.
- Use `erxes-ui` and `ui-modules` components before creating new primitives.
- Use `@tabler/icons-react` for icons.
- Use `RecordTable` for cursor-paginated list pages.
- Use existing drawer/dialog patterns for create and edit flows.
- Keep table columns, command bars, filters, empty states, and count atoms
  separate like nearby CMS modules.
- Match existing filter structure, loading states, empty states, bulk actions,
  and form layout patterns.
- Do not introduce a new visual style, spacing system, UI library, or icon
  library.

### Data and GraphQL

- Use Apollo Client hooks already used in this plugin.
- GraphQL operations should live in the feature's `graphql` folder when one
  exists.
- Name GraphQL queries and mutations with the plugin or module prefix plus the
  operation purpose, such as `cmsPageList`; operation names must be unique.
- Search `src/modules/cms/graphql` before adding an operation; this plugin still
  has shared legacy CMS queries and mutations.
- Reuse fragments such as `PageInfoFragment` before duplicating fields.
- For cursor lists, follow the `useRecordTableCursor`, `validateFetchMore`, and
  `RecordTable.CursorProvider` pattern.
- Do not change backend GraphQL contracts from this frontend plugin unless
  explicitly requested.

### State and Routing

- Add routes in `src/modules/cms/Main.tsx` using lazy imports and `Suspense`.
- Preserve existing route params such as `websiteId`, `postId`, and `pageId`.
- Use React Router links/navigation consistently with nearby pages.
- Use Jotai only for state shared across sibling components or table/page state
  already modeled with atoms.
- Prefer URL query state for filters and table controls when nearby list pages
  already do.
- Keep hooks single-purpose and avoid hidden side effects.

### Good References

- Route entry:
  `src/modules/cms/Main.tsx`

- CMS shell:
  `src/modules/cms/shared/CmsLayout.tsx`

- Record table with cursor loading:
  `src/modules/cms/posts/components/PostsRecordTable.tsx`

- Drawer-based CRUD page:
  `src/modules/cms/categories/Categories.tsx`

- Custom fields management:
  `src/modules/cms/custom-fields/CustomFields.tsx`

- Web Builder entry:
  `src/modules/web-builder/WebBuilderPage.tsx`

### Forbidden

- Do not modify backend contracts for a frontend-only task.
- Do not create duplicate GraphQL operations without searching existing shared
  and feature-local files.
- Do not add new UI, table, form, routing, state, icon, or date libraries.
- Do not move Module Federation exposes without updating all host references.
- Do not put feature-specific CMS components in `src/widgets`.
- Do not replace existing cursor pagination with offset pagination unless the
  backend contract requires it.

### Before Coding

1. Search for similar implementation
2. Reuse nearby patterns
3. Confirm the route and `websiteId` behavior
4. Check whether GraphQL operations already exist
5. Keep changes minimal and scoped to the feature

## Validation

- `pnpm nx lint content_ui` (when a lint target is defined)
- `pnpm nx build content_ui`
- Create or edit a CMS post with blank paragraphs and a Tab-indented paragraph,
  save it, reopen it, and verify the structure remains visible.
- Directly select a CMS file custom field and verify a file no larger than
  630 MiB is accepted while a larger file is rejected.

### Common Mistakes

- Using stale paths copied from another plugin.
- Adding one-off GraphQL documents while equivalent operations already exist.
- Building a list with plain `Table` when `RecordTable` cursor behavior is
  expected.
- Forgetting `websiteId` in CMS routes, variables, links, or drawer props.
- Adding shared CMS UI to `src/widgets` instead of `src/modules/cms/shared`.
- Changing backend schema or API assumptions from the UI layer.
- Writing React or TypeScript tutorial content in this file instead of local rules.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-13` — Restore structured post content

- **Summary:** Switched CMS posts to the shared editor's JSON mode and restored
  saved blank paragraphs and Tab indentation from the embedded editor document.
- **Affected areas:** `src/modules/cms/posts/PostPreview.tsx`, post form helpers,
  submission hook, and block-structure serialization utility
- **Contracts changed:** None

### `2026-08-11` — Increase custom-field upload limit

- **Summary:** Raised the CMS custom-field file upload ceiling from 20 MiB to
  630 MiB, routed large files through chunked upload, and synchronized its
  helper text.
- **Affected areas:** `src/modules/cms/posts/CustomFieldInput.tsx`
- **Contracts changed:** None
