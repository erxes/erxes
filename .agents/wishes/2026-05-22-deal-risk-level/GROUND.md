# GROUND: Add riskLevel enum to Deal

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md)
**Status:** complete — ready for Phase 4

## Sister features

### Sister 1: `priority` (full-stack sister — every layer wired)
**Why chosen:** `priority` is a free-text string today but the UI treats it as a controlled enum via `PROJECT_PRIORITIES_OPTIONS`. It threads through schema → IDeal → GraphQL → mutation fragments → detail-sheet field, kanban card, and action-bar filter. Exactly the shape this wish needs.
**Implemented in:**
- `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts:96` — schema path
- `backend/plugins/sales_api/src/modules/sales/@types/deal.ts:66` — `IDeal.priority?: string`
- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts` — `queryParams` (line 43), `type Deal` (line 103), `mutationParams` (line 214)
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts:359` — `if (priority) { filter.priority = { $in: priority } }`
- `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts` — `commonFields` (line 75), `commonMutationVariables` (line 164), `commonMutationParams` (line 186)
- `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts` — `commonParams` (line 11 — `$priority: [String]`), `commonParamDefs` (line 41), `commonListFields` (line 116)
- `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts:31` — `priority?: string` on `IItem`
- `frontend/plugins/sales_ui/src/modules/deals/constants/cards.ts` — `PROJECT_PRIORITIES_OPTIONS` + `TPriorityValue`
- `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectPriority.tsx` — `<SelectPriorityRoot>` (the dropdown rendered in the deal detail sheet) — `card` and `filter` variants are built in
- `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectDealPriority.tsx` — wraps `SelectPriority` with the `editDeals` mutation; this is the actual binding between the dropdown and Apollo
- `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/PriorityInline.tsx` — `<PriorityIcon>`, `<PriorityTitle>`, `<PriorityBadge>` (used for the card's inline display)
- `frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectPriority.tsx` — the **action-bar** filter version (`FilterBar`, `FilterView`, `FilterItem` namespaced via `Object.assign`)
- `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx:122` — `<SelectDealPriority dealId={_id} value={priority} variant="card" />` is rendered inside the **deal detail sheet** (this is the file the previous session couldn't find)
- `frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx:156` — `<SelectDealPriority>` rendered on the **kanban card**
- `frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx:174,217,242` — `<SelectPriority.FilterBar>`, `<SelectPriority.FilterItem>`, `<SelectPriority.FilterView>` wire the action-bar filter
- `frontend/plugins/sales_ui/src/modules/deals/actionBar/constants/Filters.ts:31` — `{ key: 'priority', value: 'Priority', icon: IconStackFront }` is what makes the filter discoverable in the "+ Add filter" menu
- `frontend/plugins/sales_ui/src/modules/deals/actionBar/types/actionBarTypes.ts:21` — `priority?: string[] | null` on `SalesFilterState`

### Sister 2: segment field (`closeDate` / `priority`)
**Why chosen:** The `add-sales-segment-field.md` skill says any path with `esType:` auto-discovers via `generateSalesFields`. `closeDate` (line 71 of `deals.ts`, `esType: 'date'`) is the closest precedent: it's a Deal path that shows up in the segment builder without a custom `propertyConditionExtender` branch. For `riskLevel` (a string), the analogue is `esType: 'keyword'`. No segment-config code change is required.
**Implemented in:**
- `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts:71` — `closeDate` schema entry showing `esType: 'date'`
- `backend/plugins/sales_api/src/modules/sales/meta/segments/segmentConfigs.ts` — single `contentTypes` entry; no per-field config to extend
- `backend/plugins/sales_api/src/modules/sales/meta/segments/segments.ts:46–66` — `propertyConditionExtender` only handles **derived** / virtual / nested-array properties; a plain Deal path with `esType:` does not need a branch here

## Files I read in full

(Phase 3 gate — Read-tool calls match this list. 14 files.)

- [x] `.agents/SYSTEM-PROMPT.md`
- [x] `.agents/WORKFLOW.md`
- [x] `.agents/SLOP-CHECKLIST.md`
- [x] `.agents/memory/lessons.md`
- [x] `.agents/memory/glossary.md`
- [x] `.agents/skills/sales/add-deal-field.md`
- [x] `.agents/skills/sales/add-sales-segment-field.md`
- [x] `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts`
- [x] `backend/plugins/sales_api/src/modules/sales/@types/deal.ts`
- [x] `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts`
- [x] `backend/plugins/sales_api/src/modules/sales/db/models/Deals.ts` (createDeal/updateDeal — both spread the doc, no per-field handling needed)
- [x] `backend/plugins/sales_api/src/modules/sales/meta/segments/segmentConfigs.ts`
- [x] `backend/plugins/sales_api/src/modules/sales/meta/segments/segments.ts`
- [x] `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts`
- [x] `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts`
- [x] `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts`
- [x] `frontend/plugins/sales_ui/src/modules/deals/constants/cards.ts`
- [x] `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectPriority.tsx`
- [x] `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectDealPriority.tsx`
- [x] `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/PriorityInline.tsx`
- [x] `frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectPriority.tsx`
- [x] `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx`
- [x] `frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx`
- [x] `frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx`
- [x] `frontend/plugins/sales_ui/src/modules/deals/actionBar/constants/Filters.ts`
- [x] `frontend/plugins/sales_ui/src/modules/deals/actionBar/types/actionBarTypes.ts`
- [x] `frontend/plugins/sales_ui/src/modules/deals/cards/hooks/useDeals.tsx` (useDealsEdit signature — extra mutation variables are accepted via `variables:`)
- [x] `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts` (priority filter pattern at line 359)
- [x] `.agents/plugins/sales/tests/deals.spec.ts` (existing test patterns + eval-files header convention)
- [x] `.agents/templates/PLAN.md`, `.agents/templates/REVIEW.md`, `.agents/templates/GROUND.md`

## Files to edit (mapped from sisters)

| File | Why | Sister equivalent |
|---|---|---|
| `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts` | add `riskLevel` path with `esType: 'keyword'` | `priority` line 96 (no esType) + `closeDate` line 71 (esType pattern) |
| `backend/plugins/sales_api/src/modules/sales/@types/deal.ts` | add `riskLevel?: 'low' \| 'medium' \| 'high'` to `IDeal` | `priority?: string` line 66 — tightened to enum for type safety |
| `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts` | add `riskLevel: String` to `queryParams`, `type Deal`, `mutationParams` | `priority` at lines 43, 103, 214 |
| `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts` | add `if (riskLevel) { filter.riskLevel = { $in: riskLevel } }` branch | `priority` branch line 359 |
| `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts` | add to `commonFields`, `commonMutationVariables`, `commonMutationParams` | `priority` at lines 75, 164, 186 |
| `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts` | add `$riskLevel: [String]` to commonParams + defs, add `riskLevel` to `commonListFields` | `priority` at lines 11, 41, 116 |
| `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts` | add `riskLevel?: 'low' \| 'medium' \| 'high'` to `IItem` | `priority?: string` line 31 |
| `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx` | render the new `SelectDealRiskLevel` in the detail sheet | `SelectDealPriority` at line 122 |
| `frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx` | render the new `RiskLevelBadge` on the kanban card | `<SelectDealPriority>` at line 156 — but we use a read-only badge here (per SPEC #3) |
| `frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx` | wire the new filter into Bar, View, queries | `SelectPriority.FilterBar/View/FilterItem` lines 174, 217, 242 |
| `frontend/plugins/sales_ui/src/modules/deals/actionBar/constants/Filters.ts` | add `{ key: 'riskLevel', value: 'Risk level', icon: ... }` | `priority` entry line 31 |
| `frontend/plugins/sales_ui/src/modules/deals/actionBar/types/actionBarTypes.ts` | add `riskLevel?: string[] \| null` to `SalesFilterState` | `priority?: string[] \| null` line 21 |
| `.agents/plugins/sales/tests/deals.spec.ts` | add risk-level assertions for SPEC criteria 1–5 | existing test patterns in same file |

## Files to create

| File | Why | Closest existing analogue |
|---|---|---|
| `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/RiskLevelInline.tsx` | small components (`RiskLevelDot`, `RiskLevelTitle`, `RiskLevelBadge`) with traffic-light colors | `PriorityInline.tsx` |
| `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectRiskLevel.tsx` | the picker (Root + FilterBar + FilterView + FilterItem) | `SelectPriority.tsx` (action-bar variant in `components/common/filters/`) |
| `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectDealRiskLevel.tsx` | wraps `SelectRiskLevel` with the `useDealsEdit` mutation | `SelectDealPriority.tsx` |
| `frontend/plugins/sales_ui/src/modules/deals/constants/riskLevel.ts` | `RISK_LEVEL_OPTIONS = ['low','medium','high']`, default `'low'`, color map (`green/amber/red`) | `cards.ts` (`PROJECT_PRIORITIES_OPTIONS` + `TPriorityValue`) |

## Deviations from sister

- **Kanban card render is a read-only badge, not a clickable picker.** SPEC #3 calls for a *colored badge* on the card (display only); the detail sheet is the edit surface (SPEC #1). The `priority` sister renders an editable picker on the card too. This is intentional per the SPEC scope.
  **Risk:** sales users may expect to click-to-edit the badge from the card. Mitigated by clicking the card opens the detail sheet (existing behavior in `DealsBoardCard.onCardClick`) where the picker is available.

- **`IDeal.riskLevel` is typed as a string-union enum (`'low' \| 'medium' \| 'high'`), not bare `string`.** The `priority` sister uses bare `string`. Tightening here costs nothing (the schema stays `type: String, optional`) and gets us compile-time safety for the three known values.
  **Risk:** none — if someone later wants a fourth value, the union is one edit away.

- **`riskLevel` schema path gets `esType: 'keyword'` (priority doesn't).** SPEC #5 needs the field segmentable in the segment builder, which (per the `add-sales-segment-field.md` skill) is driven by `esType:` on the Mongoose path. The `priority` field is **not** segmentable today (no `esType`), so we deviate to satisfy SPEC #5.
  **Risk:** none — `esType: 'keyword'` on an optional string is the exact pattern `productId`/`branchId` use throughout this schema (lines 12, 31, etc.).

## Cross-plugin impact

- [x] No (sales only) — no federation type changes, no tRPC additions, no pubsub events.

## Approval

- [x] All listed files read in full
- [x] Sister features confirmed appropriate (priority + closeDate for segments)
- [x] Deviations documented (3 — kanban-badge read-only, IDeal enum, esType for segments)
- [x] Cross-plugin impact assessed (none — sales only)
