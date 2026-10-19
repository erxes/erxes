# `insurance_api` Plugin Guide

## Identity

- **Plugin:** `insurance`
- **Project:** `insurance_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/insurance_api`
- **Last synchronized:** `2026-10-20`

## Scope

### Owns

- Insurance types, risks, products, regions, vendors, vendor accounts, insurance customers, contracts, pricing, and contract templates/PDFs.

### Does not own

- Core accounts and authentication, the gateway, shared libraries, or another plugin's data and runtime.

## Current Capabilities

- Starts the `insurance` service on port `33010` with GraphQL and tRPC.
- Provides insurance configuration and contract operations, vendor-user login, travel-price calculation, and contract HTML/PDF generation.
- `pnpm nx run insurance_api:schema:print` writes the existing subgraph SDL to `generated/schema.graphql` without Redis, Mongo or a running service. The shared `scripts/print-subgraph-schema.ts` does the printing; the target comes from the `schema:print` default in `nx.json`.

## Architecture

| Area             | Path                                                                       | Responsibility                                                           |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Runtime          | `src/main.ts`                                                              | Plugin startup, vendor-token context, contract preview/PDF HTTP handlers |
| Tenant models    | `src/connectionResolvers.ts`                                               | Registers models through `createGenerateModels`                          |
| GraphQL contract | `src/modules/insurance/graphql/schemas/insurance.ts`                       | SDL objects, inputs, queries, and mutations                              |
| Resolvers        | `src/modules/insurance/graphql/resolvers`                                  | Query, mutation, and custom-field resolution                             |
| Persistence      | `src/modules/insurance/db`                                                 | Mongoose definitions, model methods, and migrations                      |
| Pricing and PDFs | `src/modules/insurance/utils/pricing.ts`, `src/modules/insurance/services` | Price calculations and contract rendering                                |
| tRPC             | `src/trpc/init-trpc.ts`                                                    | `insurance.health` procedure                                             |

## Contracts

### Provides

- GraphQL documents assembled by `src/apollo/typeDefs.ts` from shared scalar/common types and Insurance's SDL. There is no Insurance subscription module.
- Contract preview and PDF handlers at `/contracts/:id/preview` and `/contracts/:id/pdf`.
- Existing JSON fields for product `pricingConfig`, vendor-product `pricingOverride`, and contract `insuredObject`.
- Nx target `schema:print` (cached, output `generated/schema.graphql`, gitignored), composed with every other subgraph by `gateway:schema:compose`.

### Consumes

- Public `erxes-api-shared` APIs for plugin startup, request tenancy, common GraphQL types, and model generation.
- Handlebars and Puppeteer for contract HTML/PDF rendering.

## Data and State

- `generateModels(subdomain)` supplies tenant-scoped models for contracts, insurance types, risks, products, vendors, vendor users, insurance customers, templates, and regions.
- Model definitions use `new Schema(...)`; preserve the existing identifiers and collection mappings in `src/connectionResolvers.ts`.

## Local Invariants

- Preserve request tenancy in every resolver and HTTP handler; vendor-user context is separate from the core user context.
- Keep Insurance-owned schema, persistence, and services inside this plugin.
- Do not change JSON field shapes or tighten output nullability solely to satisfy frontend types. Contract changes require resolver/write-path and stored-data evidence and compatibility review.
- `src/apollo/typeDefs.ts` must stay importable without service startup or models, because the shared printer imports it to build the subgraph SDL.

## Validation

- `pnpm nx lint insurance_api`
- `pnpm nx build insurance_api`
- `pnpm nx run insurance_api:schema:print --skip-nx-cache`
- `pnpm exec tsc -p backend/plugins/insurance_api/tsconfig.json --noEmit`
- Smoke scenario: load insurance configuration and contracts through the local gateway; verify changes refetch in the UI and contract previews still render.
