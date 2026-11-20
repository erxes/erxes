import { describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { useTestDatabase } from './db';
import { INSTALL_APP, INSTALL_VERIFY_TOKEN, signed, useFakeGraph } from './fakeGraph';
import { settle } from './settle';
import { type CoreClient, useTwoOrgs } from './support';

const PAGE_A = '1001';
const PAGE_B = '2002';
const SHARED_PAGE = '3003';

const connection = (externalId: string, pageToken: string) => ({
  kind: 'facebook' as const,
  externalId,
  pageId: externalId,
  name: `Page ${externalId}`,
  pageToken,
  app: 'install' as const,
});

const messageTo = (pageId: string, sender: string, mid: string, text: string) =>
  JSON.stringify({
    object: 'page',
    entry: [
      {
        id: pageId,
        time: Date.now(),
        messaging: [
          {
            sender: { id: sender },
            recipient: { id: pageId },
            timestamp: Date.now(),
            message: { mid, text },
          },
        ],
      },
    ],
  });

const Text = z.object({ text: z.string() });

const receivedTexts = async (client: CoreClient) =>
  (await client.events.list({ type: 'core.messenger.message_received' })).data.map(
    (event) => Text.parse(event.payload).text,
  );

describe('meta', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const graph = useFakeGraph();

  const deliver = (raw: string, signature = signed(INSTALL_APP.appSecret, raw), path = '') =>
    fetch(t.url(`/core/v1/meta/webhook${path}`), {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-hub-signature-256': signature },
      body: raw,
    });

  const verify = (token: string, path = '') =>
    fetch(
      t.url(
        `/core/v1/meta/webhook${path}?${new URLSearchParams({
          'hub.mode': 'subscribe',
          'hub.verify_token': token,
          'hub.challenge': 'challenge-42',
        }).toString()}`,
      ),
    );

  const connectThroughPlugin = async (org: string, pages: ReturnType<typeof connection>[]) => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '2',
      scopes: ['meta:read', 'meta:write'],
    });
    await t.hr(org).meta.import({ connections: pages });

    return (await t.hr(org).meta.connections({})).data;
  };

  it("echoes Meta's address check for the right verify token only, at the install's and an organisation's own address", async () => {
    const install = await verify(INSTALL_VERIFY_TOKEN);

    expect(install.status).toBe(200);
    expect(await install.text()).toBe('challenge-42');
    expect((await verify('a-guess')).status).toBe(403);

    const own = await t.owner().meta.saveApp({
      appId: '7654321',
      appSecret: 'own-app-secret-0123456789',
      verifyToken: 'own-verify-token',
    });

    const ownPath = new URL(own.webhookUrl ?? '').pathname.replace('/core/v1/meta/webhook', '');

    expect(ownPath).toMatch(/^\/\w+$/);
    expect(await (await verify('own-verify-token', ownPath)).text()).toBe('challenge-42');
    expect((await verify(INSTALL_VERIFY_TOKEN, ownPath)).status).toBe(403);
    expect((await verify('own-verify-token', '/unknown')).status).toBe(403);

    await t.owner().meta.removeApp();
  });

  it('routes a delivery to the organisation that connected the page, and the shared page to the one that connected it last', async () => {
    await connectThroughPlugin(t.ids.org, [
      connection(PAGE_A, 'page-token-a'),
      connection(SHARED_PAGE, 'page-token-shared-acme'),
    ]);
    await connectThroughPlugin(t.ids.otherOrg, [
      connection(PAGE_B, 'page-token-b'),
      connection(SHARED_PAGE, 'page-token-shared-globex'),
    ]);

    expect((await deliver(messageTo(PAGE_A, 'psid-a', 'm_route_a', 'for acme'))).status).toBe(200);
    expect((await deliver(messageTo(PAGE_B, 'psid-b', 'm_route_b', 'for globex'))).status).toBe(
      200,
    );
    expect(
      (await deliver(messageTo(SHARED_PAGE, 'psid-s', 'm_route_s', 'for the last one'))).status,
    ).toBe(200);
    await settle();

    expect(await receivedTexts(t.owner())).toEqual(['for acme']);
    expect((await receivedTexts(t.other())).toSorted()).toEqual(['for globex', 'for the last one']);
  });

  it('refuses a delivery the app did not sign, and publishes nothing from it', async () => {
    const raw = messageTo(PAGE_A, 'psid-forger', 'm_forged', 'forged');

    expect((await deliver(raw, signed('another-secret', raw))).status).toBe(403);
    expect((await deliver(raw, '')).status).toBe(403);
    await settle();

    expect(await receivedTexts(t.owner())).not.toContain('forged');
  });

  it('refuses a login return whose state core did not sign, before asking Meta anything', async () => {
    const before = graph.fake.calls.length;

    const answer = await fetch(t.url('/core/v1/meta/callback?code=abc&state=forged.state.value'), {
      redirect: 'manual',
    });

    expect(answer.status).toBe(403);
    expect(graph.fake.calls.slice(before)).toEqual([]);
  });

  it("connects the pages and Instagram accounts a member grants in Meta's login", async () => {
    graph.fake.pages = [
      {
        id: '4004',
        name: 'Shop page',
        access_token: 'page-token-shop',
        instagram_business_account: { id: '5005', username: 'shop' },
      },
    ];

    const login = new URL((await t.owner().meta.loginUrl()).url);
    const state = login.searchParams.get('state') ?? '';

    const answer = await fetch(
      t.url(`/core/v1/meta/callback?${new URLSearchParams({ code: 'granted', state }).toString()}`),
      { redirect: 'manual' },
    );

    expect(answer.status).toBe(302);
    expect(answer.headers.get('location')).toContain('/settings/integrations/meta?connected=2');

    const [exchange] = graph.callsTo('oauth/access_token', 'GET');

    expect(exchange?.query).toMatchObject({
      client_id: INSTALL_APP.appId,
      code: 'granted',
      redirect_uri: login.searchParams.get('redirect_uri'),
    });
    expect(graph.callsTo('4004/subscribed_apps')).toHaveLength(1);
    expect((await t.owner().meta.connections({})).data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'facebook', externalId: '4004', name: 'Shop page' }),
        expect.objectContaining({ kind: 'instagram', externalId: '5005', name: '@shop' }),
      ]),
    );
    expect((await t.other().meta.connections({})).data.map((row) => row.externalId)).not.toContain(
      '4004',
    );
  });

  it("starts an automation from a Messenger message, whose reply goes out with that page's token", async () => {
    graph.fake.names.set('psid-new', 'Bat');

    const automation = await t.owner().automations.create({
      name: 'Messenger auto reply',
      definition: {
        trigger: { kind: 'event', event: 'core.messenger.message_received' },
        steps: [
          {
            id: 'reply',
            type: 'action',
            action: 'core.messenger.send_message',
            input: { text: 'Thanks for: {{event.payload.text}}' },
          },
        ],
      },
    });

    await t.owner().automations.activate({ id: automation.id });
    await deliver(messageTo(PAGE_A, 'psid-new', 'm_auto_1', 'price?'));
    await settle();

    const [reply] = graph.callsTo('me/messages');

    expect(reply).toMatchObject({
      auth: 'Bearer page-token-a',
      body: {
        recipient: { id: 'psid-new' },
        messaging_type: 'RESPONSE',
        message: { text: 'Thanks for: price?' },
      },
    });

    const [run] = (await t.owner().automations.runs({ id: automation.id })).data;

    expect(run?.status).toBe('succeeded');
    expect(run?.subjectName).toBe('Bat');
  });

  it('sends once per idempotency key, keeps Graph calls on the connection’s own node, and marks a refused token broken', async () => {
    const [page] = (await t.hr().meta.connections({ kind: 'facebook' })).data.filter(
      (row) => row.externalId === PAGE_A,
    );

    const connectionId = page?.id ?? '';

    const message = {
      kind: 'message' as const,
      connectionId,
      idempotencyKey: 'order-1-receipt',
      recipientId: 'psid-a',
      text: 'Your order shipped',
    };

    const first = await t.hr().meta.send(message);

    expect(await t.hr().meta.send(message)).toEqual(first);
    expect(
      graph
        .callsTo('me/messages')
        .filter((call) => JSON.stringify(call.body).includes('Your order shipped')),
    ).toHaveLength(1);

    await expect(
      t.hr().meta.graph({ connectionId, path: 'oauth/access_token' }),
    ).rejects.toMatchObject({ status: 403, code: 'GRAPH_PATH_NOT_ALLOWED' });
    await expect(
      t.hr(t.ids.otherOrg).meta.send({ ...message, idempotencyKey: 'cross-org' }),
    ).rejects.toMatchObject({ status: 404 });

    graph.fake.refuseTokens = true;

    await expect(
      t.hr().meta.send({ ...message, idempotencyKey: 'after-revoke' }),
    ).rejects.toMatchObject({ status: 400, code: 'META_REFUSED' });

    graph.fake.refuseTokens = false;

    const after = (await t.owner().meta.connections({})).data.find(
      (row) => row.id === connectionId,
    );

    expect(after).toMatchObject({
      status: 'broken',
      statusReason: 'Error validating access token',
    });
  });
});
