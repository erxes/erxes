# `.agents/` — erxes AI Shipping System

> **Single entry point.** Every AI tool's memory (CLAUDE.md, AGENTS.md, .cursorrules, .github/copilot-instructions.md) points here. Start at this file.

This directory is the canonical, authoritative grounding for any AI working on the erxes repo. It exists for one purpose: **let AI ship customer-facing features without slop.**

The system covers **all erxes plugins** — sales, frontline, operation, accounting, content, insurance, loyalty, mongolian, payment, posclient, and tourism. Each plugin has its own skills, docs, module maps, and tests. See [EXTENDING.md](./EXTENDING.md) for how plugins are onboarded.

## Read this first

Before doing anything in this repo, an AI **must** read three files in order:

1. [`SYSTEM-PROMPT.md`](./SYSTEM-PROMPT.md) — the hard rules (constitution). Non-negotiable.
2. [`WORKFLOW.md`](./WORKFLOW.md) — the 7-phase workflow that delivers a feature.
3. [`memory/lessons.md`](./memory/lessons.md) — what AI has gotten wrong here before. Compounds over time.

## How to start work

| If the developer says... | You do... |
|---|---|
| `/sales "<wish>"`, `/frontline "<wish>"`, or `/operation "<wish>"` (Claude Code) | Enter the 7-phase workflow. See [WORKFLOW.md](./WORKFLOW.md). Orchestrator at [`.claude/commands/sales.md`](../.claude/commands/sales.md), [`.claude/commands/frontline.md`](../.claude/commands/frontline.md), or [`.claude/commands/operation.md`](../.claude/commands/operation.md). |
| `erxes-wish "<wish>"` piped in (any AI tool) | The wrapper CLI has already constructed a complete briefing — follow it. |
| "Add/change X in sales/frontline/operation" without invocation | Tell the developer about `erxes-wish "<wish>"` (works with any AI tool) or `/sales` / `/frontline` / `/operation` (Claude Code). If they decline tool-assist, manually follow [WORKFLOW.md](./WORKFLOW.md). |
| "Just answer a question about sales/frontline/operation" | OK — no workflow needed for pure Q&A. Use [`plugins/sales/`](./plugins/sales/) / [`plugins/frontline/`](./plugins/frontline/) / [`plugins/operation/`](./plugins/operation/) + docs. |
| "Touch another plugin" | Use the plugin's skills and docs at `skills/<plugin>/`, `docs/<plugin>/`, `plugins/<plugin>/`. If the plugin has no skills yet, flag it and follow the NOVEL path in WORKFLOW.md. |

### For the developer — tool-agnostic invocation

Run from anywhere in the monorepo (pnpm finds the workspace root):

```bash
pnpm --silent erxes-wish "add confidenceScore to deals" | pbcopy   # paste into Cursor / ChatGPT / Codex / etc.
pnpm --silent erxes-wish "add confidenceScore to deals"            # print to stdout for review
pnpm --silent erxes-wish "<wish>" --skill add-sales-mutation       # force a specific skill
pnpm --silent erxes-wish --help
```

The `--silent` flag suppresses pnpm's `> erxes-wish` preamble so output is clean for piping. The CLI detects plugin scope and probable skill from your wish text, then assembles a complete briefing with the constitution, workflow, recent lessons, and routed skill embedded. Works with any AI tool because the output is a string.

## Routing table (where to look for what)

| Task shape | Go to |
|---|---|
| Pick a skill for the wish | [`skills/<plugin>/`](./skills/) — e.g., [sales](./skills/sales/), [frontline](./skills/frontline/), [operation](./skills/operation/) |
| Understand the codebase layout | [`docs/<plugin>/<plugin>-plugin-map.md`](./docs/) — e.g., [sales](./docs/sales/sales-plugin-map.md), [frontline](./docs/frontline/frontline-plugin-map.md), [operation](./docs/operation/operation-plugin-map.md) |
| Find files for a plugin module | [`plugins/<plugin>/INDEX.md`](./plugins/) — e.g., [sales](./plugins/sales/INDEX.md), [frontline](./plugins/frontline/INDEX.md), [operation](./plugins/operation/INDEX.md) |
| Look up a domain term (Deal, Task, Ticket, Invoice, etc.) | [`memory/glossary.md`](./memory/glossary.md) |
| Look up stack / port / version | [`memory/stack.md`](./memory/stack.md) |
| Look up why something was decided | [`memory/decisions.md`](./memory/decisions.md) |
| Check forbidden patterns before claiming done | [`SLOP-CHECKLIST.md`](./SLOP-CHECKLIST.md) |
| Run verification | [`evals/run.sh`](./evals/run.sh) — `evals/run.sh <plugin>` (e.g., `sales`, `frontline`, `operation`, `accounting`) |
| See what AI got wrong here before | [`memory/lessons.md`](./memory/lessons.md) |
| Run Playwright behavioral tests | `pnpm test` from `.agents/` (config: [`playwright.config.ts`](./playwright.config.ts)) |
| Replicate this system for another plugin | [`EXTENDING.md`](./EXTENDING.md) |

## First rules (the load-bearing ones)

Distilled from [`rules/`](./rules/). Read the full files for the *why*.

- **pnpm only** (v9.12.3+). Never `npm` or `yarn`.
- **Multi-tenant subdomain** in every data path. Models come from `generateModels(subdomain)`. See [`rules/30-multi-tenancy.md`](./rules/30-multi-tenancy.md).
- **Plugin boundaries** via gateway only. Cross-plugin: GraphQL federation, tRPC, or Redis pubsub. NEVER direct import. See [`rules/20-architecture-boundaries.md`](./rules/20-architecture-boundaries.md).
- **Rebuild `erxes-api-shared`** after editing it — dependents reference its `dist/`.
- **Mirror precedent before generating**. Find a sister feature, read in full, copy structure. See [`rules/00-orientation.md`](./rules/00-orientation.md) and every skill.
- **Verify behavior, not just compile.** `evals/run.sh <plugin>` must exit 0 before "done."
- **Atomic commits.** One logical change per commit. ≤~50 LOC each.

## Layout

```
.agents/
├── README.md                ← you are here
├── SYSTEM-PROMPT.md         ← hard rules, read first every session
├── WORKFLOW.md              ← 7-phase Feature workflow (all plugins)
├── SLOP-CHECKLIST.md        ← forbidden patterns
├── EXTENDING.md             ← how to onboard new plugins
├── rules/                   ← atoms (always-on conventions)
├── memory/                  ← cells (persistent state + lessons)
├── skills/<plugin>/         ← organs (task playbooks per plugin)
├── docs/<plugin>/           ← molecules (deep dives per plugin)
├── evals/                   ← golden tasks + run.sh + smoke tests
├── templates/               ← phase artifact templates
├── wishes/                  ← per-feature directories (one per /<plugin> invocation)
├── plugins/<plugin>/        ← file map + Playwright tests per plugin
├── package.json             ← Playwright runner
├── playwright.config.ts
└── .gitignore
```

## First-time setup

`.agents/` is **not** part of the erxes pnpm workspace (the workspace only includes `backend/**` and `frontend/**`). Running plain `pnpm install` from inside `.agents/` resolves against the parent workspace and does NOT install Playwright. You must pass `--ignore-workspace`:

```bash
cd .agents
pnpm install --ignore-workspace      # ← --ignore-workspace is REQUIRED
pnpm exec playwright install          # one-time browser download
```

After that, `pnpm test` works as expected. Only needed once per clone.

## Convention: cross-references

Pages link liberally via relative markdown links. The goal is for an AI to **follow the link** instead of greedy-reading the whole directory. If you find yourself reading three pages to answer one question, the docs have a gap — fix the link, or add the missing routing entry here.

## Anti-drift

New conventions go **only** in `rules/`. Do not add new rules to top-level `CLAUDE.md`, `AGENTS.md`, or `.cursorrules` — those files exist to point to this one and will drift if edited for new content.
