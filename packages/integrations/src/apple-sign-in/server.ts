import { z } from 'zod';
import { defineIntegration, field, isTrue, verifyIdToken } from '@erxes/plugin-sdk/integrations';

const keys = z.object({
  servicesId: field(
    'Services ID',
    z
      .string()
      .trim()
      .max(155)
      .regex(/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/, 'a Services ID: mn.acme.shop.signin'),
  ),
});

const Claims = z.object({
  sub: z.string().min(1),
  email: z.string().optional(),
  email_verified: z.unknown(),
});

/**
 * Sign in with Apple for portals' customers: the portal's web page (with this Services ID) or
 * iOS app (with its bundle id, from the portal's iOS apps) gets an ID token from Apple, and core
 * checks it. Apple sends the person's name to the app only the first time, so the app passes it.
 */
export const appleSignIn = defineIntegration({
  key: 'apple-sign-in',
  name: 'Sign in with Apple',
  summary: 'Customers sign in to your portals and iOS apps with their Apple Account.',
  category: 'sign_in',
  countries: [],
  permission: 'integrations.manage',
  dashboard: 'https://developer.apple.com/account/resources/identifiers/list/serviceId',
  keys,
  client: (config, options) => ({ config, options }),
  // A Services ID is public and checked by its shape; Apple has no call that confirms one.
  verify: async () => undefined,
  socialSignIn: {
    provider: 'apple',
    publicId: ({ config }) => config.servicesId,
    identify: async ({ config, options }, { token, nonce, audiences }) => {
      const payload = await verifyIdToken(
        token,
        {
          service: 'Apple',
          jwksUrl: 'https://appleid.apple.com/auth/keys',
          issuers: ['https://appleid.apple.com'],
          audiences: [config.servicesId, ...audiences],
          ...(nonce && { nonce }),
        },
        options,
      );

      const claims = Claims.parse(payload);

      return {
        subject: claims.sub,
        email: claims.email?.toLowerCase() ?? null,
        emailVerified: isTrue(claims.email_verified),
        firstName: null,
        lastName: null,
      };
    },
  },
});
