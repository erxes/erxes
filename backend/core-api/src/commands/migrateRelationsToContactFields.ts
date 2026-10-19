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
 * Copies record ↔ customer/company links out of the core `relations`
 * collection onto the records themselves, as `customerIds` / `companyIds`.
 *
 * Covers the plugin records that show the relation sidebar. Records that
 * already keep their contact as `customerId` (conversations, block opptys,
 * offers and contracts) are left alone. Only adds ids ($addToSet), never
 * removes any, and keeps the `relations` rows, so it is safe to run again.
 *
 *   MONGO_URL=... npx ts-node src/commands/migrateRelationsToContactFields.ts
 *   DRY_RUN=true  → count only, write nothing
 *
 * SaaS: run once per organization database (erxes_<organizationId>).
 */

const { MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true' } =
  process.env;

const DRY_RUN = process.env.DRY_RUN === 'true';

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const client = new MongoClient(MONGO_URL);

const CUSTOMER = 'core:customer';
const COMPANY = 'core:company';
const CONTACT_FIELDS: Record<string, 'customerIds' | 'companyIds'> = {
  [CUSTOMER]: 'customerIds',
  [COMPANY]: 'companyIds',
};

interface ITarget {
  collection: string;
  // Every content type the records were ever related as.
  contentTypes: string[];
}

const TARGETS: ITarget[] = [
  { collection: 'deals', contentTypes: ['sales:deal'] },
  { collection: 'frontline_tickets', contentTypes: ['frontline:ticket'] },
  { collection: 'operation_tasks', contentTypes: ['operation:task'] },
  { collection: 'cars', contentTypes: ['car:car', 'cars:car'] },
];

const BATCH_SIZE = 2000;

type TContacts = { customerIds: Set<string>; companyIds: Set<string> };

// Most erxes records use string ids; some (operation tasks) use ObjectIds.
interface IContactRecord {
  _id: string | ObjectId;
  customerId?: string;
  customerIds?: string[];
  companyIds?: string[];
}

const hasOwnCustomerField = async (records: Collection<IContactRecord>) =>
  Boolean(
    await records.findOne(
      { customerId: { $exists: true } },
      { projection: { _id: 1 } },
    ),
  );

const toUpdates = (
  contactsByRecord: Map<string, TContacts>,
): AnyBulkWriteOperation<IContactRecord>[] =>
  [...contactsByRecord].map(([recordId, { customerIds, companyIds }]) => {
    const addToSet: {
      customerIds?: { $each: string[] };
      companyIds?: { $each: string[] };
    } = {};

    if (customerIds.size) {
      addToSet.customerIds = { $each: [...customerIds] };
    }

    if (companyIds.size) {
      addToSet.companyIds = { $each: [...companyIds] };
    }

    // Relations store ids as strings; match the record whichever id type it
    // was saved with.
    const ids: (string | ObjectId)[] = [recordId];

    if (ObjectId.isValid(recordId) && /^[a-f\d]{24}$/i.test(recordId)) {
      ids.push(new ObjectId(recordId));
    }

    return {
      updateOne: {
        filter: { _id: { $in: ids } },
        update: { $addToSet: addToSet },
      },
    };
  });

const migrateTarget = async (db: Db, { collection, contentTypes }: ITarget) => {
  const records = db.collection<IContactRecord>(collection);

  if (await hasOwnCustomerField(records)) {
    console.log(`[SKIP] ${collection}: records already have customerId`);
    return;
  }

  // Relations with one end on these records and the other on a contact.
  const cursor = db
    .collection('relations')
    .find(
      {
        $and: [
          { 'entities.contentType': { $in: contentTypes } },
          { 'entities.contentType': { $in: [CUSTOMER, COMPANY] } },
        ],
      },
      { projection: { entities: 1 } },
    )
    .batchSize(BATCH_SIZE);

  let relationCount = 0;
  let matchedCount = 0;
  let modifiedCount = 0;
  let contactsByRecord = new Map<string, TContacts>();

  const flush = async () => {
    if (!contactsByRecord.size) {
      return;
    }

    if (!DRY_RUN) {
      const result = await records.bulkWrite(toUpdates(contactsByRecord), {
        ordered: false,
      });
      matchedCount += result.matchedCount;
      modifiedCount += result.modifiedCount;
    }

    contactsByRecord = new Map();
  };

  for await (const relation of cursor) {
    const entities: { contentType?: string; contentId?: string }[] =
      relation.entities || [];
    const record = entities.find(
      (entity) =>
        entity.contentType && contentTypes.includes(entity.contentType),
    );
    const contact = entities.find(
      (entity) => entity.contentType && CONTACT_FIELDS[entity.contentType],
    );

    if (!record?.contentId || !contact?.contentId || !contact.contentType) {
      continue;
    }

    relationCount += 1;

    const contacts = contactsByRecord.get(record.contentId) || {
      customerIds: new Set<string>(),
      companyIds: new Set<string>(),
    };
    contacts[CONTACT_FIELDS[contact.contentType]].add(contact.contentId);
    contactsByRecord.set(record.contentId, contacts);

    if (contactsByRecord.size >= BATCH_SIZE) {
      await flush();
    }
  }

  await flush();

  if (!DRY_RUN) {
    await records.createIndex({ customerIds: 1 });
    await records.createIndex({ companyIds: 1 });
  }

  console.log(
    DRY_RUN
      ? `[DRY RUN] ${collection}: ${relationCount} contact relation(s) to copy`
      : `[DONE] ${collection}: ${relationCount} relation(s), ${matchedCount} record(s) found, ${modifiedCount} updated`,
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

  for (const target of TARGETS) {
    await migrateTarget(db, target);
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
