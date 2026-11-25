import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { useTwoOrgs } from './support';

const GITHUB = 'https://api.github.com';

const ORG_TOKEN = 'ghp_org_bot';

const MEMBER_TOKEN = 'ghp_member_own';

describe('Personal and organisation-wide connections', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const github = fakeGateway([
    [`GET ${GITHUB}/user/repos`, [{ name: 'shop', owner: { login: 'acme' } }]],
    [`GET ${GITHUB}/user`, { login: 'someone' }],
  ]);

  const tokensUsed = () =>
    github.calls
      .filter((call) => call.url.startsWith(`${GITHUB}/user/repos`))
      .map((call) => call.auth);

  let orgId = '';
  let personalId = '';

  beforeAll(async () => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) =>
      urlOf(input).startsWith(`${GITHUB}/`) ? github.fetch(input, init) : realFetch(input, init),
    );

    orgId = (
      await t.owner().integrations.connect({
        key: 'github',
        name: 'Acme code',
        keys: { accessToken: ORG_TOKEN },
      })
    ).id;

    personalId = (
      await t.member().integrations.connect({
        key: 'github',
        name: 'Acme code',
        scope: 'personal',
        keys: { accessToken: MEMBER_TOKEN },
      })
    ).id;
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('keeps a personal connection to the member who added it', async () => {
    const mine = await t.member().integrations.connections({ key: 'github' });
    const owners = await t.owner().integrations.connections({ key: 'github' });

    expect(mine.data.map(({ id, ownerId }) => ({ id, ownerId }))).toEqual([
      { id: personalId, ownerId: t.ids.member },
    ]);
    expect(owners.data.map(({ id, ownerId }) => ({ id, ownerId }))).toEqual([
      { id: orgId, ownerId: null },
    ]);
  });

  it('runs the member’s calls on their own token and the owner’s on the organisation’s', async () => {
    await t.member().integrations.records({ key: 'github', recordType: 'owner' });
    await t.owner().integrations.records({ key: 'github', recordType: 'owner' });

    expect(tokensUsed().slice(-2)).toEqual([`Bearer ${MEMBER_TOKEN}`, `Bearer ${ORG_TOKEN}`]);
  });

  it('leaves another member’s personal connection out of reach, even for the owner', async () => {
    await expect(
      t.owner().integrations.update({ key: 'github', id: personalId, name: 'Taken over' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(
      t.owner().integrations.remove({ key: 'github', id: personalId }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('lets a member without the integration’s permission add only their own', async () => {
    await expect(
      t.member().integrations.connect({
        key: 'github',
        name: 'Shared',
        keys: { accessToken: MEMBER_TOKEN },
      }),
    ).rejects.toMatchObject({ code: 'NOT_ALLOWED' });
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
