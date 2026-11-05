import { randomUUID } from 'node:crypto';
import type { Indexes } from 'erxes-sdk';
import { type Connection, mongo } from 'mongoose';
import { z } from 'zod';
import { ApiError, invalidInput } from './errors';
import { LIMITS } from './limits';

type Doc = { _id: string; [field: string]: unknown };

// Extensions own collections only under their own prefix, so they never see
// erxes data or another extension's. The id keeps its dashes and the `.`
// separator can't appear in an id or a collection name, so two extensions
// never map to the same collection.
export const collectionName = (extId: string, name: string) =>
  `ext.${extId}.${name}`;

const collectionOf = (db: Connection, extId: string, name: string) =>
  db.collection<Doc>(collectionName(extId, name));

type Collection = ReturnType<typeof collectionOf>;

export const resultTooLarge = () =>
  new ApiError(
    413,
    'RESULT_TOO_LARGE',
    `The result is over ${LIMITS.dbResultBytes} bytes. Lower the limit or narrow the filter.`,
  );

// Reads a cursor until the result passes the byte cap, then stops, so a big
// collection never lands whole in the shared runtime's heap.
const readCapped = async <T extends mongo.Document>(
  cursor: mongo.AbstractCursor<T>,
) => {
  const rows: T[] = [];
  let bytes = 0;

  try {
    for await (const row of cursor) {
      bytes += mongo.BSON.calculateObjectSize(row);

      if (bytes > LIMITS.dbResultBytes) {
        throw resultTooLarge();
      }

      rows.push(row);
    }
  } finally {
    await cursor.close();
  }

  return rows;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// ---- Arguments, by method, as the worker's Collection was called. Plain
// JSON: undefined arrives as null. Options the extension may set; the host
// sets the rest (maxTimeMS, allowDiskUse, session).

const json = z.record(z.string(), z.unknown());
const filter = json.nullish();
const update = z.union([json, z.array(json)]);
const options = <S extends z.ZodRawShape>(shape: S) =>
  z.object(shape).strict().nullish();
// The driver's Sort, Collation and Hint, as JSON.
const sort = z.union([
  z.string(),
  z.array(z.string()),
  z.record(
    z.string(),
    z.union([
      z.literal(1),
      z.literal(-1),
      z.enum(['asc', 'desc', 'ascending', 'descending']),
      z.object({ $meta: z.string() }),
    ]),
  ),
]);
const collation = z
  .object({
    locale: z.string(),
    caseLevel: z.boolean().optional(),
    caseFirst: z.string().optional(),
    strength: z.number().optional(),
    numericOrdering: z.boolean().optional(),
    alternate: z.string().optional(),
    maxVariable: z.string().optional(),
    backwards: z.boolean().optional(),
    normalization: z.boolean().optional(),
  })
  .strict();
const index = {
  hint: z.union([z.string(), json]).optional(),
  collation: collation.optional(),
};
const projection = json.optional();
const ordered = options({ ordered: z.boolean().optional() });
const updateOptions = options({
  upsert: z.boolean().optional(),
  arrayFilters: z.array(json).optional(),
  ...index,
});
// findOneAnd* take a hint only as an index spec, not a name.
const returning = {
  sort: sort.optional(),
  projection,
  hint: json.optional(),
  collation: collation.optional(),
};
const docs = z.array(json).min(1).max(LIMITS.bulkMaxOps);

const updateModel = z
  .object({
    filter: json,
    update,
    upsert: z.boolean().optional(),
    arrayFilters: z.array(json).optional(),
    ...index,
  })
  .strict();
const deleteModel = z.object({ filter: json, ...index }).strict();
const BulkOperation = z.union([
  z.object({ insertOne: z.object({ document: json }).strict() }).strict(),
  z.object({ updateOne: updateModel }).strict(),
  z.object({ updateMany: updateModel }).strict(),
  z
    .object({
      replaceOne: z
        .object({
          filter: json,
          replacement: json,
          upsert: z.boolean().optional(),
          ...index,
        })
        .strict(),
    })
    .strict(),
  z.object({ deleteOne: deleteModel }).strict(),
  z.object({ deleteMany: deleteModel }).strict(),
]);

const METHODS = {
  find: z.tuple([
    filter,
    options({
      projection,
      sort: sort.optional(),
      skip: z.number().int().min(0).optional(),
      limit: z.number().int().min(1).max(LIMITS.findLimit).optional(),
      ...index,
    }),
  ]),
  findOne: z.tuple([
    filter,
    options({
      projection,
      sort: sort.optional(),
      skip: z.number().int().min(0).optional(),
      ...index,
    }),
  ]),
  countDocuments: z.tuple([
    filter,
    options({
      skip: z.number().int().min(0).optional(),
      limit: z.number().int().min(1).optional(),
      ...index,
    }),
  ]),
  estimatedDocumentCount: z.tuple([]),
  distinct: z.tuple([
    z.string(),
    filter,
    options({ collation: collation.optional() }),
  ]),
  insertOne: z.tuple([json]),
  insertMany: z.tuple([docs, ordered]),
  updateOne: z.tuple([json, update, updateOptions]),
  updateMany: z.tuple([json, update, updateOptions]),
  replaceOne: z.tuple([
    json,
    json,
    options({ upsert: z.boolean().optional(), ...index }),
  ]),
  deleteOne: z.tuple([filter, options(index)]),
  deleteMany: z.tuple([filter, options(index)]),
  findOneAndUpdate: z.tuple([
    json,
    update,
    options({
      upsert: z.boolean().optional(),
      arrayFilters: z.array(json).optional(),
      returnDocument: z.enum(['before', 'after']).optional(),
      ...returning,
    }),
  ]),
  findOneAndReplace: z.tuple([
    json,
    json,
    options({
      upsert: z.boolean().optional(),
      returnDocument: z.enum(['before', 'after']).optional(),
      ...returning,
    }),
  ]),
  findOneAndDelete: z.tuple([json, options(returning)]),
  bulkWrite: z.tuple([
    z.array(BulkOperation).min(1).max(LIMITS.bulkMaxOps),
    ordered,
  ]),
  aggregate: z.tuple([
    z.array(json),
    options({ ...index, let: json.optional() }),
  ]),
};

export type DbMethod = keyof typeof METHODS;

const isMethod = (method: string): method is DbMethod => method in METHODS;

export const HostDbRequest = z.object({
  grant: z.string(),
  collection: z.string(),
  method: z.string(),
  args: z.array(z.unknown()),
});

// ---- What no argument may contain, at any depth.

// They run code, or read server state beyond the extension's collections.
const REFUSED = new Set([
  '$where',
  '$function',
  '$accumulator',
  '$currentOp',
  '$collStats',
  '$indexStats',
  '$planCacheStats',
  '$listSessions',
  '$listLocalSessions',
  // A change stream is a watch: it never ends inside maxTimeMS.
  '$changeStream',
]);

const refuse = (at: string[], message: string) =>
  new ApiError(400, 'INVALID_INPUT', `${at.join('.')}: ${message}`, [
    { path: at.join('.'), message },
  ]);

// Maps a collection named in a stage to the stored one, or refuses it. Every
// core collection sits in the same tenant database, so a name that isn't the
// extension's own must never reach Mongo.
type Own = (name: unknown, at: string[]) => string;

// The stages that name another collection, rewritten to the extension's own.
// Each takes the stage's value and returns it with the name replaced.
const STAGES: Record<
  string,
  (value: unknown, own: Own, at: string[]) => unknown
> = {
  $lookup: (value, own, at) =>
    isObject(value) && 'from' in value
      ? { ...value, from: own(value.from, [...at, 'from']) }
      : value,
  $graphLookup: (value, own, at) =>
    isObject(value)
      ? { ...value, from: own(value.from, [...at, 'from']) }
      : value,
  $unionWith: (value, own, at) =>
    typeof value === 'string'
      ? own(value, at)
      : isObject(value) && 'coll' in value
        ? { ...value, coll: own(value.coll, [...at, 'coll']) }
        : value,
  $out: (value, own, at) => {
    if (typeof value === 'string') {
      return own(value, at);
    }

    if (isObject(value) && 'db' in value) {
      throw refuse([...at, 'db'], 'another database is not allowed');
    }

    return isObject(value)
      ? { ...value, coll: own(value.coll, [...at, 'coll']) }
      : value;
  },
  $merge: (value, own, at) => {
    if (typeof value === 'string') {
      return own(value, at);
    }

    if (!isObject(value)) {
      return value;
    }

    const into = value.into;

    if (isObject(into) && 'db' in into) {
      throw refuse([...at, 'into', 'db'], 'another database is not allowed');
    }

    return {
      ...value,
      into: isObject(into)
        ? { ...into, coll: own(into.coll, [...at, 'into', 'coll']) }
        : own(into, [...at, 'into']),
    };
  },
};

// Every argument, copied with collection names rewritten. Throws on a
// refused operator or a collection that isn't the extension's own.
const scrub = (value: unknown, own: Own, at: string[] = []): unknown => {
  if (Array.isArray(value)) {
    return value.map((item, i) => scrub(item, own, [...at, String(i)]));
  }

  if (!isObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => {
      const path = [...at, key];

      if (REFUSED.has(key)) {
        throw refuse(path, `${key} is not allowed`);
      }

      const stage = STAGES[key];
      return [key, scrub(stage ? stage(child, own, path) : child, own, path)];
    }),
  );
};

const parse = <S extends z.ZodType>(schema: S, args: unknown) => {
  const parsed = schema.safeParse(args);

  if (!parsed.success) {
    throw invalidInput(parsed.error);
  }

  return parsed.data;
};

// ---- Writes: the host gives every document a string `_id` and keeps
// `createdAt` and `updatedAt`, as it always has.

const inserted = (doc: Record<string, unknown>, now: Date) => ({
  ...doc,
  _id: randomUUID(),
  createdAt: now,
  updatedAt: now,
});

// Top-level fields an update's operators touch.
const touched = (update: Record<string, unknown>) =>
  new Set(
    Object.values(update).flatMap((fields) =>
      isObject(fields)
        ? Object.keys(fields).map((key) => key.split('.')[0])
        : [],
    ),
  );

const hasId = (query: Record<string, unknown> | null | undefined) =>
  !!query && Object.prototype.hasOwnProperty.call(query, '_id');

// `updatedAt` on every update, and on an upsert's insert a string `_id`
// (unless the filter names one) and `createdAt`. Fields the update itself
// sets are left to it. A pipeline update gets one more `$set` stage.
const stamped = (
  query: Record<string, unknown> | null | undefined,
  change: Record<string, unknown> | Record<string, unknown>[],
  upsert: boolean,
  now: Date,
) => {
  const withId = hasId(query);

  if (Array.isArray(change)) {
    return [
      ...change,
      {
        $set: {
          updatedAt: '$$NOW',
          ...(upsert && {
            ...(!withId && { _id: { $ifNull: ['$_id', randomUUID()] } }),
            createdAt: { $ifNull: ['$createdAt', '$$NOW'] },
          }),
        },
      },
    ];
  }

  const fields = touched(change);
  const set = isObject(change.$set) ? change.$set : {};
  const setOnInsert = isObject(change.$setOnInsert) ? change.$setOnInsert : {};

  return {
    ...change,
    ...(!fields.has('updatedAt') && { $set: { ...set, updatedAt: now } }),
    ...(upsert && {
      $setOnInsert: {
        ...setOnInsert,
        ...(!withId && !fields.has('_id') && { _id: randomUUID() }),
        ...(!fields.has('createdAt') && { createdAt: now }),
      },
    }),
  };
};

// A replacement as a pipeline update, so the stored `_id` and `createdAt`
// survive it and an upsert still inserts a string `_id`. `$literal` keeps
// the document's own `$` strings from reading as field paths.
const replaced = (doc: Record<string, unknown>) => [
  {
    $replaceWith: {
      $mergeObjects: [
        { $literal: doc },
        {
          _id: { $ifNull: ['$_id', randomUUID()] },
          createdAt: { $ifNull: ['$createdAt', '$$NOW'] },
          updatedAt: '$$NOW',
        },
      ],
    },
  },
];

const maxTimeMS = LIMITS.dbMaxTimeMs;

// One bulkWrite operation with the same stamping as its single-op method.
const bulkOperation = (op: z.infer<typeof BulkOperation>, now: Date) => {
  if ('insertOne' in op) {
    return { insertOne: { document: inserted(op.insertOne.document, now) } };
  }

  if ('updateOne' in op) {
    const { filter, update, upsert = false } = op.updateOne;
    return {
      updateOne: {
        ...op.updateOne,
        update: stamped(filter, update, upsert, now),
      },
    };
  }

  if ('updateMany' in op) {
    const { filter, update, upsert = false } = op.updateMany;
    return {
      updateMany: {
        ...op.updateMany,
        update: stamped(filter, update, upsert, now),
      },
    };
  }

  if ('replaceOne' in op) {
    const { replacement, ...model } = op.replaceOne;
    return { updateOne: { ...model, update: replaced(replacement) } };
  }

  return op;
};

// Checks one ctx.db call and returns what runs it: every argument parsed for
// its method, refused operators and foreign collections thrown, stage names
// rewritten. Nothing reaches Mongo until the returned function runs.
export const prepareDbCall = (
  { method, args }: { method: string; args: unknown[] },
  extId: string,
  collections: string[],
): ((coll: Collection) => Promise<unknown>) => {
  if (!isMethod(method)) {
    throw new ApiError(
      400,
      'METHOD_NOT_ALLOWED',
      `ctx.db has no ${method}. It has ${Object.keys(METHODS).join(', ')}.`,
    );
  }

  const own: Own = (name, at) => {
    if (typeof name !== 'string' || !collections.includes(name)) {
      throw new ApiError(
        403,
        'UNKNOWN_COLLECTION',
        `${at.join('.')}: ${String(
          name,
        )} is not one of ${extId}'s collections (${collections.join(', ')})`,
      );
    }

    return collectionName(extId, name);
  };
  const input = scrub(args, own);
  const now = new Date();

  switch (method) {
    case 'find': {
      const [query, opts] = parse(METHODS.find, input);
      return (coll) =>
        readCapped(
          coll.find(query ?? {}, {
            ...opts,
            limit: opts?.limit ?? LIMITS.findLimit,
            maxTimeMS,
          }),
        );
    }
    case 'findOne': {
      const [query, opts] = parse(METHODS.findOne, input);
      return (coll) => coll.findOne(query ?? {}, { ...opts, maxTimeMS });
    }
    case 'countDocuments': {
      const [query, opts] = parse(METHODS.countDocuments, input);
      return (coll) => coll.countDocuments(query ?? {}, { ...opts, maxTimeMS });
    }
    case 'estimatedDocumentCount':
      parse(METHODS.estimatedDocumentCount, input);
      return (coll) => coll.estimatedDocumentCount({ maxTimeMS });
    case 'distinct': {
      const [key, query, opts] = parse(METHODS.distinct, input);
      return (coll) => coll.distinct(key, query ?? {}, { ...opts, maxTimeMS });
    }
    case 'insertOne': {
      const [doc] = parse(METHODS.insertOne, input);
      return (coll) => coll.insertOne(inserted(doc, now), { maxTimeMS });
    }
    case 'insertMany': {
      const [docs, opts] = parse(METHODS.insertMany, input);
      return (coll) =>
        coll.insertMany(
          docs.map((doc) => inserted(doc, now)),
          { ...opts, maxTimeMS },
        );
    }
    case 'updateOne':
    case 'updateMany': {
      const [query, change, opts] = parse(METHODS[method], input);
      const next = stamped(query, change, opts?.upsert === true, now);
      return (coll) => coll[method](query, next, { ...opts, maxTimeMS });
    }
    case 'replaceOne': {
      const [query, doc, opts] = parse(METHODS.replaceOne, input);
      return (coll) =>
        coll.updateOne(query, replaced(doc), { ...opts, maxTimeMS });
    }
    case 'deleteOne':
    case 'deleteMany': {
      const [query, opts] = parse(METHODS[method], input);
      return (coll) => coll[method](query ?? {}, { ...opts, maxTimeMS });
    }
    case 'findOneAndUpdate': {
      const [query, change, opts] = parse(METHODS.findOneAndUpdate, input);
      const next = stamped(query, change, opts?.upsert === true, now);
      return (coll) =>
        coll.findOneAndUpdate(query, next, { ...opts, maxTimeMS });
    }
    case 'findOneAndReplace': {
      const [query, doc, opts] = parse(METHODS.findOneAndReplace, input);
      return (coll) =>
        coll.findOneAndUpdate(query, replaced(doc), { ...opts, maxTimeMS });
    }
    case 'findOneAndDelete': {
      const [query, opts] = parse(METHODS.findOneAndDelete, input);
      return (coll) => coll.findOneAndDelete(query, { ...opts, maxTimeMS });
    }
    case 'bulkWrite': {
      const [list, opts] = parse(METHODS.bulkWrite, input);
      const operations = list.map((op) => bulkOperation(op, now));
      return async (coll) => {
        const result = await coll.bulkWrite(operations, { ...opts, maxTimeMS });
        return {
          insertedCount: result.insertedCount,
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          deletedCount: result.deletedCount,
          upsertedCount: result.upsertedCount,
          insertedIds: result.insertedIds,
          upsertedIds: result.upsertedIds,
        };
      };
    }
    case 'aggregate': {
      const [pipeline, opts] = parse(METHODS.aggregate, input);
      return (coll) =>
        readCapped(
          coll.aggregate(pipeline, { ...opts, allowDiskUse: false, maxTimeMS }),
        );
    }
  }
};

export const runDbCall = (
  db: Connection,
  extId: string,
  collection: string,
  call: ReturnType<typeof prepareDbCall>,
) => call(collectionOf(db, extId, collection));

// What a unique index refused, as the extension sees it.
export const conflict = (collection: string, keyValue: unknown) =>
  new ApiError(
    409,
    'CONFLICT',
    `${collection} already has a document with ${JSON.stringify(keyValue)}`,
  );

export const isDuplicateKey = (
  e: unknown,
): e is { code: 11000; keyValue?: Record<string, unknown> } =>
  typeof e === 'object' && e !== null && 'code' in e && e.code === 11000;

// Creates the indexes a version declares. createIndex is a no-op for an
// index that already exists as declared, so activating again or rolling back
// is safe. Indexes an older version declared stay. Fails with INDEX_FAILED
// when existing documents break a unique index, an index with the same keys
// exists with other options, or the builds run past LIMITS.indexBuildMs. The
// caller then keeps the active version, so every index this attempt built is
// dropped again: the old version must not start refusing writes it accepted.
export const ensureIndexes = async (
  db: Connection,
  extId: string,
  indexes: Indexes,
) => {
  const deadline = Date.now() + LIMITS.indexBuildMs;
  const created: { collection: string; name: string }[] = [];
  let current = '';

  try {
    for (const [collection, list] of Object.entries(indexes)) {
      const coll = db.collection(collectionName(extId, collection));
      // A collection that doesn't exist yet has no indexes: NamespaceNotFound.
      const existing = new Set(
        (
          await coll.indexes().catch((e: { code?: number }) => {
            if (e.code === 26) return [];
            throw e;
          })
        ).map((index) => index.name),
      );

      for (const { keys, unique = false, sparse = false } of list) {
        current = `${collection} on ${JSON.stringify(keys)}`;
        const name = await coll.createIndex(keys, {
          unique,
          sparse,
          maxTimeMS: Math.max(1, deadline - Date.now()),
        });

        if (!existing.has(name)) {
          existing.add(name);
          created.push({ collection, name });
        }
      }
    }
  } catch (e) {
    for (const { collection, name } of created) {
      await db
        .collection(collectionName(extId, collection))
        .dropIndex(name)
        .catch((dropError: unknown) =>
          console.error(`couldn't drop ${extId} index ${name}`, dropError),
        );
    }

    throw new ApiError(
      409,
      'INDEX_FAILED',
      `Couldn't index ${current}: ${
        e instanceof Error ? e.message : String(e)
      }`,
    );
  }
};

// Missing collections are skipped: Mongo before 7.0 answers NamespaceNotFound
// (code 26) for them.
export const dropCollections = async (
  db: Connection,
  extId: string,
  names: string[],
) => {
  for (const name of names) {
    await db
      .collection(collectionName(extId, name))
      .drop()
      .catch((e: { code?: number }) => {
        if (e.code !== 26) throw e;
      });
  }
};
