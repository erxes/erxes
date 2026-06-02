---
name: create-backend-entity
description: Add or extend Mongoose-backed erxes backend entities, models, GraphQL schemas, resolvers, permissions, and metadata. Use for backend plugin or service feature work.
---

# Skill: Create Backend Entity

## Workflow

1. Identify the owning service or backend plugin.
2. Search for the closest existing module with the same shape.
3. Add or update local types/constants under the feature's existing `@types`,
   `types`, or `constants.ts` pattern.
4. Add Mongoose schema changes in `db/definitions` and model/static methods in
   `db/models` when that is how the service is organized.
5. Update GraphQL schema strings, query resolvers, mutation resolvers, and
   custom resolvers together when the API contract changes.
6. Update tRPC routers only when the module already exposes equivalent tRPC
   behavior or the task requires it.
7. Check permission definitions, `checkPermission`, activity logs,
   import/export, automation, segment, relation, and notification metadata only
   when the feature's existing behavior or the requested task requires it.
8. Run focused validation for the owning project, usually
   `pnpm nx build <api-project>` and tests if they exist or behavior changed.

## Important

- erxes uses MongoDB and Mongoose, not TypeORM or NestJS entity patterns.
- For new backend schemas, follow the operation plugin pattern: define schemas
  directly with `new Schema(...)`, explicit fields, and local options. Do not
  introduce new `schemaWrapper` usage.
- Preserve existing string ID conventions unless the local collection uses
  ObjectIds.
- Keep business validation in the model/service layer when nearby code does.
- Do not modify frontend GraphQL documents without checking existing operations
  and fragments first.
- Do not change backend contracts only to simplify one frontend screen unless
  explicitly requested.
