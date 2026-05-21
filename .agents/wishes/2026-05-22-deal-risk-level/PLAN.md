# PLAN: Add riskLevel enum to Deal

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md) | **Ground:** [`./GROUND.md`](./GROUND.md)

## Commits (in order)

### Commit 1 — backend: add `riskLevel` to Deal schema, types, and GraphQL surface
- **Files:**
  - `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts` — add `riskLevel: { type: String, optional: true, label: 'Risk level', esType: 'keyword' }`
  - `backend/plugins/sales_api/src/modules/sales/@types/deal.ts` — add `riskLevel?: 'low' | 'medium' | 'high'` to `IDeal`
  - `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts` — add `riskLevel: String` to `type Deal`, `mutationParams`, and `[String]` to `queryParams`
- **Why first:** schema/type/contract are the foundation. Frontend cannot use a field the API doesn't expose.
- **Verify:** `evals/run.sh sales --backend-only`

### Commit 2 — backend: wire `riskLevel` filter into the deals query resolver
- **Files:**
  - `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts` — destructure `riskLevel`, add `if (riskLevel) { filter.riskLevel = { $in: riskLevel } }` branch mirroring `priority`
- **Why next:** SPEC #4 (kanban filter) needs the server to honor the filter. Decoupled from schema commit so the query change is reviewable in isolation.
- **Verify:** `evals/run.sh sales --backend-only`

### Commit 3 — frontend: expose `riskLevel` in mutation + query fragments and TS types
- **Files:**
  - `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts` — add to `commonFields`, `commonMutationVariables`, `commonMutationParams`
  - `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts` — add `$riskLevel: [String]` to `commonParams`, line in `commonParamDefs`, and `riskLevel` to `commonListFields`
  - `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts` — add `riskLevel?: 'low' \| 'medium' \| 'high'` to `IItem`
- **Why next:** unlocks every subsequent UI commit to read/write the field.
- **Verify:** `evals/run.sh sales --frontend-only`

### Commit 4 — frontend: add risk-level constants and inline display primitives
- **Files (new):**
  - `frontend/plugins/sales_ui/src/modules/deals/constants/riskLevel.ts` — `RISK_LEVEL_OPTIONS`, `TRiskLevel`, default
  - `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/RiskLevelInline.tsx` — `RiskLevelDot`, `RiskLevelTitle`, `RiskLevelBadge` with traffic-light colors
- **Why next:** badge primitive is the building block for kanban-card display (Commit 6) and the picker (Commit 5).
- **Verify:** `evals/run.sh sales --frontend-only`

### Commit 5 — frontend: add risk-level picker + Apollo-wired select
- **Files (new):**
  - `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectRiskLevel.tsx` — `SelectRiskLevel` Root + `FilterBar`/`FilterView`/`FilterItem` namespaced via `Object.assign`
  - `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectDealRiskLevel.tsx` — wraps `SelectRiskLevel` with `useDealsEdit`
- **Files (edit):**
  - `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx` — render `<SelectDealRiskLevel dealId={_id} value={riskLevel || 'low'} variant="card" />` below the Priority row
- **Why next:** delivers SPEC #1 (edit from detail sheet) and #2 (default applies).
- **Verify:** `evals/run.sh sales --frontend-only`

### Commit 6 — frontend: render badge on the kanban card
- **Files:**
  - `frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx` — add `<RiskLevelBadge level={riskLevel || 'low'} />` next to the existing card chips
- **Why next:** delivers SPEC #3 (colored badge on kanban card).
- **Verify:** `evals/run.sh sales --frontend-only`

### Commit 7 — frontend: wire action-bar filter
- **Files:**
  - `frontend/plugins/sales_ui/src/modules/deals/actionBar/types/actionBarTypes.ts` — add `riskLevel?: string[] \| null` to `SalesFilterState`
  - `frontend/plugins/sales_ui/src/modules/deals/actionBar/constants/Filters.ts` — add `{ key: 'riskLevel', value: 'Risk level', icon: IconAlertTriangle }`
  - `frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx` — destructure `riskLevel`, render `SelectRiskLevel.FilterBar/FilterView/FilterItem`
- **Why next:** delivers SPEC #4 (kanban filter). Done after picker exists.
- **Verify:** `evals/run.sh sales --frontend-only`

## Test commit (Phase 6)

### Commit 8 — Add behavioral tests for the 5 SPEC acceptance criteria
- **Files:**
  - `.agents/plugins/sales/tests/deals.spec.ts` — append five tests, one per SPEC criterion, using the eval-files header convention; skip the ones that require seeded boards/pipelines with `test.skip(true, '<reason>')`
- **Verify:** `cd .agents && pnpm test plugins/sales/tests/deals.spec.ts`

## LOC budget

Rough estimate (additions; deletions ~0):
- Backend: ~15 LOC (3 short schema lines + 1 type line + 3 GraphQL lines + 2 resolver lines)
- Frontend: ~140 LOC (split across 3 new files ~80 LOC, 6 edits ~60 LOC)
- Tests: ~50 LOC
- **Total: ~205 LOC** — within budget.

## Risk + rollback

- **Riskiest commit:** Commit 5 (the SelectDealRiskLevel binding). Wrong mutation variable name would cause a silent UI no-op. Mitigation: mirror SelectDealPriority 1:1 except for the field name; verify with the test in Commit 8.
- **If shipped and broken in production:** single revert per commit, in reverse order. No DB migration — `riskLevel` is optional and defaults to `'low'` at the read site, so reverting Commit 1 simply removes the path; existing docs are untouched.

## Approval

- [x] Each commit is atomic
- [x] Each commit is independently buildable
- [x] LOC budget reasonable (~205, under 300)
- [x] Test commit covers every SPEC acceptance criterion
