# Golden Tasks

> The smoke test for the `.agents/` system itself. If a fresh AI session (with no prior context) can complete these end-to-end using only `.agents/`, the system is working. If it can't, the docs have a gap — fix the gap.

## How to use

1. Pick one task.
2. Start a fresh AI session (e.g., new Claude Code window).
3. Tell the AI: "You are working in the erxes repo. Read `.agents/README.md` and then complete: <task>."
4. Watch what happens.
5. Note where the workflow snags. Fix the docs/skills/templates that caused the snag.
6. Re-run until the task completes cleanly.

These tasks are real-but-small Sales features. They span the workflow's full 7 phases.

---

## Task 1 — Documentation smoke test (the simplest)

**Wish:** "Show me where the Deal `name` field is defined in the codebase."

**Expected behavior:**
- AI reads `.agents/README.md`
- Follows the routing table to `plugins/sales/INDEX.md` or `docs/sales/sales-plugin-map.md`
- Returns the exact path: `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts`
- Time: < 2 minutes

**This is the "single-entry" test.** If AI has to read 5 files to answer, the docs have a navigation gap.

---

## Task 2 — Add a simple field (the canonical case)

**Wish:** "Add a `riskLevel` enum (low / medium / high, default `low`) to Deal. Editable from the deal detail sheet. Visible as a colored badge on the kanban card."

> Note: `priority` would seem like the canonical example but it already exists as a free-text string on Deal (`deals.ts:96`). Use `riskLevel` (or any other genuinely new field) instead.

**Expected behavior:**
- AI invokes `/sales` (or follows WORKFLOW.md manually)
- Phase 0: asks 0–2 clarifying questions (color mapping? sortable?)
- Phase 1: routes to `skills/sales/add-deal-field.md`
- Phase 2: SPEC.md with the 3 acceptance criteria above
- Phase 3: GROUND.md naming sister features (e.g., how `name` or `closeDate` is implemented)
- Phase 4: PLAN.md with 4–6 atomic commits
- Phase 5: commits, each passing `evals/run.sh sales`
- Phase 6: Playwright spec covering the 3 criteria, passing
- Phase 7: PR opened with template filled

**Acceptance:** PR opens cleanly. Developer reviews — no slop checklist items present.

---

## Task 3 — Add a new view (UI-heavy)

**Wish:** "Add a 'Deals closing this week' filtered view to the kanban — accessible from the action bar."

**Expected behavior:**
- Routes to `skills/sales/add-sales-ui-page.md` (or a UI-filter skill if added)
- Phase 3: mirrors how existing filters work (find one in `modules/deals/actionBar/`)
- Phase 6: Playwright test exercises the filter (or skip with reason if data seeding needed)

---

## Task 4 — Cross-plugin link (the hard one)

**Wish:** "When a Deal moves to the 'Won' stage, automatically create a follow-up Task in the operation plugin assigned to the deal's owner."

**Expected behavior:**
- Phase 1: routes to `skills/sales/add-sales-automation.md`
- Phase 3: GROUND identifies sister features that cross plugin boundaries (e.g., existing payment ↔ sales callback at `backend/plugins/sales_api/src/main.ts:71`)
- Phase 5: implementation uses GraphQL federation or tRPC, NEVER direct import
- Phase 6: test validates both sides of the contract

This task exercises the architecture-boundary rules. If AI does a direct import, the system failed.

---

## Task 5 — A wish that SHOULD route to NOVEL

**Wish:** "Generate a per-tenant churn-prediction model using deal stage history."

**Expected behavior:**
- Phase 1 ROUTE: AI recognizes this is NOT covered by any existing skill
- AI stops, says: "This wish does not fit an existing skill. Need a design pass."
- AI asks the developer for direction.

**This task validates the NOVEL escape hatch.** If AI confidently implements something it has no skill for, the system failed.

---

## Failure modes to watch for

When running a golden task, note any of these — they signal docs gaps:

- AI greedy-reads >5 unrelated files
- AI skips a phase
- AI commits >50 LOC in one commit
- AI declares "done" without `evals/run.sh sales`
- AI invents files that don't exist
- AI directly imports from another plugin
- AI writes tests that only assert non-throw
- AI adds comments restating code

Each is a slop tell. Fix the source — usually a missing rule, a missing skill, or a missing routing entry.

## Tracking

When you run a golden task, log the outcome here (append to bottom):

```markdown
## YYYY-MM-DD — Task <n> — <pass/partial/fail>
**AI tool used:** Claude Code / Cursor / ...
**Outcome:** what happened in one sentence.
**Gaps found:** what we fixed in `.agents/` as a result.
```

## 2026-05-22 — Task 2 (riskLevel enum on Deal) — **pass (with discoveries)**
**AI tools used:** Claude Code (Opus 4.7) — Phases 0–2 inline; fresh subagent for Phases 3–7.
**Outcome:** PR [#7758](https://github.com/erxes/erxes/pull/7758) opened as draft. 11 atomic commits on `feat/deal-risk-level`. ~378 LOC source change + 720 LOC workflow artifacts (wish docs, test, lessons).
**Gaps found (each fixed in the system):**
1. `add-deal-field.md` skill pointed at AddCardForm; the real edit surface is `cards/components/detail/overview/SalesFormFields.tsx`. Captured as lesson #1; skill needs update pass.
2. Field-level UI has two parallel patterns — `components/deal-selects/Select<Field>.tsx` (edit) and `components/common/filters/Select<Field>.tsx` (filter). Captured as lesson #5.
3. `pnpm install` from `.agents/` requires `--ignore-workspace`. Captured as lesson #2 + hardened `evals/run.sh`.
4. `docs/sales/data-model.md` had a stale "priority does not exist" claim. Fixed at the time of discovery.
**System verdict:** ✅ The 7-phase workflow ran cleanly end-to-end. Mirror-precedent (Phase 3 GROUND) caught the most consequential gap **before** code landed. Lessons.md grew from 0 → 6 entries during validation. The system compounds on first use.
