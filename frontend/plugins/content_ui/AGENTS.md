# `content_ui` Plugin Guide

## Identity

- **Plugin:** `content`
- **Project:** `content_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/content_ui`
- **Last synchronized:** `2026-10-20`

## Scope

### Owns

- CMS and Web Builder routes, navigation, pages, GraphQL documents, client
  state, translations, and user feedback.

### Does not own

- Backend CMS data, GraphQL contracts, core UI primitives, or other plugins.

## Current Capabilities

- Provides CMS content, category, page, menu, custom-field, and media workflows.
- Shows the full parent path for post category choices, including categories
  with the same name under different parents.
- Provides Web Builder configuration and editing surfaces.
- Preserves blank lines and Tab-indented block structure when CMS posts are
  saved and reopened in the post editor.
- Allows individual CMS custom-field file uploads up to 650 MiB through the
  platform's chunked-upload contract.
- Development Rspack serving preserves CMS image asset handling and ignores
  generated dependency/cache/output folders to keep local file watchers bounded.

## Architecture

| Area          | Path                                                  | Responsibility                                                                          |
| ------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| App sidebar | `frontend/plugins/content_ui/src/Sidebar.tsx` | `ContentSidebar`: the plugin's whole app sidebar, rendered by the `./content` entry through `AppLayout` |
| Configuration | `frontend/plugins/content_ui/src/config.tsx`          | Registers content navigation and modules.                                               |
| Dev server    | `frontend/plugins/content_ui/rspack.config.ts`        | Configures image assets, Module Federation development serving, and watch ignore rules. |
| CMS           | `frontend/plugins/content_ui/src/modules/cms`         | Owns CMS routes and feature UI.                                                         |
| Web Builder   | `frontend/plugins/content_ui/src/modules/web-builder` | Owns Web Builder UI.                                                                    |
| Pages         | `frontend/plugins/content_ui/src/pages`               | Provides route-level pages.                                                             |
| Codegen       | `frontend/plugins/content_ui/codegen.ts`              | Validates documents against the composed schema and generates the gitignored `src/gql`. |
| Agent SDL     | `frontend/plugins/content_ui/schema/agent.graphql`    | Declares erxes-private agent_api fields content selects; not in the composed schema.    |

## Contracts

### Provides

- Module Federation exposes `./config` and `./content`.
- Routes mounted under `/content`, including `/content/cms` and
  `/content/web-builder`.

### Consumes

- Public `erxes-ui` and `ui-modules` APIs.
- Content plugin GraphQL APIs through Apollo Client.
- The composed gateway schema from `gateway:schema:compose` (every backend's
  printed subgraph: content and core included), consumed only at codegen time.
- erxes-private agent_api `agentPostizTenantEnabled`, declared for codegen only
  in `schema/agent.graphql` because that backend is not in this repository.

## Data and State

- Apollo Client owns server state, Jotai owns shared client state, and local
  React state owns component-local interactions.

## Local Invariants

- The plugin owns its whole app sidebar. `src/modules/cms/Main.tsx` (the `./content`
  expose) wraps its routes in `erxes-ui` `AppLayout` (`id="content"`) with
  `ContentSidebar`. Core-ui draws only the top `CoreTab` bar; `navigationGroup` in
  `src/config.tsx` supplies just the tab name, icon and `defaultPath` and takes
  no `content`/`subGroup`.
- Page-level side menus render `Sidebar.Panel` from `erxes-ui`, which keeps its own open state (`sidebarPanelOpenState`), separate from the plugin's `AppLayout` sidebar. The panel sits beside the page header, never under it: the page is a row of the panel and a column holding the header and content. The panel passes its heading as `label`, which renders a 40px title row with optional `actions` and the collapse toggle on the right, level with the page header; when collapsed, the toggle moves into the header's panel slot. Do not add a second heading or an in-panel `Sidebar.PanelTrigger` row. Keep `<Sidebar collapsible="none">` for sidebars inside sheets and dialogs. Every `CmsSidebar` page and `CmsLayout` render the panel beside their page header.
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
- Embedded CMS post documents are accepted only when every block has a
  non-empty ID, schema-valid props and content, and recursively valid child
  arrays; malformed metadata must fall back to legacy HTML parsing.
- The CMS post editor adapter composes the public `useBlockEditor` and
  `BlockEditor` APIs, restores embedded structure on load, and emits public HTML
  plus the non-lossy editor document before the existing submission boundary.
- CMS post serialization must invalidate stale asynchronous HTML output after
  edits, external document replacement, and editor unmount.
- Post form category option labels show the full parent path, while option
  values remain category IDs and multiple selections remain available.
- Asynchronous legacy HTML restoration must capture a revision before parsing
  and must not replace editor blocks after a newer user edit.
- Keep hooks, GraphQL documents, states, constants, and types near the feature
  they support.
- Every file under `src` is reachable through imports from `config.tsx`,
  `modules/cms/Main.tsx`, or `main.ts`, except tests and generated `src/gql`.
  `tsconfig.app.json` also type-checks files that nothing imports. Delete a
  file once nothing imports it.
- Pages reuse the posts `MediaSection`: `IPageFormData` keeps the five
  `MediaFormData` fields with the same types. React Hook Form's
  `UseFormReturn` is invariant, so `PageSidebarPanel` casts its form at that
  prop, as `AddPostForm` does for its columns.
- Two more casts stay at external type boundaries, each with a one-line reason:
  - `createPortal` results are cast to React 18's `ReactPortal`. pnpm links
    `@types/react-dom` to React 19 types, but the runtime is React 18.
  - `CmsPostEditor` casts its `BLOCK_SCHEMA` blocks to `useBlockEditor`'s
    `initialContent` type. That type uses the default BlockNote schema, while
    the editor itself is built with `BLOCK_SCHEMA`.

### UI Conventions

- Published CMS posts check `agentPostizTenantEnabled` before offering the Postiz sheet. Disabled or unavailable Postiz access keeps the normal CMS publish path; enabled tenants retain the sharing sheet and its CMS-only action.
- Ordinary published CMS posts offer a shared-erxes publish sheet with CMS-only fallback and a separate social queue result. Keep a saved CMS ID and immutable request across an uncertain share response; never recreate the CMS post on a social retry. Delivery history and reviewed failed-channel retries live in `posts/postiz`. The delivery list does not poll; its Refresh status button calls `cmsPostizRefresh` and writes the result into the `cmsPostizDeliveries` cache.
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
- Post edits refetch only the CMS post detail, cursor list, and translations.
  Never use `refetchQueries: 'all'` for CMS saves: it can execute another
  plugin's dormant query without required variables and reject a successful save.
- GraphQL operations should live in the feature's `graphql` folder when one
  exists.
- Name GraphQL queries and mutations with the plugin or module prefix plus the
  operation purpose, such as `cmsPageList`; operation names must be unique.
  Codegen rejects a name used by two documents with different bodies.
- When renaming an operation, update every `refetchQueries` string that names
  it. Post form selectors use `CmsPostCategories` and `CmsPostTags`; the
  `'CmsCategories'` and `'CmsTags'` refetch strings target the category and
  tag pages.
- Search `src/modules/cms/graphql` before adding an operation; this plugin still
  has shared legacy CMS queries and mutations.
- Codegen validates every document under `src` except tests against the
  composed gateway schema (`backend/gateway/generated/schema.graphql`) plus
  `schema/agent.graphql`. `build` and `serve` depend on the `codegen` target,
  which depends on `gateway:schema:compose`. A content, core or other in-repo
  field needs no local copy; fix a validation error in the document, or in the
  backend that owns the field. Only erxes-private agent_api fields belong in
  `schema/agent.graphql`.
- Codegen drops `${...}` interpolation text, so interpolated field strings are
  invisible to it. Share fields through a local `gql` fragment spread by name,
  such as `CmsSocialDeliveryFields`.
- Test files are excluded from codegen because they define mock documents that
  reuse real operation names.
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
- Do not replace existing cursor pagination with offset pagination unless the
  backend contract requires it.

### Before Coding

1. Search for similar implementation
2. Reuse nearby patterns
3. Confirm the route and `websiteId` behavior
4. Check whether GraphQL operations already exist
5. Keep changes minimal and scoped to the feature

## Validation

- `npx tsc -p frontend/plugins/content_ui/tsconfig.app.json --noEmit | rg content_ui`
  prints nothing. The shared libraries' own errors are filtered out.
- `pnpm nx lint content_ui`
- `pnpm nx run gateway:schema:compose --parallel=2` - composes every backend's
  printed schema.
- `pnpm nx run content_ui:codegen --skip-nx-cache`
- `pnpm nx build content_ui`
- `pnpm nx test content_ui`
- Create or edit a CMS post with blank paragraphs and a Tab-indented paragraph,
  save it, reopen it, and verify the structure remains visible.
- Directly select a CMS file custom field and verify a file no larger than
  650 MiB is accepted while a larger file is rejected.

### Common Mistakes

- Using stale paths copied from another plugin.
- Adding one-off GraphQL documents while equivalent operations already exist.
- Building a list with plain `Table` when `RecordTable` cursor behavior is
  expected.
- Forgetting `websiteId` in CMS routes, variables, links, or drawer props.
- Changing backend schema or API assumptions from the UI layer.
- Calling Rspack directly, which skips codegen and leaves `src/gql/` stale.
  `pnpm nx build`, `pnpm nx serve`, and `pnpm dev:uis` regenerate it.
- Writing React or TypeScript tutorial content in this file instead of local rules.
