# `ext-template` Extension Guide

An erxes extension: a worker server in `server/` and a UI remote in `ui/src/`,
installed into the `ext-template-host` plugin. The `erxes-extensions` skill
covers the SDK, `ctx.db` and the `erxes-ext` CLI.

## Layout

| Path                           | What it holds                                           |
| ------------------------------ | ------------------------------------------------------- |
| `server/index.ts`              | `defineExtension`: schema, resolvers, permissions       |
| `server/connectionResolver.ts` | Collections and the resolver context type               |
| `server/graphql/`              | SDL and root resolvers, one isolate call per root field |
| `server/operations/`           | Persisted erxes GraphQL reads, typed into `server/gql/` |
| `ui/src/config.tsx`            | `CONFIG`: pages and placements                          |
| `ui/src/graphql.ts`            | `gql()` documents for the extension's own schema        |

## Validation

- `pnpm codegen`, `pnpm check`, `pnpm build`
- `pnpm dev` against a runtime started with `EXT_DEV_MODE=true`
