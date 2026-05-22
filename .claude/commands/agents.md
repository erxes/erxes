---
description: Help — show every .agents/ slash command + what they do
allowed-tools: Read, Bash
---

# /agents — system overview

You are showing the developer (and reminding yourself) what the `.agents/` AI shipping system is and what slash commands are available.

## What to do

1. Read `.agents/README.md` to confirm the layout is current.
2. Print this overview:

```
.agents/ — AI shipping system for erxes (sales-scoped)

Slash commands (type any of these in chat):

  /sales "<wish>"     Run a Sales feature wish through the 7-phase workflow.
                      Phase 0 WISH → Phase 7 SHIP. Three human gates.
                      Foundation: .claude/commands/sales.md.

  /wishes             List every .agents/wishes/<id>/ with current phase.
                      Dashboard view. No code changes.

  /wish <id>          Show detail of one wish — artifacts, phase, next step.

  /agents             This help. Lists every slash command.

System files (loaded automatically when relevant):

  .agents/SYSTEM-PROMPT.md   Constitution. 16 hard rules. Read first.
  .agents/WORKFLOW.md        7-phase definition.
  .agents/SLOP-CHECKLIST.md  Forbidden patterns. Re-read before declaring done.
  .agents/memory/lessons.md  Past mistakes — read at session start.
  .agents/skills/sales/      7 task playbooks (add-deal-field, etc.).
  .agents/docs/sales/        Deep-dives (plugin map, data model, federation).
  .agents/plugins/sales/     File inventory + Playwright behavioral specs.
  .agents/evals/run.sh       The 'done' oracle: `.agents/evals/run.sh sales`.

For tools without slash command support (Cursor, Codex CLI, Copilot, etc.):
the user types the wish directly; your convention file (CLAUDE.md /
AGENTS.md / GEMINI.md / .cursorrules / .clinerules / CONVENTIONS.md /
.github/copilot-instructions.md) routes you to .agents/WORKFLOW.md.
```

3. If the developer asks "what should I do?" — recommend `/sales "<their wish>"`.
4. If they don't have a wish yet — show what's in `.agents/wishes/` via `/wishes`.

## What NOT to do

- Don't write any files.
- Don't propose code changes.
- Don't talk about the deleted CLI (`pnpm agents`, `erxes-wish`) — those are gone.
