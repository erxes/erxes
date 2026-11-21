/**
 * Where an import step reads: a collection of `erxes`, or the same collection of the old v1 copy
 * `erxes_office`. Most of the v1 copy came over to `erxes` with the same `_id`s, so a v1 source
 * holds only the records `erxes` lacks; the overlap is counted as skipped, so the report shows it.
 */
import { type Db, type Document, type Filter, ObjectId } from 'mongodb';
import { z } from 'zod';
import { inOrder } from '~/lib/sequence';
import type { Run } from './run';
import { idOf } from './values';

export interface Source {
  db: Db;
  collection: string;
  /** The name the report uses: `customers`, `erxes_office.customers`. */
  name: string;
  filter: Filter<Document>;
}

const V1 = 'erxes_office';

/** An old `_id` as stored: text, or an ObjectId. */
export const OldId = z.union([z.string(), z.instanceof(ObjectId)]);
const CHUNK = 1000;

/** A collection of `erxes`, whole. */
export const mainSource = (run: Run, collection: string): Source => ({
  db: run.mongo,
  collection,
  name: collection,
  filter: {},
});

const readV1 = async (run: Run, collection: string, alsoIn: string[]): Promise<Source> => {
  const db = run.other(V1);
  const name = `${V1}.${collection}`;

  const ids = (
    await db
      .collection(collection)
      .aggregate([
        ...(run.limit ? [{ $limit: run.limit }] : []),
        { $project: { _id: 0, id: '$_id' } },
      ])
      .toArray()
  ).flatMap((doc) => OldId.safeParse(doc.id).data ?? []);

  const chunks = Array.from({ length: Math.ceil(ids.length / CHUNK) }, (_, index) =>
    ids.slice(index * CHUNK, (index + 1) * CHUNK),
  );

  const inErxes = new Set<string>();

  await inOrder(alsoIn, (other) =>
    inOrder(chunks, async (chunk) => {
      const found = await run.mongo
        .collection<{ _id: string | ObjectId }>(other)
        .find({ _id: { $in: chunk } }, { projection: { _id: 1 } })
        .toArray();

      for (const doc of found) inErxes.add(idOf(doc));
    }),
  );

  const fresh = ids.filter((id) => !inErxes.has(idOf({ _id: id })));

  run.report.seen(name, ids.length - fresh.length);
  run.report.skip(name, 'already in erxes (same _id)', '', ids.length - fresh.length);

  // Old ids are text or ObjectIds; the driver's `Document` type assumes ObjectIds only.
  const filter: Filter<Document> = Object.fromEntries([['_id', { $in: fresh }]]);

  return { db, collection, name, filter };
};

/**
 * Which of `ids` (as text) still have a document in `db`'s `collection`. Newer plugins stored
 * ObjectIds, so a 24-character hex id is looked up both ways.
 */
export const stillThere = async (db: Db, collection: string, ids: string[]) => {
  const forms = ids.flatMap((id) =>
    ObjectId.isValid(id) && id.length === 24 ? [id, new ObjectId(id)] : [id],
  );

  const found = await db
    .collection<{ _id: string | ObjectId }>(collection)
    .find({ _id: { $in: forms } }, { projection: { _id: 1 } })
    .toArray();

  return new Set(found.map(idOf));
};

const v1Sources = new WeakMap<Run, Map<string, Promise<Source>>>();

/**
 * The v1 copy's `collection`, without the records whose `_id` is in any of `erxes`'s `alsoIn`
 * collections (the same-named one by default). Worked out once per run; the first call counts
 * the overlap.
 */
export const v1Source = (run: Run, collection: string, alsoIn: string[] = [collection]) => {
  const known = v1Sources.get(run) ?? new Map<string, Promise<Source>>();
  const source = known.get(collection) ?? readV1(run, collection, alsoIn);

  known.set(collection, source);
  v1Sources.set(run, known);

  return source;
};
