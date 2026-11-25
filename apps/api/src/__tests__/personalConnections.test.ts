import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { SESSION_COOKIE } from '~/http/cookies';
import { useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { useTwoOrgs } from './support';

const GITHUB = 'https://api.github.com';

const INSTALLATION = 4401;

const STRANGERS_INSTALLATION = 9900;

const APP_TOKEN = 'ghs_installation_acme';

const MEMBER_TOKEN = 'ghp_member_own';

/** The organisation's GitHub through the server's GitHub App; a member's own through a PAT. */
describe('Personal and organisation-wide GitHub connections', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

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
    [
      `GET ${GITHUB}/installation/repositories`,
      { repositories: [{ name: 'shop', owner: { login: 'acme' } }] },
    ],
    [`GET ${GITHUB}/user/repos`, [{ name: 'notes', owner: { login: 'dana' } }]],
    [`GET ${GITHUB}/user`, { login: 'dana' }],
  ]);

  const authUsed = (path: string) =>
    github.calls.filter((call) => call.url.startsWith(`${GITHUB}${path}`)).map((call) => call.auth);

  /** Signs in to GitHub from Settings and comes back with the installations to pick from. */
  const signedIn = async () => {
    const { url } = await t.owner().githubApp.signIn();
    const state = new URL(url).searchParams.get('state') ?? '';

    const back = await fetch(
      t.url(`/core/v1/integrations/github/app/callback?code=gh-code&state=${state}`),
      { redirect: 'manual', headers: { cookie: `${SESSION_COOKIE}=${await t.token()}` } },
    );

    return new URL(back.headers.get('location') ?? '', 'http://x').searchParams.get('github') ?? '';
  };

  let orgId = '';
  let personalId = '';

  beforeAll(async () => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
      const url = urlOf(input);

      return url.startsWith(`${GITHUB}/`) || url.startsWith('https://github.com/')
        ? github.fetch(input, init)
        : realFetch(input, init);
    });

    orgId = (
      await t.owner().githubApp.connect({ ticket: await signedIn(), installationId: INSTALLATION })
    ).id;

    personalId = (
      await t.member().integrations.connect({
        key: 'github',
        name: 'acme',
        scope: 'personal',
        keys: { accessToken: MEMBER_TOKEN },
      })
    ).id;
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('connects the organisation to an installation the owner manages, named after its account', async () => {
    const owners = await t.owner().integrations.connections({ key: 'github' });

    expect(owners.data.map(({ id, name, ownerId }) => ({ id, name, ownerId }))).toEqual([
      { id: orgId, name: 'acme', ownerId: null },
    ]);
  });

  it('refuses an installation the GitHub sign-in did not list', async () => {
    await expect(
      t
        .owner()
        .githubApp.connect({ ticket: await signedIn(), installationId: STRANGERS_INSTALLATION }),
    ).rejects.toMatchObject({ code: 'NOT_ALLOWED' });
  });

  it('refuses a personal access token for the organisation’s GitHub', async () => {
    await expect(
      t.owner().integrations.connect({
        key: 'github',
        name: 'Shared token',
        keys: { accessToken: 'ghp_shared' },
      }),
    ).rejects.toMatchObject({ code: 'NOT_ALLOWED' });
  });

  it('runs the owner’s calls on the App’s token and the member’s on their own', async () => {
    const orgRepos = await t.owner().integrations.records({ key: 'github', recordType: 'owner' });
    const ownRepos = await t.member().integrations.records({ key: 'github', recordType: 'owner' });

    expect(orgRepos.data).toEqual([{ value: 'acme', label: 'acme' }]);
    expect(ownRepos.data).toEqual([{ value: 'dana', label: 'dana' }]);
    expect(authUsed('/installation/repositories')).toEqual([`Bearer ${APP_TOKEN}`]);
    expect(authUsed('/user/repos')).toEqual([`Bearer ${MEMBER_TOKEN}`]);
  });

  it('keeps a personal connection to the member who added it, out of the owner’s reach', async () => {
    const mine = await t.member().integrations.connections({ key: 'github' });

    expect(mine.data.map(({ id, ownerId }) => ({ id, ownerId }))).toEqual([
      { id: personalId, ownerId: t.ids.member },
    ]);
    await expect(
      t.owner().integrations.remove({ key: 'github', id: personalId }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('refuses a personal connection of an integration that serves the whole organisation only', async () => {
    await expect(
      t.owner().integrations.connect({
        key: 'stripe',
        name: 'Mine',
        scope: 'personal',
        keys: { secretKey: 'sk_test_mine' },
      }),
    ).rejects.toMatchObject({ code: 'NOT_ALLOWED' });
  });
});
