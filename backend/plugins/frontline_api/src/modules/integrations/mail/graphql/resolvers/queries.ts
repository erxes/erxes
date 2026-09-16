import { IContext } from '~/connectionResolvers';
import { createPermissionValidator } from '@/ticket/utils/permissionValidator';
import { listCloudflareZones } from '@/integrations/mail/utils/cloudflare/connect';
import { readSendingQuota } from '@/integrations/mail/utils/cloudflare/sending';
import { toPublicConnection } from '@/integrations/mail/utils/cloudflare/serialize';
import { findPipelineIntegration } from '@/integrations/mail/utils/pipeline';
import { readMailThread } from '@/integrations/mail/utils/thread';
import { readSendingReadiness } from '@/integrations/mail/utils/transports/readiness';
import { visibleChannelsFilter } from '@/channel/utils';

export const mailQueries = {
  async mailSenders(
    _root: undefined,
    _args: undefined,
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('conversationMessageAdd');

    if (!user?._id) {
      throw new Error('Unauthorized');
    }

    const channelIds = await models.Channels.find(
      await visibleChannelsFilter({ models, subdomain, user }),
    ).distinct('_id');

    const inboxes = await models.Integrations.find({
      kind: 'mail',
      isActive: true,
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
      .select(['_id', 'name'])
      .sort({ name: 1 })
      .lean();

    const mailIntegrations = await models.MailIntegrations.find({
      inboxId: { $in: inboxes.map(({ _id }) => _id) },
      healthStatus: { $ne: 'unhealthy' },
    })
      .select(['inboxId', 'address'])
      .lean();
    const addressByInboxId = new Map(
      mailIntegrations.map(({ inboxId, address }) => [inboxId, address]),
    );

    return inboxes.flatMap(({ _id, name }) => {
      const address = addressByInboxId.get(_id);
      return address ? [{ integrationId: _id, name, address }] : [];
    });
  },
  async mailCloudflareConnection(
    _root: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return toPublicConnection(await models.MailCloudflare.current());
  },

  async mailSendingReadiness(
    _root: undefined,
    _args: undefined,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return await readSendingReadiness(subdomain);
  },

  async mailCloudflareSendingQuota(
    _root: undefined,
    _args: undefined,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return await readSendingQuota(subdomain);
  },

  async mailCloudflareZones(
    _root: undefined,
    { token }: { token: string },
    { checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return await listCloudflareZones(token);
  },

  async mailPipelineIntegration(
    _root: undefined,
    { pipelineId }: { pipelineId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('showIntegrations');

    await createPermissionValidator(models).validatePipelineAccess(
      pipelineId,
      user,
    );

    return findPipelineIntegration(models, pipelineId);
  },

  async mailConversationDetail(
    _root: undefined,
    { conversationId, limit }: { conversationId: string; limit?: number },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('showConversations');

    return readMailThread(
      models,
      { inboxConversationId: conversationId },
      limit,
    );
  },
};
