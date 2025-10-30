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
    const channelMembers = await models.ChannelMembers.find(
      { channelId: integration.channelId },
      { memberId: 1 },
    ).lean();

    channelMemberIds = [
      ...channelMemberIds,
      ...channelMembers.map((member: { memberId: string }) => member?.memberId),
    ];
  }

  try {
    console.log(`asd conversationMessageInserted:${conversation?._id}`);
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
  console.log(channelMemberIds, 'channelMemberIds');
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
