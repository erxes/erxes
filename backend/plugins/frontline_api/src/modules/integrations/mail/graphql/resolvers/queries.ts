import { IContext } from '~/connectionResolvers';
import { visibleChannelsFilter } from '@/channel/utils';
import { createPermissionValidator } from '@/ticket/utils/permissionValidator';
import { listCloudflareZones } from '@/integrations/mail/utils/cloudflare/connect';
import { readSendingQuota } from '@/integrations/mail/utils/cloudflare/sending';
import { toPublicConnection } from '@/integrations/mail/utils/cloudflare/serialize';
import { findPipelineIntegration } from '@/integrations/mail/utils/pipeline';
import { readMailThread } from '@/integrations/mail/utils/thread';
import { readSendingReadiness } from '@/integrations/mail/utils/transports/readiness';
import { assertMailConversationAccess } from '@/integrations/mail/utils/access';

export const mailQueries = {
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

  async mailConversationDrafts(
    _root: undefined,
    { conversationId }: { conversationId: string },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('showConversations');

    await assertMailConversationAccess({
      models,
      subdomain,
      user,
      conversationId,
    });

    return models.MailDrafts.getConversationDrafts(conversationId);
  },

  async mailInboxes(
    _root: undefined,
    _args: undefined,
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('showIntegrations');

    const visibleChannelIds: string[] = await models.Channels.find(
      await visibleChannelsFilter({ models, subdomain, user }),
    ).distinct('_id');

    const integrations = await models.MailIntegrations.find(
      { inboxId: { $exists: true, $ne: null }, disabledAt: null },
      { inboxId: 1, address: 1 },
    ).lean();

    const inboxes = await models.Integrations.find(
      {
        _id: { $in: integrations.map(({ inboxId }) => inboxId) },
        channelId: { $in: visibleChannelIds },
        isActive: { $ne: false },
      },
      { name: 1 },
    ).lean();

    const names = new Map(inboxes.map(({ _id, name }) => [String(_id), name]));

    return integrations
      .filter(({ inboxId }) => names.has(String(inboxId)))
      .map(({ inboxId, address }) => ({
        _id: inboxId,
        name: names.get(String(inboxId)) || address,
        address,
      }));
  },
};
