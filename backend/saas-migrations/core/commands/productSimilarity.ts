import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

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
let Products: Collection;

function pickKeeper(docs: any[]): any {
  return docs.reduce((oldest, doc) => {
    if (!oldest) return doc;

    const oldestCreatedAt = new Date(oldest.createdAt || 0).getTime();
    const docCreatedAt = new Date(doc.createdAt || 0).getTime();

    return docCreatedAt < oldestCreatedAt ? doc : oldest;
  }, undefined);
}

const BATCH_SIZE = 500;

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
  Products = db.collection('products');

  try {
    const duplicateGroups = await Products.aggregate([
      { $match: { name: { $exists: true, $nin: [null, ''] } } },
      { $group: { _id: '$name', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } },
    ], { allowDiskUse: true }).toArray();

    console.log(`Found ${duplicateGroups.length} duplicate name group(s).`);

    let groupsProcessed = 0;
    let deletedDocs = 0;

    for (let i = 0; i < duplicateGroups.length; i += BATCH_SIZE) {
      const batch = duplicateGroups.slice(i, i + BATCH_SIZE);
      const ids = batch.flatMap((group) => group.ids);

      const docs = await Products.find(
        { _id: { $in: ids } },
        { projection: { name: 1, createdAt: 1 } },
      ).toArray();

      const docsByName = new Map<string, any[]>();
      for (const doc of docs) {
        const list = docsByName.get(doc.name) || [];
        list.push(doc);
        docsByName.set(doc.name, list);
      }

      const deleteIds: any[] = [];

      for (const group of batch) {
        const groupDocs = docsByName.get(group._id) || [];
        if (groupDocs.length < 2) continue;

        const keeper = pickKeeper(groupDocs);
        const duplicateIds = groupDocs
          .filter((doc) => String(doc._id) !== String(keeper._id))
          .map((doc) => doc._id);

        console.log(
          `"${group._id}": keeping ${keeper._id}, deleting ${duplicateIds.length} duplicate(s) [${duplicateIds.join(', ')}]`,
        );

        deleteIds.push(...duplicateIds);
        groupsProcessed += 1;
        deletedDocs += duplicateIds.length;
      }

      if (deleteIds.length) {
        await Products.deleteMany({ _id: { $in: deleteIds } });
      }
    }

    console.log(
      `Deduped ${groupsProcessed} group(s), deleted ${deletedDocs} duplicate document(s).`,
    );
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
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
