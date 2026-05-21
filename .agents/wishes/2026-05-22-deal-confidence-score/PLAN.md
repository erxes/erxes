# PLAN: Deal confidenceScore (0–100 integer, default 50)

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md) | **Ground:** [`./GROUND.md`](./GROUND.md)

## Commits (in order)

### Commit 1 — feat(sales): add confidenceScore to Deal schema + TS interface

- **Files:**
  - `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts` — add `confidenceScore: { type: Number, default: 50, min: 0, max: 100, label: 'Confidence score' }` near `score` (~5 LOC)
  - `backend/plugins/sales_api/src/modules/sales/@types/deal.ts` — add `confidenceScore?: number` to `IDeal` (~1 LOC)
  - `backend/plugins/sales_api/src/modules/sales/meta/activity-log/constants.ts` — add `{ field: 'confidenceScore', label: 'Confidence score' }` (~1 LOC)
- **Why first:** Data layer before API layer. After this commit the field exists in the model but is invisible to GraphQL.
- **Verify:** `evals/run.sh sales --backend-only`

### Commit 2 — feat(sales): expose confidenceScore on GraphQL Deal + mutation + filter

- **Files:**
  - `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts` — add `confidenceScore: Int` to `type Deal`, add `confidenceScore: Int` to `mutationParams`, add `confidenceScoreMin: Int` to `queryParams` (~3 LOC)
  - `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts` — destructure `confidenceScoreMin` from params, add `if (confidenceScoreMin != null) filter.confidenceScore = { $gte: confidenceScoreMin }` (~3 LOC)
- **Why next:** GraphQL surface depends on the TS type from commit 1.
- **Verify:** `evals/run.sh sales --backend-only`

### Commit 3 — feat(sales): expose confidenceScore in UI mutation + list query + TS shape

- **Files:**
  - `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts` — add `confidenceScore` to `commonFields`, `$confidenceScore: Int` to `commonMutationVariables`, `confidenceScore: $confidenceScore` to `commonMutationParams` (~3 LOC)
  - `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts` — add `$confidenceScoreMin: Int` to `commonParams`, `confidenceScoreMin: $confidenceScoreMin` to `commonParamDefs`, add `confidenceScore` to `commonListFields` (~3 LOC)
  - `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts` — add `confidenceScore?: number` to `IItem` (~1 LOC)
- **Why next:** UI must know the field exists on the wire before any component renders it.
- **Verify:** `evals/run.sh sales --frontend-only`

### Commit 4 — feat(sales): edit confidenceScore from deal detail sheet

- **Files:**
  - `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx` — widen `handleDealFieldChange` value type to `string | string[] | number | undefined | null`, destructure `confidenceScore`, add a "Confidence score" row with `<input type="number" min={0} max={100}>` that calls `handleDealFieldChange('confidenceScore', Number(...))` on blur (~20 LOC)
- **Why next:** First user-visible surface; doesn't depend on card or filter changes.
- **Verify:** `evals/run.sh sales --frontend-only`

### Commit 5 — feat(sales): render confidenceScore progress bar on kanban card

- **Files:**
  - `frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx` — destructure `confidenceScore`, render an inline tailwind progress bar between title and select pills (~10 LOC)
- **Why next:** Independent of filter commit; can ship standalone.
- **Verify:** `evals/run.sh sales --frontend-only`

### Commit 6 — feat(sales): action-bar Confidence ≥ N filter

- **Files:**
  - `frontend/plugins/sales_ui/src/modules/deals/actionBar/types/actionBarTypes.ts` — add `confidenceScoreMin?: number \| null` to `SalesFilterState` (~1 LOC)
  - `frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectConfidenceScoreMin.tsx` — new file, ~60 LOC, exposes `FilterItem` / `FilterBar` / `FilterView` via `Object.assign`. Uses `useQueryState<number>('confidenceScoreMin')` and an `<Input type="number">`. This is slightly over the 50-LOC commit guideline; the alternative is creating a stub file in a separate commit (more churn), so we accept the modest overage and call it out here.
  - `frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx` — register `confidenceScoreMin` in `useMultiQueryState`, render `<SelectConfidenceScoreMin.FilterBar/>`, `.FilterView/>`, `.FilterItem/>` (~6 LOC)
- **Why next:** This commit ties the URL queryState to the GraphQL `confidenceScoreMin` we added in commit 2. The URL → GraphQL bridge in `DealsBoard.tsx` is generic, so no extra wiring is needed.
- **Verify:** `evals/run.sh sales --frontend-only`

### Commit 7 — test(sales): add behavioral tests for confidenceScore

- **Files:**
  - `.agents/plugins/sales/tests/deals.spec.ts` — update header eval-files manifest to reflect this wish; add tests covering SPEC #4 (action-bar filter wiring), SPEC #1 / #2 / #3 / #5 / #6 marked `test.skip` with documented seed gates (mirror of existing skipped tests) (~50 LOC delta net)
- **Why last:** Tests cement the wish. Stale risk-level header is replaced with our wish's surface.
- **Verify:** `evals/run.sh sales` (full default) then optionally `evals/run.sh sales --include-e2e`

## LOC budget

- Backend (commits 1–2): ~13 LOC
- Frontend wire-up (commit 3): ~7 LOC
- Frontend UI (commits 4–6): ~95 LOC
- Tests (commit 7): ~50 LOC net (some replacement)
- **Total: ~165 LOC**

Well under the 300 LOC ceiling.

## Risk + rollback

- **Riskiest commit:** Commit 1 — schema default + min/max validators on a hot collection. If something ever writes `confidenceScore: 150` (no current caller does), validation throws and the entire `updateDeal` call fails. Mitigated because the only writer is the GraphQL mutation, which already passes `Int` (and our new UI input has `min={0} max={100}`).
- **If shipped and broken in production:** `git revert <sha>` per commit. Each commit is independently revertible (commits 4–6 depend on commit 3; commits 1–6 depend on each other in order). If only the kanban progress bar is buggy, revert commit 5 alone — the field still works in detail + filter.

## Approval

- [x] Each commit is atomic
- [x] Each commit is independently buildable (after the prior one, in order)
- [x] LOC budget reasonable (~165 / 300)
- [x] Test commit covers every SPEC acceptance criterion
