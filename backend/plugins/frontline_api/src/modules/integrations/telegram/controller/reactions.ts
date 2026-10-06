import { mongo } from 'mongoose';
import { z } from 'zod';
import type { IModels } from '~/connectionResolvers';
import type { ITelegramConversationMessageDocument } from '../@types/conversationMessages';
import { telegramChatSchema, telegramUserSchema } from '../utils/message';
import { syncTelegramInboxMessage } from './sync';
import { withTelegramEventLease } from './eventLease';

const reactionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('emoji'), emoji: z.string() }),
  z.object({ type: z.literal('custom_emoji'), custom_emoji_id: z.string() }),
  z.object({ type: z.literal('paid') }),
]);
const baseSchema = z.object({
  chat: telegramChatSchema,
  message_id: z.number().int().positive().safe(),
  date: z.number().int().positive().safe(),
});
const actorSchema = baseSchema
  .extend({
    user: telegramUserSchema.optional(),
    actor_chat: telegramChatSchema.optional(),
    new_reaction: z.array(reactionSchema),
  })
  .refine(
    (event) => Boolean(event.user || event.actor_chat),
    'Reaction actor is required',
  );
const countsSchema = baseSchema.extend({
  reactions: z.array(
    z.object({
      type: reactionSchema,
      total_count: z.number().int().nonnegative(),
    }),
  ),
});
const label = (
  reaction: z.infer<typeof reactionSchema>,
): { key: string; label: string } => {
  if (reaction.type === 'emoji')
    return { key: `emoji:${reaction.emoji}`, label: reaction.emoji };
  if (reaction.type === 'custom_emoji')
    return { key: `custom:${reaction.custom_emoji_id}`, label: 'Custom emoji' };
  return { key: 'paid', label: '⭐' };
};

export const syncTelegramReactions = async (
  models: IModels,
  subdomain: string,
  conversationId: string,
  message: ITelegramConversationMessageDocument,
): Promise<void> => {
  let messageIds = [message.messageId];
  if (message.userId) {
    const canonical = await models.ConversationMessages.findOne({
      conversationId,
      'extraData.telegram.messageIds': message.messageId,
    });
    const metadata = z
      .object({ telegram: z.object({ messageIds: z.array(z.string()) }) })
      .safeParse(canonical?.extraData);
    if (metadata.success) messageIds = metadata.data.telegram.messageIds;
  }
  const selector = {
    integrationId: message.integrationId,
    chatId: message.chatId,
    messageId: { $in: messageIds },
  };
  const counts = await models.TelegramReactions.find({
    ...selector,
    actorId: 'counts',
  }).lean();
  const [snapshot] = await models.TelegramReactions.aggregate<{
    reactions: { key: string; label: string; count: number }[];
    versions: { date: number; updateId: number }[];
  }>([
    {
      $match: {
        ...selector,
        messageId: {
          $in: messageIds,
          $nin: counts.map((item) => item.messageId),
        },
        actorId: { $ne: 'counts' },
      },
    },
    {
      $facet: {
        reactions: [
          { $unwind: '$reactions' },
          {
            $group: {
              _id: '$reactions.key',
              label: { $first: '$reactions.label' },
              count: { $sum: '$reactions.count' },
            },
          },
          { $project: { _id: 0, key: '$_id', label: 1, count: 1 } },
          { $sort: { key: 1 } },
        ],
        versions: [
          { $sort: { date: -1, updateId: -1 } },
          { $limit: 1 },
          { $project: { date: 1, updateId: 1 } },
        ],
      },
    },
  ]);
  const latest = [...counts, ...(snapshot?.versions ?? [])].sort(
    (a, b) => b.date - a.date || b.updateId - a.updateId,
  )[0];
  const version = `${String(latest?.date ?? 0).padStart(16, '0')}:${String(
    latest?.updateId ?? 0,
  ).padStart(20, '0')}`;
  const totals = new Map<
    string,
    { key: string; label: string; count: number }
  >();
  for (const reaction of [
    ...counts.flatMap((item) => item.reactions),
    ...(snapshot?.reactions ?? []),
  ]) {
    const previous = totals.get(reaction.key);
    totals.set(reaction.key, {
      key: reaction.key,
      label: reaction.label,
      count: (previous?.count ?? 0) + reaction.count,
    });
  }
  await syncTelegramInboxMessage(
    models,
    subdomain,
    conversationId,
    message,
    {
      // These are reactions observed by the bot; Telegram supplies no history API.
      'extraData.telegram.reactions': [...totals.values()]
        .filter((item) => item.count > 0)
        .sort((a, b) => a.key.localeCompare(b.key)),
      'extraData.telegram.reactionsAreSnapshot':
        counts.length === messageIds.length,
    },
    { field: 'reactionsVersion', value: version },
  );
};

export const receiveTelegramReaction = async ({
  models,
  subdomain,
  integrationId,
  payload,
  updateId,
  anonymous,
}: {
  models: IModels;
  subdomain: string;
  integrationId: string;
  payload: unknown;
  updateId: number;
  anonymous: boolean;
}): Promise<void> => {
  const event = anonymous
    ? countsSchema.parse(payload)
    : actorSchema.parse(payload);
  const actorId =
    'reactions' in event
      ? 'counts'
      : event.user
        ? `user:${event.user.id}`
        : `chat:${event.actor_chat?.id}`;
  const reactions =
    'reactions' in event
      ? event.reactions.map((reaction) => ({
          ...label(reaction.type),
          count: reaction.total_count,
        }))
      : event.new_reaction.map((reaction) => ({
          ...label(reaction),
          count: 1,
        }));
  const selector = {
    integrationId,
    chatId: String(event.chat.id),
    messageId: String(event.message_id),
  };
  try {
    await models.TelegramReactions.updateOne(
      {
        ...selector,
        actorId,
        $or: [
          { date: { $lt: event.date } },
          { date: event.date, updateId: { $lte: updateId } },
          { date: null },
        ],
      },
      { $set: { ...selector, actorId, date: event.date, updateId, reactions } },
      { upsert: true, runValidators: true },
    );
  } catch (error: unknown) {
    // A stale webhook cannot replace a newer state or increment a count twice.
    if (!(error instanceof mongo.MongoServerError && error.code === 11000))
      throw error;
  }
  const message = await models.TelegramConversationMessages.findOne(selector);
  if (!message) return; // Saved above; a later message insert projects these reactions.
  const conversation = await models.TelegramConversations.findOne({
    _id: message.conversationId,
    integrationId,
  });
  if (!conversation?.erxesApiId)
    throw new Error(
      'Telegram conversation is not linked yet; retry the webhook',
    );
  const inboxId = conversation.erxesApiId;
  await withTelegramEventLease(models, message._id, () =>
    syncTelegramReactions(models, subdomain, inboxId, message),
  );
};
