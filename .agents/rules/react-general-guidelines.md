# React Guidelines

## Core Rules

- Use functional components and hooks.
- Reuse `erxes-ui` and `ui-modules` before creating new UI primitives.
- Use `@tabler/icons-react` for plugin icons.
- Match nearby layout, spacing, table, drawer, dialog, loading, empty, and error
  states.
- Keep feature code near the feature.
- Do not add a new UI system, styling library, table library, date library, or
  icon library.

## Components

Match the local export style. erxes uses both named and default exports.

Use composition to keep page components readable. Extract hooks for data
fetching, mutations, form setup, and table state when nearby features do.

## Routing

- Use React Router v7 patterns already present in the project.
- Frontend plugin routes commonly use lazy imports with `Suspense`.
- Preserve route params such as `websiteId`, `postId`, `pageId`, board IDs,
  pipeline IDs, and plugin-specific IDs.
- Prefer URL query state for filters and table controls when the local list page
  already does.

## UI Patterns

- Prefer `RecordTable` for cursor-paginated data grids that already follow that
  pattern.
- Use existing `Sheet`, `Dialog`, `CommandBar`, `Filter`, `Select`, `Form`,
  `Input`, `Button`, `Kbd`, `Spinner`, and toast patterns from `erxes-ui`.
- Use plugin-specific shared components only inside that plugin.
- Do not put general feature UI in `src/widgets` unless it is a widget export.

## Apollo and GraphQL

- Search existing queries, mutations, fragments, and hooks before creating new
  GraphQL documents.
- Keep GraphQL documents near the feature unless the plugin already uses a
  shared GraphQL folder.
- Reuse fragments such as page info or record fragments when available.
- Use the same Apollo hook style, variables shape, pagination, cache update,
  and refetch behavior as nearby code.
- Do not change backend GraphQL contracts from frontend-only work unless
  explicitly requested.

## Effects and Performance

- Use `useEffect` for real side effects such as subscriptions, DOM integration,
  external widgets, syncing external state, or imperative APIs.
- Avoid `useEffect` for simple derived state that can be computed during render
  or handled in event callbacks.
- Memoize only when it prevents meaningful rerenders or stabilizes values passed
  to expensive child components.
