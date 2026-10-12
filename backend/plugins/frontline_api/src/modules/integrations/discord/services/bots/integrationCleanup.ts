import type { IModels } from '~/connectionResolvers';
export const detachIntegrationsFromChannels = async (
  models: IModels,
  integrationIds: string[],
) => {
  if (!integrationIds.length) {
    return;
  }

  await models.Channels.updateMany(
    { integrationIds: { $in: integrationIds } },
    { $pull: { integrationIds: { $in: integrationIds } } },
  );
};
export const removeInboxConversations = async (
  models: IModels,
  integrationIds: string[],
) => {
  if (!integrationIds.length) {
    return;
  }

  const conversationIds = await models.Conversations.find({
    integrationId: { $in: integrationIds },
  }).distinct('_id');

  await models.ConversationMessages.deleteMany({
    conversationId: { $in: conversationIds },
  });
  await models.Conversations.deleteMany({
    integrationId: { $in: integrationIds },
  });
};
