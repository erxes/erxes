import { MAIL_HEALTH_STATUSES } from '@/integrations/mail/constants';
import type { IContext } from '~/connectionResolvers';
import { ChannelScopes } from '@/channel/@types/channel';
import {
  excludeOthersPersonalChannels,
  visibleChannelsFilter,
} from '@/channel/utils';

export interface MailSender {
  integrationId: string;
  name: string;
  address: string;
  channelScope: ChannelScopes;
}

export const readMailSenders = async ({
  models,
  subdomain,
  user,
}: Pick<IContext, 'models' | 'subdomain' | 'user'>): Promise<MailSender[]> => {
  if (!user?._id) {
    throw new Error('Unauthorized');
  }

  const channels = await models.Channels.find({
    $and: [
      await visibleChannelsFilter({ models, subdomain, user }),
      excludeOthersPersonalChannels(user._id),
    ],
  })
    .select(['_id', 'scope'])
    .lean();
  const channelIds = channels.map(({ _id }) => _id);
  const scopeByChannelId = new Map(
    channels.map(({ _id, scope }) => [_id, scope || ChannelScopes.TEAM]),
  );

  const inboxes = await models.Integrations.find({
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
  })
    .select(['_id', 'name', 'channelId'])
    .sort({ name: 1 })
    .lean();

  const mailIntegrations = await models.MailIntegrations.find({
    inboxId: { $in: inboxes.map(({ _id }) => _id) },
    disabledAt: null,
    healthStatus: { $ne: MAIL_HEALTH_STATUSES.UNHEALTHY },
  })
    .select(['inboxId', 'address'])
    .lean();
  const addressByInboxId = new Map(
    mailIntegrations.map(({ inboxId, address }) => [inboxId, address]),
  );

  return inboxes.flatMap(({ _id, name, channelId }) => {
    const address = addressByInboxId.get(_id);
    return address
      ? [
          {
            integrationId: _id,
            name: name || address,
            address,
            channelScope: scopeByChannelId.get(channelId) || ChannelScopes.TEAM,
          },
        ]
      : [];
  });
};
