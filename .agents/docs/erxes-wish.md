# `erxes-wish` — developer guide

Tool-agnostic prompt enhancer that turns a casual wish ("add a riskLevel field to deals") into a complete, disciplined briefing prompt — embedding the constitution, workflow, recent lessons, and the right skill from `.agents/` — that you paste into any AI coding tool.

## Why this exists

`.agents/` is a structured AI grounding system: rules, memory, skills, docs, evals. The system works **if AI knows to read it**. Two failure modes:

1. **AI tool reads convention files but doesn't act on routing.** The shrunk `CLAUDE.md` / `AGENTS.md` / `.cursorrules` etc. point at `.agents/SYSTEM-PROMPT.md`, but AI may skim and act on instinct anyway.
2. **AI tool ignores convention files entirely** (e.g., ChatGPT web, a freshly opened Claude.ai chat, Codex without project context).

`erxes-wish` solves both: it constructs the briefing **at prompt-construction time**, so AI receives the constitution + workflow + relevant skill embedded in its first message. No retrieval logic needed inside AI.

## When to use it

| Situation | Use `erxes-wish`? |
|---|---|
| Asking AI to add a Sales field / page / mutation / automation | **Yes** — this is the canonical use case |
| Asking AI a question about the codebase (no code change) | No — just ask, the AI's convention file is enough |
| Asking AI to fix a bug in Sales | Yes if it routes to an existing skill; otherwise it'll halt with "wish is novel" |
| Asking AI to touch a non-sales plugin | Yes — it'll halt with "sales-only today," which is the correct guard |
| Refactoring with no user-visible change | No — refactors don't fit the workflow; do them manually |

## Setup

If you're working in the erxes repo, **none**. The script is wired into root `package.json` as a pnpm script.

If you want zero-typing shortcuts, see [Shell shortcuts](#shell-shortcuts) below.

## Quick start

```bash
pnpm --silent erxes-wish "add a riskLevel enum to deals (low/medium/high, default low)" | pbcopy
```

Paste into Cursor / ChatGPT / Codex / Claude / Gemini. AI now has everything it needs to follow the 7-phase workflow.

## Using it with each AI tool

### Claude Code (CLI / desktop)
```bash
pnpm --silent erxes-wish "<wish>" | claude
```
Or `pbcopy` and paste into the chat box. Claude Code also has `/sales "<wish>"` as a native skill that does the same thing — both work.

### Cursor
```bash
pnpm --silent erxes-wish "<wish>" | pbcopy
```
Cmd+L to open chat, Cmd+V to paste, Enter.

### Codex CLI
```bash
pnpm --silent erxes-wish "<wish>" | codex
```

### GitHub Copilot Chat (VS Code)
```bash
pnpm --silent erxes-wish "<wish>" | pbcopy
```
Open Copilot Chat panel, paste, send.

### Gemini CLI
```bash
pnpm --silent erxes-wish "<wish>" | gemini
```

### ChatGPT / Claude.ai (browser)
```bash
pnpm --silent erxes-wish "<wish>" | pbcopy
```
Paste into the chat. Works in any browser-based AI.

### Aider
```bash
pnpm --silent erxes-wish "<wish>" > /tmp/wish.md
aider --message-file /tmp/wish.md
```

## Flags & subcommands

```bash
pnpm --silent erxes-wish --help                       # show all flags

# Subcommands — tracking & inspection
pnpm --silent erxes-wish --list                       # dashboard of in-flight wishes
pnpm --silent erxes-wish --show <wish-id>             # detail view of one wish

# Output control on briefing assembly
pnpm --silent erxes-wish "<wish>"                     # full briefing (default)
pnpm --silent erxes-wish "<wish>" --no-lessons        # skip lessons.md inline (smaller)
pnpm --silent erxes-wish "<wish>" --no-system-prompt  # skip constitution inline (smallest)

# Skill routing
pnpm --silent erxes-wish "<wish>" --skill add-deal-field             # force a specific skill
pnpm --silent erxes-wish "<wish>" --skill add-sales-graphql-query
pnpm --silent erxes-wish "<wish>" --skill add-sales-mutation
pnpm --silent erxes-wish "<wish>" --skill add-sales-ui-page
pnpm --silent erxes-wish "<wish>" --skill add-sales-automation
pnpm --silent erxes-wish "<wish>" --skill add-sales-segment-field
pnpm --silent erxes-wish "<wish>" --skill add-sales-trpc-procedure
```

**Why `--silent`?** Without it, `pnpm` emits a preamble (`> erxes-next@3.0.25 erxes-wish ...`) on stdout that contaminates the prompt when piped. Always use `--silent` for piping into AI tools or `pbcopy`.

## Tracking what's in flight

Every wish creates `.agents/wishes/<wish-id>/` as AI progresses through phases. Files appear as phases land: `WISH.md` (Phase 0) → `SPEC.md` (Phase 2) → `GROUND.md` (Phase 3) → `PLAN.md` (Phase 4) → `REVIEW.md` (Phase 7). A `STATUS.md` is written if AI halts.

### `--list` — dashboard view

```
$ pnpm --silent erxes-wish --list
─── erxes-wish --list (3 wish dirs) ────────────────────────
  ID                                      PHASE           UPDATED
  ──────────────────────────────────────  ──────────────  ──────────
  → 2026-05-23-deal-quoted-amount          3 GROUND        12m ago
  ⚠ 2026-05-22-deal-confidence-score       3 GROUND HALTED 2h ago
  ✓ 2026-05-22-deal-risk-level             7 REVIEW        3d ago
────────────────────────────────────────────────────────────
  Detail: pnpm --silent erxes-wish --show <id>
```

- `→` in progress
- `✓` shipped (Phase 7 complete)
- `⚠` halted (`STATUS.md` written)

### `--show <id>` — detail per wish

```
$ pnpm --silent erxes-wish --show 2026-05-23-deal-quoted-amount
─── erxes-wish --show 2026-05-23-deal-quoted-amount ────────
  Path: .agents/wishes/2026-05-23-deal-quoted-amount/
  Status: 3 GROUND (mapped)
  Last updated: 12m ago

  Artifacts:
    ✓ WISH.md      0 WISH       (captured, 25m ago)
    ✓ SPEC.md      2 SPEC       (drafted, 20m ago)
    ✓ GROUND.md    3 GROUND     (mapped, 12m ago)
    ✗ PLAN.md      4 PLAN
    ✗ REVIEW.md    7 REVIEW
────────────────────────────────────────────────────────────
```

Use this to answer "is the AI session still running?" or "where did it stop?" — the artifact files document the conversation history phase by phase. Open them directly with `cat .agents/wishes/<id>/SPEC.md` for the full content.

## Stderr status — confirmation every invocation

Every briefing assembly emits a status block to stderr (so it shows even when you pipe stdout to `pbcopy` or a file):

```
$ pnpm --silent erxes-wish "add a riskLevel field to deals" | pbcopy

─── erxes-wish ─────────────────────────────────────────────
  ✓ Briefing assembled for: "add a riskLevel field to deals"
    Plugin:   sales            (matched on "deal")
    Skill:    add-deal-field   (matched on "field")
    Lessons:  8 most recent embedded
    Total:    515 lines (~31.1 KB)
  ✓ Output piped → paste into your AI tool to begin Phase 0
  ℹ See active wishes: pnpm --silent erxes-wish --list
────────────────────────────────────────────────────────────
```

Tells you at a glance: scope was detected, skill was matched, prompt was assembled, output was piped. No more "did anything happen?" guessing.

For non-sales / unscoped wishes the block shows `⚠ STOP block emitted` so you know AI will halt before writing code.

## Anatomy of the generated prompt

Every prompt contains, in order:

1. **Header** — wish text + working directory.
2. **Scope detected** — which plugin matched (sales / operation / etc.), which skill likely fits, whether to halt.
3. **What you do now** — branching instructions depending on scope. If non-sales: STOP and report. If unscoped: STOP and ask. If sales: follow the workflow.
4. **`.agents/SYSTEM-PROMPT.md`** — the constitution inline (16 hard rules).
5. **`.agents/WORKFLOW.md`** — first 80 lines (7-phase definition).
6. **Recent lessons** — last 8 entries from `memory/lessons.md` so AI doesn't repeat captured mistakes.
7. **`.agents/SLOP-CHECKLIST.md`** — forbidden patterns inline.
8. **The routed skill in full** — if detected (`add-deal-field.md`, etc.).
9. **Reminder** — the workflow's bottom line: when unsure, STOP and ask.

Total length: ~500-800 lines depending on flags. Tested cleanly against AI context windows.

## Plugin scope detection

The CLI keyword-matches your wish against per-plugin vocab:

| Plugin | Trigger keywords |
|---|---|
| **sales** (supported) | sale, deal, pipeline, stage, board, kanban, checklist, pos, order, cover, ecommerce, wishlist, product review |
| operation | task, project, milestone, cycle, team |
| frontline | conversation, ticket, inbox, chat, message |
| accounting | invoice, ledger, journal |
| payment | payment, transaction, qpay, qr code |
| content | cms, article, post, page |
| insurance | policy, claim |
| loyalty | voucher, spin, donate |
| tourism | tour, booking |

If your wish matches **non-sales**, the CLI halts with "system is sales-only today" — that's the correct behavior. The `.agents/` workflow is only validated for sales; see [`EXTENDING.md`](../EXTENDING.md) for how to extend.

If your wish matches **nothing**, the CLI prompts AI to ask for clarification before any code.

## Skill detection

The CLI tries to identify the most likely skill from your wish. Triggers:

| Skill | Wish keywords |
|---|---|
| `add-deal-field` | "add X to deal", "new field", "add column" |
| `add-sales-graphql-query` | "add query", "graphql query" |
| `add-sales-mutation` | "add mutation", "bulk", "archive" |
| `add-sales-ui-page` | "add page", "dashboard", "screen", "route" |
| `add-sales-automation` | "automation", "trigger", "when X then Y" |
| `add-sales-segment-field` | "segment", "segment builder" |
| `add-sales-trpc-procedure` | "trpc", "cross-plugin call" |

If detection misses (or you want to override), pass `--skill <name>` explicitly.

## Examples

```bash
# Add a field to Deal
pnpm --silent erxes-wish "add a winProbability number (0-100) to deals, editable in detail sheet" | pbcopy

# Add a new dashboard page
pnpm --silent erxes-wish "show me a dashboard of deals closed this month grouped by owner" | pbcopy

# Add an automation
pnpm --silent erxes-wish "when a deal moves to Won stage, send a Slack notification" | pbcopy

# Force a specific skill if detection misses
pnpm --silent erxes-wish "create a tRPC procedure that returns deals for a customer" --skill add-sales-trpc-procedure | pbcopy

# Big prompt + paste later
pnpm --silent erxes-wish "<wish>" > /tmp/wish-prompt.md
# review with: less /tmp/wish-prompt.md
```

## Shell shortcuts (optional)

For developers running many wishes per day:

```bash
# In ~/.zshrc or ~/.bashrc
alias wish='cd "$(git rev-parse --show-toplevel)" && pnpm --silent erxes-wish'

# Or a function with auto-clipboard:
wish() {
  cd "$(git rev-parse --show-toplevel)" || return
  pnpm --silent erxes-wish "$@" | pbcopy
  echo "✓ Prompt copied to clipboard ($(pbpaste | wc -l) lines)"
}
```

Then from anywhere inside the repo: `wish "add a confidenceScore to deals"`.

## Limitations

- **Sales-only.** Other plugins halt with a STOP message. This is intentional — the workflow has only been validated for sales. See `EXTENDING.md`.
- **One plugin per wish.** Cross-plugin wishes (e.g., "deals automation that creates an operation task") detect both but pick the primary; the cross-plugin contract is documented in GROUND.md by AI.
- **Keyword detection is heuristic.** If your wish phrases things unusually, scope/skill detection may miss. Use `--skill` to force.
- **Lessons grow over time.** The prompt includes the 8 most recent entries from `lessons.md`. Older lessons aren't embedded but AI can read the full file at session start.
- **No persistent state.** Each invocation re-reads `.agents/` files fresh. No cache, no daemon.

## Troubleshooting

**`pnpm wish` runs Tcl/Tk's `wish`, not our CLI.** Use the full name: `pnpm --silent erxes-wish` (not `pnpm wish`). The collision with `/usr/bin/wish` on macOS was the original reason for naming it `erxes-wish`.

**Output has `> erxes-next@3.0.25 erxes-wish ...` lines at the top.** You forgot `--silent`. Always pipe through `--silent`.

**My wish was detected as the wrong skill.** Use `--skill <correct-skill>`. If a skill is consistently wrong, add a lesson to `.agents/memory/lessons.md` and (eventually) tune the keyword list in `.agents/bin/erxes-wish.mjs`.

**My wish targeted a non-sales plugin and the CLI halted.** That's correct. The workflow doesn't support other plugins yet. To extend: follow `.agents/EXTENDING.md` (one plugin at a time, validated by a real wish).

**Output is too long for my AI tool's context.** Try `--no-lessons` or `--no-system-prompt`. If still too long, AI tool's context is the bottleneck — consider Claude Code (huge context) or split the work across phases manually.

**Generated prompt cites a file that doesn't exist.** Either `.agents/` is out of date relative to the codebase, or a doc has drift. Capture as a lesson; fix the doc.

## Extending

- **Add a new plugin to detection.** Edit `PLUGIN_KEYWORDS` in `.agents/bin/erxes-wish.mjs`.
- **Add a new skill to detection.** Edit `SKILL_RULES` in `.agents/bin/erxes-wish.mjs`.
- **Add a new entry-point file** for a different AI tool? See `.agents/EXTENDING.md` for the pattern other entry-point files follow.
- **Tune the prompt structure.** The `lines.push(...)` block in `erxes-wish.mjs` is straightforward Node; edit and re-run.

The CLI is intentionally small (~250 lines, no deps). Keep it that way — if it grows, that's a sign the system is using the wrong primitive.

## Related

- [`.agents/SYSTEM-PROMPT.md`](../SYSTEM-PROMPT.md) — the constitution (16 hard rules)
- [`.agents/WORKFLOW.md`](../WORKFLOW.md) — the 7-phase Sales Workflow
- [`.agents/SLOP-CHECKLIST.md`](../SLOP-CHECKLIST.md) — forbidden patterns
- [`.agents/memory/lessons.md`](../memory/lessons.md) — captured failures (read at session start)
- [`.agents/skills/sales/`](../skills/sales/) — the 7 skill playbooks
- [`.agents/EXTENDING.md`](../EXTENDING.md) — how to add another plugin
