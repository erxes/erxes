import * as dotenv from 'dotenv';

dotenv.config();

import { AnyBulkWriteOperation, Collection, Db, MongoClient } from 'mongodb';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  CORE_MONGO_URL,

  SOURCE_SUBDOMAIN,
  TARGET_SUBDOMAIN,

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
  // bms
  'bm_elements',
  'bm_element_categories',
  'bm_element_translations',
  'bm_itinerary',
  'bm_itinerary_translations',
  'bm_tours',
  'bm_tour_translations',
  'bm_tour_categories',
  'bm_tour_category_translations',
  'bm_custom_tour_types',
  'bm_custom_tour_groups',
  'bm_orders',
  'bm_branch',

  // ota
  'ota_hotels',
  'ota_room_types',
  'ota_availabilities',
  'ota_bookings',
  'ota_tours',
  'ota_tour_availabilities',
  'ota_tour_categories',
  'ota_tour_bookings',
  'ota_reviews',

  // pms
  'pms_branches',
  'pms_cleanings',
  'pms_cleaning_histories',
  'pms_configs',
];


const UNIQUE_FIELDS: Record<string, string[]> = {
  ota_tour_categories: ['slug'],
  pms_configs: ['code'],
};

type CollectionStats = {
  sourceCount: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
};

const emptyStats = (sourceCount = 0): CollectionStats => ({
  sourceCount,
  inserted: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
});

const normalizeValue = (field: string, value: unknown): string => {
  const str = String(value ?? '');
  return field === 'email' ? str.toLowerCase().trim() : str;
};


async function migrateByReplace(
  srcCol: Collection,
  dstCol: Collection,
  sourceCount: number,
): Promise<CollectionStats> {
  const stats = emptyStats(sourceCount);

  let batch: AnyBulkWriteOperation[] = [];

  const flush = async () => {
    if (batch.length === 0) return;
    const result = await dstCol.bulkWrite(batch, { ordered: false });
    stats.inserted += result.upsertedCount;
    stats.updated += result.matchedCount;
    batch = [];
  };

  for await (const doc of srcCol.find({}, { batchSize })) {
    batch.push({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true,
      },
    });

    if (batch.length >= batchSize) await flush();
  }

  await flush();

  return stats;
}

/**
 * Dedup-aware insert for collections with unique indexes. Skips any source doc
 * whose `_id` or any unique field already exists in the target (or earlier in
 * this run), inserts the rest verbatim.
 */
async function migrateWithDedup(
  srcCol: Collection,
  dstCol: Collection,
  uniqueFields: string[],
  sourceCount: number,
): Promise<CollectionStats> {
  const stats = emptyStats(sourceCount);

  const existingIds = new Set<string>();
  const existingByField: Record<string, Set<string>> = {};
  for (const field of uniqueFields) existingByField[field] = new Set<string>();

  const projection: Record<string, 1> = { _id: 1 };
  for (const field of uniqueFields) projection[field] = 1;

  for await (const doc of dstCol.find({}, { projection })) {
    existingIds.add(String(doc._id));
    for (const field of uniqueFields) {
      if (doc[field] !== undefined && doc[field] !== null) {
        existingByField[field].add(normalizeValue(field, doc[field]));
      }
    }
  }

  let batch: any[] = [];

  const flush = async () => {
    if (batch.length === 0) return;
    try {
      const result = await dstCol.insertMany(batch, { ordered: false });
      stats.inserted += result.insertedCount;
    } catch (err: any) {
      stats.inserted += err?.result?.insertedCount ?? err?.insertedCount ?? 0;
      const writeErrors = err?.writeErrors || [];
      stats.errors += writeErrors.length;
      for (const we of writeErrors) {
        console.error(
          `    [ERROR] ${dstCol.collectionName}: _id "${
            we?.err?.op?._id ?? '?'
          }": ${we?.errmsg || we?.err?.errmsg || 'unknown'}`,
        );
      }
    }
    batch = [];
  };

  for await (const doc of srcCol.find({}, { batchSize })) {
    const id = String(doc._id);

    if (existingIds.has(id)) {
      stats.skipped++;
      continue;
    }

    let collidedField: string | undefined;
    for (const field of uniqueFields) {
      if (doc[field] === undefined || doc[field] === null) continue;
      const value = normalizeValue(field, doc[field]);
      if (existingByField[field].has(value)) {
        collidedField = field;
        break;
      }
    }

    if (collidedField) {
      console.log(
        `    [SKIP] ${srcCol.collectionName}: ${collidedField} "${normalizeValue(
          collidedField,
          doc[collidedField],
        )}" already exists`,
      );
      stats.skipped++;
      continue;
    }

    existingIds.add(id);
    for (const field of uniqueFields) {
      if (doc[field] !== undefined && doc[field] !== null) {
        existingByField[field].add(normalizeValue(field, doc[field]));
      }
    }

    if (isDryRun) {
      stats.inserted++;
      continue;
    }

    batch.push(doc);
    if (batch.length >= batchSize) await flush();
  }

  if (!isDryRun) await flush();

  return stats;
}

async function main() {
  const coreUrl = CORE_MONGO_URL || MONGO_URL;
  const coreDbName = extractDbName(coreUrl);

  const client = new MongoClient(coreUrl);

  const summary: Record<string, CollectionStats> = {};
  const failed: { collection: string; error: string }[] = [];

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    console.log(`Core DB: ${coreDbName}`);
    if (isDryRun) console.log('** DRY RUN — no data will be written **');

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
          summary[colName] = emptyStats();
          continue;
        }

        const uniqueFields = UNIQUE_FIELDS[colName];
        const mode = uniqueFields ? `dedup(${uniqueFields.join(',')})` : 'upsert';
        console.log(`[${colName}] migrating ${sourceCount} documents [${mode}]...`);

        let stats: CollectionStats;
        if (uniqueFields) {
          stats = await migrateWithDedup(
            srcCol,
            dstDb.collection(colName),
            uniqueFields,
            sourceCount,
          );
        } else if (isDryRun) {
          stats = emptyStats(sourceCount);
          stats.inserted = sourceCount;
        } else {
          stats = await migrateByReplace(
            srcCol,
            dstDb.collection(colName),
            sourceCount,
          );
        }

        summary[colName] = stats;
        console.log(
          `[${colName}] done — source: ${stats.sourceCount}, inserted: ${stats.inserted}, updated: ${stats.updated}, skipped: ${stats.skipped}, errors: ${stats.errors}`,
        );
      } catch (err: any) {
        const message = err?.message || String(err);
        console.error(`[${colName}] FAILED — ${message}`);
        failed.push({ collection: colName, error: message });
      }
    }

    console.log('\n=== Migration Summary ===');
    const totals = emptyStats();
    for (const [col, stats] of Object.entries(summary)) {
      console.log(
        `  ${col.padEnd(32)} source: ${String(stats.sourceCount).padStart(
          7,
        )}  inserted: ${String(stats.inserted).padStart(7)}  updated: ${String(
          stats.updated,
        ).padStart(7)}  skipped: ${String(stats.skipped).padStart(
          7,
        )}  errors: ${String(stats.errors).padStart(5)}`,
      );
      totals.sourceCount += stats.sourceCount;
      totals.inserted += stats.inserted;
      totals.updated += stats.updated;
      totals.skipped += stats.skipped;
      totals.errors += stats.errors;
    }

    console.log(
      `\n  TOTAL: source: ${totals.sourceCount}, inserted: ${totals.inserted}, updated: ${totals.updated}, skipped: ${totals.skipped}, errors: ${totals.errors}`,
    );

    if (failed.length > 0) {
      console.error('\n=== Failed collections ===');
      for (const { collection, error } of failed) {
        console.error(`  [${collection}] ${error}`);
      }
    }

    if (failed.length > 0 || totals.errors > 0) {
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
