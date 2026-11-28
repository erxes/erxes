import { z } from 'zod';
import { defineIntegration, field, isTrue, verifyIdToken } from '@erxes/plugin-sdk/integrations';

const ClientId = z
  .string()
  .trim()
  .max(200)
  .regex(
    /^[\w-]+\.apps\.googleusercontent\.com$/,
    'a client id ending in .apps.googleusercontent.com',
  );

const keys = z.object({
  webClientId: field('Web client ID', ClientId),
  iosClientId: field('iOS client ID', ClientId).optional(),
  androidClientId: field('Android client ID', ClientId).optional(),
});

const Claims = z.object({
  sub: z.string().min(1),
  email: z.string().optional(),
  email_verified: z.unknown(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
});

/**
 * Sign in with Google for portals' customers: the portal's screen gets an ID token from Google
 * Identity Services (web) or Google Sign-In (iOS, Android), and core checks it against these
 * client ids from the Google Cloud console.
 */
export const googleSignIn = defineIntegration({
  key: 'google-sign-in',
  name: 'Sign in with Google',
  summary: 'Customers sign in to your portals with their Google account.',
  category: 'sign_in',
  countries: [],
  permission: 'integrations.manage',
  dashboard: 'https://console.cloud.google.com/apis/credentials',
  keys,
  client: (config, options) => ({ config, options }),
  // Client ids are public and checked by their shape; Google has no call that confirms one.
  verify: async () => undefined,
  socialSignIn: {
    provider: 'google',
    publicId: ({ config }) => config.webClientId,
    identify: async ({ config, options }, { token, nonce }) => {
      const payload = await verifyIdToken(
        token,
        {
          service: 'Google',
          jwksUrl: 'https://www.googleapis.com/oauth2/v3/certs',
          issuers: ['https://accounts.google.com', 'accounts.google.com'],
          audiences: [config.webClientId, config.iosClientId, config.androidClientId].flatMap(
            (id) => (id ? [id] : []),
          ),
          ...(nonce && { nonce }),
        },
        options,
      );

      const claims = Claims.parse(payload);

      return {
        subject: claims.sub,
        email: claims.email?.toLowerCase() ?? null,
        emailVerified: isTrue(claims.email_verified),
        firstName: claims.given_name ?? null,
        lastName: claims.family_name ?? null,
      };
    },
  },
});
