import { getPlugins, sendTRPCMessage } from 'erxes-api-shared/utils';
import debug from 'debug';
import { generateModels } from '~/connectionResolvers';
import { getConfig } from '../integrations/facebook/commonUtils';

export const debugInfo = debug(`erxes:info`);
export const debugError = debug(`erxes:error`);

export const MODULE_NAMES = {
  CHANNEL: 'channel',
  EMAIL_TEMPLATE: 'emailTemplate',
  RESPONSE_TEMPLATE: 'responseTemplate',
  CONVERSATION: 'conversation',
  CONVERSATION_MESSAGE: 'conversation_message',
  INTEGRATION: 'integration',
  SCRIPT: 'script',
};

export const getIntegrationsKinds = async () => {
  const response = {
    messenger: 'Messenger',
    lead: 'Popups & forms',
    webhook: 'Webhook',
    booking: 'Booking',
    callpro: 'Callpro',
    imap: 'IMAP',
    'facebook-messenger': 'Facebook messenger',
    'facebook-post': 'Facebook post',
    'instagram-messenger': 'Instagram messenger',
    'instagram-post': 'Instagram post',
    calls: 'Phone call',
    client: 'Client Portal',
    vendor: 'Vendor Portal',
  };

  return response;
};

export const isServiceRunning = async (
  integrationKind: string,
): Promise<boolean> => {
  const serviceNames = await getPlugins();

  // some kinds are separated by -
  return (
    !!integrationKind && serviceNames.includes(integrationKind.split('-')[0])
  );
};

export interface RPSuccess {
  status: 'success';
  data?: any;
}
export interface RPError {
  status: 'error';
  errorMessage: string;
}
export type RPResult = RPSuccess | RPError;

export const integrations = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);

  const { action } = data;

  let response: RPResult = {
    status: 'success',
  };

  try {
    if (action === 'getTelnyxInfo') {
      response.data = {
        telnyxApiKey: await getConfig(models, 'TELNYX_API_KEY'),
        integrations: await models.Integrations.find({ kind: 'telnyx' }),
      };
    }

    if (action === 'getDetails') {
      const integration = await models.Integrations.findOne({
        erxesApiId: data.inboxId,
      }).select(['-_id', '-kind', '-erxesApiId']);

      response.data = integration;
    }
  } catch (e) {
    response = {
      status: 'error',
      errorMessage: e.message,
    };
  }

  return response;
};
