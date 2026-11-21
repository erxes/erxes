import { INTEGRATION_ACCOUNT_MAX } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { queue } from '~/modules/jobs/jobs';
import { useTestDatabase } from './db';
import {
  APP_SECRET,
  PAGE_TOKEN,
  page,
  REVOKED,
  useChatPlugin,
} from './integrationAccounts.fixture';
import { settle } from './settle';

const bot = (externalId: string, name: string) => ({
  kind: 'bot',
  externalId,
  name,
  secret: { token: `token-${externalId}` },
});

const dailyCheckComesDue = async () => {
  await queue().send('integrations.check-all', null);
  await settle();
};

describe('integration account rules', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useChatPlugin();

  const brokenNotices = async () =>
    (await t.owner().notifications.list({ kind: 'core.integration.broken' })).data;

  const chatInCatalog = async () =>
    (await t.owner().integrationAccounts.definitions({})).data.find(
      (definition) => definition.key === 'hr.chat',
    );

  const bots = async () =>
    (await t.owner().integrationAccounts.list({ integration: 'hr.bot' })).data;

  const offerBots = (candidates: ReturnType<typeof bot>[]) =>
    t.hr().pluginAccounts.offer({ integration: 'bot', userId: t.ids.owner, candidates });

  it('starts a sign-in at the service only for an integration that signs in', async () => {
    expect(await t.owner().integrationAccounts.start({ integration: 'hr.chat' })).toEqual({
      url: 'https://chat.example/login',
    });
    expect(t.hooks.at(-1)).toMatchObject({
      hook: 'start',
      orgId: t.ids.org,
      userId: t.ids.owner,
      integration: 'chat',
      setup: { appId: 'app-1', appSecret: APP_SECRET },
    });

    await expect(
      t.owner().integrationAccounts.start({ integration: 'hr.bot' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_TYPE' });
    await expect(
      t.owner().integrationAccounts.connect({ integration: 'hr.chat', values: {} }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_TYPE' });
    await expect(
      t.member().integrationAccounts.start({ integration: 'hr.chat' }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('refuses a kind of account the integration does not declare', async () => {
    await expect(
      t.hr().pluginAccounts.offer({
        integration: 'chat',
        userId: t.ids.owner,
        candidates: [{ ...page('room-1', 'A room'), kind: 'room' }],
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'INTEGRATION_REFUSED',
      message: 'Chat offered a room, which it does not declare',
    });
    expect(await t.accounts()).toEqual([]);
  });

  it('connects at once what an integration without a choose step found, and says when it found nothing', async () => {
    const found = await offerBots([bot('bot-7', 'Night bot')]);

    expect(found).toMatchObject({ pickId: null, connected: 1, failed: 0 });
    expect(found.url).toContain('/settings/integrations/hr.bot?connected=1&failed=0');

    const [night] = await bots();

    expect([night?.name, night?.createdBy]).toEqual(['Night bot', t.ids.owner]);
    expect((await t.hr().pluginAccounts.open({ id: night?.id ?? '' })).secret).toEqual({
      token: 'token-bot-7',
    });

    const nothing = await offerBots([]);

    expect(nothing).toMatchObject({ pickId: null, connected: 0, failed: 0 });
    expect(nothing.url).toContain('/settings/integrations/hr.bot?connected=0&failed=0');
    expect(await bots()).toHaveLength(1);
  });

  it('connects nothing when the choice names what the sign-in did not find, or is dropped', async () => {
    const offered = await t.offer([page('page-5', 'Nomin Outlet')]);

    await expect(
      t.owner().integrationAccounts.confirmPick({
        id: offered.pickId,
        chosen: [
          { kind: 'page', externalId: 'page-5' },
          { kind: 'page', externalId: 'page-elsewhere' },
        ],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    expect(await t.accounts()).toEqual([]);

    expect(await t.owner().integrationAccounts.cancelPick({ id: offered.pickId })).toEqual({
      ok: true,
    });
    await expect(t.owner().integrationAccounts.pick({ id: offered.pickId })).rejects.toMatchObject({
      status: 404,
    });
    await expect(
      t.owner().integrationAccounts.confirmPick({
        id: offered.pickId,
        chosen: [{ kind: 'page', externalId: 'page-5' }],
      }),
    ).rejects.toMatchObject({ status: 404 });
    expect(await t.accounts()).toEqual([]);
  });

  it('marks an account the service stopped taking broken, tells who connected it once, and heals it', async () => {
    const store = await t.connect([page('page-1', 'Nomin Store')]);
    const check = () => t.owner().integrationAccounts.check({ id: store.id });

    expect(await check()).toMatchObject({ status: 'healthy', error: null });
    expect(t.hooks.at(-1)).toMatchObject({
      hook: 'check',
      orgId: t.ids.org,
      userId: t.ids.owner,
      account: {
        id: store.id,
        externalId: 'page-1',
        secret: { pageToken: `${PAGE_TOKEN}-page-1` },
      },
      setup: { appSecret: APP_SECRET },
    });
    expect(await brokenNotices()).toEqual([]);

    t.state.revoked.add('page-1');

    expect(await check()).toMatchObject({ status: 'broken', error: REVOKED });
    expect(await check()).toMatchObject({ status: 'broken', error: REVOKED });
    expect(
      (await brokenNotices()).map((notice) => [notice.title, notice.body, notice.link]),
    ).toEqual([['Nomin Store needs reconnecting', REVOKED, '/settings/integrations/hr.chat']]);
    expect(await chatInCatalog()).toMatchObject({ checks: true, accountCount: 1, brokenCount: 1 });

    t.state.revoked.delete('page-1');

    expect(await check()).toMatchObject({ status: 'healthy', error: null });
    expect(await chatInCatalog()).toMatchObject({ accountCount: 1, brokenCount: 0 });
    expect(await brokenNotices()).toHaveLength(1);

    await expect(t.member().integrationAccounts.check({ id: store.id })).rejects.toMatchObject({
      status: 403,
    });
    await expect(t.other().integrationAccounts.check({ id: store.id })).rejects.toMatchObject({
      status: 404,
    });

    const { connected } = await t.owner().integrationAccounts.connect({
      integration: 'hr.bot',
      values: { token: 'bot-token-0123456789' },
    });

    await expect(
      t.owner().integrationAccounts.check({ id: connected[0]?.id ?? '' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_TYPE' });
  });

  it('asks the service about every account each day, and marks the ones it refuses', async () => {
    await t.connect([page('page-2', 'Nomin Support')]);
    t.state.revoked.add('page-2');
    t.hooks.length = 0;

    await dailyCheckComesDue();

    expect(
      t.hooks.flatMap((call) =>
        call.hook === 'check' ? [[call.account.externalId, call.userId]] : [],
      ),
    ).toEqual([
      ['page-1', null],
      ['page-2', null],
    ]);
    expect(
      (await t.accounts()).map((account) => [account.name, account.status, account.error]),
    ).toEqual([
      ['Nomin Store', 'healthy', null],
      ['Nomin Support', 'broken', REVOKED],
    ]);
    expect((await brokenNotices()).map((notice) => notice.title).toSorted()).toEqual([
      'Nomin Store needs reconnecting',
      'Nomin Support needs reconnecting',
    ]);

    await dailyCheckComesDue();

    expect(await brokenNotices()).toHaveLength(2);
  });

  it('writes who connected and who removed an account to the audit log', async () => {
    const account = await t.connect([page('page-7', 'Short-lived page')]);

    await t.owner().integrationAccounts.remove({ id: account.id });

    expect((await t.owner().audit.list({ targetId: account.id })).data).toMatchObject([
      {
        action: 'integration_account.removed',
        actorId: t.ids.owner,
        targetLabel: 'Short-lived page',
        metadata: { integration: 'hr.chat', externalId: 'page-7' },
      },
      {
        action: 'integration_account.connected',
        actorId: t.ids.owner,
        targetLabel: 'Short-lived page',
        metadata: { integration: 'hr.chat', kind: 'Page', externalId: 'page-7' },
      },
    ]);
  });

  it('stops an integration at its most accounts, counting only the new ones', async () => {
    const connected = await bots();

    const fresh = Array.from({ length: INTEGRATION_ACCOUNT_MAX - connected.length }, (_, index) =>
      bot(`bulk-${index}`, `Bulk bot ${index}`),
    );

    expect(await offerBots([bot('bot-7', 'Night bot'), ...fresh])).toMatchObject({
      connected: fresh.length + 1,
      failed: 0,
    });
    expect(await bots()).toHaveLength(INTEGRATION_ACCOUNT_MAX);

    await expect(offerBots([bot('one-too-many', 'One too many')])).rejects.toMatchObject({
      status: 400,
      code: 'LIMIT_EXCEEDED',
    });
    expect(await bots()).toHaveLength(INTEGRATION_ACCOUNT_MAX);
  });
});
