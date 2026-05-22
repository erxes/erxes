# SPEC: Add `confidenceScore` to deals

**Wish:** [`./WISH.md`](./WISH.md)
**Status:** draft

## User-visible behavior

A sales user can record how confident they are in a deal closing on a 0–100 percent scale. When creating a deal, an optional "Confidence" input appears in the add-deal sheet. Opening a deal's detail sheet shows the current confidence and lets the user edit it inline. On the kanban board, every deal card shows a small progress bar/percent chip indicating the deal's confidence. The deals action-bar gains a "Confidence ≥ N" filter that hides deals whose confidence is below the chosen threshold. Deals that have never had a confidence set display as `0%`.

## API contract changes

### GraphQL

- New field on `type Deal`: `confidenceScore: Int`
- New input field on `mutationParams` (used by `dealsAdd` / `dealsEdit`): `confidenceScore: Int`
- New input field on `queryParams` (used by `deals(...)` / `dealsTotalCount(...)`): `confidenceScoreMin: Int` — minimum-threshold filter (resolves to `{ confidenceScore: { $gte: confidenceScoreMin } }`)
- No new queries, mutations, or subscriptions — the field rides existing ones.

### tRPC

- None. (Cross-plugin exposure is out of scope; see "Out of scope" below.)

### REST (Express)

- None.

## Data model changes

- **Entity:** `Deal`
- **New fields:**
  - `confidenceScore: { type: Number, optional: true, index: true }` — integer 0–100; no schema-level `min`/`max` (validation enforced at the resolver layer; see "Validation contract" below). Indexed because the action-bar filter does `$gte` lookups.
- **Schema definition file:** `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts`
- **TS interface:** `backend/plugins/sales_api/src/modules/sales/@types/deal.ts` — `confidenceScore?: number`
- **No migration.** Existing deals stay `undefined` in Mongo; UI coerces `undefined → 0` at read sites.

### Validation contract

- `dealsAdd` / `dealsEdit` reject `confidenceScore` values that are not integers in `[0, 100]`. Validation lives in `backend/plugins/sales_api/src/modules/sales/db/models/Deals.ts` (the static method that already centralises Deal writes — `createDeal` / `updateDeal`). Reason: a forged GraphQL mutation, a tRPC writer, or a direct Mongo write must all be guarded. (See lesson `2026-05-22 — TS narrowing without Mongoose enforcement (the type lies)`.)
- `confidenceScoreMin` is clamped at the resolver to `[0, 100]` before being applied; out-of-range values are silently coerced rather than rejected (filter UX, not write path).

## UI changes

### Detail-sheet edit (sister: `priority`)

- **New components:**
  - `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectConfidenceScore.tsx` — numeric input with `card` / `detail` / `form` variants (mirrors `SelectPriority.tsx` namespace pattern via `Object.assign`).
- **Wired into:**
  - `frontend/plugins/sales_ui/src/modules/deals/components/deal-detail/DealDetailSheet.tsx` (or whichever file mounts `SelectPriority` in detail — to be confirmed in GROUND)
  - `frontend/plugins/sales_ui/src/modules/deals/cards/components/DealCard.tsx` (or kanban card equivalent — confirmed in GROUND) for read-only display

### Kanban-card display

- The same `SelectConfidenceScore.Card` (read-only variant) renders a progress bar or percent chip on the deal card.
- Field added to `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts` `commonListFields`. This is a **conscious** list-query over-fetch — the field is needed on every kanban card. Documented in GROUND.

### Action-bar filter ("Confidence ≥ N")

- New component: `frontend/plugins/sales_ui/src/modules/deals/components/common/filters/FilterConfidenceScore.tsx` — numeric input rendered via the erxes-ui `Filter.View` / `Filter.BarItem` / `Filter.Item` primitives (mirrors `components/common/filters/SelectPriority.tsx`).
- Adds `confidenceScoreMin` to the filter query string parser + GraphQL variables.

### Add-deal form

- `frontend/plugins/sales_ui/src/modules/deals/constants/formSchema.ts` — extends `salesFormSchema` with `confidenceScore: z.number().int().min(0).max(100).optional()`
- `frontend/plugins/sales_ui/src/modules/deals/cards/components/AddCardForm.tsx` — new `<Form.Field>` rendering a `SelectConfidenceScore.Form` (or a plain numeric `Input` if the form variant of `SelectConfidenceScore` is overkill — to be decided in GROUND based on sister patterns).
- **Caveat (from WISH notes):** No existing Deal field is wired through `AddCardForm` in the `priority`-shape pattern. Phase 3 GROUND must find the closest analog (e.g., `amount`, `startDate`, or another numeric/scalar) before mirroring.

### Mutation + types plumbing

- `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts` — add `confidenceScore` to `commonFields`, `commonMutationVariables` (`$confidenceScore: Int`), and `commonMutationParams` (`confidenceScore: $confidenceScore`).
- `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts` — add `confidenceScore?: number` to the `IDeal` shape used by Apollo cache.

### Module Federation

- No changes to `module-federation.config.ts`.

## Acceptance criteria

Numbered list. Phase 6 (VERIFY) turns each into at least one Playwright assertion. Every test must seed its own fixtures via API (`test.beforeAll`).

1. **Create with confidence.** A user opens the add-deal sheet, sets `Confidence = 70`, submits, and a `deals` GraphQL query returns the new deal with `confidenceScore: 70`.
2. **Edit on detail sheet persists.** A seeded deal with `confidenceScore: 30` is opened in the detail sheet, the user changes it to `85`, saves, reloads the page, and the detail sheet displays `85`.
3. **Kanban card displays the value.** A seeded deal with `confidenceScore: 60` is rendered on the kanban board; the deal card shows a progress bar / chip reflecting `60` (assert via `data-testid` or visible text).
4. **Default-at-read = 0.** A seeded deal with no `confidenceScore` set (Mongo `undefined`) renders as `0%` on the kanban card and shows `0` in the detail sheet editor.
5. **Filter "Confidence ≥ N" hides deals below N.** With 3 seeded deals (`20`, `50`, `80`) and the filter set to `50`, only the deals with `50` and `80` are visible on the board.
6. **Range validation rejects out-of-range writes.** A GraphQL `dealsEdit` mutation called with `confidenceScore: 150` errors out; the deal's stored value is unchanged. (Tested via raw GraphQL call inside the spec — not via UI typing, because the UI input should clamp before submission.)
7. **UI input clamps at 100.** Typing `150` into the detail-sheet confidence input results in a stored value of `100` (or the input refuses values > 100 — exact behaviour finalised in GROUND).

## Out of scope

- **No backfill migration.** Existing deals retain `undefined`; the SPEC explicitly accepts the trade-off documented in lesson `2026-05-22 — Default-at-read vs default-at-write`. Server-side filters that match exact `0` will **not** include `undefined` deals — but the action-bar filter only uses `$gte`, which sidesteps this.
- **Not sortable on the board / list view.** No `orderBy: { confidenceScore: 1 }` UI control. (The Mongoose index supports future sorting if a wish adds it.)
- **No segment-builder integration.** `confidenceScore` is not exposed as a filter in the segment builder. A follow-up wish would route through `add-sales-segment-field.md`.
- **No automation triggers / actions.** No "trigger when confidenceScore changes" or "action: set confidenceScore on stage change."
- **No cross-plugin tRPC exposure.** `confidenceScore` is sales-internal; no other plugin reads or writes it.
- **No dashboard / chart widget.** No insight visualisation in this wish.
- **No permission scoping beyond existing deal-edit permission.** Anyone who can edit a deal can change its `confidenceScore`. No manager-only constraint.

## Open questions

None. All ambiguities resolved in WISH Phase 0; the GROUND phase will pin two remaining implementation choices (exact AddCardForm sister, and whether to use a `SelectConfidenceScore` form variant or a plain `Input`) before code is written.

## Approval

- [ ] Developer reviewed acceptance criteria
- [ ] Out-of-scope confirmed
- [ ] No open questions
