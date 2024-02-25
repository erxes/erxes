import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';
const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;
let SyncedCustomers: Collection<any>;
let SyncedContacts: Collection<any>;

const command = async () => {
  console.log(`starting ... ${MONGO_URL}`);

  await client.connect();
  console.log('db connected ...');

  db = client.db();

  SyncedCustomers = db.collection('synced_saas_customers');
  SyncedContacts = db.collection('synced_saas_contacts');

  const syncedCustomers = await SyncedCustomers.find({}).toArray();

  console.log(`found syncedCustomers: ${syncedCustomers?.length || 0}`);

  console.log('start generating contacts');

  const generatedSyncedContacts = syncedCustomers.map(
    ({ _id, syncId, status, createdAt, customerId, syncedCustomerId }) => ({
      _id,
      syncId,
      status,
      createdAt,
      contactTypeId: customerId,
      contactType: 'customer',
      syncedContactTypeId: syncedCustomerId,
    }),
  );

  console.log('generating contacts done');

  try {
    await SyncedContacts.insertMany(generatedSyncedContacts);
  } catch (error) {
    console.log(`Error inserting:${error.message}`);
  }

  process.exit();
};

command();
