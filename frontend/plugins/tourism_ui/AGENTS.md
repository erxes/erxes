# `tourism_ui` Plugin Guide

## Identity

- **Plugin:** `tourism`
- **Project:** `tourism_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/tourism_ui`
- **Last synchronized:** `2026-11-06`

## Scope

### Owns

- Tourism frontend routes, navigation, PMS and TMS modules, main tourism route composition, pages, widgets, assets, hooks, utilities, and search providers.

### Does not own

- Tourism backend persistence or GraphQL resolvers, core UI primitives, shared libraries, or another plugin's source.

## Current Capabilities

- Runs as the `tourism_ui` Module Federation remote on port `3011`.
- Registers tourism navigation for PMS and TMS.
- Exposes PMS, PMS settings, TMS, TMS settings, tourism main routes, plugin config, and the record panel through Module Federation.
- TMS branch records open in the app side panel (`?panel=/detail/<contentType>/<id|new>`): amenities, tour categories, elements, custom tour types, custom field groups and custom fields create, edit and delete there; orders show and edit their booking there.
- Tours are created and edited in the side panel: the Detail tab is a grouped row form (general, content, duration and dates, crew, pricing, more info); Bookings and Customers are their own top-level panel tabs (`tabs` in the `tourism:tmsTour` record panel config, drawn through the `tab` view), and the Properties tab edits the tour's custom field groups.
- Clicking an itinerary name opens a read-only overview in the side panel; the overview Edit and the row ⋯ Edit both open the existing itinerary builder sheet. Row ⋯ Duplicate opens a `tourism:tmsItineraryDuplicate` panel (name and color) that opens the new itinerary's overview after saving. Itinerary creation, tour duplication and tour group add stay as sheets.
- TMS branch cards open through a thumbnail link named after the branch, with or without a logo.
- Saved-record panels follow the contacts detail look inside the plugin: each panel's `useHeading` hook names the record, which titles the panel (falling back to the edit label) and heads the record page's overview column with an avatar and the name; bookings and itinerary duplicates have no heading. Panel views render in a centered `max-w-2xl` column (like contacts' new-record form when expanded), inputs use `TOURISM_PANEL_INPUT_CLASS_NAME` (bordered panel input), and so does every other panel control: selects, `MultipleSelector` and `Textarea` (with `h-auto` and a min height; both stay `block` fields because `PanelFormRow` pads empty inputs for its icon), and the `className` props of `SelectTourCategory` and `RHFDatePicker`; every panel view (new forms included) wraps them in `TOURISM_PANEL_FIELDS_CLASS_NAME`, which drops input, select, combobox and editor borders and adds a hover background like contacts' detail fields; `TourismPanelFormField` picks a row icon from the field name.
- `pages/tms/RecordDetailPage.tsx` is a record's own page laid out like a contact's: a `PageHeader` breadcrumb (TMS › branch · section › record title) with the record's actions, then a resizable left column (`TourismRecordColumn`: drag or arrow keys, 288–720px, headed by `TourismPanelIdentity`) holding Detail beside ui-modules `RecordSidePanel.Tabs` (collapsed layout) for Properties, the `TOURISM_PANEL_TABS` tabs and Activity, all drawn by the plugin's own `RecordPanel` views. The ui-modules split overview is fixed-width, so the plugin draws its own split. A `SidePanelNavigatorContext` makes close/back return to the branch section list; related records still open in the side panel. `pages/tms/RecordNewPage.tsx` is the full-page draft: the same breadcrumb over the type's `new` view; its navigator sends a saved record to that record's page and cancel back to the section list. A field draft needs its group: without a `groupId` in the draft (after a reload or from a link) the page returns to the section list. Draft defaults come from the side panel draft atom, falling back to the route branch after a reload. The page also provides `TourismRecordPageContext` (`side-panel/tourismRecordPage.ts`), so `TourismPanelRemoveAction` renders an outline Delete button in the page header instead of the side panel's ⋮ menu.
- Development Rspack serving ignores generated dependency/cache/output folders to keep local file watchers bounded.

## Architecture

| Area              | Path                                                                                | Responsibility                                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| App sidebar       | `frontend/plugins/tourism_ui/src/Sidebar.tsx`                                       | `TourismSidebar`: the plugin's whole app sidebar, rendered by the `./tourism` entry through `AppLayout`                                                      |
| Sub navigation    | `frontend/plugins/tourism_ui/src/modules/TourismSubNavigation.tsx`                  | TMS branches with their sections and PMS branches, shown under PMS/TMS in the app sidebar                                                                    |
| Runtime           | `frontend/plugins/tourism_ui/src/main.ts`                                           | Starts the tourism UI remote.                                                                                                                                |
| Federation config | `frontend/plugins/tourism_ui/module-federation.config.ts`                           | Exposes config, PMS, TMS, settings, and tourism route entries.                                                                                               |
| Dev server config | `frontend/plugins/tourism_ui/rspack.config.ts`                                      | Module Federation development serving and watch ignore rules.                                                                                                |
| Plugin config     | `frontend/plugins/tourism_ui/src/config.tsx`                                        | Registers navigation, modules, and search providers.                                                                                                         |
| PMS module        | `frontend/plugins/tourism_ui/src/modules/pms`                                       | Owns PMS route composition and UI.                                                                                                                           |
| TMS module        | `frontend/plugins/tourism_ui/src/modules/tms`                                       | Owns TMS route composition and UI.                                                                                                                           |
| Main module       | `frontend/plugins/tourism_ui/src/modules/main`                                      | Owns shared tourism route composition.                                                                                                                       |
| Pages             | `frontend/plugins/tourism_ui/src/pages`                                             | Provides route-level PMS and TMS pages.                                                                                                                      |
| Widgets           | `frontend/plugins/tourism_ui/src/widgets`                                           | Provides plugin widget exports.                                                                                                                              |
| Record panel      | `frontend/plugins/tourism_ui/src/widgets/record-panel/RecordPanel.tsx`              | `RecordPanel`: maps each tourism content type to its side panel views (title, new, detail, actions, activity).                                               |
| Panel kit         | `frontend/plugins/tourism_ui/src/modules/tms/side-panel`                            | Content types, `useTourismPanel`/`useTourismPanelBranch`/`useTourismPanelDraft`, row form fields and language row, record state, overview and remove action. |
| Custom fields     | `frontend/plugins/tourism_ui/src/modules/tms/branch-detail/dashboard/custom-fields` | Tour type, field group and field forms, data hooks and panels used by `CustomFieldsPage`.                                                                    |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./pms`, `./tms`, `./tourism`, and `./recordPanel` (named `RecordPanel`).
- `widgets.recordPanels` in `src/config.tsx` registers `tourism:tmsTour`, `tourism:tmsOrder`, `tourism:tmsItinerary`, `tourism:tmsItineraryDuplicate` (id is the source itinerary), `tourism:tmsElement`, `tourism:tmsAmenity`, `tourism:tmsCategory`, `tourism:tmsTourType`, `tourism:tmsFieldGroup` and `tourism:tmsCustomField` (draft title; only `tourism:tmsTour` has a Properties tab and declares `tabs` from `TOURISM_PANEL_TABS` — Pricing Info (`pricing`, `labelKey: 'pricing-info'`), More Info (`media`, `labelKey: 'more-info'`), Bookings (`labelKey: 'bookings'`) and Customers, all `after: 'properties'` — drawn through the `tab` view; every saved-record type except `tourism:tmsItineraryDuplicate` sets `detailPath` (`getTourismRecordDetailPath`), so the panel's expand button opens `/tourism/tms/branches/:branchId/records/:recordType/:recordId`; types with a `New` view (`TOURISM_NEW_RECORD_TYPES`) also set `newPath` (`getTourismRecordNewPath`), so a draft's expand button opens `/tourism/tms/branches/:branchId/records/:recordType/new`).
- Frontend navigation paths under `tourism/pms` and `tourism/tms` registered from `src/config.tsx`.

### Consumes

- Public UI APIs from `erxes-ui` and `ui-modules`, including the side panel API (`useSidePanel`, `useSidePanelDraft`, `NEW_RECORD_ID`, `IRecordPanelProps`, `PanelField`, `ActivityLogs`).
- Tourism API contracts through the plugin's local GraphQL documents and hooks.
- React Router host mounting contracts from core UI Module Federation.

## Data and State

- Apollo Client owns server state where tourism feature hooks use GraphQL.
- React Hook Form, local React state, hooks, and utilities remain scoped to tourism feature modules.
- Static assets are owned under `src/assets`.

## Local Invariants

- The plugin owns its whole app sidebar. `src/modules/main/Main.tsx` (the `./tourism`
  expose) wraps its routes in `erxes-ui` `AppLayout` (`id="tourism"`) with
  `TourismSidebar`. Core-ui draws only the top `CoreTab` bar; `navigationGroup` in
  `src/config.tsx` supplies just the tab name, icon and `defaultPath` and takes
  no `content`/`subGroup`.
- Empty and loading states inside panel views and tabs use `TourismPanelEmpty` and `TourismPanelLoading` from `side-panel/TourismPanelLayout.tsx` (fixed vertical padding). Never centre them with `h-full`: tab content sits in a `ScrollArea` with no fixed height, so they would stick to the tab bar.
- A saved tour is edited through `TourPanelEditForm` with a `section`: Detail shows general information, content, duration, dates and crew; the `pricing` tab shows pricing options; the `media` tab shows thumbnail, images, attachments and the info sections. Every section loads the whole tour and saves the whole form, and a validation error on a field hidden in another section shows a toast with its message. New tours keep every section in one form (`section="all"`). Dates and crew use the panel row layout too: `TourDateSchedulingField` renders flexible/group switches and date pickers as `PanelFormRow`s (switch labels drop their parenthetical hint, kept as the `title`), and `TourGuidesField` lists crew as role · member · remove rows with a ghost add button, without cards, uppercase labels or an empty-state sentence. `TourPanelSection` titles are muted with no divider; the first Detail section has no title; translatable labels show nothing in the main language and a small language icon with the code while a translation is edited, instead of a `(mn)` suffix; select and combobox chevrons stay hidden until hover or keyboard focus, and always show on devices without hover, `toShortPanelLabel` drops parenthetical hints such as `(days)`, and the content editor grows with its text (`min-h-16`, `max-h-80`).
- Draft form values are kept in `tourismDraftValuesState` (`side-panel/useTourismDraftValues.ts`) with a scope (route branch, draft `groupId` and `parentId`) while a new-record form is open, and only a form with the same scope restores them, so expanding a draft to its full page keeps what was typed. The hook reads the saved values once through the Jotai store and only writes afterwards, so typing does not re-render the form. `useTourismPanel` clears a type's values on `openDraft`, on a saving `openDetail(..., { replace: true })`, on `cancelDraft` and on `closePanel`, and `RecordNewPage`'s navigator clears them before opening the saved record and when returning to the list, so Back never reopens a filled draft. Every `New` form calls `useTourismDraftValues` after its own form resets; `side-panel/__tests__/useTourismDraftValues.test.tsx` covers restore, saving and clearing.
- There is no page-level second sidebar. Under PMS and TMS, `TourismSubNavigation` adds a group to the app sidebar, like the sales boards: on `/tourism/tms` each TMS branch is a collapsible item whose children link to `branches/:branchId?activeTab=<section>`; on `/tourism/pms` each PMS branch links to `/tourism/pms?branchId=<id>`, which `PmsList` opens in its edit sheet and clears on close. Keep `<Sidebar collapsible="none">` for sidebars inside sheets and dialogs. `BranchDetailView` takes the branch page header as `header` and renders it in its loading and not-found states too.
- Record details and small record forms open in the side panel through `useTourismPanel(contentType)`; do not add new detail or edit `Sheet`s for them. Every new content type is added to `TOURISM_PANEL_CONTENT_TYPES` and `RecordPanel` together.
- Panels resolve the branch from the draft `branchId`, then the record's `branchId`, then the `/tourism/tms/branches/:branchId` route. `useTourismPanelDraft` (`scopeTourismDraftDefaults`) drops a draft's defaults when its `branchId` differs from the route branch, so a draft opened in one branch never saves into another after the user switches branch or expands it. Categories and custom tour types, groups and fields have no detail query and are found in their branch list query, so they open only under a branch route.
- Custom fields live in their group: a field panel id is `<groupId>~<fieldKey>`, and every field add, edit or delete saves the group. The system tour type is neither editable nor deletable.
- Amenities are quick elements: their detail uses `bmsElementDetail`.
- The itinerary builder is wider than the side panel, so its panel stays a read-only overview that renders the builder sheet on Edit.
- Tour custom fields are edited only in the Properties tab (saved through `bmsTourEdit` `customFieldsData`), never in the Detail form; a new tour gets them after it is created. Properties lists only field groups that have fields (no visible group shows the empty state); each field takes its icon from `TOUR_CUSTOM_FIELD_ICONS`, single-line types are `PanelFormRow`s and `TOUR_CUSTOM_FIELD_BLOCK_TYPES` (textarea, radio, multi-select, image, file) are full-width blocks, all using `TOURISM_PANEL_INPUT_CLASS_NAME`. The PDF preview's edit action closes the preview and opens the tour panel.
- Element create and edit sheets remain only for the itinerary builder, which runs inside a modal sheet.
- Mutations refetch list queries by operation name so tables and the panel update without a reload.
- Panel forms follow the contacts customer panel: ui-modules `PanelFormLayout` around `TourismPanelFormField` rows (label left, `PANEL_INPUT_CLASS_NAME` inputs), `block` only for images and long text, and `TourismPanelLanguageRow` first when the branch has several languages. Read-only values use `PanelField` rows.
- Keep tourism-specific UI inside `frontend/plugins/tourism_ui`.
- Module Federation exposes, route paths, and named exports must stay aligned.
- Use `erxes-ui` and `ui-modules`; do not import another plugin's source.
- Dev watch ignores must not include plugin source directories required for hot reload.

## Validation

- `pnpm nx build tourism_ui`
- Smoke scenario: open tourism PMS, TMS, PMS settings, and TMS settings routes through the remote.
- Side panel smoke: in a TMS branch, create, edit and delete an amenity, category, element, tour type, field group and field from the panel; create and edit a tour in the panel and its custom fields in Properties; open an itinerary overview and use Edit; duplicate an itinerary from its row menu; open a booking from a tour and change its status.
