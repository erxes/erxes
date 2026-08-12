# `loyalty_api` Plugin Guide

## Identity

- **Plugin:** `loyalty`
- **Project:** `loyalty_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/loyalty_api`
- **Last synchronized:** `2026-08-10`

## Scope

### Owns

- Loyalty score, voucher, coupon, lottery, spin, reward, agent, and pricing API behavior.
- Plugin-owned GraphQL, tRPC, Mongoose models, commands, metadata, and event handlers under `backend/plugins/loyalty_api`.

### Does not own

- Core API, gateway, shared libraries, frontend plugin code, sales deal persistence, POS order persistence, or other plugins.
- Direct source imports from another plugin; cross-service access must use published GraphQL, tRPC, HTTP, event, or federation contracts.

## Current Capabilities

- Score campaigns can add, subtract, set, refund, repair, and expose owner score balances.
- Deal score campaign totals count only deal `productsData` rows with `tickUsed === true` and no meaningful product discount.
- POS order score campaign totals use order item amounts without deal-specific discount filtering.
- Pricing plans calculate product discounts through the loyalty pricing module and tRPC `pricing.checkPricing`.
- Voucher, coupon, lottery, spin, reward, and agent modules provide their plugin-owned loyalty behaviors.

## Architecture

| Area | Path | Responsibility |
| --- | --- | --- |
| Runtime | `src/main.ts`, `src/connectionResolvers.ts`, `src/trpc/init-trpc.ts` | Start the plugin, load tenant-scoped models, and expose tRPC procedures. |
| Score models | `src/modules/score/db` | Store score campaigns and score logs, apply ledger changes, and maintain owner score fields. |
| Score orchestration | `src/utils/utils.ts`, `src/modules/score/utils.ts`, `src/meta/automations/score` | Normalize sales/POS targets, trigger score campaigns, and support score reporting helpers. |
| Pricing | `src/modules/pricing` | Store pricing plans and calculate eligible discount rules. |
| GraphQL | `src/apollo`, `src/modules/*/graphql` | Provide plugin-owned schemas, queries, mutations, and custom resolvers. |
| Commands | `src/commands` | Run bounded maintenance and recovery scripts for loyalty-owned data. |

## Contracts

### Provides

- GraphQL contracts for loyalty modules registered through `src/apollo`.
- tRPC procedures in `src/trpc/init-trpc.ts`, including `score.scoreCampaign`, `pricing.checkPricing`, and `doScoreCampaign`.
- Metadata, permission, automation, and after-process handlers under `src/meta`.

### Consumes

- `erxes-api-shared` core types, utilities, and core module extension points.
- Core service tRPC contracts for products, tags, categories, customers, companies, users, segments, and client portal users.
- Sales deal and POS order target payloads passed over plugin/public service boundaries.

## Data and State

- Tenant-scoped Mongo collections are loaded through `generateModels(subdomain)` and plugin connection resolvers.
- Score balance state is persisted in `score_logs` plus owner score/cache updates through `scoreLedger`.
- Score campaign target normalization derives calculation-only fields such as `totalAmount`, `paymentsData`, and `excludeAmount`.
- Pricing plans and rules are plugin-owned loyalty collections.

## Local Invariants

- Preserve tenant isolation by using the request `subdomain` for every model and service access.
- Deal score totals must exclude discounted `productsData` rows and rows where `tickUsed` is not exactly `true`.
- Score campaign mutations must keep owner score caches and score logs consistent, including refunds for cleared or moved targets.
- Pricing eligibility must fail closed when required core lookups are unavailable.
- Do not introduce new `schemaWrapper` usage in backend schemas.

## Validation

- `pnpm nx build loyalty_api`
- `pnpm nx test loyalty_api`
- `pnpm nx test loyalty_api --testPathPattern scoreTarget`
- Smoke scenario: trigger a sales deal score campaign with mixed `productsData`; only ticked, undiscounted rows should contribute to `totalAmount`.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-10` — `Deal score product eligibility`

- **Summary:** Deal score campaign totals now explicitly count only ticked, undiscounted product rows and cover the rule with unit tests.
- **Affected areas:** `src/utils/scoreTarget.ts`, `src/utils/utils.ts`, `src/utils/__tests__/scoreTarget.test.ts`
- **Contracts changed:** `None`
