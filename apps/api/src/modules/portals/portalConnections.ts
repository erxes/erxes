import { MAIL_KEYS } from '~/modules/integrations/mail';
import { SMS_KEYS } from '~/modules/integrations/registry';

/**
 * A portal's connections and the integrations each may be of: verify.mn for phones that text
 * the code, an SMS integration that texts codes to phones, a Mail service its emails go
 * through, and the Google, Apple and Facebook sign-in integrations.
 */
export const PORTAL_CONNECTIONS: readonly (readonly [
  (
    | 'phoneConnectionId'
    | 'smsConnectionId'
    | 'mailConnectionId'
    | 'googleConnectionId'
    | 'appleConnectionId'
    | 'facebookConnectionId'
  ),
  readonly string[],
])[] = [
  ['phoneConnectionId', ['verify-mn']],
  ['smsConnectionId', SMS_KEYS],
  ['mailConnectionId', MAIL_KEYS],
  ['googleConnectionId', ['google-sign-in']],
  ['appleConnectionId', ['apple-sign-in']],
  ['facebookConnectionId', ['facebook-login']],
];
