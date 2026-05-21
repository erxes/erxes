# SPEC: Add riskLevel enum to Deal

**Wish:** [`./WISH.md`](./WISH.md)
**Status:** draft (awaiting approval)

## User-visible behavior

A sales user managing deals on a kanban board sees a colored risk-level badge on every deal card (green / amber / red for low / medium / high). They can open a deal's detail sheet and change its risk level via a dropdown. The kanban action bar lets them filter the board to show only deals at a chosen risk level. In the segment builder, `riskLevel` appears as a filterable Deal dimension.

## API contract changes

### GraphQL

- New field on existing type:
  - `Deal.riskLevel: String` (resolves to `'low' | 'medium' | 'high' | null`)
- New input field on existing inputs:
  - `DealAdd.riskLevel: String`
  - `DealEdit.riskLevel: String`
- New filter argument on existing query:
  - `deals(..., riskLevel: String)` — server-side filter
- No new query, mutation, or subscription added.

### tRPC
None.

### REST (Express)
None.

## Data model changes

- **Entity:** `Deal`
- **New fields:**
  - `riskLevel: string` — optional in the schema, default `'low'`, indexed (cheap; benefits filter & segment queries).
- **Schema definition file:** `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts` (mirror the existing `priority: { type: String, optional: true, label: 'Priority' }` at line 96; add immediately below).
- **TypeScript interface:** `backend/plugins/sales_api/src/modules/sales/@types/deal.ts` — add `riskLevel?: 'low' | 'medium' | 'high'` to `IDeal`.

## UI changes

### New / modified components
- `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/RiskLevelSelect.tsx` — **new** dropdown component for the detail sheet (mirror an existing deal-select component).
- `frontend/plugins/sales_ui/src/modules/deals/cards/components/RiskLevelBadge.tsx` — **new** colored-dot/badge component for the kanban card.
- `frontend/plugins/sales_ui/src/modules/deals/components/AddDealSheet.tsx` and the detail-sheet equivalent — **modified** to render `RiskLevelSelect`.
- `frontend/plugins/sales_ui/src/modules/deals/cards/components/<deal card>.tsx` — **modified** to render `RiskLevelBadge`.
- `frontend/plugins/sales_ui/src/modules/deals/actionBar/<filter dropdown>.tsx` — **modified** to add a riskLevel filter.

### New form schemas (Zod)
- Extend `frontend/plugins/sales_ui/src/modules/deals/schemas/<dealFormSchema>.ts` (file name confirmed in Phase 3) with `riskLevel: z.enum(['low', 'medium', 'high']).default('low').optional()`.

### GraphQL fragments
- `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/deals.ts` — extend the deal fields fragment to request `riskLevel`.
- `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/deals.ts` — extend `dealEdit` / `dealAdd` input variables.

### Module Federation
No `module-federation.config.ts` change. The new components are imported within the existing `./sales` expose.

## Segment changes

- `backend/plugins/sales_api/src/modules/sales/meta/segments/segmentConfigs.ts` — add `riskLevel` to the `sales:deal` content-type field list with type `string` and a fixed-options enum.
- Elasticsearch reindex is not required for new optional string fields (filter on missing/null returns existing deals correctly).

## Acceptance criteria

Each criterion maps to at least one test assertion in Phase 6.

1. **Setting riskLevel persists.** Opening a deal's detail sheet, choosing "high", closing and reopening shows "high".
2. **Default applies to existing deals.** A deal created before this change has no `riskLevel`; the API treats it as `'low'` for display and filter purposes.
3. **Badge color matches level.** On the kanban card, low → green, medium → amber, high → red badge.
4. **Kanban filter works.** Selecting "high" in the action-bar riskLevel filter shows only high-risk deals in the columns.
5. **Segment filter works.** Building a segment with "riskLevel equals high" on the segment builder returns the same deal set as criterion 4.

## Out of scope (developer confirmed)

- New permission key (anyone who can edit Deal can edit riskLevel — same RBAC as today).
- Sort order on the kanban board.
- Automation trigger on riskLevel change.
- POS / ecommerce surfaces.
- Backfill migration of existing Deals to set `riskLevel: 'low'` explicitly (the API treats null/undefined as 'low' for read & display).

## Open questions

(None — all clarified in WISH.md Phase 0.)

## Approval

- [ ] Developer reviewed acceptance criteria
- [ ] Out-of-scope confirmed
- [ ] No open questions
