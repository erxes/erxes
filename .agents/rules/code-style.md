# Code Style Guidelines

## General Style

- Follow formatting already used in the touched project: 2-space indentation,
  single quotes, semicolons, and trailing commas are common across erxes.
- Let existing lint, TypeScript, and Prettier behavior win over personal style.
- Keep changes small and readable. Avoid opportunistic refactors.
- Remove debug logs and commented-out dead code before finishing.
- Avoid new abstractions unless they remove meaningful duplication or match a
  local pattern.

## Naming

- Use descriptive names that match nearby files.
- Frontend files use PascalCase for React components and camelCase or kebab-case
  for feature helpers depending on the plugin. Follow the local directory.
- Backend model files often use PascalCase model names and lowercase definition
  files. Preserve the local convention.
- Name GraphQL queries, mutations, and subscriptions with the plugin or module
  prefix plus the operation purpose, such as `operationTaskList` or
  `cmsPageList`; operation names must be unique.
- Keep public GraphQL operation names, route names, and module federation
  exposes stable unless the task explicitly asks to change them.

## Imports

- Prefer existing aliases:
  - frontend plugins: `~/*` for `src`, `@/*` for `src/modules`,
    `erxes-ui`, and `ui-modules`
  - backend services: `~/*` for `src`, `@/*` for `src/modules`,
    `erxes-api-shared/*`
- Do not import across frontend plugins.
- Do not add dependencies when a local helper, shared library, or existing
  package already covers the use case.
- Preserve nearby import grouping and ordering.

## Exports

- Use named exports only. Do not introduce new default exports.
- Named exports are used for components, hooks, constants, utility functions,
  route entry points, Module Federation entries, resolver maps, GraphQL document
  maps, and config files.

## Comments

- Add comments only for non-obvious business rules, migration constraints, or
  tricky integration behavior.
- Keep comments short and accurate.
- Existing backend files may use JSDoc-style comments for resolver/model
  methods. Do not remove or rewrite those comments as unrelated cleanup.

## Error Handling and Security

- Preserve the service's existing error handling style.
- Backend resolvers commonly throw `Error` with user-visible messages and rely
  on context helpers such as `checkPermission`.
- Frontend mutations should use existing toast, refetch, cache update, and
  error display patterns from the same feature.
- Sanitize user-facing HTML or rich text through existing utilities.
- Do not log tokens, credentials, personally sensitive data, or app secrets.
