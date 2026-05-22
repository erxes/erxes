# CONVENTIONS.md — entry point for Aider and other convention-reading AI

> **STOP. Before writing or editing any code, read [`.agents/SYSTEM-PROMPT.md`](./.agents/SYSTEM-PROMPT.md). It is the constitution; it is non-negotiable.**

Everything authoritative lives in `.agents/`. This file is intentionally short.

## What you are doing

You are working in the **erxes** monorepo — Nx + pnpm microservices. Backend: Apollo Federation + tRPC. Frontend: React 18 + Module Federation. Multi-tenant by subdomain.

## Routing

| Developer's intent | Do this |
|---|---|
| Sales feature wish | `pnpm --silent erxes-wish "<wish>"` + follow [`.agents/WORKFLOW.md`](./.agents/WORKFLOW.md). |
| Non-sales plugin | Sales-only today. See [`.agents/EXTENDING.md`](./.agents/EXTENDING.md). |
| Codebase question | [`.agents/README.md`](./.agents/README.md). |
| Glossary | [`.agents/memory/glossary.md`](./.agents/memory/glossary.md). |
| What NOT to do | [`.agents/SLOP-CHECKLIST.md`](./.agents/SLOP-CHECKLIST.md). |
| Verify a change | `.agents/evals/run.sh sales`. |

## Hard rules — full set in [`.agents/SYSTEM-PROMPT.md`](./.agents/SYSTEM-PROMPT.md)

- **pnpm only.** Inside `.agents/`: `pnpm install --ignore-workspace`.
- **Mirror precedent.** Read sister feature files in full before generating.
- **Atomic commits**, ≤ ~50 LOC each.
- **Verify behavior, not compile.** `evals/run.sh sales` exit 0 is "done".
- **Plugin boundaries:** GraphQL federation, tRPC, Redis pubsub. **Never** direct import.
- **Multi-tenancy:** `models` from `generateModels(subdomain)`.
- **Read `.agents/memory/lessons.md`** at session start.

## Anti-drift

Do NOT add new conventions to this file. All conventions go in `.agents/rules/`.
