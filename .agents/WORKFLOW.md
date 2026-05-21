# Sales Workflow — 7 Phases

> The pipeline that turns a developer's wish into a shipped customer-facing feature without slop.

This file is the definition. The orchestrator at [`.claude/commands/sales.md`](../.claude/commands/sales.md) is the executable.

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

**Trigger:** `/sales "<wish>"`

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

---

## Phase 1 — ROUTE

**Goal:** decide if this wish fits a known shape, and which skill to use.

**AI does:**
1. Read `.agents/skills/sales/` index — review each skill's "When to use" header.
2. Decide:
   - **Fits an existing skill** → name it (e.g., `skills/sales/add-deal-field.md`)
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
2. Identify 1–2 sister features in the Sales codebase. (For "add a Deal field" — `name`, `amount`, `closeDate`, `priority`-shape-fields if any exist.)
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
- Independent buildability — `evals/run.sh sales` must pass after each commit, not just at the end.

**Slop prevented:** big-bang refactors that no human can review.

---

## Phase 5 — IMPLEMENT

**Goal:** execute the plan, one atomic commit at a time.

**AI does:**
For each commit in PLAN.md:
1. Make the edits.
2. Run `.agents/evals/run.sh sales` (or `evals/run.sh sales --backend-only` for backend-only commits — see `evals/run.sh --help`).
3. If exit 0 → `git add -A && git commit -m "<message>"` then proceed to next.
4. If non-zero → fix the failure. If fix takes >2 attempts, **stop and ask**.

**Artifact:** commits in the working tree.

**Gate (automatic):** every commit must leave the repo in a buildable state.

**Slop prevented:** broken intermediate states; "I'll fix it later."

---

## Phase 6 — VERIFY

**Goal:** prove user-visible behavior with a behavioral test.

**AI does:**
1. Open `.agents/plugins/sales/tests/`. Find the spec covering the affected module (e.g., `deals.spec.ts` for Deal changes).
2. Add or modify tests that cover every acceptance criterion from SPEC.md.
3. Use eval-files header convention (see `.agents/README.md`).
4. Run the spec: `cd .agents && pnpm test plugins/sales/tests/<file>.spec.ts`.
5. If it passes → commit the test changes.
6. If it fails → fix the test (if the test is wrong) or fix the code (if the code is wrong). Halt and ask if unsure which.

**Artifact:** updated/new `.agents/plugins/sales/tests/<file>.spec.ts` with passing run.

**Gate (automatic):** test exists, runs, passes; every SPEC.md acceptance criterion has at least one assertion.

**Slop prevented:** "code compiles → it works." The most common slop pattern.

---

## Phase 7 — REVIEW + SHIP

**Goal:** self-review, capture lessons, open PR.

**AI does:**
1. Copy `.agents/templates/REVIEW.md` to `.agents/wishes/<id>/REVIEW.md`.
2. `git diff main...HEAD` — read every line.
3. Walk through `.agents/SLOP-CHECKLIST.md`, item by item. For each, note "clean" or "fixed".
4. If you learned something non-obvious during the wish, append a lesson to `.agents/memory/lessons.md` per its format.
5. Open the PR:
   - Title: derived from SPEC's user-visible behavior
   - Body: fill `.github/PULL_REQUEST_TEMPLATE.md`
   - Reference the wish: link `.agents/wishes/<id>/`

**Artifact:** PR opened on GitHub.

**Gate (human):** developer reviews the PR. Merges or requests changes.

**Slop prevented:** unreviewed AI confidence reaching main.

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
