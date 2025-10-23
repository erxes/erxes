import { getPlugins, sendTRPCMessage } from 'erxes-api-shared/utils';
import debug from 'debug';

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

export const handleAutomation = async (
  subdomain: string,
  {
    conversationMessage,
    payload,
  }: {
    conversationMessage: any;
    payload: any;
  },
) => {
  const target = { ...conversationMessage.toObject() };
  const type = 'inbox:messages';
  if (payload) {
    if (typeof payload === 'string') {
      target.payload = JSON.parse(payload || '{}');
    } else {
      target.payload = payload;
    }
  }
  await sendTRPCMessage({
    subdomain,
    pluginName: 'automations',
    method: 'mutation',
    module: 'triggers',
    action: 'trigger',
    input: {
      type,
      targets: [target],
    },
  })
    .catch((err) => {
      debugError(`Error sending automation message: ${err.message}`);
      throw err;
    })
    .then(() => {
      debugInfo(`Sent message successfully`);
    });
};
