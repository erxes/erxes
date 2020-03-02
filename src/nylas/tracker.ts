import { debugNylas } from '../debuggers';
import { getConfig } from '../utils';
import { MESSAGE_WEBHOOKS } from './constants';
import { checkCredentials, nylasInstance } from './utils';

export const createNylasWebhook = async () => {
  debugNylas('Creating Nylas webhook');

  const NYLAS_WEBHOOK_CALLBACK_URL = await getConfig('NYLAS_WEBHOOK_CALLBACK_URL');

  if (!checkCredentials()) {
    return debugNylas('Nylas is not configured');
  }

  const options = {
    state: 'active',
    triggers: MESSAGE_WEBHOOKS,
    callbackUrl: NYLAS_WEBHOOK_CALLBACK_URL,
  };

  try {
    const nylasWebhook = await nylasInstance('webhooks', 'build', options, 'save');

    debugNylas(`Successfully created a webhook id: ${nylasWebhook.id}`);

    return nylasWebhook.id;
  } catch (e) {
    if (e.message.includes('already exists')) {
      return debugNylas('Nylas webhook callback url already exists');
    }

    debugNylas(`Error occured while creating webhook: ${e.message}`);

    throw e;
  }
};
