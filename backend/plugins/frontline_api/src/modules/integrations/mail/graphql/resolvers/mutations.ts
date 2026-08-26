import { IContext } from '~/connectionResolvers';
import {
  IMailMessageDocument,
  IMailSendArgs,
} from '@/integrations/mail/@types/message';
import { checkMailConnection } from '@/integrations/mail/utils/connection';
import {
  connectCloudflare,
  disconnectCloudflare,
} from '@/integrations/mail/utils/cloudflare/connect';
import { provisionCloudflare } from '@/integrations/mail/utils/cloudflare/provision';
import { toPublicConnection } from '@/integrations/mail/utils/cloudflare/serialize';
import { toPublicSendingAccount } from '@/integrations/mail/utils/sendingSerialize';
import { IMailSendingAccountInput } from '@/integrations/mail/@types/sending';

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

    return await disconnectCloudflare(subdomain);
  },

  async mailSendingAccountAdd(
    _root: undefined,
    args: IMailSendingAccountInput,
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return toPublicSendingAccount(
      await models.MailSendingAccounts.add(args, subdomain),
    );
  },

  async mailSendingAccountVerify(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return toPublicSendingAccount(await models.MailSendingAccounts.verify(_id));
  },

  async mailSendingAccountRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return await models.MailSendingAccounts.remove(_id);
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

  async mailCheckConnection(
    _root: undefined,
    _args: undefined,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return checkMailConnection(subdomain);
  },
};
