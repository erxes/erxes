import { CORE_API_PREFIX, coreContract } from '@erxes/core-contract';
import { createORPCClient } from '@orpc/client';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { createHash, randomBytes } from 'node:crypto';
import { beforeAll } from 'vite-plus/test';
import { z } from 'zod';
import { loggedEmails } from '~/modules/email/email';
import { loggedSms } from '~/modules/sms/sms';
import { settle } from './settle';
import { type CoreClient, useTwoOrgs } from './support';

export const REDIRECT = 'https://acme.shop.example.com/callback';

export const Tokens = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number(),
  refresh_token: z.string(),
});

export const pkce = () => {
  const verifier = randomBytes(32).toString('base64url');

  return { verifier, challenge: createHash('sha256').update(verifier).digest('base64url') };
};

let ipCount = 0;

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
 * Acme and Globex (`useTwoOrgs`), with a plugin app customers sign in to
 * (`customerApp` in its manifest), and helpers for browsers and the app.
 */
export const useCustomers = () => {
  const t = useTwoOrgs();

  /**
   * A browser on core's sign-in page: its own address (rate limits are per
   * address) and the `erxes_customer` cookie core sets.
   */
  const browser = () => {
    let cookie = '';
    const ip = `10.0.0.${++ipCount}`;
    const origin = t.url('');

    const api: CoreClient = createORPCClient(
      new OpenAPILink(coreContract, {
        url: () => t.url(CORE_API_PREFIX),
        headers: () => ({ origin, 'x-forwarded-for': ip, ...(cookie ? { cookie } : {}) }),
        fetch: async (request, init) => {
          const response = await fetch(request, init);

          const set = response.headers
            .getSetCookie()
            .find((value) => value.startsWith('erxes_customer='));

          if (set !== undefined) cookie = set.split(';')[0] ?? '';

          return response;
        },
      }),
    );

    /** Signs in with a code sent to the address, at `organization`. */
    const signIn = async (
      value: string,
      kind: 'email' | 'phone' = 'email',
      organization = 'acme',
    ) => {
      await api.customerAuth.sendCode({ organization, kind, value });

      return api.customerAuth.signIn({ organization, kind, value, code: await lastCode(value) });
    };

    return { api, ip, signIn, cookie: () => cookie };
  };

  /** GET /customer-oauth/authorize in a browser holding `cookie`, without following the redirect. */
  const authorize = async (
    challenge: string,
    cookie: string,
    extra: Record<string, string> = {},
  ) => {
    const url = new URL(t.url('/core/v1/customer-oauth/authorize'));

    for (const [key, value] of Object.entries({
      response_type: 'code',
      client_id: 'hr',
      redirect_uri: REDIRECT,
      state: 's-1',
      code_challenge: challenge,
      code_challenge_method: 'S256',
      ...extra,
    })) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url, { redirect: 'manual', headers: cookie ? { cookie } : {} });

    return {
      status: response.status,
      location: new URL(response.headers.get('location') ?? '', t.url('/')),
    };
  };

  const token = async (body: Record<string, string>) => {
    const response = await fetch(t.url('/core/v1/customer-oauth/token'), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: 'hr', ...body }),
    });

    return { status: response.status, body: await response.json() };
  };

  /** Signs the browser's customer in to the app: a code, then tokens. */
  const appTokens = async (cookie: string) => {
    const { verifier, challenge } = pkce();
    const { location } = await authorize(challenge, cookie);

    const answer = await token({
      grant_type: 'authorization_code',
      code: location.searchParams.get('code') ?? '',
      redirect_uri: REDIRECT,
      code_verifier: verifier,
    });

    return Tokens.parse(answer.body);
  };

  beforeAll(async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'Shop',
      version: '1',
      customerApp: { redirectUris: ['https://{subdomain}.shop.example.com/callback'] },
    });
  });

  const refresh = (refreshToken: string) =>
    token({ grant_type: 'refresh_token', refresh_token: refreshToken });

  return { ...t, browser, authorize, token, appTokens, refresh };
};
