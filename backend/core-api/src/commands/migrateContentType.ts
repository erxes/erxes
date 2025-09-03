import * as dotenv from 'dotenv';

dotenv.config();

import { Db, MongoClient } from 'mongodb';

const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

const switchContentType = (contentType: string) => {
  const [pluginName, moduleName] = contentType.split(':');

  switch (pluginName) {
    case 'inbox':
      return `frontline:${moduleName}`;
    default:
      return contentType;
  }
};

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  const COLLECTIONS = {
    // IMPORTANT: Do not add collections here unless they have a `type` (contentType) field.
    // This script will break or have no effect if the collection does not contain `type`.

    tags: db.collection('tags'),
  };

  try {
    const models = Object.keys(COLLECTIONS);

    for (const model of models) {
      const collection = COLLECTIONS[model];

      const documents = await collection.find({}).toArray();

      for (const document of documents) {
        const contentType = switchContentType(document.type);

        await collection.updateOne(
          { _id: document._id },
          { $set: { type: contentType } },
        );
      }
    }
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
    await client.close();
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command();
