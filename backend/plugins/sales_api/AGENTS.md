# `sales_api` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/sales_api`
- **Last synchronized:** `2026-09-02`

## Scope

### Owns

- Sales boards, pipelines, stages, deals, labels, checklists, and plugin-owned
  sales data and API contracts.
- Sales deal, pipeline, board, stage, ecommerce, and POS API behavior
  implemented under `backend/plugins/sales_api`.
- Sales-owned GraphQL, tRPC, Mongoose models, metadata, reference resolvers,
  documents, and after-process handlers.

### Does not own

- Core property definitions, users, teams, or shared platform packages.
- Sales user interfaces; those live in `sales_ui`.
- Core API, gateway, shared libraries, frontend plugin code, loyalty score
  campaign internals, accounting, Mongolian integrations, or other plugins.
- Direct source imports from another plugin; cross-service access must use
  published GraphQL, tRPC, HTTP, event, or federation contracts.

## Current Capabilities

- Runs as the sales federated GraphQL and tRPC plugin service.
- Sales pipelines persist `propertyIds`; create and edit validate every id
  against Core `sales:deal` fields before writing it. A separate configured
  flag preserves legacy show-all behavior without making an empty selection
  ambiguous.
- Deals, pipelines, boards, stages, labels, products data, payments data, and
  sales references are exposed through sales-owned APIs.
- Sales record references provide deal display names, links, labels, product
  amount helpers, and `excludeLoyaltyAmount`.
- `excludeLoyaltyAmount` returns the deal total amount minus payments made
  through pipeline payment types that have a `scoreCampaignId`.
- POS and ecommerce modules provide sales-owned order and integration behavior.
- Read-only deal, stage, pipeline, POS, and POS-order tRPC procedures are
  exposed to AI agents through `/agent-tools/manifest` and `/agent-tools/call`
  via `.meta(agentMeta(...))` annotations; every other procedure remains
  invisible to agents.
- Agent-facing `deal.find` uses a strict input wrapper, optional projection
  fields, a default limit of 20, and a maximum limit of 100; `deal.count` uses a
  strict `{ filter }` wrapper.

## Architecture

| Area                | Path                                                    | Responsibility                                                        |
| ------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| Bootstrap           | `src/main.ts`                                           | Starts and registers the sales plugin                                 |
| Runtime             | `src/main.ts`, `src/connectionResolvers.ts`, `src/trpc` | Start the plugin, load tenant-scoped models, and expose tRPC          |
| Agent tool metadata | `src/trpc/agentMeta.ts`                                 | Local `agentMeta` helper for agent-callable tRPC annotations          |
| Models              | `src/modules/sales/db`                                  | Sales Mongoose schemas and models                                     |
| GraphQL             | `src/modules/sales/graphql`, `src/apollo`               | Sales schemas, resolvers, mutations, queries, and subscriptions       |
| Pipeline validation | `src/modules/sales/utils/pipelineProperties.ts`         | Validates pipeline property ids through Core tRPC                     |
| References          | `src/modules/sales/meta`                                | Sales reference values, automation constants, and after-process logic |
| Documents           | `src/modules/sales/documents`                           | Generate sales document content and amount mappings                   |
| POS and ecommerce   | `src/modules/pos`, `src/modules/ecommerce`              | Provide sales-owned POS and ecommerce behavior                        |

## Contracts

### Provides

- Federated sales GraphQL contracts including `salesPipelineDetail`,
  `salesPipelinesAdd`, and `salesPipelinesEdit`.
- Agent-callable tRPC tools (admit-only via `.meta({ agent })`), each gated by
  the listed sales permission action:
  - `deal.findOne`, `deal.find`, `deal.count`, `deal.getLink` — `showDeals`
  - `stage.findOne`, `stage.find` — `showDeals`
  - `pipeline.findOne` — `pipelinesWatch`
  - `pos.findOne`, `pos.find` — `posRead`
  - `pos.ordersDeliveryInfo`, `orders.findOne`, `orders.find` — `posOrderRead`
- tRPC service contracts under `src/trpc` and module-specific `trpc`
  directories for platform and cross-plugin callers (not agent-visible).
- Record reference resolvers under `src/modules/sales/meta/references`.
- Sales metadata and automation contracts under `src/modules/sales/meta`.

### Consumes

- Core `fields.find` over tRPC for `sales:deal` property validation.
- `erxes-api-shared` core types, utilities, and core module extension points.
- Public platform contracts for products, customers, companies, users,
  branches, departments, and related records.
- Loyalty-facing sales deal payloads through published target/reference
  contracts, not loyalty internals.

## Data and State

- Tenant-scoped Mongoose models are generated per `subdomain`.
- Pipeline documents store a unique array of selected Core field ids in
  `propertyIds`; no property definitions are duplicated in sales storage.
- Tenant-scoped Mongo collections are loaded through plugin connection
  resolvers.
- Deal monetary state is stored in `productsData`, `totalAmount`,
  `unUsedTotalAmount`, `bothTotalAmount`, `mobileAmount`, `mobileAmounts`, and
  `paymentsData`.
- Pipeline payment type configuration may attach `scoreCampaignId` to payment
  types used by loyalty-related references.

## Local Invariants

- Never accept a pipeline property id outside Core `sales:deal` fields.
- Preserve tenant isolation by using the request `subdomain` for every model,
  service, resolver, worker, and route access.
- Pipeline stage updates and property selections remain one pipeline mutation.
- Checked pipeline deal queries preserve master branch department-user
  visibility and compose with existing filters through `$and`.
- Do not fetch department visibility data when the pipeline has no
  `departmentIds`.
- `excludeLoyaltyAmount` must calculate from the deal total minus
  score-campaign payment amounts, so missing or empty `paymentsData` returns
  the full total amount.
- Deal amount fallbacks should preserve the existing `tickUsed` semantics used
  by sales totals.
- Do not introduce new `schemaWrapper` usage in backend schemas.
- Agent tool annotations are admit-only: never annotate raw-mongo helpers
  (`deal.aggregate`, `deal.updateOne`, `orders.updateOne`), system-user
  procedures (`deal.create`, `deal.updateOne`), procedures that trust a caller
  supplied `user` object (`deal.createItem`, `deal.editItem`), POS device-sync
  endpoints (`pos.createOrUpdateOrders*`, `pos.confirmCover`), token-scoped
  lookups (`pos.ecommerceGetBranches`), destructive bulk operations
  (`deal.removeItem`), or internal plumbing (`deal.subscriptionWrapper`,
  `deal.tag`, `deal.getFilterParams`, `deal.replaceContent`,
  `deal.contentIds`, `deal.generateInternalNoteNotif`, `deal.notifiedUserIds`,
  `deal.createCommentActivityLog`, `documents.editorAttributes`,
  `fields.getFieldList`). New procedures are agent-invisible unless explicitly
  annotated.
- Agent-callable collection reads must stay bounded and reject unknown
  top-level input keys; use count or pagination instead of allowing unbounded
  full-collection payloads.

## Validation

- `pnpm nx lint sales_api` (pre-existing errors in `modules/ecommerce/routes.ts`
  and `modules/sales/meta/segments/utils.ts` are not from recent changes)
- `pnpm nx build sales_api`
- Create or edit a pipeline with valid and invalid deal property ids; valid ids
  persist and an invalid id is rejected.
- Smoke scenario: resolve `sales:deal.excludeLoyaltyAmount` for a deal with
  empty `paymentsData`; it should return the deal total amount, not `0`.
- Smoke scenario: `GET /agent-tools/manifest` on the sales service lists only
  the annotated procedures above; `deal.create`, `deal.updateOne`, and
  `deal.subscriptionWrapper` never appear.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-02` — Bounded Deal Agent Reads

- **Summary:** Restored strict, bounded agent-facing deal find/count inputs so
  AI tools cannot trigger unbounded deal collection reads.
- **Affected areas:** `src/modules/sales/trpc/deal.ts`.
- **Contracts changed:** `deal.find` accepts `{ query, skip, limit, sort, fields }`
  with default/max limits; `deal.count` accepts `{ filter }`.

### `2026-08-19` — Agent-callable tRPC tools

- **Summary:** Read-only deal, stage, pipeline, POS, and POS-order tRPC
  procedures are now exposed to AI agents through the platform agent-tools
  manifest.
- **Affected areas:** `src/trpc/agentMeta.ts` (new local helper mirroring
  core-api), `src/modules/sales/trpc/deal.ts`, `src/modules/pos/trpc/pos.ts`.
- **Contracts changed:** New agent-tool manifest entries `deal.findOne`,
  `deal.find`, `deal.count`, `deal.getLink`, `stage.findOne`, `stage.find`,
  `pipeline.findOne`, `pos.findOne`, `pos.find`, `pos.ordersDeliveryInfo`,
  `orders.findOne`, `orders.find`, gated by `showDeals`, `pipelinesWatch`,
  `posRead`, and `posOrderRead`. No existing GraphQL or tRPC behavior changed.

### `2026-08-19` — Checked pipeline deal query filter

- **Summary:** Checked pipeline visibility now uses the master branch department-user rules, skips department lookups without pipeline departments, and preserves existing query filters.
- **Affected areas:** `src/modules/sales/graphql/resolvers/queries/deals.ts`.
- **Contracts changed:** None.

### `2026-08-12` — Pipeline-scoped deal properties

- **Summary:** Sales pipelines now persist only validated Core deal property ids.
- **Affected areas:** `src/modules/sales/{@types,db,graphql,utils}`.
- **Contracts changed:** `SalesPipeline`, `salesPipelinesAdd`, and
  `salesPipelinesEdit` gained optional `propertyIds: [String]`;
  `SalesPipeline` exposes `isPropertySelectionConfigured: Boolean`.

### `2026-08-12` — `Exclude loyalty amount reference`

- **Summary:** `excludeLoyaltyAmount` now returns deal total minus score-campaign payment amounts instead of summing non-score payments.
- **Affected areas:** `src/modules/sales/meta/references/salesRefernceCustomResolvers.ts`, `src/modules/sales/@types/deal.ts`
- **Contracts changed:** `sales:deal.excludeLoyaltyAmount` calculation semantics corrected for empty or partial `paymentsData`.
