# STATUS: 2026-05-22-deal-confidence-score

**Current status:** `verified` (not `shipped`, not `pr-open`)

## Why this STATUS.md exists

This wish ran the original 7-phase workflow and reached Phase 7, but two gates that exist in the workflow today were not enforced when this wish ran. The wish was self-reported as `shipped (awaiting PR open)` in WISH.md — a status that the updated `WORKFLOW.md` now makes impossible.

## Gates that did not pass

### 1. SHIP.md does not exist → cannot claim `pr-open`

Phase 7 step 9 requires writing `./SHIP.md` carrying a verifiable PR URL. That file does not exist. `gh pr list --head feat/2026-05-22-deal-confidence-score` returns `[]`. Branch is pushed; PR is not opened.

### 2. Behavior-coverage floor not met → Phase 6 would now halt

SPEC has 7 acceptance criteria; under the updated wiring/behavior split:
- SPEC #5 (a) and (b) — wiring tests, live-gated, two tests added (passing on live stack)
- SPEC #1, #2, #3, #4, #5 (c), #6, #7 — **behavior bucket; all 7 deferred to wish `2026-05-22-test-fixture-seeder`**

Behavior-coverage floor (≥1 non-skipped behavior test seeded inline): **not met**. Under the updated Phase 6, the wish should have halted here with "this wish has discovered an infra gap — ship the seeder first."

### 3. Two files share a basename → slop checklist would now flag

`components/deal-selects/SelectConfidenceScore.tsx` and `components/common/filters/SelectConfidenceScore.tsx` both exist. Inherited from the `priority` precedent (which is itself slop). Under the new naming-uniqueness rule, this would be flagged in REVIEW.md.

## Path forward (developer decision required)

Three legitimate paths:

1. **Open the PR as-is.** Run `gh pr create --body-file .agents/wishes/2026-05-22-deal-confidence-score/PR-BODY.md`. Write SHIP.md. Status → `pr-open`. Acknowledge the behavior-coverage gap explicitly in the PR body so reviewers know the seeded tests are pending the fixture-seeder wish.
2. **Hold the PR until the seeder ships.** Pick up `2026-05-22-test-fixture-seeder`, ship it, then come back and convert the 7 named-skips into seeded behavior tests, then open the PR with the floor genuinely met.
3. **Reshape this wish to "display only."** Trim SPEC #1/#2/#6/#7 (which need behavior tests for the save path) into a follow-up wish; ship the display-only version (#3/#4 with seeded data inline). Add the action-bar filter as a separate wish.

This file pre-dates a developer choice on which path to take. Until the choice is made, the wish stays at `verified`.

## Lessons retroactively applicable (already logged)

- `2026-05-22 — Fixture-seeder is a multi-wish dependency, not an inline Phase 6 task` was the lesson that legalized this wish's escape hatch at the time. Under the **updated** workflow (Phase 6 behavior-coverage floor), that lesson is partially superseded: the named-skip is still legal for *some* criteria, but not for *all* of them. The original lesson has been amended in `memory/lessons.md`.
