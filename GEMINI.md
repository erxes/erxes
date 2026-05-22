# GEMINI.md — entry point for any AI working in this repo

> **STOP. Before writing or editing any code, read [`.agents/SYSTEM-PROMPT.md`](./.agents/SYSTEM-PROMPT.md). It is the constitution; it is non-negotiable.**

This file is intentionally short. Everything authoritative lives in `.agents/`. This file exists only to route you there.

## What you are doing

You are working in the **erxes** monorepo — an Nx + pnpm microservices platform for sales / operations / frontline / accounting / etc. Backend: Apollo Federation + tRPC. Frontend: React 18 + Module Federation. Multi-tenant by subdomain.

## Routing — match the developer's intent to a destination

| Developer's intent | Do this |
|---|---|
| Wishes a Sales feature ("add X to Deal", "show Y on the kanban", "filter by Z") | Construct a full briefing with `.agents/bin/erxes-wish "<wish>"` and follow the 7-phase workflow at [`.agents/WORKFLOW.md`](./.agents/WORKFLOW.md). |
| Wishes a feature in another plugin (operation, frontline, etc.) | The system is **sales-only today**. Tell the developer; do not invent a workflow. See [`.agents/EXTENDING.md`](./.agents/EXTENDING.md). |
| Asks a question about the codebase | Read [`.agents/README.md`](./.agents/README.md) — routing table to docs, plugin maps, glossary. |
| Asks "where is X file" | [`.agents/plugins/sales/INDEX.md`](./.agents/plugins/sales/INDEX.md) + [`.agents/plugins/sales/modules/`](./.agents/plugins/sales/modules/). |
| Asks "what does Deal/Pipeline/Stage mean" | [`.agents/memory/glossary.md`](./.agents/memory/glossary.md). |
| Asks how to fix slop / what NOT to do | [`.agents/SLOP-CHECKLIST.md`](./.agents/SLOP-CHECKLIST.md). |
| Asks to verify a change works | `.agents/evals/run.sh sales` — the "done" oracle. |

## Hard rules — non-negotiable (full set in [`.agents/SYSTEM-PROMPT.md`](./.agents/SYSTEM-PROMPT.md))

- **pnpm only.** Never `npm`/`yarn`. Inside `.agents/`: `pnpm install --ignore-workspace`.
- **Mirror precedent.** Find a sister feature and read its files in full before generating. No generating from convention.
- **Atomic commits.** One logical change, ≤ ~50 LOC each.
- **Verify behavior, not compile.** `.agents/evals/run.sh sales` exit 0 is the "done" oracle. Playwright tests must seed their own fixtures — no `test.skip(true, 'pending …')` cop-outs.
- **Plugin boundaries:** cross-plugin via GraphQL federation, tRPC, or Redis pubsub. **Never** direct import.
- **Multi-tenancy:** every data path uses `models` from `generateModels(subdomain)`. No exceptions.
- **Read `.agents/memory/lessons.md` at session start.** Past mistakes are documented; do not repeat them.

## Anti-drift

**Do not add new conventions to this file.** All conventions go in `.agents/rules/`. If you find yourself wanting to expand this file, you're about to fork the rules. Stop and put the new rule in the right place.

## For the developer

If you want zero-friction invocation regardless of which AI tool you're using, the wrapper CLI at `.agents/bin/erxes-wish` constructs a tool-agnostic prompt:

```bash
.agents/bin/erxes-wish "add confidenceScore to deals" | pbcopy   # paste into Cursor / ChatGPT / etc.
.agents/bin/erxes-wish "add confidenceScore to deals"            # print to stdout for review
```

See [`.agents/README.md`](./.agents/README.md) for the full system layout.
