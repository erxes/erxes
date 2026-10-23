import * as dotenv from 'dotenv';
import {
  AnyBulkWriteOperation,
  Collection,
  Db,
  Filter,
  MongoClient,
  ObjectId,
} from 'mongodb';
import { getTargetDbs } from './_organizationDbs';

dotenv.config();

/**
 * Gives tickets and deals the inbox conversations they were made from as a
 * field of their own (`sourceConversationIds`) instead of core relations.
 *
 * - every conversation ↔ ticket relation → the ticket's
 *   `sourceConversationIds` gains the conversation;
 * - every conversation ↔ deal relation → the deal's `sourceConversationIds`;
 * - tickets moved from the old ticket module keep theirs in
 *   `customerFieldData.sourceConversationIds`: copied up too.
 *
 * Relations are left in place; nothing reads them any more. Safe to run
 * again (`$addToSet`).
 *
 * Run (DRY_RUN=true counts only, writes nothing):
 *   self-hosted:  MONGO_URL=mongodb://.../erxes npx tsx <this file>
 *   SaaS, one:    MONGO_URL=<core db> TARGET_SUBDOMAIN=<subdomain> npx tsx <this file>
 *   SaaS, all:    MONGO_URL=<core db> ALL_ORGS=true npx tsx <this file>
 *   or: tsx backend/saas-migrations/run-commands.ts --org=<subdomain> <name>
 */

const {
  CORE_MONGO_URL,
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
} = process.env;

const DRY_RUN = process.env.DRY_RUN === 'true';

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

const CONVERSATION = 'frontline:conversation';

const TARGETS = [
  { contentType: 'frontline:ticket', collection: 'frontline_tickets' },
  { contentType: 'sales:deal', collection: 'deals' },
];

const BATCH_SIZE = 1000;

interface IRelationDoc {
  entities?: { contentType?: string; contentId?: string }[];
}

interface ISourceRecord {
  _id: string | ObjectId;
  sourceConversationIds?: string[];
}

interface ITicketDoc {
  _id: string | ObjectId;
  customerFieldData?: { sourceConversationIds?: unknown };
}

// Ids are kept as strings; a record may still have an ObjectId `_id`.
const idFilter = (id: string): Filter<ISourceRecord> =>
  ObjectId.isValid(id) && String(new ObjectId(id)) === id
    ? { _id: { $in: [id, new ObjectId(id)] } }
    : { _id: id };

const createBatcher = (collection: Collection<ISourceRecord>) => {
  let operations: AnyBulkWriteOperation<ISourceRecord>[] = [];

  const flush = async () => {
    if (operations.length && !DRY_RUN) {
      await collection.bulkWrite(operations, { ordered: false });
    }

    operations = [];
  };

  const add = async (recordId: string, conversationIds: string[]) => {
    operations.push({
      updateOne: {
        filter: idFilter(recordId),
        update: {
          $addToSet: { sourceConversationIds: { $each: conversationIds } },
        },
      },
    });

    if (operations.length >= BATCH_SIZE) {
      await flush();
    }
  };

  return { add, flush };
};

const migrateRelations = async (db: Db, target: (typeof TARGETS)[number]) => {
  const batcher = createBatcher(
    db.collection<ISourceRecord>(target.collection),
  );
  const records = new Set<string>();
  let relations = 0;

  const cursor = db
    .collection<IRelationDoc>('relations')
    .find({
      'entities.contentType': { $all: [CONVERSATION, target.contentType] },
    })
    .batchSize(BATCH_SIZE);

  for await (const relation of cursor) {
    const entities = relation.entities || [];
    const conversationId = entities.find(
      (entity) => entity.contentType === CONVERSATION,
    )?.contentId;
    const recordId = entities.find(
      (entity) => entity.contentType === target.contentType,
    )?.contentId;

    if (!conversationId || !recordId) {
      continue;
    }

    relations += 1;
    records.add(recordId);
    await batcher.add(recordId, [conversationId]);
  }

  await batcher.flush();

  console.log(
    `${DRY_RUN ? '[DRY RUN]' : '[DONE]'} ${target.collection}: ` +
      `${relations} conversation relation(s) on ${records.size} record(s)`,
  );
};

// Tickets from the old ticket module: copy the nested list up.
const migrateLegacyTicketField = async (db: Db) => {
  const tickets = db.collection<ITicketDoc>('frontline_tickets');
  const batcher = createBatcher(
    db.collection<ISourceRecord>('frontline_tickets'),
  );
  let count = 0;

  const cursor = tickets
    .find(
      { 'customerFieldData.sourceConversationIds.0': { $exists: true } },
      { projection: { 'customerFieldData.sourceConversationIds': 1 } },
    )
    .batchSize(BATCH_SIZE);

  for await (const ticket of cursor) {
    const ids = ticket.customerFieldData?.sourceConversationIds;
    const conversationIds = Array.isArray(ids)
      ? ids.filter((id): id is string => typeof id === 'string' && !!id)
      : [];

    if (!conversationIds.length) {
      continue;
    }

    count += 1;
    await batcher.add(String(ticket._id), conversationIds);
  }

  await batcher.flush();

  console.log(
    `${DRY_RUN ? '[DRY RUN]' : '[DONE]'} frontline_tickets: ` +
      `${count} ticket(s) from customerFieldData.sourceConversationIds`,
  );
};

const command = async () => {
  await client.connect();

  console.log(
    `Process start at: ${new Date().toISOString()}${
      DRY_RUN ? ' (dry run)' : ''
    }`,
  );

  for (const { label, db } of await getTargetDbs(client)) {
    console.log(`\n== ${label}`);

    for (const target of TARGETS) {
      await migrateRelations(db, target);
    }

    await migrateLegacyTicketField(db);

    if (!DRY_RUN) {
      await db
        .collection('frontline_tickets')
        .createIndex({ sourceConversationIds: 1 });
    }
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit(0);
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
