import { z } from 'zod';
import {
  defineIntegration,
  GatewayError,
  gatewayHttp,
  json,
  mongolianPhone,
  parse,
  secret,
  withBearer,
} from '@erxes/plugin-sdk/integrations';

const keys = z.object({
  apiKey: secret('API key', z.string().trim().min(8).max(200)),
});

const Session = z.object({
  sessionId: z.string().min(1),
  shortcode: z.string().min(1),
  text: z.string().min(1),
  smsUri: z.string().min(1),
  displayInstruction: z.string().min(1),
  expiresAt: z.iso.datetime({ offset: true }),
});

const Status = z.object({ sessionStatus: z.string() });

/** verify.mn's session statuses, as phone replies say them. */
const STATUS = new Map<string, 'pending' | 'verified' | 'expired'>([
  ['PENDING', 'pending'],
  ['VERIFIED', 'verified'],
  ['EXPIRED', 'expired'],
]);

/**
 * verify.mn: customers prove their phone by texting a code to 144773 from it, on any Mongolian
 * operator. The customer pays for the text, and the organisation needs no SMS provider.
 */
export const verifyMn = defineIntegration({
  key: 'verify-mn',
  name: 'verify.mn',
  summary: 'Customers prove their phone by texting a code to 144773: no SMS provider needed.',
  category: 'sign_in',
  countries: ['MN'],
  permission: 'integrations.manage',
  dashboard: 'https://verify.mn',
  keys,
  client: (config, options) =>
    withBearer(
      gatewayHttp('verify.mn', 'https://api.verify.mn', options),
      async () => config.apiKey,
    ),
  // An empty session is refused for its fields (400) with a good key, and for the key (401).
  verify: async (send) => {
    await send('/sessions', { method: 'POST', body: json({}) }).catch((error: unknown) => {
      if (error instanceof GatewayError && error.status === 400) return '';

      throw error;
    });
  },
  phoneReply: {
    start: async (send, { phone, text }) => {
      const session = parse(
        'verify.mn',
        Session,
        await send('/sessions', {
          method: 'POST',
          body: json({ phone: mongolianPhone('verify.mn', phone), text }),
        }),
        'no session',
      );

      return {
        sessionId: session.sessionId,
        to: session.shortcode,
        smsUri: session.smsUri,
        instruction: session.displayInstruction,
        expiresAt: new Date(session.expiresAt),
      };
    },
    check: async (send, sessionId) => {
      const { sessionStatus } = parse(
        'verify.mn',
        Status,
        await send(`/sessions/${encodeURIComponent(sessionId)}`),
        'no session status',
      );

      const status = STATUS.get(sessionStatus);

      if (!status) throw new GatewayError(`verify.mn gave an unknown status: ${sessionStatus}`);

      return status;
    },
  },
});
