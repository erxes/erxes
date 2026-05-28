# Fix/Resolve Plugin Issue — erxes AI Native Bug-Fixing Playbook

> The parallel of the 7-phase Feature Workflow, but for bugs. Follows the same gated structure: human checkpoints, mandatory grounding, regression-test-first. **No shortcuts.**

This playbook guides an AI agent through triaging, understanding, reproducing, fixing, and verifying reported issues in any monorepo plugin. It mirrors the rigor of the feature workflow — bugs deserve the same discipline as features.

---

# Playbook Initialization

> **When to use:** When the developer runs `erxes-wish` with the `--fix` attribute, or when a bug report/error/issue is detected in their wish.

> **Pre-read (mandatory):**
> 1. [`../SYSTEM-PROMPT.md`](../SYSTEM-PROMPT.md) — constitution
> 2. [`../memory/lessons.md`](../memory/lessons.md) — past bugs may be relevant
> 3. [`../SLOP-CHECKLIST.md`](../SLOP-CHECKLIST.md) — the bug itself may be a slop pattern

---

## Bug-Fix Workflow — at a glance

```
0 REPORT → 1 TRIAGE → 2 BUG-SPEC → 3 BUG-GROUND → 4 PLAN → 5 FIX → 6 VERIFY → 7 REVIEW
  ↓          ↓          ↓             ↓              ↓        ↓         ↓          ↓
human      AI        human         AI             AI       AI        AI         human
checkpoint           gate                                                       gate
```

Three human checkpoints. Everything else has automated gates AI cannot skip.

---

## Phase 0 — REPORT (capture the bug)

**Goal:** parse and normalize the bug report into a structured wish.

**AI does:**
1. Generate a wish ID: `YYYY-MM-DD-fix-<slug>` (e.g., `2026-05-26-fix-deal-color-calc`)
2. `mkdir .agents/wishes/<id>/`
3. Copy `.agents/templates/WISH.md` to `.agents/wishes/<id>/WISH.md`
4. Fill in the bug report. If the input is a raw GitHub issue, extract:
   - **Affected plugin** (auto-detect from entity names, file paths, or page URLs)
   - **Symptom** (the user-visible wrong behavior)
   - **Reproduction steps** (if provided)
   - **Error messages / stack traces** (verbatim)
   - **Environment** (tenant, browser, commit)
5. Set Routing in WISH.md to: `**Skill:** .agents/skills/fix-issue.md`
6. If the report is vague or missing reproduction steps, ASK. **Do not guess.**

**Artifact:** `.agents/wishes/<id>/WISH.md`

**Gate (human):** developer confirms "yes, that's the bug."

---

## Phase 1 — TRIAGE (locate and scope)

**Goal:** identify the affected plugin, locate relevant code, and determine if this is fixable.

**AI does:**
1. Read the plugin's [`INDEX.md`](../plugins/) to find the file map for the affected module.
2. Search the codebase for key terms from the bug report:
   - Function names, component names, error messages
   - `grep_search` for symptoms, field names, or endpoint paths
3. Read the relevant files using `view_file` to understand the current logic.
4. Determine:
   - **Scope:** single file, multi-file, cross-plugin?
   - **Severity:** blocks user workflow, visual-only, edge case?
   - **Confidence:** can the AI fix this, or does it need human guidance?

If the bug is cross-plugin or the AI is <70% confident in the root cause: **STOP and ask.**

---

## Phase 2 — BUG-SPEC (define "fixed" before fixing)

**Goal:** define what "fixed" means before writing any code. The equivalent of Phase 2 SPEC for features.

**AI does:**
1. Copy `.agents/templates/BUG-SPEC.md` to `.agents/wishes/<id>/BUG-SPEC.md`
2. Fill in:
   - **Observed behavior** (from the bug report)
   - **Expected behavior** (from reading the original feature code — NOT from guessing)
   - **Root cause hypothesis** (from Phase 1 triage)
   - **Files involved** (with specific line ranges if possible)
   - **Fix acceptance criteria** (numbered — these become regression tests)
   - **Out of scope** (no refactoring, no new features, just the fix)

**Artifact:** `.agents/wishes/<id>/BUG-SPEC.md`

**Gate (human):** developer approves the root cause and fix criteria. Specifically:
- "Yes, that's the root cause."
- "Yes, those criteria prove it's fixed."

**Slop prevented:** fixing the symptom instead of the root cause; defining "done" as "compiles."

---

## Phase 3 — BUG-GROUND (understand the original design)

**Goal:** read the original feature implementation to understand what the code was *supposed* to do. This is the bug-fix equivalent of Phase 3 GROUND for features.

**AI does:**
1. Copy `.agents/templates/BUG-GROUND.md` to `.agents/wishes/<id>/BUG-GROUND.md`
2. **Find the original feature:**
   - `git log --follow <broken-file>` — find the commit that introduced or last modified the broken logic
   - Check `.agents/wishes/` for a prior wish that implemented this feature
   - Read any related SPEC.md if it exists
3. **Read every file involved in the bug, in full.** No skimming. List them.
4. **Trace the causality chain:** user action → function call → wrong behavior → root cause.
5. **Search for similar past bugs:**
   - Check `memory/lessons.md` for related entries
   - `git log --all --oneline --grep="<keyword>"` for related fixes
   - Check `SLOP-CHECKLIST.md` for a matching anti-pattern
6. **Choose a fix strategy:** document alternatives if multiple exist.

**Artifact:** `.agents/wishes/<id>/BUG-GROUND.md`

**Gate (automatic):** Read-tool calls ≥ number of files listed in "Files read in full."

**Slop prevented:** patching the symptom without understanding the design; introducing a second bug because you didn't read the surrounding code.

---

## Phase 4 — PLAN (atomic commits for the fix)

**Goal:** break the fix into atomic commits.

**AI does:**
1. Copy `.agents/templates/PLAN.md` to `.agents/wishes/<id>/PLAN.md`
2. Order the fix into commits:

**Default commit ordering for bug fixes:**

1. **Commit 1 — Add failing regression test** (RED)
   Write a Playwright E2E spec or Jest unit test that reproduces the bug. This test MUST fail with the current code.
   - Test seeds its own fixtures via GraphQL mutations in `test.beforeAll`
   - Test executes the user-visible flow that triggers the bug
   - Test asserts the EXPECTED behavior (which currently fails)
   - Run the test: confirm it fails ✗

2. **Commit 2 — Apply the fix** (GREEN)
   Apply the minimal code change. ≤ 50 LOC.
   - Run the regression test: confirm it now passes ✓
   - Run `evals/run.sh <plugin>`: confirm no regressions

3. **Commit 3 — Add JSDoc explaining the fix** (if non-obvious)
   Document the "why" — only if the fix is subtle enough that a future reader would wonder.

Each commit ≤ ~50 LOC, independently buildable.

**Artifact:** `.agents/wishes/<id>/PLAN.md`

**Gate (automatic):** commits ≤ 50 LOC; regression test exists BEFORE the fix.

---

## Phase 5 — FIX (implement)

**Goal:** execute the plan commit by commit.

**AI does:**
For each commit in PLAN.md:
1. Make the edits.
2. Run `.agents/evals/run.sh <plugin>` (or `--backend-only` for backend-only commits).
3. If exit 0 → `git add -A && git commit -m "<message>"` then proceed to next.
4. If non-zero → fix the failure. **If fix takes >2 attempts, STOP and ask.**

### Non-Negotiable Fix Rules

1. **Minimal diff.** Fix the bug, nothing else. No refactoring, no style changes, no "while I'm here" improvements.
2. **Multi-tenancy.** Never bypass `generateModels(subdomain)` or hardcode connections. See [`../rules/30-multi-tenancy.md`](../rules/30-multi-tenancy.md).
3. **Plugin boundaries.** Cross-plugin via federation/tRPC/pubsub only. See [`../rules/20-architecture-boundaries.md`](../rules/20-architecture-boundaries.md).
4. **Schema-type parity.** If you narrow a TS type, narrow the schema too (Mongoose `enum`, GraphQL `enum`). See SLOP-CHECKLIST "TS literal-union without schema enum."
5. **Pure-Graph seeding.** All test data via GraphQL mutations. No direct database manipulation.
6. **Clean codestyle.** Use TypeScript `interface` for object shapes. Zero `any`. No console.log. See [`../rules/10-code-style.md`](../rules/10-code-style.md).
7. **Atomic commits.** ≤ 50 LOC per commit. One logical change each.

---

## Phase 6 — VERIFY (prove the fix works)

**Goal:** the regression test you wrote in Phase 4 passes, and nothing else broke. This is the proof the bug is fixed, not a claim.

**AI does:**
1. Confirm the regression test from Commit 1 now passes with the fix from Commit 2.
2. Run the full eval suite:
   ```bash
   .agents/evals/run.sh <plugin>
   ```
3. If Playwright E2E is configured:
   ```bash
   .agents/evals/run.sh <plugin> --include-e2e
   ```
4. Verify every BUG-SPEC acceptance criterion has at least one **non-skipped** test.

**Gate (automatic):** all tests pass, including the new regression test.

**No-skip rule applies.** Same as feature workflow — no `test.skip` cop-outs.

---

## Phase 7 — REVIEW (capture lessons, open PR)

**Goal:** self-review, capture lessons, produce a PR with an executable "see it work" path.

**AI does:**
1. Copy `.agents/templates/REVIEW.md` to `.agents/wishes/<id>/REVIEW.md`
2. `git diff main...HEAD` — read every changed line.
3. Walk through `.agents/SLOP-CHECKLIST.md`, item by item.
4. **Mandatory:** add an entry to `memory/lessons.md` for EVERY bug fix:
   ```markdown
   ## YYYY-MM-DD — <bug title>
   **Symptom:** <what looked wrong>
   **Root cause:** <why it happened>
   **Lesson:** <the durable rule — what to check next time>
   **Where applicable:** <which skill / file / pattern>
   ```
5. Open the PR with the mandatory "See it work in 60 seconds" section:
   - Playwright command to reproduce (before fix: fails; after fix: passes)
   - File pointer to the regression test
   - Manual reproduction steps

**Artifact:** PR with "See it work" section.

**Gate (human):** developer follows the "See it work" path. If the bug still reproduces, PR is rejected.

---

## Phase-failure handling

Same as feature workflow:
- If any automated gate fails → halt, update STATUS.md, ask developer.
- If a human gate is rejected → update the artifact with feedback, re-enter the phase.
- **If fix takes >2 attempts at any phase → STOP.** The bug may be deeper than it appears. Ask the developer for guidance.

---

## Pitfalls specific to bug fixes

- **Symptom vs root cause.** A fix that suppresses the visible error but doesn't address the underlying logic will re-emerge. The regression test must assert the *correct behavior*, not just "no error."
- **Inherited slop.** If the bug was caused by a slop pattern (e.g., "TS literal-union without schema enum"), the fix must address the slop, not work around it. Check SLOP-CHECKLIST.
- **Data-dependent bugs.** If the bug only appears with specific data (null values, empty arrays, Unicode, large payloads), the regression test must seed that exact data shape.
- **Multi-tenant leaks.** A bug that manifests under one tenant but not another is a multi-tenancy violation. Check `generateModels(subdomain)` usage.
- **Cross-plugin cascades.** A fix in plugin A might affect plugin B via federation. Check cross-plugin contracts.

## Slop check before declaring done

- [ ] Re-read [`../SLOP-CHECKLIST.md`](../SLOP-CHECKLIST.md)
- [ ] No comments restating code
- [ ] No "just in case" defaults
- [ ] No try/catch around code that can't fail
- [ ] Regression test seeds its own data — no `test.skip(true, 'pending …')` without a named blocking wish
- [ ] PR body includes "See it work in 60 seconds" section
- [ ] `memory/lessons.md` updated with this bug's lesson
- [ ] Diff is minimal — fix only, no drive-by changes
