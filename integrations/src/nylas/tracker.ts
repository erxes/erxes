import { debugNylas } from '../debuggers';
import { getConfig } from '../utils';
import { checkCredentials, nylasInstance } from './api';
import { MESSAGE_WEBHOOKS } from './constants';

export const createNylasWebhook = async () => {
  debugNylas('Creating Nylas webhook');

  const NYLAS_WEBHOOK_CALLBACK_URL = await getConfig('NYLAS_WEBHOOK_CALLBACK_URL');

  if (!checkCredentials()) {
    debugNylas('Nylas is not configured');
    throw new Error('Nylas is not configured');
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
      debugNylas('Nylas webhook callback url already exists');
      throw new Error('Nylas webhook callback url already exists');
    }

    debugNylas(`Error occured while creating webhook: ${e.message}`);

    throw e;
  }
};
