## Summary

- Add `confidenceScore` (integer 0–100, percent) to `Deal`, editable from the deal-detail sheet, the kanban card, and the add-deal form.
- Add action-bar filter `Confidence ≥ N` resolved server-side as `{ $gte: N }` on the indexed Mongoose path.
- Range enforced at the data layer (Mongoose `min: 0, max: 100`) so non-UI write paths (forged GraphQL, direct Mongo, tRPC) cannot store out-of-range values.

## AI-assisted disclosure

- [x] AI-assisted (built via `.agents/` workflow with human gating)
- [x] Workflow used: `/sales "add confidenceScore to deals"` → `.agents/wishes/2026-05-22-deal-confidence-score/`
- [x] Skill followed: `.agents/skills/sales/add-deal-field.md`
- [x] Sister feature mirrored: `priority` (canonical four-surface mirror) + `score` (numeric scalar shape reference). See [`GROUND.md`](.agents/wishes/2026-05-22-deal-confidence-score/GROUND.md).
- [x] `.agents/evals/run.sh sales` exit 0 — verified after every commit
- [x] `.agents/SLOP-CHECKLIST.md` re-read — full audit in [`REVIEW.md`](.agents/wishes/2026-05-22-deal-confidence-score/REVIEW.md), no items present in diff
- [x] New lessons captured in `.agents/memory/lessons.md` — 3 entries (branch-name collision with abandoned PRs, zombie SPEC tests, fixture-seeder is its own wish)

## Acceptance criteria from SPEC

From [`.agents/wishes/2026-05-22-deal-confidence-score/SPEC.md`](.agents/wishes/2026-05-22-deal-confidence-score/SPEC.md):

1. Add-deal sheet: set `Confidence=70`, submit → saved deal exposes `confidenceScore: 70`.
2. Detail-sheet edit `30 → 85`, save, reload → still 85.
3. Kanban card shows a progress bar/percent chip reflecting the deal's `confidenceScore`.
4. Default-at-read = 0 for deals with `undefined` `confidenceScore` (no migration).
5. Filter `Confidence ≥ N` hides deals with `confidenceScore < N`.
6. Raw GraphQL `dealsEdit(confidenceScore: 150)` errors; stored value unchanged.
7. UI input enforces `min=0 / max=100` and clamps.

## Test plan

- [x] `.agents/evals/run.sh sales` passes (run after every commit; final state green)
- [x] Playwright spec at `.agents/plugins/sales/tests/deals.spec.ts` covers every SPEC criterion (15 tests; 2 new live-gated for SPEC #5; 7 SPEC tests skipped with named blocking wish)
- [x] No `test.skip(true, 'pending seeded …')` without a named follow-up wish — every seeded-data skip references `2026-05-22-test-fixture-seeder` ([`WISH.md`](.agents/wishes/2026-05-22-test-fixture-seeder/WISH.md) committed alongside this PR)

## See it work in 60 seconds

**Stack running** (`pnpm dev:apis && pnpm dev:uis`):
```bash
AGENT_TEST_LIVE=1 pnpm exec playwright test .agents/plugins/sales/tests/deals.spec.ts
```
Expected: 8 non-skipped tests pass (6 pre-existing + 2 new live SPEC #5 tests). 7 SPEC tests skip with `BLOCKED on wish 2026-05-22-test-fixture-seeder` (see next section).

**Reading only** (no stack):
- [`.agents/plugins/sales/tests/deals.spec.ts`](.agents/plugins/sales/tests/deals.spec.ts) — every contracted behavior is in a `test()` block with the user-visible flow scripted. Each SPEC #N test has a comment pointing at the production-code site it verifies.

**Manual click path** (visual confirmation):

1. Stack must be running (`pnpm dev:apis && pnpm dev:uis`).
2. Open `http://localhost:3000/sales/deals`.
3. Click the `+ Add filter` button in the action bar (top of the deals page, next to "Display").
4. Expected: a popover lists filter options including `By Confidence` (icon: a small trending-up arrow). Click `By Confidence`.
5. Expected: a numeric input appears with placeholder `Minimum confidence`. Type `50` and press Enter.
6. Expected: the URL changes to `http://localhost:3000/sales/deals?confidenceScoreMin=50`. The action bar shows a filter chip reading `By Confidence ≥ 50%`.
7. (Requires a seeded deal) Open any deal — its detail sheet now has a `Confidence` row below `Priority`, showing a progress bar + percent.
8. (Requires a seeded deal) Click `+` to add a new deal — the Add-deal sheet has a `Confidence` field with placeholder `0–100`.

## Files touched outside SPEC scope

- `.agents/plugins/sales/tests/deals.spec.ts` — removed zombie SPEC tests from the abandoned PR #7758 (`riskLevel` wish) whose eval-files referenced `RiskLevelInline.tsx` / `SelectRiskLevel.tsx` / `riskLevel.ts` (none of which exist on `main`). All removed tests were `test.skip(true, '...')`; net behavior change is **zero**. Rationale and the durable rule are captured in the new lesson `2026-05-22 — Abandoned wishes leave zombie SPEC tests referencing non-existent files`.
- `.agents/wishes/2026-05-22-test-fixture-seeder/WISH.md` — new wish capturing the test-fixture infrastructure gap that the named-skip references depend on. "Captured" status only; this wish does not commit to a delivery date for the fixture seeder.
- `.agents/memory/lessons.md` — 3 new lesson entries (see "AI-assisted disclosure" above).

## Rollback

Single-commit revert is not possible because the wish is split across 9 atomic commits (8 functional + 1 docs). To roll back the whole wish:

```bash
git revert --no-commit 23215f26f4 ef236b1fe0 d43338f126 a9be4ffab7 92943ecb1a 28aad09874 27a879544b 83b691fc38 eba6b40061
git commit -m "revert: confidenceScore wish 2026-05-22-deal-confidence-score"
```

No DB migration to roll back: existing deals have `undefined` `confidenceScore` and the field is `optional: true` on the schema, so removing the schema entry leaves no orphan data.
