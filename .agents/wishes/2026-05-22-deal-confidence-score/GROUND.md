# GROUND: Add `confidenceScore` to deals

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md)

## Sister features

### Sister 1: `priority` (string, all four surfaces wired)
**Why chosen:** `priority` is the only field on `main` that is wired through every surface this wish needs — detail-sheet edit (`SelectDealPriority`), kanban-card display (`DealsBoardCard`), action-bar filter (`components/common/filters/SelectPriority` + `actionBar/components/SalesFilter` + `actionBar/constants/Filters`), and the GraphQL `queryParams` filter. It is the canonical end-to-end shape mirror.

**Implemented in:**
- `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts:96` — Mongoose schema entry
- `backend/plugins/sales_api/src/modules/sales/@types/deal.ts:66` — `IDeal.priority?: string`
- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts:43,103,214` — `queryParams`, `type Deal`, `mutationParams`
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts:359-361` — filter resolution `filter.priority = { $in: priority }`
- `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts:75,164,186` — `commonFields`, `commonMutationVariables`, `commonMutationParams`
- `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts:11,41,116` — `commonParams`, `commonParamDefs`, `commonListFields`
- `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts:31` — `IItem.priority?: string`
- `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectPriority.tsx` — variant-aware picker (Card/Detail/Form/FilterBar/FilterView). Exposes `SelectPriority = Object.assign(Root, { FilterBar, FormItem, FilterView })`.
- `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectDealPriority.tsx` — `useDealsEdit` wrapper that fires the edit mutation on change
- `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/PriorityInline.tsx` — `Icon`, `Title`, `Badge` primitives used by the picker
- `frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectPriority.tsx` — separate action-bar filter (uses `Filter.View` / `Filter.BarItem` / `Filter.BarButton` / `Filter.Item`; query-state shape is `string[]`)
- `frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx:156-160` — renders `<SelectDealPriority variant="card">` on every kanban card
- `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx:119-128` — renders `<SelectDealPriority variant="card">` in the detail sheet
- `frontend/plugins/sales_ui/src/modules/deals/actionBar/constants/Filters.ts:31` — `{ key: 'priority', value: 'Priority', icon: IconStackFront }`
- `frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx:35,104,174,217,242` — query-state declaration, destructure, FilterBar render, FilterView render
- `frontend/plugins/sales_ui/src/modules/deals/actionBar/types/actionBarTypes.ts:21` — `priority?: string[] | null` (note: array shape even though UI is single-select)

### Sister 2: `score` (number, read-only, no filter)
**Why chosen:** Only existing `Number` field on `Deal` that threads through GraphQL (`Float`) and the list query. Confirms how a numeric scalar is shaped at every layer, even though `score` is intentionally read-only (no `mutationParams`, no filter). Useful for the non-string-scalar pattern, NOT useful as a write/filter mirror.

**Implemented in (relevant lines only):**
- `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts:120-125` — `score: { type: Number, optional: true, label: 'Score', esType: 'number' }`
- `backend/plugins/sales_api/src/modules/sales/@types/deal.ts:76` — `score?: number`
- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts:116` — `score: Float` in `type Deal` (not in `queryParams` or `mutationParams`)
- `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts:43` — `IItem.score?: number`
- `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts:122` — `score` in `commonFields` (read fragment)
- `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts:118` — `score` in `commonListFields`

## Files I read in full

(Phase 3 gate: 21 `Read` tool calls in this phase; one of them was 2 calls covering the same file with offset = 1 file. Total = 21 files read.)

- [x] `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts` — full Mongoose Deal schema, sees `priority`, `score`, `order` (indexed Number), `tagIds`/`branchIds` (indexed array), `totalAmount` (indexed Number).
- [x] `backend/plugins/sales_api/src/modules/sales/@types/deal.ts` — `IDeal`, `IDealDocument`, `IDealQueryParams`, `IArchiveArgs`.
- [x] `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts` — full GraphQL surface: `typeDeps`, `inputDeps`, `queryParams`, `types`, `archivedDealsParams`, `queries`, `mutationParams`, `mutations`.
- [x] `backend/plugins/sales_api/src/modules/sales/db/models/Deals.ts` — `getDeal`, `createDeal`, `updateDeal`, `watchDeal`, `removeDeals`. Confirms write path; no per-field validation today. Auto activity-log via `generateDealUpdateActivityLogs`.
- [x] `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts` — `generateFilter`, `fetchDeals`, `dealQueries`, including the `priority` filter (line 359-361).
- [x] `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/mutations/deals.ts` — `dealMutations` object; `dealsAdd` and `dealsEdit` delegate to `addDeal` / `editDeal` from `./utils.ts`.
- [x] `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/mutations/utils.ts` — `addDeal`, `editDeal`, plus score-campaign / loyalty helpers. Neither `addDeal` nor `editDeal` does field-specific validation; they spread `doc` and pass to the model.
- [x] `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts` — `commonFields`, `commonMutationVariables`, `commonMutationParams`, `ADD_DEALS`, `EDIT_DEALS`.
- [x] `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts` — `commonParams`, `commonParamDefs`, `commonListFields`, `GET_DEALS`, `GET_DEAL_DETAIL` (reuses `commonListFields`).
- [x] `frontend/plugins/sales_ui/src/modules/deals/constants/formSchema.ts` — full Zod schema (7 fields, all string or string[]; **no numeric/scalar precedent**).
- [x] `frontend/plugins/sales_ui/src/modules/deals/cards/components/AddCardForm.tsx` — the add-deal sheet (`name`, `description`, `assignedUserIds`, `labelIds`, `companyIds`, `customerIds`; **no numeric/scalar Form.Field precedent**).
- [x] `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts` — `IItem`, `IDeal extends IItem`.
- [x] `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectPriority.tsx` — the variant-aware picker; uses internal `number` (0–4) and `PROJECT_PRIORITIES_OPTIONS` lookup. **A useful structural mirror — for `confidenceScore` we keep the variants but drop the lookup since we're already numeric.**
- [x] `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectDealPriority.tsx` — `useDealsEdit` wrapper; bridges string↔number via `PRIORITY_MAP`. For `confidenceScore` the bridge is unneeded.
- [x] `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/PriorityInline.tsx` — `PriorityIcon`, `PriorityTitle`, `PriorityBadge`.
- [x] `frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectPriority.tsx` — action-bar filter; uses `useQueryState<TPriorityValue[]>('priority', { defaultValue: [] })` — the array-of-one-element slop from lesson 2026-05-22.
- [x] `frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx` — kanban card; renders `SelectDealPriority` at line 156-160 in the same flex row as label/tag/customer/company filter-bar buttons.
- [x] `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx` — detail-sheet form; renders `SelectDealPriority` at line 119-128 inside a `<Label>Priority</Label>` block.
- [x] `frontend/plugins/sales_ui/src/modules/deals/actionBar/constants/Filters.ts` — `ActionBarFilters` registry; `priority` at line 31.
- [x] `frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx` — top-level filter component with `SalesFilterBar` and `SalesFilterView`; wires every filter at five spots.
- [x] `frontend/plugins/sales_ui/src/modules/deals/actionBar/types/actionBarTypes.ts` — `FilterItem`, `SalesFilterState`.

## Files to edit (mapped from sisters)

| File | Why | Sister equivalent |
|---|---|---|
| `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts` | Add `confidenceScore: { type: Number, min: 0, max: 100, optional: true, index: true }` after `priority`. **Deviation:** use `min`/`max` (no Mongoose sister currently uses these). | `priority` (line 96) + `order` (line 68, index) |
| `backend/plugins/sales_api/src/modules/sales/@types/deal.ts` | Add `confidenceScore?: number` to `IDeal` interface. | `priority?: string` (line 66) + `score?: number` (line 76) |
| `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts` | Add `confidenceScore: Int` to `type Deal` (after `priority`), `confidenceScore: Int` to `mutationParams`, and `confidenceScoreMin: Int` to `queryParams`. **Deviation:** `Int` not `Float` (integer-only); filter as scalar `confidenceScoreMin: Int`, not array. | `priority: String / [String] / String` at lines 43, 103, 214 + `score: Float` at 116 |
| `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts` | Destructure `confidenceScoreMin` from `params`; add `if (confidenceScoreMin !== undefined && confidenceScoreMin !== null) { filter.confidenceScore = { $gte: confidenceScoreMin }; }` near line 360. | `priority` filter at line 359-361 (but using `$gte` instead of `$in`) |
| `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts` | Add `confidenceScore` to `commonFields`, `$confidenceScore: Int` to `commonMutationVariables`, `confidenceScore: $confidenceScore` to `commonMutationParams`. | `priority` at lines 75, 164, 186 |
| `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts` | Add `confidenceScore` to `commonListFields`; add `$confidenceScoreMin: Int` to `commonParams`; add `confidenceScoreMin: $confidenceScoreMin` to `commonParamDefs`. | `priority` (3 spots) + `score` in commonListFields |
| `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts` | Add `confidenceScore?: number` to `IItem`. | `priority?: string` (line 31) + `score?: number` (line 43) |
| `frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx` | Add `confidenceScore` to the destructure (line 91-104) and render `<SelectDealConfidenceScore dealId={_id} value={confidenceScore ?? 0} variant="card" />` next to `SelectDealPriority` (around line 156). | `SelectDealPriority` block at line 156-160 |
| `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx` | Destructure `confidenceScore` from `deal`; add a new `<Label>Confidence</Label>` block with `<SelectDealConfidenceScore dealId={_id} value={confidenceScore ?? 0} variant="card" />` next to the existing Priority block (line 119-128). | Priority block at line 119-128 |
| `frontend/plugins/sales_ui/src/modules/deals/actionBar/constants/Filters.ts` | Add `{ key: 'confidenceScoreMin', value: 'Confidence', icon: IconChartBar }` (or similar tabler icon) to the same row as Priority. | `priority` at line 31 |
| `frontend/plugins/sales_ui/src/modules/deals/actionBar/types/actionBarTypes.ts` | Add `confidenceScoreMin?: number \| null` to `SalesFilterState`. **Deviation:** scalar number, not array. | `priority?: string[] \| null` (line 21) |
| `frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx` | Add `'confidenceScoreMin'` to `useMultiQueryState` array (line 23-40), destructure in `SalesFilterBar`, render `<FilterConfidenceScore.FilterBar />` (line 174 area), render `<FilterConfidenceScore.FilterItem ... />` in `SalesFilterView` (line 217 area), render `<FilterConfidenceScore.FilterView />` (line 242 area). | `priority` / `SelectPriority` wiring at lines 35, 104, 174, 217, 242 |
| `frontend/plugins/sales_ui/src/modules/deals/constants/formSchema.ts` | Add `confidenceScore: z.number().int().min(0).max(100).optional()` to `salesFormSchema`. **Deviation:** first numeric/scalar field in this schema. | None — no Zod numeric sister; lifted from Mongoose `min:0,max:100` |
| `frontend/plugins/sales_ui/src/modules/deals/cards/components/AddCardForm.tsx` | Add `<Form.Field name="confidenceScore">` rendering an `<Input type="number" min={0} max={100} />` next to the other fields. Add `confidenceScore: undefined` to `defaultValues` (or omit and let Zod handle optional). **Deviation:** first numeric Form.Field in this form. | None — no add-form sister for numeric. Closest structurally is the `name` field rendered via `Input` (line 64-76). |

## Files to create

| File | Why | Closest existing analogue |
|---|---|---|
| `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectConfidenceScore.tsx` | Variant-aware picker: `Card` / `Detail` / `Form` / `FilterBar` / `FilterView`. Single file using `Object.assign` like `SelectPriority` (per lesson 2026-05-22 on filter UI split). Renders an integer 0–100 input + a progress-bar display. | `components/deal-selects/SelectPriority.tsx` |
| `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectDealConfidenceScore.tsx` | Thin `useDealsEdit` wrapper. Receives `dealId` + `value` + `variant`, fires `editDeals({ variables: { _id, confidenceScore } })` on change. No string↔number bridge needed (already numeric). | `components/deal-selects/SelectDealPriority.tsx` |
| `frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectConfidenceScore.tsx` | Action-bar filter using `useQueryState<number>('confidenceScoreMin')` (**scalar**, not array — see Deviations). Exposes `SelectConfidenceScore = Object.assign(Provider, { FilterBar, FilterView, FilterItem })`. | `components/common/filters/SelectPriority.tsx` |

(Activity-log row component is **not** created — see Deviations.)

## Deviations from sister

### 1. Mongoose `min`/`max` range constraint (no existing sister uses these)
- **What's different:** `confidenceScore` gets `{ type: Number, min: 0, max: 100, optional: true, index: true }`. No other field in `dealSchema` uses `min`/`max`.
- **Why we deviate:** SPEC requires range validation that survives non-UI write paths (forged GraphQL, direct Mongo, tRPC). Lesson `2026-05-22 — TS narrowing without Mongoose enforcement` mandates that runtime constraints match the type story. The cleanest enforcement point is the Mongoose schema; both `createDeal` and `updateDeal` pass through it.
- **Risk:** A pre-existing deal that for any reason has a value outside [0, 100] would fail `updateDeal` on any edit. Since the field is new, **no such deals exist**, so the risk is zero on day one.

### 2. Filter shape: scalar `Int`, not `[Int]` (`$gte`, not `$in`)
- **What's different:** `priority` filter is declared `priority: [String]` and resolved as `{ $in: priority }`. `confidenceScoreMin` is declared `confidenceScoreMin: Int` and resolved as `{ $gte: confidenceScoreMin }`.
- **Why we deviate:** SPEC's filter is a single threshold ("Confidence ≥ N"), not multi-select. Mirroring `priority`'s array shape would inherit the slop documented in lesson `2026-05-22 — Single-value filter shaped as an array (premature flexibility from mirror)`. SLOP-CHECKLIST.md "Premature flexibility inherited from precedent" forbids the inherited shape.
- **Risk:** None. Future "multi-threshold" UI (unlikely) would require a schema change either way.

### 3. GraphQL `Int`, not `Float`
- **What's different:** `score` (the numeric sister) uses `Float` in GraphQL. `confidenceScore` uses `Int`.
- **Why we deviate:** SPEC pins integer 0–100. `Float` would allow `67.5` from a non-UI write, contradicting the contract. `Int` enforces integer-only at the GraphQL boundary; combined with Mongoose `min`/`max`, the type story is tight.
- **Risk:** Apollo will coerce float literals to int on incoming variables — minor surprise if a test ever sends `60.0`. Mongoose's `min`/`max` still passes; the GraphQL layer rejects before that.

### 4. Add-deal form numeric field — first of its kind (NOVEL territory)
- **What's different:** No existing field in `salesFormSchema` / `AddCardForm.tsx` is numeric, an enum picker, or anything other than a string / string[]. Adding `confidenceScore` to the Add form is the **first numeric Form.Field** in this surface. There is no sister to mirror exactly.
- **Why we deviate:** Developer chose all four surfaces in WISH Phase 0 including Add-deal form. Lesson `2026-05-22 — add-deal-field.md skill points to the wrong UI surface for "edit" wishes` explicitly flags this gap.
- **Risk:** Without precedent we have two ways to build it. Both are slightly novel:
  - **(a) Plain `<Input type="number" min={0} max={100} />`** — simplest. Mirrors the structure of the existing `name`-field render (the only other plain `<Input>` in the form). The native HTML number input handles clamping in the browser; Zod `min(0).max(100)` is the source of truth.
  - **(b) `<SelectConfidenceScore.FormItem />`** — reuses the same picker we're building for the detail sheet. Adds visual consistency but pulls in extra dependencies inside the Add form.
- **Decision (default — overridable in PLAN if needed):** Option (a). Plain `<Input type="number">`. Minimal new surface area. SelectConfidenceScore.FormItem stays in scope only for the detail-sheet edit path. The Add form deviation is "one numeric Input in the form, mirroring the structure of the `name` text Input."
- **Open call:** If the developer wants visual consistency with the detail-sheet picker, switch to option (b) before Phase 5.

### 5. Kanban-card "read-only" actually allows click-to-edit
- **What's different:** SPEC says the kanban card shows the value "read-only". In practice, `DealsBoardCard.tsx:156` renders `SelectDealPriority` with `variant="card"` — which IS interactive (popover opens on click; user can change priority from the board). Following the sister 1:1 makes the confidence chip also click-to-edit on the board.
- **Why we deviate:** Consistency with the rest of the card surface (every other field on the card is click-to-edit). Going strictly read-only would mean introducing a new "display-only" component pattern that has no sister.
- **Risk:** Minor — a user can change confidence without opening the detail sheet. SPEC's acceptance criterion #3 (`shows a progress bar reflecting confidenceScore`) is unaffected; #2 (edit from detail) is unaffected. If the developer wants strict read-only on the card, that's a one-line config in `SelectDealConfidenceScore.tsx` (drop popover trigger when `variant === 'card-readonly'`).

### 6. No new activity-log row component
- **What's different:** `priority` has a dedicated `PriorityChangedActivityRow.tsx` in `cards/components/detail/overview/activity/`. We are **not** creating `ConfidenceScoreChangedActivityRow.tsx`.
- **Why we deviate:** `models.Deals.updateDeal` calls `generateDealUpdateActivityLogs` which auto-diffs prev vs updated deal and emits an entry for any changed field (read in `db/models/Deals.ts:95-101`). A custom row component is only needed for *custom rendering* of the diff in the UI. The generic activity-log renderer handles unknown fields; we accept the generic rendering for v1.
- **Risk:** Score changes appear in the activity feed as a generic "field changed" row rather than a styled badge. Aesthetic only, not functional. If the developer wants a styled row later, it's an isolated follow-up (one new file, no surface ripple).

## Cross-plugin impact

- [x] No (sales only)

The `confidenceScore` field is sales-internal. No federation reference, no tRPC procedure, no Redis pubsub. The activity-log auto-generation already uses the shared `createActivityLog` event dispatcher — that wiring exists and needs no changes.

## Approval

- [x] All listed files read in full (21 files, 21 Read calls)
- [x] Sister features confirmed appropriate (`priority` for the surface set; `score` for the numeric shape)
- [x] Deviations documented (6 items above)
- [x] Cross-plugin impact assessed (none)
