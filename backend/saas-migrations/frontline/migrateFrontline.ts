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
  // response templates
  'response_templates',

  // ticket
  'frontline_tickets_pipeline',
  'frontline_tickets_pipeline_status',
  'frontline_tickets',
  'frontline_ticket_activities',
  'frontline_tickets_notes',
  'frontline_ticket_configs',

  // inbox
  'channels',
  'channel_members',
  'integrations',
  'conversations',
  'conversation_messages',
  'messenger_apps',

  // facebook
  'facebook_accounts',
  'customers_facebooks',
  'conversations_facebooks',
  'conversation_messages_facebooks',
  'comment_conversations_facebook',
  'comment_conversations_reply_facebook',
  'facebook_integrations',
  'facebook_logs',
  'posts_conversations_facebooks',
  'facebook_configs',
  'facebook_messengers_bots',

  // instagram
  'instagram_integrations',
  'instagram_accounts',
  'instagram_customers',
  'instagram_conversations',
  'instagram_conversation_messages',
  'instagram_comment_conversations',
  'instagram_comment_conversations_reply',
  'instagram_post_conversations',
  'instagram_logs',
  'instagram_bots',
  'instagram_configs',

  // call
  'calls_integrations',
  'calls_customers',
  'calls_history',
  'calls_configs',
  'calls_operators',
  'calls_cdr',
  'calls_queue_statistics',
  'calls_sessions',

  // imap
  'imap_customers',
  'imap_integrations',
  'imap_messages',
  'imap_logs',

  // form
  'frontline_form_fields',
  'frontline_forms',
  'frontline_form_submissions',

  // knowledgebase
  'knowledgebase_articles',
  'knowledgebase_categories',
  'knowledgebase_topics',
];


const UNIQUE_FIELDS: Record<string, string[]> = {
  customers_facebooks: ['userId'],
  facebook_configs: ['code'],
  instagram_customers: ['userId'],
  instagram_configs: ['code'],
  calls_customers: ['primaryPhone'],
  calls_configs: ['code'],
  calls_operators: ['userId'],
  calls_queue_statistics: ['userId'],
  calls_sessions: ['uniqueid'],
  calls_cdr: ['acctId'],
  calls_integrations: ['srcTrunk', 'dstTrunk'],
  calls_history: ['uniqueid'],
  imap_integrations: ['email'],
  imap_messages: ['messageId'],
  knowledgebase_articles: ['code'],
  knowledgebase_categories: ['code'],
  knowledgebase_topics: ['code'],
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
        `  ${col.padEnd(40)} source: ${String(stats.sourceCount).padStart(
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
