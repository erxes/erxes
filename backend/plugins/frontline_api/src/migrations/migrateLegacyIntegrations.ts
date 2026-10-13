import * as dotenv from 'dotenv';

dotenv.config();

import { Db, Document, MongoBulkWriteError, MongoClient } from 'mongodb';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  LEGACY_FACEBOOK_DB = 'erxes_facebook',
  LEGACY_INTEGRATIONS_DB = 'erxes_integrations',
  BOT_OWNER_USER_ID,
  DRY_RUN,
  BATCH_SIZE = '1000',
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const isDryRun = DRY_RUN !== 'false';
const batchSize = Math.max(1, parseInt(BATCH_SIZE, 10) || 1000);

const FACEBOOK_KINDS = ['facebook-messenger', 'facebook-post'];
const PERSISTENT_MENU_TYPES = [
  'button',
  'link',
  'human_handoff',
  'back_button',
];
const DUPLICATE_KEY_CODE = 11000;

type CopyStats = {
  source: string;
  target: string;
  read: number;
  inserted: number;
  existing: number;
  duplicates: number;
  skipped: number;
  failed: number;
};

type CopyOptions = {
  query?: Document;
  transform?: (doc: Document) => Document | null;
  trackIds?: Set<string>;
};

type Transform = (doc: Document) => Document | null;

const client = new MongoClient(MONGO_URL);

const stripVersion = (doc: Document): Document => {
  const rest = { ...doc };
  delete rest.__v;
  return rest;
};

async function hasCollections(db: Db): Promise<boolean> {
  const collections = await db
    .listCollections({}, { nameOnly: true })
    .toArray();

  return collections.length > 0;
}

async function loadValues(
  db: Db,
  collectionName: string,
  field: string,
): Promise<Set<string>> {
  const values = new Set<string>();
  const cursor = db
    .collection(collectionName)
    .find({ [field]: { $exists: true } }, { projection: { [field]: 1 } });

  for await (const doc of cursor) {
    values.add(String(doc[field]));
  }

  return values;
}

async function copyCollection(
  sourceDb: Db,
  targetDb: Db,
  sourceName: string,
  targetName: string,
  { query = {}, transform = stripVersion, trackIds }: CopyOptions = {},
): Promise<CopyStats> {
  const target = targetDb.collection(targetName);
  const stats: CopyStats = {
    source: `${sourceDb.databaseName}.${sourceName}`,
    target: targetName,
    read: 0,
    inserted: 0,
    existing: 0,
    duplicates: 0,
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

      for (const doc of fresh) {
        trackIds?.add(String(doc._id));
      }

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
      const writeErrors = ([] as { code?: number; errmsg?: string }[]).concat(
        error.writeErrors || [],
      );
      const duplicates = writeErrors.filter(
        (writeError) => writeError.code === DUPLICATE_KEY_CODE,
      ).length;
      const failed = fresh.length - insertedCount - duplicates;

      stats.inserted += insertedCount;
      stats.duplicates += duplicates;
      stats.failed += failed;

      if (failed > 0) {
        const firstFailure = writeErrors.find(
          (writeError) => writeError.code !== DUPLICATE_KEY_CODE,
        );

        console.log(
          `    ⚠️  ${targetName}: ${failed} failed, e.g. ${
            firstFailure?.errmsg || error.message
          }`,
        );
      }
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

  if (stats.read > 0) {
    console.log(
      `  ${stats.source} → ${targetName}: read=${stats.read} ${
        isDryRun ? 'wouldInsert' : 'inserted'
      }=${stats.inserted} existing=${stats.existing} duplicates=${
        stats.duplicates
      } skipped=${stats.skipped} failed=${stats.failed}`,
    );
  }

  return stats;
}

function logIntegrations(
  integrations: Document[],
  inboxIds: Set<string>,
  claimedInboxIds: Set<string>,
) {
  for (const integration of integrations) {
    const inboxId = String(integration.erxesApiId);
    const state = !inboxIds.has(inboxId)
      ? 'SKIP (inbox integration missing)'
      : claimedInboxIds.has(inboxId)
      ? 'SKIP (inbox already has a provider integration)'
      : 'OK';

    console.log(
      `  integration ${integration._id} kind=${integration.kind} inbox=${inboxId} ${state}`,
    );
  }
}

function mapPostIntegrationsByPage(
  integrations: Document[],
  inboxIds: Set<string>,
): Map<string, string> {
  const postIntegrationByPage = new Map<string, string>();

  for (const integration of integrations) {
    if (
      integration.kind !== 'facebook-post' ||
      !inboxIds.has(String(integration.erxesApiId))
    ) {
      continue;
    }

    for (const pageId of integration.facebookPageIds || []) {
      postIntegrationByPage.set(pageId, integration.erxesApiId);
    }
  }

  return postIntegrationByPage;
}

const unclaimedIntegration =
  (inboxIds: Set<string>, claimedInboxIds: Set<string>): Transform =>
  (doc) => {
    const inboxId = String(doc.erxesApiId);

    if (!inboxIds.has(inboxId) || claimedInboxIds.has(inboxId)) {
      return null;
    }

    return stripVersion(doc);
  };

const withPostIntegration =
  (postIntegrationByPage: Map<string, string>) =>
  (doc: Document): Document => ({
    ...doc,
    integrationId:
      doc.integrationId || postIntegrationByPage.get(doc.recipientId),
  });

const toCommentConversation =
  (postIntegrationByPage: Map<string, string>): Transform =>
  (doc) => {
    const { commentId, timestamp, ...rest } = stripVersion(doc);

    return withPostIntegration(postIntegrationByPage)({
      ...rest,
      comment_id: rest.comment_id || commentId,
      createdAt: rest.createdAt || timestamp,
    });
  };

const toPostConversation =
  (postIntegrationByPage: Map<string, string>): Transform =>
  (doc) =>
    withPostIntegration(postIntegrationByPage)(stripVersion(doc));

const toBot =
  (ownerId: string | undefined): Transform =>
  (doc) => {
    if (!ownerId) {
      return null;
    }

    const bot = stripVersion(doc);

    return {
      ...bot,
      persistentMenus: (bot.persistentMenus || []).map((menu: Document) => ({
        ...menu,
        _id: String(menu._id),
        type: PERSISTENT_MENU_TYPES.includes(menu.type) ? menu.type : 'button',
      })),
      createdBy: bot.createdBy || ownerId,
      updatedBy: bot.updatedBy || ownerId,
      updatedAt: bot.updatedAt || bot.createdAt || new Date(),
    };
  };

async function resolveBotOwner(targetDb: Db): Promise<string | undefined> {
  if (BOT_OWNER_USER_ID) {
    return BOT_OWNER_USER_ID;
  }

  const owner = await targetDb
    .collection('users')
    .findOne({ isOwner: true }, { projection: { _id: 1 } });

  return owner ? String(owner._id) : undefined;
}

async function migrateFacebook(
  sourceDb: Db,
  targetDb: Db,
  inboxIds: Set<string>,
  postIntegrationByPage: Map<string, string>,
): Promise<CopyStats[]> {
  console.log(`\n🚀 Facebook (v2) — ${sourceDb.databaseName}`);

  const copy = (
    sourceName: string,
    targetName: string,
    options?: CopyOptions,
  ) => copyCollection(sourceDb, targetDb, sourceName, targetName, options);

  const claimedInboxIds = await loadValues(
    targetDb,
    'facebook_integrations',
    'erxesApiId',
  );
  const integrations = await sourceDb
    .collection('facebook_integrations')
    .find({})
    .toArray();

  logIntegrations(integrations, inboxIds, claimedInboxIds);

  const botOwnerId = await resolveBotOwner(targetDb);

  if (!botOwnerId) {
    console.log(
      '  ⚠️  No owner user found and BOT_OWNER_USER_ID not set — bots are skipped',
    );
  }

  return [
    await copy('facebook_accounts', 'facebook_accounts'),
    await copy('facebook_integrations', 'facebook_integrations', {
      transform: unclaimedIntegration(inboxIds, claimedInboxIds),
    }),
    await copy('facebook_messengers_bots', 'facebook_messengers_bots', {
      transform: toBot(botOwnerId),
    }),
    await copy('customers_facebooks', 'customers_facebooks'),
    await copy('conversations_facebooks', 'conversations_facebooks'),
    await copy(
      'conversation_messages_facebooks',
      'conversation_messages_facebooks',
    ),
    await copy(
      'comment_conversations_facebooks',
      'comment_conversations_facebooks',
      { transform: toPostConversation(postIntegrationByPage) },
    ),
    await copy(
      'comment_conversations_reply_facebooks',
      'comment_conversations_reply_facebooks',
      { transform: toPostConversation(postIntegrationByPage) },
    ),
    await copy(
      'posts_conversations_facebooks',
      'posts_conversations_facebooks',
      { transform: toPostConversation(postIntegrationByPage) },
    ),
    await copy('comments_facebooks', 'comment_conversations_facebooks', {
      transform: toCommentConversation(postIntegrationByPage),
    }),
    await copy('posts_facebooks', 'posts_conversations_facebooks', {
      transform: toPostConversation(postIntegrationByPage),
    }),
  ];
}

async function migrateIntegrations(
  sourceDb: Db,
  targetDb: Db,
  inboxIds: Set<string>,
  facebookInboxIds: Set<string>,
  postIntegrationByPage: Map<string, string>,
): Promise<CopyStats[]> {
  console.log(`\n🚀 Integrations (v1) — ${sourceDb.databaseName}`);

  const copy = (
    sourceName: string,
    targetName: string,
    options?: CopyOptions,
  ) => copyCollection(sourceDb, targetDb, sourceName, targetName, options);

  const claimedFacebookInboxIds = new Set([
    ...(await loadValues(targetDb, 'facebook_integrations', 'erxesApiId')),
    ...facebookInboxIds,
  ]);
  const claimedCallProInboxIds = await loadValues(
    targetDb,
    'integrations_callpros',
    'inboxId',
  );
  const claimedInstagramInboxIds = await loadValues(
    targetDb,
    'instagram_integrations',
    'erxesApiId',
  );

  const integrations = await sourceDb
    .collection('integrations')
    .find({})
    .toArray();

  logIntegrations(
    integrations,
    inboxIds,
    new Set([...claimedFacebookInboxIds, ...claimedCallProInboxIds]),
  );

  const results: CopyStats[] = [];

  results.push(
    await copy('integrations', 'facebook_integrations', {
      query: { kind: { $in: FACEBOOK_KINDS } },
      transform: unclaimedIntegration(inboxIds, claimedFacebookInboxIds),
    }),
  );

  results.push(
    await copy('integrations', 'integrations_callpros', {
      query: { kind: 'callpro' },
      transform: (doc) => {
        const inboxId = String(doc.erxesApiId);

        if (!inboxIds.has(inboxId) || claimedCallProInboxIds.has(inboxId)) {
          return null;
        }

        return {
          _id: doc._id,
          inboxId: doc.erxesApiId,
          phoneNumber: doc.phoneNumber,
          recordUrl: doc.recordUrl,
        };
      },
    }),
  );

  const copiedConversationIds = new Set<string>();

  results.push(await copy('customers_facebooks', 'customers_facebooks'));
  results.push(
    await copy('conversations_facebooks', 'conversations_facebooks', {
      trackIds: copiedConversationIds,
    }),
  );

  const conversationIds = new Set([
    ...(await loadValues(targetDb, 'conversations_facebooks', '_id')),
    ...copiedConversationIds,
  ]);

  results.push(
    await copy(
      'conversation_messages_facebooks',
      'conversation_messages_facebooks',
      {
        transform: (doc) =>
          conversationIds.has(String(doc.conversationId))
            ? stripVersion(doc)
            : null,
      },
    ),
  );

  results.push(
    await copy('comments_facebooks', 'comment_conversations_facebooks', {
      transform: toCommentConversation(postIntegrationByPage),
    }),
  );
  results.push(
    await copy('posts_facebooks', 'posts_conversations_facebooks', {
      transform: toPostConversation(postIntegrationByPage),
    }),
  );

  results.push(await copy('customers_callpros', 'customers_callpros'));
  results.push(await copy('conversations_callpros', 'conversations_callpros'));
  results.push(await copy('logs_callpros', 'logs_callpros'));

  results.push(await copy('instagram_accounts', 'instagram_accounts'));
  results.push(
    await copy('instagram_integrations', 'instagram_integrations', {
      transform: unclaimedIntegration(inboxIds, claimedInstagramInboxIds),
    }),
  );
  results.push(await copy('instagram_customers', 'instagram_customers'));
  results.push(
    await copy('instagram_conversations', 'instagram_conversations'),
  );
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

  return results;
}

const command = async () => {
  await client.connect();

  const targetDb = client.db();
  const facebookDb = client.db(LEGACY_FACEBOOK_DB);
  const integrationsDb = client.db(LEGACY_INTEGRATIONS_DB);

  console.log('═══════════════════════════════════════════════');
  console.log('  Legacy integrations migration');
  console.log(`  Sources : ${LEGACY_FACEBOOK_DB}, ${LEGACY_INTEGRATIONS_DB}`);
  console.log(`  Target  : ${targetDb.databaseName}`);
  if (isDryRun) console.log('  ** DRY RUN — no data will be written **');
  console.log('═══════════════════════════════════════════════');

  const inboxIds = await loadValues(targetDb, 'integrations', '_id');
  const hasFacebookDb = await hasCollections(facebookDb);
  const hasIntegrationsDb = await hasCollections(integrationsDb);

  const facebookIntegrations = hasFacebookDb
    ? await facebookDb.collection('facebook_integrations').find({}).toArray()
    : [];
  const legacyIntegrations = hasIntegrationsDb
    ? await integrationsDb.collection('integrations').find({}).toArray()
    : [];

  const facebookInboxIds = new Set(
    facebookIntegrations
      .map((integration) => String(integration.erxesApiId))
      .filter((inboxId) => inboxIds.has(inboxId)),
  );
  const postIntegrationByPage = mapPostIntegrationsByPage(
    [...legacyIntegrations, ...facebookIntegrations],
    inboxIds,
  );

  const results: CopyStats[] = [];

  if (hasFacebookDb) {
    results.push(
      ...(await migrateFacebook(
        facebookDb,
        targetDb,
        inboxIds,
        postIntegrationByPage,
      )),
    );
  } else {
    console.log(`\n✅ ${LEGACY_FACEBOOK_DB} not found — skipped`);
  }

  if (hasIntegrationsDb) {
    results.push(
      ...(await migrateIntegrations(
        integrationsDb,
        targetDb,
        inboxIds,
        facebookInboxIds,
        postIntegrationByPage,
      )),
    );
  } else {
    console.log(`\n✅ ${LEGACY_INTEGRATIONS_DB} not found — skipped`);
  }

  const total = (key: 'inserted' | 'duplicates' | 'failed') =>
    results.reduce((sum, stats) => sum + stats[key], 0);

  console.log('\n═══════════════════════════════════════════════');
  console.log(
    isDryRun
      ? `  DRY RUN finished — nothing was written. wouldInsert=${total(
          'inserted',
        )}. Re-run with DRY_RUN=false.`
      : `  Finished — inserted=${total('inserted')} duplicates=${total(
          'duplicates',
        )} failed=${total('failed')}`,
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
