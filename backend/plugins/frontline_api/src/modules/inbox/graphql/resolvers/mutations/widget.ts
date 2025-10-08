import { graphqlPubsub } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

export const pConversationClientMessageInserted = async (
  subdomain,
  message: { _id: string; [other: string]: any },
) => {
  const models = await generateModels(subdomain);

  const conversation = await models.Conversations.findOne(
    {
      _id: message.conversationId,
    },
    { integrationId: 1 },
  );
  if (!conversation) {
    console.warn(`Conversation not found for message: ${message._id}`);
    return;
  }
  const integration = await models.Integrations.findOne(
    {
      _id: conversation.integrationId,
    },
    { _id: 1, name: 1 },
  );

  let channelMemberIds: string[] = [];

  if (integration?.channelId) {
    const members = await models.ChannelMembers.find(
      { channelId: integration.channelId },
      { memberId: 1 },
    ).lean();

    channelMemberIds = members.map((m) => m.memberId.toString());
  }
  if (!conversation) {
    console.warn(`Conversation not found for message: ${message._id}`);
    return;
  }
  await graphqlPubsub.publish(
    `conversationMessageInserted:${conversation._id}`,
    {
      conversationMessageInserted: message,
      subdomain,
      conversation,
      integration,
    },
  );

  for (const userId of channelMemberIds) {
    await graphqlPubsub.publish(
      `conversationClientMessageInserted:${subdomain}:${userId}`,
      {
        conversationClientMessageInserted: message,
        subdomain,
        conversation,
        integration,
      },
    );
  }
};
