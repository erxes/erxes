import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { hmacSha256 } from '~/lib/crypto';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { settle } from './settle';

const GRAPH = 'https://graph.facebook.com/v23.0';

const APP_ID = '1234567890';

const APP_SECRET = 'fb-app-secret';

const PAGE = '111';

const AppSubscription = z.object({
  object: z.string(),
  callback_url: z.string(),
  verify_token: z.string(),
  fields: z.string(),
});

const PageSubscription = z.object({ subscribed_fields: z.string() });

const lead = {
  id: 'L1',
  created_time: '2026-11-22T10:00:00+0000',
  form_id: 'F1',
  ad_id: 'A1',
  field_data: [
    { name: 'email', values: ['dana@acme.mn'] },
    { name: 'full_name', values: ['Dana Bat'] },
  ],
};

const entry = (page: string, changes: unknown[]) =>
  JSON.stringify({ object: 'page', entry: [{ id: page, time: 1_763_800_000, changes }] });

const leadgen = (page: string) =>
  entry(page, [
    {
      field: 'leadgen',
      value: { leadgen_id: 'L1', form_id: 'F1', ad_id: 'A1', page_id: page, created_time: 1 },
    },
  ]);

const comment = (id: string, from: string) =>
  entry(PAGE, [
    {
      field: 'feed',
      value: {
        item: 'comment',
        verb: 'add',
        comment_id: id,
        post_id: `${PAGE}_9`,
        message: 'How much is it?',
        from: { id: from, name: 'Someone' },
        created_time: 1_763_800_000,
      },
    },
  ]);

const matches = (path: string, value: string) => ({
  id: 'check',
  type: 'branch' as const,
  conditions: { match: 'all' as const, rules: [{ path, op: 'eq' as const, value }] },
  then: [{ id: 'wait', type: 'delay' as const, amount: 1, unit: 'days' as const }],
  else: [],
});

describe('Facebook Pages triggers', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  const facebook = fakeGateway([
    [`POST ${GRAPH}/oauth/access_token`, { access_token: 'short-token', expires_in: 5000 }],
    [`GET ${GRAPH}/me?fields=name`, { name: 'Dana Bat' }],
    [`GET ${GRAPH}/${PAGE}?fields=access_token`, { id: PAGE, access_token: 'page-token' }],
    [`POST ${GRAPH}/${APP_ID}/subscriptions`, { success: true }],
    [`POST ${GRAPH}/${PAGE}/subscribed_apps`, { success: true }],
    [`DELETE ${GRAPH}/${PAGE}/subscribed_apps`, { success: true }],
    [`GET ${GRAPH}/L1?fields=`, lead],
  ]);

  const lasting = fakeGateway([
    [`POST ${GRAPH}/oauth/access_token`, { access_token: 'long-token', expires_in: 5_184_000 }],
  ]);

  const calls = (method: string, path: string) =>
    facebook.calls.filter(
      (call) => call.method === method && call.url.startsWith(`${GRAPH}${path}`),
    );

  const appSubscription = () =>
    AppSubscription.parse(
      JSON.parse(calls('POST', `/${APP_ID}/subscriptions`).at(-1)?.body ?? '{}'),
    );

  const pageFields = () =>
    PageSubscription.parse(
      JSON.parse(calls('POST', `/${PAGE}/subscribed_apps`).at(-1)?.body ?? '{}'),
    ).subscribed_fields;

  const hookPath = () => new URL(appSubscription().callback_url).pathname;

  const handshake = (token: string) =>
    fetch(
      t.url(
        `${hookPath()}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(token)}&hub.challenge=ch-42`,
      ),
    );

  const deliver = (raw: string, secret = APP_SECRET) =>
    fetch(t.url(hookPath()), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': `sha256=${hmacSha256(secret, raw, 'hex')}`,
      },
      body: raw,
    });

  beforeAll(async () => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
      const url = urlOf(input);

      if (typeof init?.body === 'string' && init.body.includes('fb_exchange_token'))
        return lasting.fetch(input, init);

      return url.startsWith('https://graph.facebook.com/') ||
        url.startsWith('https://www.facebook.com/')
        ? facebook.fetch(input, init)
        : realFetch(input, init);
    });

    await t.owner().integrations.setOAuthApp({
      key: 'facebook',
      clientId: APP_ID,
      clientSecret: APP_SECRET,
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  let connectionId = '';
  let leadsId = '';
  let commentsId = '';

  it('signs in with the organisation’s own Facebook app and keeps a long-lived token', async () => {
    const { url } = await t.owner().integrations.authorize({ key: 'facebook', name: 'Shop' });
    const authorize = new URL(url);

    expect(authorize.origin + authorize.pathname).toBe(
      'https://www.facebook.com/v23.0/dialog/oauth',
    );
    expect(authorize.searchParams.get('client_id')).toBe(APP_ID);
    expect(authorize.searchParams.get('scope')?.split(',')).toEqual(
      expect.arrayContaining(['pages_manage_metadata', 'leads_retrieval', 'pages_messaging']),
    );

    const back = await fetch(
      t.url(
        `/core/v1/integrations/oauth/callback?code=fb-code&state=${authorize.searchParams.get('state') ?? ''}`,
      ),
      { redirect: 'manual' },
    );

    expect(back.status).toBe(302);
    connectionId =
      new URL(back.headers.get('location') ?? '', 'http://x').searchParams.get('connected') ?? '';

    const exchange = new URLSearchParams(lasting.calls[0]?.body);

    expect(exchange.get('grant_type')).toBe('fb_exchange_token');
    expect(exchange.get('fb_exchange_token')).toBe('short-token');
    expect(exchange.get('client_secret')).toBe(APP_SECRET);
    expect(calls('GET', '/me?fields=name').at(-1)?.auth).toBe('Bearer long-token');

    const { data } = await t.owner().integrations.connections({ key: 'facebook' });

    expect(data.map((row) => [row.id, row.settings.account])).toEqual([[connectionId, 'Dana Bat']]);
    expect(JSON.stringify(data)).not.toMatch(/long-token|short-token/);
  });

  it('a "Lead form filled" automation subscribes the app and the page to leadgen', async () => {
    leadsId = await t.active('Welcome leads', {
      trigger: {
        kind: 'app',
        app: 'facebook',
        trigger: 'lead_form_filled',
        connectionId,
        params: { page: PAGE },
      },
      steps: [matches('event.payload.email', 'dana@acme.mn')],
    });

    await settle();

    const app = appSubscription();

    expect(calls('POST', `/${APP_ID}/subscriptions`).at(-1)?.auth).toBe(
      `Bearer ${APP_ID}|${APP_SECRET}`,
    );
    expect(app.object).toBe('page');
    expect(app.callback_url).toContain('/core/v1/integrations/apps/facebook/hook/');
    expect(app.verify_token.length).toBeGreaterThan(20);
    expect(app.fields).toBe('leadgen');
    expect(calls('GET', `/${PAGE}?fields=access_token`).at(-1)?.auth).toBe('Bearer long-token');
    expect(calls('POST', `/${PAGE}/subscribed_apps`).at(-1)?.auth).toBe('Bearer page-token');
    expect(pageFields()).toBe('leadgen');
  });

  it('answers Facebook’s handshake with the challenge only for the right verify token', async () => {
    const right = await handshake(appSubscription().verify_token);

    expect(right.status).toBe(200);
    expect(await right.text()).toBe('ch-42');
    expect((await handshake('guessed')).status).toBe(403);
  });

  it('a signed lead fetches its answers and starts one run with the email; a forged one starts none', async () => {
    expect((await deliver(leadgen(PAGE), 'not-the-secret')).status).toBe(403);

    await settle();

    expect(calls('GET', '/L1?fields=')).toHaveLength(0);
    expect(await t.runsOf(leadsId)).toHaveLength(0);

    expect((await deliver(leadgen(PAGE))).status).toBe(200);
    expect((await deliver(leadgen(PAGE))).status).toBe(200);

    await settle();

    expect(calls('GET', '/L1?fields=').at(-1)?.auth).toBe('Bearer page-token');

    const runs = await t.runsOf(leadsId);

    expect(runs).toHaveLength(1);

    const { steps } = await t.owner().automations.run({ runId: runs[0]?.id ?? '' });

    expect(steps.find((step) => step.stepId === 'check')?.output).toEqual({ matched: true });
  });

  it('a second automation on "Comment on a post" widens the page’s fields; the page’s own comment starts none', async () => {
    commentsId = await t.active('Answer comments', {
      trigger: {
        kind: 'app',
        app: 'facebook',
        trigger: 'comment_added',
        connectionId,
        params: { page: PAGE },
      },
      steps: [matches('event.payload.commentId', 'C1')],
    });

    await settle();

    expect(pageFields()).toBe('feed,leadgen');
    expect(appSubscription().fields).toBe('feed,leadgen');

    expect((await deliver(comment('C1', '555'))).status).toBe(200);
    expect((await deliver(comment('C2', PAGE))).status).toBe(200);

    await settle();

    expect(await t.runsOf(commentsId)).toHaveLength(1);
    expect(await t.runsOf(leadsId)).toHaveLength(1);
  });

  it('ignores an entry for a page no automation listens to', async () => {
    const before = facebook.calls.length;
    const answer = await deliver(leadgen('999'));

    expect(answer.status).toBe(200);
    expect(await answer.json()).toEqual({ ok: true, published: 0 });

    await settle();

    expect(facebook.calls.slice(before)).toEqual([]);
    expect(await t.runsOf(leadsId)).toHaveLength(1);
  });

  it('pausing one automation narrows the page’s fields; pausing the last removes the page subscription', async () => {
    await t.owner().automations.pause({ id: leadsId });
    await settle();

    expect(pageFields()).toBe('feed');
    expect(calls('DELETE', `/${PAGE}/subscribed_apps`)).toHaveLength(0);

    await t.owner().automations.pause({ id: commentsId });
    await settle();

    expect(calls('DELETE', `/${PAGE}/subscribed_apps`)).toHaveLength(1);
    expect(calls('DELETE', `/${PAGE}/subscribed_apps`)[0]?.auth).toBe('Bearer page-token');
    expect((await t.owner().integrations.subscriptions({ key: 'facebook' })).data).toEqual([]);
  });
});
