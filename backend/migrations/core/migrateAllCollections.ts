import * as dotenv from 'dotenv';

dotenv.config();

import { AnyBulkWriteOperation, Collection, Db, MongoClient } from 'mongodb';

/**
 * Copy EVERY collection from a source organization's database to a target
 * organization's database. Each erxes org lives in its own DB named
 * `erxes_<orgId>`; this resolves both orgs by subdomain (from the core
 * `organizations` collection) and replays all of the source's collections into
 * the target via batched `replaceOne` upserts (idempotent — safe to re-run).
 *
 * This is the "all collections" generalization of `migratePost.ts`, which
 * copies only a fixed list. Use env filters to narrow the set when needed.
 *
 * Env:
 *   MONGO_URL / CORE_MONGO_URL   connection string (CORE_MONGO_URL wins)
 *   SOURCE_SUBDOMAIN             org to copy from              (required)
 *   TARGET_SUBDOMAIN            org to copy into              (required)
 *   DRY_RUN=1                    report only, write nothing
 *   BATCH_SIZE=1000              bulkWrite batch size
 *   EXCLUDE_COLLECTIONS=a,b      skip these collections
 *   INCLUDE_COLLECTIONS=a,b      ONLY these collections (overrides discovery)
 */
const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  CORE_MONGO_URL,

  SOURCE_SUBDOMAIN,
  TARGET_SUBDOMAIN,

  DRY_RUN,
  BATCH_SIZE = '1000',
  EXCLUDE_COLLECTIONS = '',
  INCLUDE_COLLECTIONS = '',
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

const parseList = (v: string): string[] =>
  v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const excludeList = new Set(parseList(EXCLUDE_COLLECTIONS));
const includeList = parseList(INCLUDE_COLLECTIONS);

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

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
  const stats: CollectionStats = { sourceCount, inserted: 0, updated: 0 };

  let batch: AnyBulkWriteOperation[] = [];

  const flush = async () => {
    if (batch.length === 0) {
      return;
    }
    const result = await dstCol.bulkWrite(batch, { ordered: false });
    stats.inserted += result.upsertedCount; // newly created in target
    stats.updated += result.matchedCount; // already existed, replaced
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

/** All non-system collection names in a DB (views excluded). */
async function listCollectionNames(db: Db): Promise<string[]> {
  const infos = await db.listCollections({}, { nameOnly: true }).toArray();
  return infos
    .filter((c) => c.type !== 'view' && !c.name.startsWith('system.'))
    .map((c) => c.name)
    .sort((a, b) => a.localeCompare(b));
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

    const srcDb: Db = client.db(sourceDbName);
    const dstDb: Db = client.db(targetDbName);

    // Build the collection set: explicit include list, otherwise discover all.
    let collections = includeList.length
      ? includeList
      : await listCollectionNames(srcDb);
    collections = collections.filter((c) => !excludeList.has(c));

    console.log(`\nSource: ${SOURCE_SUBDOMAIN} → ${sourceDbName}`);
    console.log(`Target: ${TARGET_SUBDOMAIN} → ${targetDbName}`);
    console.log(`Batch size: ${batchSize}`);
    console.log(
      `Collections: ${collections.length}` +
        (includeList.length
          ? ' (from INCLUDE_COLLECTIONS)'
          : ' (auto-discovered)') +
        (excludeList.size ? `, excluding ${excludeList.size}` : ''),
    );
    console.log('');

    for (const colName of collections) {
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
      `\n  TOTAL: collections: ${
        Object.keys(summary).length
      }, source: ${totalSource}, inserted: ${totalInserted}, updated: ${totalUpdated}`,
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
