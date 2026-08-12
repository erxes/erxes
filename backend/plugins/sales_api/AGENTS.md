# `sales_api` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/sales_api`
- **Last synchronized:** `2026-08-12`

## Scope

### Owns

- Sales deal, pipeline, board, stage, ecommerce, and POS API behavior implemented under `backend/plugins/sales_api`.
- Sales-owned GraphQL, tRPC, Mongoose models, metadata, reference resolvers, documents, and after-process handlers.

### Does not own

- Core API, gateway, shared libraries, frontend plugin code, loyalty score campaign internals, accounting, Mongolian integrations, or other plugins.
- Direct source imports from another plugin; cross-service access must use published GraphQL, tRPC, HTTP, event, or federation contracts.

## Current Capabilities

- Deals, pipelines, boards, stages, labels, products data, payments data, and sales references are exposed through sales-owned APIs.
- Sales record references provide deal display names, links, labels, product amount helpers, and `excludeLoyaltyAmount`.
- `excludeLoyaltyAmount` returns the deal total amount minus payments made through pipeline payment types that have a `scoreCampaignId`.
- POS and ecommerce modules provide sales-owned order and integration behavior.

## Architecture

| Area                       | Path                                                    | Responsibility                                                                    |
| -------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Runtime                    | `src/main.ts`, `src/connectionResolvers.ts`, `src/trpc` | Start the plugin, load tenant-scoped models, and expose tRPC procedures.          |
| Sales models               | `src/modules/sales/db`                                  | Store deals, boards, pipelines, stages, labels, and sales metadata.               |
| Sales GraphQL              | `src/modules/sales/graphql`, `src/apollo`               | Provide sales schemas, resolvers, mutations, queries, and subscriptions.          |
| References and automations | `src/modules/sales/meta`                                | Provide sales reference values, automation constants, and after-process behavior. |
| Documents                  | `src/modules/sales/documents`                           | Generate sales document content and amount mappings.                              |
| POS and ecommerce          | `src/modules/pos`, `src/modules/ecommerce`              | Provide sales-owned POS and ecommerce behavior.                                   |

## Contracts

### Provides

- GraphQL contracts for sales, POS, and ecommerce modules registered through `src/apollo`.
- tRPC contracts under `src/trpc` and module-specific `trpc` directories.
- Record reference resolvers under `src/modules/sales/meta/references`.
- Sales metadata and automation contracts under `src/modules/sales/meta`.

### Consumes

- `erxes-api-shared` core types, utilities, and core module extension points.
- Public platform contracts for products, customers, companies, users, branches, departments, and related records.
- Loyalty-facing sales deal payloads through published target/reference contracts, not loyalty internals.

## Data and State

- Tenant-scoped Mongo collections are loaded through plugin connection resolvers.
- Deal monetary state is stored in `productsData`, `totalAmount`, `unUsedTotalAmount`, `bothTotalAmount`, `mobileAmount`, `mobileAmounts`, and `paymentsData`.
- Pipeline payment type configuration may attach `scoreCampaignId` to payment types used by loyalty-related references.

## Local Invariants

- Preserve tenant isolation by using the request `subdomain` for every model and service access.
- `excludeLoyaltyAmount` must calculate from the deal total minus score-campaign payment amounts, so missing or empty `paymentsData` returns the full total amount.
- Deal amount fallbacks should preserve the existing `tickUsed` semantics used by sales totals.
- Do not introduce new `schemaWrapper` usage in backend schemas.

## Validation

- `pnpm nx build sales_api`
- `pnpm nx test sales_api` (when `project.json` defines a test target)
- Smoke scenario: resolve `sales:deal.excludeLoyaltyAmount` for a deal with empty `paymentsData`; it should return the deal total amount, not `0`.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-12` — `Exclude loyalty amount reference`

- **Summary:** `excludeLoyaltyAmount` now returns deal total minus score-campaign payment amounts instead of summing non-score payments.
- **Affected areas:** `src/modules/sales/meta/references/salesRefernceCustomResolvers.ts`, `src/modules/sales/@types/deal.ts`
- **Contracts changed:** `sales:deal.excludeLoyaltyAmount` calculation semantics corrected for empty or partial `paymentsData`.
