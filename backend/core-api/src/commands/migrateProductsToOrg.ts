import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',

  CORE_MONGO_URL,
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

//   old: https://dts.next.erxes.io/              → subdomain "dts"
//   new: https://dtsdistribution.next.erxes.io/  → subdomain "dtsdistribution"
const SOURCE_SUBDOMAIN = 'dts';
const TARGET_SUBDOMAIN = 'dtsdistribution';

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

const COLLECTIONS = [
  'uoms',
  'product_categories',
  'posclient_product_categories',
  'products',
  'posclient_products',
  'product_groups',
  'product_packages',
  'product_rules',
  'products_configs',
  'posclient_products_configs',
];

const UNIQUE_CODE_COLLECTIONS = new Set([
  'uoms',
  'product_categories',
  'posclient_product_categories',
  'products',
  'posclient_products',
  'products_configs',
  'posclient_products_configs',
]);

async function migrateCollection(
  srcCol: Collection,
  dstCol: Collection,
  collectionName: string,
): Promise<{ inserted: number; skipped: number; errors: number }> {
  const stats = { inserted: 0, skipped: 0, errors: 0 };

  const hasCodeField = UNIQUE_CODE_COLLECTIONS.has(collectionName);

  const existingIds = new Set<string>();
  const existingCodes = new Set<string>();

  for await (const doc of dstCol.find(
    {},
    { projection: { _id: 1, code: 1 } },
  )) {
    existingIds.add(String(doc._id));
    if (doc.code) existingCodes.add(String(doc.code));
  }

  for await (const doc of srcCol.find({})) {
    const id = String(doc._id);

    if (existingIds.has(id)) {
      console.log(`  [SKIP] ${collectionName}: _id "${id}" already exists`);
      stats.skipped++;
      continue;
    }

    if (hasCodeField && doc.code && existingCodes.has(String(doc.code))) {
      console.log(
        `  [SKIP] ${collectionName}: code "${doc.code}" already exists`,
      );
      stats.skipped++;
      continue;
    }

    try {
      await dstCol.insertOne(doc);
      existingIds.add(id);
      if (doc.code) existingCodes.add(String(doc.code));
      stats.inserted++;
    } catch (err: any) {
      if (err.code === 11000) {
        console.log(
          `  [SKIP] ${collectionName}: duplicate key for _id "${id}": ${err.message}`,
        );
        stats.skipped++;
      } else {
        console.error(
          `  [ERROR] ${collectionName}: failed to insert _id "${id}": ${err.message}`,
        );
        stats.errors++;
      }
    }
  }

  return stats;
}

async function main() {
  const coreUrl = CORE_MONGO_URL || MONGO_URL;
  const coreDbName = extractDbName(coreUrl);

  const client = new MongoClient(coreUrl);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    console.log(`Core DB: ${coreDbName}`);

    const coreDb = client.db(coreDbName);

    const sourceOrg = await coreDb
      .collection('organizations')
      .findOne({ subdomain: SOURCE_SUBDOMAIN }, { projection: { _id: 1 } });

    if (!sourceOrg) {
      throw new Error(
        `Organization with subdomain "${SOURCE_SUBDOMAIN}" not found in ${coreDbName}.organizations`,
      );
    }

    const targetOrg = await coreDb
      .collection('organizations')
      .findOne({ subdomain: TARGET_SUBDOMAIN }, { projection: { _id: 1 } });

    if (!targetOrg) {
      throw new Error(
        `Organization with subdomain "${TARGET_SUBDOMAIN}" not found in ${coreDbName}.organizations`,
      );
    }

    const sourceDbName = `erxes_${sourceOrg._id}`;
    const targetDbName = `erxes_${targetOrg._id}`;

    console.log(`\nSource: ${SOURCE_SUBDOMAIN} → ${sourceDbName}`);
    console.log(`Target: ${TARGET_SUBDOMAIN} → ${targetDbName}\n`);

    const srcDb: Db = client.db(sourceDbName);
    const dstDb: Db = client.db(targetDbName);

    const summary: Record<
      string,
      { inserted: number; skipped: number; errors: number }
    > = {};

    for (const colName of COLLECTIONS) {
      const srcCol = srcDb.collection(colName);
      const srcCount = await srcCol.countDocuments();

      if (srcCount === 0) {
        console.log(`[${colName}] No documents — skipping`);
        summary[colName] = { inserted: 0, skipped: 0, errors: 0 };
        continue;
      }

      console.log(`[${colName}] Migrating ${srcCount} documents...`);
      const stats = await migrateCollection(
        srcCol,
        dstDb.collection(colName),
        colName,
      );
      summary[colName] = stats;
      console.log(
        `[${colName}] Done — inserted: ${stats.inserted}, skipped: ${stats.skipped}, errors: ${stats.errors}`,
      );
    }

    console.log('\n=== Migration Summary ===');
    let totalInserted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const [col, stats] of Object.entries(summary)) {
      console.log(
        `  ${col.padEnd(40)} inserted: ${stats.inserted}, skipped: ${stats.skipped}, errors: ${stats.errors}`,
      );
      totalInserted += stats.inserted;
      totalSkipped += stats.skipped;
      totalErrors += stats.errors;
    }

    console.log(
      `\n  TOTAL: inserted: ${totalInserted}, skipped: ${totalSkipped}, errors: ${totalErrors}`,
    );

    if (totalErrors > 0) {
      console.warn(
        '\nWARNING: Some documents failed to migrate. Check logs above.',
      );
      process.exit(1);
    }
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
