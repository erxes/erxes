# Backend Plugin Development Rules

This document contains the mandatory rules and conventions for developing backend plugins in the erxes ecosystem.

## Must Do

- [ ] Use unique ports (check the port allocation table below)
- [ ] Register plugin name in `.env` to enable it
- [ ] Prefix collection names with plugin name (e.g., `operation_tasks`, `frontline_conversations`)
- [ ] Set `timestamps: true` on all Mongoose schemas
- [ ] Index frequently queried fields and all `_id` fields
- [ ] Return `{ list, totalCount, pageInfo }` from all list queries
- [ ] Use `cursorPaginate` for pagination
- [ ] Throw meaningful errors when entities are not found
- [ ] Use `@key(fields: "_id")` for federated GraphQL entity types
- [ ] Call `startPlugin()` from `main.ts` as the plugin entrypoint
- [ ] Use absolute import paths (`~/`, `@/`) — never relative imports (`../`, `./`)
- [ ] Define proper TypeScript interfaces — never use `any` type
- [ ] Group imports in this order: external libraries → shared packages (`erxes-api-shared`) → internal aliases (`~/`, `@/`)
- [ ] Register permissions in `meta.permissions`
- [ ] Make database migrations idempotent (safe to run multiple times)
- [ ] Document breaking changes in migration files

## Must Not Do

- [ ] Do not modify core code — extend via plugins instead
- [ ] Do not use `any` type
- [ ] Do not use relative imports (`../`, `./`)
- [ ] Do not duplicate plugin ports
- [ ] Do not skip `connectionResolvers.ts` — every plugin must have it
- [ ] Do not put business logic in Mongoose schema definitions (keep definitions pure)
- [ ] Do not forget to register permissions in `meta`
- [ ] Do not omit `createdAt` and `updatedAt` fields from GraphQL type definitions

## Port Allocation

| Plugin | Port |
|--------|------|
| content | 3303 |
| frontline | 3304 |
| operation | 3307 |
| sales | 3308 |
| payment | 3309 |
| posclient | 3310 |
| loyalty | 3311 |
| insurance | 3312 |
| tourism | 3313 |
| accounting | 3314 |
| mongolian | 3315 |

## Package.json Template

```json
{
  "name": "plugin_name_api",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc --project tsconfig.build.json && tsc-alias -p tsconfig.build.json",
    "start": "node -r tsconfig-paths/register dist/src/main.js"
  },
  "dependencies": {
    "erxes-api-shared": "workspace:^",
    "graphql-tag": "^2.12.6"
  }
}
```
