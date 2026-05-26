# Feature Workflow — 7 Phases

> The pipeline that turns a developer's wish into a shipped customer-facing feature without slop.

This file is the definition. The orchestrators at `.claude/commands/<plugin>.md` are the executables (e.g., `sales.md`, `frontline.md`, `operation.md`).

## At a glance

```
0 WISH  → 1 ROUTE → 2 SPEC  → 3 GROUND → 4 PLAN  → 5 IMPLEMENT → 6 VERIFY → 7 REVIEW+SHIP
  ↓        ↓        ↓         ↓         ↓         ↓             ↓          ↓
human    AI       human     AI        AI        AI            AI         human
checkpoint        gate                                                    gate
```

Three human checkpoints. Everything else has automated gates AI cannot skip.

## Phase 0 — WISH

**Goal:** capture the developer's intent unambiguously.

**Trigger:** `/<plugin> "<wish>"` (e.g., `/sales`, `/frontline`, `/accounting`)

**AI does:**
1. Generate a wish ID: `YYYY-MM-DD-<slug>` (e.g., `2026-05-22-deal-priority`)
2. `mkdir .agents/wishes/<id>/`
3. Copy `.agents/templates/WISH.md` to `.agents/wishes/<id>/WISH.md`
4. Fill in the captured wish.
5. If anything is ambiguous, ASK 1–3 clarifying questions. **Do not proceed until they're answered.**
6. Update WISH.md with the answers.

**Artifact:** `.agents/wishes/<id>/WISH.md` — the disambiguated wish.

**Gate (human):** developer confirms "yes that's what I meant."

**Slop prevented:** AI implementing the wrong feature confidently.

**Common ambiguity to ask about:**
- Boolean vs enum vs free-text
- Where it's visible (card / detail / list / multiple)
- Affects sorting/filtering or just display
- Required vs optional, default value
- Only sales managers can edit, or everyone with deal access?

### Bug-fix routing (parallel workflow)

If the wish is a **bug report** (contains `fix`, `bug`, `issue`, `error`, `broken`, `crash`, etc. — detected by `erxes-wish --fix` or auto-detection), the workflow diverges here:

→ **Follow [`skills/fix-issue.md`](./skills/fix-issue.md) instead of Phases 1–7 below.**

The bug-fix workflow has its own parallel phases: REPORT → TRIAGE → BUG-SPEC → BUG-GROUND → PLAN → FIX → VERIFY → REVIEW. It mirrors the same gated structure (human checkpoints, mandatory grounding, regression-test-first) but is adapted for root-cause analysis instead of feature design.

**Key differences from the feature workflow:**
- Phase 2 produces a `BUG-SPEC.md` (observed vs expected behavior, root cause hypothesis) instead of a `SPEC.md`
- Phase 3 produces a `BUG-GROUND.md` (traces the original feature implementation) instead of a `GROUND.md` (finds sister features)
- Phase 4 PLAN commits in regression-test-first order: failing test → fix → docs
- Phase 7 REVIEW **always** adds a `memory/lessons.md` entry for every bug fix

---

## Phase 1 — ROUTE

**Goal:** decide if this wish fits a known shape, and which skill to use.

**AI does:**
1. Read `.agents/skills/<plugin>/` index — review each skill's "When to use" header.
2. Decide:
   - **Fits an existing skill** → name it (e.g., `skills/<plugin>/<matched-skill>.md`)
   - **NOVEL** — the wish doesn't fit any skill cleanly
3. Append routing decision to `WISH.md` under `## Routing`.

**Artifact:** updated `WISH.md` with routing.

**Gate (automatic):**
- If routed to a skill → proceed to Phase 2.
- If NOVEL → **STOP.** Append: "This wish does not fit an existing skill. Need a human design pass before code." Ask developer: should we (a) create a new skill first, (b) treat as one-off and proceed without skill, or (c) reshape the wish to fit an existing skill?

**Slop prevented:** AI confidently implementing something outside its competence.

---

## Phase 2 — SPEC

**Goal:** define "done" before any code.

**AI does:**
1. Copy `.agents/templates/SPEC.md` to `.agents/wishes/<id>/SPEC.md`.
2. Fill in:
   - **User-visible behavior:** what the user sees / does
   - **API contract changes:** new GraphQL fields/mutations/queries, new tRPC procedures, new REST routes
   - **Data model changes:** new fields on existing entities
   - **UI changes:** new components, modified forms, new routes
   - **Acceptance criteria:** numbered list (e.g., "1. User can set Deal priority to low/medium/high. 2. Priority appears on deal card. 3. Priority persists across page reload.")
   - **Out of scope:** explicit list of what this SPEC does NOT change

**Artifact:** `.agents/wishes/<id>/SPEC.md`.

**Gate (human):** developer approves SPEC. Specifically the acceptance criteria — those become Phase 6 verification.

**Slop prevented:** "done" being redefined to whatever AI managed to produce.

---

## Phase 3 — GROUND

**Goal:** find precedent. Read it in full. Decide what to mirror.

**AI does:**
1. Read the routed skill's "Mirror an existing feature" section.
2. Identify 1–2 sister features in the target plugin's codebase. (For "add a Deal field" — `name`, `amount`, `closeDate`, `priority`-shape-fields if any exist.)
3. **Read every file the sister feature touches, in full.** No skimming.
4. Copy `.agents/templates/GROUND.md` to `.agents/wishes/<id>/GROUND.md`. Fill in:
   - Sister features chosen
   - Why these sisters (closest in shape: same data type, same UI surface, same automation hooks)
   - Files read (with Read-tool call count — provable)
   - Files to edit, mapped from each sister's edits
   - Files to create (if any)

**Artifact:** `.agents/wishes/<id>/GROUND.md`.

**Gate (automatic):** Read-tool calls ≥ number of files listed in "Files read." AI cannot proceed if it lied about reading.

**Slop prevented:** generation from convention instead of mirroring precedent. **This is the single highest-leverage anti-slop step.**

---

## Phase 4 — PLAN

**Goal:** break the work into atomic commits.

**AI does:**
1. Copy `.agents/templates/PLAN.md` to `.agents/wishes/<id>/PLAN.md`.
2. Order the edits into commits. Each commit must be:
   - ≤ ~50 LOC of changes
   - One logical change (e.g., "add field to schema" is one; "add field to schema + UI form + tests" is three)
   - Independently buildable (commit N can be checked out and built without commit N+1)
3. For each commit, list the files touched and a one-line commit message.

**Artifact:** `.agents/wishes/<id>/PLAN.md` with ordered commits.

**Gate (automatic):**
- Commits ≤ 50 LOC each (you'll know after Phase 5; if you blow the budget, halt and re-plan).
- Independent buildability — `evals/run.sh <plugin>` must pass after each commit, not just at the end.

**Slop prevented:** big-bang refactors that no human can review.

---

## Phase 5 — IMPLEMENT

**Goal:** execute the plan, one atomic commit at a time.

**AI does:**
For each commit in PLAN.md:
1. Make the edits.
2. Run `.agents/evals/run.sh <plugin>` (or `evals/run.sh <plugin> --backend-only` for backend-only commits — see `evals/run.sh --help`).
3. If exit 0 → `git add -A && git commit -m "<message>"` then proceed to next.
4. If non-zero → fix the failure. If fix takes >2 attempts, **stop and ask**.

**Artifact:** commits in the working tree.

**Gate (automatic):** every commit must leave the repo in a buildable state.

**Slop prevented:** broken intermediate states; "I'll fix it later."

---

## Phase 6 — VERIFY

**Goal:** ship a Playwright spec that **proves** user-visible behavior end-to-end, runnable from `evals/run.sh <plugin> --include-e2e`. The spec is the deliverable, not the click-around demo.

**AI does:**
1. Open `.agents/plugins/<plugin>/tests/`. Find the spec covering the affected module.
2. For **every** SPEC.md acceptance criterion, write a Playwright test that:
   - **Seeds its own fixtures via API** (GraphQL mutations or REST calls — not via UI). Need a deal? Create board → pipeline → stage → deal in `test.beforeAll`. Don't rely on pre-existing data.
   - **Executes the user-visible flow** (navigate, click, type, observe).
   - **Asserts the user-visible outcome** (text content, color class, URL, count).
   - **Tears down fixtures** in `test.afterAll` to keep runs idempotent.
3. Use the eval-files header convention (see `.agents/README.md`).
4. Run the spec: `cd .agents && pnpm test plugins/<plugin>/tests/<file>.spec.ts`. **Every** non-skipped test must pass.
5. Commit the test changes.

**No-skip rule.** `test.skip(true, 'pending seeded deal')` is **forbidden**. Two acceptable forms only:
- A test that seeds its own fixtures (preferred — write the seeder).
- A `test.skip(true, '<reason>')` with a **named follow-up wish**: e.g., `'BLOCKED on wish 2026-06-01-test-auth-fixture'`. The blocking wish must exist as a real `.agents/wishes/<id>/WISH.md` before the skip is accepted.

If the dev stack isn't running, the test should **fail loudly** with "stack not running" — not silently skip. The test still exists as a runnable contract.

**Artifact:** updated/new spec at `.agents/plugins/<plugin>/tests/<file>.spec.ts` with every non-skipped test passing against a running stack.

**Gate (automatic):** every SPEC.md acceptance criterion has at least one **non-skipped** test that passes (or a skip pointing at a real follow-up wish).

**Slop prevented:**
- "Code compiles → it works" (the original slop)
- "I wrote tests but they all skip with `pending seeded deal`" (the cop-out slop — far more common in practice)

---

## Phase 7 — REVIEW + SHIP

**Goal:** self-review, capture lessons, open PR with an executable "see it work" path.

**AI does:**
1. Copy `.agents/templates/REVIEW.md` to `.agents/wishes/<id>/REVIEW.md`.
2. `git diff main...HEAD` — read every line.
3. Walk through `.agents/SLOP-CHECKLIST.md`, item by item. For each, note "clean" or "fixed".
4. If you learned something non-obvious during the wish, append a lesson to `.agents/memory/lessons.md` per its format.
5. Open the PR:
   - Title: derived from SPEC's user-visible behavior
   - Body: fill `.github/PULL_REQUEST_TEMPLATE.md`, including the **"See it work"** section (see below — mandatory)
   - Reference the wish: link `.agents/wishes/<id>/`

### Mandatory "See it work" section (Phase 7 deliverable)

The PR body MUST include this section. No exceptions.

```markdown
## See it work in 60 seconds

**Stack running** (`pnpm dev:apis && pnpm dev:uis`):
\`\`\`bash
AGENT_TEST_LIVE=1 .agents/evals/run.sh <plugin> --include-e2e
\`\`\`
Expected: all <N> tests pass. The spec seeds its own fixtures, so no manual prep.

**Reading only** (no stack):
- Open [`.agents/plugins/<plugin>/tests/<file>.spec.ts`](link) — every contracted behavior is in a `test()` block with the user-visible flow scripted.

**Manual path** (for visual confirmation):
1. `<step 1 — exact URL or click>`
2. `<step 2>`
3. `<step 3>`
Expected: `<one-sentence visual outcome>`
```

The "Manual path" must be runnable by someone unfamiliar with the wish in under 60 seconds.

**Artifact:** PR opened on GitHub with the "See it work" section filled in.

**Gate (human):** developer follows the "See it work" path. If it doesn't reproduce the behavior, PR is rejected — Phase 6 was inadequate.

**Slop prevented:**
- Unreviewed AI confidence reaching main
- "I tested it locally, trust me" — the deliverable is a reproducible path, not a claim

---

## Phase-failure handling

If any automated gate fails:
- Halt the workflow at the current phase.
- Update `.agents/wishes/<id>/STATUS.md` with the failure mode and what was tried.
- Tell the developer what's broken and ask for direction.

If a human gate is rejected:
- Update the artifact (WISH/SPEC) with their feedback.
- Re-enter the phase. Do not silently proceed.

## Aborting a wish

If a wish proves infeasible mid-workflow:
1. Update `WISH.md` with the abort reason.
2. `git reset --hard <commit-before-Phase-5>` if Phase 5 work was committed (after dev approval — destructive op).
3. Leave the `.agents/wishes/<id>/` directory as a record. Future AI can read it as a lesson.
