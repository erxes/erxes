import { SMS_KEYS } from '~/modules/integrations/registry';

/**
 * A portal's connections and the integrations each may be of: verify.mn for phones that text
 * the code, an SMS integration that texts codes to phones, and the Google, Apple and Facebook
 * sign-in integrations.
 */
export const PORTAL_CONNECTIONS: readonly (readonly [
  (
    | 'phoneConnectionId'
    | 'smsConnectionId'
    | 'googleConnectionId'
    | 'appleConnectionId'
    | 'facebookConnectionId'
  ),
  readonly string[],
])[] = [
  ['phoneConnectionId', ['verify-mn']],
  ['smsConnectionId', SMS_KEYS],
  ['googleConnectionId', ['google-sign-in']],
  ['appleConnectionId', ['apple-sign-in']],
  ['facebookConnectionId', ['facebook-login']],
];
