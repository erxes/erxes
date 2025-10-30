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

  let integration;
  console.log(conversation, 'conversation.integrationId');

  if (conversation) {
    integration = await models.Integrations.findOne(
      {
        _id: conversation.integrationId,
      },
      { _id: 1, name: 1, channelId: 1 },
    );
  }

  let channelMemberIds: string[] = [];

  if (integration) {
    const channels = await models.Channels.find(
      {
        _id: { $in: [integration.channelId] },
      },
      { _id: 1, memberIds: 1 },
    );

    for (const channel of channels) {
      channelMemberIds = [...channelMemberIds, ...(channel.memberIds || [])];
    }
  }

  try {
    console.log(`conversationMessageInserted:${conversation?._id}`);
    await graphqlPubsub.publish(
      `conversationMessageInserted:${conversation?._id}`,
      {
        conversationMessageInserted: message,
        subdomain,
        conversation,
        integration,
      },
    );
  } catch (err) {
    throw new Error(
      'conversationMessageInserted Error publishing subscription:',
    );
  }
  console.log(channelMemberIds, 'channelMemberIds', conversation, integration);
  for (const userId of channelMemberIds) {
    console.log(`conversationClientMessageInserted:${subdomain}:${userId}`);
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
