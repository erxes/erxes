# `loyalty_api` Plugin Guide

## Identity

- **Plugin:** `loyalty`
- **Project:** `loyalty_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/loyalty_api`
- **Last synchronized:** `2026-08-25`

## Scope

### Owns

- Loyalty score, voucher, coupon, lottery, spin, reward, agent, and pricing API behavior.
- Plugin-owned GraphQL, tRPC, Mongoose models, commands, metadata, and event handlers under `backend/plugins/loyalty_api`.

### Does not own

- Core API, gateway, shared libraries, frontend plugin code, sales deal persistence, POS order persistence, or other plugins.
- Direct source imports from another plugin; cross-service access must use published GraphQL, tRPC, HTTP, event, or federation contracts.

## Current Capabilities

- Score campaigns can add, subtract, set, refund, repair, and expose owner score balances.
- Deal score campaign totals count only deal `productsData` rows that pass campaign product/category/tag restrictions and have `tickUsed === true`; discounted rows are skipped only when the campaign has `additionalConfig.discountCheck === true`.
- POS order score campaign totals count only order item rows that pass campaign product/category/tag restrictions and use item amount or `count * unitPrice` without deal-specific discount filtering.
- Pricing plans calculate product discounts through the loyalty pricing module and tRPC `pricing.checkPricing`.
- Voucher, coupon, lottery, spin, reward, and agent modules provide their plugin-owned loyalty behaviors.
- Read-only loyalty tRPC procedures (voucher/coupon/pricing/score-campaign
  checks) are exposed to AI agents through `/agent-tools/manifest` and
  `/agent-tools/call` via `.meta(agentMeta(...))` annotations; every mutating
  ledger procedure remains invisible to agents.

## Architecture

| Area                | Path                                                                             | Responsibility                                                                               |
| ------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Runtime             | `src/main.ts`, `src/connectionResolvers.ts`, `src/trpc/init-trpc.ts`             | Start the plugin, load tenant-scoped models, and expose tRPC procedures.                     |
| Agent tool metadata | `src/trpc/agentMeta.ts`                                                          | Local `agentMeta` helper for agent-callable tRPC annotations.                                |
| Score models        | `src/modules/score/db`                                                           | Store score campaigns and score logs, apply ledger changes, and maintain owner score fields. |
| Score orchestration | `src/utils/utils.ts`, `src/modules/score/utils.ts`, `src/meta/automations/score` | Normalize sales/POS targets, trigger score campaigns, and support score reporting helpers.   |
| Pricing             | `src/modules/pricing`                                                            | Store pricing plans and calculate eligible discount rules.                                   |
| GraphQL             | `src/apollo`, `src/modules/*/graphql`                                            | Provide plugin-owned schemas, queries, mutations, and custom resolvers.                      |
| Commands            | `src/commands`                                                                   | Run bounded maintenance and recovery scripts for loyalty-owned data.                         |

## Contracts

### Provides

- GraphQL contracts for loyalty modules registered through `src/apollo`.
- tRPC procedures in `src/trpc/init-trpc.ts`, including `score.scoreCampaign`, `pricing.checkPricing`, and `doScoreCampaign`.
- Agent-callable tRPC tools (admit-only via `.meta({ agent })`), each gated by
  the listed loyalty permission action:
  - `loyalty.checkLoyalties` — `loyaltyCheck`
  - `pricing.checkPricing` — `pricingView`
  - `coupon.checkCoupon` — `couponView`
  - `score.scoreCampaign`, `score.getScoreCampaignsByStage` —
    `loyaltyCampaignView`
  - `voucher.voucherCampaigns` — `loyaltyCampaignView` (voucherCampaign module)
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
- Deal score totals must exclude rows where `tickUsed` is not exactly `true`; discounted rows are excluded only when `additionalConfig.discountCheck === true`; product/category/tag restrictions must also filter deal and POS order rows that contribute to `totalAmount`.
- Score campaign mutations must keep owner score caches and score logs consistent, including refunds for cleared or moved targets.
- Pricing eligibility must fail closed when required core lookups are unavailable.
- Do not introduce new `schemaWrapper` usage in backend schemas.
- Agent tool annotations are admit-only: never annotate the mutating ledger
  procedures (`loyalty.confirmLoyalties`, `loyalty.handleLoyaltyReward`,
  `loyalty.changeCustomer`, `score.updateScore`, `score.doScoreCampaign`,
  `score.consumeTargetChange`, `score.refundLoyaltyScore`) — they move score
  and voucher state and trust caller-supplied payloads. New procedures are
  agent-invisible unless explicitly annotated.

## Validation

- `pnpm nx build loyalty_api`
- `pnpm nx test loyalty_api`
- `pnpm nx test loyalty_api --testPathPattern scoreTarget`
- Smoke scenario: trigger a sales deal and POS order score campaign with mixed product rows; only rows matching product/category/tag restrictions should contribute to `totalAmount`, deal rows must also have `tickUsed === true`, and discounted deal rows should be skipped only when `additionalConfig.discountCheck` is enabled.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-25` — Agent-callable loyalty reads

- **Summary:** Read-only voucher/coupon/pricing/score-campaign tRPC procedures
  are now exposed to AI agents through the platform agent-tools manifest, each
  gated by a registered loyalty permission; all mutating ledger procedures
  stay invisible.
- **Affected areas:** `src/trpc/agentMeta.ts` (new local helper mirroring
  core-api), `src/trpc/init-trpc.ts`.
- **Contracts changed:** New agent-tool manifest entries
  `loyalty.checkLoyalties`, `pricing.checkPricing`, `coupon.checkCoupon`,
  `score.scoreCampaign`, `score.getScoreCampaignsByStage`, and
  `voucher.voucherCampaigns`. No existing GraphQL or tRPC behavior changed.

### `2026-08-12` — `Campaign-specific product totals`

- **Summary:** Deal and POS order score campaign totals now apply product/category/tag restrictions, with deal-only `tickUsed` and discount-check handling preserved.
- **Affected areas:** `src/modules/score/db/models/ScoreCampaign.ts`, `src/utils/utils.ts`, `src/utils/__tests__/scoreTarget.test.ts`
- **Contracts changed:** `None`
