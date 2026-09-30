# `loyalty_api` Plugin Guide

## Identity

- **Plugin:** `loyalty`
- **Project:** `loyalty_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/loyalty_api`
- **Last synchronized:** `2026-09-30`

## Scope

### Owns

- Loyalty score, voucher, coupon, lottery, spin, reward, agent, and pricing API behavior.
- Plugin-owned GraphQL, tRPC, Mongoose models, commands, metadata, and event handlers under `backend/plugins/loyalty_api`.

### Does not own

- Core API, gateway, shared libraries, frontend plugin code, sales deal persistence, POS order persistence, or other plugins.
- Direct source imports from another plugin; cross-service access must use published GraphQL, tRPC, HTTP, event, or federation contracts.

## Current Capabilities

- Score campaigns can add, subtract, set, refund, repair, and expose owner score balances.
- Loyalty account types (`loyaltyAccountTypes`) define named balances per owner type; each account type owns one core featured field that mirrors its ledger balance. Account types are archived, never deleted.
- Each owner gets one loyalty account (`loyalty_accounts`: random 10-digit number, status, per-type balances) the first time a balance of any account type is written for them; cpUser balances open the linked customer's account. Accounts can be frozen with a required reason (`loyaltyAccountFreeze` / `loyaltyAccountUnfreeze`); the account type's `frozenBlocks` decides whether a frozen account blocks only spending (default) or all changes.
- Account types carry an ordered tier list (lowest first; removed tiers stay as `deprecated`) mirrored by a second featured `select` field (key `tier`). `loyaltyAccountSetTier` sets an account's tier for one type; last write wins and loyalty never decides tiers itself.
- Account types set point expiry (`expiry.mode`: `none`, `calendar` = cleared at each `reset.period`, `rolling` = each earning expires `expiry.months` after it) and optional `pendingDays` (purchase earnings wait before they can be spent). The tier reset follows `reset.period` / `reset.tierTo` (`keep` / `none` / `lowest`).
- Every keyed balance is backed by lots (`loyalty_lots`): each earning is a lot, spending takes soonest-expiring then oldest first, pending lots sit in `balances.<key>.pending`. Refunds may leave debt (negative balance) that later earnings pay off.
- Time-driven work runs nightly per organization (`loyalty-periods` queue, `5 0 * * *` in `LOYALTY_TIME_ZONE`, default `Asia/Ulaanbaatar`), and only for organizations with a wallet that expires, holds purchases back or resets, or with dated/pending lots left (`services/periodSchedule.ts`; kept in step on wallet create/update/archive, removed by the run itself when nothing is left). A run releases pending lots, expires rolling lots (`expire` log), then does calendar and tier resets; all bypass freezing. The old hourly `loyalty-daily-check` scheduler is removed at start.
- A score campaign writes to exactly one account type (`accountTypeId`), which also decides its `ownerType`; only campaigns created before account types may stay without one and keep writing the default score. Campaigns have no client-portal-only switch; who may earn is an automation or segment concern.
- A campaign earns only through its earning table (`add.table`) and spends only through its spending rules (`subtract.rules`); formulas, the `set` action and the campaign `currencyRatio` are gone. The table has base and bonus rows with conditions (amount range, products, first purchase from this campaign, source), a value either the same for everyone (`values.all`) or per column (`values.none` for owners without a tier, then tier keys; an empty cell earns nothing) and an optional cap. Rules count money and divide by the account type's `currencyRatio` (1 point = N money). Rows are `base` (only the first matching one earns) or `bonus` (every matching one adds). Each row's `valueType` says how its value reads: a base row is `percent` (N% of the amount) or `multiplier` (the rate's points times N); a bonus row is `percent`, `fixed` points or `multiplier` (the base points times N, of which the base already gave one; each such bonus adds and is capped on its own). `normalizeEarnTable` keeps each kind to its own types and turns a former `multiplier` row into a bonus `multiplier`. `scoreCampaignEarnPreview` evaluates an unsaved table for a sample amount per tier. Callers may pass `earnRowKeys` to turn rows on. Score logs keep the per-row `breakdown`.
- Points are earned only by the "Adjust score" automation action, from a purchase (`ILoyaltyPurchase`: `totalAmount`, `paidAmount` = paid with money, `items` of `{ productId, amount, discounted }`) that the action declares as `inputs` and the trigger's own plugin fills through its `actionInputs` (sales deal and POS order triggers). Loyalty never reads a deal or an order. A trigger that declares nothing (a customer, a birthday) gives a zero purchase, so only fixed-point rows earn on it. The action only gives; an older config with `action: 'subtract'` fails with CONFIG_INVALID.
- When the action moves no one's balance, `ScoreCampaigns.earn` reports every reason through its optional `onSkip` (`explainEmptyEarn`: no selected rows, no value for the owner's tier column, row conditions unmet, no amount, rounded to zero) and the producer returns a `skipped` outcome.
- Spending and refunds belong to the selling side: tRPC `score.checkSpend` / `score.spend` take `pointsPaymentAmount` (the whole amount paid with points; a repeat moves only the difference) and `totalAmount`, and `score.refund` undoes every standing earning and spending on a `targetId` (`ScoreCampaigns.refundTarget`). Campaigns have no deal-stage rules (`additionalConfig.cardBasedRule` is stripped on save).
- Every ledger write records an activity log (`loyalty.score.<action>`) on the owner's record and, when the log has `targetId` + `targetType`, on that record too (`ScoreLogs.recordActivity`). Entries without an actor (`createdBy` / `actorId`) are not written, since core rejects them.
- Account types carry both rates: `currencyRatio` (earning: every N of money is 1 point) and `pointValue` (spending: 1 point pays N). A campaign's spending rules are `minBalance`, `maxShare` % of the order and `step`; rules turn `pointsPaymentAmount` into points through `pointValue` and are enforced by loyalty in both `checkSpend` and `spend` (`services/spendRules.ts`).
- `loyaltyAccountTypesAdoptCampaignFields` turns the custom fields legacy campaigns write into account types in place (same field id, values recast to numbers); `loyaltyAccountTypeLegacyFieldCount` reports how many remain.
- With purchase `items`, a campaign's total counts only items that pass its product/category/tag restrictions; discounted items are skipped only when `additionalConfig.discountCheck === true`. Without items the purchase `totalAmount` is used as is.
- Pricing plans calculate product discounts through the loyalty pricing module and tRPC `pricing.checkPricing`.
- Pricing plan updates remove persisted start and end dates when their enabled flags are disabled.
- Pricing plan lists honor `page` and `perPage`, with deterministic `_id`
  tie-breaking after the requested or default sort field.
- Public and base pricing plans write scoped product discount metadata to core products; public entries use `base: null`, while base entries use `base: true` and may be scoped by branch, department, and pipeline.
- Core product create and update events recalculate that product's active public and base pricing discounts, clearing stale discounts when it leaves every plan filter.
- Voucher, coupon, lottery, spin, reward, and agent modules provide their plugin-owned loyalty behaviors.
- `loyaltyAccounts` lists loyalty accounts newest first (cursor paginated on `joinedAt`) with filters for owner type, status, account type and its tier (`none` = holds the type without a tier); `searchValue` is either a 10-digit account number or text matched against owners in core (customers, companies, users; at most 200 owners per type), built in `services/accountList.ts`. `LoyaltyAccount.owner` resolves the owner document.

## Architecture

| Area                  | Path                                                                                                                     | Responsibility                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Runtime               | `src/main.ts`, `src/connectionResolvers.ts`, `src/trpc/init-trpc.ts`                                                     | Start the plugin, load tenant-scoped models, and expose tRPC procedures.                                                    |
| Score models          | `src/modules/score/db`                                                                                                   | Store score campaigns and score logs, apply ledger changes, and maintain owner score fields.                                |
| Loyalty account types | `src/modules/score/db/models/AccountType.ts`, `src/modules/score/services/accountBalance.ts`                             | Define account types, bind their core featured balance field, archive, and adopt legacy fields.                             |
| Loyalty accounts      | `src/modules/score/db/models/Account.ts`                                                                                 | Open one account per owner and mirror per-type balances and tiers.                                                          |
| Tiers and resets      | `src/modules/score/services/accountTier.ts`, `src/modules/score/services/accountReset.ts`, `src/worker/index.ts`         | Set tiers with featured field convergence; reset due account types per period.                                              |
| Earning table         | `src/modules/score/services/earnTable.ts`, `src/modules/score/services/earnContext.ts`                                   | Normalize and evaluate campaign earning tables (pure), build their context (tier, amounts, product scopes, first purchase). |
| Lots                  | `src/modules/score/db/models/Lot.ts`, `src/modules/score/services/lotPolicy.ts`, `src/modules/score/services/lotJobs.ts` | FIFO lot consumption, pending release, rolling expiry, lot reconciliation.                                                  |
| Score orchestration   | `src/meta/automations/score`, `src/modules/score/@types/purchase.ts`, `src/modules/score/utils.ts`                       | Earn from the action's purchase inputs, set tiers, and support score reporting helpers.                                     |
| Pricing               | `src/modules/pricing`                                                                                                    | Store pricing plans and calculate eligible discount rules.                                                                  |
| Product event sync    | `src/meta/afterProcess.ts`                                                                                               | Recalculate one core product's public and base discounts after product create or update.                                    |
| GraphQL               | `src/apollo`, `src/modules/*/graphql`                                                                                    | Provide plugin-owned schemas, queries, mutations, and custom resolvers.                                                     |
| Commands              | `src/commands`                                                                                                           | Run bounded maintenance and recovery scripts for loyalty-owned data.                                                        |

## Contracts

### Provides

- GraphQL contracts for loyalty modules registered through `src/apollo`, including `loyaltyAccountOfOwner`, `loyaltyAccountFreeze`, `loyaltyAccountUnfreeze`, `loyaltyAccountSetTier`, `loyaltyAccountTypes`, `loyaltyAccountType`, `loyaltyAccountTypeLegacyFieldCount`, `loyaltyAccountTypeAdd`, `loyaltyAccountTypeEdit`, `loyaltyAccountTypeArchive`, `loyaltyAccountTypeUnarchive`, and `loyaltyAccountTypesAdoptCampaignFields`; `ScoreCampaign` exposes `accountTypeId` and `accountType`.
- tRPC procedures in `src/trpc/init-trpc.ts`, including `score.scoreCampaign`, `score.checkSpend`, `score.spend`, `score.refund` and `pricing.checkPricing`.
- Automation action `loyalty:score.score.create` declares `inputs` `totalAmount`, `paidAmount`, `items`.
- Metadata, permission, automation, and after-process handlers under `src/meta`.

### Consumes

- `erxes-api-shared` core types, utilities, and core module extension points.
- Core service tRPC contracts for products, tags, categories, customers, companies, users, segments, and client portal users, including product discount replacement.
- Core featured field contracts `fields.ensureFeatured`, `fields.setFeaturedValues`, `fields.setFeaturedArchived`, `fields.adoptFeatured`, and `fields.releaseFeatured`, owned as `{ plugin: 'loyalty', module: 'accountType', refId: accountTypeId }` with keys `balance` and `tier`.
- Automation action `inputs` resolved by the automations engine from the trigger plugin's `actionInputs`.
- Core activity log contract through the plugin event dispatcher (`score_logs`).

## Data and State

- Tenant-scoped Mongo collections are loaded through `generateModels(subdomain)` and plugin connection resolvers.
- Score balance state is persisted in `score_logs` plus owner score/cache updates through `scoreLedger`; `score_logs` stays the source of truth and stamps `accountTypeId` when the campaign has one.
- `loyalty_accounts` holds one account per owner (status `active` / `frozen` / `closed`, freeze time/user/reason) (`ownerType` + `ownerId` unique) with `balances.<accountTypeId>` holding the spendable `balance`, `pending`, `lots` (backed-by-lots flag), `tier`, `tierSince` and `resetAt` (start of the last period it was reset for); score logs stamp `accountId`.
- `loyalty_lots` holds one row per earning (`amount`, `remaining`, `availableAt`, `expiresAt`, `sortAt`, `status` pending / available / closed, `sourceLogId`).
- `loyalty_account_types` holds account type definitions; each owner's balance of a type lives on the owner record at `propertiesData.<accountType.fieldId>` (cpUser balances write the linked customer).
- `score_logs.targetType` names the record type of `targetId` (e.g. `sales:sales.deals`); older logs have none.
- Pricing plans and rules are plugin-owned loyalty collections; derived public and base discounts are synchronized onto core product documents through public core tRPC contracts.
- Pricing plan list pagination is page-based and defaults to 20 records when
  callers omit `perPage`.

## Local Invariants

- Users see an account type as a "wallet" (en) / "хэтэвч" (mn) inside the owner's loyalty account; user-facing errors say wallet. Code, models, GraphQL (`LoyaltyAccountType`, `accountTypeId`) keep the `accountType` name.
- Preserve tenant isolation by using the request `subdomain` for every model and service access.
- Base pricing synchronization must skip plans without any branch, department, or pipeline scope; queries match the supplied location fields without requiring omitted fields, then use the greatest matching base discount so overlapping plans return the cheapest final price.
- Public, base, and POS-base pricing adjustments may be negative; base pricing may therefore return a price above the product's original unit price.
- Loyalty never interprets another plugin's records (stages, `tickUsed`, payment types): purchases arrive as action `inputs`, spending and refunds as `score.spend` / `score.refund`.
- Score changes must keep owner score caches and score logs consistent; a purchase recalculated to zero refunds its standing entry.
- Pricing eligibility must fail closed when required core lookups are unavailable.
- Disabled pricing date bounds must not retain stale `startDate` or `endDate` values.
- Product event synchronization must replace discounts only on the changed product; it must not trigger the full-product replacement path.
- Pricing plan list ordering must include `_id` as a deterministic tie-breaker
  so records do not repeat or move between adjacent pages.
- Do not introduce new `schemaWrapper` usage in backend schemas.
- Every balance change goes through `changeBalance` in `scoreLedger.ts`: keyed balances (an account type, or `default` for the top-level score) change with one atomic `$inc`/`$set` on `loyalty_accounts.balances` (floor-checked for subtractions), and the featured field or owner `score` is only a copy that re-reads the account until it matches; never compute a new balance from an owner snapshot. Every read of a balance goes through `getOwnerBalance`: the account first, otherwise the featured field (typed) or the ledger sum (default score — customers have no `score` field, so `owner.score` is never a source). Repair writes ledger-derived balances through `updateOwnerScoreCache`; never `$set` a whole `propertiesData` object on an owner.
- Invariant: available lots' `remaining` sums to `max(0, balance)` and pending lots to `pending`. Only `changeBalance`, the lot jobs and repair (`reconcileAvailable`) move lots; lot consumption is one atomic pipeline update per lot. Production runs MongoDB 4.4: no operators newer than 4.4 (`$dateAdd`, `$getField`, `$setWindowFields` …); dates are computed in Node.
- `balances.<key>` entries are written per field (`balances.<key>.balance`, `.tier`, …), never as a whole object, so balance and tier writes never erase each other.
- Every tier change goes through `setAccountTier`; a reset only runs for boundaries after `reset.since` and marks each account's `resetAt`, so it is idempotent and a failed account retries on the next run. A calendar reset sets the balance to what moved since the boundary (score logs by `accountId` + `accountTypeId`, minus earnings still pending, never below 0), so a late run never clears the new period; a tier won after the boundary is not reset. Resets go in batches (`LOYALTY_RESET_BATCH`, default 500) and a full batch queues the rest at once.
- Nightly lot moves are claimed first (`releasingAt`, `expiringAt`) so two runs never move the same lot; a release that stopped halfway is settled from the account's `pending` total, a stale expiry claim is dropped after 10 minutes. Campaign-less ledger entries carrying `accountTypeId` (resets) belong to that account type in repair and never to the default score.
- A campaign's `fieldId` is derived from its account type and never accepted from clients; an account type's `ownerType` never changes; any campaign action (add, subtract, set) may write to any account type.
- A campaign with score history cannot move to another account type; archived account types reject new ledger writes but their campaigns stay editable.

## Validation

- `pnpm nx build loyalty_api`
- `pnpm nx test loyalty_api`
- `pnpm nx test loyalty_api --testPathPattern scoreTarget`
- `pnpm nx test loyalty_api --testPathPattern publicDiscounts`
- `pnpm nx test loyalty_api --testPathPattern afterProcess`
- Smoke scenario: trigger a sales deal and POS order score campaign with mixed product rows; only rows matching product/category/tag restrictions should contribute to `totalAmount`, deal rows must also have `tickUsed === true`, and discounted deal rows should be skipped only when `additionalConfig.discountCheck` is enabled.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-29` — Nightly runs per organization

- **Summary:** The hourly job for every organization became a nightly run only for organizations whose wallets move with time; resets keep what moved after midnight, and lot moves are claimed so they never run twice.
- **Affected areas:** `src/worker/index.ts`, `services/{periodSchedule,accountReset,lotJobs}.ts`, `db/models/AccountType.ts`, lot schema, `services/__tests__/accountReset.test.ts`.
- **Contracts changed:** Queue `loyalty-periods` replaces `loyalty-daily-check` / `loyalty-resetPeriods`; lots gain `releasingAt`, `expiringAt`.

### `2026-09-29` — Purchases as a contract

- **Summary:** Earning reads a purchase from the automation action's `inputs`; spending and refunds come from the selling side over `score.spend` / `score.refund`; stage rules removed; every score change writes activity logs.
- **Affected areas:** `ScoreCampaign.ts` (`earn`, `spend`, `checkSpend`, `refundTarget`), `ScoreLog.ts` (`recordActivity`), `earnContext.ts`, `meta/automations`, `trpc/init-trpc.ts`, `utils/utils.ts`.
- **Contracts changed:** tRPC `score.doScoreCampaign`, `checkScoreAviableSubtract`, `consumeTargetChange`, `refundLoyaltyScore`, `getScoreCampaignsByStage` removed; `score.checkSpend`, `score.spend`, `score.refund` added; Adjust score action `inputs`; `score_logs.targetType`.

### `2026-09-28` — Two row kinds

- **Summary:** Earning rows are base or bonus; the former multiplier row is a bonus that multiplies the base, and every such bonus now adds (capped) instead of only the highest applying.
- **Affected areas:** `services/earnTable.ts` (`evaluateEarnTable`, `normalizeEarnTable`), `@types/earnTable.ts`, earn table tests.
- **Contracts changed:** Earning row `kind` is `base | bonus` (a `multiplier` row is saved as bonus `multiplier`); bonus `valueType` adds `multiplier`.

### `2026-09-28` — Base rows as percent or multiplier

- **Summary:** A base earning row may now give a percent of the amount (like bonus rows) or a multiplier of the rate's points; the value type decides.
- **Affected areas:** `services/earnTable.ts` (`points`, `normalizeEarnTable`), `@types/earnTable.ts`, earn table tests.
- **Contracts changed:** Earning row `valueType` adds `multiplier`; base rows read `percent` as a percent of the amount (previously ignored and always a multiplier).

### `2026-09-28` — Account types shown as wallets

- **Summary:** User-facing errors about account types now say wallet, matching the UI name.
- **Affected areas:** `AccountType.ts`, `scoreLedger.ts`, `score/utils.ts`, `meta/automations/score/producers.ts`.
- **Contracts changed:** None (error message text only).

### `2026-09-28` — Account list

- **Summary:** Accounts can be listed and filtered by owner type, status, account type and tier, and searched by account number or owner name.
- **Affected areas:** `modules/score/services/accountList.ts` (+ tests), `graphql/resolvers/queries/account.ts`, `graphql/schemas/account.ts`, `customResolvers/loyaltyAccount.ts` (balances read from both hydrated `Map` and lean objects), `@types/account.ts`.
- **Contracts changed:** Added query `loyaltyAccounts(searchValue, ownerType, status, accountTypeId, tier, cursor params): LoyaltyAccountListResponse`; `LoyaltyAccount.owner: JSON`.

### `2026-09-27` — Adjust score explains a zero

- **Summary:** An "Adjust score" run that gives nobody points ends `skipped` with every reason per owner instead of a success carrying nulls.
- **Affected areas:** `services/earnTable.ts` (`explainEmptyEarn`), `doCampaign` `onSkip` in `ScoreCampaign.ts`, `meta/automations/score/producers.ts`, earn table tests.
- **Contracts changed:** Adjust score may return the shared skipped outcome (`reason` = first skip, `result.owners[].skips`: `TScoreSkip[]`); `DoCampaignTypes.onSkip`.

### `2026-09-27` — Automation: earning rows and Set tier

- **Summary:** "Adjust score" passes the automation's chosen earning rows (`earnRowKeys`); a new "Set tier" action (`score.tier`) opens the owner's account if needed and sets or clears a tier.
- **Affected areas:** `meta/automations/score/producers.ts`, `meta/automations/constants.ts`, `meta/automations/types.ts`.
- **Contracts changed:** Automation action `loyalty:score.tier.create` (config `attribution`, `accountTypeId`, `tier`); Adjust score config `earnRowKeys`.

### `2026-09-27` — Formulas and the set action removed

- **Summary:** Campaigns earn only by table and spend only by rules; formula evaluation, the `set` campaign action, `handleScore`/`updateScore` tRPC and `scoreCampaignAttributes` are removed.
- **Affected areas:** `ScoreCampaign.ts`, campaign schema/types/GraphQL, `score/utils.ts`, `utils/utils.ts`, `trpc/init-trpc.ts`, automation action type.
- **Contracts changed:** `ScoreCampaign` loses `set` and formula fields (`add`/`subtract` hold only `table`/`rules`); removed `scoreCampaignAttributes` query and `score.updateScore` tRPC; automation score action is `add | subtract`.

### `2026-09-27` — Spending rules and point value

- **Summary:** Account types add `pointValue`; campaigns spend by rules (minimum balance, max share of an order, step) that loyalty checks for every channel.
- **Affected areas:** `services/spendRules.ts`, `checkScoreAviableSubtract` and `doCampaign` in `ScoreCampaign.ts`, `AccountType.ts`, tests in `services/__tests__/spendRules.test.ts`.
- **Contracts changed:** `LoyaltyAccountType.pointValue` and add/edit input; `ScoreCampaign.subtract.mode: 'rules'` / `subtract.rules`.
