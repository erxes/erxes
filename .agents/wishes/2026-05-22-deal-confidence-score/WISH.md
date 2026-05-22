# Wish: Add `confidenceScore` to deals

**ID:** `2026-05-22-deal-confidence-score`
**Created:** 2026-05-22
**Status:** `verified` — code committed (9 commits on `feat/2026-05-22-deal-confidence-score`, branch pushed to origin), but **PR not yet opened**, so `pr-open` is not yet legal per [`../../WORKFLOW.md`](../../WORKFLOW.md#status-state-machine-the-only-legal-status-values). Phase 7 incomplete: `SHIP.md` does not exist. Also: behavior-coverage floor was NOT met (7/7 SPEC criteria deferred to fixture-seeder) — under the updated Phase 6 rule this wish would have halted before shipping. Retroactively logged in REVIEW.md.

## Original wish

> "add confienceScore to deals"
> (Developer intent: confidenceScore — typo confirmed in clarifying step.)

## Clarifying questions (and answers)

1. **Q:** What shape and range should `confidenceScore` have? (integer 0–100 / float 0–1 / enum)
   **A:** Integer 0–100 (percent).

2. **Q:** Where should it be visible / editable? (detail sheet / kanban card / action-bar filter / add-deal form)
   **A:** All four — detail sheet edit, kanban card read-only display, action-bar `Confidence ≥ N` filter, add-deal form.

3. **Q:** What should the default value be for new and existing deals?
   **A:** Default-at-read = 0; no migration. Existing deals stay `undefined` in Mongo; UI coerces `undefined → 0` at read sites.

## Disambiguated intent

We are adding a single integer field `confidenceScore` (range 0–100, percent) to the `Deal` entity in the Sales plugin. It is:

- **Stored** as `Number, optional` on the Mongoose Deal schema. No backfill migration; existing deals remain `undefined`.
- **Editable** from (a) the deal detail sheet via a numeric input/slider that mirrors the existing `priority`/`riskLevel` edit-in-place pattern, and (b) the add-deal form so a user can set an initial score when creating a deal.
- **Displayed read-only** on the kanban card as a progress bar or percent chip (rides `commonListFields`).
- **Filterable** from the deals action-bar via a "Confidence ≥ N" minimum-threshold control. Resolver adds `{ confidenceScore: { $gte: N } }` to the query match.

Read sites coerce `undefined → 0` for display; the SPEC will document this in "Out of scope" because no backfill is performed.

## Routing

**Skill:** `.agents/skills/sales/add-deal-field.md`

**Reasoning:** The wish adds a numeric Deal field that is read and edited by the user — exact match for the skill's "When to use" (cites `riskScore` number as an example). The four surfaces (detail-sheet edit, kanban card read, action-bar filter, add-deal form) are the same surface set that `priority` / `riskLevel` precedent went through under this skill.

## Out-of-scope (developer confirmed)

- **No backfill migration** for existing deals (`undefined` stays `undefined` in Mongo; UI shows 0). Documented per lesson `2026-05-22 — Default-at-read vs default-at-write`.
- **Not a sortable column** on the board / list view (filter only; no `orderBy: { confidenceScore: ... }` in the UI).
- **No automation triggers / segments / dashboard widgets** on `confidenceScore` in this wish.
- **No cross-plugin exposure** (no GraphQL federation extension of `confidenceScore` to other plugins).

## Notes

- **Prior art:** A previous attempt (PR #7760, branch unmerged) implemented essentially this same surface set minus the add-deal form. The 8 commits exist in git history but are not on `main`. We are not reusing them; this is a fresh implementation that should benefit from the lessons logged in `memory/lessons.md` from that round:
  - `2026-05-22 — Default-at-read vs default-at-write — the existence trade-off`
  - `2026-05-22 — TS narrowing without Mongoose enforcement (the type lies)` — N/A for plain `Number`, but flag for SPEC review.
  - `2026-05-22 — Single-value filter shaped as an array (premature flexibility from mirror)` — confidenceScore filter is a single `Int` threshold, not an array; don't inherit the `$in` shape from `priority`.
  - `2026-05-22 — Deal.riskLevel rides every deal-list query via commonListFields (over-fetch awareness)` — confidenceScore goes on the kanban card, so list query is correct, but document the choice in GROUND.
  - `2026-05-22 — Phase 6 VERIFY allowed test.skip cop-outs` — every Playwright test in Phase 6 must seed its own fixtures via API.

- **Add-deal-form caveat:** Per lesson `2026-05-22 — add-deal-field.md skill points to the wrong UI surface for "edit" wishes`, `AddCardForm.tsx` / `salesFormSchema` do **not** currently wire `priority`-shape fields. The Add-form surface for this wish is **novel territory** — no sister field flows the same way through `AddCardForm`. Phase 3 GROUND must either (a) find a different add-form precedent or (b) declare a clean deviation from the detail-sheet sister.

- **Filter naming convention:** Prior PR called the filter "Confidence ≥ N". Keep this naming for consistency with `memory/lessons.md` references and to make the action-bar copy unambiguous.

- **Schema-level validation:** `confidenceScore` is a plain `Number` (0–100). Even without an enum, validate range at the resolver level (`>= 0 && <= 100`) so a forged GraphQL mutation can't write `confidenceScore: 9001`. SPEC will pin this in API contract changes.
