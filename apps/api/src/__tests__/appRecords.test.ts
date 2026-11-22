import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { SESSION_COOKIE } from '~/http/cookies';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { APP_ID, APP_SECRET, GRAPH, PAGE } from './facebook.fixture';
import { fakeGateway, urlOf } from './fakeGateway';

const OTHER_PAGE = '222';

const STRANGER_PAGE = '999';

const GITHUB = 'https://api.github.com';

/** What the builder's pickers list from the apps' own accounts, with the step's connection. */
describe('app records for the builder’s pickers', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  const facebook = fakeGateway([
    [`POST ${GRAPH}/oauth/access_token`, { access_token: 'user-token', expires_in: 5_184_000 }],
    [`GET ${GRAPH}/me?fields=name`, { name: 'Dana Bat' }],
    [
      `GET ${GRAPH}/me/accounts?fields=id,name`,
      {
        data: [
          { id: PAGE, name: 'Shop page' },
          { id: OTHER_PAGE, name: 'Blog page' },
        ],
      },
    ],
    [`GET ${GRAPH}/${PAGE}?fields=access_token`, { id: PAGE, access_token: 'page-token' }],
    [`GET ${GRAPH}/${STRANGER_PAGE}?fields=access_token`, { id: STRANGER_PAGE }],
    [
      `GET ${GRAPH}/${PAGE}/posts?fields=`,
      {
        data: [
          {
            id: `${PAGE}_1`,
            message: 'Big sale\ntoday only',
            created_time: '2026-11-22T10:00:00+0000',
          },
          { id: `${PAGE}_2`, story: 'Shop page updated its cover photo' },
          { id: `${PAGE}_3`, created_time: '2026-11-20T08:00:00+0000' },
        ],
      },
    ],
  ]);

  const github = fakeGateway([
    [
      `GET ${GITHUB}/user/repos`,
      [
        { name: 'shop', private: true, owner: { login: 'acme' } },
        { name: 'notes', owner: { login: 'dana' } },
        { name: 'site', owner: { login: 'acme' } },
      ],
    ],
    [`GET ${GITHUB}/user`, { login: 'dana' }],
    [
      `GET ${GITHUB}/repos/acme/shop/actions/workflows`,
      {
        workflows: [
          { name: 'Deploy', path: '.github/workflows/deploy.yml' },
          { name: 'Tests', path: '.github/workflows/test.yml' },
        ],
      },
    ],
  ]);

  const dana = { id: 'cus_2', name: 'Dana Bat', email: 'dana@acme.mn' };

  const stripe = fakeGateway([
    ['GET /balance', { object: 'balance' }],
    ['GET /customers/search', { data: [dana] }],
    ['GET /customers?', { data: [{ id: 'cus_1', email: 'bold@acme.mn' }, dana] }],
  ]);

  const callsTo = (gateway: typeof facebook, start: string) =>
    gateway.calls.filter((call) => call.url.startsWith(start));

  let githubId = '';

  beforeAll(async () => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
      const url = urlOf(input);

      if (url.startsWith('https://graph.facebook.com/')) return facebook.fetch(input, init);

      if (url.startsWith(`${GITHUB}/`)) return github.fetch(input, init);

      if (url.startsWith('https://api.stripe.com/')) return stripe.fetch(input, init);

      return realFetch(input, init);
    });

    await t.owner().integrations.setOAuthApp({
      key: 'facebook',
      clientId: APP_ID,
      clientSecret: APP_SECRET,
    });

    const { url } = await t.owner().integrations.authorize({ key: 'facebook', name: 'Shop' });
    const state = new URL(url).searchParams.get('state') ?? '';

    const back = await fetch(
      t.url(`/core/v1/integrations/oauth/callback?code=fb-code&state=${state}`),
      { redirect: 'manual', headers: { cookie: `${SESSION_COOKIE}=${await t.token()}` } },
    );

    if (back.status !== 302) throw new Error(`Facebook sign-in answered ${back.status}`);

    githubId = (
      await t.owner().integrations.connect({
        key: 'github',
        name: 'Acme code',
        keys: { accessToken: 'ghp_test_acme' },
      })
    ).id;

    await t.owner().integrations.connect({
      key: 'stripe',
      name: 'Shop',
      keys: { secretKey: 'sk_test_shop' },
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('lists the pages the signed-in Facebook account manages, by name, and finds one by name', async () => {
    const pages = await t.owner().integrations.records({ key: 'facebook', recordType: 'page' });

    expect(pages.data).toEqual([
      { value: PAGE, label: 'Shop page' },
      { value: OTHER_PAGE, label: 'Blog page' },
    ]);
    expect(callsTo(facebook, `${GRAPH}/me/accounts`).at(-1)?.auth).toBe('Bearer user-token');

    const found = await t
      .owner()
      .integrations.records({ key: 'facebook', recordType: 'page', search: 'BLOG' });

    expect(found.data).toEqual([{ value: OTHER_PAGE, label: 'Blog page' }]);
  });

  it('lists a page’s latest posts under it, read with the page’s own token', async () => {
    const posts = await t
      .owner()
      .integrations.records({ key: 'facebook', recordType: 'post', parents: [PAGE] });

    expect(posts.data).toEqual([
      { value: `${PAGE}_1`, label: 'Big sale today only' },
      { value: `${PAGE}_2`, label: 'Shop page updated its cover photo' },
      { value: `${PAGE}_3`, label: 'Post of 2026-11-20' },
    ]);
    expect(callsTo(facebook, `${GRAPH}/${PAGE}/posts`).at(-1)?.auth).toBe('Bearer page-token');
    expect(
      (await t.owner().integrations.records({ key: 'facebook', recordType: 'post' })).data,
    ).toEqual([]);
  });

  it('answers none for what Facebook has no list of, which steps take from the run', async () => {
    expect(
      (await t.owner().integrations.records({ key: 'facebook', recordType: 'person' })).data,
    ).toEqual([]);

    const { actions } = await t.owner().automations.catalog({});
    const send = actions.find((action) => action.type === 'facebook.send_message');

    expect(send?.fields.map(({ key, type, recordType }) => [key, type, recordType])).toEqual([
      ['connection', 'connection', undefined],
      ['page', 'plugin_record', 'page'],
      ['recipient', 'plugin_record', 'person'],
      ['text', 'longtext', undefined],
    ]);
  });

  it('gives Facebook’s own reason when it refuses, as the service says it', async () => {
    await expect(
      t
        .owner()
        .integrations.records({ key: 'facebook', recordType: 'post', parents: [STRANGER_PAGE] }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'GATEWAY_REFUSED',
      message: `The signed-in Facebook account can't manage page ${STRANGER_PAGE}: connect Facebook as one of its admins`,
    });
  });

  it('refuses a member who may not manage the app, and another organisation has nothing connected', async () => {
    await expect(
      t.member().integrations.records({ key: 'facebook', recordType: 'page' }),
    ).rejects.toMatchObject({ status: 403, code: 'NOT_ALLOWED' });

    await expect(
      t.other().integrations.records({ key: 'facebook', recordType: 'page' }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'NOT_CONNECTED',
      message: 'Facebook Pages is not connected: connect it in Settings › Integrations',
    });
  });

  const githubRecords = (recordType: string, parents?: string[]) =>
    t
      .owner()
      .integrations.records({ key: 'github', recordType, connection: githubId, parents })
      .then(({ data }) => data);

  const customers = (search?: string) =>
    t
      .owner()
      .integrations.records({ key: 'stripe', recordType: 'customer', search })
      .then(({ data }) => data);

  it('lists GitHub owners, an owner’s repositories, and a repository’s workflows by file', async () => {
    expect(await githubRecords('owner')).toEqual([
      { value: 'dana', label: 'dana' },
      { value: 'acme', label: 'acme' },
    ]);
    expect(await githubRecords('repository', ['acme'])).toEqual([
      { value: 'shop', label: 'shop (private)' },
      { value: 'site', label: 'site' },
    ]);
    expect(await githubRecords('workflow', ['shop', 'acme'])).toEqual([
      { value: 'deploy.yml', label: 'Deploy (deploy.yml)' },
      { value: 'test.yml', label: 'Tests (test.yml)' },
    ]);
    expect(callsTo(github, `${GITHUB}/repos/acme/shop`).at(-1)?.auth).toBe('Bearer ghp_test_acme');
  });

  it('lists the newest Stripe customers, and asks Stripe for the ones whose name or email holds what was typed', async () => {
    expect(await customers()).toEqual([
      { value: 'cus_1', label: 'bold@acme.mn' },
      { value: 'cus_2', label: 'Dana Bat · dana@acme.mn' },
    ]);
    expect(await customers('dana')).toEqual([{ value: 'cus_2', label: 'Dana Bat · dana@acme.mn' }]);

    const asked = new URL(stripe.calls.at(-1)?.url ?? '').searchParams.get('query');

    expect(asked).toBe('name~"dana" OR email~"dana"');
  });

  it('a connection of another app, or one that is gone, lists nothing and says why', async () => {
    await expect(
      t.owner().integrations.records({ key: 'facebook', recordType: 'page', connection: githubId }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'NOT_CONNECTED',
      message: 'That Facebook Pages connection is gone or turned off',
    });
  });

  it('the app triggers’ id settings are pickers of the app’s records', async () => {
    const { apps } = await t.owner().automations.catalog({});

    const paramsOf = (app: string, trigger: string) =>
      apps
        .find((item) => item.key === app)
        ?.triggers.find((item) => item.key === trigger)
        ?.params.map(({ key, recordType, dependsOn }) => ({ key, recordType, dependsOn }));

    expect(paramsOf('facebook', 'message_received')).toEqual([
      { key: 'page', recordType: 'page', dependsOn: undefined },
    ]);
    expect(apps.find((item) => item.key === 'facebook')?.records).toEqual(['page', 'post']);
    expect(paramsOf('github', 'issue_opened')).toEqual([
      { key: 'owner', recordType: 'owner', dependsOn: undefined },
      { key: 'repository', recordType: 'repository', dependsOn: 'owner' },
    ]);
  });
});
