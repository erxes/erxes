import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

// Subdomains derived from the org URLs:
//   old: https://dts.next.erxes.io/         → subdomain "dts"
//   new: https://dtsdistribution.next.erxes.io/ → subdomain "dtsdistribution"
const SOURCE_SUBDOMAIN = 'dts';
const TARGET_SUBDOMAIN = 'dtsdistribution';

async function resolveOrgDb(
  client: MongoClient,
  subdomain: string,
): Promise<string> {
  const coreDb = client.db('erxes');
  const org = await coreDb
    .collection('organizations')
    .findOne({ subdomain }, { projection: { _id: 1 } });

  if (!org) {
    throw new Error(
      `Organization with subdomain "${subdomain}" not found in erxes.organizations`,
    );
  }

  return `erxes_${org._id}`;
}

// Dependency order matters:
// uoms must come before products (products.uom references uom code)
// product_categories must come before products (products.categoryId)
const COLLECTIONS = [
  'uoms', // core — connectionResolvers: models.Uoms
  'product_categories', // core — models.ProductCategories
  'posclient_product_categories', // POS plugin copy
  'products', // core — models.Products
  'posclient_products', // POS plugin copy
  'product_groups', // POS plugin
  'product_packages', // core — models.Packages (bundles of products)
  'product_rules', // core — models.ProductRules
  'products_configs', // core — models.ProductsConfigs
  'posclient_products_configs', // POS — models.ProductsConfigs (posclient_api)
];

// Collections that enforce a unique `code` field (skip on conflict)
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

  // Build a set of existing codes/ids in target to detect conflicts
  const existingIds = new Set<string>();
  const existingCodes = new Set<string>();

  const existingCursor = dstCol.find({}, { projection: { _id: 1, code: 1 } });
  for await (const doc of existingCursor) {
    existingIds.add(String(doc._id));
    if (doc.code) existingCodes.add(String(doc.code));
  }

  const cursor = srcCol.find({});

  for await (const doc of cursor) {
    const id = String(doc._id);

    // Skip if _id already exists in target
    if (existingIds.has(id)) {
      console.log(
        `  [SKIP] ${collectionName}: _id "${id}" already exists in target`,
      );
      stats.skipped++;
      continue;
    }

    // Skip if code already exists in target (unique constraint)
    if (hasCodeField && doc.code && existingCodes.has(String(doc.code))) {
      console.log(
        `  [SKIP] ${collectionName}: code "${doc.code}" already exists in target`,
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
      // Duplicate key errors (race condition or missed check)
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
  const baseUrl = MONGO_URL.split('/').slice(0, -1).join('/');
  const client = new MongoClient(baseUrl);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const sourceDbName = await resolveOrgDb(client, SOURCE_SUBDOMAIN);
    const targetDbName = await resolveOrgDb(client, TARGET_SUBDOMAIN);

    const srcDb: Db = client.db(sourceDbName);
    const dstDb: Db = client.db(targetDbName);

    console.log(`\nSource: ${SOURCE_SUBDOMAIN} → ${sourceDbName}`);
    console.log(`Target: ${TARGET_SUBDOMAIN} → ${targetDbName}\n`);

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
    console.log('\nDisconnected from MongoDB');
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
