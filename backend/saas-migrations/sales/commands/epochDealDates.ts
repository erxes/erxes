import * as dotenv from 'dotenv';
import { Collection, Db, MongoClient } from 'mongodb';
import { getTargetDbs } from '../../core/commands/_organizationDbs';

dotenv.config();

const {
  CORE_MONGO_URL,
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  DRY_RUN,
} = process.env;

const isDryRun = DRY_RUN !== '0' && DRY_RUN !== 'false';

const EPOCH = new Date(0);
const DATE_FIELDS = ['startDate', 'closeDate'] as const;

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

const migrateField = async (
  deals: Collection,
  field: (typeof DATE_FIELDS)[number],
) => {
  const filter = { [field]: { $eq: EPOCH, $not: { $type: 'array' } } };

  if (isDryRun) {
    const count = await deals.countDocuments(filter);
    return `[DRY RUN] ${field}: ${count} deals hold 1970-01-01`;
  }

  const result = await deals.updateMany(filter, { $unset: { [field]: '' } });
  return `[DONE] ${field}: matched=${result.matchedCount} modified=${result.modifiedCount}`;
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
    const { reason } = result;
    console.error(
      `[FAILED] ${DATE_FIELDS[index]}: ${
        reason instanceof Error ? reason.message : reason
      }`,
    );
  });

  if (results.some((result) => result.status === 'rejected')) {
    throw new Error('deal date update failed');
  }
};

const command = async () => {
  await client.connect();

  console.log(
    `Process start at: ${new Date().toISOString()}${
      isDryRun ? ' (dry run)' : ''
    }`,
  );

  const failed: string[] = [];

  for (const { label, db } of await getTargetDbs(client)) {
    console.log(`\n== ${label}`);

    try {
      await migrateDb(db);
    } catch (error) {
      failed.push(label);
      console.error(
        `[FAILED] ${label}: ${error instanceof Error ? error.message : error}`,
      );
    }
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
