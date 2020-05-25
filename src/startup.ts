import * as twitterApi from './twitter/api';

import { debugGmail, debugNylas, debugSmooch, debugTwitter, debugWhatsapp } from './debuggers';
import { setupSmooch, setupSmoochWebhook } from './smooch/api';

import { trackGmail } from './gmail/watch';
import { setupNylas } from './nylas/controller';
import { createNylasWebhook } from './nylas/tracker';
import { getConfig } from './utils';
import { setupChatApi as setupWhatsapp } from './whatsapp/api';

export const init = async () => {
  const USE_NATIVE_GMAIL = await getConfig('USE_NATIVE_GMAIL');
  const TWITTER_CONSUMER_KEY = await getConfig('TWITTER_CONSUMER_KEY');

  if (USE_NATIVE_GMAIL === 'true') {
    trackGmail()
      .then(() => debugGmail('Successfully called trackGmail'))
      .catch(e => {
        debugGmail(e.message);
        throw e;
      });
  }

  if (TWITTER_CONSUMER_KEY) {
    try {
      await twitterApi.registerWebhook();
    } catch (e) {
      debugTwitter(e.message);
    }
  }

  try {
    await setupNylas();
    await createNylasWebhook();
  } catch (e) {
    debugNylas(e.message);
  }

  try {
    await setupWhatsapp();
  } catch (e) {
    debugWhatsapp(e.message);
  }

  try {
    await setupSmooch();
    await setupSmoochWebhook();
  } catch (e) {
    debugSmooch(`failed to setup smooch: ${e.message}`);
  }
};
