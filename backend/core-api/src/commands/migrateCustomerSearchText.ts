import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Customers: Collection<any>;
let CPUsers: Collection<any>;

const fillSearchText = (doc) => {
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
  await client.connect();
  db = client.db() as Db;

  CPUsers = db.collection('client_portal_users');
  Customers = db.collection('customers');

  const cursor = CPUsers.find({ erxesCustomerId: { $exists: true } }).batchSize(BATCH_SIZE);

  let bulkOperations: any[] = [];

  for await (const cpUser of cursor) {
    const customer = await Customers.findOne({
      _id: cpUser.erxesCustomerId,
      $or: [
        { searchText: { $exists: false } },
        { searchText: '' },
        { searchText: null },
      ],
    });

    if (!customer) continue;

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

  await client.close();
  process.exit();
};

command();
