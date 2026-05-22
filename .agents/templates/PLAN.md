# PLAN: <wish title>

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md) | **Ground:** [`./GROUND.md`](./GROUND.md)

## Commits (in order)

Each commit must be atomic: one logical change, ≤~50 LOC, independently buildable.

### Commit 1 — <subject>
- **Files:**
  - `<file>` — <change>
  - `<file>` — <change>
- **Why first:** <one sentence — schema before resolver, etc.>
- **Verify:** `evals/run.sh sales --backend-only` (or appropriate scope)

### Commit 2 — <subject>
- **Files:**
  - ...
- **Why next:** <dependency on commit 1>
- **Verify:** ...

### Commit 3 — <subject>
- **Files:** ...
- **Verify:** ...

(Continue for as many as needed. If you exceed ~6 commits, halt and ask if the wish is too big.)

## Test commit (Phase 6)

### Commit N — Add behavioral test
- **Files:**
  - `.agents/plugins/sales/tests/<file>.spec.ts` — assertions for SPEC acceptance criteria
- **Verify:** `cd .agents && pnpm test plugins/sales/tests/<file>.spec.ts`

## LOC budget

Estimate total LOC of changes (additions + deletions):
- Backend: ~<n> LOC
- Frontend: ~<n> LOC
- Tests: ~<n> LOC
- **Total: ~<n> LOC**

If total > 300 LOC, the wish is probably too big. Consider splitting.

## Risk + rollback

- **Riskiest commit:** <which one and why>
- **If shipped and broken in production:** how to revert. (Usually `git revert <sha>` and re-plan. For multi-commit changes, may need a partial revert.)

## EVAL log expectation

Phase 5 will write `./EVAL.log` — one line per `evals/run.sh sales` invocation across all commits + a final aggregate. The file is the audit trail Phase 7 reads. Without it, "I ran the eval on every commit" is a claim, not a proof.

## Approval

- [ ] Each commit is atomic
- [ ] Each commit is independently buildable
- [ ] LOC budget reasonable
- [ ] Test commit covers every SPEC acceptance criterion (per SPEC.md's Test-coverage matrix)
- [ ] At least one behavior-bucket test will be non-skipped, seeded, passing
