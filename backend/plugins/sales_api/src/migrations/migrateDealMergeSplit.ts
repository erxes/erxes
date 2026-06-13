import * as dotenv from 'dotenv';

dotenv.config();

import { Db, MongoClient } from 'mongodb';

/**
 * Migration: deal merge & split support.
 *
 * The merge/split feature only ADDS optional fields to the `deals` collection
 * (mergedIntoId, mergedDealIds, mergedAt, splitSourceId, splitChildIds,
 * splitAt). Existing documents need no data backfill — an absent field simply
 * means "not merged / not split".
 *
 * This script is therefore idempotent and only ensures the supporting indexes
 * exist so look-ups by these fields stay fast on large, pre-existing data sets.
 * `createIndex` is a no-op when the index already exists.
 *
 * Run with:
 *   MONGO_URL=mongodb://localhost:27017/erxes \
 *     npx tsx backend/plugins/sales_api/src/migrations/migrateDealMergeSplit.ts
 */

const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const client = new MongoClient(MONGO_URL);

const command = async () => {
  await client.connect();

  const db: Db = client.db();
  const deals = db.collection('deals');

  await deals.createIndex({ mergedIntoId: 1 });
  await deals.createIndex({ splitSourceId: 1 });
  await deals.createIndex({ mergedDealIds: 1 });
  await deals.createIndex({ splitChildIds: 1 });

  console.log('Deal merge/split indexes ensured.');

  await client.close();
  process.exit(0);
};

command().catch((e) => {
  console.error(e);
  process.exit(1);
});
