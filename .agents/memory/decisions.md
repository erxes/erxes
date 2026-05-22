# Decisions (ADR-lite)

> Record of "why we do X this way." Append-only. Each entry: date + decision + reason + alternative considered.

## Format

```markdown
## YYYY-MM-DD — <decision title>
**Decision:** what we do.
**Reason:** why.
**Alternative considered:** what we rejected and why.
**Stakeholder:** who approved (optional).
```

---

## 2026-05-22 — `.agents/` is the canonical AI grounding (not CLAUDE.md / AGENTS.md / .cursorrules)
**Decision:** `.agents/` directory at repo root is the single authoritative source for AI tools. Top-level memory files exist only to redirect.
**Reason:** Three separate 30KB+ memory files were drifting; no AI tool could find sales-specific guidance without skimming everything. One entry point, structured navigation, prevents drift.
**Alternative considered:** Consolidate into a single huge CLAUDE.md. Rejected because that file is already 34KB and AI tools skim past it.
**Stakeholder:** Amartuvshin.

## 2026-05-22 — 7-phase workflow for shipping Sales features
**Decision:** Every customer-facing Sales feature ships via the WORKFLOW.md 7-phase pipeline (WISH → ROUTE → SPEC → GROUND → PLAN → IMPLEMENT → VERIFY → REVIEW+SHIP).
**Reason:** Documentation alone doesn't prevent slop. Phase gates that AI cannot skip do. The pattern is proven (GSD, Devin, Aider TDD, BMAD).
**Alternative considered:** Pure skill-invocation model (developer picks a skill). Rejected because it misses orchestration and verification gates between phases.
**Stakeholder:** Amartuvshin.

## 2026-05-22 — Sales-first; expand only after validation
**Decision:** The shipping system is built and tested for Sales only. Other plugins receive the pattern after sales has shipped ≥3 features and captured ≥1 lesson.
**Reason:** Bulk replication produces shallow boilerplate. One plugin at a time, validated by real PRs, prevents codifying a broken pattern across the monorepo.
**Alternative considered:** Build for all 11 plugins in parallel. Rejected — premature.

## 2026-05-22 — Mirror-precedent is the default in every skill
**Decision:** Every skill's first step is "find the most similar existing feature, read in full, mirror." Generation from convention is forbidden.
**Reason:** The single highest-leverage anti-slop intervention. Grounded in real code, not hopeful documentation.
**Alternative considered:** Generation-from-templates. Rejected — produces shallow code that doesn't match local conventions.

## 2026-05-22 — Playwright runner lives inside `.agents/`
**Decision:** `.agents/package.json` + `.agents/playwright.config.ts` define a separate npm workspace, not part of the Nx graph.
**Reason:** Keeps agent tooling self-contained. Doesn't pollute the monorepo's lockfile, doesn't drag Playwright into every CI job.
**Alternative considered:** Root-level Playwright. Rejected — too entangled.

---

(append new entries below this line, dated, with reason + alternative)
