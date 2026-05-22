---
description: List all in-flight wishes with current phase status
allowed-tools: Bash, Read, Glob
---

# /wishes — wish dashboard

List every wish in `.agents/wishes/<id>/` with current phase and last-activity time.

## What to do

1. Use `Glob` or `Bash ls .agents/wishes/` to list wish directories.
2. For each directory, read the `Status:` line in `WISH.md` (the source of truth, defined in [`../.agents/WORKFLOW.md`](../.agents/WORKFLOW.md#status-state-machine-the-only-legal-status-values)). Also inspect which artifacts exist:
   - `WISH.md` → Phase 0 captured
   - `SPEC.md` → Phase 2 drafted
   - `GROUND.md` → Phase 3 mapped
   - `PLAN.md` → Phase 4 planned
   - `EVAL.log` → Phase 5 ran with audit trail
   - `REVIEW.md` → Phase 7 review drafted
   - `SHIP.md` → Phase 7 complete (PR open with verified URL)
   - `STATUS.md` → halted/aborted (overrides phase indicator)
3. Cross-check status vs artifacts. If `Status: shipped` but no `SHIP.md` with merge SHA, flag with `⚠ status-drift`.
4. Use `stat` or file mtimes to find the most recent activity.
5. Report as a clean table:

```
Wishes in .agents/wishes/  (N total)
  STATUS    ID                                    PHASE         UPDATED
  ────────  ────────────────────────────────────  ────────────  ──────────
  pr-open   2026-05-22-deal-risk-level            7 SHIP        3d ago
  →         2026-05-23-deal-confidence-score      3 GROUND      12m ago
  ⚠         2026-05-23-broken-thing               0 (halted)    2h ago
```

Markers:
- `◦` empty / no artifacts
- `→` in progress (some artifacts, not yet at pr-open)
- `pr-open` SHIP.md exists with verified URL
- `shipped` merge commit landed on main
- `⚠` halted / aborted / status-drift (STATUS.md exists, or status field disagrees with artifacts)

Sort by most recent activity (newest first).

If `.agents/wishes/` doesn't exist or is empty, say so explicitly and suggest running `/sales "<wish>"` to begin.

## What NOT to do

- Don't read entire artifact contents — just check existence and mtime.
- Don't write any files.
- Don't propose code changes.
