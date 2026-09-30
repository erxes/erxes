import * as dotenv from 'dotenv';

dotenv.config();

import { Db, Document, MongoBulkWriteError, MongoClient } from 'mongodb';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  LEGACY_INTEGRATIONS_DB = 'erxes_integrations',
  DRY_RUN,
  BATCH_SIZE = '1000',
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const isDryRun = DRY_RUN === '1' || DRY_RUN === 'true';
const batchSize = Math.max(1, parseInt(BATCH_SIZE, 10) || 1000);

const FACEBOOK_KINDS = ['facebook-messenger', 'facebook-post'];

type CopyStats = {
  source: string;
  target: string;
  read: number;
  inserted: number;
  existing: number;
  skipped: number;
  failed: number;
};

type CopyOptions = {
  query?: Document;
  transform?: (doc: Document) => Document | null;
};

const stripVersion = ({ __v, ...rest }: Document): Document => rest;

const client = new MongoClient(MONGO_URL);

async function copyCollection(
  sourceDb: Db,
  targetDb: Db,
  sourceName: string,
  targetName: string,
  { query = {}, transform = stripVersion }: CopyOptions = {},
): Promise<CopyStats> {
  const target = targetDb.collection(targetName);
  const stats: CopyStats = {
    source: sourceName,
    target: targetName,
    read: 0,
    inserted: 0,
    existing: 0,
    skipped: 0,
    failed: 0,
  };

  let batch: Document[] = [];

  const flush = async () => {
    if (!batch.length) {
      return;
    }

    const existingIds = new Set(
      (
        await target
          .find(
            { _id: { $in: batch.map((doc) => doc._id) } },
            { projection: { _id: 1 } },
          )
          .toArray()
      ).map((doc) => String(doc._id)),
    );

    const fresh = batch.filter((doc) => !existingIds.has(String(doc._id)));
    stats.existing += batch.length - fresh.length;
    batch = [];

    if (!fresh.length) {
      return;
    }

    if (isDryRun) {
      stats.inserted += fresh.length;
      return;
    }

    try {
      const result = await target.insertMany(fresh, { ordered: false });
      stats.inserted += result.insertedCount;
    } catch (error) {
      if (!(error instanceof MongoBulkWriteError)) {
        throw error;
      }

      const insertedCount = error.insertedCount ?? 0;
      const writeErrors = ([] as { errmsg?: string }[]).concat(
        error.writeErrors || [],
      );

      stats.inserted += insertedCount;
      stats.failed += fresh.length - insertedCount;

      console.log(
        `    ⚠️  ${targetName}: ${fresh.length - insertedCount} failed, e.g. ${
          writeErrors[0]?.errmsg || error.message
        }`,
      );
    }
  };

  const cursor = sourceDb
    .collection(sourceName)
    .find(query)
    .batchSize(batchSize);

  for await (const doc of cursor) {
    stats.read++;

    const next = transform(doc);

    if (!next) {
      stats.skipped++;
      continue;
    }

    batch.push(next);

    if (batch.length >= batchSize) {
      await flush();
    }
  }

  await flush();

  console.log(
    `  ${sourceName} → ${targetName}: read=${stats.read} ${
      isDryRun ? 'wouldInsert' : 'inserted'
    }=${stats.inserted} existing=${stats.existing} skipped=${
      stats.skipped
    } failed=${stats.failed}`,
  );

  return stats;
}

const command = async () => {
  await client.connect();

  const sourceDb = client.db(LEGACY_INTEGRATIONS_DB);
  const targetDb = client.db();

  console.log('═══════════════════════════════════════════════');
  console.log('  Legacy integrations migration');
  console.log(`  Source : ${LEGACY_INTEGRATIONS_DB}`);
  console.log(`  Target : ${targetDb.databaseName}`);
  if (isDryRun) console.log('  ** DRY RUN — no data will be written **');
  console.log('═══════════════════════════════════════════════');

  const sourceCollections = await sourceDb
    .listCollections({ name: 'integrations' }, { nameOnly: true })
    .toArray();

  if (!sourceCollections.length) {
    console.log(
      `✅ ${LEGACY_INTEGRATIONS_DB}.integrations not found — nothing to migrate`,
    );
    await client.close();
    return;
  }

  const inboxIds = new Set(
    (await targetDb.collection('integrations').distinct('_id')).map(String),
  );

  const legacyIntegrations = await sourceDb
    .collection('integrations')
    .find({})
    .toArray();

  const postIntegrationByPage = new Map<string, string>();

  for (const integration of legacyIntegrations) {
    const isAlive = inboxIds.has(String(integration.erxesApiId));

    console.log(
      `  integration ${integration._id} kind=${integration.kind} inbox=${
        integration.erxesApiId
      } ${isAlive ? 'OK' : 'SKIP (inbox integration missing)'}`,
    );

    if (isAlive && integration.kind === 'facebook-post') {
      for (const pageId of integration.facebookPageIds || []) {
        postIntegrationByPage.set(pageId, integration.erxesApiId);
      }
    }
  }

  const aliveOnly = (doc: Document): Document | null =>
    inboxIds.has(String(doc.erxesApiId)) ? stripVersion(doc) : null;

  const withPostIntegration = (doc: Document): Document => ({
    ...doc,
    integrationId:
      doc.integrationId || postIntegrationByPage.get(doc.recipientId),
  });

  const copy = (sourceName: string, targetName: string, options?: CopyOptions) =>
    copyCollection(sourceDb, targetDb, sourceName, targetName, options);

  const results: CopyStats[] = [];

  results.push(
    await copy('integrations', 'facebook_integrations', {
      query: { kind: { $in: FACEBOOK_KINDS } },
      transform: aliveOnly,
    }),
  );

  results.push(
    await copy('integrations', 'integrations_callpros', {
      query: { kind: 'callpro' },
      transform: (doc) =>
        inboxIds.has(String(doc.erxesApiId))
          ? {
              _id: doc._id,
              inboxId: doc.erxesApiId,
              phoneNumber: doc.phoneNumber,
              recordUrl: doc.recordUrl,
            }
          : null,
    }),
  );

  results.push(await copy('customers_facebooks', 'customers_facebooks'));
  results.push(await copy('conversations_facebooks', 'conversations_facebooks'));
  results.push(
    await copy(
      'conversation_messages_facebooks',
      'conversation_messages_facebooks',
    ),
  );

  results.push(
    await copy('comments_facebooks', 'comment_conversations_facebooks', {
      transform: ({ __v, commentId, timestamp, ...rest }) =>
        withPostIntegration({
          ...rest,
          comment_id: rest.comment_id || commentId,
          createdAt: rest.createdAt || timestamp,
        }),
    }),
  );

  results.push(
    await copy('posts_facebooks', 'posts_conversations_facebooks', {
      transform: (doc) => withPostIntegration(stripVersion(doc)),
    }),
  );

  results.push(await copy('customers_callpros', 'customers_callpros'));
  results.push(await copy('conversations_callpros', 'conversations_callpros'));
  results.push(await copy('logs_callpros', 'logs_callpros'));

  results.push(await copy('instagram_accounts', 'instagram_accounts'));
  results.push(
    await copy('instagram_integrations', 'instagram_integrations', {
      transform: aliveOnly,
    }),
  );
  results.push(await copy('instagram_customers', 'instagram_customers'));
  results.push(await copy('instagram_conversations', 'instagram_conversations'));
  results.push(
    await copy(
      'instagram_conversation_messages',
      'instagram_conversation_messages',
    ),
  );
  results.push(
    await copy(
      'instagram_comment_conversations',
      'instagram_comment_conversations',
    ),
  );
  results.push(
    await copy(
      'instagram_conversations_reply_facebooks',
      'instagram_comment_conversations_replies',
    ),
  );
  results.push(
    await copy('instagram_posts_conversations', 'instagram_post_conversations'),
  );

  const totalFailed = results.reduce((sum, stats) => sum + stats.failed, 0);

  console.log('\n═══════════════════════════════════════════════');
  console.log(
    isDryRun
      ? '  DRY RUN finished — nothing was written'
      : `  Finished — failed=${totalFailed}`,
  );
  console.log(`  Finished at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════');

  await client.close();
};

command().catch(async (error) => {
  console.error(error);
  await client.close();
  process.exit(1);
});
