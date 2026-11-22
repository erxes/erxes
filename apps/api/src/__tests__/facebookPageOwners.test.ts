import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { config } from '~/config';
import { SESSION_COOKIE } from '~/http/cookies';
import { hmacSha256 } from '~/lib/crypto';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import {
  APP_ID,
  APP_SECRET,
  AppSubscription,
  comment,
  GRAPH,
  matches,
  PAGE,
  settleRetries,
} from './facebook.fixture';
import { urlOf } from './fakeGateway';
import { settle } from './settle';

const ADMIN_TOKEN = 'Bearer long-short-acme';

const reply = (method: string, url: string, auth: string | null, body: string) => {
  const form = new URLSearchParams(body);
  const lasting = form.get('fb_exchange_token');

  if (url.startsWith(`${GRAPH}/oauth/access_token`))
    return {
      access_token: lasting ? `long-${lasting}` : `short-${form.get('code') ?? ''}`,
      expires_in: 5_184_000,
    };

  if (url.startsWith(`${GRAPH}/me?fields=name`)) return { name: 'Dana Bat' };

  if (url.startsWith(`${GRAPH}/${PAGE}?fields=access_token`))
    return auth === ADMIN_TOKEN ? { id: PAGE, access_token: 'page-token' } : { id: PAGE };

  if (method === 'POST' && url === `${GRAPH}/${APP_ID}/subscriptions`) return { success: true };

  if (url === `${GRAPH}/${PAGE}/subscribed_apps`) return { success: true };

  return null;
};

const comments = (connectionId: string) => ({
  trigger: {
    kind: 'app' as const,
    app: 'facebook',
    trigger: 'comment_added',
    connectionId,
    params: { page: PAGE },
  },
  steps: [matches('event.payload.commentId', 'C1')],
});

describe(
  'Facebook Pages on the server’s app, one page in two organisations',
  { timeout: 300_000 },
  () => {
    useTestDatabase();

    const t = useAutomations();

    const sent: { method: string; url: string; auth: string | null; body: string }[] = [];

    const pageCalls = (method: string) =>
      sent.filter(
        (call) => call.method === method && call.url === `${GRAPH}/${PAGE}/subscribed_apps`,
      );

    const hookPath = () => {
      const app = sent.findLast((call) => call.url === `${GRAPH}/${APP_ID}/subscriptions`);

      return new URL(AppSubscription.parse(JSON.parse(app?.body ?? '{}')).callback_url).pathname;
    };

    const deliver = (raw: string) =>
      fetch(t.url(hookPath()), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-hub-signature-256': `sha256=${hmacSha256(APP_SECRET, raw, 'hex')}`,
        },
        body: raw,
      });

    const signIn = async (code: string, user: string, org: string) => {
      const { url } = await t.client({ user, org }).integrations.authorize({
        key: 'facebook',
        name: code,
      });

      const state = new URL(url).searchParams.get('state') ?? '';

      const back = await fetch(
        t.url(`/core/v1/integrations/oauth/callback?code=${code}&state=${state}`),
        {
          redirect: 'manual',
          headers: { cookie: `${SESSION_COOKIE}=${await t.token(user, org)}` },
        },
      );

      return (
        new URL(back.headers.get('location') ?? '', 'http://x').searchParams.get('connected') ?? ''
      );
    };

    beforeAll(() => {
      const realFetch = globalThis.fetch;

      config.integrations.oauthApps.facebook = { clientId: APP_ID, clientSecret: APP_SECRET };

      vi.stubGlobal('fetch', (input: string | URL | Request, init: RequestInit = {}) => {
        const url = urlOf(input);

        if (!url.startsWith('https://graph.facebook.com/')) return realFetch(input, init);

        const call = {
          method: init.method ?? 'GET',
          url,
          auth: new Headers(init.headers).get('authorization'),
          body: typeof init.body === 'string' ? init.body : '',
        };

        sent.push(call);

        const answer = reply(call.method, url, call.auth, call.body);

        return Promise.resolve(
          answer
            ? new Response(JSON.stringify(answer), { status: 200 })
            : new Response('{"error":{"message":"not found"}}', { status: 404 }),
        );
      });
    });

    afterAll(() => {
      vi.unstubAllGlobals();
      Reflect.deleteProperty(config.integrations.oauthApps, 'facebook');
    });

    it('a page reaches only the organisation whose account manages it, and its teardown is its own', async () => {
      const acme = await t.active(
        'Answer comments',
        comments(await signIn('acme', t.ids.owner, t.ids.org)),
      );

      await settle();

      const globex = t.other();

      const { id: borrowed } = await globex.automations.create({
        name: 'Borrowed page',
        definition: comments(await signIn('globex', t.ids.otherOwner, t.ids.otherOrg)),
      });

      await globex.automations.activate({ id: borrowed });
      await settle();
      await settleRetries();

      expect((await deliver(comment('C1', '555'))).status).toBe(200);

      await settle();

      expect(await t.runsOf(acme)).toHaveLength(1);
      expect((await globex.automations.runs({ id: borrowed, limit: 100 })).data).toEqual([]);

      await t.owner().automations.pause({ id: acme });
      await settle();

      expect(pageCalls('DELETE').map((call) => call.auth)).toEqual(['Bearer page-token']);
    });
  },
);
