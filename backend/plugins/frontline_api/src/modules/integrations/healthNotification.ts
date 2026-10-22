import { sendNotification } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

/** Tells the integration's channel members that it lost access to its provider. */
export const notifyIntegrationBroken = async (
  models: IModels,
  subdomain: string,
  {
    provider,
    integrationId,
    error,
  }: { provider: string; integrationId: string; error: string },
) => {
  const integration = await models.Integrations.findOne({
    _id: integrationId,
  }).lean();

  if (!integration?.channelId) {
    return;
  }

  const members = await models.ChannelMembers.find({
    channelId: integration.channelId,
  }).lean();

  if (!members.length) {
    return;
  }

  await sendNotification(subdomain, {
    title: `${provider} connection broken`,
    message: `${integration.name}: ${error}`,
    type: 'error',
    priority: 'urgent',
    kind: 'user',
    fromUserId: integration.createdUserId || '',
    userIds: members.map(({ memberId }) => memberId),
    contentType: 'frontline:inbox.integration',
    contentTypeId: integration._id,
    action: 'healthBroken',
    notificationType: 'integrationHealthBroken',
  });
};
