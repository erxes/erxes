---
name: operation-plugin-reference
description: Apply erxes operation plugin conventions from operation_ui and operation_api. Use when creating or refactoring plugin features, backend entities, cursor tables, GraphQL/Apollo flows, Module Federation entries, permissions, notifications, or rules based on the repository's preferred operation plugin patterns.
---

# Skill: Operation Plugin Reference

## Workflow

1. Read `.agents/rules/operation-plugin-reference.md`.
2. Identify whether the task is closest to operation `task`, `project`,
   `cycle`, `triage`, `team`, `template`, or `activity`.
3. Open the matching files in `frontend/plugins/operation_ui` or
   `backend/plugins/operation_api`.
4. Copy the pattern, not the code. Keep plugin boundaries intact.
5. Keep feature internals near the feature: components, hooks, GraphQL, state,
   types, constants, schemas, models, and resolvers.
6. Apply the current repo rules even when old operation files are inconsistent:
   new GraphQL operation names must be unique and prefixed, and new backend
   schemas must not use `schemaWrapper`.
7. Validate with the owning Nx project.

## Frontend Checklist

- Use `src/pages` for route-level wrappers only when the plugin follows that
  split.
- Put reusable feature UI under `src/modules/<feature>/components`.
- Put Apollo hooks under `src/modules/<feature>/hooks`.
- Put GraphQL documents under feature-local `graphql/queries`,
  `graphql/mutations`, or `graphql/subscriptions`.
- Use `RecordTable` cursor patterns for list/table screens.
- Keep list, board, detail, count, progress, and selector data current after
  mutations through cache updates, refetches, or operation-style subscriptions.
- Use URL query state for filters and Jotai only for shared page UI state.
- Keep Module Federation exposes host-facing and small.

## Backend Checklist

- Put schemas in `db/definitions` and model/static methods in `db/models`.
- Define schemas with `new Schema(...)`, explicit fields, and timestamps when
  needed.
- Keep resolvers thin and call `checkPermission` first.
- Use `cursorPaginate` for cursor list responses.
- Publish plugin-prefixed pubsub events for mutations when frontend screens use
  subscriptions for live detail or list updates.
- Wire schema strings through `src/apollo/schema/schema.ts`.
- Wire resolver maps through `src/apollo/resolvers`.
- Register models and plugin-prefixed collection names in
  `connectionResolvers.ts`.
- Update permission and notification metadata when behavior requires it.

## Validation

- Frontend plugin changes: `pnpm nx lint <plugin>` and
  `pnpm nx build <plugin>`.
- Backend plugin changes: `pnpm nx build <api-plugin>`.
- Tests: run the focused test target when tests or tested behavior changed.
