import { integrationPicks } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import {
  APP_SECRET,
  PAGE_TOKEN,
  page,
  REFUSAL,
  useChatPlugin,
} from './integrationAccounts.fixture';

const BOT_TOKEN = 'bot-token-0123456789';

describe('connecting integration accounts', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useChatPlugin();

  it('keeps a setup secret out of every member answer and gives it to the plugin', async () => {
    const saved = await t.owner().integrationAccounts.setup({ integration: 'hr.chat' });

    expect(saved.values).toEqual({ appId: 'app-1' });
    expect(saved.sealedNames).toEqual(['appSecret']);
    expect(JSON.stringify(saved)).not.toContain(APP_SECRET);

    await t.owner().integrationAccounts.saveSetup({
      integration: 'hr.chat',
      values: { appId: 'app-2' },
    });

    expect((await t.hr().pluginAccounts.setup({ integration: 'chat' })).setup).toEqual({
      appId: 'app-2',
      appSecret: APP_SECRET,
    });
    await expect(
      t.owner().integrationAccounts.saveSetup({ integration: 'hr.chat', values: { appId: null } }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
  });

  it('connects only what the member who signed in chose, and says which the service refused', async () => {
    const offered = await t.offer([
      page('page-1', 'Nomin Store'),
      page('page-2', 'Nomin Support'),
      page('page-refuses', 'Nomin Refuses'),
    ]);

    expect(offered.url).toContain(`/settings/integrations/hr.chat?pick=${offered.pickId}`);
    expect(await t.accounts()).toEqual([]);

    const pick = await t.owner().integrationAccounts.pick({ id: offered.pickId });

    expect(pick.candidates.map((candidate) => candidate.name)).toEqual([
      'Nomin Store',
      'Nomin Support',
      'Nomin Refuses',
    ]);
    expect(JSON.stringify(pick)).not.toContain(PAGE_TOKEN);
    await expect(t.member().integrationAccounts.pick({ id: offered.pickId })).rejects.toMatchObject(
      { status: 403 },
    );
    await expect(t.other().integrationAccounts.pick({ id: offered.pickId })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });

    const result = await t.owner().integrationAccounts.confirmPick({
      id: offered.pickId,
      chosen: [
        { kind: 'page', externalId: 'page-1' },
        { kind: 'page', externalId: 'page-refuses' },
      ],
    });

    expect(result.connected.map((account) => account.name)).toEqual(['Nomin Store']);
    expect(result.failed).toEqual([{ name: 'Nomin Refuses', message: REFUSAL }]);
    expect(result.pickId).toBe(offered.pickId);

    const listed = await t.accounts();

    expect(listed.map((account) => [account.name, account.status])).toEqual([
      ['Nomin Store', 'healthy'],
    ]);
    expect(JSON.stringify(listed)).not.toContain(PAGE_TOKEN);
    expect((await t.other().integrationAccounts.list({ integration: 'hr.chat' })).data).toEqual([]);

    const announced = t.hooks.find(
      (call) => call.hook === 'connected' && call.account.externalId === 'page-1',
    );

    expect(announced).toMatchObject({
      orgId: t.ids.org,
      userId: t.ids.owner,
      account: { secret: { pageToken: `${PAGE_TOKEN}-page-1` } },
      setup: { appSecret: APP_SECRET },
    });
  });

  it('gives an account that connects again its new secret instead of a second row', async () => {
    const [before] = await t.accounts();

    const offered = await t.offer([
      { ...page('page-1', 'Renamed at the service'), secret: { pageToken: 'rotated-token' } },
    ]);

    const pick = await t.owner().integrationAccounts.pick({ id: offered.pickId });

    expect(pick.candidates).toMatchObject([{ externalId: 'page-1', connected: true }]);

    await t.owner().integrationAccounts.confirmPick({
      id: offered.pickId,
      chosen: [{ kind: 'page', externalId: 'page-1' }],
    });

    const after = await t.accounts();

    expect(after.map((account) => [account.id, account.name])).toEqual([
      [before?.id, 'Nomin Store'],
    ]);
    expect((await t.hr().pluginAccounts.open({ id: before?.id ?? '' })).secret).toEqual({
      pageToken: 'rotated-token',
    });
    await expect(t.owner().integrationAccounts.pick({ id: offered.pickId })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('ends a sign-in that waited too long', async () => {
    const offered = await t.offer([page('page-9', 'Late page')]);

    await adminDb()
      .update(integrationPicks)
      .set({ expiresAt: sql`now() - interval '1 minute'` })
      .where(eq(integrationPicks.id, offered.pickId));

    await expect(
      t.owner().integrationAccounts.confirmPick({
        id: offered.pickId,
        chosen: [{ kind: 'page', externalId: 'page-9' }],
      }),
    ).rejects.toMatchObject({ status: 410, code: 'PICK_EXPIRED' });
    expect((await t.accounts()).map((account) => account.name)).not.toContain('Late page');
  });

  it('connects with the form: the service’s refusal is the member’s error', async () => {
    await expect(
      t.owner().integrationAccounts.connect({ integration: 'hr.bot', values: { token: 'bad' } }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'INTEGRATION_REFUSED',
      message: 'The bot service refused this token',
    });
    await expect(
      t.owner().integrationAccounts.connect({ integration: 'hr.bot', values: {} }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    const result = await t.owner().integrationAccounts.connect({
      integration: 'hr.bot',
      values: { token: BOT_TOKEN },
    });

    expect(result.connected.map((account) => [account.name, account.kind])).toEqual([
      ['Support bot', 'bot'],
    ]);
    expect(JSON.stringify(result)).not.toContain(BOT_TOKEN);
  });
});
