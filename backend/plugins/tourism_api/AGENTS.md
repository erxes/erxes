# `tourism_api` Plugin Guide

## Identity

- **Plugin:** `tourism`
- **Project:** `tourism_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/tourism_api`
- **Last synchronized:** `2026-09-02`

## Scope

### Owns

- Tourism PMS room/deal availability queries, OTA data storage, BMS
  GraphQL and tRPC APIs, and tourism-owned db collections and constants.
- Tourism plugin GraphQL and tRPC contracts under `src/modules`.

### Does not own

- Sales deals, pipelines, and stages; consumed through the sales
  plugin's tRPC contracts only.
- Core products, customers, users, or shared platform packages.
- Frontend UI; any tourism UI lives outside this project.
- Direct source imports from another plugin; cross-service access must use
  published GraphQL, tRPC, HTTP, event, or federation contracts.

## Current Capabilities

- Runs as the `tourism` federated GraphQL and tRPC plugin service on
  port 3311 with tenant-scoped models.
- PMS resolvers resolve pipeline stages and scan deals to report room
  availability, busy rooms, and paginated deal lists by date range and
  product/stage filters.
- OTA module owns its tenant-scoped db collections and types.
- BMS module owns its db, GraphQL, and tRPC APIs.

## Architecture

| Area       | Path                          | Responsibility                                  |
| ---------- | ----------------------------- | ----------------------------------------------- |
| Bootstrap  | `src/main.ts`                 | Starts and registers the tourism plugin          |
| Runtime    | `src/connectionResolvers.ts`, `src/trpc` | Tenant-scoped models and tRPC app router |
| PMS        | `src/modules/pms`             | Room availability and deal-scan GraphQL queries  |
| OTA        | `src/modules/ota`              | OTA data storage and types                       |
| BMS        | `src/modules/bms`              | BMS GraphQL and tRPC APIs                        |

## Contracts

### Provides

- PMS GraphQL queries for room availability and deal listing
  (`src/modules/pms/graphql`).
- BMS GraphQL and tRPC contracts (`src/modules/bms`).

### Consumes

- Sales stages and deals through the sales plugin's tRPC contracts:
  `stage.find` and `deal.findMany` (internal legacy dual-shape deal
  reads, not agent-facing).
- `erxes-api-shared` utilities and plugin startup APIs.

## Data and State

- Tenant-scoped Mongoose models are generated per request `subdomain`.
- OTA and BMS data are stored in tourism-owned tenant-scoped collections.
- No sales documents are stored here; deals and stages are always fetched
  through sales plugin tRPC contracts.

## Local Invariants

- Preserve tenant isolation by using the request `subdomain` for every
  model, service, resolver, worker, and route access.
- All sales data access goes through the sales plugin's published tRPC
  contracts; never read or mutate another plugin's collections directly.
- `deal.findMany` is the service-only deal read: it restores the legacy
  `deal.find` dual-shape input (including the extra `search` key) and
  must not be replaced by the strict agent-facing `deal.find` contract.
- Availability scans intentionally request unbounded results; keep them
  on `deal.findMany`, never on the capped agent-facing `deal.find`.
- `sendTRPCMessage` returns `defaultValue` on any error, including input
  schema rejections; validate integration results defensively instead of
  assuming an empty array means "no data".

## Validation

- `pnpm nx build tourism_api`
- Smoke scenario: query PMS room availability for a date range with deals
  spanning the boundary and verify busy rooms and availability match.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-02` — Deal reads moved to `deal.findMany`

- **Summary:** All four PMS deal-scan call sites in
  `src/modules/pms/graphql/resolvers/queries/configs.ts` now call the
  sales plugin's internal `deal.findMany` tRPC procedure instead of
  `deal.find`, which was tightened into a strict agent-facing contract
  by erxes #9102 and rejected this plugin's `{ query, search, ... }`
  input shape.
- **Affected areas:** `src/modules/pms/graphql/resolvers/queries/configs.ts`.
- **Contracts changed:** Internal tRPC call sites only; no tourism
  GraphQL or tRPC contract changed.
