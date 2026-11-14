import {
  getPlugins,
  sendTRPCMessage,
  validSearchText,
} from 'erxes-api-shared/utils';
import debug from 'debug';
import { generateModels } from '~/connectionResolvers';
import { getConfig } from '../integrations/facebook/commonUtils';
import { ITicketWidget } from './graphql/resolvers/mutations/widget';

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
    mail: 'Email',
    'facebook-messenger': 'Facebook messenger',
    'facebook-post': 'Facebook post',
    'instagram-messenger': 'Instagram messenger',
    'instagram-post': 'Instagram post',
    'discord-messenger': 'Discord',
    'telegram-messenger': 'Telegram',
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

type TMessengerAutomation = {
  _id: string;
  triggers?: { config?: { conditions?: { type?: string; isSelected?: boolean }[] } }[];
  actions?: { type?: string; label?: string }[];
};

/**
 * The automation a messenger names in its settings, read from core: only
 * active Erxes Messenger automations count, as in the builder.
 */
export const getMessengerAutomation = async (
  subdomain: string,
  automationId?: string,
): Promise<TMessengerAutomation | undefined> => {
  if (!automationId) {
    return undefined;
  }

  const automations: TMessengerAutomation[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'automation',
    action: 'find',
    input: { query: { triggerType: 'frontline:inbox.messages' } },
    defaultValue: [],
  }).catch(() => []);

  return (automations || []).find(
    ({ _id }) => String(_id) === String(automationId),
  );
};

// The messenger shows a "Get started" button when its automation asks for it
export const getMessengerGetStarted = (automation?: TMessengerAutomation) =>
  (automation?.triggers || [])
    .flatMap((trigger) => trigger.config?.conditions || [])
    .find((condition) => condition.type === 'getStarted');

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
export const fillSearchTextItem = (
  doc: ITicketWidget,
  item?: ITicketWidget,
) => {
  const document = item || { name: '', description: '' };
  Object.assign(document, doc);

  return validSearchText([document.name || '', document.description || '']);
};
