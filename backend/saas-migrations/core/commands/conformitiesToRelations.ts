import * as dotenv from 'dotenv';
import { Collection, Db, Document, MongoClient } from 'mongodb';

dotenv.config();

const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  CORE_MONGO_URL,
  TARGET_SUBDOMAIN,
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
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
let Conformities: Collection;
let Relations: Collection;

const confTypeRelType: Record<string, string> = {
  customer: 'core:customer',
  company: 'core:company',
  product: 'core:product',
  deal: 'sales:deal',
  ticket: 'frontline:ticket',
};

const BATCH_SIZE = 5000;

const conformityFilter = {
  _synced: { $ne: true },
  _syncSkipped: { $ne: true },
};

const isConvertible = (conformity: Document): boolean =>
  Boolean(
    confTypeRelType[conformity.mainType] &&
      confTypeRelType[conformity.relType] &&
      conformity.mainTypeId &&
      conformity.relTypeId,
  );

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

  db = client.db(targetDbName);
  Conformities = db.collection('conformities');
  Relations = db.collection('relations');

  await Relations.createIndex({ _conformityId: 1 });
  await Conformities.createIndex({ _synced: 1 });

  console.log(`Process start at: ${new Date().toISOString()}`);

  let migratedCount = 0;
  const skippedByType = new Map<string, number>();

  while (true) {
    const batch = await Conformities.find(conformityFilter)
      .sort({ _id: 1 })
      .limit(BATCH_SIZE)
      .toArray();

    if (!batch.length) {
      break;
    }

    const conformities = batch.filter(isConvertible);
    const skipped = batch.filter((conformity) => !isConvertible(conformity));

    for (const conformity of skipped) {
      const key = `${conformity.mainType}→${conformity.relType}`;
      skippedByType.set(key, (skippedByType.get(key) || 0) + 1);
    }

    if (skipped.length) {
      await Conformities.updateMany(
        { _id: { $in: skipped.map((conformity) => conformity._id) } },
        { $set: { _syncSkipped: true } },
      );
    }

    if (!conformities.length) {
      continue;
    }

    const now = new Date();
    const bulkOps = conformities.map((conformity) => ({
      updateOne: {
        filter: {
          _conformityId: conformity._id,
        },
        update: {
          $set: {
            entities: [
              {
                contentType: confTypeRelType[conformity.mainType],
                contentId: conformity.mainTypeId,
              },
              {
                contentType: confTypeRelType[conformity.relType],
                contentId: conformity.relTypeId,
              },
            ],
            _conformityId: conformity._id,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        upsert: true,
      },
    }));

    await Relations.bulkWrite(bulkOps, { ordered: false });
    await Conformities.updateMany(
      { _id: { $in: conformities.map((conformity) => conformity._id) } },
      { $set: { _synced: true } },
    );

    migratedCount += conformities.length;
    console.log(`Migrated ${migratedCount} conformities`);
  }

  for (const [types, count] of skippedByType) {
    console.log(
      `[SKIP] ${count} conformity(ies) of ${types}: unsupported type or missing id`,
    );
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
