import { createHash, randomUUID } from 'node:crypto';
import type { IModels } from '~/connectionResolvers';
import type { IMessage } from '@/inbox/@types/conversationMessages';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';

/** Stable identities let redeliveries resume an interrupted insert, as in Telegram. */
export const instagramRecordId = (kind: string, ...ids: string[]): string =>
  `instagram-${kind}-${createHash('sha256')
    .update(JSON.stringify(ids))
    .digest('hex')}`;

export const getOrCreateInstagramRecord = async <T>(
  find: () => PromiseLike<T | null>,
  create: () => Promise<T>,
): Promise<T> => {
  const existing = await find();
  if (existing) return existing;

  try {
    return await create();
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      const winner = await find();
      if (winner) return winner;
    }
    throw error;
  }
};

interface DeliveryCollection {
  findOneAndUpdate(
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options: { new: true },
  ): PromiseLike<{ inboxSyncPending?: boolean } | null>;
  updateOne(
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
  ): PromiseLike<{ matchedCount: number }>;
}

/** Serialize inbox projection and renew its Mongo lease, as in Telegram ingestion. */
export const withInstagramDeliveryLease = async (
  collection: DeliveryCollection,
  id: string,
  apply: () => Promise<void>,
): Promise<void> => {
  const token = randomUUID();
  const lease = { _id: id, processingToken: token };
  const claimed = await collection.findOneAndUpdate(
    {
      _id: id,
      $or: [
        { processingUntil: null },
        { processingUntil: { $lt: new Date() } },
      ],
    },
    {
      $set: {
        processingToken: token,
        processingUntil: new Date(Date.now() + 120_000),
      },
    },
    { new: true },
  );
  if (!claimed) {
    throw new Error(
      'Instagram event is still being processed; retry the webhook',
    );
  }
  let leaseLost = false;
  let renewal = Promise.resolve();
  const heartbeat = setInterval(() => {
    renewal = renewal
      .then(async () => {
        const result = await collection.updateOne(lease, {
          $set: { processingUntil: new Date(Date.now() + 120_000) },
        });
        if (!result.matchedCount) leaseLost = true;
      })
      .catch(() => {
        leaseLost = true;
      });
  }, 30_000);
  heartbeat.unref();
  try {
    if (claimed.inboxSyncPending === false) return;
    await apply();
    await renewal;
    if (leaseLost) throw new Error('Instagram processing lease was lost');
    const completed = await collection.updateOne(lease, {
      $set: { inboxSyncPending: false },
    });
    if (!completed.matchedCount)
      throw new Error('Instagram processing lease was lost');
  } finally {
    clearInterval(heartbeat);
    await renewal;
    await collection.updateOne(lease, {
      $unset: { processingToken: '', processingUntil: '' },
    });
  }
};

/** Repair both the inbox row and its conversation before acknowledging a delivery. */
export const syncInstagramInboxMessage = async (
  models: IModels,
  subdomain: string,
  id: string,
  doc: IMessage,
  providerMessageId?: string,
): Promise<void> => {
  const selector = {
    conversationId: doc.conversationId,
    $or: [
      { _id: id },
      ...(providerMessageId
        ? [
            { 'providerData.messageId': providerMessageId },
            { mid: providerMessageId },
          ]
        : []),
    ],
  };
  const createDoc = { ...doc, _id: id };
  const message = await getOrCreateInstagramRecord(
    () => models.ConversationMessages.findOne(selector),
    () => models.ConversationMessages.createMessage(createDoc),
  );

  // createMessage can insert its row and then fail while updating the
  // conversation. A retry must finish those writes even when the row exists.
  await models.Conversations.updateConversation(doc.conversationId, {
    messageCount: await models.ConversationMessages.countDocuments({
      conversationId: doc.conversationId,
    }),
    isCustomerRespondedLast: true,
    updatedAt: message.createdAt,
    content: message.content,
    status: CONVERSATION_STATUSES.OPEN,
    readUserIds: [],
  });
  await pConversationClientMessageInserted(subdomain, message);
};
