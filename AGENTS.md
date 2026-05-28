# AGENTS.md — entry point for any AI working in this repo

> **STOP. Before writing or editing any code, read [`.agents/SYSTEM-PROMPT.md`](./.agents/SYSTEM-PROMPT.md). It is the constitution; it is non-negotiable.**

This file is intentionally short. Everything authoritative lives in `.agents/`. This file exists only to route you there.

## What you are doing

You are working in the **erxes** monorepo — an Nx + pnpm microservices platform for sales / operations / frontline / accounting / etc. Backend: Apollo Federation + tRPC. Frontend: React 18 + Module Federation. Multi-tenant by subdomain.

## Routing — match the developer's intent to a destination

| Developer's intent | Do this |
|---|---|
| **To start working on any feature or task** | **Load the Master Entrypoint skill at [skills/start.md](.agents/skills/start.md) to clarify the wish, rate task complexity, and boot the correct orchestration architecture.** |
| Wishes a Sales feature ("add X to Deal", "show Y on the kanban", "filter by Z") | Construct a full briefing with `pnpm --silent erxes-wish "<wish>"` and follow the 7-phase workflow at [`.agents/WORKFLOW.md`](./.agents/WORKFLOW.md) combined with [skills/start.md](.agents/skills/start.md). |
| Wishes a Frontline feature ("add X to Conversation", "show Y on the inbox", "filter by Z") | Construct a full briefing with `pnpm --silent erxes-wish "<wish>"` and follow the 7-phase workflow at [`.agents/WORKFLOW.md`](./.agents/WORKFLOW.md) combined with [skills/start.md](.agents/skills/start.md). |
| Wishes an Operation feature ("add X to Task", "show Y on the timeline", "filter by Z") | Construct a full briefing with `pnpm --silent erxes-wish "<wish>"` and follow the 7-phase workflow at [`.agents/WORKFLOW.md`](./.agents/WORKFLOW.md) combined with [skills/start.md](.agents/skills/start.md). |
| Wishes a feature in another plugin (accounting, payment, loyalty, etc.) | Construct a full briefing with `pnpm --silent erxes-wish "<wish>"` and follow the 7-phase workflow at [`.agents/WORKFLOW.md`](./.agents/WORKFLOW.md). The CLI auto-detects the plugin scope. |
| **Reports a bug** ("fix X", "X is broken", "X doesn't work", pastes a GitHub issue) | Use `pnpm --silent erxes-wish --fix "<bug>"` and follow the 8-phase bug-fix workflow at [`.agents/skills/fix-issue.md`](./.agents/skills/fix-issue.md). Auto-detected by keywords or `--fix` flag. |
| Asks a question about the codebase | Read [`.agents/README.md`](./.agents/README.md) — routing table to docs, plugin maps, glossary. |
| Asks "where is X file" | [`.agents/plugins/<plugin>/INDEX.md`](./.agents/plugins/) — e.g., [sales](./.agents/plugins/sales/INDEX.md), [frontline](./.agents/plugins/frontline/INDEX.md), [operation](./.agents/plugins/operation/INDEX.md). |
| Asks "what does Deal/Pipeline/Stage mean" | [`.agents/memory/glossary.md`](./.agents/memory/glossary.md) — covers all plugin domains. |
| Asks how to fix slop / what NOT to do | [`.agents/SLOP-CHECKLIST.md`](./.agents/SLOP-CHECKLIST.md). |
| Asks to verify a change works | `.agents/evals/run.sh <plugin>` — e.g., `sales`, `frontline`, `operation`, `accounting`. |

## Hard rules — non-negotiable (full set in [`.agents/SYSTEM-PROMPT.md`](./.agents/SYSTEM-PROMPT.md))

- **pnpm only.** Never `npm`/`yarn`. Inside `.agents/`: `pnpm install --ignore-workspace`.
- **Mirror precedent.** Find a sister feature and read its files in full before generating. No generating from convention.
- **Atomic commits.** One logical change, ≤ ~50 LOC each.
- **Verify behavior, not compile.** `.agents/evals/run.sh <plugin>` exit 0 is the "done" oracle. Playwright tests must seed their own fixtures — no `test.skip(true, 'pending …')` cop-outs.
- **Plugin boundaries:** cross-plugin via GraphQL federation, tRPC, or Redis pubsub. **Never** direct import.
- **Multi-tenancy:** every data path uses `models` from `generateModels(subdomain)`. No exceptions.
- **Read `.agents/memory/lessons.md` at session start.** Past mistakes are documented; do not repeat them.

## Anti-drift

**Do not add new conventions to this file.** All conventions go in `.agents/rules/`. If you find yourself wanting to expand this file, you're about to fork the rules. Stop and put the new rule in the right place.

## For the developer

If you want zero-friction invocation regardless of which AI tool you're using, the wrapper CLI constructs a tool-agnostic prompt. Works from anywhere in the monorepo:

```bash
pnpm --silent erxes-wish "add confidenceScore to deals" | pbcopy   # paste into Cursor / ChatGPT / etc.
pnpm --silent erxes-wish "add confidenceScore to deals"            # print to stdout for review
pnpm --silent erxes-wish --help
```

See [`.agents/README.md`](./.agents/README.md) for the full system layout.
