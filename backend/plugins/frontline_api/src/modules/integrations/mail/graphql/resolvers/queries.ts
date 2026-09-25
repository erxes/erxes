import { IContext } from '~/connectionResolvers';
import { createPermissionValidator } from '@/ticket/utils/permissionValidator';
import { listCloudflareZones } from '@/integrations/mail/utils/cloudflare/connect';
import { readSendingQuota } from '@/integrations/mail/utils/cloudflare/sending';
import { toPublicConnection } from '@/integrations/mail/utils/cloudflare/serialize';
import { findPipelineIntegration } from '@/integrations/mail/utils/pipeline';
import { readMailThread } from '@/integrations/mail/utils/thread';
import {
  findViewableTicket,
  resolveTicketRecipient,
} from '@/integrations/mail/utils/tickets';
import { readSendingReadiness } from '@/integrations/mail/utils/transports/readiness';

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

  async mailTicketReplyTarget(
    _root: undefined,
    { ticketId }: { ticketId: string },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('showTickets');

    const ticket = await findViewableTicket(models, user, ticketId);

    const integration = await findPipelineIntegration(
      models,
      ticket.pipelineId,
    );

    if (!integration) {
      return null;
    }

    return {
      from: integration.address,
      to: (await resolveTicketRecipient(models, subdomain, ticket._id)) ?? null,
    };
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
