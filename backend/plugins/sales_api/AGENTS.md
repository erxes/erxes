# `sales_api` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/sales_api`
- **Last synchronized:** `2026-08-15`

## Scope

### Owns

- Deals pipeline data (deals, stages, pipelines, boards), POS/orders data,
  sales documents, and the sales-facing custom-fields surface exposed through
  GraphQL and tRPC.
- The plugin's permission model (deals module: `showDeals`, `dealsAdd`,
  `dealsEdit`, `dealsRemove`, `dealsWatch`, `dealsArchive`) and its
  agent-tool declaration.

### Does not own

- The agent runtime, agent tool curation, or the `/agent-tools/*` platform
  contract implementation; those belong to `erxes-agent` and
  `erxes-api-shared`.
- Core user/permission data and other plugins' business data.

## Current Capabilities

- Serves deals, pipelines, boards, stages, POS orders, sales documents, and
  sales references through a federated GraphQL subgraph, REST routes, and a
  merged tRPC router (`deal`, `stage`, `pipeline`, `pos`, `orders`,
  `documents`, `fields`).
- Declares a curated agent-tool surface: 21 tRPC procedures carry
  `.meta({ agent: { permission } })` (all reads plus the three deal writes via
  `dealsAdd`/`dealsEdit`/`dealsRemove`), and
  `agentTools: { includeModels: ['Deals'] }` exposes the Deals model as CRUD
  tools whose permission actions resolve (`showDeals`/`dealsAdd`/`dealsEdit`/
  `dealsRemove`). Raw-mongo, system-user, and POS-device-sync procedures stay
  inventory-only (`agentUsable=false`).
- Sales pipelines persist `propertyIds`; create and edit validate every id
  against Core `sales:deal` fields before writing it.
- `excludeLoyaltyAmount` returns the deal total amount minus payments made
  through pipeline payment types that have a `scoreCampaignId`.

## Architecture

| Area                  | Path                                              | Responsibility                                           |
| --------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| Runtime               | `src/main.ts`, `src/connectionResolvers.ts`       | Start the plugin, load tenant-scoped models, expose tRPC  |
| Sales models          | `src/modules/sales/db`                            | Store deals, boards, pipelines, stages, labels, metadata  |
| Sales GraphQL         | `src/modules/sales/graphql`, `src/apollo`         | Sales schemas, resolvers, mutations, subscriptions        |
| Agent-tool surface    | `src/modules/sales/trpc`, `src/modules/pos/trpc`  | tRPC procedures with `.meta({ agent: { permission } })`   |
| References, automations| `src/modules/sales/meta`                          | Reference values, automation constants, after-process     |
| Documents             | `src/modules/sales/documents`                     | Sales document content and amount mappings                |
| POS and ecommerce     | `src/modules/pos`, `src/modules/ecommerce`        | Sales-owned POS and ecommerce behavior                    |

## Contracts

### Provides

- Federated sales GraphQL contracts including `salesPipelineDetail`,
  `salesPipelinesAdd`, and `salesPipelinesEdit`.
- tRPC contracts for `deal`, `stage`, `pipeline`, `pos`, `orders`, `documents`,
  and `fields`, plus the `/agent-tools/manifest` inventory declaring the
  agent-usable surface.

### Consumes

- Core `fields.find` over tRPC for `sales:deal` property validation.
- Public `erxes-api-shared` utilities and core types, including the
  `/agent-tools/*` platform contract.

## Data and State

- Tenant-scoped Mongoose models are generated per `subdomain`.
- Deal monetary state is stored in `productsData`, `totalAmount`,
  `unUsedTotalAmount`, `bothTotalAmount`, `mobileAmount`, `mobileAmounts`, and
  `paymentsData`.
- Pipeline documents store a unique array of selected Core field ids in
  `propertyIds`; no property definitions are duplicated in sales storage.

## Local Invariants

- Never accept a pipeline property id outside Core `sales:deal` fields.
- Preserve tenant isolation by validating through the request `subdomain`.
- Agent-tool declarations must reference permission actions the plugin
  actually registers in the `deals` module; raw-mongo, system-user, and
  POS-device-sync procedures must never become agent-callable.
- Do not introduce new `schemaWrapper` usage in backend schemas.

## Validation

- `pnpm nx build sales_api`
- `pnpm nx test sales_api` (when `project.json` defines a test target)
- Smoke scenario: resolve `sales:deal.excludeLoyaltyAmount` for a deal with
  empty `paymentsData`; it should return the deal total amount, not `0`.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-15` — Adopt the `/agent-tools` platform

- **Summary:** Exposes a curated agent-callable surface: 21 tRPC procedures
  (`deal`, `stage`, `pipeline`, `pos`, `orders`, `documents`, `fields`)
  declared via `.meta({ agent: { permission } })` and Deals model CRUD via
  `agentTools: { includeModels: ['Deals'] }`.
- **Affected areas:** `src/modules/sales/trpc/deal.ts`,
  `src/modules/pos/trpc/pos.ts`, `src/modules/sales/trpc/document.ts`,
  `src/trpc/init-trpc.ts`, `src/main.ts`.
- **Contracts changed:** new agent-usable tool declarations; no public
  GraphQL or tRPC contract changes.

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