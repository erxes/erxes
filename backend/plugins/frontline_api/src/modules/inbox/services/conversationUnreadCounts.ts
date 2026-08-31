import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const publishConversationUnreadCounts = async ({
  conversationId,
  integrationId,
  userIds,
  models,
  subdomain,
}: {
  conversationId: string;
  integrationId: string;
  userIds: string[];
  models: IModels;
  subdomain: string;
}) => {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  if (!uniqueUserIds.length) {
    return;
  }

  const integration = await models.Integrations.findOne(
    { _id: integrationId },
    { channelId: 1 },
  ).lean();

  if (!integration?.channelId) {
    return;
  }

  const integrationIds = await models.Integrations.find({
    channelId: integration.channelId,
  }).distinct('_id');

  await Promise.all(
    uniqueUserIds.map(async (userId) => {
      const unreadConversationCount = await models.Conversations.countDocuments(
        {
          integrationId: { $in: integrationIds },
          status: {
            $in: [CONVERSATION_STATUSES.NEW, CONVERSATION_STATUSES.OPEN],
          },
          readUserIds: { $ne: userId },
        },
      );

      await graphqlPubsub.publish(
        `conversationUnreadCountChanged:${subdomain}:${userId}`,
        {
          conversationUnreadCountChanged: {
            conversationId,
            channelId: integration.channelId,
            unreadConversationCount,
          },
        },
      );
    }),
  );
};
