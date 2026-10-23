# Data Extensions

Tenant-defined fields and relations on records that erxes modules already
own. Values live on the owner record under `dataExtensions`; definitions live
in the tenant database (`data_extensions_fields`,
`data_extensions_schema_versions`); `backend/services/data-extensions-api`
serves a GraphQL schema generated per tenant at `/data-extensions/graphql`.

## Pieces in this folder

| File | What it holds |
| --- | --- |
| `recordTypes.ts` | The registry: every record type that can be extended |
| `validation.ts` | Definition rules, value normalisation, patch building |
| `namespaceGuard.ts` | Mongoose plugin that protects `dataExtensions` on owner schemas |
| `db.ts` | Metadata models, versioning, consistent snapshots |
| `owner.ts` | Owner-side lookup, patch, link, relation indexes and reverse lookup, merges |
| `ownerCalls.ts` | Input schemas and the single dispatcher for owner tRPC procedures |
| `requestProof.ts` | HMAC proofs between gateway, runtime and owners |

## Adding a module's records

Example: make Sales deals extensible. Everything stays inside the owning
plugin except one registry entry.

1. **Register the record type** in `recordTypes.ts`:

   ```ts
   {
     recordType: 'sales:deal',
     owner: 'sales',                 // plugin name used for tRPC
     typeName: 'SalesDeal',          // GraphQL type on the typed endpoint
     label: 'Deals',
     storages: ['sales:deals'],      // adapter id(s), see step 3
     idKind: 'string',               // or 'objectId'
     readAction: 'dealsRead',        // existing permission actions
     updateAction: 'dealsUpdate',
     nativeFields: [
       { name: '_id', graphqlType: 'ID' },
       { name: 'name', graphqlType: 'String' },
       { name: 'amount', graphqlType: 'Float', path: 'productsData.amount' },
     ],
   }
   ```

   Only list native fields that every reader may see. Never list secrets.

2. **Protect the namespace** on the owner's Mongoose schema:

   ```ts
   import { applyDataExtensionsNamespace } from 'erxes-api-shared/core-modules';

   applyDataExtensionsNamespace(dealSchema);
   ```

   Existing writes keep working; they can no longer set or drop the values.
   Do not spread `dataExtensions` into model writes, and avoid
   `replaceOne` on these models.

3. **Expose the owner contract** in the plugin's tRPC router:

   ```ts
   const buildOwnerContext = (models: IModels): IDataExtensionOwnerContext => ({
     metadata: getDataExtensionModels(models.Deals.db),
     adapters: { 'sales:deals': { storage: 'sales:deals', model: models.Deals } },
   });

   export const dataExtensionsTrpcRouter = t.router({
     dataExtensions: t.router({
       records: t.router({
         get: t.procedure.input(DATA_EXTENSIONS_OWNER_INPUTS.get).query(({ ctx, input }) =>
           runDataExtensionsOwnerCall({ operation: 'get', owner: 'sales', subdomain: ctx.subdomain,
             userId: ctx.userId, input, context: buildOwnerContext(ctx.models) })),
         findByRelation: /* same with 'findByRelation' */,
         search: /* same with 'search' */,
         patch: /* same with 'patch', as a mutation */,
         link: /* same with 'link', as a mutation */,
       }),
     }),
   });
   ```

   Merge it into the plugin's `appRouter`. The dispatcher verifies the
   runtime's proof before anything runs.

4. **Optional:** add `computeNative`/`computedPaths` to an adapter for
   derived fields (a display name), `searchPaths` when record pickers should
   match something other than `name`, `baseFilter` to hide records the module
   treats as gone, or `scope` in the registry for state- or role-based
   record types.

That is all: the metadata API, the generated schema, relations to and from
the new type, permissions, limits, caching and the Data Extensions UI pick
it up automatically. Write a test that a legacy update keeps
`dataExtensions` and that a patch with a forged proof is refused.

## Rules that keep it safe

- Tenants are chosen only by the gateway's signed subdomain.
- The runtime checks the record type's read/update actions; relation links
  also need read access to the target.
- Owners validate every patch against the definitions active at commit
  time and write only `dataExtensions.<definedKey>` paths.
- `JWT_TOKEN_SECRET` must be set; proofs refuse to sign without it.
