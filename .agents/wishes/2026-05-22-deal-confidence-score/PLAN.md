# PLAN: Add `confidenceScore` to deals

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md) | **Ground:** [`./GROUND.md`](./GROUND.md)

## Commits (in order)

Each commit is atomic: one logical change, independently buildable. Most are ≤ ~50 LOC; commits 4 and 6 are larger (~80 / ~70) because creating a variant-aware picker file or a complete filter component is itself one logical change. Splitting them would produce micro-commits that don't compile alone (the picker file and its consumer must land together to make functional sense).

### Commit 1 — `feat(sales): add confidenceScore to Deal schema and IDeal interface`
- **Files:**
  - `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts` — add `confidenceScore: { type: Number, min: 0, max: 100, optional: true, index: true, label: 'Confidence score' }` to `dealSchema` immediately after `priority` (~1 line).
  - `backend/plugins/sales_api/src/modules/sales/@types/deal.ts` — add `confidenceScore?: number;` to `IDeal` immediately after `priority?: string;` (~1 line).
- **Why first:** the schema and TS interface anchor every downstream layer. Nothing else can typecheck until these exist. No dependents at this commit; backend still compiles.
- **Verify:** `.agents/evals/run.sh sales --backend-only`
- **LOC:** ~2

### Commit 2 — `feat(sales): expose confidenceScore on GraphQL Deal, mutation, and confidenceScoreMin filter`
- **Files:**
  - `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts` — three additions:
    - `confidenceScore: Int` in `type Deal` (after `priority: String` at line 103)
    - `confidenceScoreMin: Int` in `queryParams` (after `priority: [String]` at line 43)
    - `confidenceScore: Int,` in `mutationParams` (after `priority: String,` at line 214)
  - `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts` — destructure `confidenceScoreMin` from `params` (line 43–89 block) and add the filter clause:
    ```ts
    if (confidenceScoreMin !== undefined && confidenceScoreMin !== null) {
      filter.confidenceScore = { $gte: confidenceScoreMin };
    }
    ```
    after the existing `priority` block (line 359-361).
- **Why next:** depends on the Mongoose schema (commit 1). Wires the field into the public API surface.
- **Verify:** `.agents/evals/run.sh sales --backend-only`
- **LOC:** ~8

### Commit 3 — `feat(sales): wire confidenceScore through UI mutation, list query, and IItem`
- **Files:**
  - `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts` — three additions:
    - `confidenceScore` in `commonFields` (after `priority` at line 75)
    - `$confidenceScore: Int,` in `commonMutationVariables` (after `$priority: String,` at line 164)
    - `confidenceScore: $confidenceScore,` in `commonMutationParams` (after `priority: $priority,` at line 186)
  - `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts` — three additions:
    - `$confidenceScoreMin: Int,` in `commonParams` (after `$priority: [String],` at line 11)
    - `confidenceScoreMin: $confidenceScoreMin,` in `commonParamDefs` (after `priority: $priority,` at line 41)
    - `confidenceScore` in `commonListFields` (after `priority` at line 116)
  - `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts` — add `confidenceScore?: number;` to `IItem` (after `priority?: string;` at line 31)
- **Why next:** depends on the GraphQL schema (commit 2). After this commit the field is available in the Apollo cache and on `IDeal` everywhere on the UI side; no surface renders it yet, so the app is still visually unchanged.
- **Verify:** `.agents/evals/run.sh sales` (full — UI compiles + backend re-tested for shape compatibility)
- **LOC:** ~7

### Commit 4 — `feat(sales): edit confidenceScore from deal detail sheet`
- **Files:**
  - **CREATE** `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectConfidenceScore.tsx` — variant-aware picker mirroring `SelectPriority.tsx` structure (`Object.assign(Root, { FormItem, FilterBar, FilterView })`). Two visible variants for v1: `card` / `detail` (interactive picker with a numeric input + progress-bar display) and a placeholder `form` variant. Internal value is `number` (0–100), no string↔number bridge.
  - **CREATE** `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectDealConfidenceScore.tsx` — thin `useDealsEdit` wrapper, mirrors `SelectDealPriority.tsx` minus the `PRIORITY_MAP` bridge. Fires `editDeals({ variables: { _id, confidenceScore } })` on change.
  - **EDIT** `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx` — destructure `confidenceScore` from `deal`, add a new `<div className="space-y-2 flex-col"><Label>Confidence</Label><SelectDealConfidenceScore dealId={_id} value={confidenceScore ?? 0} variant="card" /></div>` block immediately after the existing Priority block (line 119-128).
- **Why next:** depends on Apollo plumbing (commit 3) — the wrapper calls `useDealsEdit` which uses the mutation we wired. After this commit, acceptance criterion #2 is observable in the UI.
- **Verify:** `.agents/evals/run.sh sales`
- **LOC:** ~80 (picker ~50, wrapper ~25, SalesFormFields edit ~5). One commit, one logical change: "the user can edit confidence in the detail sheet."

### Commit 5 — `feat(sales): render confidenceScore on kanban card`
- **Files:**
  - `frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx` — destructure `confidenceScore` from `deal` (line 91-104) and render `<SelectDealConfidenceScore dealId={_id} value={confidenceScore ?? 0} variant="card" />` in the same flex row as `SelectDealPriority` (line 156).
- **Why next:** depends on `SelectDealConfidenceScore` (commit 4) and on `commonListFields` containing the field (commit 3). After this commit, acceptance criteria #3 and #4 are observable.
- **Verify:** `.agents/evals/run.sh sales`
- **LOC:** ~5

### Commit 6 — `feat(sales): add action-bar 'Confidence ≥ N' minimum-threshold filter`
- **Files:**
  - **CREATE** `frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectConfidenceScore.tsx` — action-bar filter, mirrors `components/common/filters/SelectPriority.tsx` structure (`Object.assign(Provider, { FilterBar, FilterView, FilterItem })`) but uses `useQueryState<number | null>('confidenceScoreMin')` — a **scalar** query state, not array. `FilterView` renders a numeric input; `FilterBar` renders a `Filter.BarButton` showing "≥ N" when the value is set.
  - `frontend/plugins/sales_ui/src/modules/deals/actionBar/constants/Filters.ts` — add `{ key: 'confidenceScoreMin', value: 'Confidence', icon: IconChartBar }` (or `IconTrendingUp` — pick from `@tabler/icons-react`) to the same row as Priority (line 30-35).
  - `frontend/plugins/sales_ui/src/modules/deals/actionBar/types/actionBarTypes.ts` — add `confidenceScoreMin?: number | null;` to `SalesFilterState` (after `priority?: string[] | null;` at line 21).
  - `frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx` — five edits:
    - add `'confidenceScoreMin'` to the `useMultiQueryState` array (line 23-40)
    - destructure `confidenceScoreMin` in `SalesFilterBar`
    - render `{confidenceScoreMin !== undefined && <SelectConfidenceScore.FilterBar />}` (next to the existing `{priority && <SelectPriority.FilterBar />}` at line 174)
    - render `<SelectConfidenceScore.FilterItem value="confidenceScoreMin" label="By Confidence" />` in `SalesFilterView` (line 217 area)
    - render `<SelectConfidenceScore.FilterView />` in `SalesFilterView` (line 242 area)
- **Why next:** depends on the GraphQL filter input (commit 2) and the UI query variables (commit 3). After this commit, acceptance criterion #5 is observable.
- **Verify:** `.agents/evals/run.sh sales`
- **LOC:** ~70 (FilterConfidenceScore.tsx ~50, four edits ~20 total)

### Commit 7 — `feat(sales): add confidenceScore to Add-deal form`
- **Files:**
  - `frontend/plugins/sales_ui/src/modules/deals/constants/formSchema.ts` — add `confidenceScore: z.number().int().min(0).max(100).optional()` to `salesFormSchema` (~1 line).
  - `frontend/plugins/sales_ui/src/modules/deals/cards/components/AddCardForm.tsx` — add `confidenceScore: undefined` to `defaultValues` and a new `<Form.Field name="confidenceScore">` block rendering `<Input type="number" min={0} max={100} placeholder="Confidence (0–100)" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />` — mirroring the structural shape of the `name` field render at line 64-76.
- **Why next:** depends on the GraphQL mutation accepting `confidenceScore` (commit 2) and the UI mutation variables (commit 3). After this commit, acceptance criterion #1 is observable.
- **Verify:** `.agents/evals/run.sh sales`
- **LOC:** ~15

## Test commit (Phase 6)

### Commit 8 — `test(sales): cover confidenceScore SPEC criteria in deals.spec.ts`
- **Files:**
  - `.agents/plugins/sales/tests/deals.spec.ts` — add a `test.describe('confidenceScore')` block with fixture-seeding `test.beforeAll` (creates board → pipeline → stage → seeded deals via GraphQL mutations) and one `test()` per SPEC acceptance criterion (7 criteria → 7 non-skipped tests):
    1. Add-deal sheet sets `confidenceScore: 70`, assert GraphQL `dealDetail` returns 70.
    2. Detail-sheet edit 30 → 85; reload; detail sheet shows 85.
    3. Kanban card for seeded deal with `confidenceScore: 60` shows the value (assert via `data-testid` on `SelectDealConfidenceScore` or visible text).
    4. Seeded deal with no `confidenceScore` renders as `0` on card and in detail.
    5. Three seeded deals (`20`, `50`, `80`); set filter `confidenceScoreMin=50`; only 50 and 80 visible.
    6. Raw `dealsEdit` GraphQL call with `confidenceScore: 150` errors; stored value unchanged.
    7. UI input clamps at 100 (assert input element's `max` attribute and that typing 150 results in 100 stored OR a validation error visible).
  - `test.afterAll` tears down the seeded board.
- **Verify:** `cd .agents && pnpm test plugins/sales/tests/deals.spec.ts`
- **LOC:** ~170 (most of the body is fixture seeding via GraphQL mutations — the test logic itself is short)

## LOC budget

| Scope | LOC |
|---|---|
| Backend (commits 1–2) | ~10 |
| Frontend plumbing (commit 3) | ~7 |
| Frontend detail-sheet (commit 4) | ~80 |
| Frontend kanban (commit 5) | ~5 |
| Frontend action-bar filter (commit 6) | ~70 |
| Frontend add-form (commit 7) | ~15 |
| **Production code total** | **~187** |
| Tests (commit 8) | ~170 |
| **Grand total** | **~357** |

Production code is well under the 300-LOC threshold. Test code is larger because fixture-seeding via GraphQL mutations is verbose by nature — this is not optional slop, it is the no-skip mandate from `WORKFLOW.md` Phase 6 + lesson `2026-05-22 — Phase 6 VERIFY allowed test.skip cop-outs`.

## Risk + rollback

- **Riskiest commit:** Commit 4 (detail-sheet edit) — creates two new components and wires them in one shot. If the `SelectConfidenceScore` picker has a regression that affects `SelectDealPriority` (unlikely; separate file), the detail sheet could break for existing fields. Mitigation: deliberate separation — `SelectConfidenceScore.tsx` does not touch `SelectPriority.tsx` or `PriorityInline.tsx`.
- **Second risk:** Commit 6 (action-bar filter) wires five separate spots in `SalesFilter.tsx`. Easy to miss one and ship a broken filter. Mitigation: the five spots are listed explicitly in this PLAN; a Phase 5 self-check verifies all five are wired before moving on.
- **If shipped and broken in production:** revert per-commit with `git revert <sha>`. Commits 1–3 are foundation — reverting them cascades. Commits 4–7 are surface-specific — revert one without affecting the others. Commit 8 (tests) can always be reverted independently.

## Approval

- [x] Each commit is atomic (one logical change per commit)
- [x] Each commit is independently buildable (backend compiles after 1–2; UI compiles after 3; every UI surface guarded by `?? 0` for `undefined` cases)
- [x] LOC budget reasonable (~187 production code, well under 300)
- [x] Test commit covers every SPEC acceptance criterion (7 criteria → 7 non-skipped Playwright tests with fixture-seeding)
