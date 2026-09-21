import {
  IDeliveryLogPort,
  ISuppressionPort,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { debugError } from '@/integrations/mail/debuggers';
import { MailSendError } from '@/integrations/mail/utils/transports/common';

export const MAIL_DELIVERY_SOURCE = 'frontline:mail';

export const createDeliveryLogPort = (subdomain: string): IDeliveryLogPort => ({
  async create(input) {
    return await sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'emailDeliveries',
      action: 'create',
      input,
    });
  },

  async update(_id, patch) {
    await sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'emailDeliveries',
      action: 'recordHandoff',
      input: { _id, patch },
    });
  },
});

export const createSuppressionPort = (subdomain: string): ISuppressionPort => ({
  async blocked(emails, source) {
    const result: { emails: string[] } | undefined = await sendTRPCMessage({
      subdomain,
      method: 'query',
      pluginName: 'core',
      module: 'emailSuppression',
      action: 'blocked',
      input: { emails, source },
    });

    if (!result) {
      debugError(
        'Could not read email suppression from core — holding the reply back',
      );

      throw new MailSendError(
        'The suppression list could not be read, so this reply was held back rather than risk mailing an address that has bounced or opted out. Try again once core is reachable.',
        true,
      );
    }

    return result.emails;
  },
});
