# `sales_api` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/sales_api`
- **Last synchronized:** `2026-08-12`

## Scope

### Owns

- Sales boards, pipelines, stages, deals, labels, checklists, POS, and sales e-commerce APIs and data.

### Does not own

- Core contacts, users, products, relations, authentication, shared runtime, or another plugin's implementation.

## Current Capabilities

- Serves federated sales, POS, and e-commerce GraphQL and tRPC contracts on port `3305`.
- Manages deals, pipelines, and stages with optional stage codes unique within each pipeline.
- Searches deals by escaped name/number and limits customer-phone lookup to phone-shaped input.

## Architecture

| Area       | Path                                                   | Responsibility                                 |
| ---------- | ------------------------------------------------------ | ---------------------------------------------- |
| Bootstrap  | `backend/plugins/sales_api/src/main.ts`                | Starts and registers the plugin runtime        |
| Models     | `backend/plugins/sales_api/src/connectionResolvers.ts` | Creates tenant-scoped models                   |
| Sales      | `backend/plugins/sales_api/src/modules/sales`          | Owns deal, board, pipeline, and stage behavior |
| POS        | `backend/plugins/sales_api/src/modules/pos`            | Owns POS behavior                              |
| E-commerce | `backend/plugins/sales_api/src/modules/ecommerce`      | Owns sales e-commerce behavior                 |

## Contracts

### Provides

- Federated GraphQL, subscriptions, tRPC routers, and HTTP endpoints for sales-owned capabilities.

### Consumes

- Public `erxes-api-shared` APIs and core tRPC contracts for contacts, relations, users, structure, and products.

## Data and State

- All collections are resolved from request `subdomain` models.
- `sales_stages.code` is optional and unique within a pipeline's final stage list.
- Deal real-time state is published through shared GraphQL pub/sub.

## Local Invariants

- Validate all non-empty stage codes before applying pipeline stage writes.
- New and existing stages follow the same pipeline-scoped code uniqueness rule.
- Alphanumeric vehicle identifiers never trigger customer-phone lookup.
- Deal search values remain regex-escaped.

## Validation

- `pnpm nx build sales_api`
- No `lint` or `test` target is defined in `backend/plugins/sales_api/project.json`.
- Smoke: allow a code reused across pipelines, reject duplicates in one pipeline, and ensure `1971uba` does not add phone-related deals.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-12` — Enforce stage codes and narrow search

- **Summary:** Pipeline stage saves validate final codes, while alphanumeric deal searches skip customer-phone matching.
- **Affected areas:** `src/modules/sales/db/models/Stages.ts`, `src/modules/sales/graphql/resolvers/{utils.ts,queries/deals.ts}`
- **Contracts changed:** Stage code uniqueness is pipeline-scoped; GraphQL shapes are unchanged.
