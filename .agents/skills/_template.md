# `<verb> <noun>` — skill template

> The shape every skill in `.agents/skills/sales/` follows. **Do not invoke this file directly.** It documents the contract; concrete skills sit alongside it in `sales/`.

A skill is a task playbook the AI loads in Phase 1 (ROUTE) of [`../WORKFLOW.md`](../WORKFLOW.md) and executes across Phases 3–6. Every skill has the same five sections below, in order.

---

# `<verb> <noun>`

> **When to use:** <one-line trigger — the wish shape this skill solves>

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

For this skill, the natural sisters are: `<concrete feature A — with file path>`, `<concrete feature B — with file path>`, `<concrete feature C — with file path>`.

**Read these files in full** before writing any code:
- `<absolute or repo-relative path>`
- `<absolute or repo-relative path>`
- ...

Why: generation from convention is forbidden ([`../rules/00-orientation.md`](../rules/00-orientation.md)). You mirror precedent.

## Phase 4 — PLAN

Atomic commits, ordered. Default plan for this skill:

1. **<commit 1 subject>** — files: `<file>`, `<file>`
2. **<commit 2 subject>** — files: `<file>`
3. ...

Each commit ≤ ~50 LOC, independently buildable. Tune to the specific wish.

## Phase 5 — IMPLEMENT (step-by-step)

For each commit:
1. <specific action — what edit to make, what to reference from the sister>
2. <next action>
3. Run `.agents/evals/run.sh sales` (or `--backend-only` for backend-only commits — see [`../evals/run.sh`](../evals/run.sh)). Must exit 0.

## Phase 6 — VERIFY

Add or modify the Playwright spec at `.agents/plugins/sales/tests/<file>.spec.ts` so that:
- <acceptance criterion 1>
- <acceptance criterion 2>

Run: `cd .agents && pnpm test plugins/sales/tests/<file>.spec.ts`

## Pitfalls (specific to this skill)

- <pitfall the sister doesn't fully prevent>
- <pitfall specific to this change shape>

## Slop check before declaring done

- [ ] Re-read [`../SLOP-CHECKLIST.md`](../SLOP-CHECKLIST.md)
- [ ] No comments restating code
- [ ] No "just in case" defaults
- [ ] No try/catch around code that can't fail
- [ ] No helper extracted for a single caller
