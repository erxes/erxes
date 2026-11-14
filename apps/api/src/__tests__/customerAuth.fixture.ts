import { CORE_API_PREFIX, coreContract } from '@erxes/core-contract';
import { customerCodes } from '@erxes/core-db';
import { createORPCClient } from '@orpc/client';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { sql } from 'drizzle-orm';
import { beforeAll } from 'vite-plus/test';
import { loggedEmails } from '~/modules/email/email';
import { loggedSms } from '~/modules/sms/sms';
import { adminDb } from './db';
import { settle } from './settle';
import { type CoreClient, useTwoOrgs } from './support';

/** Where the test plugin's customer app runs for an organisation. */
export const appOrigin = (subdomain = 'acme') => `https://${subdomain}.shop.example.com`;

let ipCount = 0;

/** Moves every code sent so far a minute back, so an address may get the next one at once. */
export const aMinuteLater = () =>
  adminDb()
    .update(customerCodes)
    .set({ createdAt: sql`${customerCodes.createdAt} - interval '1 minute'` });

/** The last code sent to an email address or phone (after the jobs ran). */
export const lastCode = async (to: string) => {
  await settle();

  const sent = [
    ...loggedEmails.map((email) => ({ to: email.to, text: email.subject })),
    ...loggedSms,
  ].findLast((message) => message.to === to);

  const code = sent?.text.match(/\b(\d{6})\b/)?.[1];

  if (!code) throw new Error(`no code was sent to ${to}`);

  return code;
};

/**
 * Acme and Globex (`useTwoOrgs`), where the test plugin `hr` has a customer
 * app (`customerApp` in its manifest), and the app as a browser would call core.
 */
export const useCustomers = () => {
  const t = useTwoOrgs();

  /**
   * The app in one browser: its own network address (rate limits are per
   * address), its page's origin (`null`: a mobile app sends none) and, once
   * signed in, the customer's access token.
   */
  const app = (options: { origin?: string | null; token?: string } = {}) => {
    const ip = `10.0.0.${++ipCount}`;
    const origin = options.origin === undefined ? appOrigin() : options.origin;

    const api: CoreClient = createORPCClient(
      new OpenAPILink(coreContract, {
        url: () => t.url(CORE_API_PREFIX),
        headers: () => ({
          'x-forwarded-for': ip,
          ...(origin ? { origin } : {}),
          ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
        }),
      }),
    );

    /** Signs in with a code sent to the address. */
    const signIn = async (value: string, kind: 'email' | 'phone' = 'email') => {
      await api.customerAuth.sendCode({ clientId: 'hr', kind, value });

      return api.customerAuth.signIn({ clientId: 'hr', kind, value, code: await lastCode(value) });
    };

    return { api, signIn };
  };

  /** Signs in at the organisation's app; `me` is its `/customer/*` client. */
  const signedIn = async (value: string, subdomain = 'acme') => {
    const result = await app({ origin: appOrigin(subdomain) }).signIn(value);

    return {
      ...result,
      me: app({ origin: appOrigin(subdomain), token: result.accessToken }).api,
    };
  };

  beforeAll(async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'Shop',
      version: '1',
      customerApp: { origins: ['https://{subdomain}.shop.example.com'] },
    });
  });

  return { ...t, app, signedIn };
};
