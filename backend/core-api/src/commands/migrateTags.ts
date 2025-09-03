import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;
let Tags: Collection;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  Tags = db.collection('tags');

  try {
    await Tags.updateMany(
      {},
      {
        $unset: { type: '', objectCount: '', order: '', scopeBrandIds: '' },
        $set: { isGroup: false, parentId: '' }, // flatten parentId: no nested parent tags allowed
      },
    );
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
    await client.close();
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command();
