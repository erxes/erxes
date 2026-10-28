import type { IContext, IModels } from '~/connectionResolvers';
import { visibleChannelsFilter } from '@/channel/utils';
import { visibleIntegrationsFilter } from '@/inbox/utils/integrationVisibility';

export const assertMailSenderAccess = async ({
  models,
  subdomain,
  user,
  integrationId,
}: {
  models: IModels;
  subdomain: string;
  user: IContext['user'];
  integrationId: string;
}): Promise<void> => {
  if (!user?._id) {
    throw new Error('Authentication required');
  }

  const channelIds = await models.Channels.find(
    await visibleChannelsFilter({ models, subdomain, user }),
  ).distinct('_id');
  const allowed = await models.Integrations.exists({
    _id: integrationId,
    kind: 'mail',
    isActive: { $ne: false },
    channelId: { $in: channelIds },
    ...(await visibleIntegrationsFilter(subdomain, user)),
  });

  if (
    !allowed ||
    !(await models.MailIntegrations.exists({
      inboxId: integrationId,
      disabledAt: null,
    }))
  ) {
    throw new Error('Mail sender not found or permission required');
  }
};
