# `sales_api` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/sales_api`
- **Last synchronized:** `2026-08-26`

## Scope

### Owns

- Sales boards, pipelines, stages, deals, labels, checklists, and plugin-owned
  sales data and API contracts.
- Sales-owned POS and ecommerce API behavior.

### Does not own

- Core property definitions, users, teams, shared platform packages, or other
  plugins' data.
- Sales user interfaces; those live in `sales_ui`.

## Current Capabilities

- Runs as the sales federated GraphQL and tRPC plugin service.
- Exposes deals, pipelines, boards, stages, labels, product/payment data, sales
  references, POS, and ecommerce behavior.
- Sales pipelines persist validated Core `sales:deal` property ids.
- Deal stage lists have compound indexes aligned with cursor ordering and a
  covered stage/status/parent count path.
- The unscoped deal list uses a parent/order/id/status index for its default
  card ordering.
- Declares the filterable `sales:sales.deals` segment fields and resolves a
  batch of them through the `evaluateFields` segment producer.

## Architecture

| Area                       | Path                                                    | Responsibility                                                                                |
| -------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Runtime                    | `src/main.ts`, `src/connectionResolvers.ts`, `src/trpc` | Start the plugin, load tenant-scoped models, and expose tRPC procedures.                      |
| Sales models               | `src/modules/sales/db`                                  | Store deals, boards, pipelines, stages, labels, and sales metadata.                           |
| Sales GraphQL              | `src/modules/sales/graphql`, `src/apollo`               | Provide sales schemas, resolvers, mutations, queries, and subscriptions.                      |
| References and automations | `src/modules/sales/meta`                                | Provide reference values, automation constants, and after-process behavior.                   |
| Segment fields             | `src/modules/sales/meta/segments/fields`                | Declare which `sales:sales.deals` fields are filterable, with their operators, input and mongo path. |
| Segment evaluation         | `src/modules/sales/meta/segments/evaluate`              | Resolve a batch of deals against the value refs a segment plan assigns to this plugin.        |
| Relation measures          | `src/modules/sales/meta/segments/evaluate/relations.ts` | Fold a relation into deals for a batch, over a core-resolved edge table or a stored join.     |
| Stage-derived filters      | `src/modules/sales/meta/segments/evaluate/stageFilter.ts` | Rewrite pipeline, board and probability conditions into the stage ids they name.            |
| Documents                  | `src/modules/sales/documents`                           | Generate sales document content and amount mappings.                                          |
| POS and ecommerce          | `src/modules/pos`, `src/modules/ecommerce`              | Provide sales-owned POS and ecommerce behavior.                                               |
| Benchmark data             | `scripts/benchmarks/seed-deals.js`                      | Seed resumable, deterministic high-volume deal data directly through mongosh.                 |

## Contracts

### Provides

- Federated sales GraphQL contracts for deals, stages, pipelines, boards, POS,
  and ecommerce modules.
- Sales-owned tRPC and record-reference contracts.
- `segmentFields` for `sales:sales.deals`, `segmentRelations` for `customer.deals` and
  `company.deals`, and the `evaluateFields`, `listSegmentMembers` and
  `countSegmentMembers` segment producers on `/segments`.

### Consumes

- Core public contracts for fields, products, customers, companies, users,
  branches, departments, and related records.
- Public `erxes-api-shared` utilities, types, and extension points.

## Data and State

- Tenant-scoped Mongo collections are loaded through plugin connection
  resolvers.
- Deal stage browsing uses `stageId`; its total count filters archived and
  child deals through the compound count index.
- The unscoped deal list defaults to `order` then `_id` ordering and must avoid
  a blocking sort across the full collection.
- Deal monetary state is stored in `productsData`, `totalAmount`,
  `unUsedTotalAmount`, `bothTotalAmount`, `mobileAmount`, `mobileAmounts`, and
  `paymentsData`.
- Pipeline documents store validated Core deal field ids in `propertyIds`.

## Local Invariants

- Preserve tenant isolation through the request `subdomain` for every model and
  service access.
- Cross-service access must use published GraphQL, tRPC, HTTP, event, or
  federation contracts.
- Deal stage-list indexes must retain cursor ordering and keep the common
  stage/status/parent count query covered.
- The default unscoped list query must remain aligned with the
  parent/order/id/status compound index.
- Deal amount calculations must preserve existing `tickUsed` semantics.
- Pipeline property ids must belong to Core `sales:deal` fields.
- Segment content types use the `plugin:module.record` form the event
  dispatcher emits - `sales:sales.deals` - so a segment type and the event that
  moves it are the same string. `eventTypes` is declared only when they differ,
  which happens when two types share a collection.
- A relation states the segment types and the record types separately.
  `subjectType`/`relatedType` are segment content types; `subjectRecordType`/
  `relatedRecordType` are how core's relation records name the same things.
  They are different namings and one field serving both meant a rename on
  either side silently broke the other.
- No segment producer may derive its module from the content-type string.
  `splitType('sales:deal')[1]` is `deal`, and no module has that name. The
  content-type producers (`listSegmentMembers`, `countSegmentMembers`,
  `applyMembership`) route through `segmentModuleForContentType`, which reads
  the modules' own `contentTypes` declarations.
- `evaluateFields` is routed by the requests, through
  `createSegmentEvaluateFieldsHandler`, never by the input's `subjectType` like
  the other segment producers. A relation is measured from the subject that
  owns it, so the batch arrives with a subject type this plugin does not own -
  routing on it looks for a module named after another plugin's content type
  and fails at runtime. The same rule applies inside the module: no resolver
  may gate on `subjectType`.
- Anything added to `modules/sales/meta/segments/segments.ts` must also be
  passed through `src/meta/segments.ts`. The plugin-level object is what
  service discovery serialises, so a key declared only on the module is
  invisible to core and fails at runtime rather than at build time.
- Segment fields and evaluators are one file per content type under
  `meta/segments/fields/` and `meta/segments/evaluate/`, with an `index.ts`
  keying them by content type. Shared field builders come from
  `erxes-api-shared`; do not re-declare operator sets locally.
- A deal carries no customer or company id. `customer.deals` and
  `company.deals` are declared `join: { via: 'relation' }`, and core resolves
  the edges from its own relation records and sends them on the request. Never
  declare a field join on a path the deal schema does not store, and never
  query core's collections to find the link.
- A relation measure costs one query per request for the whole batch: a grouped
  aggregation for a field join, one `find` over the resolved related ids for a
  relation join. Never a query per subject.
- Both joins must fold an empty set the same way, so the same measure means the
  same thing however the two ends are linked.
- Only a stored numeric field can back a `sum`/`avg`/`min`/`max` measure. A
  derived field has no path to aggregate, so it is reported as unavailable
  rather than silently measured as zero.
- A relation predicate that does not compile in full makes the whole measure
  unavailable. Dropping the part that would not compile would count deals the
  segment asked to exclude.
- Stage-derived conditions in a relation predicate are rewritten to the
  `stageId` values they name before compiling, and the matching stages are
  chosen with the shared evaluator so the rewrite cannot drift from what the
  condition means elsewhere. No matching stage compiles to an empty `In`, which
  matches nothing - never to a dropped condition.
- `evaluateFields` must answer a whole batch in a bounded number of queries:
  one find for every projected field, and at most two more for the
  stage-derived `pipelineId`, `boardId` and `stageProbability`. Never one query
  per subject.
- A ref this plugin cannot answer - an undeclared field, a field owned by
  another content type, a relation - must be reported in `unavailable`.
  Returning it as an absent value would decide membership against a value that
  was never read.
- `totalAmount`, `unUsedTotalAmount` and `bothTotalAmount` are declared
  `projected` because the deal mutations persist them next to `productsData`.
  A write path that changes `productsData` without calling `getTotalAmounts`
  would make those segment fields wrong.

## Validation

- `pnpm nx lint sales_api`
- `pnpm nx build sales_api`
- `pnpm nx test sales_api` (when `project.json` defines a test target)
- Smoke scenario: query deals by `stageId` and verify `totalCount` does not
  fetch deal documents.
- Smoke scenario: query deals without a stage using default order and verify
  the winning plan has no blocking `SORT` stage.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-26` — Segment content types match the event form

- **Summary:** `sales:deal` became `sales:sales.deals`, matching what the event
  dispatcher emits, so segment types and event types are one string instead of
  two that had to be mapped; relations now state their record types separately
  from their segment types, leaving core's relation records untouched.
- **Affected areas:** `src/modules/sales/meta/segments/` (content type,
  fields, members, membership, relations, evaluate).
- **Contracts changed:** `sales:deal` -> `sales:sales.deals`;
  `SegmentRelationMeta.join` for `via: 'relation'` now carries
  `subjectRecordType` and `relatedRecordType`.

### `2026-08-25` — Membership writes and content-type routing

- **Summary:** Deals now accept settled segment membership through an
  `applyMembership` producer that writes `segmentIds` on the deal, declare
  `sales:sales.deals` as the event that moves deal segments, and the
  content-type producers route by the module that declared the type instead of
  by a substring of it - which had left deal member listing unreachable since
  the segment content types were renamed to `plugin:entity`.
- **Affected areas:** `src/meta/segments.ts`,
  `src/modules/sales/meta/segments/membership.ts`,
  `src/modules/sales/meta/segments/segments.ts`,
  `src/modules/sales/meta/segments/segmentConfigs.ts`.
- **Contracts changed:** new `applyMembership` segment producer; `sales:deal`
  declares `eventTypes`.

### `2026-08-24` — Relation joins through core relation records

- **Summary:** `customer.deals` and `company.deals` now join through the core
  relation record that actually links them instead of a `customerIds` path the
  deal schema never had, so a customer segment measuring its deals no longer
  counts zero for everyone; a relation predicate that cannot compile in full
  now makes the measure unavailable, and stage-derived conditions inside one
  are resolved to stage ids rather than dropped.
- **Affected areas:** `src/modules/sales/meta/segments/relations.ts`,
  `src/modules/sales/meta/segments/evaluate/relations.ts`,
  `src/modules/sales/meta/segments/evaluate/stageFilter.ts`,
  `src/modules/sales/meta/segments/evaluate/deal.ts`.
- **Contracts changed:** `segmentRelations` declares `join: { via: 'relation' }`
  for both relations; relation requests may now carry a core-resolved `edges`
  table; `evaluateFields` is routed by request through
  `createSegmentEvaluateFieldsHandler` instead of by `subjectType`.

### `2026-08-23` — Deal relations and measures

- **Summary:** Declared `customer.deals` and `company.deals`, and added the
  aggregation that measures them for a batch - existence, count, and numeric
  sum, average, min and max over a narrowed set of deals.
- **Affected areas:** `src/modules/sales/meta/segments/relations.ts`,
  `src/modules/sales/meta/segments/evaluate/relations.ts`,
  `src/modules/sales/meta/segments/evaluate/deal.ts`,
  `src/modules/sales/meta/segments/segments.ts`
- **Contracts changed:** Adds `segmentRelations`. `evaluateFields` now answers
  relation requests whose subject type this plugin does not own.

### `2026-08-23` — Deal segment fields and batch evaluation

- **Summary:** Declared the filterable `sales:deal` fields and added the
  `evaluateFields` producer that resolves a batch of deals against them,
  including the stage-derived `pipelineId`, `boardId` and `stageProbability`.
- **Affected areas:** `src/modules/sales/meta/segments/fields/`,
  `src/modules/sales/meta/segments/evaluate/`,
  `src/modules/sales/meta/segments/segments.ts`, `src/meta/segments.ts`
- **Contracts changed:** Adds `segmentFields` for `sales:deal` and the
  `evaluateFields` segment producer. Existing segment producers are unchanged.

### `2026-08-20` — Resumable deal benchmark seed

- **Summary:** Added a guarded mongosh command for reproducible deal datasets
  distributed across a pipeline's active stages.
- **Affected areas:** `scripts/benchmarks/seed-deals.js`.
- **Contracts changed:** None.

### `2026-08-20` — Default deal order index

- **Summary:** Added a compound index for unscoped top-level deal lists ordered
  by card order and cursor id.
- **Affected areas:** `src/modules/sales/db/definitions/deals.ts`.
- **Contracts changed:** None.

### `2026-08-20` — Covered stage deal count

- **Summary:** Added a compound index that covers the stage/status/parent deal
  count used by the deals board query.
- **Affected areas:** `src/modules/sales/db/definitions/deals.ts`.
- **Contracts changed:** None.

### `2026-08-12` — Pipeline-scoped deal properties

- **Summary:** Sales pipelines persist only validated Core deal property ids.
- **Affected areas:** `src/modules/sales/{@types,db,graphql,utils}`.
- **Contracts changed:** `SalesPipeline`, `salesPipelinesAdd`, and
  `salesPipelinesEdit` gained optional `propertyIds`; `SalesPipeline` exposes
  `isPropertySelectionConfigured`.

### `2026-08-12` — Exclude loyalty amount reference

- **Summary:** `excludeLoyaltyAmount` returns deal total minus score-campaign
  payment amounts.
- **Affected areas:** `src/modules/sales/meta/references`, deal types.
- **Contracts changed:** Corrected `sales:deal.excludeLoyaltyAmount` calculation
  semantics.
