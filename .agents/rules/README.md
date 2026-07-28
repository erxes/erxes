# erxes Agent Rules

This directory contains erxes-specific Markdown rules for AI-assisted work in
this repository. These files should reinforce the monorepo architecture, plugin
boundaries, and local implementation patterns.

> **You do not read all of these every task.** `.agents/ROUTER.md` (the single
> entry point, run via `/erxes`) loads them in tiers:
> **always** → `non-negotiable.md` + `architecture.md` + `code-style.md`; **then
> by scope** → the frontend/backend/migration/test/etc. rule only when your
> change touches it.
> See ROUTER STEP 0 and STEP 6 for the exact tier table.

## Rule Files

- `non-negotiable.md` - **ALWAYS-ON.** Zero-tolerance MUST/NEVER rules (no
  default exports, no `any`, no half-CRUD, plugin isolation, named GraphQL ops).
- `architecture.md` - erxes monorepo structure, stack, and ownership boundaries.
- `operation-plugin-reference.md` - operation plugin patterns to use as the
  preferred reference when local plugin patterns are missing or weaker.
- `nx-rules.md` - pnpm and Nx command guidance.
- `file-structure.md` - frontend, backend, plugin, and shared-code locations.
- `code-style.md` - local code style and review expectations.
- `typescript-guidelines.md` - practical TypeScript conventions for erxes.
- `react-general-guidelines.md` - frontend UI, routing, GraphQL, and component rules.
- `react-state-management.md` - local state, Apollo, URL state, and Jotai usage.
- `translations.md` - i18n and locale-file rules.
- `testing-guidelines.md` - focused validation and test strategy.
- `server-migrations.md` - MongoDB/Mongoose migration and command rules.
- `github-actions-security.md` - workflow security guardrails.
- `changelog-process.md` - release changelog process.
- `feedback-incorporation.md` - when to update these rules from repeated feedback.

## Baseline Workflow

Before coding:

1. Read the root `AGENTS.md` and any nested `AGENTS.md` that applies to the
   touched path.
2. Read relevant `.agents/rules/*.md` and
   `.agents/skills/<skill-name>/SKILL.md` files.
3. Search for similar implementations with `rg`.
4. Confirm the touched project's routing, GraphQL, state, and UI patterns.
5. Reuse nearby code before adding new abstractions.

During coding:

1. Keep changes scoped to the requested task.
2. Preserve plugin isolation; do not import across plugins.
3. Prefer existing components, hooks, GraphQL documents, utilities, and states.
4. Do not introduce dependencies unless explicitly required.

After coding:

1. Run the focused Nx validation that exists for the touched project.
2. For frontend plugins, prefer `pnpm nx lint <plugin>`,
   `pnpm nx build <plugin>`, and `pnpm nx test <plugin>` when tests or tested
   behavior were touched.
3. For documentation-only edits, verify referenced paths and commands.
4. Review the diff for unrelated changes before finishing.

## Common Commands

```bash
pnpm nx show projects
pnpm nx serve core-ui
pnpm nx serve content_ui
pnpm nx build operation_ui
pnpm nx lint operation_ui
pnpm nx build operation_api
pnpm nx build core-ui
pnpm nx build content_ui
pnpm nx lint content_ui
pnpm nx test content_ui
pnpm nx build core-api
pnpm nx serve core-api
```

Repository scripts:

```bash
pnpm dev:core-api
pnpm dev:apis
pnpm dev:uis
pnpm create-plugin
pnpm release
```
