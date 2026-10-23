import * as dotenv from 'dotenv';
import {
  AnyBulkWriteOperation,
  Collection,
  Db,
  MongoClient,
  ObjectId,
} from 'mongodb';

dotenv.config();

/**
 * Gives plugin records one customer and one company of their own
 * (`customerId` / `companyId`).
 *
 * For each record, in this order:
 * 1. `customerIds` / `companyIds` arrays (an earlier migration) → their first
 *    id; the arrays are removed;
 * 2. otherwise its core relations to customers / companies, oldest first →
 *    the first one;
 * 3. otherwise `null` (no contact; the record is migrated).
 *
 * A record with several customers or companies keeps only the first; the
 * counts are printed. Relations are left in place. A field that is empty
 * (`null` or missing) is looked up again, so a record saved by new code
 * before this ran still gets its contact. Safe to run again.
 *
 *   MONGO_URL=... npx ts-node src/commands/migrateRelationsToContactFields.ts
 *   DRY_RUN=true  → count only, write nothing
 *
 * SaaS: run once per organization database (erxes_<organizationId>).
 */

const { MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true' } =
  process.env;

const DRY_RUN = process.env.DRY_RUN === 'true';

const client = new MongoClient(MONGO_URL);

const CUSTOMER = 'core:customer';
const COMPANY = 'core:company';

interface ITarget {
  collection: string;
  // Every content type the records were ever related as.
  contentTypes: string[];
}

const TARGETS: ITarget[] = [
  {
    collection: 'deals',
    contentTypes: ['sales:deal'],
  },
  {
    collection: 'frontline_tickets',
    contentTypes: ['frontline:ticket'],
  },
  { collection: 'operation_tasks', contentTypes: ['operation:task'] },
  { collection: 'operation_projects', contentTypes: ['operation:project'] },
  // Triages were related as tasks before they had a type of their own.
  {
    collection: 'operation_triage',
    contentTypes: ['operation:triage', 'operation:task'],
  },
  { collection: 'cars', contentTypes: ['car:car', 'cars:car'] },
];

const BATCH_SIZE = 1000;

interface IRecord {
  _id: string | ObjectId;
  customerId?: string | null;
  companyId?: string | null;
  customerIds?: string[] | null;
  companyIds?: string[] | null;
}

interface IRelationDoc {
  entities?: { contentType?: string; contentId?: string }[];
  createdAt?: Date;
}

const firstOf = (ids?: (string | null)[] | null) =>
  (ids || []).find((id): id is string => !!id) ?? null;

const countOf = (ids?: (string | null)[] | null) =>
  (ids || []).filter(Boolean).length;

// The record's first related customer and company, oldest relation first.
const firstRelatedContacts = async (
  db: Db,
  contentTypes: string[],
  recordId: string,
) => {
  const relations = await db
    .collection<IRelationDoc>('relations')
    .find({
      entities: {
        $elemMatch: {
          contentType: { $in: contentTypes },
          contentId: recordId,
        },
      },
      'entities.contentType': { $in: [CUSTOMER, COMPANY] },
    })
    .sort({ createdAt: 1 })
    .toArray();

  const contactsOf = (type: string) =>
    relations.flatMap(({ entities = [] }) =>
      entities
        .filter((entity) => entity.contentType === type && entity.contentId)
        .map((entity) => entity.contentId as string),
    );
  const customers = contactsOf(CUSTOMER);
  const companies = contactsOf(COMPANY);

  return {
    customerId: customers[0] ?? null,
    companyId: companies[0] ?? null,
    extra:
      Math.max(0, new Set(customers).size - 1) +
      Math.max(0, new Set(companies).size - 1),
  };
};

const migrateTarget = async (db: Db, target: ITarget) => {
  const records: Collection<IRecord> = db.collection<IRecord>(
    target.collection,
  );
  // Records with an empty contact field (`null` matches missing too) or a
  // leftover array.
  const query = {
    $or: [
      { customerId: null },
      { companyId: null },
      { customerIds: { $exists: true } },
      { companyIds: { $exists: true } },
    ],
  };

  const stats = {
    records: 0,
    fromArrays: 0,
    fromRelations: 0,
    droppedContacts: 0,
  };
  let operations: AnyBulkWriteOperation<IRecord>[] = [];

  const flush = async () => {
    if (operations.length && !DRY_RUN) {
      await records.bulkWrite(operations, { ordered: false });
    }

    operations = [];
  };

  const cursor = records.find(query).batchSize(BATCH_SIZE);

  for await (const record of cursor) {
    stats.records += 1;

    const set: Partial<IRecord> = {};
    const unset: Record<string, ''> = {};
    const hasArrays =
      Array.isArray(record.customerIds) || Array.isArray(record.companyIds);

    if (!record.customerId || !record.companyId) {
      if (hasArrays) {
        stats.fromArrays += 1;
        stats.droppedContacts +=
          Math.max(0, countOf(record.customerIds) - 1) +
          Math.max(0, countOf(record.companyIds) - 1);

        if (!record.customerId) {
          set.customerId = firstOf(record.customerIds);
        }

        if (!record.companyId) {
          set.companyId = firstOf(record.companyIds);
        }
      } else {
        const related = await firstRelatedContacts(
          db,
          target.contentTypes,
          String(record._id),
        );

        if (related.customerId || related.companyId) {
          stats.fromRelations += 1;
        }

        stats.droppedContacts += related.extra;

        if (!record.customerId) {
          set.customerId = related.customerId;
        }

        if (!record.companyId) {
          set.companyId = related.companyId;
        }
      }
    }

    if (record.customerIds !== undefined) unset.customerIds = '';
    if (record.companyIds !== undefined) unset.companyIds = '';

    operations.push({
      updateOne: {
        filter: { _id: record._id },
        update: {
          ...(Object.keys(set).length ? { $set: set } : {}),
          ...(Object.keys(unset).length ? { $unset: unset } : {}),
        },
      },
    });

    if (operations.length >= BATCH_SIZE) {
      await flush();
    }
  }

  await flush();

  if (!DRY_RUN) {
    // Indexes for the new fields; old ones on the arrays are dropped.
    for (const name of ['customerIds_1', 'companyIds_1']) {
      await records.dropIndex(name).catch(() => undefined);
    }

    await records.createIndex({ customerId: 1 });
    await records.createIndex({ companyId: 1 });
  }

  console.log(
    `${DRY_RUN ? '[DRY RUN]' : '[DONE]'} ${target.collection}: ` +
      `${stats.records} record(s) to migrate, ${stats.fromArrays} from ` +
      `arrays, ${stats.fromRelations} from relations; extra contacts ` +
      `dropped: ${stats.droppedContacts}`,
  );
};

const command = async () => {
  await client.connect();

  const db = client.db();

  console.log(
    `Process start at: ${new Date().toISOString()}${
      DRY_RUN ? ' (dry run)' : ''
    }`,
  );

  // One collection failing does not stop the others; re-running finishes it.
  const failed: string[] = [];

  for (const target of TARGETS) {
    try {
      await migrateTarget(db, target);
    } catch (error) {
      failed.push(target.collection);
      console.error(
        `[FAILED] ${target.collection}: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit(failed.length ? 1 : 0);
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
