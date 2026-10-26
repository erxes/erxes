import * as dotenv from 'dotenv';
import { MongoClient, type Db } from 'mongodb';
import { CONVERSATION_STATUSES } from '../modules/inbox/db/definitions/constants';

interface ConversationHistory {
  _id: string;
  status?: string | null;
}

// Run once per tenant database before switching reports to status filtering.
export const migrateDeletedIntegrationConversations = async (
  db: Db,
  dryRun = true,
): Promise<{ matched: number; modified: number }> => {
  const conversations = db.collection<ConversationHistory>('conversations');
  const backup = db.collection<ConversationHistory>(
    'conversations_bak_deleted_integrations',
  );
  const cursor = conversations.aggregate<ConversationHistory>([
    { $match: { status: { $ne: CONVERSATION_STATUSES.DELETED } } },
    {
      $lookup: {
        from: 'integrations',
        localField: 'integrationId',
        foreignField: '_id',
        as: '__integration',
        pipeline: [{ $project: { _id: 1 } }],
      },
    },
    { $match: { __integration: { $size: 0 } } },
    { $unset: '__integration' },
  ]);
  const stats = { matched: 0, modified: 0 };

  try {
    for await (const conversation of cursor) {
      stats.matched++;
      if (dryRun) continue;

      await backup.updateOne(
        { _id: conversation._id },
        { $setOnInsert: conversation },
        { upsert: true },
      );
      const result = await conversations.updateOne(
        { _id: conversation._id, status: conversation.status ?? null },
        { $set: { status: CONVERSATION_STATUSES.DELETED } },
      );
      stats.modified += result.modifiedCount;
    }
  } finally {
    await cursor.close();
  }

  return stats;
};

if (require.main === module) {
  dotenv.config();
  const client = new MongoClient(
    process.env.MONGO_URL ||
      'mongodb://localhost:27017/erxes?directConnection=true',
  );
  const dryRun = process.env.DRY_RUN !== 'false';

  client
    .connect()
    .then(() => migrateDeletedIntegrationConversations(client.db(), dryRun))
    .then((stats) => {
      process.stdout.write(`${JSON.stringify({ dryRun, ...stats })}\n`);
    })
    .catch((error: unknown) => {
      process.stderr.write(`${String(error)}\n`);
      process.exitCode = 1;
    })
    .finally(() => client.close());
}
