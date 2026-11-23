/**
 * A portal's connections and the integration each must be one of: verify.mn for phones that
 * text the code, and the Google, Apple and Facebook sign-in integrations.
 */
export const PORTAL_CONNECTIONS = [
  ['phoneConnectionId', 'verify-mn'],
  ['googleConnectionId', 'google-sign-in'],
  ['appleConnectionId', 'apple-sign-in'],
  ['facebookConnectionId', 'facebook-login'],
] as const;
