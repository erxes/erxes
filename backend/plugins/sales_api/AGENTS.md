# `sales_api` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/sales_api`
- **Last synchronized:** `2026-09-02`

## Scope

### Owns

- Sales boards, pipelines, stages, deals, labels, checklists, and plugin-owned
  sales data and API contracts.
- Sales deal, pipeline, board, stage, ecommerce, and POS API behavior
  implemented under `backend/plugins/sales_api`.
- Sales-owned GraphQL, tRPC, Mongoose models, metadata, reference resolvers,
  documents, and after-process handlers.

### Does not own

- Core property definitions, users, teams, or shared platform packages.
- Sales user interfaces; those live in `sales_ui`.
- Core API, gateway, shared libraries, frontend plugin code, loyalty score
  campaign internals, accounting, Mongolian integrations, or other plugins.
- Direct source imports from another plugin; cross-service access must use
  published GraphQL, tRPC, HTTP, event, or federation contracts.

## Current Capabilities

- Runs as the sales federated GraphQL and tRPC plugin service.
- Sales pipelines persist `propertyIds`; create and edit validate every id
  against Core `sales:deal` fields before writing it. A separate configured
  flag preserves legacy show-all behavior without making an empty selection
  ambiguous.
- Deals, pipelines, boards, stages, labels, products data, payments data, and
  sales references are exposed through sales-owned APIs.
- Sales record references provide deal display names, links, labels, product
  amount helpers, and `excludeLoyaltyAmount`.
- `excludeLoyaltyAmount` returns the deal total amount minus payments made
  through pipeline payment types that have a `scoreCampaignId`.
- POS and ecommerce modules provide sales-owned order and integration behavior.
- Read-only deal, stage, pipeline, POS, and POS-order tRPC procedures are
  exposed to AI agents through `/agent-tools/manifest` and `/agent-tools/call`
  via `.meta(agentMeta(...))` annotations; every other procedure remains
  invisible to agents.

## Architecture

| Area                | Path                                                    | Responsibility                                                        |
| ------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| Bootstrap           | `src/main.ts`                                           | Starts and registers the sales plugin                                 |
| Runtime             | `src/main.ts`, `src/connectionResolvers.ts`, `src/trpc` | Start the plugin, load tenant-scoped models, and expose tRPC          |
| Agent tool metadata | `src/trpc/agentMeta.ts`                                 | Local `agentMeta` helper for agent-callable tRPC annotations          |
| Models              | `src/modules/sales/db`                                  | Sales Mongoose schemas and models                                     |
| GraphQL             | `src/modules/sales/graphql`, `src/apollo`               | Sales schemas, resolvers, mutations, queries, and subscriptions       |
| Pipeline validation | `src/modules/sales/utils/pipelineProperties.ts`         | Validates pipeline property ids through Core tRPC                     |
| References          | `src/modules/sales/meta`                                | Sales reference values, automation constants, and after-process logic |
| Documents           | `src/modules/sales/documents`                           | Generate sales document content and amount mappings                   |
| POS and ecommerce   | `src/modules/pos`, `src/modules/ecommerce`              | Provide sales-owned POS and ecommerce behavior                        |

## Contracts

### Provides

- Federated sales GraphQL contracts including `salesPipelineDetail`,
  `salesPipelinesAdd`, and `salesPipelinesEdit`.
- Agent-callable tRPC tools (admit-only via `.meta({ agent })`), each gated by
  the listed sales permission action:
  - `deal.findOne`, `deal.getLink` — `showDeals`
  - `deal.find` — `showDeals`; strict input `{ query?, skip?, limit?, sort?, fields? }`
    (unknown keys rejected by name), always bounded (`limit` defaults to 20,
    hard max 100), `fields` drives a real projection
  - `deal.count` — `showDeals`; strict input `{ filter? }` (`{}` counts all)
  - `stage.findOne`, `stage.find` — `showDeals`
  - `pipeline.findOne` — `pipelinesWatch`
  - `pos.findOne`, `pos.find` — `posRead`
  - `pos.ordersDeliveryInfo`, `orders.findOne`, `orders.find` — `posOrderRead`
- tRPC service contracts under `src/trpc` and module-specific `trpc`
  directories for platform and cross-plugin callers (not agent-visible).
- Internal cross-plugin deal read contract `deal.findMany` (no agent
  annotation): accepts the legacy dual-shape input of the pre-#9102
  `deal.find` — a bare Mongo filter (input itself is the query) or the
  wrapped `{ query, search?, skip?, limit?, sort? }` form with unbounded
  results (`limit` 0 = unbounded, kept for tourism availability scans).
  `search` expands to the sales name/number/description/date predicate
  composed with `query` under `$and`. Input is a zod union validating
  `skip`/`limit` as non-negative integers while preserving Mongo
  operators. Consumed by accounting (`checkSynced`), mongolian
  (`ebarimt`, `erkhet checkSynced`), and tourism (`pms configs`).
- Record reference resolvers under `src/modules/sales/meta/references`.
- Sales metadata and automation contracts under `src/modules/sales/meta`.

### Consumes

- Core `fields.find` over tRPC for `sales:deal` property validation.
- `erxes-api-shared` core types, utilities, and core module extension points.
- Public platform contracts for products, customers, companies, users,
  branches, departments, and related records.
- Loyalty-facing sales deal payloads through published target/reference
  contracts, not loyalty internals.

## Data and State

- Tenant-scoped Mongoose models are generated per `subdomain`.
- Pipeline documents store a unique array of selected Core field ids in
  `propertyIds`; no property definitions are duplicated in sales storage.
- Tenant-scoped Mongo collections are loaded through plugin connection
  resolvers.
- Deal monetary state is stored in `productsData`, `totalAmount`,
  `unUsedTotalAmount`, `bothTotalAmount`, `mobileAmount`, `mobileAmounts`, and
  `paymentsData`.
- Pipeline payment type configuration may attach `scoreCampaignId` to payment
  types used by loyalty-related references.

## Local Invariants

- Never accept a pipeline property id outside Core `sales:deal` fields.
- Preserve tenant isolation by using the request `subdomain` for every model,
  service, resolver, worker, and route access.
- Pipeline stage updates and property selections remain one pipeline mutation.
- Checked pipeline deal queries preserve master branch department-user
  visibility and compose with existing filters through `$and`.
- Do not fetch department visibility data when the pipeline has no
  `departmentIds`.
- `excludeLoyaltyAmount` must calculate from the deal total minus
  score-campaign payment amounts, so missing or empty `paymentsData` returns
  the full total amount.
- Deal amount fallbacks should preserve the existing `tickUsed` semantics used
  by sales totals.
- Agent-facing deal reads are always bounded and strictly shaped: `deal.find`
  clamps `limit` to 1–100 (default 20) on every path and rejects unknown input
  keys by name, `deal.count` takes `{ filter? }` — an agent's unbounded
  `deal.find {}` over 1.27M deals crash-looped this service (exit 139) on
  2026-08-20, and wrapper-shaped input silently matched nothing.
- Do not introduce new `schemaWrapper` usage in backend schemas.
- Agent tool annotations are admit-only: never annotate raw-mongo helpers
  (`deal.aggregate`, `deal.updateOne`, `deal.findMany`, `orders.updateOne`),
  system-user procedures (`deal.create`, `deal.updateOne`), procedures that
  trust a caller supplied `user` object (`deal.createItem`, `deal.editItem`),
  POS device-sync endpoints (`pos.createOrUpdateOrders*`, `pos.confirmCover`),
  token-scoped lookups (`pos.ecommerceGetBranches`), destructive bulk
  operations (`deal.removeItem`), or internal plumbing (`deal.subscriptionWrapper`,
  `deal.tag`, `deal.getFilterParams`, `deal.replaceContent`,
  `deal.contentIds`, `deal.generateInternalNoteNotif`, `deal.notifiedUserIds`,
  `deal.createCommentActivityLog`, `documents.editorAttributes`,
  `fields.getFieldList`). New procedures are agent-invisible unless explicitly
  annotated.
- Cross-plugin service callers and agents must not share one input schema:
  `deal.find` is the strict, bounded, agent-facing contract; `deal.findMany`
  is the lax, unbounded, service-only contract. Before tightening any
  tRPC procedure input, sweep every plugin and `erxes-api-shared` for
  `sendTRPCMessage` callers of that procedure — `sendTRPCMessage` swallows
  zod rejections into `defaultValue`, so a broken caller fails silently
  with empty results instead of erroring.

## Validation

- `pnpm nx lint sales_api` (pre-existing errors in `modules/ecommerce/routes.ts`
  and `modules/sales/meta/segments/utils.ts` are not from recent changes)
- `pnpm nx build sales_api`
- Create or edit a pipeline with valid and invalid deal property ids; valid ids
  persist and an invalid id is rejected.
- Smoke scenario: resolve `sales:deal.excludeLoyaltyAmount` for a deal with
  empty `paymentsData`; it should return the deal total amount, not `0`.
- Smoke scenario: `GET /agent-tools/manifest` on the sales service lists only
  the annotated procedures above; `deal.create`, `deal.updateOne`, and
  `deal.subscriptionWrapper` never appear.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-02` — Review hardening of `deal.findMany`

- **Summary:** Addressed PR #9207 review findings: `deal.findMany` input
  is now a zod union (bare record or wrapped
  `{ query, search?, skip?, limit?, sort? }` with non-negative integer
  `skip`/`limit`) instead of `z.any()`, and the previously dropped
  `search` key now expands to the sales name/number/description/date
  predicate composed with `query` under `$and`, so tourism PMS room
  searches filter correctly.
- **Affected areas:** `src/modules/sales/trpc/deal.ts`.
- **Contracts changed:** `deal.findMany` wrapped input now honors
  `search`; malformed inputs (non-object, negative skip/limit) are
  rejected instead of reaching Mongo.

### `2026-09-02` — Internal `deal.findMany` service contract

- **Summary:** Restored the cross-plugin deal read path that #9102
  unintentionally severed: `deal.find` was a shared service contract
  (legacy dual-shape — bare Mongo filter or `{ query, search?, skip?,
limit?, sort? }`) before #9058 also exposed it to agents and #9102
  tightened it for agents only. The #9102 claim that no cross-plugin
  callers existed was wrong: accounting, mongolian (ebarimt, erkhet),
  and tourism (4 PMS sites) called `deal.find`, and their zod-rejected
  inputs were silently swallowed into `defaultValue: []` by
  `sendTRPCMessage`, producing silent sync failures and empty results.
  Added unannotated `deal.findMany` (invisible to agents) restoring the
  exact legacy semantics and migrated all 7 call sites to it.
- **Affected areas:** `src/modules/sales/trpc/deal.ts` (`deal.findMany`
  added); cross-plugin callers in accounting, mongolian, and tourism
  updated to call `deal.findMany`.
- **Contracts changed:** `deal.find` (agent-facing, strict, bounded) is
  unchanged; new internal `deal.findMany` (service-only, legacy dual-shape,
  unbounded) carries the cross-plugin contract.

### `2026-08-21` — Bounded, strict agent-facing deal reads

- **Summary:** `deal.find` can no longer execute unbounded or mis-shaped
  queries: input is now a strict zod object (`{ query?, skip?, limit?, sort?, fields? }`
  — unknown keys such as an invented `arg` wrapper are rejected by name
  instead of silently matching nothing), results are always bounded (`limit`
  defaults to 20 and is hard-capped at 100, including the no-query path — an
  agent's `deal.find {}` over 1.27M deals crash-looped this service with
  exit 139 on 2026-08-20), and `fields` now drives a real projection so
  agents stay under the 64KB agent-tools response budget. `deal.count` takes
  an explicit `{ filter? }` object for the same reason (a `{ query: ... }`
  wrapper previously counted 0 silently). The 2026-08-21 claim that no
  cross-plugin callers existed was disproven on 2026-09-02 — see the
  `deal.findMany` entry above; agent-facing `deal.find` behavior itself
  is unchanged.
- **Affected areas:** `src/modules/sales/trpc/deal.ts`.
- **Contracts changed:** `deal.find` input is now strict
  `{ query?, skip?, limit?, sort?, fields? }` (the bare top-level filter form
  is rejected) with `limit` clamped to 1–100 (default 20); `deal.count` input
  is now strict `{ filter? }` instead of a bare filter object.

### `2026-08-19` — Agent-callable tRPC tools

- **Summary:** Read-only deal, stage, pipeline, POS, and POS-order tRPC
  procedures are now exposed to AI agents through the platform agent-tools
  manifest.
- **Affected areas:** `src/trpc/agentMeta.ts` (new local helper mirroring
  core-api), `src/modules/sales/trpc/deal.ts`, `src/modules/pos/trpc/pos.ts`.
- **Contracts changed:** New agent-tool manifest entries `deal.findOne`,
  `deal.find`, `deal.count`, `deal.getLink`, `stage.findOne`, `stage.find`,
  `pipeline.findOne`, `pos.findOne`, `pos.find`, `pos.ordersDeliveryInfo`,
  `orders.findOne`, `orders.find`, gated by `showDeals`, `pipelinesWatch`,
  `posRead`, and `posOrderRead`. No existing GraphQL or tRPC behavior changed.

### `2026-08-19` — Checked pipeline deal query filter

- **Summary:** Checked pipeline visibility now uses the master branch department-user rules, skips department lookups without pipeline departments, and preserves existing query filters.
- **Affected areas:** `src/modules/sales/graphql/resolvers/queries/deals.ts`.
- **Contracts changed:** None.

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
