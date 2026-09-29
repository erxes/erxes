# `loyalty_ui` Plugin Guide

## Identity

- **Plugin:** `loyalty`
- **Project:** `loyalty_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/loyalty_ui`
- **Last synchronized:** `2026-09-29`

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
- `/settings/loyalty/config` has no page of its own: it redirects to the wallets page (`config/account-type`), the first item of the settings sidebar. The former general config (currency ratio, share fee) is gone; neither value was read anywhere.
- The customer/company/team member relation widget shows the owner's loyalty account (number, status, balance per account type) and lets users freeze it with a reason or unfreeze it; account types choose what freezing blocks.
- Score campaign create and edit sheets share `ScoreCampaignFormLayout`: a sidebar with General (name, description, order, account type, Add / Subtract / Set), Source (sales pipeline or POS, with the discount check; no deal-stage rules — earning is decided by automations, spending and refunds by the selling side) and Products (restrictions); a failed save opens the first section with an error and marks sections that have errors.
- The score campaign "Add" tab edits the earning table (rows × tier columns from the account type, conditions popover, caps, server-computed example) and the "Subtract" tab the spending rules.
- Account type forms set pending days and point expiry (never / each reset period / N months after earning); the account card shows pending and soon-expiring points.
- Account type forms edit an ordered tier list (lowest first) and a reset period (never / monthly / yearly) with whether the balance resets and what the tier becomes (keep / none / lowest); the account card shows each type's tier and lets users change it.
- Score campaign forms require an account type, which decides whose balance the
  campaign changes; only legacy campaigns may stay on the default score.
- Customer and broker targeting render through
  `edit-pricing/components/options/CustomerBrokerConditions.tsx` and round-trip
  through pricing form values.
- Automation history renders loyalty action results through `LoyaltyActionResult` (`historyActionResult`), which picks by action type: Adjust score → `ScoreActionResult` / `useScoreActionResult` (skipped runs list each owner's reasons in words, successful runs show the score change); Set tier → `SetTierActionResult` / `useSetTierActionResult` (tier names from the action's account type, `from → to`, or skipped when nothing changed); other loyalty actions fall back to raw JSON.
- Loyalty action nodes report what their config still misses (`useLoyaltyActionNodeIssues`: the action's own zod form schema, reported through `useReportNodeIssues` from `ui-modules`); the builder draws the warning and blocks activation.
- `/loyalty/accounts` ("Accounts" in the loyalty navigation) lists loyalty accounts: owner, owner type, account number, status, one column per active account type with its balance and an inline tier select, joined date. Filters: search (account number or owner name), status, owner type, account type and tier. Row menu: freeze (reason dialog) / unfreeze (confirm), score history (scores page filtered by owner), owner profile. Freeze, unfreeze and tier changes refetch `LoyaltyAccounts`.
- A saved score campaign's sheet has an Automations tab (`ScoreCampaignAutomations` / `useScoreCampaignAutomations`) listing the automations giving its points (Adjust score with this `campaignId`) and, when its account type has tiers, the ones setting those tiers (Set tier with that `accountTypeId`), each linking to the builder, with a create button under each list (a point automation from here counts every row). Automations are also started where the rule lives (`useCampaignAutomationSeeds`, campaign id from `ScoreCampaignProvider`): each base/bonus row of the earning table has, in its row menu (`EarnRowActions`, with delete), an item that opens an unsaved builder with only an Adjust score action (campaign, add, that row's `earnRowKeys`) and no trigger, enabled once the row is saved; a "Create tier automation" button above the table seeds an empty customer trigger, a split with one branch per active tier (highest first) and a Set tier on each branch. Account types carry no automation section.

## Architecture

| Area                 | Path                                                                                          | Responsibility                                      |
| -------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Pricing entry points | `src/modules/pricing/Main.tsx`, `src/pages/pricing`                                           | Pricing route and list/detail composition.          |
| Pricing create form  | `src/modules/pricing/create-pricing/**`                                                       | New pricing plan form and submission mapping.       |
| Pricing edit forms   | `src/modules/pricing/edit-pricing/**`                                                         | Sectioned pricing detail editing UI.                |
| Pricing selectors    | `src/modules/pricing/hooks/useSelectBoard.tsx`, `useSelectPipeline.tsx`, `useSelectStage.tsx` | Sales board, pipeline, and stage comboboxes.        |
| Pricing data hooks   | `src/modules/pricing/hooks/**`                                                                | Apollo query/mutation wrappers for pricing screens. |
| Pricing contracts    | `src/modules/pricing/graphql/**`, `src/modules/pricing/types.ts`                              | GraphQL documents and TypeScript form/API types.    |
| Loyalty account types     | `src/modules/loyalties/settings/account-type/**`, `src/pages/loyalties-config/LoyaltyAccountTypePage.tsx` | Account list, sectioned form sheet, legacy field banner, and campaign account selector. |
| Owner loyalty account | `src/modules/loyalties/accounts/**`, `src/modules/loyalties/scores/components/ScoreSummaryWidget.tsx` | Account card, tier select and freeze dialog in the relation widget. |
| Score campaigns      | `src/modules/loyalties/settings/score/**`                                                     | Score campaign list, create sheet, and edit sheet.  |

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

### `2026-09-29` — Stage rules and automation subtract removed

- **Summary:** Score campaigns no longer edit deal-stage rules (`cardBasedRule`); the Adjust score action only gives points (older subtract configs save back as add) and its node still marks a legacy subtract.
- **Affected areas:** `settings/score/add-score-campaign/components/{ServiceConfigFields,ScoreCampaignSourceSection,AddLoyaltyScore}.tsx`, `score-detail/components/{LoyaltyScoreEditSheet,EditScoreForm}.tsx`, `constants/formSchema.ts`, `widgets/automations/modules/loyalty/{components/action,states,constants}`, `hooks/useScoreActionResult.ts`.
- **Contracts changed:** None

### `2026-09-29` — Set tier history result

- **Summary:** Set tier runs show `from → to` tier names, or a skipped line when the tier was already set, instead of raw JSON.
- **Affected areas:** `widgets/automations/modules/loyalty/components/action/LoyaltyActionResult.tsx`, `set-tier/SetTierActionResult.tsx`, `hooks/useSetTierActionResult.ts`, `LoyaltyRemoteEntry.tsx`; `set-tier-result-*` translations.
- **Contracts changed:** None

### `2026-09-28` — Two row kinds

- **Summary:** The earning table offers Base and Bonus rows only; a bonus can be "% of amount", "Fixed points" or "× base points", a base "% of amount" or "× the rate", and older multiplier rows load as bonus "× base points".
- **Affected areas:** `settings/score/types/earnTable.ts`, `constants/formSchema.ts`, `utils/earnTableForm.ts`, `earn-table/EarnRowEditor.tsx`, `hooks/useEarnRowAutomation.ts`, `hooks/useEarnTableEditor.ts`; earn table translations.
- **Contracts changed:** Sends earning row `kind` `base | bonus` only.

### `2026-09-28` — Base rows as percent or multiplier

- **Summary:** The earning table's Form column lets base rows choose "% of amount" or "Multiplier" (new base rows start at 1%), bonus rows "% of amount" or "Fixed points"; the cell suffix follows the choice and changing a row's kind keeps a form it allows.
- **Affected areas:** `settings/score/types/earnTable.ts` (`EARN_VALUE_TYPES` per kind, `earnValueTypeFor`), `constants/formSchema.ts`, `utils/earnTableForm.ts`, `earn-table/EarnRowEditor.tsx`; `earn-table-hint` translation.
- **Contracts changed:** Sends earning row `valueType` `multiplier` for multiplier-form base rows and multiplier rows.

### `2026-09-28` — General loyalty config removed

- **Summary:** The "Loyalty config" settings item and page (currency ratio, share fee) are removed; the settings root opens the wallets page.
- **Affected areas:** `LoyaltySettings.tsx`, `settings/constants/settingRoutes.ts`, removed `settings/general-config/**` and `pages/loyalties-config/LoyaltyGeneralConfigPage.tsx`; `ValueChangeValueType` moved to `settings/types/selectValue.ts`.
- **Contracts changed:** Route `/settings/loyalty/config` now redirects to `/settings/loyalty/config/account-type`; the UI no longer queries `loyaltyConfigs`.

### `2026-09-28` — Account types shown as wallets

- **Summary:** Every user-facing "account type" label and validation message reads "wallet" / "хэтэвч", so they no longer clash with loyalty accounts.
- **Affected areas:** gateway `loyalty` locale (en/mn), `settings/score/constants/formSchema.ts`, `widgets/automations/modules/loyalty/states/setTierActionConfigFormDefinitions.ts`.
- **Contracts changed:** None (labels only).

### `2026-09-28` — Campaign automations

- **Summary:** A campaign's Automations tab lists the automations that give its points and set its account type's tiers; each earning row starts a trigger-less point automation for itself and a button above the table starts the split-per-tier automation; the account type's Tiers tab no longer carries them.
- **Affected areas:** `settings/score/add-score-campaign/**` (`ScoreCampaignAutomations`, `ScoreCampaignContext`, `useCampaignAutomationSeeds`, `useEarnRowAutomation`, `earn-table/EarnRowActions`, `earn-table/CreateTierAutomationButton`, sections, layout), `score-detail/components/EditScoreForm.tsx`, `settings/score/graphql/queries/scoreCampaignAutomationsQuery.ts`; removed `settings/account-type` tier automation section, hooks and query.
- **Contracts changed:** New query document `LoyaltyScoreCampaignAutomations`; removed `LoyaltyTierAutomations`; uses trigger-less seed links.

### `2026-09-28` — Accounts page

- **Summary:** A new Accounts page lists loyalty accounts with balances and tiers per account type, filters, and freeze / tier / history actions per row.
- **Affected areas:** `modules/loyalties/accounts/**` (list, filter, columns, row actions), `pages/loyalties/AccountPage.tsx`, `SubNavigations.tsx`, `MainNavigation.tsx`, `LoyaltyMainLayout.tsx`, `config.tsx`; `loyalty-accounts*` translations.
- **Contracts changed:** Route `/loyalty/accounts`; new query document `LoyaltyAccounts`.

### `2026-09-28` — Action nodes report missing config

- **Summary:** Set tier, Adjust score, voucher and spin nodes report their unmet form requirements so the builder shows a warning and refuses activation.
- **Affected areas:** `widgets/automations/modules/loyalty/hooks/useLoyaltyActionNodeIssues.ts`, `LoyaltyActionNodeContent.tsx`.
- **Contracts changed:** Consumes `useReportNodeIssues` (ui-modules).

### `2026-09-28` — Tier automations on the account type

- **Summary:** The Tiers tab lists the automations that set this account type's tiers and opens a pre-assembled, unsaved tier automation (customer trigger → split per tier → Set tier) through the shared automation seed link.
- **Affected areas:** `settings/account-type/components/LoyaltyTierAutomations.tsx`, `hooks/useLoyaltyTierAutomations.ts`, `hooks/useTierAutomationSeed.ts`, `LoyaltyAccountTypeFormSheet.tsx`; `loyalty-tier-automation*` / `loyalty-tier-clear` translations.
- **Contracts changed:** New query document `LoyaltyTierAutomations` (core `automations(actionTypes)`); consumes the seed link's new `actions` graph (`buildAutomationSeedLink`).
