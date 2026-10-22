import { randomUUID } from 'node:crypto';
import type { ErrorIssue, Indexes } from 'erxes-sdk';
import type { Connection } from 'mongoose';
import { z } from 'zod';
import { ApiError, invalidInput } from './errors';
import { LIMITS } from './limits';

type Doc = { _id: string; [field: string]: unknown };

const json = z.record(z.string(), z.unknown());

// One schema per collection op. Args arrive as the array the worker's
// `Collection` methods were called with.
const ops = {
  find: z.tuple([
    json,
    z.object({
      sort: z
        .record(z.string(), z.union([z.literal(1), z.literal(-1)]))
        .optional(),
      skip: z.number().int().min(0).optional(),
      limit: z.number().int().min(1).max(LIMITS.findLimit).optional(),
    }),
  ]),
  findOne: z.tuple([json]),
  count: z.tuple([json]),
  insertOne: z.tuple([json]),
  updateOne: z.tuple([
    json,
    json,
    z.object({ upsert: z.boolean().optional() }).strict().optional(),
  ]),
  deleteOne: z.tuple([json]),
};

type DbOpName = keyof typeof ops;

export const HostDbRequest = z.object({
  grant: z.string(),
  collection: z.string(),
  op: z.enum(Object.keys(ops) as [DbOpName, ...DbOpName[]]),
  args: z.array(z.unknown()),
});

// Extensions own collections only under their own prefix, so they never see
// erxes data or another extension's. The id keeps its dashes and the `.`
// separator can't appear in an id or a collection name, so two extensions
// never map to the same collection.
export const collectionName = (extId: string, name: string) =>
  `ext.${extId}.${name}`;

// Query operators a filter may use, at any depth. Everything else, $where,
// $function, $expr, $accumulator and $jsonSchema included, is refused: they
// run code or read other fields in ways a filter on private data never needs.
const QUERY_OPERATORS = new Set([
  '$eq',
  '$ne',
  '$gt',
  '$gte',
  '$lt',
  '$lte',
  '$in',
  '$nin',
  '$exists',
  '$regex',
  '$options',
  '$and',
  '$or',
  '$nor',
  '$not',
  '$elemMatch',
  '$size',
  '$all',
]);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Walks every key at every depth. `allowed` decides which `$` keys pass:
// the query operators in a filter, none in a document or an update.
const findOperators = (
  value: unknown,
  allowed: Set<string>,
  path: string[] = [],
  issues: ErrorIssue[] = [],
) => {
  const entries = Array.isArray(value)
    ? value.map((item, i) => [String(i), item] as const)
    : isObject(value)
    ? Object.entries(value)
    : [];

  for (const [key, child] of entries) {
    const at = [...path, key];

    if (key.startsWith('$') && !allowed.has(key)) {
      issues.push({
        path: at.join('.'),
        message: `${key} is not allowed here`,
      });
    }

    findOperators(child, allowed, at, issues);
  }

  return issues;
};

const assertOperators = (
  what: string,
  value: unknown,
  allowed: Set<string>,
) => {
  const issues = findOperators(value, allowed);

  if (issues.length > 0) {
    throw new ApiError(
      400,
      'INVALID_INPUT',
      `${what} uses ${issues
        .map((issue) => issue.path)
        .join(', ')}, which db calls don't allow`,
      issues,
    );
  }
};

const NONE = new Set<string>();

const filter = (value: Record<string, unknown>) => {
  assertOperators('The filter', value, QUERY_OPERATORS);
  return value;
};

// Documents and update sets are plain data: no `$` key at any depth. The
// update is always `$set`, built here.
const plain = (what: string, value: Record<string, unknown>) => {
  assertOperators(what, value, NONE);
  return value;
};

const parseArgs = <S extends z.ZodType>(schema: S, args: unknown[]) => {
  const parsed = schema.safeParse(args);

  if (!parsed.success) {
    throw invalidInput(parsed.error);
  }

  return parsed.data;
};

// The checks every db call passes before it reaches Mongo. scripts/try.ts
// runs the same ones.
export const parseDbOp = ({ op, args }: { op: DbOpName; args: unknown[] }) => {
  switch (op) {
    case 'find': {
      const [query, { sort = {}, skip = 0, limit = 100 }] = parseArgs(
        ops.find,
        args,
      );
      assertOperators('The sort', sort, NONE);
      return { op, query: filter(query), sort, skip, limit } as const;
    }
    case 'findOne':
    case 'count':
    case 'deleteOne':
      return { op, query: filter(parseArgs(ops[op], args)[0]) } as const;
    case 'insertOne':
      return {
        op,
        doc: plain('The document', parseArgs(ops.insertOne, args)[0]),
      } as const;
    case 'updateOne': {
      const [query, set, { upsert = false } = {}] = parseArgs(
        ops.updateOne,
        args,
      );
      // Mongo inserts the filter's equality fields too. Each one being a field
      // of `set` means the inserted document is `set`, which the worker
      // validated as a whole.
      // Own keys only: `in` would also accept `constructor` or `toString`.
      // (Object.hasOwn is ES2022; this project's lib stops at ES2021.)
      const unset = Object.keys(query).filter(
        (key) => !Object.prototype.hasOwnProperty.call(set, key),
      );

      if (upsert && unset.length > 0) {
        throw new ApiError(
          400,
          'INVALID_INPUT',
          `An upsert's filter may only use fields its update sets, not ${unset.join(
            ', ',
          )}`,
          unset.map((key) => ({
            path: key,
            message: 'not a field the update sets',
          })),
        );
      }

      return {
        op,
        query: filter(query),
        set: plain('The update', set),
        upsert,
      } as const;
    }
  }
};

const maxTimeMS = LIMITS.dbMaxTimeMs;

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

export const runDbOp = async (
  db: Connection,
  extId: string,
  collection: string,
  call: ReturnType<typeof parseDbOp>,
  // Goes straight to JSON for the worker, and naming the driver's types here
  // would tie declarations to one mongodb copy.
): Promise<unknown> => {
  const coll = db.collection<Doc>(collectionName(extId, collection));
  const now = new Date();

  switch (call.op) {
    case 'find':
      return coll
        .find(call.query, { maxTimeMS })
        .sort(call.sort)
        .skip(call.skip)
        .limit(call.limit)
        .toArray();
    case 'findOne':
      return coll.findOne(call.query, { maxTimeMS });
    case 'count':
      return coll.countDocuments(call.query, { maxTimeMS });
    case 'insertOne': {
      const stored = {
        ...call.doc,
        _id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      await coll.insertOne(stored);
      return stored;
    }
    case 'updateOne':
      return coll.findOneAndUpdate(
        call.query,
        {
          $set: { ...call.set, updatedAt: now },
          ...(call.upsert && {
            $setOnInsert: { _id: randomUUID(), createdAt: now },
          }),
        },
        { returnDocument: 'after', upsert: call.upsert, maxTimeMS },
      );
    case 'deleteOne':
      return coll.findOneAndDelete(call.query, { maxTimeMS });
  }
};

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

      for (const { keys, unique = false } of list) {
        current = `${collection} on ${JSON.stringify(keys)}`;
        const name = await coll.createIndex(keys, {
          unique,
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
