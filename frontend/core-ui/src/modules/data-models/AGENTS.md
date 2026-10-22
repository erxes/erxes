# Data Models — core UI

## Ownership and navigation

- Owns `/settings/data-models` and `/settings/data-models/:modelId`. Settings
  navigation uses the `dataModels` permission module; routes require
  `dataModelsRead`. Implementation stays in core UI.
- The Fields tab owns an inline first-class field editor, active/archived fields,
  enum options, required flags and lifecycle confirmations. Never redirect to or
  depend on Properties or field groups. System fields remain protected.
- Built-in definitions retain their existing business screens. Additional model
  fields are available on their existing GraphQL output types; the generic
  Records tab is for custom objects only. Customer list and detail screens
  select active model fields on their normal `customers` / `customerDetail`
  roots and display/edit them alongside existing fields.
- The catalog opens an interactive object overview by default. `?view=list`
  switches to the compact object list. Both use the existing paginated catalog;
  search filters the loaded page and pagination remains available when needed.
- The overview uses the installed `@xyflow/react` renderer with erxes-ui controls,
  theme tokens, zoom/fit/reset controls, and object links. Initial placement is
  a staggered three-column grid in catalog order, independent of relation
  direction or depth. Relations never collapse the layout into a vertical chain. Expanded cards increase row
  spacing until the user moves an object. Every object remains draggable with
  light grid snapping; dropping keeps its position without reordering neighbors.
  Positions live only in component state; Reset layout and refresh restore the
  generated layout. Field previews read
  actual system/custom metadata. Node positions are local view state; do not
  infer relation targets from field names. Edges use forward relation metadata
  only, run from bottom to top handles without arrowheads, and label single/multiple
  link cardinality. Parallel relations share one connector; inverse fields do not
  produce duplicate edges.
- Details use a contextual object heading and left-aligned Fields/Settings tabs,
  with a Records tab for custom objects. Fields and Relations have explanatory
  left rails and wider tables; built-ins offer permission-gated links to their
  existing business record screens.
  `?tab=settings` and `?tab=records` preserve direct links. Model edit/archive
  actions live in Settings; field creation is also available in the page header.
- `components/DataModelSettings.tsx` owns inline settings for built-in and custom
  objects: an existing erxes-ui icon picker, singular/plural names, description,
  record-label/image selectors, and a live preview of selected field names.
  Save status/actions stay visible at the bottom of the scroll area. API identity
  is read-only under Advanced. Custom objects alone can be archived; unsaved
  edits must be saved or explicitly reloaded first. Readers see disabled controls.
  Opening versions and dirty values survive background updates and errors;
  Reload latest explicitly replaces them with the current saved settings.
- The Fields tab shows Relations above Fields, each with independent search,
  name sorting, source/status filters and an add action. Relation metadata stays
  in the Relations table; protected actor fields stay in Fields. Rows open an
  editor or read-only inspector for custom fields through their name or chevron.
  Built-in field names are plain text and their chevrons are disabled, with no
  inspector. Archive actions
  live in the editor; archived forward fields can be restored from their table.
  Reverse relations expose inspection and a link to their owning object only.
- Add relation opens a dedicated settings layout inside the field editor: name,
  live object preview, relation type, searchable destination and destination field
  label. The destination field label defaults to the source object's plural name
  and is optional to customize under More settings. GraphQL names generate from
  labels, preserve manual overrides and remain under More settings with
  description and required settings. Self relations generate
  distinct forward/reverse names. Relation rows show Has many or Belongs to from
  their actual cardinality. Destination/type remain immutable during editing.

## Contracts and state

- Metadata documents in `graphql.ts` consume `dataModel*`/`dataModelField*` APIs.
  Record documents in `recordDocuments.ts` are generated from immutable model and
  field API names: actual named selections and typed create/update variables are
  sent through the existing `/graphql` endpoint, never JSON Properties inputs.
- Custom objects have a collapsible named GraphQL example. Built-ins do not
  show a separate field-only query example.
- `builtinDocuments.ts` adds named selections to verified business response paths
  and typed fragments, preserving operations, variables, aliases and directives.
  `useBuiltinModelFields.ts` loads active metadata only when model/record reads
  are authorized. Customer request integration lives in the owning contacts
  hooks, including `useCustomerDetailData.ts`; shared packages remain unchanged.
- `BuiltinModelFields.tsx` provides customer columns and panel fields using
  existing record/form components. Typed saves use the record's opening
  `_dataModelVersion`, require both model-record and business update grants,
  and refetch existing customer list/detail queries. Keep entered values and
  the opening version after conflicts. Field values remain named members of
  customer responses, not Properties data.
- API names/types are immutable. Labels, description and required flags can be
  edited. Option values are permanent enum members; labels can change and new
  options can be added. Archive/restore preserves stored values and field IDs.
- Ordinary field forms ask for a field name, a type selector and a required
  switch. Choice fields use individual option rows with add/remove controls;
  values generate automatically, saved values survive label edits and saved
  options cannot be removed. API names generate from labels and live under More
  settings with description; saved API names and field types display as text.
  Object forms generate API names from the singular label. Boolean values use
  Yes/No labels and retain a distinct Not set state.
- Object icons from metadata render in the catalog, overview, detail header and
  relation previews/destination picker. Object updates refetch active catalog,
  detail and relation-option queries. Record display choices affect Data Models
  relation pickers, not the existing built-in business screens. Built-in label
  choices are text-like system fields and image choices are file system fields;
  custom labels use text-like fields and images use text fields with image URLs.
  Relation options render the configured `imageUrl` through erxes-ui Avatar and
  `readImage`, with an initial fallback. API identities and builtin lifecycle
  remain protected even when display settings are editable.
- `dataModelsManage` gates field/object management; record Read/Create/Update/
  Delete actions are independent. Restore uses Update. No `propertiesRead` or
  Properties management permissions are needed.
- Apollo owns server data. Metadata writes refetch active definitions/field
  queries; record writes refetch active typed record lists before completion.
  Local state owns dialogs, paging and sorting. Versioned editors retain the
  object/field/record snapshot they opened, even if background queries update.
- Record views normalize API names into local `values` keyed by immutable field
  IDs. Updates send dirty fields only; clearing sends null. Required checks retain
  false/zero, booleans distinguish unset/false, and date controls preserve instants.
- Errors retain form entries and provide conflict recovery. Records support
  soft-delete/restore, paging and server-side sorting. Files are not supported.
- Relation creation can select one or multiple destination object types. The
  picker stays open while toggling destinations and prevents combining the source
  object with other types. Multiple destinations create grouped concrete fields;
  metadata rows, record editors, table columns and overview previews show one
  logical relation. Destinations/cardinality
  are immutable. Targets include custom objects and Customers, Companies,
  Products and Users; catalog pagination remains available.
- Record editors use a single object-type selector within a multi-object
  relation. Belongs to clears other destinations when a record is selected; Has
  many retains records across object types, with a total limit of 100. Required
  validation applies across the whole group, not to each destination.
- Generated source/destination API names use available identities automatically;
  explicit names entered under More settings remain unchanged. Save errors use plain
  language and include conflict recovery only for actual version conflicts.
- `DataModelRelationInput.tsx` searches and pages through authorized target
  records using `dataModelRelationOptions`. Saves send IDs, never nested records.
  Custom and normal built-in documents select relation objects with `{ _id }`;
  wire normalization converts them to IDs for forms. Reverse fields are visible
  read-only, excluded from write inputs and sort controls, and inspected with a
  link to the object that owns the editable forward field.
- Relation writes refetch active record/business lists and picker queries so
  reverse links update immediately. API reverse lists are paginated, with the
  default first 25 records selected by current table columns.

- New field forms offer Status, Priority, Due date and Notes starting points.
  Types use an expandable visual chooser with explanations; picking a preset
  fills real choice rows and collapses the chooser. Empty choice lists can start
  with progress/priority options. Object-name suggestions fill names only, never
  silently create fields or records. Relation creation starts with destination
  choices, then explicit One record/Multiple records options and a generated
  editable label, followed by an explanation of where actual links are made.
- Field, object and record sheets confirm before discarding dirty entries.
  Record editors freeze their opening metadata and record version. Background
  metadata refreshes retain loaded editors, with refresh errors shown separately.
  Typed write selections request only identity/version; active read queries are
  refetched. A failed follow-up read exposes its own retry state and must not
  turn an already committed write into a reported mutation failure.
- `DataModelRelationValue.tsx` displays permission-checked labels and opens
  references through the public `useSidePanel` navigator, preserving its Back
  stack and URL. Custom records use their existing `core:dataModel_<id>` content
  type; `DataModelRecordPanel.tsx` loads typed detail queries and provides readable
  values and permission-gated editing. Customers/companies keep the existing
  contact panels; products/users have read views using normal business detail
  roots plus model fields. Core's `SidePanelRecord` dispatches these views.
- `dataModelsUiRelationReferences` uses bounded `recordIds` on the existing
  relation-options API to resolve selected/off-page names, not a first-page
  lookup. Unavailable targets have no open action. Read-only reverse fields use
  `dataModelsUiReverseLinks` with 26-item lookahead and 25-item pages, including
  business query roots for built-ins. Reference and reverse queries refetch after
  record writes. Tab/view changes preserve unrelated URL state such as `panel`.

## Validation

- `pnpm nx build core-ui`
- `pnpm nx lint core-ui`
- `pnpm nx test core-ui`
- Focused: `pnpm exec jest --config frontend/core-ui/jest.config.ts --runInBand --testPathPattern=modules/data-models`
- Smoke: create a model, add a field without leaving its page, inspect generated
  API examples, create/edit/delete/restore records, archive/restore a field/model,
  and confirm built-ins and denied actions remain protected.
- Visual smoke: inspect overview/list and object fields in light/dark themes;
  zoom, fit, drag/drop, reset and open an overview object; search/filter fields,
  confirm protected-field chevrons are disabled, and open a custom field; open
  Settings and Records directly through their tab URLs.
