import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { config } from '~/config';
import { SESSION_COOKIE } from '~/http/cookies';
import { chat, resultsOf, userMessage } from './assistantChat';
import { useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { connectProvider, fakeModel, lastToolResult, type Script } from './fakeModel';
import { type CoreClient, useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0011';

const GITHUB = 'https://api.github.com';

const INSTALLATION = 5501;

const APP_TOKEN = 'ghs_installation_org';

const MEMBER_TOKEN = 'ghp_member_own';

const ISSUE = {
  number: 7,
  html_url: 'https://github.com/acme/shop/issues/7',
  state: 'open',
  title: 'Restock',
  labels: [],
  comments: 0,
  created_at: '2026-11-26T00:00:00Z',
};

const CREATE = {
  procedure: 'github.create_issue',
  input: { owner: 'acme', repository: 'shop', title: 'Restock' },
};

const callThen =
  (call: Record<string, unknown>): Script =>
  (request) =>
    lastToolResult(request) === null ? { tool: 'callApi', input: call } : { text: 'Done.' };

describe('The assistant runs connected apps’ actions', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;

  const github = fakeGateway([
    ['POST https://github.com/login/oauth/access_token', { access_token: 'ghu_owner' }],
    [
      `GET ${GITHUB}/user/installations`,
      { installations: [{ id: INSTALLATION, account: { login: 'acme', avatar_url: null } }] },
    ],
    [
      `POST ${GITHUB}/app/installations/${INSTALLATION}/access_tokens`,
      { token: APP_TOKEN, expires_at: '2099-01-01T00:00:00Z' },
    ],
    [`POST ${GITHUB}/repos/acme/shop/issues`, ISSUE, 201],
    [`GET ${GITHUB}/user`, { login: 'dana' }],
  ]);

  const issueAuth = () =>
    github.calls
      .filter((call) => call.method === 'POST' && call.url.endsWith('/repos/acme/shop/issues'))
      .map((call) => call.auth);

  const ask = (api: CoreClient, script: Script) => {
    model.script(script);

    return chat(api, { message: userMessage('Open a Restock issue'), model: 'kimi-k3' });
  };

  const connectOrg = async () => {
    const { url } = await t.owner().githubApp.signIn();
    const state = new URL(url).searchParams.get('state') ?? '';

    const back = await fetch(
      t.url(`/core/v1/integrations/github/app/callback?code=gh-code&state=${state}`),
      { redirect: 'manual', headers: { cookie: `${SESSION_COOKIE}=${await t.token()}` } },
    );

    const ticket =
      new URL(back.headers.get('location') ?? '', 'http://x').searchParams.get('github') ?? '';

    await t.owner().githubApp.connect({ ticket, installationId: INSTALLATION });
  };

  beforeAll(async () => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
      const url = urlOf(input);

      return url.startsWith(`${GITHUB}/`) || url.startsWith('https://github.com/')
        ? github.fetch(input, init)
        : realFetch(input, init);
    });

    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
    await connectProvider(t.owner(), KEY);
    await connectOrg();
    await t.member().integrations.connect({
      key: 'github',
      name: 'mine',
      scope: 'personal',
      keys: { accessToken: MEMBER_TOKEN },
    });
  });

  afterAll(async () => {
    vi.unstubAllGlobals();
    await model.close();
  });

  it('finds an app’s action, with the connections the member may pick', async () => {
    await ask(t.member(), (request) =>
      lastToolResult(request) === null
        ? { tool: 'searchApi', input: { query: 'github create issue' } }
        : { text: 'Found.' },
    );

    expect(model.lastToolResult()).toContain('"procedure":"github.create_issue"');
    expect(model.lastToolResult()).toContain('(mine)');
  });

  it('opens the issue on the member’s own GitHub', async () => {
    const { view } = await ask(t.member(), callThen(CREATE));

    expect(resultsOf(view, 'callApi')).toEqual([
      expect.objectContaining({ ok: true, changed: true }),
    ]);
    expect(model.lastToolResult()).toContain('https://github.com/acme/shop/issues/7');
    expect(issueAuth().at(-1)).toBe(`Bearer ${MEMBER_TOKEN}`);
  });

  it('opens it on the organisation’s GitHub for an owner with no own connection', async () => {
    await ask(t.owner(), callThen(CREATE));

    expect(issueAuth().at(-1)).toBe(`Bearer ${APP_TOKEN}`);
  });

  it('keeps an app the member has no connection to out of reach', async () => {
    await ask(
      t.member(),
      callThen({ procedure: 'telegram.send_message', input: { chatId: '1', text: 'hi' } }),
    );

    expect(model.lastToolResult()).toContain('UNKNOWN_PROCEDURE');
  });
});
