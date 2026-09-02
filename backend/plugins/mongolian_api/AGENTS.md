# `mongolian_api` Plugin Guide

## Identity

- **Plugin:** `mongolian`
- **Project:** `mongolian_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/mongolian_api`
- **Last synchronized:** `2026-09-02`

## Scope

### Owns

- Mongolian-market integrations: eBarimt receipt issuing and put-response
  storage, product groups, product rules, Erkhet accounting sync,
  MS Dynamic sync, product place handling (pricing, split, place,
  print), exchange rates, and Mongolian integration configs.
- Mongolian-owned GraphQL schemas, resolvers, tRPC procedures, Mongoose
  models, after-mutation handlers, and after-process logic.

### Does not own

- Sales deals, pipelines, stages, POS orders, or their storage; those are
  consumed through the sales plugin's published tRPC contracts only.
- Core products, customers, users, branches, or shared platform packages.
- Frontend UI; any mongolian UI lives outside this project.
- Direct source imports from another plugin; cross-service access must use
  published GraphQL, tRPC, HTTP, event, or federation contracts.

## Current Capabilities

- Runs as the `mongolian` federated GraphQL and tRPC plugin service on
  port 3313 with tenant-scoped models and GraphQL subscriptions.
- Issues eBarimt receipts for POS orders and deals, stores put responses,
  and exposes them through GraphQL and tRPC (`putResponses` procedures
  consumed by the sales POS module).
- Reads sales deals for receipt detail, sync filtering, and deal links
  through the sales plugin's tRPC contracts.
- Syncs deals and orders to Erkhet and MS Dynamics, writing sync results
  back onto deals via the sales `deal.updateOne` tRPC contract.
- Applies product place rules (pricing, split, place, print) that rewrite
  deal `productsData` via the sales plugin's tRPC contracts.
- Manages eBarimt product groups and product rules, including the
  `productRules` tRPC contract consumed by accounting tax rules and the
  sales POS module.

## Architecture

| Area                  | Path                                       | Responsibility                                            |
| --------------------- | ------------------------------------------ | --------------------------------------------------------- |
| Bootstrap             | `src/main.ts`                              | Starts and registers the mongolian plugin                 |
| Runtime               | `src/connectionResolvers.ts`, `src/trpc`   | Tenant-scoped models and tRPC app router                   |
| Models                | `src/modules/*/db`                         | Mongolian Mongoose schemas and models                     |
| GraphQL               | `src/modules/*/graphql`, `src/apollo`      | Mongolian schemas, resolvers, subscriptions               |
| eBarimt               | `src/modules/ebarimt`                      | Receipt issuing, put responses, product groups/rules      |
| Erkhet                | `src/modules/erkhet`                       | Deal/order sync to the Erkhet accounting system           |
| MS Dynamic            | `src/modules/msdynamic`                    | Deal/order sync to MS Dynamics                             |
| Product places        | `src/modules/productPlaces`                | Deal product pricing, split, place, and print handling     |
| Exchange rates        | `src/modules/exchangeRates`                | Exchange rate storage and queries                         |
| Configs               | `src/modules/configs`                      | Mongolian integration configuration                       |
| After-process         | `src/meta/afterProcess.ts`                 | Post-mutation integration handlers                        |

## Contracts

### Provides

- Mongolian GraphQL schema and resolvers for eBarimt put responses,
  product groups, product rules, exchange rates, and sync queries.
- tRPC procedures under `src/trpc` and module trpc directories,
  including `putResponses.*` (consumed by the sales POS module) and
  `productRules.find` (consumed by accounting tax rules and sales POS).

### Consumes

- Sales deals and links through the sales plugin's tRPC contracts:
  `deal.findMany` (internal legacy dual-shape deal reads, not
  agent-facing), `deal.findOne`, `deal.getLink`, and `deal.updateOne`.
- Core products, customers, and configuration through public platform
  contracts.
- `erxes-api-shared` utilities and plugin startup APIs.

## Data and State

- Tenant-scoped Mongoose models are generated per request `subdomain`.
- eBarimt put responses, product groups, product rules, sync logs, and
  exchange rates are stored in mongolian-owned tenant-scoped collections.
- No sales, POS, or core documents are stored here; deal and order data
  are always fetched or written through sales plugin tRPC contracts.

## Local Invariants

- Preserve tenant isolation by using the request `subdomain` for every
  model, service, resolver, worker, and route access.
- All sales data access goes through the sales plugin's published tRPC
  contracts; never read or mutate another plugin's collections directly.
- `deal.findMany` is the service-only deal read: it restores the legacy
  `deal.find` dual-shape input and must not be replaced by the strict
  agent-facing `deal.find` contract.
- `sendTRPCMessage` returns `defaultValue` on any error, including input
  schema rejections; validate integration results defensively instead of
  assuming an empty array means "no data".

## Validation

- `pnpm nx build mongolian_api`
- Smoke scenario: issue an eBarimt receipt for a POS order and verify the
  put response is stored and queryable.
- Smoke scenario: trigger Erkhet deal sync and verify sync logs are
  created for the resolved deals.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-02` — Deal reads moved to `deal.findMany`

- **Summary:** eBarimt deal filtering and Erkhet deal sync now call the
  sales plugin's internal `deal.findMany` tRPC procedure instead of
  `deal.find`, which was tightened into a strict agent-facing contract
  by erxes #9102 and no longer accepts this plugin's bare
  Mongo-filter input shape.
- **Affected areas:** `src/modules/ebarimt/graphql/resolvers/queries/ebarimt.ts`,
  `src/modules/erkhet/graphql/resolvers/mutations/checkSynced.ts`.
- **Contracts changed:** Internal tRPC call sites only; no mongolian
  GraphQL or tRPC contract changed.
