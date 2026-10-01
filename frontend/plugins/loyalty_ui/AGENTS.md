# `loyalty_ui` Plugin Guide

## Identity

- **Plugin:** `loyalty`
- **Project:** `loyalty_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/loyalty_ui`
- **Last synchronized:** `2026-10-01`

## Scope

### Owns

- Loyalty and pricing frontend routes, forms, list views, settings, GraphQL
  documents, and Module Federation UI surfaces.

### Does not own

- Backend loyalty calculation contracts, pricing engine behavior, sales pipeline
  data ownership, shared UI libraries, or other plugin UIs.

## Current Capabilities

- Renders pricing list/detail/create/edit UI under `src/modules/pricing` and
  `src/pages/pricing`.
- Pricing detail forms edit general targeting, options, participants, price,
  quantity, repeat, expiry, and rules sections.
- Pricing general edit forms allow selected start and end dates to be cleared.
- Pricing priority selection includes none, public, POS base, and scoped base pricing; POS-base and scoped-base plans hide participant targeting.
- Options detail supports branch, department, board, and pipeline selection.
- Board and pipeline selectors can clear an existing selection; clearing a board
  also clears the dependent pipeline in the options and stage forms.
- Loyalty settings include an Account types page (`/settings/loyalty/config/account-type`)
  to create, rename, archive, and restore loyalty account types and to convert
  score fields used by older campaigns into account types.
- The platform settings menu lists every loyalty settings page directly under Loyalty (Wallets, Score, Voucher, Lottery, Spin, Donate, Assignment, Coupon, then Pricing) from `LOYALTY_SETTINGS_PAGES` (`settings/constants/settingRoutes.ts`), rendered by `LoyaltySettingsNavigation`; the pages carry no inner sidebar. The wallet form's Expiry & reset section ends with a live preview (`LoyaltyAccountTypePeriodPreview` / `useLoyaltyAccountTypePeriodPreview`, query `LoyaltyAccountTypePeriodPreview` with the unsaved form values): when points earned today expire or become spendable, the next reset, what tiers become, the window before a reset in which purchases earn nothing, and for a saved wallet what the next reset would clear, keep and change. The Wallets page shows a period run panel (`LoyaltyPeriodRunPanel` / `useLoyaltyPeriodRunStatus`, query `LoyaltyPeriodRunStatus`): the next run time and time zone, what it will release, expire and reset, the last run, and a history popover; wallet mutations refetch it. `/settings/loyalty/config` has no page of its own and redirects to the wallets page (`config/account-type`). The former general config (currency ratio, share fee) is gone; neither value was read anywhere.
- The customer/company/team member relation widget shows the owner's loyalty account (number, status, balance per account type) and lets users freeze it with a reason or unfreeze it; account types choose what freezing blocks.
- Score campaign create and edit sheets share `ScoreCampaignFormLayout`: a sidebar with General (name, description, order, account type, Add / Subtract / Set), Products (restrictions and "Exclude discounted items", `additionalConfig.discountCheck`) and Automations. There is no source choice: earning is decided by automations, spending and refunds by the selling side, so the form neither shows nor sends the campaign's `serviceName` (saved campaigns keep theirs); a failed save opens the first section with an error and marks sections that have errors.
- The score campaign "Add" tab edits the earning table (rows × tier columns from the account type, conditions popover, caps, server-computed example) and the "Subtract" tab the spending rules.
- Account type forms set pending days and point expiry (never / each reset period / N months after earning); the account card shows pending and soon-expiring points.
- Account type forms edit an ordered tier list (lowest first) and a reset period (never / monthly / yearly) with whether the balance resets and what the tier becomes (keep / none / lowest); the account card shows each type's tier and lets users change it.
- Score campaign forms require an account type, which decides whose balance the
  campaign changes; only legacy campaigns may stay on the default score.
- Customer and broker targeting render through
  `edit-pricing/components/options/CustomerBrokerConditions.tsx` and round-trip
  through pricing form values.
- Automation history renders loyalty action results through `LoyaltyActionResult` (`historyActionResult`), which picks by action type: Adjust score → `ScoreActionResult` / `useScoreActionResult` (skipped runs list each owner's reasons in words, successful runs show the score change); Set tier → `SetTierActionResult` / `useSetTierActionResult` (tier names from the action's account type, `from → to`, or skipped when nothing changed); Issue voucher → `IssueVoucherActionResult` / `useIssueVoucherActionResult` (count issued, campaign title, each recipient by owner type); other loyalty actions fall back to raw JSON. Tier changed runs are named in the history by the owner (`historyName` → `TierChangedHistoryName`, through `LoyaltyOwnerInline`: customer, company or team member inline from `ui-modules`).
- An earning's points are explained by `EarnCalcPopover` (steps from `scores/utils/earnCalcSteps.ts`, using the breakdown's `calc`): on the score list's Breakdown cell and on each tier's result in the campaign form's earn preview — amount × % or ×N, ÷ money per point, rounding, and what the points pay.
- The voucher campaign Restriction tab (add and edit share `AddVoucherRestrictionForm`) has a "Per customer" limit (`VoucherOwnerLimitField`: count + period year/month/whole campaign); `toOwnerLimit` sends `perOwnerLimit`, or `null` when the count is empty so an edit clears it.
- The "Tier changed" trigger is configured by `TierChangedTriggerConfigForm` / `useTierChangedTriggerForm` (wallet required, direction up/down/any defaulting to up, target tier or any) and summarized on its node by `TierChangedTriggerNodeContent`, both registered in `LoyaltyRemoteEntry` (`triggerForm`, `triggerConfigContent`).
- Loyalty action nodes report what their config still misses (`useLoyaltyActionNodeIssues`: the action's own zod form schema, reported through `useReportNodeIssues` from `ui-modules`); the builder draws the warning and blocks activation.
- `/loyalty/accounts` ("Accounts" in the loyalty navigation) lists loyalty accounts: owner, owner type, account number, status, one column per active account type with its balance and an inline tier select, joined date. Filters: search (account number or owner name), status, owner type, account type and tier. Row menu: freeze (reason dialog) / unfreeze (confirm), score history (scores page filtered by owner), owner profile. Freeze, unfreeze and tier changes refetch `LoyaltyAccounts`.
- A saved score campaign's sheet has an Automations tab (`ScoreCampaignAutomations` / `useScoreCampaignAutomations`) listing the automations giving its points (Adjust score with this `campaignId`) and, when its account type has tiers, the ones setting those tiers (Set tier with that `accountTypeId`), each linking to the builder, with a create button under each list (a point automation from here counts every row). Automations are also started where the rule lives (`useCampaignAutomationSeeds`, campaign id from `ScoreCampaignProvider`): each base/bonus row of the earning table has, in its row menu (`EarnRowActions`, with delete), an item that opens an unsaved builder with only an Adjust score action (campaign, add, that row's `earnRowKeys`) and no trigger, enabled once the row is saved; a "Create tier automation" button above the table seeds an empty customer trigger, a split with one branch per active tier (highest first) and a Set tier on each branch. Account types carry no automation section.
- Pricing list loads filtered plans in 20-record pages as users scroll and
  shows the full filtered record count from the API.

## Architecture

| Area                  | Path                                                                                                      | Responsibility                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Pricing entry points  | `src/modules/pricing/Main.tsx`, `src/pages/pricing`                                                       | Pricing route and list/detail composition.                                              |
| Pricing create form   | `src/modules/pricing/create-pricing/**`                                                                   | New pricing plan form and submission mapping.                                           |
| Pricing edit forms    | `src/modules/pricing/edit-pricing/**`                                                                     | Sectioned pricing detail editing UI.                                                    |
| Pricing selectors     | `src/modules/pricing/hooks/useSelectBoard.tsx`, `useSelectPipeline.tsx`, `useSelectStage.tsx`             | Sales board, pipeline, and stage comboboxes.                                            |
| Pricing data hooks    | `src/modules/pricing/hooks/**`                                                                            | Apollo query/mutation wrappers for pricing screens.                                     |
| Pricing contracts     | `src/modules/pricing/graphql/**`, `src/modules/pricing/types.ts`                                          | GraphQL documents and TypeScript form/API types.                                        |
| Loyalty account types | `src/modules/loyalties/settings/account-type/**`, `src/pages/loyalties-config/LoyaltyAccountTypePage.tsx` | Account list, sectioned form sheet, legacy field banner, and campaign account selector. |
| Owner loyalty account | `src/modules/loyalties/accounts/**`, `src/modules/loyalties/scores/components/ScoreSummaryWidget.tsx`     | Account card, tier select and freeze dialog in the relation widget.                     |
| Score campaigns       | `src/modules/loyalties/settings/score/**`                                                                 | Score campaign list, create sheet, and edit sheet.                                      |

## Contracts

### Provides

- Module Federation frontend routes and components configured by this plugin's
  exposed pricing and loyalty UI modules.
- Pricing GraphQL operations including `PricingPlanDetail` and pricing
  create/edit mutations.
- Loyalty account GraphQL operations `LoyaltyAccountTypeList`,
  `LoyaltyAccountTypeLegacyFieldCount`, `LoyaltyAccountTypeAdd`, `LoyaltyAccountTypeEdit`,
  `LoyaltyAccountTypeArchive`, `LoyaltyAccountTypeUnarchive`,
  `LoyaltyAccountTypesAdoptCampaignFields`, `LoyaltyAccountOfOwner`,
  `LoyaltyAccountFreeze`, `LoyaltyAccountUnfreeze`, and `LoyaltyAccountSetTier`.
- `PricingPlans` queries request `pricingPlansCount` with the same filters as
  the list and page through `page`/`perPage`.

### Consumes

- Public components and hooks from `erxes-ui` and `ui-modules`.
- Sales board, pipeline, and stage GraphQL queries exposed through platform
  contracts.
- Loyalty pricing, score campaign, and loyalty account type API contracts provided
  by `backend/plugins/loyalty_api`.
- Loyalty translations in `backend/gateway/src/locales/{en,mn}/loyalty.json`.

## Data and State

- Uses Apollo Client for pricing plan and sales board/pipeline/stage server
  data.
- Pricing list pagination appends distinct 20-record `pricingPlans` pages
  through Apollo `fetchMore` and pauses scroll fetching while a request is in
  flight.
- Uses React Hook Form local form state in pricing create/edit forms.
- Keeps board, pipeline, and stage selector state local to the owning pricing
  form or detail section.
- Account mutations refetch `LoyaltyAccountTypeList`,
  `LoyaltyAccountTypeLegacyFieldCount`, and `GetScoreCampaigns`.

## Local Invariants

- Account types are labelled "Wallet(s)" (en) / "Хэтэвч" (mn) everywhere users see them, as balances inside the owner's loyalty account ("Account" / "Данс"); identifiers, routes, GraphQL documents and translation keys keep `accountType` / `loyalty-account-type`.
- Pricing UI changes stay inside `frontend/plugins/loyalty_ui`.
- Pricing form save mappings must preserve empty optional selectors as no
  constraint (`null`, `undefined`, or an empty form value as expected by the
  existing mutation path).
- Clearing a pricing start or end date must set its enabled flag to `false` so the backend removes the persisted date.
- Scoped-base priority is handled like POS-base in the edit flow: participant targeting is hidden and the active tab falls back to General if needed.
- Board changes must clear dependent pipeline and stage selections where those
  fields are present.
- Pipeline changes must clear dependent stage selections where those fields are
  present.
- Reuse `erxes-ui` and `ui-modules`; do not import Radix primitives directly.
- Loyalty account types are archived, never deleted; account type owner type is read-only
  after creation.
- Changing a score campaign's owner type clears its account type; archived account types
  are listed in the campaign selector only when the campaign already uses one.

## Validation

- `pnpm nx build loyalty_ui`
- Account types smoke scenario: create an account type, bind it to a new score campaign,
  archive it, and confirm the campaign still opens while the selector hides the
  archived account type for other campaigns.
- Pricing detail smoke scenario: open a pricing plan, go to Options, choose a
  board and pipeline, reopen each selector, choose `none`, save, and confirm the
  saved plan no longer has those board/pipeline constraints.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-30` — Per-customer voucher limit

- **Summary:** Voucher campaigns can be limited to N per customer per year, month or campaign from the Restriction tab; empty means no limit.
- **Affected areas:** `settings/voucher/{constants/voucherFormSchema.ts,utils/voucherOwnerLimit.ts,types/voucherTypes.ts}`, `add-voucher-campaign/components/{AddVoucherRestrictionForm,VoucherTabs}.tsx`, `voucher-restriction-field/VoucherOwnerLimitField.tsx`, `voucher-detail/components/{EditVoucherTabs,LoyaltyVoucherEditSheet}.tsx`, voucher add/edit mutations and detail query; `owner-limit*` translations.
- **Contracts changed:** None

### `2026-09-30` — No-earn window shown

- **Summary:** The wallet preview names the days before a reset in which purchases earn nothing, and the Adjust score history explains such a skip with both dates.
- **Affected areas:** `settings/account-type/{hooks/useLoyaltyAccountTypePeriodPreview.ts,components/LoyaltyAccountTypePeriodPreview.tsx,graphql/loyaltyAccountTypeQueries.ts}`, `widgets/automations/modules/loyalty/hooks/useScoreActionResult.ts`; `period-preview-no-earn`, `score-skip-held-past-reset` translations.
- **Contracts changed:** None

### `2026-09-30` — Wallet time settings preview

- **Summary:** The Expiry & reset section shows what the settings do in dates and what the next reset would do to the wallet's accounts, before saving.
- **Affected areas:** `settings/account-type/{components/LoyaltyAccountTypePeriodPreview.tsx,components/LoyaltyAccountTypeExpirySection.tsx,components/LoyaltyAccountTypeFormSheet.tsx,hooks/useLoyaltyAccountTypePeriodPreview.ts,graphql/loyaltyAccountTypeQueries.ts}`; `period-preview-*` translations.
- **Contracts changed:** Consumes GraphQL `loyaltyAccountTypePeriodPreview`.

### `2026-09-30` — Period run panel on Wallets

- **Summary:** The Wallets page tells when the next period run is, what it will do and how the last runs went.
- **Affected areas:** `settings/account-type/{components/LoyaltyPeriodRunPanel.tsx,hooks/useLoyaltyPeriodRunStatus.ts,graphql/loyaltyAccountTypeQueries.ts,hooks/useLoyaltyAccountTypeMutations.ts}`, `pages/loyalties-config/LoyaltyAccountTypePage.tsx`; `period-run-*` translations.
- **Contracts changed:** Consumes GraphQL `loyaltyPeriodRunStatus`.

### `2026-09-30` — Loyalty settings pages in the settings menu

- **Summary:** Wallets, Score, Voucher, Lottery, Spin, Donate, Assignment and Coupon moved from the inner config sidebar into the platform settings menu; the "Configs" item and the unused duplicate `components/LoyaltySettings.tsx` are gone.
- **Affected areas:** `src/LoyaltySettingsNavigation.tsx`, `modules/loyalties/settings/{constants/settingRoutes.ts,components/LoyaltyLayout.tsx,components/LoyaltyBreadcrumb.tsx}`; `LoyaltySidebar.tsx` removed.
- **Contracts changed:** None (routes unchanged).

### `2026-09-29` — Stage rules and automation subtract removed

### `2026-09-29` — Pricing list pagination

- **Summary:** Pricing settings load distinct 20-record pricing plan pages on scroll and display the API-backed filtered total count.
- **Affected areas:** `src/modules/pricing/graphql/queries.ts`, `src/modules/pricing/hooks/usePricing.ts`, `src/modules/pricing/components/PricingRecordTable.tsx`.
- **Contracts changed:** `PricingPlans` now also requests `pricingPlansCount` and sends `page`/`perPage` variables.

### `2026-09-22` — `Scoped base pricing controls`

- **Summary:** Score campaigns no longer edit deal-stage rules (`cardBasedRule`); the Adjust score action only gives points (older subtract configs save back as add) and its node still marks a legacy subtract.
- **Affected areas:** `settings/score/add-score-campaign/components/{ServiceConfigFields,ScoreCampaignSourceSection,AddLoyaltyScore}.tsx`, `score-detail/components/{LoyaltyScoreEditSheet,EditScoreForm}.tsx`, `constants/formSchema.ts`, `widgets/automations/modules/loyalty/{components/action,states,constants}`, `hooks/useScoreActionResult.ts`.
- **Contracts changed:** None

### `2026-09-30` — Tier changed trigger form

- **Summary:** The Tier changed trigger has its own config form, node summary and history name; Issue voucher runs show the campaign and recipients instead of raw JSON.
- **Affected areas:** `widgets/automations/modules/loyalty/components/{trigger/*,common/LoyaltyOwnerInline.tsx,action/voucher/IssueVoucherActionResult.tsx,action/LoyaltyActionResult.tsx}`, `hooks/{useTierChangedTriggerForm,useIssueVoucherActionResult}.ts`, `issue-voucher-result` translations, `states/tierChangedTriggerConfigFormDefinitions.ts`, `LoyaltyRemoteEntry.tsx`; `tier-changed-*` translations.
- **Contracts changed:** None

### `2026-09-29` — Set tier history result

- **Summary:** Set tier runs show `from → to` tier names, or a skipped line when the tier was already set, instead of raw JSON.
- **Affected areas:** `widgets/automations/modules/loyalty/components/action/LoyaltyActionResult.tsx`, `set-tier/SetTierActionResult.tsx`, `hooks/useSetTierActionResult.ts`, `LoyaltyRemoteEntry.tsx`; `set-tier-result-*` translations.
- **Contracts changed:** None
