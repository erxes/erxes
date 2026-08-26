import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const publishMentionUnreadCounts = async ({
  conversationId,
  integrationId,
  mentionedUserIds,
  models,
  subdomain,
}: {
  conversationId: string;
  integrationId: string;
  mentionedUserIds?: string[];
  models: IModels;
  subdomain: string;
}) => {
  const userIds = [...new Set(mentionedUserIds || [])];

  if (userIds.length === 0) {
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
    userIds.map(async (mentionedUserId) => {
      const unreadConversationCount =
        await models.Conversations.countDocuments({
          integrationId: { $in: integrationIds },
          status: {
            $in: [CONVERSATION_STATUSES.NEW, CONVERSATION_STATUSES.OPEN],
          },
          readUserIds: { $ne: mentionedUserId },
        });

      await graphqlPubsub.publish(
        `conversationUnreadCountChanged:${subdomain}:${mentionedUserId}`,
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
