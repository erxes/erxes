# `tourism_api` Plugin Guide

## Identity

- **Plugin:** `tourism`
- **Project:** `tourism_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/tourism_api`
- **Last synchronized:** `2026-10-19`

## Scope

### Owns

- BMS (tour operator) data and GraphQL: branches, tours, tour categories,
  itineraries, elements, custom tour types and field groups, orders, and
  their translations.
- PMS (hotel) data and GraphQL: branches, room cleaning and its history, and
  configs.
- OTA models with no GraphQL surface yet: hotels, room types, availabilities,
  bookings, reviews, tours, tour categories, tour availabilities and tour
  bookings.

### Does not own

- Tourism UI, core-api users, products, product categories and customers,
  payment methods (payment_api), pricing plans (loyalty_api), or another
  plugin's collections.

## Current Capabilities

- Serves the `tourism` GraphQL subgraph and tRPC router on port `3311`.
- Runs the hourly BullMQ job `tourism-hourly-tour-date-status-sync` that
  updates tour date statuses.
- Handles the core `customersMerge` after-process event.

## Architecture

| Area         | Path                                                     | Responsibility                                                        |
| ------------ | -------------------------------------------------------- | --------------------------------------------------------------------- |
| Entry        | `backend/plugins/tourism_api/src/main.ts`                | Starts the plugin, its Apollo context and MQ workers.                 |
| GraphQL      | `backend/plugins/tourism_api/src/apollo`                 | Merges the BMS and PMS schemas and resolvers into the subgraph.       |
| BMS module   | `backend/plugins/tourism_api/src/modules/bms`            | Tour operator models, GraphQL schemas and resolvers, branch tRPC.     |
| PMS module   | `backend/plugins/tourism_api/src/modules/pms`            | Hotel branch, cleaning and config models, schemas and resolvers.      |
| OTA module   | `backend/plugins/tourism_api/src/modules/ota`            | OTA model definitions and types only.                                 |
| Models       | `backend/plugins/tourism_api/src/connectionResolvers.ts` | Loads tenant-scoped models from the request `subdomain`.              |
| tRPC         | `backend/plugins/tourism_api/src/trpc/init-trpc.ts`      | Exposes the BMS branch router.                                        |
| Worker       | `backend/plugins/tourism_api/src/worker`                 | Schedules and runs the tour date status sync.                         |
| Schema print | `backend/plugins/tourism_api/print-schema.ts`            | Prints the subgraph SDL to the gitignored `generated/schema.graphql`. |

## Contracts

### Provides

- The `tourism` GraphQL subgraph. `pnpm nx run tourism_api:schema:print`
  prints it to `generated/schema.graphql`, which `tourism_ui` codegen reads.
- tRPC `branch.count` under the plugin router.

### Consumes

- `erxes-api-shared` utilities, the core `User` entity (`_id` only), and core
  tRPC `propertyFields` for the status field it registers on first context.

## Data and State

- Tenant-owned Mongo collections loaded through `generateModels(subdomain)`.
- Redis-backed BullMQ queue for the tour date status sync.

## Local Invariants

- Every resolver, model call and worker stays scoped to the request or job
  `subdomain`.
- The subgraph has no subscriptions, so `print-schema.ts` builds only the
  `typeDefs` half. It ends with `process.exit` because
  `erxes-api-shared/utils` opens Redis on import.
- An SDL change is a frontend contract change: run `schema:print` and
  `tourism_ui` codegen, and ship the backend before or with the UI that
  depends on it.

## Validation

- `pnpm nx lint tourism_api`
- `pnpm nx build tourism_api`
- `pnpm nx run tourism_api:schema:print --skip-nx-cache`
- `npx tsc --noEmit -p backend/plugins/tourism_api/tsconfig.json`
