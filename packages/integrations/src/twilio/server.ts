import { z } from 'zod';
import {
  basic,
  defineIntegration,
  field,
  gatewayHttp,
  secret,
} from '@erxes/plugin-sdk/integrations';

const keys = z.object({
  accountSid: field(
    'Account SID',
    z
      .string()
      .trim()
      .regex(/^AC[0-9a-f]{32}$/, 'an Account SID: AC and 32 letters and digits'),
  ),
  authToken: secret('Auth token'),
  from: field('From number or sender id'),
});

/**
 * Twilio text messages, worldwide: the organisation's sign-in codes, notifications, broadcasts
 * and plugins' texts go out through it.
 */
export const twilio = defineIntegration({
  key: 'twilio',
  name: 'Twilio SMS',
  summary: 'Texts to phones worldwide: sign-in codes, notifications and broadcasts.',
  category: 'messaging',
  countries: [],
  permission: 'integrations.manage',
  dashboard: 'https://console.twilio.com',
  keys,
  client: (config, options) => ({
    config,
    send: gatewayHttp(
      'Twilio',
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}`,
      options,
    ),
    auth: basic(config.accountSid, config.authToken),
  }),
  verify: async ({ send, auth }) => {
    await send('.json', { headers: { Authorization: auth } });
  },
  smsSending: {
    send: async ({ config, send, auth }, { to, text }) => {
      await send('/Messages.json', {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ From: config.from, To: to, Body: text }).toString(),
      });
    },
  },
});
