---
description: Frontline Workflow — grant a customer-facing Frontline feature wish end-to-end (7 phases with gates)
argument-hint: "<wish text>"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, TaskCreate, TaskUpdate, TaskList, TaskGet, Agent
---

# /frontline — Frontline Workflow orchestrator

You are entering the Frontline Workflow. This is **not** a free-form coding session. You execute 7 phases in order. Each phase has a gate. **Do not skip a phase.**

The wish is: $ARGUMENTS

---

## Before phase 0

Read these files **now**, in order, before doing anything else:

1. `.agents/SYSTEM-PROMPT.md` — the constitution (non-negotiable rules)
2. `.agents/WORKFLOW.md` — the canonical phase definitions
3. `.agents/SLOP-CHECKLIST.md` — what NOT to do
4. `.agents/memory/lessons.md` — what AI has gotten wrong here before
5. `.agents/README.md` — routing map

After reading, create a TaskCreate task for each phase (8 tasks: 0 through 7). Mark Phase 0 in_progress immediately.

---

## Phase 0 — WISH

1. Generate a wish ID: `YYYY-MM-DD-<slug>` where slug is a short kebab-case derived from the wish (e.g., `2026-05-22-ticket-urgency-badge`).
2. `mkdir .agents/wishes/<id>/`
3. Read `.agents/templates/WISH.md` — copy it to `.agents/wishes/<id>/WISH.md` and fill it in.
4. If anything is ambiguous, **STOP and ASK 1–3 clarifying questions** via AskUserQuestion.
5. Update WISH.md with answers.
6. Tell the developer: "Here is the captured wish: <link to WISH.md>. Confirm before I proceed."
7. Wait for confirmation. **Do not proceed without it.**
8. Mark Phase 0 complete; start Phase 1.

---

## Phase 1 — ROUTE

1. Read each file in `.agents/skills/frontline/` (their "When to use" headers).
2. Decide: does this wish fit a skill, or is it NOVEL?
3. Append a `## Routing` section to `WISH.md`:
   ```markdown
   ## Routing
   **Skill:** `.agents/skills/frontline/<skill>.md`
   **Reasoning:** <one sentence>
   ```
   Or:
   ```markdown
   ## Routing
   **Decision:** NOVEL — no existing skill fits.
   **Reasoning:** <one sentence>
   ```
4. If NOVEL — **STOP.** Ask the developer: (a) create a new skill first, (b) treat as one-off and proceed without a skill, or (c) reshape the wish to fit a skill. Do not silently proceed.
5. Mark Phase 1 complete.

---

## Phase 2 — SPEC

1. Read the routed skill.
2. Copy `.agents/templates/SPEC.md` to `.agents/wishes/<id>/SPEC.md`.
3. Fill in EVERY section:
   - User-visible behavior
   - API contract changes (GraphQL, tRPC, REST)
   - Data model changes
   - UI changes
   - Acceptance criteria (numbered — these become Phase 6 test assertions)
   - Out of scope
4. Tell the developer: "SPEC ready at <link>. Please review acceptance criteria — those are the test contract."
5. Wait for SPEC approval. **Do not proceed without it.**
6. Mark Phase 2 complete.

---

## Phase 3 — GROUND

1. Read the routed skill's "Phase 3 — GROUND" section (the sister features it names).
2. **Read every file the sisters touch, in full.** Use Read tool, one file at a time. Do not skim.
3. Copy `.agents/templates/GROUND.md` to `.agents/wishes/<id>/GROUND.md`. Fill in:
   - Sister features chosen + why
   - Files read (every Read call counts as evidence)
   - Files to edit, mapped from each sister's edits
   - Files to create (usually empty)
   - Deviations from sister + why
   - Cross-plugin impact assessment
4. **Self-check:** count your Read tool calls in this phase. Does it equal the number of files in "Files I read in full"? If less, you skipped. Halt and finish the reads.
5. Mark Phase 3 complete.

---

## Phase 4 — PLAN

1. Copy `.agents/templates/PLAN.md` to `.agents/wishes/<id>/PLAN.md`.
2. Decompose the implementation into atomic commits. Each commit:
   - ≤ ~50 LOC changes (additions + deletions)
   - One logical change
   - Independently buildable
3. Order by dependency (schema → resolver → UI → test, typically).
4. For each commit, list files touched + a one-line commit message.
5. Estimate total LOC budget. If > 300, halt and tell the developer the wish is too big to ship as one PR.
6. Mark Phase 4 complete.

---

## Phase 5 — IMPLEMENT

For each commit in PLAN.md:

1. Make the edits (use `Edit` tool — not `Write` — for existing files).
2. Run `.agents/evals/run.sh frontline` (or `--backend-only`/`--frontend-only` per the commit's scope).
3. If exit 0:
   - `git add -A`
   - `git commit -m "<message from PLAN>"`
   - Move to next commit.
4. If non-zero:
   - Read the error log from `/tmp/run.sh.*.log`
   - Fix the failure.
   - Re-run the script.
   - **If you can't fix in 2 attempts, STOP and ask the developer.**
5. After all commits: re-run `evals/run.sh frontline` with full default (no `--*-only` flags). Must exit 0.
6. Mark Phase 5 complete.

---

## Phase 6 — VERIFY

1. Identify the relevant Playwright spec at `.agents/plugins/frontline/tests/<file>.spec.ts` (most often `ticket.spec.ts`).
2. Read it. Identify where to add tests covering SPEC's acceptance criteria.
3. Add tests. Each acceptance criterion in SPEC.md must map to at least one test assertion.
4. Use the eval-files header convention (see existing specs).
5. Run: `cd .agents && pnpm test plugins/frontline/tests/<file>.spec.ts`
6. If passing → commit the test changes (this is a new atomic commit).
7. If failing:
   - If the test is wrong → fix the test.
   - If the code is wrong → STOP and tell the developer; you may have a Phase 5 regression.
8. Run `.agents/evals/run.sh frontline --include-e2e` for a final all-green confirmation.
9. Mark Phase 6 complete.

---

## Phase 7 — REVIEW + SHIP

1. `git diff main...HEAD` — read every changed line.
2. Copy `.agents/templates/REVIEW.md` to `.agents/wishes/<id>/REVIEW.md`.
3. Walk through `.agents/SLOP-CHECKLIST.md` item by item against your diff. Mark each clean or fixed.
4. If you learned something non-obvious during this wish, append a lesson to `.agents/memory/lessons.md`.
5. Open the PR via `gh pr create`:
   - Title: derived from SPEC's user-visible behavior (≤70 chars)
   - Body: fill `.github/PULL_REQUEST_TEMPLATE.md` completely
   - Reference the wish: link `.agents/wishes/<id>/`
6. Print the PR URL to the developer.
7. Mark Phase 7 complete.

---

## Failure handling

If a gate fails:
- Halt at the current phase.
- Update `.agents/wishes/<id>/STATUS.md` with the failure and what was tried.
- Tell the developer specifically what's broken. Ask for direction.

If a human gate is rejected:
- Update the artifact (WISH or SPEC) with feedback.
- Re-enter the phase. Do not silently proceed.

## Aborting

If a wish proves infeasible mid-workflow:
1. Update WISH.md with abort reason.
2. Tell the developer.
3. Ask whether to `git reset` work-in-progress commits (destructive — needs explicit approval).
4. Leave `.agents/wishes/<id>/` as a record. Future AI reads it as a lesson.
