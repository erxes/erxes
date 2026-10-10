# `loyalty_api` Plugin Guide

## Identity

- **Plugin:** `loyalty`
- **Project:** `loyalty_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/loyalty_api`
- **Last synchronized:** `2026-10-09`

## Scope

### Owns

- Loyalty score, voucher, coupon, lottery, spin, agent, and pricing API behavior.
- Plugin-owned GraphQL, tRPC, Mongoose models, commands, metadata, and event handlers under `backend/plugins/loyalty_api`.

### Does not own

- Core API, gateway, shared libraries, frontend plugin code, sales deal persistence, POS order persistence, or other plugins.
- Direct source imports from another plugin; cross-service access must use published GraphQL, tRPC, HTTP, event, or federation contracts.

## Current Capabilities

- Score campaigns can add, subtract, set, refund, repair, and expose owner score balances. A new campaign is `active` unless created with another status (schema default).
- Loyalty account types (`loyaltyAccountTypes`) define named balances per owner type; each account type owns one core featured field that mirrors its ledger balance. Account types are archived, never deleted.
- Each owner gets one loyalty account (`loyalty_accounts`: random 10-digit number, status, per-type balances) the first time a balance of any account type is written for them; cpUser balances open the linked customer's account. Accounts can be frozen with a required reason (`loyaltyAccountFreeze` / `loyaltyAccountUnfreeze`); the account type's `frozenBlocks` decides whether a frozen account blocks only spending (default) or all changes.
- Account types carry an ordered tier list (lowest first; removed tiers stay as `deprecated`) mirrored by a second featured `select` field (key `tier`). `loyaltyAccountSetTier` sets an account's tier for one type; last write wins and loyalty never decides tiers itself. Every actual tier change (Set tier action, `loyaltyAccountSetTier`) starts the automation trigger `loyalty:score.tier` ("Tier changed", custom, `services/tierChanged.ts`) whose target is the owner (`_id` = owner id, `ownerType`, `customerId` for customers, `accountTypeId`, `fromTier`, `toTier`, `direction` up/down by tier order); it is declared `reEnrollment: true`, so every change runs again for an owner that already went through the automation (reaching a tier again gives again); its config (`accountTypeId` required, optional `toTier`, `direction` up/down/any) is matched in the score producer's `checkCustomTrigger`. Period resets pass `notify: false` and never start it. There is no other loyalty trigger (the old monthly birthday "Reward" trigger and `handleLoyaltyReward` are removed).
- Account types set point expiry (`expiry.mode`: `none`, `calendar` = cleared at each `reset.period`, `rolling` = each earning expires `expiry.months` after it) and optional `pendingDays` (purchase earnings wait before they can be spent). The tier reset follows `reset.period` / `reset.tierTo` (`keep` / `none` / `lowest`).
- Every keyed balance is backed by lots (`loyalty_lots`): each earning is a lot, spending takes soonest-expiring then oldest first, pending lots sit in `balances.<key>.pending`. Refunds may leave debt (negative balance) that later earnings pay off.
- Time-driven work is the **period run**, once a day per organization (`loyalty-periods` queue, `5 0 * * *` in `LOYALTY_TIME_ZONE`, default `Asia/Ulaanbaatar`), and only for organizations with a wallet that expires, holds purchases back or resets, or with dated/pending lots left (`services/periodSchedule.ts`; kept in step on wallet create/update/archive, removed by the run itself when nothing is left; a single-organization install keeps one schedule under `os` whatever host name a request came in on). A run releases pending lots, expires rolling lots (`expire` log), then does calendar and tier resets; all bypass freezing. The old hourly `loyalty-daily-check` scheduler is removed at start. Every run is recorded in `loyalty_period_runs` (started/finished, status, batches, released, expired, reset, failed, error; a run continued in batches stays one record; the newest 60 are kept), and `loyaltyPeriodRunStatus` returns the next run time (from the BullMQ scheduler), what it will do (pending lots to release, lots to expire, wallets and accounts to reset) and the last 30 runs (`services/periodRunStatus.ts`). `loyaltyAccountTypePeriodPreview` turns a wallet's time settings (saved or not) into dates — when points earned now expire or become spendable, the next reset and what tiers become — and runs `resetAccountType` in `dryRun` mode (no writes, first 2000 accounts) against that next reset to report accounts, points cleared/kept and tier changes (`services/periodPreview.ts`).
- A score campaign writes to exactly one account type (`accountTypeId`), which also decides its `ownerType`; only campaigns created before account types may stay without one and keep writing the default score. Campaigns have no client-portal-only switch; who may earn is an automation or segment concern.
- A campaign earns only through its earning table (`add.table`) and spends only through its spending rules (`subtract.rules`); formulas, the `set` action and the campaign `currencyRatio` are gone. The table has base and bonus rows with conditions (amount range, products, first purchase from this campaign, source), a value either the same for everyone (`values.all`) or per column (`values.none` for owners without a tier, then tier keys; an empty cell earns nothing) and an optional cap. Rules count money and divide by the account type's `currencyRatio` (1 point = N money). Rows are `base` (only the first matching one earns) or `bonus` (every matching one adds). Each row's `valueType` says how its value reads: a base row is `percent` (N% of the amount) or `multiplier` (the rate's points times N); a bonus row is `percent`, `fixed` points or `multiplier` (the base points times N, of which the base already gave one; each such bonus adds and is capped on its own). `normalizeEarnTable` keeps each kind to its own types and turns a former `multiplier` row into a bonus `multiplier`. `scoreCampaignEarnPreview` evaluates an unsaved table for a sample amount per tier. Callers may pass `earnRowKeys` to turn rows on. Score logs keep the per-row `breakdown`.
- Points are earned only by the "Adjust score" automation action, from a purchase (`ILoyaltyPurchase`: `totalAmount`, `paidAmount` = paid with money, `items` of `{ productId, amount, discounted }`) that the action declares as `inputs` and the trigger's own plugin fills through its `actionInputs` (sales deal and POS order triggers). Loyalty never reads a deal or an order. A trigger that declares nothing (a customer, a tier change) gives a zero purchase, so only fixed-point rows earn on it. The action only gives; an older config with `action: 'subtract'` fails with CONFIG_INVALID.
- When the action moves no one's balance, `ScoreCampaigns.earn` reports every reason through its optional `onSkip` (`explainEmptyEarn`: no selected rows, no value for the owner's tier column, row conditions unmet, no amount, rounded to zero) and the producer returns a `skipped` outcome.
- Spending and refunds belong to the selling side: tRPC `score.checkSpend` / `score.spend` take `pointsPaymentAmount` (the whole amount paid with points; a repeat moves only the difference) and `totalAmount`, and `score.refund` undoes every standing earning and spending on a `targetId` (`ScoreCampaigns.refundTarget`). Campaigns have no deal-stage rules (`additionalConfig.cardBasedRule` is stripped on save).
- Every ledger write records an activity log (`loyalty.score.<action>`) on the owner's record and, when the log has `targetId` + `targetType`, on that record too (`ScoreLogs.recordActivity`). Score logs carry `createdVia` (`TCreatedVia`) when nothing was typed in: automation earnings pass the execution's, period-run expiries and resets pass the wallet's (`walletRunVia`: source `wallet`, the wallet's name, the run id, actor = the wallet's creator), so the activity reads "from wallet X" under a real actor. Activity lines name the wallet and the balance move, e.g. "added 18 points to Лоялти үлдэгдэл (120 → 138) from automation scoring"; the source record's line ends "of the customer". Refund lines say what they undo by their sign: "returned N points paid with …" (a payment) or "took back N points earned in …" (an earning). Entries with neither `createdBy` nor a `createdVia.actorId` are not written, since core rejects them.
- Account types carry both rates: `currencyRatio` (earning: every N of money is 1 point) and `pointValue` (spending: 1 point pays N). A campaign's spending rules are `minBalance`, `maxShare` % of the order and `step`; rules turn `pointsPaymentAmount` into points through `pointValue` and are enforced by loyalty in both `checkSpend` and `spend` (`services/spendRules.ts`).
- `loyaltyAccountTypesAdoptCampaignFields` turns the custom fields legacy campaigns write into account types in place (same field id, values recast to numbers); `loyaltyAccountTypeLegacyFieldCount` reports how many remain.
- With purchase `items`, a campaign's total counts only items that pass its product/category/tag restrictions; discounted items are skipped only when `additionalConfig.discountCheck === true`. Without items the purchase `totalAmount` is used as is.
- Pricing plans calculate product discounts through the loyalty pricing module and tRPC `pricing.checkPricing`.
- Product conditions price through any plan's `conditionRules [{conditionCode, discountType, discountValue, discountBonusProduct, priceAdjustType, priceAdjustFactor}]`, shaped like a quantity rule keyed by condition code (cleaned in `normalizePlanDoc`, since `updatePlan` writes through the raw collection: code required and unique per plan, `discountType` `default` | `subtraction` | `percentage` (≤100) | `bonus` (needs a product), value ≥ 0, known price adjust type). Matching is by core condition code, never id, so a removed condition that is recreated with the same code matches again; loyalty never checks that the code exists. In `checkPricing` the plan still decides whether it applies (its own price/quantity/expiry gates must pass); once it does, a line whose `conditionCode` (optional on `checkPricing` products) has a rule is priced by that rule alone (`calculateConditionRule`), overriding the plan discount and the plan's rules, so a condition may also give less: `default` keeps the plan's default discount, `subtraction`/`percentage` are off the unit price, `bonus` gives the product instead of a discount, then the rule's own price adjust. Fixed values hold no condition data. `pricingFixedValuesPage` returns each product's `productStatus`.
- `posBase` plans are baked into POS unit prices at sync (`prioritizeRule: 'only'`). At checkout (`'exclude'`) a `posBase` plan with condition rules is still queried when a line has a condition, but prices only lines with a matching rule, skipping price/quantity/expiry rules: the line price is already baked, so the rule is evaluated on core's `unitPrice` (one tRPC `products.find` per call, only then) with the baked difference as the plan's default discount, and only the difference from what sync took is returned (negative when the condition gives less; a `bonus` rule returns the whole baked discount plus the product); everything else stays as synced.
- tRPC `score.earnPreview({ ownerType, ownerId, rules: [{campaignId, earnRowKeys}], purchase })` answers what `earn` would give, writing nothing (`ScoreCampaigns.previewEarnRules` → `previewEarn`). It shares `evaluatePurchase` with `earn`, so a preview cannot disagree with a real earn; a zero carries `explainEmptyEarn` reasons (and `held-past-reset`), a rule that cannot earn (missing campaign, wrong owner type) returns `error` instead of failing the others. Callers say which rules apply; loyalty never reads automations.
- Set tier (`loyalty:score.tier.create`) has two modes: a fixed `tier`, or amount `bands [{tier, min?, max?}]` (+ optional `startDate`/`endDate`, `onlyUpgrade`) read against `inputs.totalAmount`, which the trigger's plugin declares in its `actionInputs` like Adjust score's. `tierForPurchase` (`services/purchaseTier.ts`) orders the bands highest tier first and `tierForAmount` (`services/tierBands.ts`, unit-tested) picks the first band holding the amount, ends inclusive, so where ranges meet the higher tier wins; outside the dates, without an amount or with no band it returns a skip (`buildSkippedAction`), and `onlyUpgrade` leaves an owner whose tier would go down (`tierDirection`) unchanged. A fixed tier does the same only with `keepHigherTier` (older fixed steps were saved with `onlyUpgrade: true` by the form default, so `onlyUpgrade` is ignored there; `startDate`/`endDate` are still honoured for older steps but no longer offered by the UI). Loyalty still never decides tiers from its own data.
- Score log lists (`scoreLogs`, `scoreLogList`, `scoreLogStatistics`) filter only on loyalty's own fields; a source record's fields (a deal's board, pipeline, stage or number) are filtered on the source's side, which asks `loyaltyScoreTargetTotals(targetIds)` (net `changeScore` per target, distinct ids, at most 500, records that moved nothing left out; `scoreLogView`) for the records it lists. Loyalty never reads the sales `deals` collection.
- Every actual tier change goes through `setAccountTier`, which writes a `loyalty_tier_logs` line (`LoyaltyTierLogs.record`: account, owner, wallet, from/to, direction, `createdBy`, `createdVia`, `targetId`/`targetType`/`targetName`, the name the record's own plugin gave it) and, when it has an actor (`createdBy` or `createdVia.actorId`), a `loyalty.tier.change` activity on the owner and on the target record. Callers say who moved it through `via`: the Set tier action passes the execution's `createdVia`, `loyaltyAccountSetTier` the user, period resets the wallet run (`walletRunVia`), `score.applyPurchaseTier` its `actorId` and target (with `targetName`). `loyaltyTierLogs(accountId?, targetId?, accountTypeId?, limit?)` lists one account's changes, or those one record made, newest first (one of the two required; at most 100; `scoreLogView`); `LoyaltyTierLog.accountType` and `owner` are resolved.
- tRPC `score.applyPurchaseTier({ ownerType, ownerId, accountTypeId, bands, onlyUpgrade?, totalAmount, targetId?, targetType?, actorId? })` is the selling side's built-in "This purchase" tier: the same `tierForPurchase` + `applyOwnerTier` the Set tier action uses, returning `{changed, from, to}` or `{changed: false, skip}`. It keeps no target and is never refunded; a repeat with a smaller amount moves the tier down unless `onlyUpgrade`.
- Pricing plan updates remove persisted start and end dates when their enabled flags are disabled.
- Pricing plan lists honor `page` and `perPage`, with deterministic `_id`
  tie-breaking after the requested or default sort field.
- Public and base pricing plans write scoped product discount metadata to core products; public entries use `base: null`, while base entries use `base: true` and may be scoped by branch, department, and pipeline.
- Core product create and update events recalculate that product's active public and base pricing discounts, clearing stale discounts when it leaves every plan filter.
- Voucher, coupon, lottery, spin, and agent modules provide their plugin-owned loyalty behaviors.
- A voucher campaign may cap what one owner receives (`perOwnerLimit {count, period: campaign|year|month}`, calendar periods in the organization's time zone via `loyaltyTimeZone`). Every issue path enforces it in `modules/voucher/services/ownerLimit.ts`: `createVoucher` throws `VoucherOwnerLimitError`, `createVouchers` leaves those owners out, and the Issue voucher automation action reports them as `skipped` (all refused) or `refusedOwnerIds` (some refused). Vouchers, spins and lotteries issued from the campaign all count; a `score` voucher cannot be limited.
- A voucher campaign records how it is handed out on its own in `autoIssue[] {kind, segmentId, parts[{engine: broadcast|automation, id}]}` (one entry per kind; only `birthday` today). Loyalty only stores the bundle: the core segment, broadcast and automation are created, switched and deleted by loyalty_ui through core's public GraphQL.
- `loyaltyScoreSpendLimit(campaignId, ownerType, ownerId, totalAmount, targetId)` tells a paying screen the most money points may pay on an order (`ScoreCampaigns.spendLimit`, rules in `maxSpendMoney` beside `checkSpendRules` so the offer always passes the check): balance including what this target already spent, point value, step, and `blocked` (`frozen`, `belowMin`, `empty`).
- Each earning row in a score log's `breakdown` keeps how it was counted (`calc`: value type and value, the tier column it came from, the money counted, money per point, base points for a multiplier bonus, the cap that cut it, and what a point pays), written by `evaluateEarnTable` so earnings and `scoreCampaignEarnPreview` explain themselves the same way; logs written before have no `calc`.
- tRPC `loyalty.ownerSummary({ ownerType: customer|company|user, ownerId, totalAmount? })` (`utils/ownerSummary.ts`) tells a selling screen what the owner it serves holds: account number and status, non-archived wallet balances with pending, tier and points expiring soon (the same `resolveAccountBalances` the `LoyaltyAccount.balances` resolver uses), and the owner's `new` sale vouchers (`bonus`/`discount` marked `autoApplied`, since `directVoucher` applies them to any sale; `reward` ones run `Vouchers.checkVoucher` against `totalAmount` and carry `applicable` + `reason`). A customer's vouchers held by their client portal user are included. Coupons have no owner, so none are listed.
- `loyaltyAccounts` lists loyalty accounts newest first (cursor paginated on `joinedAt`) with filters for owner type, status, account type and its tier (`none` = holds the type without a tier); `searchValue` is either a 10-digit account number or text matched against owners in core (customers, companies, users; at most 200 owners per type), built in `services/accountList.ts`. `LoyaltyAccount.owner` resolves the owner document.

## Architecture

| Area                  | Path                                                                                                                     | Responsibility                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Runtime               | `src/main.ts`, `src/connectionResolvers.ts`, `src/trpc/init-trpc.ts`                                                     | Start the plugin, load tenant-scoped models, and expose tRPC procedures.                                                    |
| Score models          | `src/modules/score/db`                                                                                                   | Store score campaigns and score logs, apply ledger changes, and maintain owner score fields.                                |
| Loyalty account types | `src/modules/score/db/models/AccountType.ts`, `src/modules/score/services/accountBalance.ts`                             | Define account types, bind their core featured balance field, archive, and adopt legacy fields.                             |
| Loyalty accounts      | `src/modules/score/db/models/Account.ts`, `src/modules/score/services/accountBalances.ts`                                | Open one account per owner, mirror per-type balances and tiers, and resolve balances for display.                           |
| Owner summary         | `src/utils/ownerSummary.ts`                                                                                              | Balances, tiers and sale vouchers for a selling screen (`loyalty.ownerSummary`).                                            |
| Tiers and resets      | `src/modules/score/services/accountTier.ts`, `src/modules/score/services/purchaseTier.ts`, `src/modules/score/services/accountReset.ts`, `src/worker/index.ts` | Set tiers with featured field convergence, tier by purchase amount; reset due account types per period. |
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
- tRPC procedures in `src/trpc/init-trpc.ts`, including `loyalty.ownerSummary`, `score.scoreCampaign`, `score.checkSpend`, `score.spend`, `score.earn` (a purchase as it stands now: the standing entry per campaign and target is moved, not added to; returns `changeScore` and `skips`), `score.applyPurchaseTier`, `score.refund` and `pricing.checkPricing`.
- `VoucherCampaign.autoIssue`, mutations `voucherCampaignSetAutoIssue(_id, kind, segmentId, parts)` / `voucherCampaignRemoveAutoIssue(_id, kind)` (permission `loyaltyCampaignUpdate`).
- Automation action `loyalty:score.score.create` declares `inputs` `totalAmount`, `paidAmount`, `items`.
- Automation trigger `loyalty:score.tier` (Tier changed) with output `_id`, `ownerType`, `customerId` (reference to `core:customer`), `accountTypeName`, `fromTier`, `toTier`, `direction`.
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
- `score_campaigns.serviceName` is optional and read by nothing but the campaign list filter: earning sources come from automation triggers, spending from the selling side; the campaign form no longer sends it.
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
- Loyalty never interprets another plugin's records (stages, `tickUsed`, payment types): purchases arrive as action `inputs` or `score.earn`, spending and refunds as `score.spend` / `score.refund`.
- Score changes must keep owner score caches and score logs consistent; a purchase recalculated to zero refunds its standing entry.
- Pricing eligibility must fail closed when required core lookups are unavailable.
- Disabled pricing date bounds must not retain stale `startDate` or `endDate` values.
- Product event synchronization must replace discounts only on the changed product; it must not trigger the full-product replacement path.
- Pricing plan list ordering must include `_id` as a deterministic tie-breaker
  so records do not repeat or move between adjacent pages.
- Do not introduce new `schemaWrapper` usage in backend schemas.
- A wallet may limit who earns into it (`earnEligibility {who: all|clientPortal|segment, segmentId}`; client portal only on customer wallets): `earn` and the earn previews skip with `not-eligible` (`services/earnEligibility.ts`: core `cpUsers.get` / `segments.isInSegment`). Spending and refunds are never gated.
- Freezing/unfreezing an account needs `loyaltyAccountFreeze`, setting a tier by hand `loyaltyAccountSetTier` (both in the `scoreLog` permission module, granted to `loyalty:admin`); `scoreLogChange` is only for adjusting score.
- `scoreLogs(targetId)` lists what one record (deal, order) moved across owners.
- Earning, spending and previews need an active campaign (`status: 'active'`); a draft or archived one fails with an error naming the campaign and its status, not "Campaign not found".
- `autoIssue` is written only through `setVoucherAutoIssue` / `removeVoucherAutoIssue` (validated kind, segment, at most one part per engine); `voucherCampaignsEdit` never touches it. Loyalty never calls core to create or delete the parts.
- A voucher campaign's per-owner limit is checked only through `ownersWithinLimit`; no issue path may create a voucher, spin or lottery for a campaign without it.
- Every balance change goes through `changeBalance` in `scoreLedger.ts`: keyed balances (an account type, or `default` for the top-level score) change with one atomic `$inc`/`$set` on `loyalty_accounts.balances` (floor-checked for subtractions), and the featured field or owner `score` is only a copy that re-reads the account until it matches; never compute a new balance from an owner snapshot. Every read of a balance goes through `getOwnerBalance`: the account first, otherwise the featured field (typed) or the ledger sum (default score — customers have no `score` field, so `owner.score` is never a source). Repair writes ledger-derived balances through `updateOwnerScoreCache`; never `$set` a whole `propertiesData` object on an owner.
- Invariant: available lots' `remaining` sums to `max(0, balance)` and pending lots to `pending`. Only `changeBalance`, the lot jobs and repair (`reconcileAvailable`) move lots; lot consumption is one atomic pipeline update per lot. Production runs MongoDB 4.4: no operators newer than 4.4 (`$dateAdd`, `$getField`, `$setWindowFields` …); dates are computed in Node.
- `balances.<key>` entries are written per field (`balances.<key>.balance`, `.tier`, …), never as a whole object, so balance and tier writes never erase each other.
- Every tier change goes through `setAccountTier`; a reset only runs for boundaries after `reset.since` and marks each account's `resetAt`, so it is idempotent and a failed account retries on the next run. A calendar reset sets the balance to what moved since the boundary (score logs by `accountId` + `accountTypeId`, minus earnings still pending, never below 0), so a late run never clears the new period; points earned in the old period and still pending are expired too (an `expire` log against the earning's `sourceScoreLogId`, balance untouched), so nothing of an old period lands in a new one; and a purchase whose pending wait would end at or after the next reset (calendar expiry with `pendingDays`) earns nothing and is skipped with `held-past-reset` (`services/earnWindow.ts`), the window shown by the preview as `noEarnFrom`; a tier won after the boundary is not reset. Resets go in batches (`LOYALTY_RESET_BATCH`, default 500) and a full batch queues the rest at once.
- Period-run lot moves are claimed first (`releasingAt`, `expiringAt`) so two runs never move the same lot; a release that stopped halfway is settled from the account's `pending` total, a stale expiry claim is dropped after 10 minutes. Campaign-less ledger entries carrying `accountTypeId` (resets) belong to that account type in repair and never to the default score.
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

### `2026-10-10` — Sources filter their own records

- **Summary:** The score log board/pipeline/stage/number filters, which `$lookup`-ed the sales `deals` collection and never matched board or pipeline, are gone; sales lists its deals and asks for their net points.
- **Affected areas:** `modules/score/{utils.ts,db/models/ScoreLog.ts (+ test),@types/scoreLog.ts,graphql/schemas/scoreLog.ts,graphql/resolvers/queries/scoreLog.ts}`.
- **Contracts changed:** `scoreLogs` / `scoreLogList` / `cpScoreLogList` / `scoreLogStatistics` lose `boardId`, `pipelineId`, `stageId`, `number`; new `loyaltyScoreTargetTotals`.

### `2026-10-09` — Tier changes are logged; campaigns start active

- **Summary:** Every tier change is kept in `loyalty_tier_logs` with who or what moved it and shown on the owner's timeline; new score campaigns default to active instead of draft.
- **Affected areas:** `modules/score/{@types/tierLog.ts,db/definitions/tierLog.ts,db/models/TierLog.ts (+ test),services/accountTier.ts,services/purchaseTier.ts,services/accountReset.ts,graphql/schemas/account.ts,graphql/resolvers/queries/account.ts,graphql/resolvers/mutations/account.ts,db/definitions/scoreCampaign.ts}`, `meta/automations/score/producers.ts`, `trpc/init-trpc.ts`, `connectionResolvers.ts`.
- **Contracts changed:** GraphQL `loyaltyTierLogs` (`LoyaltyTierLog`, by account or target); collection `loyalty_tier_logs`; activity `loyalty.tier.change`; tRPC `score.applyPurchaseTier` takes `targetId`, `targetType`, `actorId`; `ScoreCampaign.status` defaults to `active`.

### `2026-10-09` — Purchase tier for the selling side

- **Summary:** The Set tier action's band and owner logic moved into `services/purchaseTier.ts`, and sales/POS call it directly through `score.applyPurchaseTier` instead of an automation.
- **Affected areas:** `modules/score/services/purchaseTier.ts`, `meta/automations/score/producers.ts`, `trpc/init-trpc.ts`.
- **Contracts changed:** tRPC `score.applyPurchaseTier`.

### `2026-10-08` — Earn called by the selling side

- **Summary:** Sales and POS restate a purchase with `score.earn` on every save in an earning stage or paid sync; loyalty keeps one standing entry per campaign and target.
- **Affected areas:** `trpc/init-trpc.ts`.
- **Contracts changed:** tRPC `score.earn`.

### `2026-10-07` — Voucher auto-issue bundles (birthday)

- **Summary:** A voucher campaign keeps the ids of the core broadcast and automation that hand it out on birthdays, so the pair is shown, switched and removed as one.
- **Affected areas:** `modules/voucher/{@types/voucherCampaign.ts,db/definitions/voucherCampaign.ts,db/models/VoucherCampaign.ts,graphql/schemas/voucherCamapign.ts,graphql/resolvers/{mutations,queries}/voucherCampaign.ts}`.
- **Contracts changed:** `VoucherCampaign.autoIssue`, `voucherCampaignSetAutoIssue`, `voucherCampaignRemoveAutoIssue`.

### `2026-10-01` — Spend limit for paying screens

- **Summary:** Paying screens can ask how much an order may pay with points instead of treating the point balance as money.
- **Affected areas:** `modules/score/services/spendRules.ts` (+ tests), `db/models/ScoreCampaign.ts`, `graphql/{schemas,resolvers/queries}/scoreCampaign.ts`.
- **Contracts changed:** Query `loyaltyScoreSpendLimit`, type `LoyaltyScoreSpendLimit`.

### `2026-09-30` — Per-owner voucher limit

- **Summary:** Voucher campaigns can cap how many one owner receives per campaign, year or month, so a changed birth date cannot farm a second birthday coupon.
- **Affected areas:** `modules/voucher/{@types/voucherCampaign.ts,db/definitions/voucherCampaign.ts,db/models/{Voucher,VoucherCampaign}.ts,graphql/schemas/voucherCamapign.ts,services/ownerLimit.ts}`, `meta/automations/voucher/producers.ts`.
- **Contracts changed:** `VoucherCampaign.perOwnerLimit`, `VoucherOwnerLimitInput` on `voucherCampaignsAdd`/`voucherCampaignsEdit`; Issue voucher result may be `skipped` or carry `refusedOwnerIds`.

### `2026-09-30` — Hard cut at a period reset

- **Summary:** A calendar reset also expires the old period's still-pending points, and purchases whose wait would end after the next reset earn nothing (skipped with a reason), so no points of one period reach the next.
- **Affected areas:** `services/{accountReset,earnWindow,periodPreview}.ts`, `db/models/ScoreCampaign.ts`, `@types/earnTable.ts`, tests `accountReset.test.ts`, `earnWindow.test.ts`.
- **Contracts changed:** `TScoreSkip` adds `held-past-reset`; `LoyaltyAccountTypePeriodPreview.noEarnFrom`.

### `2026-09-30` — Tier changed trigger

- **Summary:** Loyalty's only trigger is now "Tier changed", started by every tier change except period resets; the broken birthday "Reward" trigger, its custom check and `handleLoyaltyReward` are removed.
- **Affected areas:** `meta/automations/{constants,types,utils}.ts`, `meta/automations/{score,voucher}/producers.ts`, `services/{accountTier,accountReset,tierChanged}.ts`, `services/__tests__/tierChanged.test.ts`, `utils/utils.ts`, `trpc/init-trpc.ts`, `constants.ts`.
- **Contracts changed:** Trigger `loyalty:score.tier` added, trigger `loyalty:voucher.reward` and tRPC `handleLoyaltyReward` removed.

### `2026-09-30` — Period-run changes in the activity

- **Summary:** Expiries and resets written by a period run now appear in the owner's activity as coming from the wallet, recorded under the wallet's creator through `createdVia`; automation earnings carry the automation's `createdVia` too.
- **Affected areas:** `services/{accountReset,lotJobs,scoreLedger}.ts`, `db/models/{ScoreLog,ScoreCampaign}.ts`, score log schema, `meta/automations/score/producers.ts`, `src/worker/index.ts`.
- **Contracts changed:** `score_logs.createdVia`.
