import * as Nylas from 'nylas';
import { debugNylas } from '../debuggers';
import { getEnv } from '../utils';
import { MESSAGE_WEBHOOKS } from './constants';
import { checkCredentials } from './utils';

/**
 * Create webhook for specific triggers
 */
export const createWebhook = async () => {
  debugNylas('Creating Nylas webhook');

  const NYLAS_WEBHOOK_CALLBACK_URL = getEnv({ name: 'NYLAS_WEBHOOK_CALLBACK_URL' });

  if (!checkCredentials()) {
    return debugNylas('Nylas is not configured');
  }

  const options = {
    state: 'active',
    triggers: MESSAGE_WEBHOOKS,
    callbackUrl: NYLAS_WEBHOOK_CALLBACK_URL,
  };

  return Nylas.webhooks
    .build(options)
    .save()
    .then(webhook => {
      debugNylas('Successfully created a webhook id: ' + webhook.id);
      return webhook.id;
    })
    .catch(e => {
      debugNylas('Error occured while creating webhook: ' + e.message);
    });
};
