# Data Models — core metadata and workspace GraphQL

## Ownership

- Owns tenant-local object and field definitions, custom records, and generated
  workspace GraphQL types/resolvers. This is independent of custom Properties:
  never create/read Properties fields or field groups for Data Models.
- Built-in objects remain in their original collections and business APIs.
  Their identities and essential fields cannot be edited or archived here.
  Additional first-class fields may extend built-in GraphQL output types.
- Built-in display labels, descriptions, icons and record display choices are
  editable through `dataModelUpdate`. These settings affect the Data Models
  catalog and relation pickers; existing business screens retain their own
  naming/display behavior. API names, content types, system definitions and
  built-in lifecycle remain protected.

## Public contracts

- Object metadata: `dataModelList`, `dataModelDetail`, `dataModelCreate`,
  `dataModelUpdate`, `dataModelArchive`, `dataModelRestore`.
- Field metadata: `dataModelFieldList`, `dataModelFieldCreate`,
  `dataModelFieldUpdate`, `dataModelFieldArchive`, `dataModelFieldRestore`.
  Fields have immutable API name/type, editable label/description/required flag,
  versioned lifecycle and typed `DataModelFieldType` metadata. Option API values
  are permanent GraphQL enum members; labels may change and values may be added.
- Metadata reads require authentication and `dataModelsRead`; writes require
  `dataModelsManage`. Changes to existing definitions require `expectedVersion`.
- `dataModelWorkspaceSchema` publishes authenticated workspace SDL/version to
  the gateway. The public API remains `/graphql`. `/data-models/graphql` is the
  core execution route used by the gateway, not a separate UI/client API.
- Custom object `asset` generates `DataModel_asset`, typed create/update inputs,
  enum choices, typed filters and ordering, `dataModel_assetList/Detail`, and
  `dataModel_assetCreate/Update/Remove/Restore`. User fields are actual named
  selections, not a JSON field. New required fields are non-null create inputs;
  output fields remain nullable so historical records stay readable.
- Generated field enum/filter types use a separate `DataModelField_` namespace
  with length-prefixed model names to avoid cross-model naming collisions.
- Built-in extras are selectable on existing `Customer`, `Company`, `Product`
  and `User` types, together with `_dataModelVersion` for optimistic writes.
  Normal business query roots return these fields when selected; a separate
  field-only read is not required. `_dataModelVersion` shares the request's
  sidecar load with the values. `dataModel_<builtin>Fields` reads their values/version and
  `dataModel_<builtin>UpdateFields` writes typed values, with version zero for a
  previously uninitialized sidecar. Original business create/update signatures
  remain unchanged; generated typed field writes keep their own validation.
- Field-only built-in reads are deprecated gateway/compatibility operations;
  business clients should select model fields on their usual record queries.
  Schema versions hash both metadata and generated SDL so runtime schema changes
  invalidate gateway caches even when users have not edited a definition.
- Record permissions remain separate Read/Create/Update/Delete actions under
  `dataModelRecords`; restore uses Update. Built-in extras additionally require
  the corresponding original business read/update action. These are tenant-wide
  action grants, not new per-row or per-model ACLs.
- Legacy generic record operations remain deprecated compatibility APIs. New
  clients must use generated typed operations.

## Storage and schema lifecycle

- `data_model_definitions` and `data_model_fields` belong to the request's tenant
  connection. Field names are unique per model, including archived definitions;
  system/GraphQL field-name collisions are rejected before insertion.
- Built-in presentation overrides use their stable `core:<name>` ID and
  `source: BUILTIN` in `data_model_definitions`. Custom definitions use
  `source: CUSTOM`; legacy documents without a source remain custom. Catalog
  queries, active limits and counts exclude override documents so built-ins
  never appear twice. Reads merge only allowed presentation/audit settings onto
  current platform metadata. The first override inserts version 2; later writes
  compare and increment the stored version. Concurrent first saves return an
  edit conflict through the unique identity/name indexes.
- `recordLabelField` and `recordImageField` are nullable stable field references.
  Built-ins accept their own system-field codes (text/phone/textarea for labels,
  file for images); custom objects accept their own active metadata field IDs
  (text/phone/textarea for labels, text containing an image URL for images).
  The registry validates these references before writing. Null label uses the
  existing automatic label; null image suppresses the image. Relations return
  the configured label and nullable `imageUrl`, and search the configured label.
  Empty or archived selected labels fall back to the record ID, and missing
  images resolve to null. No record values are copied into object metadata.
- Custom collections remain `data_model_records_<immutable-model-id>`. Values
  retain the internal `propertiesData` container for storage compatibility, keyed
  by immutable Data Models field IDs. This is not the Properties field system.
  Existing stored values are preserved; old Properties metadata is not imported.
- Built-in additional values use `data_model_builtin_values`, keyed by model and
  record identity. Never overwrite original built-in documents to save extras.
- Record updates patch changed values only, preserve false/zero, validate required
  fields, cap payloads at 512 KiB and use compare-and-swap versions. Removal is
  soft deletion; restoration may supply newly required values. Writes emit the
  existing platform DB events with actor context and snapshots.
- Active metadata is loaded per request; compiled core schemas are cached by
  tenant connection and metadata hash. Gateway caches are bounded and keyed by
  workspace, platform schema revision and metadata hash. Never publish a global
  union of different tenants' model fields or capture request identity in schema
  resolver closures. Introspection still respects the deployment setting.
- Limits: 1000 active objects, 200 field definitions per object, 5 MiB generated
  SDL, record pages of 200, 20 filters, 100 IN operands, 128 KiB combined filters,
  three-second list/count DB timeouts. Metadata and in-flight record writes are
  not cross-document transactions; schema snapshots are per operation.
- Supported field shapes are scalar text/phone/textarea, number, boolean, date,
  string list, single/multiple enum choices and relations. Files and nested
  repeating objects are not part of this implementation.

## Relations

- Creation accepts a single `targetModelId` or `targetModelIds` (1–20 unique
  destinations). One target preserves the existing pair contract. Multiple
  targets create one concrete pair per target, grouped on the forward fields by
  immutable `morphId`, `morphName` and `morphSize`. Source GraphQL identities are
  `<relationName>_<targetModelName>`; existing field APIs remain unchanged. Self
  relations cannot combine the source with other targets.
- Grouped relations have one presentation, required rule and lifecycle. Single
  links permit at most one record across the whole group; multiple links permit
  up to 100 total. Generated create inputs keep group members nullable and the
  record validator enforces the group rule against merged values, including
  built-in sidecars. Direct attempts to bypass the UI are validated identically.
- Group creation rolls back completed pairs on failure. Schema snapshots omit
  incomplete groups/pairs. Rename/archive/restore update every forward member;
  archive/restore also updates all inverse fields. Existing non-transactional
  metadata limitations apply; group mutations require consistent member versions.
- `autoName` and relation `autoInverseName` allocate available identities,
  considering archived definitions and reserved business fields. Explicit API
  names retain strict collision validation.

- A `relation` field's immutable configuration identifies `targetModelId`,
  `multiple`, `inverseFieldId`, and `isInverse`. Creation takes `inverseName` and
  `inverseLabel` and creates reciprocal metadata in `data_model_fields`; both
  names participate in the existing per-model unique index, including archives.
- Single forward links model many-to-one relationships. Multiple forward links
  model many-to-many relationships. The inverse is always a computed list,
  read-only in typed inputs and generic record writes. Self relations require
  distinct forward/reverse API names. One-to-one uniqueness is not provided.
- Store only target record IDs in the forward field's existing value container.
  Reverse reads query that field in custom records or the built-in sidecar;
  never duplicate link values on both records. Wildcard value indexes support
  lookups without creating an index for every relation field.
- `relations.ts` uses the tenant connection, verifies active target definitions,
  target IDs/existence and cardinality, caps forward lists at 100, and checks
  `dataModelRecordsRead` plus the target's original business read grant. Custom
  objects and the four supported core built-ins may be sources and targets.
- Generated outputs expose the actual target GraphQL type. Inputs accept target
  ID strings/lists under the field API name. Inverse fields accept `limit` (1–100,
  default 25) and `offset`. Stored forward fields support identity filters;
  relation sorting and inverse-value filters are unavailable.
- `dataModelRelationOptions(fieldId, search, limit, offset)` provides paginated
  labels for record pickers with source/target read checks and escaped search.
- Its optional `recordIds` argument resolves up to 100 exact identities for
  existing selections and readable record references, using the same tenant,
  source/target grants, label/image configuration and deleted-record filter.
  An empty identity array matches no records, never the unfiltered catalog.
- Reverse reads from built-in sidecars join their business collection and remove
  deleted/missing records before applying offset/limit, so stale sidecars cannot
  hide later pages of live links. The join is tenant-local and retains the
  three-second query timeout and existing permission checks.
- Deleted targets resolve to null or disappear from lists; stored links survive
  and reappear on restoration. Unlinking patches only the forward field. Archive
  and restore a pair through its forward field. The model archive mutation
  rejects models with active relation fields. Schema snapshots omit incomplete
  pairs and inactive targets. Metadata pairs retain the module's existing
  non-transactional lifecycle limitations.

## Validation

- `pnpm nx build core-api`
- `pnpm nx lint core-api`
- `pnpm nx test core-api`
- Focused: `pnpm exec jest --config backend/core-api/jest.config.ts --runInBand --testPathPattern=modules/data-models`
- Tests cover field storage/identity, schema generation, typed inputs, permissions,
  tenant separation, built-in field selections and versioned record persistence.
