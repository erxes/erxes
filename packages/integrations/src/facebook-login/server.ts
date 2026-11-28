import { z } from 'zod';
import {
  defineIntegration,
  digits,
  field,
  gatewayHttp,
  parse,
  secret,
  SocialTokenError,
  verifyIdToken,
} from '@erxes/plugin-sdk/integrations';

const keys = z.object({
  appId: field('App ID', digits()),
  appSecret: secret('App secret'),
});

const Debugged = z.object({
  data: z.object({
    app_id: z.string(),
    is_valid: z.boolean(),
    user_id: z.string().optional(),
  }),
});

const Me = z.object({
  id: z.string().min(1),
  email: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

const LimitedClaims = z.object({
  sub: z.string().min(1),
  email: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
});

/** Facebook gives an email only once the person confirmed it. */
const identityOf = (id: string, email?: string, firstName?: string, lastName?: string) => ({
  subject: id,
  email: email?.toLowerCase() ?? null,
  emailVerified: Boolean(email),
  firstName: firstName ?? null,
  lastName: lastName ?? null,
});

/**
 * Facebook Login for portals' customers: the portal's screen gets an access token from the
 * Facebook SDK (or, on iOS with Limited Login, an ID token), and core asks Facebook whose it is
 * and that it is for this app.
 */
export const facebookLogin = defineIntegration({
  key: 'facebook-login',
  name: 'Facebook Login',
  summary: 'Customers sign in to your portals with their Facebook account.',
  category: 'sign_in',
  countries: [],
  permission: 'integrations.manage',
  dashboard: 'https://developers.facebook.com/apps',
  keys,
  client: (config, options) => ({
    config,
    options,
    send: gatewayHttp('Facebook', 'https://graph.facebook.com/v21.0', options),
    appToken: `${config.appId}|${config.appSecret}`,
  }),
  verify: async ({ config, send, appToken }) => {
    await send(`/${config.appId}?fields=id&access_token=${encodeURIComponent(appToken)}`);
  },
  socialSignIn: {
    provider: 'facebook',
    publicId: ({ config }) => config.appId,
    identify: async ({ config, options, send, appToken }, { token, nonce }) => {
      // Limited Login (iOS) gives a signed ID token instead of an access token.
      if (token.split('.').length === 3) {
        const claims = LimitedClaims.parse(
          await verifyIdToken(
            token,
            {
              service: 'Facebook',
              jwksUrl: 'https://limited.facebook.com/.well-known/oauth/openid/jwks/',
              issuers: ['https://www.facebook.com', 'https://limited.facebook.com'],
              audiences: [config.appId],
              ...(nonce && { nonce }),
            },
            options,
          ),
        );

        return identityOf(claims.sub, claims.email, claims.given_name, claims.family_name);
      }

      const debugged = await send(
        `/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(appToken)}`,
      ).then(
        (text) => parse('Facebook', Debugged, text, 'an unreadable token check').data,
        () => null,
      );

      if (!debugged?.is_valid || debugged.app_id !== config.appId || !debugged.user_id) {
        throw new SocialTokenError(
          "Facebook didn't vouch for this token, or it is for another app",
        );
      }

      const me = parse(
        'Facebook',
        Me,
        await send(
          `/me?fields=id,email,first_name,last_name&access_token=${encodeURIComponent(token)}`,
        ),
        'no profile',
      );

      if (me.id !== debugged.user_id) {
        throw new SocialTokenError('The Facebook token is for someone else');
      }

      return identityOf(me.id, me.email, me.first_name, me.last_name);
    },
  },
});
