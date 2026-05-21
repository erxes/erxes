# Wish: Add riskLevel enum to Deal

**ID:** `2026-05-22-deal-risk-level`
**Created:** 2026-05-22
**Status:** captured → routed

## Original wish

> Add a riskLevel enum (low/medium/high, default low) to Deal — editable from the deal detail sheet, visible as a colored badge on the kanban card.

## Clarifying questions (and answers)

1. **Q:** Color mapping for the badge?
   **A:** Traffic-light — low → green, medium → amber, high → red.

2. **Q:** Should riskLevel be filterable as a board column filter / segment field?
   **A:** Both — visible filter on kanban action bar AND segmentable in the segment builder. Touches `meta/segments/segmentConfigs.ts`.

3. **Q:** Permissions: who can set riskLevel?
   **A:** Same as Deal edit — anyone who can edit the Deal can set its riskLevel. No new permission key; mirrors how `name`, `closeDate`, `priority` work.

## Disambiguated intent

We are adding a new enum field `riskLevel` on Deal with three values (`low` | `medium` | `high`) and default `low`. The field is:
- Editable in the Deal detail sheet (same permission as editing the deal itself)
- Displayed as a colored badge on each kanban card — green (low), amber (medium), red (high)
- Filterable via the kanban action bar
- Available as a segment-builder field

No new permission key. No automation trigger. No sort-order change on the board.

## Routing

**Primary skill:** [`../../skills/sales/add-deal-field.md`](../../skills/sales/add-deal-field.md) — for the field itself (schema → model → GraphQL → form → card)
**Secondary skill:** [`../../skills/sales/add-sales-segment-field.md`](../../skills/sales/add-sales-segment-field.md) — for segment-builder + filter integration

**Reasoning:** This is a new typed Deal field with UI + filter + segment surfaces. The two skills together cover every layer. No NOVEL escape hatch needed.

## Out-of-scope (developer confirmed)

- New permission key (`dealsEditRiskLevel` style RBAC)
- Sort order on the kanban board affected by riskLevel
- Automation trigger when riskLevel changes
- POS or ecommerce surface changes
- Backward compatibility for existing Deals with no riskLevel (default applies)

## Notes

- Sister field pattern: closest existing analogues are `priority` (existing free-text Deal field at `db/definitions/deals.ts:96`) and the `status` enum on POS orders. The skills will dictate the final mirror selection in Phase 3.
- This wish is the thin-slice validation of the `/sales` workflow. Outcomes get logged in `evals/golden-tasks.md`.
