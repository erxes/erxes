# `loyalty_ui` Plugin Guide

## Identity

- **Plugin:** `loyalty`
- **Project:** `loyalty_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/loyalty_ui`
- **Last synchronized:** `2026-10-19`

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
- The Rules card has a Conditions tab (`edit-pricing/components/conditions/ConditionRulesInfo.tsx`, list state in `usePricingConditionRules`): a list like the quantity rules, one row per core condition (by code, names from core `productConditions` via `pricingProductConditions`; a code with no condition shows as removed and still saves), edited in `ConditionRuleSheet` (form + zod in `useConditionRuleForm`: condition, discount type default / subtraction / percentage / bonus, value or bonus product, price adjust type without `truncate`, factor), saved as the plan's `conditionRules` through `pricingPlanEdit`; codes must be unique per plan. `FixedPricingTable` has no condition columns. Deleted products (`productStatus: 'deleted'`) stay listed there but read-only, marked "Not available".
- Pricing priority selection includes none, public, POS base, and scoped base pricing; POS-base and scoped-base plans hide participant targeting.
- Options detail supports branch, department, board, and pipeline selection.
- Board and pipeline selectors can clear an existing selection; clearing a board
  also clears the dependent pipeline in the options and stage forms.
- Loyalty settings include an Account types page (`/loyalty/settings/config/account-type`)
  to create, rename, archive, and restore loyalty account types and to convert
  score fields used by older campaigns into account types.
- The Scores page filters by campaign, owner type, owner, action, type, description and date; it has no source-record filter (a deal's board, pipeline, stage or number): loyalty keeps only `targetId`, and those filters, which read sales data loyalty does not own, were removed with their backend.
- The Loyalty sidebar (`MainNavigation` `NAV_ITEMS`) lists Scores, Accounts, Vouchers, Coupons, Donates, Spins, Lotteries, Assignments, Agents in that order; the navigation group opens on Scores (`defaultPath: 'loyalty/scores'`).
- The loyalty settings sidebar lists every loyalty settings page (Wallets, Score, Voucher, Lottery, Spin, Donate, Assignment, Coupon, then Pricing) from `LOYALTY_SETTINGS_PAGES` (`settings/constants/settingRoutes.ts`), rendered by `LoyaltySettingsNavigation`; the pages carry no inner sidebar. The wallet form's Expiry & reset section ends with a live preview (`LoyaltyAccountTypePeriodPreview` / `useLoyaltyAccountTypePeriodPreview`, query `LoyaltyAccountTypePeriodPreview` with the unsaved form values): when points earned today expire or become spendable, the next reset, what tiers become, the window before a reset in which purchases earn nothing, and for a saved wallet what the next reset would clear, keep and change. The Wallets page shows a period run panel (`LoyaltyPeriodRunPanel` / `useLoyaltyPeriodRunStatus`, query `LoyaltyPeriodRunStatus`): the next run time and time zone, what it will release, expire and reset, the last run, and a history popover; wallet mutations refetch it. `/loyalty/settings/config` has no page of its own and redirects to the wallets page (`config/account-type`). The former general config (currency ratio, share fee) is gone; neither value was read anywhere.
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
- The Adjust score step (`AdjustScoreCampaignActionConfigForm`) has a Points toggle: From a campaign (campaign + earning rows, as before) or Fixed (wallet via `SelectLoyaltyAccountType` + points). The schema (`adjustScoreActionConfigFormDefinitions.ts`) requires the campaign or the wallet and points by mode; steps without `mode` open as campaign. The node reads "Give N points to a wallet" for fixed steps, and the relation settings widget leaves fixed steps out of a source's campaign connections.
- An earning's points are explained by `EarnCalcPopover` (steps from `scores/utils/earnCalcSteps.ts`, using the breakdown's `calc`): on the score list's Breakdown cell and on each tier's result in the campaign form's earn preview — amount × % or ×N, ÷ money per point, rounding, and what the points pay.
- The voucher campaign Restriction tab (add and edit share `AddVoucherRestrictionForm`) has a "Per customer" limit (`VoucherOwnerLimitField`: count + period year/month/whole campaign); `toOwnerLimit` sends `perOwnerLimit`, or `null` when the count is empty so an edit clears it.
- The voucher campaign Campaign tab (add and edit) reads as three parts: what one voucher gives (type with a one-line hint; for `discount`/`reward` one Discount field with a %/Amount toggle and a sentence preview), Validity (each voucher works for a set time `validityCount`+`validityUnit` — default 1 month — or until the campaign ends; optional start, "No end" switch on by default for new campaigns) and Buy with points (`buyScore`). `toVoucherTerm` / `fromVoucherTerm` (`settings/voucher/utils/voucherTerm.ts`) turn the form into `startDate`/`endDate`/`validity` (nulls clear) and back. The list's End date column shows "No end". The Issue voucher automation step offers the campaign's validity or a custom `customRule {count, unit}`; older `customRule.duration` steps open as custom (one unit; `minute` reads as a day).
- The Vouchers page (`modules/loyalties/vouchers`) lists issued vouchers as Recipient, What it gives (`terms`), Valid until (days left), Status (`voucherDisplayStatus`: an open voucher past `expiresAt` shows Expired), Received and Held or used in; the status filter offers Unused / On hold / Used / Cancelled / Expired and "Expires within" 1 / 3 / 7 / 30 days (`SelectExpiresWithin`, query `expiresWithin`), both server-side. There is no free edit: the recipient opens `VoucherDetailSheet` (applies to, validity, where held or used, history) whose only actions are Mark as used (note) and Cancel (reason) for unused vouchers and Extend (date) for unused or held ones (`useVoucherActions`, mutations `LoyaltyVoucherCancel` / `LoyaltyVoucherMarkUsed` / `LoyaltyVoucherExtend`, refetching `VouchersMain`). The customer's Score Summary widget shows `OwnerVouchersCard`: the vouchers still to use, each opening the same sheet, and a count of the rest.
- The "Tier changed" trigger is configured by `TierChangedTriggerConfigForm` / `useTierChangedTriggerForm` (wallet required, direction up/down/any defaulting to up, target tier or any) and summarized on its node by `TierChangedTriggerNodeContent`, both registered in `LoyaltyRemoteEntry` (`triggerForm`, `triggerConfigContent`).
- Loyalty action nodes report what their config still misses (`useLoyaltyActionNodeIssues`: the action's own zod form schema, reported through `useReportNodeIssues` from `ui-modules`); the builder draws the warning and blocks activation.
- `/loyalty/accounts` ("Accounts" in the loyalty navigation) lists loyalty accounts: owner, owner type, account number, status, one column per active account type with its balance and an inline tier select, joined date. Filters: search (account number or owner name), status, owner type, account type and tier. Row menu: freeze (reason dialog) / unfreeze (confirm), tier history, score history (scores page filtered by owner), owner profile. Freeze, unfreeze and tier changes refetch `LoyaltyAccounts`; a tier change also refetches `LoyaltyTierLogs`.
- Tier history (`useLoyaltyTierLogs`, query `LoyaltyTierLogs` by `accountId` or `targetId`, newest 100; each line drawn by `LoyaltyTierLogItem`: wallet, from → to tiers with direction, when, what moved it (`tierLogSource`: automation by name, period reset of a wallet, a purchase named by its `targetName` (older lines just "a purchase"), or by hand) and who (`MembersInline`); names come from the log's own `accountType`). An account's history opens in `LoyaltyTierHistoryDialog` from the accounts row menu and the owner's account card; a record's (deal, order) tier changes follow its points in the record widget's own tab (`ScoreTargetHistoryWidget`, "Tier changes" with the owner's name, shown only when there are any, polled every 10s like the points and refreshed with them).
- The Set tier builder form has a mode: a fixed tier, or by purchase amount (`TierBandsFields`: a range per tier and only-upgrade; `toSetTierConfig` keeps only the chosen mode's fields; the node shows "By purchase amount"). In fixed mode a "Never lower a tier" checkbox sets `keepHigherTier` (dropped in amount mode). The UI no longer offers a date window; an older step's `startDate`/`endDate` is not in the form schema and is dropped on its next save. The campaign page's tier seed still uses `buildTierSeedActions` (customer trigger, split per tier).
- The score campaign form's wallet field has "New wallet" (`LoyaltyAccountTypeFormSheet` with `onCreated`); `useAddScoreCampaign` also refetches `ScoreCampaignsSimple` so pickers see a new campaign.
- Voucher campaign edit sheet has a "Birthday" tab (`settings/birthday/components/VoucherBirthdayReward.tsx`, outside the form steps, no footer submit): "Give on birthdays" makes the whole bundle in order — the shared "birthday today" customer segment (found by its `birthDate annt` root, created if missing), a workflow broadcast to it with an Issue voucher step following the segment's nightly refresh (`afterSegment`), an active automation on that segment's membership trigger (`joined`) with the same step (both steps have recipient `{{ trigger._id }}`), then `voucherCampaignSetAutoIssue`; any failure deletes what was made. Once connected the tab shows both parts as one row: next/last nightly run, links to the broadcast and the automation, one switch for both (schedule/cancel schedule + automation status) and Disconnect deleting both and the bundle record. Warns when the saved campaign has no per-customer limit, flags a bundle whose parts are missing or disagree.
- New score campaigns start active (the server's default), whether made on the settings page or in `LoyaltyScoreCreateSheet` (the campaign form opened from the record picker or the relation settings "New campaign"); the form sends no status. Pickers that must give points pass `status="active"` to `SelectScoreCampaign`.
- The relation widget (`./relationWidget`, `Widgets.tsx`) shows an owner's score summary on customers, companies and users, and on any other record (a deal, a POS order) tabs (`RecordLoyaltyWidget`): first the points that record moved — campaign, owner, earned/spent/given back, when, description, total (`ScoreTargetHistoryWidget`, query `LoyaltyTargetScoreLogs` = `scoreLogs(targetId)`, polled every 10 s while open since the record's plugin writes them), then one tab per customer linked to it through core relations (`useRecordLoyaltyTabs` / `useRelations`, plus the host's `customerId`) with that customer's score summary. Before this, a deal's id was read as an owner id and the summary showed nothing.
- The wallet form's General section sets who may earn (everyone, client portal members on customer wallets, or a segment's members via the loyalty `SelectSegment`); the automation result and the cashier preview name the `not-eligible` skip.
- Account controls follow permissions (`useLoyaltyAccountPermissions` over `usePermissionCheck`): freeze/unfreeze (card and row menu) only with `loyaltyAccountFreeze`; without `loyaltyAccountSetTier` the tier shows as a read-only badge.
- Record picker widget (`./recordPickerWidget`, declared as `widgets.recordPickerWidgets` `{ name: 'scoreCampaign', contentType: 'loyalty:score.campaigns' }`): other plugins' forms render it through `ui-modules` `RecordPickerWidget` to pick a score campaign; it is `SelectScoreCampaign` limited to active campaigns (`status="active"`) plus New (`LoyaltyScoreCreateSheet`, picks what it creates) and Edit (mounts `LoyaltyScoreEditSheet` only in the picker that asked, via `editScoreId`) (`widgets/recordPicker`).
- Relation settings widget (`./relationSettingsWidget`, declared as `widgets.relationSettingsWidgets` in `config.tsx`): shown as its own "Loyalty" tab on other plugins' settings pages (`RelationSettingsWidget`). Given a purchase context (trigger type, scopes, buyer attribution, `returnTo`) it lists the connections first and folds the setup behind "Add loyalty workflow" (`AddLoyaltyWorkflow`: a kind tab, scope picker and the kind's fields; "New campaign" / "New wallet" open `LoyaltyScoreCreateSheet` / `LoyaltyAccountTypeFormSheet` in place and pick what they create via `onCreated`, so nothing needs leaving the source's page) — Give points (Adjust score, campaign picker) and Set tier, by purchase history only (a tier from one purchase is the source's own built-in setting): offered only when the chosen scope carries `history` (otherwise a note says tiers are set in the source's own settings); wallets with active tiers, period this month / quarter / year / between dates (`TierHistoryFields`), the shared `TierBandsFields` (an amount range per tier and only-upgrade), and Connect first creates automation-owned customer segments from `utils/tierHistorySegments.ts` (trigger: sum of the scope's purchases in the period ≥ the lowest band; one per tier for its band), then seeds a Customer trigger on that segment with `reEnrollmentRules: ['relation:children.0']` and a `purchaseSource` marker (the source trigger and scope), a split with one segment branch per tier (highest first) and a fixed Set tier on each with `keepHigherTier` from only-upgrade; a failure removes the segments it made) — and shows connections in loyalty terms ("campaign ← scope", status, an on/off switch that sets the automation's status through `automationsEdit` (`LoyaltySourceAutomationSetStatus`; core validates activation, off for an incomplete step), Details opens the builder, Disconnect deletes the automation after a confirm) for the automations that run loyalty Adjust score or Set tier on that trigger (or on a Customer trigger whose `purchaseSource` names it), matching a trigger to the scope whose every key it shares (query `LoyaltySourceAutomations`), reads what the host already does on its own from `context.config.loyalty` (`{ earnCampaignIds, tierWalletIds }`, `readLoyaltyBuiltIn`; anything else ignored) and lists those as read-only "Built in" rows (an inactive campaign flagged), flags an automation feeding a campaign or wallet the host also feeds built in ("Also set built in; keep one"), warns only when neither built-in rows nor an active complete automation give points to an active campaign, disconnecting through `LoyaltySourceAutomationRemove` (evicted from the Apollo cache), and "Connect" seeds the builder with the scope's trigger and an Adjust score already holding the chosen campaign. It renders nothing without a trigger and never knows which plugin hosts it.
- A saved score campaign's sheet has an Automations tab (`ScoreCampaignAutomations` / `useScoreCampaignAutomations`) listing the automations giving its points (Adjust score with this `campaignId`) and, when its account type has tiers, the ones setting those tiers (Set tier with that `accountTypeId`), each linking to the builder, with a create button under each list (a point automation from here counts every row). Automations are also started where the rule lives (`useCampaignAutomationSeeds`, campaign id from `ScoreCampaignProvider`): each base/bonus row of the earning table has, in its row menu (`EarnRowActions`, with delete), an item that opens an unsaved builder with only an Adjust score action (campaign, add, that row's `earnRowKeys`) and no trigger, enabled once the row is saved; a "Create tier automation" button above the table seeds an empty customer trigger, a split with one branch per active tier (highest first) and a Set tier on each branch. Both seeds and the Automations tab's edit links carry `returnTo` (this page, labelled with the campaign title) so the builder offers a way back, kept after the first save. Account types carry no automation section.
- Pricing list loads filtered plans in 20-record pages as users scroll and
  shows the full filtered record count from the API.

## Architecture

| Area                  | Path                                                                                                      | Responsibility                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| App sidebar | `frontend/plugins/loyalty_ui/src/Sidebar.tsx` | `LoyaltySidebar` (app sidebar) and `LoyaltySidebarFooter` (Settings link), rendered by the `./loyalty` entry through `AppLayout` |
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
- Birthday reward operations `LoyaltyBirthdayVoucherCampaign`, `LoyaltyBirthdaySegments`, `LoyaltyBirthdayBroadcast`, `LoyaltyBirthdayAutomation`, `LoyaltyBirthdayBroadcastAdd`, `LoyaltyBirthdayBroadcastFollow`, `LoyaltyBirthdayBroadcastUnfollow`, `LoyaltyBirthdayBroadcastRemove`, `LoyaltyBirthdayAutomationAdd`, `LoyaltyBirthdayAutomationSetStatus`, `LoyaltyBirthdayAutomationRemove`, `LoyaltyBirthdayRewardSet`, `LoyaltyBirthdayRewardRemove`.
- `PricingPlans` queries request `pricingPlansCount` with the same filters as
  the list and page through `page`/`perPage`.

### Consumes

- Core segments (`segments`, `SEGMENT_ADD` from `ui-modules`), broadcasts (`engageMessageAdd` with `method: workflow` + `workflow`, `engageMessageSetSchedule(afterSegment)`, `engageMessageCancelSchedule`, `engageMessageDetail`, `engageMessageRemove`) and automations (`automationsAdd`, `automationsEdit` status, `automationDetail`, `automationsRemove`) for the birthday bundle.
- Core `productConditions` (product conditions owned by core products, matched by code).

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

- The plugin owns its whole app sidebar. `src/modules/loyalties/SubNavigations.tsx` (the `./loyalty`
  expose) wraps its routes in `erxes-ui` `AppLayout` (`id="loyalty"`) with
  `LoyaltySidebar`. Core-ui draws only the top `CoreTab` bar; `navigationGroup` in
  `src/config.tsx` supplies just the tab name, icon and `defaultPath` and takes
  no `content`/`subGroup`.
- `LoyaltySidebarFooter` pins a Settings link to the bottom of the app
  sidebar. The plugin owns its settings at `/loyalty/settings/*`, served by its
  own entry: the entry's top-level `<Routes>` sends `settings/*` to
  `LoyaltySettingsLayout` (`src/Sidebar.tsx`, an `AppLayout` titled
  "<Plugin> settings" with a Back link to the app) and `*` to the app
  `AppLayout`. Settings pages render inside `PluginSettingsRoutes`
  (`ui-modules`), which also serves `tags` and `properties/*` scoped to
  this plugin's types; the settings sidebar appends
  `PluginSharedSettingsNavigation`, which lists Tags/Properties only when the
  plugin registers those types. Core organization settings never list
  plugin settings, `config.tsx` has no `settingsNavigation`, and there is
  no `./loyaltySettings` expose; old `/settings/loyalty/…` URLs are redirected
  by core. The settings navigation renders no `Sidebar.GroupLabel`.
- Page header breadcrumbs follow the shared pattern: crumbs are default ghost `Button`s (no `font-semibold`), the first crumb carries a 16px icon in the default text color, crumbs are separated by `Separator.Inline` or `Breadcrumb.Separator`, and settings pages carry no favorite toggle. `LoyaltyMainLayout` renders its title as that ghost-button crumb, not a plain span.
- Page-level side menus render `Sidebar.Panel` from `erxes-ui`, which keeps its own open state (`sidebarPanelOpenState`), separate from the plugin's `AppLayout` sidebar. The panel sits beside the page header, never under it: the page is a row of the panel and a column holding the header and content. The panel passes its heading as `label`, which renders a 40px title row with optional `actions` and the collapse toggle on the right, level with the page header; when collapsed, the toggle moves into the header's panel slot. Do not add a second heading or an in-panel `Sidebar.PanelTrigger` row. Keep `<Sidebar collapsible="none">` for sidebars inside sheets and dialogs. `PricingEdit` takes the pricing page header as `header` so `PricingEditSidebar` sits beside it.
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
- `Sheet.Header` is a fixed 40px row. A header with a visible second line (subtitle, record number, description) adds `h-auto py-2` so it sizes to its content; detail-page title rows are `h-10`, level with `PageHeader`.
- Loyalty list filters (donates, spin, coupons, assignments, agents, lotteries, scores, vouchers, accounts) render the filter popover trigger as the first child of `Filter.Bar`, so the filter icon stays fixed while selected filter chips appear after it; total counts stay last.

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

### `2026-10-14` — Issued vouchers: list, detail and actions

- **Summary:** The Vouchers page shows what each voucher gives, until when and where it was held or used; a voucher opens a detail sheet with its history and only cancel / mark used / extend; the customer's loyalty widget lists their vouchers.
- **Affected areas:** `modules/loyalties/vouchers/{components/{VoucherColumns,VoucherRecordTable,VoucherOwner,VoucherStatusBadge,OwnerVouchersCard,detail/VoucherDetailSheet}.tsx,components/selects/SelectStatus.tsx,hooks/{useVoucherActions,useVoucherDetail,useOwnerVouchers}.ts,utils/voucherView.ts,types/voucher.ts,graphql/**}` (removed `VoucherEditSheet`, `useEditVoucher`), `modules/loyalties/scores/components/ScoreSummaryWidget.tsx`; `voucher-*` translations.
- **Contracts changed:** None

### `2026-10-14` — Fixed points in Adjust score

- **Summary:** An Adjust score step can give a fixed number of points into a chosen wallet instead of earning through a campaign.
- **Affected areas:** `widgets/automations/modules/loyalty/{states/adjustScoreActionConfigFormDefinitions.ts,hooks/useAdjustScoreActionForm.ts,components/action/{adjust-score/AdjustScoreCampaignActionConfigForm.tsx,LoyaltyActionNodeContent.tsx}}`, `widgets/relationSettings/hooks/useLoyaltySourceAutomations.ts`; `score-give-mode*`, `score-fixed-points*` translations.
- **Contracts changed:** None

### `2026-10-14` — Voucher campaign form and validity

- **Summary:** The voucher campaign form says what a voucher gives and how long it works; campaigns may run without an end, and automation steps may override a voucher's term. Creating a campaign now also sends the per-customer limit (the create document lacked it).
- **Affected areas:** `settings/voucher/{constants/voucherFormSchema.ts,utils/voucherTerm.ts,types/voucherTypes.ts,hooks/useAddVoucher.tsx,graphql/mutations/{VoucherMutations.tsx,voucherEditStatusMutations.ts},graphql/queries/getCampaignQuery.ts,components/{VoucherAddSheet,VoucherColumns}.tsx}`, `add-voucher-campaign/components/{AddVoucherCampaignForm,VoucherTabs}.tsx`, `voucher-campaign-field/*`, `voucher-detail/components/{EditVoucherTabs,LoyaltyVoucherEditSheet}.tsx`, `components/LoyaltyCampaignColumnHelpers.tsx`, `widgets/automations/modules/loyalty/{states/campaignActionConfigFormDefinitions.ts,hooks/useCampaignActionForm.ts,components/action/voucher/IssueVoucherActionConfigForm.tsx}`; `voucher-*` translations.
- **Contracts changed:** None

### `2026-10-08` — Score campaign picker for other plugins

- **Summary:** Loyalty offers a score campaign field with create and edit to other plugins' forms (first used by sales' score earn configuration).
- **Affected areas:** `widgets/recordPicker/**`, `config.tsx`, `module-federation.config.ts`.

### `2026-10-07` — Birthday tab on voucher campaigns

- **Summary:** A voucher campaign's edit sheet connects it to birthdays: the nightly broadcast and the daytime segment-entry automation are made, switched and removed together.
- **Affected areas:** `settings/birthday/{constants,graphql,hooks,components}`, `settings/voucher/voucher-detail/components/EditVoucherTabs.tsx`; `birthday-reward-*` translations.

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
