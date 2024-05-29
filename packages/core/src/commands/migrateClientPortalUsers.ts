import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let CPUsers: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  CPUsers = db.collection('client_portal_users');

  const indexes = await CPUsers.indexes();

  const indexesToDrop = [
    'email_1',
    'username_1',
    'phone_1',
    'createdAt_1_userName_1_email_1_phone_1'
  ];

  for (const index of indexes) {
    if (indexesToDrop.includes(index.name)) {
      await CPUsers.dropIndex(index.name);
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
