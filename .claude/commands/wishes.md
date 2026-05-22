---
description: List all in-flight wishes with current phase status
allowed-tools: Bash, Read, Glob
---

# /wishes — wish dashboard

List every wish in `.agents/wishes/<id>/` with current phase and last-activity time.

## What to do

1. Use `Glob` or `Bash ls .agents/wishes/` to list wish directories.
2. For each directory, inspect which artifacts exist:
   - `WISH.md` → Phase 0 captured
   - `SPEC.md` → Phase 2 drafted
   - `GROUND.md` → Phase 3 mapped
   - `PLAN.md` → Phase 4 planned
   - `REVIEW.md` → Phase 7 shipped
   - `STATUS.md` → halted (overrides phase indicator)
3. Use `stat` or file mtimes to find the most recent activity.
4. Report as a clean table:

```
Wishes in .agents/wishes/  (N total)
  STATUS  ID                                    PHASE       UPDATED
  ──────  ────────────────────────────────────  ──────────  ──────────
  ✓       2026-05-22-deal-risk-level            7 REVIEW    3d ago
  →       2026-05-23-deal-confidence-score      3 GROUND    12m ago
  ⚠       2026-05-23-broken-thing                0 (halted)  2h ago
```

Markers:
- `◦` empty / no artifacts
- `→` in progress (some artifacts, no REVIEW.md)
- `✓` shipped (REVIEW.md exists)
- `⚠` halted (STATUS.md exists)

Sort by most recent activity (newest first).

If `.agents/wishes/` doesn't exist or is empty, say so explicitly and suggest running `/sales "<wish>"` to begin.

## What NOT to do

- Don't read entire artifact contents — just check existence and mtime.
- Don't write any files.
- Don't propose code changes.
