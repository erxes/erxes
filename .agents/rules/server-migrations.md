# Backend Migrations

erxes uses MongoDB and Mongoose. It does not use TypeORM migrations, NestJS
upgrade commands, or workspace migration builders.

## Where Migrations Live

Existing migration and command examples:

```text
backend/core-api/src/commands/
backend/plugins/frontline_api/src/migrations/
backend/plugins/operation_api/src/migrations/
backend/plugins/mongolian_api/src/commands/
backend/plugins/loyalty_api/src/commands/
```

Before adding a migration, search for service-local patterns.

## When to Add a Migration

Consider a migration or command when:

- a schema change needs existing MongoDB documents backfilled
- data needs to move between collections
- old embedded fields are split into separate collections
- indexes or derived fields need to be created for existing data
- a one-time cleanup is too risky to run inside request handling

Do not add a migration for a purely frontend change.

## Migration Rules

- Make migrations idempotent. Running twice should not corrupt data.
- Read `MONGO_URL` or service env values consistently with nearby scripts.
- Avoid hardcoded tenant, brand, user, or subdomain data.
- Process large collections in batches when possible.
- Log useful progress without logging secrets or sensitive payloads.
- Close database connections or exit cleanly.
- Prefer `$set`, `$unset`, `$addToSet`, and guarded updates over wholesale
  document replacement.
- Preserve string ID conventions unless the existing collection uses ObjectIds.

## Schema Changes

When changing `db/definitions`:

- Check model methods that create or update the document.
- Check GraphQL schema and resolvers.
- Check tRPC routers if present.
- Check imports/exports, activity logs, filters, permissions, and frontend
  table/form code when the field is user-visible.
- Add a migration only if existing documents need data changes.

## Validation

For migration scripts, prefer:

```bash
pnpm nx build <api-project>
```

When a migration changes runtime behavior, also run the relevant service tests
if they exist.
