import { z } from 'zod';
import type { IModels } from '~/connectionResolvers';
import { isViberDuplicateKeyError } from '@/integrations/viber/utils/errors';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';

const timestamp = z.number().int().nonnegative().max(8_640_000_000_000_000);
const userId = z
  .string()
  .min(1)
  .max(256)
  .refine((value) => value.trim().length > 0);
const receiptSchema = z.object({
  event: z.enum(['delivered', 'seen', 'failed']),
  timestamp,
  message_token: z.string().regex(/^\d+$/),
  user_id: userId,
});
const subscriptionSchema = z.discriminatedUnion('event', [
  z.object({
    event: z.literal('subscribed'),
    timestamp,
    user: z.object({ id: userId }),
  }),
  z.object({ event: z.literal('unsubscribed'), timestamp, user_id: userId }),
  z.object({
    event: z.literal('conversation_started'),
    timestamp,
    user: z.object({ id: userId }),
    subscribed: z.boolean(),
  }),
]);

export const updateViberSubscription = async (
  models: IModels,
  input: {
    inboxId: string;
    userId: string;
    subscribed: boolean;
    timestamp: number;
  },
): Promise<void> => {
  const selector = { inboxId: input.inboxId, userId: input.userId };
  try {
    await models.ViberSubscriptions.updateOne(
      selector,
      { $setOnInsert: input },
      { upsert: true, runValidators: true },
    );
  } catch (error) {
    if (!isViberDuplicateKeyError(error)) throw error;
  }
  // Provider timestamps, not arrival order. Unsubscribe wins a timestamp tie.
  await models.ViberSubscriptions.updateOne(
    {
      ...selector,
      timestamp: input.subscribed
        ? { $lt: input.timestamp }
        : { $lte: input.timestamp },
    },
    { $set: { subscribed: input.subscribed, timestamp: input.timestamp } },
    { runValidators: true },
  );
};

export const publishViberDelivery = async (
  models: IModels,
  subdomain: string,
  messageId: string,
): Promise<void> => {
  const outbox = await models.ViberOutbox.findOne({ _id: messageId });
  if (!outbox) return;
  await models.ConversationMessages.updateOne(
    {
      _id: messageId,
      conversationId: outbox.conversationId,
      userId: outbox.agentId,
      $or: [
        { 'extraData.viber.updatedAt': { $exists: false } },
        { 'extraData.viber.updatedAt': { $lte: outbox.updatedAt } },
      ],
    },
    {
      $set: {
        'extraData.viber': {
          state: outbox.state,
          error: outbox.parts.find((part) => part.error)?.error ?? null,
          updatedAt: outbox.updatedAt,
        },
      },
    },
  );
  const receipts = await models.ViberReceipts.find({
    inboxId: outbox.inboxId,
    userId: outbox.userId,
    messageToken: {
      $in: outbox.parts.flatMap((part) =>
        part.messageToken ? [part.messageToken] : [],
      ),
    },
  });
  if (
    outbox.parts.length > 0 &&
    outbox.parts.every(
      (part) =>
        part.messageToken &&
        receipts.some(
          (receipt) =>
            receipt.messageToken === part.messageToken && receipt.seenAt,
        ),
    )
  ) {
    await models.ConversationMessages.updateOne(
      {
        _id: messageId,
        conversationId: outbox.conversationId,
        userId: outbox.agentId,
      },
      { $set: { isCustomerRead: true } },
    );
  }
  const message = await models.ConversationMessages.findOne({
    _id: messageId,
    conversationId: outbox.conversationId,
  });
  if (message) await pConversationClientMessageInserted(subdomain, message);
};

export const parseViberLifecycleEvent = (payload: unknown) => {
  const event = z.object({ event: z.string() }).parse(payload).event;
  if (['delivered', 'seen', 'failed'].includes(event))
    return receiptSchema.parse(payload);
  if (['subscribed', 'unsubscribed', 'conversation_started'].includes(event))
    return subscriptionSchema.parse(payload);
  return null;
};

export const processViberLifecycleEvent = async (
  models: IModels,
  subdomain: string,
  inboxId: string,
  event: NonNullable<ReturnType<typeof parseViberLifecycleEvent>>,
): Promise<void> => {
  if ('user_id' in event && 'message_token' in event) {
    const selector = {
      inboxId,
      userId: event.user_id,
      messageToken: event.message_token,
    };
    const field =
      event.event === 'seen'
        ? 'seenAt'
        : event.event === 'delivered'
        ? 'deliveredAt'
        : 'failedAt';
    const update = {
      $setOnInsert: { ...selector, createdAt: new Date() },
      $max: { [field]: new Date(event.timestamp) },
    };
    try {
      await models.ViberReceipts.updateOne(selector, update, {
        upsert: true,
        runValidators: true,
      });
    } catch (error) {
      if (!isViberDuplicateKeyError(error)) throw error;
      await models.ViberReceipts.updateOne(selector, update, {
        runValidators: true,
      });
    }
    const outbox = await models.ViberOutbox.findOne({
      inboxId,
      userId: event.user_id,
      'parts.messageToken': event.message_token,
    });
    if (outbox) await publishViberDelivery(models, subdomain, outbox._id);
    return;
  }
  if (
    event.event === 'subscribed' ||
    event.event === 'unsubscribed' ||
    event.event === 'conversation_started'
  ) {
    await updateViberSubscription(models, {
      inboxId,
      userId: event.event === 'unsubscribed' ? event.user_id : event.user.id,
      timestamp: event.timestamp,
      subscribed:
        event.event === 'conversation_started'
          ? event.subscribed
          : event.event === 'subscribed',
    });
  }
};
