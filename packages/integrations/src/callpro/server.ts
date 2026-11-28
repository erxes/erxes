import { z } from 'zod';
import {
  defineIntegration,
  digits,
  field,
  gatewayHttp,
  json,
  mongolianPhone,
  secret,
} from '@erxes/plugin-sdk/integrations';

const keys = z.object({
  apiKey: secret('API key'),
  from: field('Sender number', digits()),
});

/**
 * CallPro text messages to Mongolian phones: the organisation's sign-in codes, notifications,
 * broadcasts and plugins' texts go out through it.
 */
export const callpro = defineIntegration({
  key: 'callpro',
  name: 'CallPro SMS',
  summary: 'Texts to Mongolian phones: sign-in codes, notifications and broadcasts.',
  category: 'messaging',
  countries: ['MN'],
  permission: 'integrations.manage',
  dashboard: 'https://callpro.mn',
  keys,
  client: (config, options) => ({
    config,
    send: gatewayHttp('CallPro', 'https://api-text.callpro.mn/v1', options),
  }),
  // CallPro has no call that checks a key without sending a text: the first text does.
  verify: async () => undefined,
  smsSending: {
    send: async ({ config, send }, { to, text }) => {
      await send('/sms/send', {
        method: 'POST',
        headers: { 'x-api-key': config.apiKey },
        body: json({ from: config.from, to: mongolianPhone('CallPro', to), text }),
      });
    },
  },
});
