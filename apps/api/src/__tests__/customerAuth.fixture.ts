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

/** The test plugin's websites: two of Acme's stores and Globex's one. */
type Site = 'acme' | 'outlet' | 'globex';

/** Where a website's pages run. */
export const siteOrigin = (site: Site = 'acme') => `https://${site}.shop.example.com`;

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
 * Acme and Globex (`useTwoOrgs`), where the test plugin `hr` keeps websites
 * (Acme's shop and outlet, Globex's shop), and a website as a browser would call core.
 */
export const useCustomers = () => {
  const t = useTwoOrgs();
  const sites: Record<Site, string> = { acme: '', outlet: '', globex: '' };

  /**
   * A website in one browser: its own network address (rate limits are per
   * address), its page's origin (`null`: a mobile app sends none) and, once
   * signed in, the customer's access token.
   */
  const app = (options: { site?: Site; origin?: string | null; token?: string } = {}) => {
    const site = options.site ?? 'acme';
    const ip = `10.0.0.${++ipCount}`;
    const origin = options.origin === undefined ? siteOrigin(site) : options.origin;

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

    /** Signs in to the website's account of the address, with a code sent to it. */
    const signIn = async (value: string, kind: 'email' | 'phone' = 'email') => {
      await api.customerAuth.sendCode({ website: sites[site], kind, value });

      return api.customerAuth.signIn({
        website: sites[site],
        kind,
        value,
        code: await lastCode(value),
      });
    };

    /** Signs up on the website (an address with an account there signs in) and confirms the code. */
    const join = async (
      value: string,
      kind: 'email' | 'phone' = 'email',
      form: { firstName?: string; customFields?: Record<string, string> } = {},
    ) => {
      await api.customerAuth.signUp({
        website: sites[site],
        kind,
        value,
        firstName: form.firstName ?? 'Test',
        ...(form.customFields && { customFields: form.customFields }),
      });

      return api.customerAuth.confirmSignUp({
        website: sites[site],
        kind,
        value,
        code: await lastCode(value),
      });
    };

    return { api, signIn, join };
  };

  /** Signs up on (or in to) a website; `me` is its `/customer/*` client. */
  const signedIn = async (value: string, site: Site = 'acme') => {
    const result = await app({ site }).join(value);

    return { ...result, me: app({ site, token: result.accessToken }).api };
  };

  beforeAll(async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'Shop',
      version: '1',
      scopes: ['websites:write', 'notifications:write'],
    });

    const save = (org: string, recordId: string, site: Site) =>
      t
        .hr(org)
        .websites.save({ recordId, name: `${site} shop`, origins: [siteOrigin(site)] })
        .then((website) => website.id);

    sites.acme = await save(t.ids.org, 'store-1', 'acme');
    sites.outlet = await save(t.ids.org, 'store-2', 'outlet');
    sites.globex = await save(t.ids.otherOrg, 'store-1', 'globex');
  });

  return { ...t, sites, app, signedIn };
};
