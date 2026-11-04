# Extension server

## Layout

| Path                                          | Holds                                                                              |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `server/index.ts`                             | `export const extension = defineExtension({...})`, the only export the build reads |
| `server/connectionResolver.ts`                | `collections` and `IContext`                                                       |
| `server/db/definitions/*.ts`                  | Document types and zod input schemas, which the UI may import too                  |
| `server/graphql/schema.ts`                    | `types`, `queries`, `mutations` as SDL strings                                     |
| `server/graphql/*Queries.ts`, `*Mutations.ts` | Resolver objects                                                                   |
| `server/meta/permissions.ts`                  | `permissions`                                                                      |
| `server/operations/*.graphql`                 | Persisted erxes operations for `ctx.gql`                                           |

## defineExtension

```ts
export const extension = defineExtension({
  types,
  queries,
  mutations,
  resolvers: { Query: noteQueries, Mutation: noteMutations },
  collections,
  indexes: { Notes: [{ keys: { createdAt: -1 } }] },
  permissions,
  fieldPermissions: { dealInsightsNotes: 'notes.view', dealInsightsNotesAdd: 'notes.add' },
});
```

- `queries` and `mutations` are field lists. The SDK wraps them in `type Query` and `type Mutation`. `scalar JSON` and `scalar Date` are predeclared.
- Prefix every root field with `pluginName(id)`. Types need no prefix: each extension has its own schema and Apollo cache.
- `resolvers` has only `Query` and `Mutation`. Return plain JSON shaped like the SDL type, and graphql-js resolves nested fields from it. Put computed fields in the root resolver's result.
- Permissions are `{ <module>: { <action>: '<label>' } }`. `fieldPermissions` maps each root field to `'<module>.<action>'`, or `'public'` for any signed-in user. Owners grant them in Settings > Permissions as `<pluginName>.<module>.<action>`.
- Indexes: `{ keys, unique?, sparse? }` per collection, built when the version activates. A unique index turns a duplicate write into `CONFLICT`.

Install refuses: an SDL that doesn't parse or build, `schema` definitions, `Subscription`, unprefixed root fields, root fields without a resolver or permission, and resolvers on other types.

## Context and resolvers

`IContext` comes from the collections, never from `typeof extension`, which would make the resolvers' own types circular:

```ts
export const collections = { Notes: collection<INote>() };
export type IContext = Context<typeof collections>;
```

A resolver is `(_parent: undefined, args, ctx: IContext)`. `ctx` is `{ db, gql, user }`, and `user._id` is the caller. Parse `args` with zod at the top of each mutation. A failed parse becomes `INVALID_INPUT` with its issues.

Throw `new ExtensionError(code, message)` for an error the UI can act on (`NOT_FOUND`, `CONFLICT`, your own codes). It reaches the client as a GraphQL error with `extensions.code`. Any other throw becomes `FUNCTION_ERROR`, and its message reaches the browser, so never put secrets or raw upstream errors in one.

One root field is one isolate call: 5 s by default, a 1 MB result, no outbound network. Page long work across calls, as the response-templates import does with `nextCursor`.

## ctx.gql

`ctx.gql(Document, variables)` runs one persisted erxes operation as the caller and returns its `data`.

1. Write named operations in `server/operations/*.graphql`. Name each `<pluginName>...` to keep operation names unique repo-wide.
2. `erxes-ext codegen` types them against the composed erxes schema into `server/gql/`, with a sha256 per document.
3. Import the `...Document` from `../gql/graphql`. Only these hashes run. The shared deny checks refuse auth, credential and system-security fields at install and again on every call.

Install lists every operation in the owner's dialog, with destructive mutations marked. Prefer reads.
