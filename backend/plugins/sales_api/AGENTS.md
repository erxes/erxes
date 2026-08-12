# `sales_api` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/sales_api`
- **Last synchronized:** `2026-08-12`

## Scope

### Owns

- Sales boards, pipelines, stages, deals, labels, checklists, and plugin-owned
  sales data and API contracts.

### Does not own

- Core property definitions, users, teams, or shared platform packages.
- Sales user interfaces; those live in `sales_ui`.

## Current Capabilities

- Runs as the sales federated GraphQL and tRPC plugin service.
- Sales pipelines persist `propertyIds`; create and edit validate every id
  against Core `sales:deal` fields before writing it. A separate configured
  flag preserves legacy show-all behavior without making an empty selection
  ambiguous.

## Architecture

| Area                | Path                                                                      | Responsibility                                    |
| ------------------- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| Bootstrap           | `backend/plugins/sales_api/src/main.ts`                                   | Starts and registers the sales plugin             |
| Models              | `backend/plugins/sales_api/src/modules/sales/db`                          | Sales Mongoose schemas and models                 |
| GraphQL             | `backend/plugins/sales_api/src/modules/sales/graphql`                     | Sales schemas and resolvers                       |
| Pipeline validation | `backend/plugins/sales_api/src/modules/sales/utils/pipelineProperties.ts` | Validates pipeline property ids through Core tRPC |

## Contracts

### Provides

- Federated sales GraphQL contracts including `salesPipelineDetail`,
  `salesPipelinesAdd`, and `salesPipelinesEdit`.

### Consumes

- Core `fields.find` over tRPC for `sales:deal` property validation.
- Public `erxes-api-shared` utilities and core types.

## Data and State

- Tenant-scoped Mongoose models are generated per `subdomain`.
- Pipeline documents store a unique array of selected Core field ids in
  `propertyIds`; no property definitions are duplicated in sales storage.

## Local Invariants

- Never accept a pipeline property id outside Core `sales:deal` fields.
- Preserve tenant isolation by validating through the request `subdomain`.
- Pipeline stage updates and property selections remain one pipeline mutation.

## Validation

- `pnpm nx lint sales_api`
- `pnpm nx build sales_api`
- Create or edit a pipeline with valid and invalid deal property ids; valid ids
  persist and an invalid id is rejected.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-12` — Pipeline-scoped deal properties

- **Summary:** Sales pipelines now persist only validated Core deal property ids.
- **Affected areas:** `src/modules/sales/{@types,db,graphql,utils}`.
- **Contracts changed:** `SalesPipeline`, `salesPipelinesAdd`, and
  `salesPipelinesEdit` gained optional `propertyIds: [String]`;
  `SalesPipeline` exposes `isPropertySelectionConfigured: Boolean`.
