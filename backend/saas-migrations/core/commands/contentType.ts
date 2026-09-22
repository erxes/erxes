import * as dotenv from 'dotenv';

dotenv.config();

import { Db, MongoClient } from 'mongodb';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  CORE_MONGO_URL,
  TARGET_SUBDOMAIN,
} = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

if (!TARGET_SUBDOMAIN) {
  throw new Error('Environment variable TARGET_SUBDOMAIN must be set.');
}

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

let db: Db;

const CONTENT_TYPE_REGEX = /^[a-z]+:[a-z]+$/;

const switchContentType = (contentType: string) => {
  if (!contentType || !CONTENT_TYPE_REGEX.test(contentType)) {
    return '';
  }

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
  const coreUrl = CORE_MONGO_URL || MONGO_URL;
  const coreDbName = extractDbName(coreUrl);
  const coreDb = client.db(coreDbName);

  const targetOrg = await coreDb
    .collection('organizations')
    .findOne({ subdomain: TARGET_SUBDOMAIN }, { projection: { _id: 1 } });

  if (!targetOrg) {
    throw new Error(
      `Organization with subdomain "${TARGET_SUBDOMAIN}" not found in ${coreDbName}.organizations`,
    );
  }

  const targetDbName = `erxes_${targetOrg._id}`;
  console.log(`Target: ${TARGET_SUBDOMAIN} → ${targetDbName}`);

  db = client.db(targetDbName) as Db;

  const COLLECTIONS = {
    // IMPORTANT: Do not add collections here unless they have a `type` (contentType) field.
    // This script will break or have no effect if the collection does not contain `type`.

    tags: db.collection('tags'),
  };

  try {
    const models = Object.keys(COLLECTIONS);

    for (const model of models) {
      const collection = COLLECTIONS[model];

      const documents = collection.find({});

      for await (const document of documents) {
        const contentType = switchContentType(
          document?.type || document?.contentType,
        );

        if (!contentType) {
          console.log(
            `Invalid contentType: ${document?.type || document?.contentType} for ${document._id}`,
          );
          continue;
        }

        await collection.updateOne(
          { _id: document._id },
          { $set: { type: contentType } },
        );
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
