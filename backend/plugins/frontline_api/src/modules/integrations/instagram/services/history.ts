import type { IModels } from '~/connectionResolvers';
import type { IMessagesParams } from '../@types/utils';
import { normalizeStoredInstagramMessage } from '../normalizeMessage';

const findHistorySource = async (models: IModels, conversationId: string) => {
  const conversation = await models.InstagramConversations.findOne({
    erxesApiId: conversationId,
  }).lean();
  if (conversation) return { conversation };

  const comment = await models.InstagramCommentConversation.findOne({
    erxesApiId: conversationId,
  }).lean();
  return comment ? { comment } : undefined;
};

export const readInstagramHistory = async (
  models: IModels,
  { conversationId, skip = 0, limit = 50, getFirst = false }: IMessagesParams,
) => {
  const source = await findHistorySource(models, conversationId);
  if (!source) return [];

  const offset = Math.max(skip, 0);
  const pageSize = Math.min(Math.max(limit, 1), 100);
  const direction = getFirst ? 1 : -1;
  const sort: { createdAt: 1 | -1; _id: 1 | -1 } = {
    createdAt: direction,
    _id: direction,
  };
  // Fetch a bounded prefix from each source, then paginate the combined
  // timeline. Applying skip to each collection separately loses messages.
  const take = offset + pageSize;
  const inboxMessages = await models.ConversationMessages.find({
    conversationId,
    $or: [
      { internal: true },
      ...(source.conversation
        ? [{ 'extraData.instagramDelivery': { $exists: true } }]
        : []),
    ],
  })
    .sort(sort)
    .limit(take)
    .lean();
  const messages = source.conversation
    ? (
        await models.InstagramConversationMessages.find({
          conversationId: source.conversation._id,
        })
          .sort(sort)
          .limit(take)
          .lean()
      ).map((message) => ({
        ...normalizeStoredInstagramMessage(message),
        _id: message._id,
        conversationId,
      }))
    : [
        source.comment,
        ...(await models.InstagramCommentConversationReply.find({
          parentId: source.comment.comment_id,
          recipientId: source.comment.recipientId,
        })
          .sort(sort)
          .limit(take)
          .lean()),
      ].map((message) => ({
        ...message,
        conversationId,
        mid: message.comment_id || message.mid,
        messageKind: 'text' as const,
        providerData: { messageId: message.comment_id || message.mid },
      }));

  // New outbound parts have canonical copies (as in Telegram). Prefer those
  // over provider copies, retaining legacy history and acknowledged parts
  // whose provider-history write failed after Meta accepted them.
  const timeline = new Map<
    string,
    (typeof messages)[number] | (typeof inboxMessages)[number]
  >();
  for (const message of [...messages, ...inboxMessages]) {
    const providerId = message.providerData?.messageId;
    const key =
      !('internal' in message && message.internal) && providerId
        ? `provider:${providerId}`
        : `inbox:${message._id}`;
    timeline.set(key, message);
  }
  const page = [...timeline.values()]
    .sort((a, b) => {
      const time =
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime();
      return direction * (time || String(a._id).localeCompare(String(b._id)));
    })
    .slice(offset, offset + pageSize);
  return getFirst ? page : page.reverse();
};

export const countInstagramHistory = async (
  models: IModels,
  conversationId: string,
) => {
  const source = await findHistorySource(models, conversationId);
  if (!source) return 0;
  const notes = await models.ConversationMessages.countDocuments({
    conversationId,
    internal: true,
  });
  const messages = source.conversation
    ? await models.InstagramConversationMessages.countDocuments({
        conversationId: source.conversation._id,
      })
    : 1 +
      (await models.InstagramCommentConversationReply.countDocuments({
        parentId: source.comment.comment_id,
        recipientId: source.comment.recipientId,
      }));
  if (!source.conversation) return messages + notes;
  const missingProviderCopies = await models.ConversationMessages.aggregate<{
    count: number;
  }>([
    {
      $match: {
        conversationId,
        internal: { $ne: true },
        'extraData.instagramDelivery': { $exists: true },
      },
    },
    {
      $lookup: {
        from: models.InstagramConversationMessages.collection.name,
        let: { mid: '$providerData.messageId' },
        pipeline: [
          {
            $match: {
              conversationId: source.conversation._id,
              $expr: { $eq: ['$mid', '$$mid'] },
            },
          },
          { $limit: 1 },
        ],
        as: 'providerCopies',
      },
    },
    { $match: { providerCopies: { $size: 0 } } },
    { $count: 'count' },
  ]);
  return messages + notes + (missingProviderCopies[0]?.count || 0);
};
