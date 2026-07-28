import * as dotenv from 'dotenv';

dotenv.config();

import { AnyBulkWriteOperation, Collection, Db, MongoClient } from 'mongodb';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  CORE_MONGO_URL,


  SOURCE_SUBDOMAIN = 'msmgroup',
  TARGET_SUBDOMAIN = 'msmgroupp',

  DRY_RUN,

  BATCH_SIZE = '1000',
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

if (!SOURCE_SUBDOMAIN || !TARGET_SUBDOMAIN) {
  throw new Error(
    'Environment variables SOURCE_SUBDOMAIN and TARGET_SUBDOMAIN must be set.',
  );
}

const isDryRun = DRY_RUN === '1' || DRY_RUN === 'true';
const batchSize = Math.max(1, parseInt(BATCH_SIZE, 10) || 1000);

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

const COLLECTIONS = [
  'agents',
  'assignments',
  'assignment_campaigns',
  'branches',
  'coupon_campaigns',
  'coupons',
  'customers',
  'departments',
  'donate_campaigns',
  'donates',
  'ecommerce_address',
  'ecommerce_lastvieweditem',
  'ecommerce_productreview',
  'ecommerce_wishlist',
  'lotteries',
  'lottery_campaigns',
  'loyalty_configs',
  'pos',
  'pos_covers',
  'pos_orders',
  'pos_slots',
  'posclient_product_categories',
  'posclient_products',
  'posclient_products_configs',
  'pricings',
  'product_categories',
  'product_groups',
  'product_packages',
  'product_rules',
  'products',
  'products_configs',
  'score_campaigns',
  'score_logs',
  'uoms',
  'users',
];

type CollectionStats = {
  sourceCount: number;
  inserted: number;
  updated: number;
};

async function migrateCollection(
  srcCol: Collection,
  dstCol: Collection,
  sourceCount: number,
): Promise<CollectionStats> {
  const stats: CollectionStats = {
    sourceCount,
    inserted: 0,
    updated: 0,
  };

  let batch: AnyBulkWriteOperation[] = [];

  const flush = async () => {
    if (batch.length === 0) {
      return;
    }

    const result = await dstCol.bulkWrite(batch, { ordered: false });
    // Newly created documents (did not exist in target).
    stats.inserted += result.upsertedCount;
    // Documents that already existed and were replaced.
    stats.updated += result.matchedCount;
    batch = [];
  };

  const cursor = srcCol.find({}, { batchSize });

  for await (const doc of cursor) {
    batch.push({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true,
      },
    });

    if (batch.length >= batchSize) {
      await flush();
    }
  }

  await flush();

  return stats;
}

async function main() {
  const coreUrl = CORE_MONGO_URL || MONGO_URL;
  const coreDbName = extractDbName(coreUrl);

  const client = new MongoClient(coreUrl);

  const errors: { collection: string; error: string }[] = [];
  const summary: Record<string, CollectionStats> = {};

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    console.log(`Core DB: ${coreDbName}`);
    if (isDryRun) {
      console.log('** DRY RUN — no data will be written **');
    }

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
    console.log(`Target: ${TARGET_SUBDOMAIN} → ${targetDbName}`);
    console.log(`Batch size: ${batchSize}\n`);

    const srcDb: Db = client.db(sourceDbName);
    const dstDb: Db = client.db(targetDbName);

    for (const colName of COLLECTIONS) {
      try {
        const srcCol = srcDb.collection(colName);
        const sourceCount = await srcCol.countDocuments();

        if (sourceCount === 0) {
          console.log(`[${colName}] source count: 0 — skipping`);
          summary[colName] = { sourceCount: 0, inserted: 0, updated: 0 };
          continue;
        }

        if (isDryRun) {
          console.log(
            `[${colName}] source count: ${sourceCount} (dry run — nothing written)`,
          );
          summary[colName] = { sourceCount, inserted: 0, updated: 0 };
          continue;
        }

        console.log(`[${colName}] migrating ${sourceCount} documents...`);

        const stats = await migrateCollection(
          srcCol,
          dstDb.collection(colName),
          sourceCount,
        );

        summary[colName] = stats;
        console.log(
          `[${colName}] done — source: ${stats.sourceCount}, inserted: ${stats.inserted}, updated: ${stats.updated}`,
        );
      } catch (err: any) {
        const message = err?.message || String(err);
        console.error(`[${colName}] FAILED — ${message}`);
        errors.push({ collection: colName, error: message });
      }
    }

    console.log('\n=== Migration Summary ===');
    let totalSource = 0;
    let totalInserted = 0;
    let totalUpdated = 0;

    for (const [col, stats] of Object.entries(summary)) {
      console.log(
        `  ${col.padEnd(32)} source: ${String(stats.sourceCount).padStart(
          7,
        )}  inserted: ${String(stats.inserted).padStart(7)}  updated: ${String(
          stats.updated,
        ).padStart(7)}`,
      );
      totalSource += stats.sourceCount;
      totalInserted += stats.inserted;
      totalUpdated += stats.updated;
    }

    console.log(
      `\n  TOTAL: source: ${totalSource}, inserted: ${totalInserted}, updated: ${totalUpdated}`,
    );

    if (errors.length > 0) {
      console.error('\n=== Errors ===');
      for (const { collection, error } of errors) {
        console.error(`  [${collection}] ${error}`);
      }
      console.error(`\n${errors.length} collection(s) failed to migrate.`);
      process.exit(1);
    }

    console.log('\nMigration completed successfully.');
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

