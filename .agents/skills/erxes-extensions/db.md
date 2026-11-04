# ctx.db

`ctx.db.<Name>` is the mongodb driver's Collection API for collection `<Name>`, stored as `ext.<id>.<Name>` in the tenant's database. The types come from the driver, so the driver's docs apply. Names are PascalCase, at most 20 collections per extension.

## Methods

`find`, `findOne`, `countDocuments`, `estimatedDocumentCount`, `distinct`, `insertOne`, `insertMany`, `updateOne`, `updateMany`, `replaceOne`, `deleteOne`, `deleteMany`, `findOneAndUpdate`, `findOneAndReplace`, `findOneAndDelete`, `bulkWrite`, `aggregate`.

- Results follow the driver's: `insertOne` returns `{ acknowledged, insertedId }`, `findOneAnd*` returns the document or `null`, and so on.
- `find` and `aggregate` return arrays, not cursors. Pass `limit`, `skip`, `sort` and `projection` as options.
- Every query and update operator works, including `$expr`, `$jsonSchema` and pipeline updates (`updateOne(filter, [{ $set: ... }])`).
- Arguments and results cross as JSON. A `Date` becomes its ISO string, so `find({ createdAt: { $gte: new Date(x) } })` compares a string and matches nothing, with no error. Compare dates with `$expr` and `$toDate`, and store your own dates as ISO strings. Only the runtime's `createdAt` and `updatedAt` are real Dates.
- Read a write back with `findOneAndUpdate(filter, update, { returnDocument: 'after' })`, or `findOne({ _id: insertedId })`.

## Stored fields

- `_id` is a string. Inserts always get a new uuid. Upserts get one unless the filter or update sets `_id`.
- Every write sets `updatedAt`. Inserts and upserts set `createdAt`, and replaces keep it.
- Document types (`collection<INote>()`) leave these three out. Results include them.

## Other collections in pipelines

`$lookup.from`, `$graphLookup.from`, `$unionWith.coll`, `$merge.into` and `$out` take the extension's own collection names (`'Notes'`). The runtime rewrites them at any depth. Any other name is `UNKNOWN_COLLECTION`. Read erxes data through `ctx.gql` instead.

Writes from `$merge` and `$out` skip the stored-field rules above. Their documents keep whatever `_id` the pipeline produced, an ObjectId if it made one, and get no `createdAt` or `updatedAt`. Set `_id` to a string in the pipeline when you need to read rows back by id.

## Refused

- Operators and stages: `$where`, `$function`, `$accumulator`, `$currentOp`, `$collStats`, `$indexStats`, `$planCacheStats`, `$listSessions`, `$listLocalSessions`, `$changeStream`. These fail as `INVALID_INPUT`.
- Admin methods (`drop`, `rename`, `createIndex`, `watch`, ...). They aren't on `ctx.db` at all. Declare indexes in `defineExtension` instead.
- Sessions and transactions. Make writes idempotent: upsert by a natural key with a unique index.

## Limits

- `maxTimeMS` 2000 on every call, and `allowDiskUse: false`.
- `find` returns at most 500 documents per call.
- `bulkWrite` and `insertMany` take at most 500 operations.
- One result is at most 1 MB. `find` and `aggregate` stop reading as soon as they pass it and fail with `RESULT_TOO_LARGE`.
