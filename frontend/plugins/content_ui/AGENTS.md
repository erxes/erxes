# `content_ui` Plugin Guide

## Identity

- **Plugin:** `content`
- **Project:** `content_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/content_ui`
- **Last synchronized:** `2026-11-09`

## Scope

### Owns

- CMS and Web Builder routes, navigation, pages, widgets, GraphQL documents,
  client state, translations, and user feedback.

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
- CMS tags, categories, menus, custom post types, custom field groups and
  fields, CMS websites and Web Builder projects create and edit in the app
  side panel (`?panel=/detail/content:<type>/<id|new>`) instead of Sheets.
- CMS posts have no side panel: the title click and more-menu Edit open the
  full-page editor directly. CMS pages open a read-only overview in the app
  side panel with an Edit button that opens the full-page editor; creating
  either still opens the full-page editor.
- The app sidebar lists CMS websites under a Content Management group
  (`ContentSubNavigation`): each website collapses to its sections (posts with
  the website's custom post types nested under them for the active website,
  pages, categories, tags, menus, custom fields, custom post types, settings), the group action adds a CMS. Pages no
  longer render a second CMS side menu.
- Side panel forms use the contacts row layout (`ContentPanelFormField`,
  `ContentPanelLanguageRow`, bordered `CONTENT_PANEL_INPUT_CLASS_NAME`, field
  icons) inside ui-modules `PanelFormLayout`, centered at `max-w-2xl`; missing
  records show a not-found or error state. Every panel view (new forms
  included) wraps its fields in `CONTENT_PANEL_FIELDS_CLASS_NAME`, which drops
  input, select, combobox, multi-select and editor borders and adds a hover
  background, like contacts' detail fields; a multi-select's search input
  grows to the full width and the hover covers its whole box.
- Saved records are titled by name through each panel's `useHeading` and have
  an expand button (`detailPath`): pages open their full-page editor;
  tags, categories, menus, custom post types, field groups and fields open
  `/content/cms/:websiteId/records/:recordType/:recordId`; websites and Web
  Builder projects open `/content/records/:recordType/:recordId`. That record
  page (`pages/cms/RecordDetailPage.tsx`) has a breadcrumb header with the
  record actions, a resizable Detail column (`ContentRecordColumn`) and the
  Activity tab.
- CMS tables show row skeletons only while empty and use thin scrollbars
  (`CONTENT_RECORD_TABLE_SCROLL_CLASS_NAME`). Every table's `more` column is
  33px wide.

## Architecture

| Area          | Path                                                                   | Responsibility                                                                                                                                                      |
| ------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App sidebar   | `frontend/plugins/content_ui/src/Sidebar.tsx`                          | `ContentSidebar`: the plugin's whole app sidebar, rendered by the `./content` entry through `AppLayout`                                                             |
| Configuration | `frontend/plugins/content_ui/src/config.tsx`                           | Registers content navigation and modules.                                                                                                                           |
| Dev server    | `frontend/plugins/content_ui/rspack.config.ts`                         | Configures image assets, Module Federation development serving, and watch ignore rules.                                                                             |
| CMS           | `frontend/plugins/content_ui/src/modules/cms`                          | Owns CMS routes and feature UI.                                                                                                                                     |
| Web Builder   | `frontend/plugins/content_ui/src/modules/web-builder`                  | Owns Web Builder UI.                                                                                                                                                |
| Pages         | `frontend/plugins/content_ui/src/pages`                                | Provides route-level pages.                                                                                                                                         |
| Widgets       | `frontend/plugins/content_ui/src/widgets`                              | Provides plugin widget exports.                                                                                                                                     |
| Record panel  | `frontend/plugins/content_ui/src/widgets/record-panel/RecordPanel.tsx` | `./recordPanel` remote mapping each `content:*` content type to its panel views (new, title, actions, detail) plus shared activity.                                 |
| Panel kit     | `frontend/plugins/content_ui/src/modules/cms/shared/side-panel`        | Content types, `useContentPanel`/`useContentPanelDraft`/`useContentPanelWebsiteId`, panel body/footer/record state, remove action, and the read-only page overview. |
| Navigation    | `frontend/plugins/content_ui/src/modules/ContentSubNavigation.tsx`     | CMS website list with collapsible sections in the app sidebar.                                                                                                      |
| Record page   | `frontend/plugins/content_ui/src/pages/cms/RecordDetailPage.tsx`       | A record's own page opened from the panel's expand button.                                                                                                          |

## Contracts

### Provides

- Module Federation exposes `./config`, `./content`, and `./recordPanel`
  (named `RecordPanel` export).
- `widgets.recordPanels` entries for every `CONTENT_PANEL_CONTENT_TYPES` value
  (`content:cmsTag`, `content:cmsCategory`, `content:cmsMenu`,
  `content:cmsCustomType`, `content:cmsFieldGroup`, `content:cmsCustomField`,
  `content:cmsWebsite`, `content:web`, `content:cmsPage`)
  with `properties: false`, `draftTitle: true` and, for every type,
  `detailPath` from `getContentRecordDetailPath`.
- Routes mounted under `/content`, including `/content/cms` and
  `/content/web-builder`.

### Consumes

- Public `erxes-ui` and `ui-modules` APIs, including the side panel API
  (`useSidePanel`, `useSidePanelDraft`, `IRecordPanelProps`, `NEW_RECORD_ID`,
  `PanelField`, `ActivityLogs`).
- Content plugin GraphQL APIs through Apollo Client.

## Data and State

- Apollo Client owns server state, Jotai owns shared client state, and local
  React state owns component-local interactions.

## Local Invariants

- Development `rspack.config.ts` watch ignores `__tests__` directories and
  `*.spec.*` / `*.test.*` files with TS, TSX, JS, or JSX extensions.

- The plugin owns its whole app sidebar. `src/modules/cms/Main.tsx` (the `./content`
  expose) wraps its routes in `erxes-ui` `AppLayout` (`id="content"`) with
  `ContentSidebar`. Core-ui draws only the top `CoreTab` bar; `navigationGroup` in
  `src/config.tsx` supplies just the tab name, icon and `defaultPath` and takes
  no `content`/`subGroup`.
- CMS navigation lives in the app sidebar (`ContentSubNavigation`); CMS pages render no `Sidebar.Panel` side menu. Keep `<Sidebar collapsible="none">` for sidebars inside sheets and dialogs.
- This plugin is the Module Federation remote `content_ui`.
- Dev server port is `3003` from `project.json`.
- Public exposes are `./config`, `./content`, and `./recordPanel` in
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
- A site's default language comes from `getCmsDefaultLanguage` in
  `src/modules/cms/shared/utils.ts`: the stored `language`, then the first entry
  of `languages`, then `en`. It is empty until the CMS list has loaded, so editors
  wait for it. `content_api` resolves it the same way; never add a local
  `|| 'en'` fallback.
- Every CMS editor opens in `getInitialCmsLanguage`, so a language left over from
  another site is ignored. Records go through `useRecordInDefaultLanguage`: when
  the site has no stored `language`, a saved row in the implied default fills the
  form, matching what `content_api` reads and writes. A row that arrives late
  keeps dirty fields.
- Saving follows `savedRowLoad` from `getSavedRowLoad` in
  `shared/hooks/useCmsTranslation.ts`. While the CMS settings or a no-default
  site's rows are loading, or after that load fails, `isBlocked` is on: the save
  handler refuses and the save button is disabled, without a "Saving" label. A
  failed load also shows `CmsSavedRowLoadError` with a retry. `MenuPanel`
  renders a spinner instead of its form while blocked and only the retry error
  after a failed load, because `PanelFormLayout` has no disabled prop. While blocked, never
  keep a copy of the default language's text, because it may be stale stored text.
- Post and page edit payloads always send the gallery (`images`/`pageImages`),
  `documents`, and `attachments` lists, even when empty: the backend applies
  edits with `$set`, so an omitted list keeps its removed files.
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
  edits, external document replacement, and editor unmount. Every post save
  (button and Cmd/Ctrl+S) awaits `flushCmsEditors()` from
  `posts/utils/editorFlush.ts` so a pending debounced editor output reaches the
  form before `handleSubmit`; an in-flight ref ignores repeated saves until the
  current one settles.
- CMS routes are keyed by `clientPortalId` (the `websiteId` param), so each
  CMS must use its own real client portal. The CMS side panel
  (`WebsitePanel.tsx`) has no default portal, rejects unknown portals and disables portals bound to another CMS;
  an edit that keeps a CMS's stored portal is allowed so content never moves.
- The page form schema accepts only `active`/`inactive` status, while table and
  bulk edits store `published`/`draft`/`scheduled`; the page editor maps stored
  values and null attachment fields on load. Page save reports validation
  failures with a toast instead of silently doing nothing.
- Post form category option labels show the full parent path, while option
  values remain category IDs and multiple selections remain available.
- `LanguageSelector` drops the empty value Radix Select emits when the current
  language has no matching option. Passing it on loops with the editor's
  language effect and starves route changes.
- Asynchronous legacy HTML restoration must capture a revision before parsing
  and must not replace editor blocks after a newer user edit.
- `src/widgets` is for plugin widget exports, not general shared CMS UI.
- Keep hooks, GraphQL documents, states, constants, and types near the feature
  they support.
- Record create/edit forms live in the app side panel, never in a Sheet or a
  page-local open state. Each type exposes one `IContentPanelViews` object
  (`addLabel`, `editLabel`, optional `New`, `Detail`, optional `Actions`) that
  `RecordPanel` maps by content type; add a type by adding a content type
  constant and a views object, not by branching in `RecordPanel`. Pages open
  panels only through `useContentPanel(contentType)`: Add calls
  `openDraft({ clientPortalId })`, row Edit calls `openDetail(id)`.
- Panel drafts read `clientPortalId` from the draft defaults, falling back to
  the `/content/cms/:websiteId` route. A successful create replaces the draft
  with the record's detail (`openDetail(id, { replace: true })`); a successful
  edit closes the panel, matching the former Sheets. Mutations refetch the
  list queries by operation name so lists update without a reload.
- Panel details load the record by id (tag, category, custom post type, custom
  field group, post, page) and take `clientPortalId` from the record. Menu
  detail needs `clientPortalId`, so it uses the route website id. CMS
  websites and Web Builder projects resolve the record from their cached list
  queries.
- A custom field is stored inside its group, so its panel id is
  `<groupId>~<fieldId>` (`getCustomFieldPanelId`) and every field save, add,
  or delete is a group edit. A new field's draft carries `groupId`.
- Panel forms pass `control` explicitly to `Form.Field`; never rely on
  `useFormContext` inside this remote.
- The CMS panel (`WebsitePanel.tsx`) and the web project panel
  (`web-builder/components/WebPanel.tsx`) are laid out like the contacts
  customer panel: `ui-modules` `PanelFormLayout` with one `PanelFormRow` per
  short field (label left, `PANEL_INPUT_CLASS_NAME` inputs and `Select`s
  right, error below), wide fields (description, template grid, thumbnail
  uploader, custom domains) as full-width blocks with the label above, and the
  shared Cancel/Save footer. Both forms validate through `zodResolver`; the
  web project schema trims the name and requires portal, template type and
  template.
- The page panel is a read-only overview and posts have no panel; editing content stays in the
  full-page editors so autosave, translations, media, and the BlockNote
  document rules above keep applying.
- Custom-field choices use `getValidCustomFieldOptions` when saved and rendered.
  Ignore blank and non-string choices from JSON field definitions; preserve valid
  stored values and their order so existing selections continue to match.

### UI Conventions

- The post editor header (`posts/components/add-post-form/AddPostHeaderActions.tsx`, shared by the add and edit pages) stays compact and fits the 40px `PageHeader`. The status `Select` (published, draft, scheduled, each with a colored dot) and the save button always sit together at the right end, so the select never shifts when the status changes. For published or scheduled posts the publish or scheduled `DateTimeInput` and an Auto Archive button (its archive date once enabled, opening a `Popover` with the auto-archive switch and archive date) appear to their left, and the "Unsaved changes" dot is leftmost. Choosing published fills an empty publish date with now.
- The post editor title is a large borderless `Input` (its label is screen-reader only) with a language badge when editing a non-default language; the content label is screen-reader only too. `components/PostWritingStats.tsx` shows the word count and reading time (200 words a minute) under the editor, read from the content HTML's text. The header shows an "Unsaved changes" dot while the form is dirty, and Ctrl+S / Cmd+S saves like the save button (blocked while saving or while saving is blocked). Their strings (`words-count`, `min-read`, `unsaved-changes`, `save-shortcut`) live in `backend/gateway/src/locales/{en,mn}/content.json`.
- The post sidebar Content tab (`posts/components/add-post-form/ContentTab.tsx`) groups fields into `SidebarSection`s: General (language, type, URL field, a 4-row short description), Organize (category, tag, and Featured as a label/switch row), then a borderless collapsible SEO section that starts with `SeoSearchPreview`, a search-result preview from the SEO title and description falling back to the post title and short description, with the CMS domain and slug as the URL line. SEO stays hidden in translation mode.
- Post date and time fields (`posts/components/add-post-form/DateTimeInput.tsx`) use `erxes-ui` `DatePicker` with `TimeField` + `DateInput` (24-hour, `@internationalized/date` `Time`), like other plugins' schedule fields. Never use a native `<input type="time">` or `type="date"`.
- The CMS list at `/content/cms` shows cards (`CmsWebsiteCard` in `src/modules/cms/shared/components/CmsWebsiteCard.tsx`) or a standard `RecordTable` laid out like the contacts table (`CmsWebsitesRecordTable`, table id `content_cms_websites_table`, `m-3`): a `more` menu (Manage opens the CMS side panel, Posts opens the CMS), an avatar, a name `RecordTableInlineCell.Anchor` that opens the CMS, then description, domain, languages and created columns. The list/grid view toggle sits in the page header just left of Add CMS, with no separate sub-header or result count; `Cms.tsx` passes `contentClassName` to `CmsLayout` so the table fills the page instead of scrolling inside padding. Keep the cards minimal and on theme tokens: a bordered `bg-background` item whose hover changes only the border, a neutral `bg-accent` initial mark, the name with a lock icon when restricted, the domain when set, the description, the languages (default first) and created date as muted text, and an icon-only Manage action that opens the CMS side panel. The card opens through a native `<button>` stretched over it, with the actions raised above it; never use `role="button"` on the card. `CMS_WEBSITE_COLUMNS` stays at module level with cell components that read handlers from `CmsWebsitesTableContext`. No banners, gradients, accent colors or hover motion.
- Published CMS posts check `agentPostizTenantEnabled` before offering the Postiz sheet. Disabled or unavailable Postiz access keeps the normal CMS publish path; enabled tenants retain the sharing sheet and its CMS-only action.
- Ordinary published CMS posts offer a shared-erxes publish sheet with CMS-only fallback and a separate social queue result. Keep a saved CMS ID and immutable request across an uncertain share response; never recreate the CMS post on a social retry. Delivery history and reviewed failed-channel retries live in `posts/postiz`. The delivery list does not poll; its Refresh status button calls `cmsPostizRefresh` and writes the result into the `cmsPostizDeliveries` cache.
- Match existing CMS page structure: page header, content area, and the app
  side panel for record create and edit.
- Use `erxes-ui` and `ui-modules` components before creating new primitives.
- Use `@tabler/icons-react` for icons.
- Use `RecordTable` for cursor-paginated list pages.
- Use the app side panel for record create and edit flows; reserve dialogs
  for confirmations and pickers.
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

- Side panel CRUD page:
  `src/modules/cms/categories/Categories.tsx` with
  `src/modules/cms/categories/CategoryPanel.tsx`

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

- CMS list filters (posts, categories, tags, pages) render the filter popover trigger as the first child of `Filter.Bar`, so the filter icon stays fixed while selected filter chips appear after it; total counts stay last.

## Validation

- `pnpm nx lint content_ui` (when a lint target is defined)
- `pnpm nx build content_ui`
- `pnpm nx test content_ui`
- Open a CMS editor with a dropdown custom field containing empty or
  whitespace-only choices and verify the editor renders and valid choices remain
  selectable.
- Create or edit a CMS post with blank paragraphs and a Tab-indented paragraph,
  save it, reopen it, and verify the structure remains visible.
- Directly select a CMS file custom field and verify a file no larger than
  650 MiB is accepted while a larger file is rejected.
- On CMS tags, categories, menus, custom types and custom fields, click Add:
  the side panel opens a draft, Save creates the record, the panel switches to
  its detail and the list updates; edit from the row menu, save, and confirm
  the panel closes and the row changes; delete from the panel header menu.
- Click a CMS post title: the full-page editor opens. Click a CMS page title:
  the side panel shows its overview, and Edit opens the full-page editor.
- Add and edit a CMS website and a Web Builder project from their pages and
  confirm the cards update.

### Common Mistakes

- Using stale paths copied from another plugin.
- Adding one-off GraphQL documents while equivalent operations already exist.
- Building a list with plain `Table` when `RecordTable` cursor behavior is
  expected.
- Forgetting `websiteId` in CMS routes, variables, links, or side panel props.
- Adding shared CMS UI to `src/widgets` instead of `src/modules/cms/shared`.
- Changing backend schema or API assumptions from the UI layer.
- Writing React or TypeScript tutorial content in this file instead of local rules.
