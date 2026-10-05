import type { IContext, IModels } from '~/connectionResolvers';
import { visibleChannelsFilter } from '@/channel/utils';

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
    ...(user.isOwner
      ? {}
      : {
          $or: [
            { visibility: { $exists: false } },
            { visibility: 'public' },
            {
              visibility: 'private',
              $or: [
                { createdUserId: user._id },
                { departmentIds: { $in: user.departmentIds ?? [] } },
              ],
            },
          ],
        }),
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
