import * as dotenv from 'dotenv';
import { Db, MongoClient } from 'mongodb';
import { getTargetDbs } from './_organizationDbs';

dotenv.config();

const {
  CORE_MONGO_URL,
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  DRY_RUN,
} = process.env;

const isDryRun = DRY_RUN === '1' || DRY_RUN === 'true';

const EPOCH = new Date(0);
const DATE_FIELDS = ['startDate', 'closeDate'] as const;

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

const migrateDb = async (db: Db) => {
  const deals = db.collection('deals');

  for (const field of DATE_FIELDS) {
    const filter = { [field]: EPOCH };

    if (isDryRun) {
      const count = await deals.countDocuments(filter);
      console.log(`[DRY RUN] ${field}: ${count} deals hold 1970-01-01`);
      continue;
    }

    const result = await deals.updateMany(filter, { $unset: { [field]: '' } });
    console.log(
      `[DONE] ${field}: matched=${result.matchedCount} modified=${result.modifiedCount}`,
    );
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
