---
description: Sales Workflow — grant a customer-facing Sales feature wish end-to-end (7 phases with gates)
argument-hint: "<wish text>"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, TaskCreate, TaskUpdate, TaskList, TaskGet, Agent
---

# /sales — Sales Workflow orchestrator

You are entering the Sales Workflow. This is **not** a free-form coding session. You execute 7 phases in order. Each phase has a gate. **Do not skip a phase.**

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

1. Generate a wish ID: `YYYY-MM-DD-<slug>` where slug is a short kebab-case derived from the wish (e.g., `2026-05-22-deal-risk-level`).
2. `mkdir .agents/wishes/<id>/`
3. Read `.agents/templates/WISH.md` — copy it to `.agents/wishes/<id>/WISH.md` and fill it in. Set `Status: captured`.
4. If anything is ambiguous, **STOP and ASK 1–3 clarifying questions** via AskUserQuestion. Common ambiguities:
   - Boolean vs enum vs free-text
   - Where it's visible (card / detail / list / multiple)
   - Affects sorting/filtering or just display
   - Default value
   - Permission scoping
5. Update WISH.md with answers.
6. Tell the developer: "Here is the captured wish: <link to WISH.md>. Confirm before I proceed."
7. Wait for confirmation. **Do not proceed without it.**
8. Mark Phase 0 complete; start Phase 1.

**Status transitions across the workflow** (the only legal `Status:` values are defined in [`WORKFLOW.md`](../.agents/WORKFLOW.md#status-state-machine-the-only-legal-status-values)). Update the WISH.md `Status:` line at the start of each phase: `captured` → `routed` → `speced` → `grounded` → `planned` → `implementing` → `verified` → `pr-open`. **Never write `shipped`** — that requires a merge SHA on `main` and is a developer-or-follow-up action, never AI.

---

## Phase 1 — ROUTE

1. Read each file in `.agents/skills/sales/` (their "When to use" headers).
2. Decide: does this wish fit a skill, or is it NOVEL?
3. Append a `## Routing` section to `WISH.md`:
   ```markdown
   ## Routing
   **Skill:** `.agents/skills/sales/<skill>.md`
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
   - **Test-coverage matrix** — for each criterion, label it `wiring` or `behavior` and name the Phase 6 form (live-gated, seed-in-beforeAll, or BLOCKED on a real wish). At least one criterion must be planned as a non-skipped, seeded behavior test.
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

**Branch:** `git checkout -b feat/<wish-id>` (the date-stamped slug, not the bare feature name — avoids collisions with abandoned-PR branches per lessons.md).

For each commit in PLAN.md:

1. Make the edits (use `Edit` tool — not `Write` — for existing files).
2. Run `.agents/evals/run.sh sales` (or `--backend-only`/`--frontend-only` per the commit's scope).
3. **Append one line to `.agents/wishes/<id>/EVAL.log`** in the form:
   ```
   commit-<n>  <ISO timestamp>  exit=<code>  <command>  <one-line summary or error tail>
   ```
   The file is the audit trail. Phase 7 reads it.
4. If exit 0:
   - `git add -A`
   - `git commit -m "<message from PLAN>"`
   - Move to next commit.
5. If non-zero:
   - Read the error log from `/tmp/run.sh.*.log`.
   - Append the failure line to EVAL.log (do not erase prior lines).
   - Fix the failure.
   - Re-run the script. Each retry adds its own line.
   - **If you can't fix in 2 attempts, STOP and ask the developer.**
6. After all commits: re-run `evals/run.sh sales` with full default (no `--*-only` flags). Must exit 0. Append the final aggregate line to EVAL.log.
7. Mark Phase 5 complete only when EVAL.log has ≥1 exit-0 line per commit in PLAN.md plus a final aggregate exit-0 line.

---

## Phase 6 — VERIFY

1. Identify the relevant Playwright spec at `.agents/plugins/sales/tests/<file>.spec.ts` (most often `deals.spec.ts`).
2. Read it. Open SPEC.md's Test-coverage matrix.
3. For each criterion, write the test in the form the matrix specifies:
   - **wiring** → live-gated test (`test.skip(!process.env.AGENT_TEST_LIVE, '...')`), passes without seeded data.
   - **behavior** → `test.beforeAll` seeds via GraphQL mutations per [`docs/sales/playwright-fixtures.md`](../.agents/docs/sales/playwright-fixtures.md); the test asserts the outcome; `test.afterAll` tears down.
   - **BLOCKED on wish <id>** → only for individual behavior criteria that genuinely can't seed today, and only if at least one OTHER behavior criterion is non-skipped, seeded, and passing.
4. **Behavior-coverage floor check** — count behavior-bucket criteria in SPEC vs. behavior-bucket criteria with non-skipped, passing tests. If the count of non-skipped behavior tests is zero, **STOP**. The wish has discovered an infra gap; tell the developer.
5. Use the eval-files header convention (see existing specs).
6. Run: `cd .agents && AGENT_TEST_LIVE=1 pnpm test plugins/sales/tests/<file>.spec.ts`
7. If passing → commit the test changes (this is a new atomic commit). Append the exit line to `.agents/wishes/<id>/EVAL.log`.
8. If failing:
   - If the test is wrong → fix the test.
   - If the code is wrong → STOP and tell the developer; you may have a Phase 5 regression.
9. Run `.agents/evals/run.sh sales --include-e2e` for a final all-green confirmation. Append its exit line to EVAL.log.
10. Mark Phase 6 complete only when the behavior-coverage floor is met.

---

## Phase 7 — REVIEW + SHIP

1. `git diff main...HEAD` — read every changed line.
2. Copy `.agents/templates/REVIEW.md` to `.agents/wishes/<id>/REVIEW.md`.
3. Walk through `.agents/SLOP-CHECKLIST.md` item by item against your diff. Mark each clean or fixed.
4. If you learned something non-obvious during this wish, append a lesson to `.agents/memory/lessons.md`.
5. Draft the PR body to disk first: write the filled `.github/PULL_REQUEST_TEMPLATE.md` into `.agents/wishes/<id>/PR-BODY.md`. Title ≤70 chars derived from SPEC's user-visible behavior.
6. Push the branch: `git push -u origin <branch>` if not already pushed.
7. Open the PR:
   ```bash
   gh pr create --title "<title>" --body-file .agents/wishes/<id>/PR-BODY.md
   ```
   - On failure (auth, branch already has PR, no remote, etc.) **STOP**. Do not invent the URL, do not declare success. Report the error verbatim to the developer and ask.
   - On success: capture the URL printed to stdout.
8. Verify the URL: `gh pr view <url> --json url,number,headRefOid,state` must return a real JSON payload. If it doesn't, Phase 7 is **not** complete.
9. Write `.agents/wishes/<id>/SHIP.md`:
   ```markdown
   # SHIP: <wish title>
   **PR:** <url>
   **PR number:** <n>
   **HEAD SHA:** <sha from gh pr view>
   **Opened at:** <ISO timestamp>
   **State at open:** OPEN | DRAFT
   **Status transition:** verified → pr-open
   ```
10. Flip wish status:
    - In WISH.md `Status:` line → `pr-open`
    - **Do not write `shipped`.** Only the developer / a follow-up `/wish-merged` flow sets `shipped`, and only after a merge SHA exists on `main`.
11. Print the PR URL to the developer.
12. Mark Phase 7 complete only after SHIP.md exists. **If SHIP.md is missing, Phase 7 is incomplete regardless of which other artifacts are present.**

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
