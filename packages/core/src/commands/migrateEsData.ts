import * as dotenv from 'dotenv';
const fs = require('fs').promises;

dotenv.config();

import { Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

const indices = [
  'channels',
  'conversations',
  'form_submissions',
  'tasks',
  'companies',
  'customers',
  'users',
  'conformities',
  'deals',
  'pipelines',
  'conversation_messages',
  'fields',
  'tags'
];

const command = async () => {
  await client.connect();
  db = client.db() as Db;
  console.log(`Process finished at: ${new Date()}`);

  for (const index of indices) {
    const data = await fs.readFile(
      `./src/commands/esData/${index}.json`,
      'utf8'
    );

    const collection = db.collection(index);

    console.log('collection: ', await collection.countDocuments());

    try {
      const esData = JSON.parse(data).hits.hits || [];

      console.log(index + ' index is inserting: ', esData.length);

      for (const row of esData) {
        const _id = row._id;

        const data = await collection.findOne({ _id });

        if (!data) {
          try {
            await collection.insertOne({ _id, ...row._source });
          } catch (e) {
            console.log(e.message);
          }
        }
      }
    } catch (err) {
      console.log('Error parsing JSON string:', err);
    }
  }

  process.exit();
};

command();
