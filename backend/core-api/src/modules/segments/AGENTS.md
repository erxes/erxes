# Segments module — saving rules (core)

Rules for what a segment's condition tree must be before it is stored. Read
with the root guide; they apply to every author: the segment form, the
automation builder's inline conditions and the assistant.

## Catalogue

- `utils/segmentCatalog.ts` is the one source of what a tree may use:
  `listSegmentFields(models, contentType)` (the owning plugin's declared
  `segmentFields` plus the tenant's property namespaces, each with resolved
  operators) and `listSegmentRelations(subjectType)` (every plugin's
  `segmentRelations`, with number `measureOperators`). The `segmentFields` and
  `segmentRelations` queries return exactly these.

## Saving a tree

`utils/segmentTreeValidation.ts` runs in `createSegment` and in
`updateSegment` when `root` changes, before reference checks.

- Only nodes the save introduces are judged (a node's own properties, apart
  from children and picker `meta`); trees stored before these rules keep
  saving. A content type whose catalogue reads empty is not judged.
- A field node uses a `fieldKey` its catalogue lists, an operator that field
  allows (retired aliases such as `numbere` read as the operator they stand
  for), and a value matching the operator's input: none for `none`, a number
  for `number` or number fields, present otherwise, and one of the options of
  a static select. Its `contentType` is the subject at its position: the
  segment's own type, or a relation's `relatedType` inside its `child`.
- A relation node names a relation of its subject; `sum`/`avg`/`min`/`max`
  measure a field of the related type; `count` and those four are compared
  with a `measureOperator` and a number.
- A tree must hold at least one condition when it is created or emptied:
  an empty group never matches (`decideSegmentNode` returns unknown).
- Refusals are `ExpectedError` `SEGMENT_TREE_INVALID`, one `path: message`
  line per issue, so an author can fix the named node.

## Validation

- `pnpm nx test core-api` (`modules/segments/utils/__tests__`)
- `pnpm nx build core-api`
