# TypeScript Guidelines

## Project Reality

erxes does not enforce one identical TypeScript style everywhere. Frontend
plugins are generally stricter than backend services, and legacy modules contain
accepted patterns such as enums, interfaces, and `any`.

When editing:

- Improve type safety in touched code.
- Do not rewrite unrelated types to satisfy a personal convention.
- Match the local module's interface/type/export style.

## Type Safety

- Avoid introducing new `any` unless it is required by an untyped third-party
  API or an existing boundary already uses it.
- Prefer explicit types at GraphQL resolver boundaries, hook return values,
  shared component props, and backend model methods.
- Let inference handle obvious local variables.
- Use narrow unions or existing constants for domain statuses and variants when
  practical.
- Preserve existing enums when the feature already uses enums for paths,
  hotkey scopes, GraphQL compatibility, or shared domain values.

## Backend Types

- Reuse types from `erxes-api-shared/core-types` and local `@types` folders
  before creating new ones.
- Keep Mongoose document/model interfaces near the model when that is the local
  pattern.
- Resolver context types usually come from `~/connectionResolvers`.
- Prefer updating local module types, schema strings, resolvers, and model
  methods together when a backend contract changes.

## Frontend Types

- Component props may be `interface` or `type`; match nearby files.
- Use generated or local GraphQL result types when available. If the feature
  does not have generated types, define narrow local types near the feature.
- Keep route params, query state, table row types, and form values explicit.
- For forms, reuse existing Zod and React Hook Form patterns.

## Path Aliases

- Frontend plugin aliases:
  - `~/*` -> plugin `src`
  - `@/*` -> plugin `src/modules`
  - `erxes-ui` and `ui-modules` -> shared frontend libraries
- Backend aliases:
  - `~/*` -> service `src`
  - `@/*` -> service `src/modules`
  - `erxes-api-shared/*` -> shared backend code

Do not replace established aliases with long relative import paths unless the
nearby file already uses relative imports for that local module.
