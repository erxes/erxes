# File Structure Guidelines

## Root Structure

```text
backend/
  gateway/
  core-api/
  erxes-api-shared/
  plugins/<name>_api/
  services/

frontend/
  core-ui/
  libs/erxes-ui/
  libs/ui-modules/
  plugins/<name>_ui/

apps/
```

## Frontend Plugins

Frontend plugins live in `frontend/plugins/<name>_ui`.

Common shape:

```text
src/
  config.tsx
  main.ts
  bootstrap.tsx
  modules/
  pages/
  widgets/
```

Rules:

- Route-level pages may live in `src/pages` or `src/modules`; follow the plugin.
- Feature internals usually belong under `src/modules/<feature>`.
- `src/widgets` is for Module Federation widget exports and widget-specific UI.
- Keep feature hooks, GraphQL documents, constants, states, and types near the
  feature unless the plugin already has a shared folder.
- Check `module-federation.config.ts` before adding, moving, or renaming
  exposes.

## Shared Frontend Code

- `frontend/libs/erxes-ui` is for UI primitives, common hooks, state, icons,
  record table, filters, hotkeys, and low-level utilities.
- `frontend/libs/ui-modules` is for reusable business UI modules such as
  contacts, tags, products, permissions, templates, sales selectors, and
  relation widgets.
- Move code into shared libraries only when there is clear cross-project reuse.

## Backend Services

Backend services live in `backend/core-api`, `backend/gateway`,
`backend/plugins/<name>_api`, and `backend/services/<name>`.

Common feature shape:

```text
src/modules/<feature>/
  @types/
  constants.ts
  db/
    definitions/
    models/
  graphql/
    schemas/
    resolvers/
      queries/
      mutations/
      customResolvers/
  trpc/
  utils/
```

Use barrel `index.ts` files only when the surrounding module already does.
Avoid creating broad shared folders for one feature.
