# 00 — Orientation

> Read this first. It tells you how to read everything else in `.agents/`.

## What `.agents/` is

The authoritative AI grounding for erxes. Five categories of files:

| Category | Purpose | Always loaded? |
|---|---|---|
| `SYSTEM-PROMPT.md`, `WORKFLOW.md`, `SLOP-CHECKLIST.md` | Constitution + process | **Yes, every session** |
| `rules/` (atoms) | Always-on conventions | Yes — load on session start |
| `memory/` (cells) | Stack, glossary, decisions, lessons | Yes — load on session start |
| `skills/sales/` (organs) | Task playbooks | On demand — when the wish maps to one |
| `docs/sales/` (molecules) | Reference deep-dives | On demand — referenced from skills |
| `plugins/sales/` | File map + Playwright tests | On demand — when finding files |
| `evals/` | Verification harness | On demand — at phase gates |
| `templates/` | Phase artifact templates | On demand — when running workflow |

**Precedence when sources conflict:** `SYSTEM-PROMPT.md` > `rules/` > `memory/lessons.md` > `skills/` > `docs/` > top-level memory files (CLAUDE.md, AGENTS.md, .cursorrules).

## Cross-reference convention

Pages link liberally via relative markdown. **Follow the link** instead of greedy-reading. If you find yourself opening five files to answer one question, the docs have a gap — fix it before continuing.

## When to break a rule

Almost never. If a rule looks wrong for the case at hand:

1. **Stop.** Don't ship a workaround silently.
2. Ask the developer: "Rule X says Y. The case I'm in suggests Z. Which applies?"
3. If the developer authorizes the deviation, **document the decision** in `memory/decisions.md` with the date and rationale.

Rules without `memory/decisions.md` support drift. Drift is slop.

## Anti-drift — where new conventions go

| If you want to add a... | Put it in... |
|---|---|
| New always-on rule | `rules/` (new file, numbered) |
| New decision/ADR | `memory/decisions.md` (append entry) |
| New lesson from a failure | `memory/lessons.md` (append entry) |
| New skill playbook | `skills/<plugin>/` |
| New deep-dive doc | `docs/<plugin>/` |
| New slop pattern | `SLOP-CHECKLIST.md` |

**Do not add new conventions to `CLAUDE.md`, `AGENTS.md`, or `.cursorrules`.** Those exist to point to `.agents/` and will drift if edited for new content.

## Compounding the AI use

Every time AI gets something wrong in this repo, capture it in [`memory/lessons.md`](../memory/lessons.md). The next session reads it first. Over weeks, this becomes the most valuable file in the directory — institutional scar tissue.

**A successful AI shipping system gets better with every feature shipped.** That's only true if lessons are captured. If you finish a feature and learned something non-obvious — about the codebase, about a precedent, about how to avoid a class of bug — you owe a lesson entry before declaring done.

## When unsure: stop and ask

The developer's wish is sacred. Granting it wrong is worse than asking another question. Slop is worse than slow.
