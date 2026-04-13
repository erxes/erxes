import { config } from 'dotenv';

config();

import {
  AnyBulkWriteOperation,
  Collection,
  Db,
  Document,
  MongoClient,
} from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Customers: Collection<Document>;
let CPUsers: Collection<Document>;

const fillSearchText = (doc: Document) => {
  const searchText = [
    (doc.emails || []).join(' '),
    (doc.phones || []).join(' '),
    doc.firstName || '',
    doc.middleName || '',
    doc.lastName || '',
    doc.primaryEmail || '',
    doc.primaryPhone || '',
    doc.code || '',
  ];

  return searchText.filter(Boolean).join(' ').trim();
};

const BATCH_SIZE = 100;

const command = async () => {
  try {
    await client.connect();
    db = client.db() as Db;

    CPUsers = db.collection('client_portal_users');
    Customers = db.collection('customers');

    const cpUserCursor = CPUsers.find(
      { erxesCustomerId: { $exists: true } },
      { projection: { erxesCustomerId: 1 } },
    )
      .batchSize(BATCH_SIZE)
      .addCursorFlag('noCursorTimeout', true);

    const customerIds: any[] = [];
    for await (const cpUser of cpUserCursor) {
      customerIds.push(cpUser.erxesCustomerId);
    }

    const customerCursor = Customers.find({
      _id: { $in: customerIds },
      $or: [
        { searchText: { $exists: false } },
        { searchText: '' },
        { searchText: null },
      ],
    }).batchSize(BATCH_SIZE);

    let bulkOperations: AnyBulkWriteOperation<Document>[] = [];

    for await (const customer of customerCursor) {
      bulkOperations.push({
        updateOne: {
          filter: { _id: customer._id },
          update: { $set: { searchText: fillSearchText(customer) } },
        },
      });

      if (bulkOperations.length >= BATCH_SIZE) {
        await Customers.bulkWrite(bulkOperations, { ordered: false });
        console.log(`Updated ${bulkOperations.length} customers...`);
        bulkOperations = [];
      }
    }

    if (bulkOperations.length > 0) {
      await Customers.bulkWrite(bulkOperations, { ordered: false });
    }

    console.log(`Process finished at: ${new Date()}`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    process.exit();
  }
};

command();
