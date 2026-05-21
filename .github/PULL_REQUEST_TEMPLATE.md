<!--
  Fill in every section. Sections marked AI-assisted disclosure are mandatory
  for any PR where AI generated or modified code (including via .agents/ workflow).
-->

## Summary

<!-- 1-3 bullets: what changed and why. NOT a diff narration — the diff is below. -->

## AI-assisted disclosure

- [ ] AI-assisted (any meaningful code generated/edited by an AI tool)
- [ ] Workflow used: `/sales <wish>` → `.agents/wishes/<id>/`
- [ ] Skill followed: `.agents/skills/sales/<skill>.md` (or N/A — explain below)
- [ ] Sister feature mirrored: `<file or feature name>` (Phase 3 GROUND)
- [ ] `.agents/evals/run.sh sales` exit 0 — verified
- [ ] `.agents/SLOP-CHECKLIST.md` re-read — no items present in diff
- [ ] New lesson captured in `.agents/memory/lessons.md`? <yes / no — if no, why not>

If AI was NOT used, write "Human-only" and skip the rest of this section.

## Acceptance criteria from SPEC

<!-- Copy from .agents/wishes/<id>/SPEC.md. Each item must map to at least one
     test assertion in the Phase 6 Playwright spec. -->

1.
2.
3.

## Test plan

- [ ] `.agents/evals/run.sh sales` passes
- [ ] Playwright spec at `.agents/plugins/sales/tests/<file>.spec.ts` covers every SPEC criterion
- [ ] Manual smoke test path from `.agents/evals/smoke-tests.md` (if applicable — note which path)

## Files touched outside SPEC scope

<!-- The SPEC defined what files change. Anything outside that scope needs a
     disclosure here with a one-line reason. Empty if nothing else changed. -->

(none)

## Rollback

If shipped and broken in production: how to revert?

- Single revert: `git revert <sha>`
- Multi-commit: list commit shas in order, revert in reverse
- Has DB migration: link to rollback migration
