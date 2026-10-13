import { randomUUID } from 'node:crypto';
import type { IModels } from '~/connectionResolvers';

// Share the incoming-message lease so an edit, poll update and reaction snapshot
// cannot race while projecting the same canonical inbox message.
export const withTelegramEventLease = async (
  models: IModels,
  messageId: string,
  apply: () => Promise<void>,
): Promise<void> => {
  const token = randomUUID();
  const lease = { _id: messageId, processingToken: token };
  const claimed = await models.TelegramConversationMessages.findOneAndUpdate(
    {
      _id: messageId,
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
  if (!claimed)
    throw new Error(
      'This Telegram message is still being processed; retry the webhook',
    );
  try {
    // These operations only read/write local state and publish a subscription;
    // no provider requests or file transfers run under this short event lease.
    await apply();
  } finally {
    await models.TelegramConversationMessages.updateOne(lease, {
      $unset: { processingToken: '', processingUntil: '' },
    });
  }
};
