# Frontend Plugin Rules

## Project Shape

- Frontend plugins live in `frontend/plugins/<name>_ui`.
- Route-level pages may live in `src/pages` or `src/modules`; follow the
  touched plugin's existing pattern.
- Feature internals usually belong near the feature under `src/modules`.
- `src/widgets` is for Module Federation widget exports, not a general shared
  component folder.
- Shared frontend UI primitives belong in `frontend/libs/erxes-ui`.
- Shared reusable product modules belong in `frontend/libs/ui-modules`.
- `frontend/core-ui` is the host app; do not put shared plugin UI there by
  default.

## Imports

- Prefer local imports or the plugin's configured aliases (`~/*` for `src`,
  `@/*` for `src/modules`) according to nearby files.
- Avoid cross-plugin imports.
- Move truly shared UI to `erxes-ui` or `ui-modules` only when there is clear
  reuse across plugins.
- Do not add a dependency when an existing library or local helper already
  covers the need.

## UI Rules

- Match nearby page layout, spacing, loading states, empty states, filters, and
  action placement.
- Reuse existing `erxes-ui` and `ui-modules` tables, forms, sheets, dialogs,
  command bars, filters, and selectors.
- Use `@tabler/icons-react` for plugin icons.
- Preserve responsive behavior used by neighboring pages.
- Avoid inline styles unless the nearby code already uses them for the same
  pattern.

## React Rules

- Prefer functional components and existing hooks.
- Use composition when it makes a component easier to scan.
- Avoid unnecessary global/Jotai state; use it for shared sibling/page state or
  existing atom-backed table/page patterns.
- Keep hooks, constants, states, types, and GraphQL documents close to the
  feature they support.

## GraphQL Rules

- Search existing queries, mutations, fragments, and hooks before creating new
  GraphQL documents.
- Keep GraphQL operations near the feature module unless the plugin already has
  a shared GraphQL folder.
- Reuse fragments and Apollo hook patterns from the same plugin.
- Do not change backend GraphQL contracts from frontend work unless explicitly
  requested.

## Module Federation

- Check `module-federation.config.ts` before exposing new modules or widgets.
- Do not rename or move exposes without updating host references.
- Keep shared dependencies consistent with nearby plugin configs.

## Validation

Before finishing code changes:

1. Run `pnpm nx lint <plugin>`.
2. Run `pnpm nx build <plugin>`.
3. Run `pnpm nx test <plugin>` when tests, test setup, or tested behavior were
   touched.
4. Fix introduced TypeScript, lint, build, and Sonar warnings.
5. Remove debug code and review the final diff for unrelated changes.

For documentation-only edits, verify referenced paths and commands exist.
