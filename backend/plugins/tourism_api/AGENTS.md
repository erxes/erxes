# `tourism_api` Plugin Guide

## Identity

- **Plugin:** `tourism`
- **Project:** `tourism_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/tourism_api`
- **Last synchronized:** `2026-11-09`

## Scope

### Owns

- Tourism BMS tours, itineraries, elements, orders and translations; OTA hotels,
  rooms, availability, bookings and reviews; PMS branches, cleaning and configs.

### Does not own

- Tourism frontend surfaces, Core customer records, or other plugins' models.

## Current Capabilities

- Starts the tourism service on port 3311 with GraphQL and tRPC endpoints.
- Generates tenant-scoped tourism models for GraphQL and tRPC requests.

## Architecture

| Area | Path | Responsibility |
| --- | --- | --- |
| Runtime | `backend/plugins/tourism_api/src/main.ts` | Registers service and request contexts. |
| Models | `backend/plugins/tourism_api/src/connectionResolvers.ts` | Generates tenant models. |
| Domain | `backend/plugins/tourism_api/src/modules` | BMS, OTA and PMS behavior. |
| GraphQL | `backend/plugins/tourism_api/src/apollo` | Assembles schema and resolvers. |
| tRPC | `backend/plugins/tourism_api/src/trpc` | Registers the BMS branch router. |

## Contracts

### Provides

- Tourism GraphQL queries and mutations assembled by `src/apollo/typeDefs.ts`.
- BMS branch tRPC router registered by `src/trpc/init-trpc.ts`.
- After-process metadata registered in `src/main.ts`.

### Consumes

- Public `erxes-api-shared` startup, model generation and tRPC APIs.
- Core `propertyFields.find` and `propertyFields.create` tRPC contracts.

## Data and State

- `generateModels` supplies tenant-scoped BMS, OTA and PMS Mongoose models.

## Local Invariants

- Preserve request subdomain isolation when generating and accessing models.
- `tsconfig.build.json` excludes `**/*spec.ts`, `**/*.test.ts`, and
  `**/__tests__/**` from build file discovery; retain plugin-specific exclusions.
- Development uses `tsx watch src/main.ts`; build uses TypeScript and tsc-alias.

## Validation

- `pnpm nx lint tourism_api` (inferred from the workspace ESLint plugin).
- `pnpm nx build tourism_api`.
- No explicit test target is defined in `project.json`.
- Smoke: start the service and verify a tourism GraphQL request resolves
  against the requested tenant's models.
