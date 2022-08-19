import * as twitterApi from './twitter/api';

import { debugError } from './debuggers';
import { setupSmooch, setupSmoochWebhook } from './smooch/api';

import { setupNylas } from './nylas/controller';
import { createNylasWebhook } from './nylas/tracker';
import { getConfig } from './utils';
import { setupChatApi as setupWhatsapp } from './whatsapp/api';

export const init = async () => {
  const TWITTER_CONSUMER_KEY = await getConfig('TWITTER_CONSUMER_KEY');

  if (TWITTER_CONSUMER_KEY) {
    try {
      await twitterApi.registerWebhook();
    } catch (e) {
      debugError(`failed to setup twitter: ${e.message}`);
    }
  }

  try {
    await setupNylas();
    await createNylasWebhook();
  } catch (e) {
    debugError(`failed to setup nylas: ${e.message}`);
  }

  try {
    await setupWhatsapp();
  } catch (e) {
    debugError(`failed to setup whatsapp: ${e.message}`);
  }

  try {
    await setupSmooch();
    await setupSmoochWebhook();
  } catch (e) {
    debugError(`failed to setup smooch: ${e.message}`);
  }
};
