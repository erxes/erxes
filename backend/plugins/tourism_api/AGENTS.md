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

| Area         | Path                                                     | Responsibility                                                         |
| ------------ | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| Entry        | `backend/plugins/tourism_api/src/main.ts`                | Starts the plugin, its Apollo context and MQ workers.                  |
| GraphQL      | `backend/plugins/tourism_api/src/apollo`                 | Merges the BMS and PMS schemas and resolvers into the subgraph.        |
| BMS module   | `backend/plugins/tourism_api/src/modules/bms`            | Tour operator models, GraphQL schemas and resolvers, branch tRPC.      |
| PMS module   | `backend/plugins/tourism_api/src/modules/pms`            | Hotel branch, cleaning and config models, schemas and resolvers.       |
| OTA module   | `backend/plugins/tourism_api/src/modules/ota`            | OTA model definitions and types only.                                  |
| Models       | `backend/plugins/tourism_api/src/connectionResolvers.ts` | Loads tenant-scoped models from the request `subdomain`.               |
| tRPC         | `backend/plugins/tourism_api/src/trpc/init-trpc.ts`      | Exposes the BMS branch router.                                         |
| Worker       | `backend/plugins/tourism_api/src/worker`                 | Schedules and runs the tour date status sync.                          |
| Schema print | `backend/plugins/tourism_api/project.json`               | `"schema:print": {}` joins the shared printer and the composed schema. |
| Lint config  | `backend/plugins/tourism_api/eslint.config.js`           | Extends the root config and rejects unescaped regex input.             |

## Contracts

### Provides

- The `tourism` GraphQL subgraph. `pnpm nx run tourism_api:schema:print`
  prints it to the gitignored `generated/schema.graphql` through the shared
  `scripts/print-subgraph-schema.ts` (target from `nx.json`).
  `gateway:schema:compose` composes it with every other backend into
  `backend/gateway/generated/schema.graphql`, which `tourism_ui` and every
  other plugin's codegen read.
- tRPC `branch.count` under the plugin router.

### Consumes

- `erxes-api-shared` utilities, and core tRPC `propertyFields` for the status
  field it registers on first context.
- Federation entities by `_id` only: core `User`, `Customer` and `Product`,
  and sales_api `Deal` (PMS `pmsRooms`/`cpPmsRooms`). `extend type Deal` has
  no base without sales_api, so the gateway fails to compose the supergraph
  (`EXTENSION_WITH_NO_BASE`) unless `sales` is enabled with `tourism`.

## Data and State

- Tenant-owned Mongo collections loaded through `generateModels(subdomain)`.
- Redis-backed BullMQ queue for the tour date status sync.

## Local Invariants

- Every resolver, model call and worker stays scoped to the request or job
  `subdomain`.
- The shared printer reads the SDL from `src/apollo/typeDefs.ts`. The plugin
  has no `src/apollo/subscription.ts`, so it prints no subscription fields.
- The SDL is composed with every other backend. A type, enum or field that
  disagrees with another subgraph fails `gateway:schema:compose` and turns
  every plugin's codegen red, so fix it here before anything else.
- An SDL change is a frontend contract change: run `gateway:schema:compose`
  and `tourism_ui` codegen. Ship an added field before or with the UI that reads
  it. Ship a tightened argument after or with the UI, because the old UI's
  nullable variables fail validation against it.
- Every resolver is declared in the SDL, and every root SDL field has a
  resolver.
- Arguments a resolver cannot run without are non-null: `ids: [String!]!` on
  `bmsElementRemove`, `bmsItineraryRemove` and `bmsTourRemove`, and
  `_id: String!` on `bmsBranchEdit` and `pmsBranchEdit`. `cp*` fields and
  fields `tourism_ui` does not call keep nullable arguments, so outside
  clients' variables still validate.
- `PmsBranch._id` is `String!`. `cpPmsBranch._id` stays nullable because it
  is the client portal contract.
- Request text that reaches `$regex` or `new RegExp()` goes through
  `escapeRegExp` from `erxes-api-shared/utils`. `eslint.config.js` enforces
  it, copied from `operation_api`.

## Validation

- `pnpm nx lint tourism_api`
- `NODE_OPTIONS=--max-old-space-size=8192 pnpm nx build tourism_api`
  (`build:packageJson` runs out of memory at the default heap)
- `pnpm nx run tourism_api:schema:print --skip-nx-cache`
- `pnpm nx run gateway:schema:compose --parallel=2`
- `npx tsc --noEmit -p backend/plugins/tourism_api/tsconfig.json`
