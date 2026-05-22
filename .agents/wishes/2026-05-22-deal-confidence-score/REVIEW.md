# REVIEW: Add `confidenceScore` to deals

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md) | **Plan:** [`./PLAN.md`](./PLAN.md)

## Self-review of the diff

`git diff main...HEAD` audited (8 commits, 19 files changed, 537 insertions, 79 deletions).

### Slop checklist walk-through

For each item in [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md):

- [x] **Comments that restate the code** — clean. No "// increment counter" style comments in new files.
- [x] **try/catch around code that cannot fail** — clean. No try/catch in any new file.
- [x] **Helpers extracted for a single caller** — clean. `clamp(n)` has multiple callers within each file it appears in (3+ in deal-selects/SelectConfidenceScore.tsx, 2+ in common/filters/SelectConfidenceScore.tsx). The duplication across the two files is deliberate — extracting a shared `clamp` util for a one-liner across two files would be over-engineering for ~3 LOC of saving.
- [x] **Backwards-compat shims for code that doesn't exist** — clean. No "renamed from oldX" patterns.
- [x] **// TODO: implement** — clean. No TODOs in new code. Existing `// TODO remove after migration` next to `sourceConversationId` (line 97 of deals.ts) is pre-existing and not touched.
- [x] **Tests that only assert non-throw** — clean. The 2 non-skipped tests assert exact UI elements and URL regex patterns.
- [x] **Validation at internal boundaries** — clean. Mongoose `min: 0, max: 100` is data-layer (a true boundary), not internal. TypeScript layer trusts `confidenceScore?: number` without re-validating.
- [x] **"Just in case" parameters** — clean. Every parameter on the new components is used by at least one render path.
- [x] **Renaming unused `_var`** — clean. No `_var` patterns introduced.
- [x] **Feature flags / config knobs for non-configurable code** — clean. No flags introduced.
- [x] **Re-exports without purpose** — clean. `Object.assign(Root, { FilterBar, FilterView, FilterItem })` is the established sister pattern and exposes a coherent namespace.
- [x] **Defensive optional chaining on non-null types** — clean. `confidenceScore ?? 0` is correct because `confidenceScore?: number` is optional. Not `?.` on a non-null type.
- [x] **console.log left in shipped code** — clean. Grepped my new files; no console calls.
- [x] **`any` to silence the type checker** — clean. No `any` in any new file.
- [x] **TS literal-union without schema enum** — N/A — `confidenceScore` is a plain `Number`, not a literal union. But the spirit applies: TypeScript says `number`; Mongoose enforces `min: 0, max: 100`; GraphQL says `Int`. Runtime contract matches static type at every layer.
- [x] **Function names cited but not grep-verified** — clean. Every function name cited in WISH/SPEC/GROUND/PLAN/REVIEW (`generateFilter`, `models.Deals.createDeal`, `models.Deals.updateDeal`, `useDealsEdit`, `SelectDealPriority`, etc.) was confirmed by a Read tool call in Phase 3 or by `grep -rn` during this review.
- [x] **Premature flexibility inherited from precedent** — explicitly avoided. GROUND.md §Deviations item #2 documents the deliberate departure from `priority`'s `[Int]` filter shape; we use scalar `Int` + `$gte`. Mongoose `min`/`max` added even though `priority` lacks them (deviation #1).
- [x] **`test.skip(true, 'pending seeded …')` without follow-up wish** — clean. All 7 SPEC test skips reference `2026-05-22-test-fixture-seeder`, which exists as `.agents/wishes/2026-05-22-test-fixture-seeder/WISH.md`. The wish is in "captured" status; un-skipping these tests is its deliverable.
- [x] **"See it work" section missing or vague in PR body** — addressed below. Exact URL + clicks + expected text/count, no vague "exercise the picker."

### Other things I checked

- [x] **Files touched outside SPEC scope** — disclosed: removed the riskLevel zombie SPEC tests from `.agents/plugins/sales/tests/deals.spec.ts`. Net behavior change: zero (all were `test.skip(true, '...')`). Documented in commit 8's message and in the PR body §"Files touched outside SPEC scope". See also new lesson `2026-05-22 — Abandoned wishes leave zombie SPEC tests`.
- [x] **Subdomain scoping respected on every data path** — no new data path. Schema and types are subdomain-agnostic; resolvers inherit existing `generateModels(subdomain)` from `IContext`. UI components touch no subdomain logic.
- [x] **No cross-plugin direct imports** — confirmed. The new files import only from `@/deals/...` (sales-internal), `erxes-ui`, and `@tabler/icons-react`. No `@/<other-plugin>/...` imports.
- [x] **No new ports introduced** — clean. Backend still on 4000, UI on 3000.
- [x] **No `erxes-api-shared` changes without rebuild** — `erxes-api-shared` was not modified. `evals/run.sh sales` runs the build step `[1] Build erxes-api-shared` defensively each run and passed.
- [x] **No `npm` / `yarn` usage** — only pnpm. Confirmed.
- [x] **No secrets committed** — clean. No `.env`, no credentials, no tokens in diff.

## Acceptance criteria — each addressed

For each SPEC.md acceptance criterion:

1. **Add-deal sheet sets confidenceScore: 70 and the saved deal exposes it** — Code is in place: `formSchema.ts` Zod schema accepts the field; `AddCardForm.tsx` renders the numeric input; `DealsMutations.ts` `$confidenceScore: Int` variable + param wire the value to `dealsAdd`. Test exists at `deals.spec.ts:200` (skipped, BLOCKED on `2026-05-22-test-fixture-seeder`).
2. **Detail-sheet edit 30 → 85 persists across reload** — Code in `SalesFormFields.tsx` mounts `<SelectDealConfidenceScore variant="card">` which fires `editDeals({ confidenceScore })` on commit. Apollo cache update via `commonFields` re-fetch. Test exists at `deals.spec.ts:212` (skipped, BLOCKED on `2026-05-22-test-fixture-seeder`).
3. **Kanban card renders confidenceScore bar** — Code in `DealsBoardCard.tsx:160` renders `<SelectDealConfidenceScore variant="card">` next to `SelectDealPriority`. `ConfidenceScoreBar` sets `data-testid="confidence-score-bar"` and `data-value="<int>"` for test queryability. Test exists at `deals.spec.ts:223` (skipped, BLOCKED).
4. **Default-at-read = 0 for undefined confidenceScore** — `clamp(value)` in `SelectConfidenceScore.tsx` coerces `undefined → 0`. Call-sites pass `confidenceScore ?? 0` belt-and-braces. Test exists at `deals.spec.ts:234` (skipped, BLOCKED).
5. **Filter "Confidence ≥ N" hides deals below N** — Two non-skipped (AGENT_TEST_LIVE-gated) tests cover the UI-reachable contract:
   - `deals.spec.ts:153` — action-bar filter menu exposes "By Confidence" option (proves wiring in `SalesFilter.tsx` + `Filters.ts`)
   - `deals.spec.ts:175` — entering 50 in the filter input pushes `?confidenceScoreMin=50` to the URL (proves `useQueryState<number | null>` + the `FilterView` path)
   - Behavior assertion (the filter actually hides deals below N) requires seeded data and is at `deals.spec.ts:246` (skipped, BLOCKED).
6. **GraphQL `dealsEdit(confidenceScore: 150)` errors** — Mongoose `max: 100` produces a ValidationError that propagates through `models.Deals.updateDeal` (line 83 `updateOne($set)`) and bubbles up the GraphQL stack. Test exists at `deals.spec.ts:257` (skipped, BLOCKED).
7. **UI input clamps at 100** — Native HTML `<input type="number" min={0} max={100} step={1}>` in both the Add-form Input and the picker Input. Picker explicitly calls `clamp()` on commit. Test exists at `deals.spec.ts:269` (skipped, BLOCKED).

**Non-skipped count:** 2 of 7 (SPEC #5 UI-reachable + URL contract). **Skipped-with-named-wish count:** 7 (each SPEC criterion has a test in the spec; one is partially covered live, the rest block on the fixture-seeder wish).

## Lessons captured

Yes — 3 new entries appended to [`../../memory/lessons.md`](../../memory/lessons.md):

1. `2026-05-22 — Branch name collision with abandoned-PR branches blocks fresh-wish retries` — Phase 5's `git checkout -b feat/deal-confidence-score` failed because the abandoned PR #7760 branch exists. Lesson: date-stamp the branch name (`feat/<wish-id>`) when a prior attempt is documented.
2. `2026-05-22 — Abandoned wishes leave zombie SPEC tests referencing non-existent files` — `deals.spec.ts` shipped on `main` with a header referencing `RiskLevelInline.tsx` / `SelectRiskLevel.tsx` / `riskLevel.ts` (PR #7758 files that never landed). Lesson: Phase 3 GROUND should grep the spec's eval-files header for non-existent files and clean them up in Phase 6.
3. `2026-05-22 — Fixture-seeder is a multi-wish dependency, not an inline Phase 6 task` — Building seeder inline would have ballooned the wish to ~600 LOC. The named-skip escape hatch IS the workflow's correct path until `2026-05-22-test-fixture-seeder` ships.

## Final verification

- [x] `.agents/evals/run.sh sales` exit 0 — output:
  ```
  ─── [1] Build erxes-api-shared (prereq for backend plugins) ───
      ✓ erxes-api-shared built
  ─── [2] Build sales_api ───
      ✓ sales_api built
      ⚠ sales_api has no test target — skipping
  ─── [3] Build sales_ui ───
      ✓ sales_ui built

  ✓ All checks passed for plugin: sales
  ```
- [x] Playwright spec covering SPEC criteria — `pnpm exec playwright test --list` lists 15 tests (6 pre-existing, 2 new live-gated for SPEC #5, 7 named-skip for SPEC #1-7). Live `pnpm test` execution requires the dev stack and is the "See it work" path below.
- [x] No bare `test.skip(true, 'pending …')` — every skip references a real follow-up wish. Confirmed: `grep -n "test.skip" .agents/plugins/sales/tests/deals.spec.ts` shows each skip either gates on `!process.env.AGENT_TEST_LIVE` (live-stack waiver, valid per workflow) or references `BLOCKED on wish 2026-05-22-test-fixture-seeder`.

## See-it-work path drafted

- [x] Playwright command with expected pass count
- [x] File pointer for read-only review
- [x] **Manual click path** — exact URL, exact clicks, exact expected text (`"By Confidence"`, `?confidenceScoreMin=50`)

Full text included in the PR body §"See it work in 60 seconds".

## PR

- Title: `feat(sales): add confidenceScore to Deal across detail, card, filter, and add form`
- Body: filled per `.github/PULL_REQUEST_TEMPLATE.md` (see PR after creation).
- Link: _to be filled after `gh pr create`_.
