import { IContext } from '~/connectionResolvers';
import {
  IMailMessageDocument,
  IMailSendArgs,
} from '@/integrations/mail/@types/message';
import { createPermissionValidator } from '@/ticket/utils/permissionValidator';
import { checkMailConnection } from '@/integrations/mail/utils/connection';
import { findViewableTicket } from '@/integrations/mail/utils/tickets';
import {
  IPipelineMailSettings,
  connectPipelineMail,
  disconnectPipelineMail,
  markPipelineForwardVerified,
  updatePipelineMail,
} from '@/integrations/mail/utils/pipeline';
import {
  connectCloudflare,
  disconnectCloudflare,
} from '@/integrations/mail/utils/cloudflare/connect';
import { provisionCloudflare } from '@/integrations/mail/utils/cloudflare/provision';
import { toPublicConnection } from '@/integrations/mail/utils/cloudflare/serialize';

const toDeliveryOutcome = (message: IMailMessageDocument) => ({
  _id: message._id,
  deliveryStatus: message.deliveryStatus,
  deliveryError: message.deliveryError,
  bouncedRecipients: message.bouncedRecipients ?? [],
});

export const mailMutations = {
  async mailCloudflareConnect(
    _root: undefined,
    args: { token: string; zoneId: string },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return toPublicConnection(await connectCloudflare(subdomain, args));
  },

  async mailCloudflareProvision(
    _root: undefined,
    _args: undefined,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return toPublicConnection(await provisionCloudflare(subdomain));
  },

  async mailCloudflareDisconnect(
    _root: undefined,
    _args: undefined,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    await disconnectCloudflare(subdomain);

    return true;
  },

  async mailSendMail(
    _root: undefined,
    args: IMailSendArgs,
    { subdomain, models, checkPermission }: IContext,
  ) {
    await checkPermission('conversationMessageAdd');

    return toDeliveryOutcome(
      await models.MailMessages.createSendMail(args, subdomain),
    );
  },

  async mailPipelineConnect(
    _root: undefined,
    { pipelineId, ...settings }: { pipelineId: string } & IPipelineMailSettings,
    { subdomain, models, user, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    await createPermissionValidator(models).validatePipelineAccess(
      pipelineId,
      user,
    );

    return connectPipelineMail({ models, subdomain, pipelineId, ...settings });
  },

  async mailPipelineUpdate(
    _root: undefined,
    { pipelineId, ...settings }: { pipelineId: string } & IPipelineMailSettings,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    await createPermissionValidator(models).validatePipelineAccess(
      pipelineId,
      user,
    );

    return updatePipelineMail(models, pipelineId, settings);
  },

  async mailPipelineForwardVerified(
    _root: undefined,
    { pipelineId }: { pipelineId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    await createPermissionValidator(models).validatePipelineAccess(
      pipelineId,
      user,
    );

    return markPipelineForwardVerified(models, pipelineId);
  },

  async mailPipelineDisconnect(
    _root: undefined,
    { pipelineId }: { pipelineId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    await createPermissionValidator(models).validatePipelineAccess(
      pipelineId,
      user,
    );

    return disconnectPipelineMail(models, pipelineId);
  },

  async mailMessageRetry(
    _root: undefined,
    { _id }: { _id: string },
    { subdomain, models, checkPermission }: IContext,
  ) {
    await checkPermission('conversationMessageAdd');

    return toDeliveryOutcome(
      await models.MailMessages.retrySend(_id, subdomain),
    );
  },

  async mailTicketNoteRetry(
    _root: undefined,
    { noteId }: { noteId: string },
    { subdomain, models, user, checkPermission }: IContext,
  ) {
    await checkPermission('showTickets');

    const note = await models.Note.getNote(noteId);

    await findViewableTicket(models, user, note.contentId);

    if (!note.mailMessageId) {
      throw new Error(
        'This note was never mailed, so there is nothing to resend',
      );
    }

    await models.MailMessages.retrySend(note.mailMessageId, subdomain);

    return note;
  },

  async mailCheckConnection(
    _root: undefined,
    _args: undefined,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return checkMailConnection(subdomain);
  },
};
