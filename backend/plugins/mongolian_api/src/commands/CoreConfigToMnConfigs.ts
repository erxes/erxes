import * as dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import { Collection, Db, MongoClient } from 'mongodb';

dotenv.config();

const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  OVERWRITE_MN_CONFIGS,
  DELETE_CORE_MN_CONFIGS,
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const client = new MongoClient(MONGO_URL);

let db: Db;
let CoreConfigs: Collection;
let MNConfigs: Collection;

const subIdConfigCodes = new Set([
  'stageInEbarimt',
  'posInEbarimt',
  'returnStageInEbarimt',
  'dealsProductsDataPrint',
  'dealsProductsDataSplit',
  'dealsProductsDataPlaces',
  'dealsProductsDefaultFilter',
  'dealsSplitConfig',
  'dealsPrintConfig',
  'ebarimtConfig',
  'returnEbarimtConfig',
  'stageInMoveConfig',
  'stageInIncomeConfig',
  'remainderConfig',
  'DYNAMIC',
]);

const configCodes = ['EBARIMT', ...subIdConfigCodes, 'DYNAMIC', 'ERKHET'];

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const asMnConfigDocs = ({ code, value }: { code: string; value: unknown }) => {
  if (!subIdConfigCodes.has(code)) {
    return [{ code, subId: '', value }];
  }

  if (!isPlainObject(value)) {
    return [{ code, subId: '', value }];
  }

  return Object.keys(value).map((subId) => ({
    code,
    subId,
    value: value[subId],
  }));
};

const command = async () => {
  await client.connect();

  db = client.db();
  CoreConfigs = db.collection('configs');
  MNConfigs = db.collection('mongolian_configs');

  await MNConfigs.createIndex({ code: 1, subId: 1 }, { unique: true });

  console.log(`Process start at: ${new Date().toISOString()}`);

  let migratedCount = 0;
  const migratedCoreCodes: string[] = [];

  for (const code of configCodes) {
    const coreConfig = await CoreConfigs.findOne({ code });

    if (!coreConfig) {
      continue;
    }

    const docs = asMnConfigDocs({ code, value: coreConfig.value }).filter(
      (doc) => doc.value !== undefined,
    );

    if (!docs.length) {
      continue;
    }

    const now = new Date();
    const bulkOps = docs.map(({ subId, value }) => ({
      updateOne: {
        filter: { code, subId },
        update:
          OVERWRITE_MN_CONFIGS === 'true'
            ? {
                $set: {
                  value,
                  updatedAt: now,
                },
                $setOnInsert: {
                  _id: nanoid(),
                  code,
                  subId,
                  createdAt: now,
                },
              }
            : {
                $setOnInsert: {
                  _id: nanoid(),
                  code,
                  subId,
                  value,
                  createdAt: now,
                  updatedAt: now,
                },
              },
        upsert: true,
      },
    }));

    const result = await MNConfigs.bulkWrite(bulkOps, { ordered: false });
    migratedCount += result.upsertedCount + result.modifiedCount;
    migratedCoreCodes.push(code);

    console.log(
      `${code}: prepared ${docs.length}, upserted ${result.upsertedCount}, modified ${result.modifiedCount}`,
    );
  }

  if (DELETE_CORE_MN_CONFIGS === 'true' && migratedCoreCodes.length) {
    const deleteResult = await CoreConfigs.deleteMany({
      code: { $in: migratedCoreCodes },
    });

    console.log(`Deleted ${deleteResult.deletedCount} core configs`);
  }

  console.log(`Migrated ${migratedCount} mongolian config documents`);
  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
