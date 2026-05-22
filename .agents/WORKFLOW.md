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

## Status state machine (the only legal `Status:` values)

A wish's `Status:` field in `WISH.md` may take **only** these values, in order:

| Status | Set when | Required artifact |
|---|---|---|
| `captured` | Phase 0 complete | `WISH.md` exists, ambiguities resolved |
| `routed` | Phase 1 complete | `WISH.md` has a `## Routing` section |
| `speced` | Phase 2 complete (developer approved) | `SPEC.md` with Test-coverage matrix filled |
| `grounded` | Phase 3 complete | `GROUND.md` exists, Read-tool calls ≥ files listed |
| `planned` | Phase 4 complete | `PLAN.md` exists, atomic commits ordered |
| `implementing` | Phase 5 in progress | branch `feat/<wish-id>` exists; commits landing |
| `verified` | Phase 6 complete | `EVAL.log` exists; behavior-coverage floor met |
| `pr-open` | Phase 7 partly complete | `SHIP.md` exists with a real `gh pr view`-verifiable URL |
| `shipped` | After merge | the merge commit on `main` references the PR |
| `aborted` | Wish abandoned mid-flow | `STATUS.md` with abort reason |
| `halted` | Wish blocked, may resume | `STATUS.md` with halt reason |

**Forbidden combinations** (these are the historical failure modes):

- ❌ `shipped` without a merge commit on `main`. AI never self-assigns `shipped`.
- ❌ `pr-open` without `SHIP.md`. The artifact is the proof.
- ❌ "shipped (awaiting PR open)" — there is no such state. `pr-open` is its own status.
- ❌ `verified` without `EVAL.log` or with every behavior-bucket criterion skipped against one wish.

The status is a **claim about reality**. If reality disagrees (`gh pr view` 404s, the merge commit doesn't exist), reality wins and the AI fixes the status.

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

**Goal:** execute the plan, one atomic commit at a time, with a captured audit trail.

**Branch:** create the feature branch as `feat/<wish-id>` (e.g., `feat/2026-05-22-deal-confidence-score`). The date-stamped form avoids collisions with abandoned-PR branches that may still exist locally — see lesson "Branch name collision with abandoned-PR branches blocks fresh-wish retries."

**AI does:**
For each commit in PLAN.md:
1. Make the edits.
2. Run `.agents/evals/run.sh sales` (or `evals/run.sh sales --backend-only` for backend-only commits — see `evals/run.sh --help`).
3. **Append the result to `.agents/wishes/<id>/EVAL.log`** in the format:
   ```
   <commit-N>  <ISO-timestamp>  <exit-code>  <command>  <short-summary-or-error-snippet>
   ```
   One line per run. This file is the audit trail that Phase 7 reads.
4. If exit 0 → `git add -A && git commit -m "<message from PLAN>"` then proceed to next.
5. If non-zero → fix the failure. **Every retry adds a new line to EVAL.log** (so the iteration count is visible). If fix takes >2 attempts, **stop and ask**.

After all commits, run `.agents/evals/run.sh sales` with full default (no `--*-only` flags). Must exit 0. Append the final aggregate line to EVAL.log.

**Artifacts:**
- Commits in the working tree.
- `.agents/wishes/<id>/EVAL.log` — exit-line per commit + final aggregate. **Required for Phase 7.**

**Gates (automatic):**
- Every commit must leave the repo in a buildable state (eval exit 0).
- EVAL.log has at least one line per commit listed in PLAN.md.

**Slop prevented:**
- Broken intermediate states; "I'll fix it later."
- **Self-narrated "I ran the eval on every commit" with no audit trail.** EVAL.log makes the per-commit gate auditable, not narrated.

---

## Phase 6 — VERIFY

**Goal:** ship a Playwright spec that **proves** user-visible behavior end-to-end, runnable from `evals/run.sh sales --include-e2e`. The spec is the deliverable, not the click-around demo.

**AI does:**
1. Open `.agents/plugins/sales/tests/`. Find the spec covering the affected module.
2. **Classify every SPEC.md acceptance criterion** into one of two buckets in SPEC.md's Test-coverage matrix:
   - **Wiring** — provable without seeded data: a label exists in a menu, a URL param updates, a network call fires with the right variables, an input has the right `min`/`max` attribute.
   - **Behavior** — requires seeded data: "the saved deal exposes the value," "the filter actually hides deals," "the validation rejects the write."
3. For each criterion write a Playwright test in the matching form:
   - **Wiring** → a live test gated only by `AGENT_TEST_LIVE=1` (the stack must be running, no seeding needed). These **must not** skip on the named-blocking-wish marker — they have no seed dependency.
   - **Behavior** → a test that **seeds its own fixtures via API** (GraphQL mutations) in `test.beforeAll` and tears down in `test.afterAll`. See [`docs/sales/playwright-fixtures.md`](./docs/sales/playwright-fixtures.md).
4. Use the eval-files header convention (see `.agents/README.md`).
5. Run the spec: `cd .agents && AGENT_TEST_LIVE=1 pnpm test plugins/sales/tests/<file>.spec.ts`. **Every** non-skipped test must pass.
6. Commit the test changes.

**Behavior-coverage floor (the loophole closer).** A wish cannot move past Phase 6 if **all** of its behavior-bucket criteria are skipped. Concretely:

- ✅ **At least one behavior-bucket test must be non-skipped** (i.e., must actually seed and execute against a live stack).
- ✅ The seeder lives **inside the spec** (or in `.agents/plugins/sales/tests/fixtures.ts` once a real second caller exists). It is not deferred to a downstream wish.
- ❌ If no behavior test is feasible without infrastructure that doesn't exist yet, **the wish has discovered a blocking infra dependency** — STOP and tell the developer. Do not ship a wish whose entire behavior surface is unverified.

**No-skip rule.** `test.skip(true, 'pending seeded deal')` is **forbidden**. Three forms are acceptable, **in this preference order**:

1. **Wiring test gated on `AGENT_TEST_LIVE`** — for criteria that are wiring-bucket. The skip-on-no-live-stack is structural (no live stack → cannot run the host UI assertion); when `AGENT_TEST_LIVE=1` it must pass.
2. **Behavior test that seeds its own fixtures** — for criteria that are behavior-bucket. **Preferred for at least one criterion per wish.**
3. **`test.skip(true, 'BLOCKED on wish <id>')` with a named follow-up wish** — *only for criteria that cannot be seeded inline today AND the wish has at least one passing behavior test elsewhere*. The blocking wish must exist as a real `.agents/wishes/<id>/WISH.md`. **Using this for every behavior criterion in a wish is the historical cop-out — Phase 6 rejects that pattern.**

If the dev stack isn't running, wiring tests fail loudly with "stack not running" — not silently skip. The test still exists as a runnable contract.

**Artifact:** updated/new spec at `.agents/plugins/sales/tests/<file>.spec.ts` with every non-skipped test passing against a running stack, plus the SPEC.md Test-coverage matrix.

**Gate (automatic):**
- Every SPEC.md acceptance criterion maps to at least one test.
- Every wiring-bucket criterion has a non-skipped, passing test.
- **At least one behavior-bucket criterion has a non-skipped, passing test that seeds its own data.**
- Every skip references a real follow-up wish.

**Slop prevented:**
- "Code compiles → it works" (the original slop)
- "I wrote tests but they all skip with `pending seeded deal`" (the cop-out slop — far more common in practice)
- **"I named a blocking wish so every skip is legal" (the meta-cop-out — the named-blocking-wish marker is the floor's exception, not its default).**

---

## Phase 7 — REVIEW + SHIP

**Goal:** self-review, capture lessons, open PR with an executable "see it work" path, **and produce a `SHIP.md` artifact carrying the live PR URL**. The wish does not reach status `pr-open` until the URL exists.

**AI does:**
1. Copy `.agents/templates/REVIEW.md` to `.agents/wishes/<id>/REVIEW.md`.
2. `git diff main...HEAD` — read every line.
3. Walk through `.agents/SLOP-CHECKLIST.md`, item by item. For each, note "clean" or "fixed".
4. If you learned something non-obvious during the wish, append a lesson to `.agents/memory/lessons.md` per its format.
5. Push the branch: `git push -u origin <branch>` (or confirm it's already up to date).
6. Open the PR — **this step is the gate, not a narration**:
   - `gh pr create --title "<title>" --body-file <(cat <<'EOF' … EOF)` (or `--body-file .agents/wishes/<id>/PR-BODY.md` if you drafted the body to disk first).
   - Capture the printed URL.
   - If `gh pr create` fails (auth, no remote, branch already has a PR, etc.) → **STOP. Do not write SHIP.md.** Report the error verbatim.
7. Write `.agents/wishes/<id>/SHIP.md` carrying the URL, PR number, HEAD SHA, and timestamp. The wish status flips to `pr-open` **only after this file exists with a real URL**.
8. Update `.agents/wishes/<id>/STATUS.md` (or the `Status:` line in WISH.md) to `pr-open`. Status `shipped` is reserved for after the merge commit lands on `main` — the AI does not self-assign it.

### Mandatory "See it work" section (Phase 7 deliverable)

The PR body MUST include this section. No exceptions.

```markdown
## See it work in 60 seconds

**Stack running** (`pnpm dev:apis && pnpm dev:uis`):
\`\`\`bash
AGENT_TEST_LIVE=1 .agents/evals/run.sh sales --include-e2e
\`\`\`
Expected: all <N> tests pass. The spec seeds its own fixtures, so no manual prep.

**Reading only** (no stack):
- Open [`.agents/plugins/sales/tests/<file>.spec.ts`](link) — every contracted behavior is in a `test()` block with the user-visible flow scripted.

**Manual path** (for visual confirmation):
1. `<step 1 — exact URL or click>`
2. `<step 2>`
3. `<step 3>`
Expected: `<one-sentence visual outcome>`
```

The "Manual path" must be runnable by someone unfamiliar with the wish in under 60 seconds.

**Artifacts:**
- PR opened on GitHub with the "See it work" section filled in.
- `.agents/wishes/<id>/SHIP.md` — contains the PR URL, PR number, HEAD SHA, timestamp. **This file is the proof Phase 7 ran.** No SHIP.md → wish is not shippable, regardless of what status is narrated elsewhere.
- `.agents/wishes/<id>/PR-BODY.md` is the body that was posted (kept in the wish folder, not just in stdout).

**Gates:**
- **Automatic:** SHIP.md exists *and* the URL inside it resolves (200 from `gh pr view <url>`). If either fails, Phase 7 has not completed.
- **Human:** developer follows the "See it work" path. If it doesn't reproduce the behavior, PR is rejected — Phase 6 was inadequate.

**Slop prevented:**
- Unreviewed AI confidence reaching main
- "I tested it locally, trust me" — the deliverable is a reproducible path, not a claim
- **Self-declared "shipped" without a PR URL** — the historical failure mode of WISH.md saying `Status: shipped (awaiting PR open)` is now impossible: `shipped` requires a merge SHA, `pr-open` requires SHIP.md.

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
