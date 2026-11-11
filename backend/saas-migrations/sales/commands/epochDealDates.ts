import * as dotenv from 'dotenv';
import { Collection, Db, MongoClient } from 'mongodb';
import { getTargetDbBatches, TTargetDb } from './_organizationDbs';

dotenv.config();

const {
  CORE_MONGO_URL,
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  DRY_RUN,
  ALL_ORGS,
  TARGET_SUBDOMAIN,
  ORG_BATCH_SIZE = '50',
  BATCH_SIZE = '1000',
  BATCH_PAUSE_MS = '1000',
} = process.env;

const isDryRun = DRY_RUN !== '0' && DRY_RUN !== 'false';
const orgBatchSize = Math.max(1, Number(ORG_BATCH_SIZE) || 50);
const batchSize = Math.max(1, Number(BATCH_SIZE) || 1000);
const batchPauseMs = Math.max(0, Number(BATCH_PAUSE_MS) || 0);

const EPOCH = new Date(0);
const DATE_FIELDS = ['startDate', 'closeDate'] as const;

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

const pause = () => new Promise((resolve) => setTimeout(resolve, batchPauseMs));

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const migrateField = async (
  deals: Collection,
  field: (typeof DATE_FIELDS)[number],
) => {
  const filter = { [field]: { $eq: EPOCH, $not: { $type: 'array' } } };

  if (isDryRun) {
    const count = await deals.countDocuments(filter);
    return `[DRY RUN] ${field}: ${count} deals hold 1970-01-01`;
  }

  let matched = 0;
  let modified = 0;

  while (true) {
    const batch = await deals
      .find(filter, { projection: { _id: 1 } })
      .limit(batchSize)
      .toArray();

    if (!batch.length) {
      break;
    }

    const result = await deals.updateMany(
      { ...filter, _id: { $in: batch.map((deal) => deal._id) } },
      { $unset: { [field]: '' } },
    );

    matched += result.matchedCount;
    modified += result.modifiedCount;

    if (!result.modifiedCount) {
      break;
    }
  }

  return `[DONE] ${field}: matched=${matched} modified=${modified}`;
};

const migrateDb = async (db: Db) => {
  const deals = db.collection('deals');

  const results = await Promise.allSettled(
    DATE_FIELDS.map((field) => migrateField(deals, field)),
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(result.value);
      return;
    }
    console.error(
      `[FAILED] ${DATE_FIELDS[index]}: ${errorMessage(result.reason)}`,
    );
  });

  if (results.some((result) => result.status === 'rejected')) {
    throw new Error('deal date update failed');
  }
};

const migrateTargets = async (targets: TTargetDb[]) => {
  const failed: string[] = [];

  for (const { label, db } of targets) {
    console.log(`\n== ${label}`);

    try {
      await migrateDb(db);
    } catch (error) {
      failed.push(label);
      console.error(`[FAILED] ${label}: ${errorMessage(error)}`);
    }
  }

  return failed;
};

const command = async () => {
  if (ALL_ORGS === 'true' && TARGET_SUBDOMAIN) {
    throw new Error('Set either ALL_ORGS or TARGET_SUBDOMAIN, not both');
  }

  await client.connect();

  console.log(
    `Process start at: ${new Date().toISOString()}${
      isDryRun ? ' (dry run)' : ''
    }`,
  );

  const failed: string[] = [];
  let batchCount = 0;

  for await (const targets of getTargetDbBatches(client, orgBatchSize)) {
    if (batchCount && batchPauseMs) {
      await pause();
    }

    batchCount += 1;
    failed.push(...(await migrateTargets(targets)));
  }

  if (failed.length) {
    console.error(`\nFailed:\n  ${failed.join('\n  ')}`);
  }

  if (isDryRun) {
    console.log('\nDry run done. Re-run with DRY_RUN=0 to apply.');
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit(failed.length ? 1 : 0);
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
