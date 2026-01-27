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

const toObject = (customFieldsData, fields) => {
  const customFields = {};

  for (const customField of customFieldsData) {
    const field = fields.find((field) => field._id === customField.field);

    customFields[field?.code || customField.field] = customField.value;
  }

  return customFields;
};

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  const CONTENT_TYPE_COLLECTIONS = {
    // IMPORTANT: Do not add collections here unless they have a `customFieldsData` field.
    // This script will break or have no effect if the collection does not contain `customFieldsData`.

    // core:modules: collection
    'core:customer': db.collection('customers'),
    'core:company': db.collection('companies'),
    'core:product': db.collection('products'),
    'core:user': db.collection('users'),

    // plugin:modules: collection
  };

  try {
    const contentTypes = Object.keys(CONTENT_TYPE_COLLECTIONS);

    for (const contentType of contentTypes) {
      const collection = CONTENT_TYPE_COLLECTIONS[contentType];

      const documents = collection.find({});

      const fields = await db.collection('properties_fields').find({ contentType }).toArray();

      for await (const document of documents) {

        if (!document.customFieldsData || typeof document.customFieldsData === 'object') {
          continue;
        }

        try {
            const customFieldsData = toObject(document.customFieldsData, fields);

            await collection.updateOne(
            { _id: document._id },
            { $set: { customFieldsData } },
            );
        } catch (error) {
            console.log(`Error occurred for ${contentType} document: ${document._id}: ${error.message}`);
        }
      }
    }
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command();
