# GitHub Copilot — entry point

> ⚠️ **Authoritative source: [`/.agents/README.md`](../.agents/README.md)**
>
> All conventions, skills, docs, and evals for this repo live in `.agents/`. Start there. This file exists so Copilot has an entry point — but the rules in `.agents/` are what Copilot must follow.

## Quick orientation

- **Package manager:** pnpm (v9.12.3+). NEVER `npm` or `yarn`.
- **Stack:** Node 18+, TypeScript 5.7.3, Nx 20.0.8 monorepo. Backend = Apollo Federation + tRPC + Mongoose. Frontend = React 18 + Rspack + Module Federation.
- **Multi-tenant:** every data path goes through `models` from `generateModels(subdomain)`. See [`/.agents/rules/30-multi-tenancy.md`](../.agents/rules/30-multi-tenancy.md).
- **Plugin boundaries:** cross-plugin calls go through GraphQL federation, tRPC, or Redis pubsub — **never** direct imports. See [`/.agents/rules/20-architecture-boundaries.md`](../.agents/rules/20-architecture-boundaries.md).
- **Code style:** single quotes, trailing commas, functional React, absolute imports. See [`/.agents/rules/10-code-style.md`](../.agents/rules/10-code-style.md).

## For non-trivial changes

If you're being asked to ship a feature (not just a one-line tweak), use the Sales Workflow:

1. Read [`/.agents/SYSTEM-PROMPT.md`](../.agents/SYSTEM-PROMPT.md) — the hard rules
2. Read [`/.agents/WORKFLOW.md`](../.agents/WORKFLOW.md) — the 7-phase pipeline
3. Read [`/.agents/SLOP-CHECKLIST.md`](../.agents/SLOP-CHECKLIST.md) — forbidden patterns

The workflow is currently scoped to the Sales plugin (`backend/plugins/sales_api`, `frontend/plugins/sales_ui`). For other plugins, see [`/.agents/EXTENDING.md`](../.agents/EXTENDING.md).

## Anti-drift

New conventions go in `.agents/rules/`. Do not add new rules here.
