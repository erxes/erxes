# erxes AI Operating Rules

## Purpose

These rules are the root source of truth for AI agents working in this repo.
Agents should preserve existing architecture, local patterns, and product
behavior while keeping changes small.

## General Rules

- Read the nearest `AI.md` before editing.
- Search for a similar implementation before creating new code.
- Reuse existing components, hooks, GraphQL documents, utilities, and state
  patterns before adding new ones.
- Keep changes minimal and scoped to the requested task.
- Do not refactor unrelated files.
- Do not introduce new dependencies unless the task explicitly requires it.
- Prefer repository consistency over personal preference.

## Architecture Rules

- Plugins must remain isolated; avoid cross-plugin imports.
- Shared frontend UI primitives belong in `frontend/libs/erxes-ui`.
- Shared frontend business/UI modules belong in `frontend/libs/ui-modules`.
- `frontend/core-ui` is the Module Federation host app, not the default place
  for reusable plugin UI.
- Follow existing GraphQL, Apollo, routing, and state management patterns in
  the touched project.
- Do not modify backend contracts from a frontend task unless explicitly
  requested.

## Workflow

Before coding:

1. Read the nearest `AI.md`.
2. Search for similar implementations with `rg`.
3. Confirm local routing, GraphQL, state, and UI patterns.
4. Reuse nearby code structure before inventing a new one.

During coding:

1. Keep changes small and readable.
2. Preserve naming conventions and UX behavior unless the task changes them.
3. Keep hooks, GraphQL documents, constants, types, and state near the feature
   they support unless the repo already has a shared location.
4. Remove debug code and avoid commented-out dead code.

After coding:

1. Run the focused project validation that exists in Nx.
2. For frontend plugins, prefer `pnpm nx lint <plugin>`,
   `pnpm nx build <plugin>`, and `pnpm nx test <plugin>` when tests or test
   setup are touched.
3. Fix TypeScript, lint, build, and Sonar issues introduced by the change.
4. Review the diff for unrelated edits before finishing.

## Forbidden

- Do not introduce a new UI system.
- Do not replace existing patterns with personal preferences.
- Do not rename public APIs casually.
- Do not perform large refactors without an explicit request.
- Do not move Module Federation exposes without updating host references.

## Priority Order

When making decisions:

1. Existing repository patterns
2. Local plugin consistency
3. Minimal changes
4. Clear behavior and maintainability
5. Reusability
6. Performance
7. Personal preference
