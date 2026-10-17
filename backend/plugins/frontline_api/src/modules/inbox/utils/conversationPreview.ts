import type { IConversationDocument } from '@/inbox/@types/conversations';
import type { IMessageDocument } from '@/inbox/@types/conversationMessages';
import type { IModels } from '~/connectionResolvers';

export const withConversationPreviews = async (
  models: IModels,
  conversations: IConversationDocument[],
) => {
  if (!conversations.length) return [];
  const previews = await models.Conversations.aggregate<{
    _id: string;
    lastMessage?: IMessageDocument;
  }>([
    { $match: { _id: { $in: conversations.map(({ _id }) => _id) } } },
    {
      $lookup: {
        from: models.ConversationMessages.collection.name,
        let: { conversationId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$conversationId', '$$conversationId'] },
              internal: { $ne: true },
            },
          },
          { $sort: { createdAt: -1, _id: -1 } },
          { $limit: 1 },
          {
            $project: {
              _id: 1,
              content: 1,
              attachments: 1,
              contentType: 1,
              messageKind: 1,
              providerData: 1,
              extraData: 1,
              createdAt: 1,
            },
          },
        ],
        as: 'previewMessages',
      },
    },
    { $project: { lastMessage: { $arrayElemAt: ['$previewMessages', 0] } } },
  ]);
  const byId = new Map(
    previews.map(({ _id, lastMessage }) => [_id, lastMessage]),
  );
  return conversations.map((conversation) => ({
    ...(typeof conversation.toObject === 'function'
      ? conversation.toObject<IConversationDocument>()
      : conversation),
    lastMessage: byId.get(conversation._id) ?? null,
  }));
};
