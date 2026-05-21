# Wish: Deal confidenceScore (0–100 integer, default 50)

**ID:** `2026-05-22-deal-confidence-score`
**Created:** 2026-05-22
**Status:** captured

## Original wish

> Add a `confidenceScore: integer (0–100, default 50)` to Deal — editable in the deal detail sheet, shown as a progress bar on the kanban card, filterable by minimum threshold in the action bar.

## Clarifying questions (and answers)

None — wish was unambiguous. The brief specified type (integer), bounds (0–100), default (50), edit surface (detail sheet), display surface (kanban card as progress bar), and filter shape (minimum threshold in action bar).

## Disambiguated intent

We are adding a numeric scalar field `confidenceScore` to the Deal entity, constrained to integers 0–100, persisted in MongoDB with a schema-level default of 50 (default-at-write — required because the filter uses `$gte`, and unset deals must match `confidenceScore >= 0`). The field is editable from the deal detail sheet (`SalesFormFields.tsx`, per lesson 2026-05-22 about the detail-sheet location), displayed on the kanban card as a horizontal progress bar (0% → 100% fill of the score value), and filterable from the action bar by a single minimum threshold value such that the query returns deals with `confidenceScore >= threshold`.

## Routing

**Skill:** `.agents/skills/sales/add-deal-field.md`

**Reasoning:** This is a new scalar field on Deal with edit + display + filter surfaces — the canonical shape of `add-deal-field.md`.

## Out-of-scope (developer confirmed per brief)

- No backfill migration is needed because we are using schema-level default-at-write — new and existing reads will see `50` for any deal that hasn't set the field explicitly (Mongoose applies the default on document load).
- No sorting by confidenceScore (filtering only).
- No permission restriction — any user who can edit a deal can edit confidenceScore.
- No automation triggers / actions for confidenceScore changes.
- No segment-field auto-discovery work (separate skill if needed later).
- No bulk-edit UI for confidenceScore.

## Notes

- Lessons applied at WISH time:
  - Default-at-write (not default-at-read) because filtering uses `$gte` — undefined deals would never match.
  - Filter shape is `$gte` (range), not `$in` (set). This deviates from `priority` / `riskLevel` precedent and will be documented in GROUND.md.
  - Edit surface is detail sheet (`SalesFormFields.tsx`), not `AddCardForm.tsx`.
  - Field rides `commonListFields` because the kanban card displays it.
  - TypeScript type is `number` (no literal-union narrowing concern); Mongoose `min: 0, max: 100` will enforce range.
