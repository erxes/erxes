import * as dotenv from 'dotenv';
import { randomFillSync } from 'node:crypto';
import { Collection, Db, Document, MongoClient } from 'mongodb';

dotenv.config();

const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  CORE_MONGO_URL,
  TARGET_SUBDOMAIN,
  DRY_RUN,
  OVERWRITE_EXISTING,
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

if (!TARGET_SUBDOMAIN) {
  throw new Error('Environment variable TARGET_SUBDOMAIN must be set.');
}

const isDryRun = DRY_RUN === '1' || DRY_RUN === 'true';
const overwriteExisting =
  OVERWRITE_EXISTING === '1' || OVERWRITE_EXISTING === 'true';

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

const ID_ALPHABET =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

const generateId = (size = 21): string => {
  const bytes = randomFillSync(new Uint8Array(size));
  let id = '';

  for (let index = 0; index < size; index++) {
    id += ID_ALPHABET[bytes[index] & 63];
  }

  return id;
};

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

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

const configCodes = ['EBARIMT', 'ERKHET', ...subIdConfigCodes];

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const asMnConfigDocs = (code: string, value: unknown) => {
  if (!subIdConfigCodes.has(code) || !isPlainObject(value)) {
    return [{ subId: '', value }];
  }

  return Object.keys(value).map((subId) => ({ subId, value: value[subId] }));
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
  if (isDryRun) console.log('** DRY RUN — no data will be written **');

  db = client.db(targetDbName);
  CoreConfigs = db.collection('configs');
  MNConfigs = db.collection('mongolian_configs');

  const totals = { inserted: 0, updated: 0, skipped: 0 };

  for (const code of configCodes) {
    const coreConfig = await CoreConfigs.findOne({ code });

    if (!coreConfig) {
      continue;
    }

    const docs = asMnConfigDocs(code, coreConfig.value).filter(
      (doc) => doc.value !== undefined,
    );

    if (!docs.length) {
      continue;
    }

    const existing = await MNConfigs.find({
      code,
      subId: { $in: docs.map((doc) => doc.subId) },
    }).toArray();
    const existingBySubId = new Map<string, Document>(
      existing.map((doc) => [String(doc.subId ?? ''), doc]),
    );

    const now = new Date();
    const inserts: Document[] = [];
    const replaces: Document[] = [];
    let skipped = 0;

    for (const { subId, value } of docs) {
      const current = existingBySubId.get(subId);

      if (!current) {
        inserts.push({
          _id: generateId(),
          code,
          subId,
          value,
          createdAt: now,
          updatedAt: now,
        });
      } else if (overwriteExisting) {
        replaces.push({ ...current, value, updatedAt: now });
      } else {
        skipped++;
      }
    }

    if (!isDryRun) {
      if (inserts.length) {
        await MNConfigs.insertMany(inserts, { ordered: false });
      }

      if (replaces.length) {
        await MNConfigs.bulkWrite(
          replaces.map((doc) => ({
            replaceOne: { filter: { _id: doc._id }, replacement: doc },
          })),
          { ordered: false },
        );
      }
    }

    totals.inserted += inserts.length;
    totals.updated += replaces.length;
    totals.skipped += skipped;

    console.log(
      `${code}: ${docs.length} config(s) — inserted ${inserts.length}, updated ${replaces.length}, skipped ${skipped}`,
    );
  }

  console.log(
    `TOTAL: inserted ${totals.inserted}, updated ${totals.updated}, skipped ${totals.skipped}`,
  );
  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
