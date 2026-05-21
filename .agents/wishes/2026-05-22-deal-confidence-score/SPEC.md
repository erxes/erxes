# SPEC: Deal confidenceScore (0–100 integer, default 50)

**Wish:** [`./WISH.md`](./WISH.md)
**Status:** draft

## User-visible behavior

Sales users can set a confidence score (0–100) on every Deal, representing how likely the deal is to close. The score appears as a horizontal progress bar on the kanban card (fill width = score%), is editable from the deal detail sheet via a numeric input, and can be filtered from the action bar by a single minimum-threshold value (e.g., "show deals with confidence ≥ 70"). New deals default to 50.

## API contract changes

### GraphQL

- New field on type: `Deal.confidenceScore: Int` (nullable in GraphQL, defaulted at the Mongoose layer to 50)
- New input field on `mutationParams`: `confidenceScore: Int`
- New query param on `queryParams`: `confidenceScoreMin: Int` (single minimum threshold — deviates from `priority`/`riskLevel` `$in:` pattern; see GROUND.md)

### tRPC

None.

### REST (Express)

None.

## Data model changes

- **Entity:** `Deal`
- **New fields:**
  - `confidenceScore: Number` — optional in `IDeal` TS shape (legacy docs lack it); Mongoose schema sets `default: 50, min: 0, max: 100`. Not indexed (filter usage is light initially).
- **Schema definition file:** `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts`

## UI changes

- **New / modified components:**
  - `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx` — add a numeric input row for `confidenceScore` (the detail/edit surface, per lesson 2026-05-22)
  - `frontend/plugins/sales_ui/src/modules/deals/cards/components/CardItem.tsx` (or whichever component currently renders the kanban card body — TBD in GROUND) — render the progress bar
  - `frontend/plugins/sales_ui/src/modules/deals/components/common/filters/` — new `FilterConfidenceScore.tsx` mirroring the action-bar filter pattern, but as a min-threshold input rather than a multi-select
  - `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts` — add `confidenceScore` to `commonListFields` (card displays it; lesson 2026-05-22 over-fetch is acceptable for a small int)
  - `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts` — add to `commonFields`, `commonMutationVariables`, `commonMutationParams`
  - `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts` — add `confidenceScore?: number` to the TS shape
- **New forms / schemas (Zod):** None (detail sheet has no separate Zod schema for this — uses `useUpdateDeal` directly). To be verified in GROUND.
- **New routes:** None.
- **Module Federation exposes:** No change.

## Acceptance criteria

Numbered. Each becomes ≥1 Phase 6 test assertion.

1. A user can open a deal's detail sheet and see a numeric `confidenceScore` input pre-populated with the current value (default 50 for legacy deals via Mongoose default).
2. The user can edit the value to any integer in `[0, 100]` and the change persists after closing and reopening the detail sheet.
3. Entering a value outside `[0, 100]` is rejected (Mongoose `min`/`max` validation throws; the UI surfaces the error).
4. The kanban card displays a progress bar whose fill width equals `confidenceScore` (e.g., score 70 → bar 70% filled).
5. The action bar exposes a `Confidence ≥ N` filter input. Setting `N = 70` returns only deals with `confidenceScore >= 70`.
6. Deals created before this feature (with no `confidenceScore` in Mongo) render as `50` because the Mongoose schema default applies on document load, and they pass the `confidenceScore >= 0..50` filters but not `>= 51..100`.

## Out of scope

- No backfill migration (Mongoose schema default handles legacy reads).
- No sorting by confidenceScore.
- No automation trigger when confidenceScore crosses a threshold.
- No segment-builder field auto-discovery (see `add-sales-segment-field.md` if needed later).
- No permission scoping — same write permission as any other deal field edit.
- No bulk-edit UI.
- No keyboard step controls (use the native `<input type="number">` step behavior).

## Open questions

None.

## Approval

- [x] Developer reviewed acceptance criteria (brief explicitly enumerated them)
- [x] Out-of-scope confirmed (brief enumerated halt conditions)
- [x] No open questions
