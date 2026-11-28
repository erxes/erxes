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

/** The test plugin's portals: two of Acme's stores and Globex's one. */
type Site = 'acme' | 'outlet' | 'globex';

/** Where a portal's pages run. */
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
 * Acme and Globex (`useTwoOrgs`), where the test plugin `hr` keeps portals
 * (Acme's shop and outlet, Globex's shop), and a portal as a browser would call core.
 */
export const useCustomers = () => {
  const t = useTwoOrgs();
  const sites: Record<Site, string> = { acme: '', outlet: '', globex: '' };
  /** Each portal's publishable key, as its apps ship it. */
  const keys: Record<Site, string> = { acme: '', outlet: '', globex: '' };
  const portalTokens = new Map<string, Promise<string>>();

  /** A client from one network address and page (`null`: a mobile app), with these headers. */
  const clientAt = (
    ip: string,
    origin: string | null,
    headers: () => Promise<Record<string, string>> | Record<string, string> = () => ({}),
  ): CoreClient =>
    createORPCClient(
      new OpenAPILink(coreContract, {
        url: () => t.url(CORE_API_PREFIX),
        headers: async () => ({
          'x-forwarded-for': ip,
          ...(origin ? { origin } : {}),
          ...(await headers()),
        }),
      }),
    );

  /** A portal key traded for a token from `origin`, as an app does every 15 minutes. */
  const tradeKey = (key: string, origin: string | null) =>
    clientAt(`10.1.0.${++ipCount}`, origin)
      .portalAuth.token({ key })
      .then((answer) => answer.accessToken);

  /** The site's portal token for apps at `origin`, traded once. */
  const portalTokenOf = (site: Site, origin: string | null) => {
    const cacheKey = `${site} ${origin}`;
    const known = portalTokens.get(cacheKey);

    if (known) return known;

    const traded = tradeKey(keys[site], origin);

    portalTokens.set(cacheKey, traded);

    return traded;
  };

  /**
   * A portal in one browser: its own network address (rate limits are per
   * address), its page's origin (`null`: a mobile app sends none), the portal's
   * token (`portalToken: null` sends none) and, once signed in, the customer's access token.
   */
  const app = (
    options: {
      site?: Site;
      origin?: string | null;
      token?: string;
      portalToken?: string | null;
    } = {},
  ) => {
    const site = options.site ?? 'acme';
    const ip = `10.0.0.${++ipCount}`;
    const origin = options.origin === undefined ? siteOrigin(site) : options.origin;

    const portalToken = () =>
      options.portalToken === undefined ? portalTokenOf(site, origin) : options.portalToken;

    const api = clientAt(ip, origin, async () => {
      const token = await portalToken();

      return {
        ...(token ? { 'x-portal-token': token } : {}),
        ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      };
    });

    /** Signs in to the portal's account of the address, with a code sent to it. */
    const signIn = async (value: string, kind: 'email' | 'phone' = 'email') => {
      await api.customerAuth.sendCode({ kind, value });

      return api.customerAuth.signIn({
        kind,
        value,
        code: await lastCode(value),
      });
    };

    /** Signs up on the portal (an address with an account there signs in) and confirms the code. */
    const join = async (
      value: string,
      kind: 'email' | 'phone' = 'email',
      form: { firstName?: string; customFields?: Record<string, string> } = {},
    ) => {
      await api.customerAuth.signUp({
        kind,
        value,
        firstName: form.firstName ?? 'Test',
        ...(form.customFields && { customFields: form.customFields }),
      });

      return api.customerAuth.confirmSignUp({
        kind,
        value,
        code: await lastCode(value),
      });
    };

    return { api, signIn, join };
  };

  /** Signs up on (or in to) a portal; `me` is its `/portal/me` client. */
  const signedIn = async (value: string, site: Site = 'acme') => {
    const result = await app({ site }).join(value);

    return { ...result, me: app({ site, token: result.accessToken }).api };
  };

  beforeAll(async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'Shop',
      version: '1',
      scopes: ['portals:write', 'notifications:write'],
    });

    const save = (org: string, recordId: string, site: Site) =>
      t
        .hr(org)
        .portals.save({ recordId, name: `${site} shop`, origins: [siteOrigin(site)] })
        .then((portal) => portal.id);

    sites.acme = await save(t.ids.org, 'store-1', 'acme');
    sites.outlet = await save(t.ids.org, 'store-2', 'outlet');
    sites.globex = await save(t.ids.otherOrg, 'store-1', 'globex');

    const keyOf = (client: CoreClient, site: Site) =>
      client.portals
        .createKey({ id: sites[site], name: `${site} app`, kind: 'publishable' })
        .then((made) => made.secret);

    keys.acme = await keyOf(t.owner(), 'acme');
    keys.outlet = await keyOf(t.owner(), 'outlet');
    keys.globex = await keyOf(t.other(), 'globex');
  });

  return { ...t, sites, keys, app, signedIn, tradeKey };
};
