import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { APP_SECRET, PAGE_TOKEN, page, useChatPlugin } from './integrationAccounts.fixture';
import { makeDue, settle } from './settle';

describe('integration accounts in automations', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useChatPlugin();
  const account = { id: '' };

  beforeAll(async () => {
    account.id = (await t.connect([page('page-1', 'Nomin Store')])).id;
  });

  it('runs a step on the account it picked, and fails the run with why once the account breaks', async () => {
    const id = await t.active('Answer on chat', {
      trigger: { kind: 'event', event: 'hr.chat.received' },
      steps: [
        {
          id: 'send',
          type: 'action',
          action: 'hr.chat.send',
          input: { _account: '{{event.payload.accountId}}', text: 'Hello' },
        },
      ],
    });

    const received = () =>
      t.hr().events.publish({
        events: [{ type: 'hr.chat.received', payload: { accountId: account.id } }],
      });

    await received();
    await settle();

    expect((await t.runsOf(id)).map((run) => run.status)).toEqual(['succeeded']);
    expect(t.actions.at(-1)).toMatchObject({
      input: { text: 'Hello' },
      account: {
        id: account.id,
        externalId: 'page-1',
        secret: { pageToken: `${PAGE_TOKEN}-page-1` },
      },
      setup: { appSecret: APP_SECRET },
    });
    expect(t.actions.at(-1)?.input).not.toHaveProperty('_account');

    const sentBefore = t.actions.length;

    await t.hr().pluginAccounts.report({ id: account.id, error: 'The page removed the app' });
    await received();
    await settle();

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await makeDue();
      await settle();
    }

    const runs = await t.runsOf(id);

    expect(runs.map((run) => run.status).toSorted()).toEqual(['failed', 'succeeded']);
    expect(runs.find((run) => run.status === 'failed')?.error).toContain('needs reconnecting');
    expect(t.actions.length).toBe(sentBefore);

    const inbox = await t.owner().notifications.list({ kind: 'core.integration.broken' });

    expect(inbox.data.map((notice) => notice.title)).toEqual(['Nomin Store needs reconnecting']);
  });

  it('names the automations that use an account, and tells the plugin when it is removed', async () => {
    const automation = await t.owner().automations.create({
      name: 'Always from the store',
      definition: {
        trigger: { kind: 'event', event: 'hr.chat.received' },
        steps: [
          {
            id: 'send',
            type: 'action',
            action: 'hr.chat.send',
            input: { _account: account.id, text: 'Hi' },
          },
        ],
      },
    });

    expect((await t.owner().integrationAccounts.usage({ id: account.id })).automations).toEqual([
      { id: automation.id, name: 'Always from the store' },
    ]);

    await t.owner().integrationAccounts.remove({ id: account.id });

    expect(await t.accounts()).toEqual([]);
    expect(
      t.hooks.some((call) => call.hook === 'disconnect' && call.account.id === account.id),
    ).toBe(true);
    await expect(t.hr().pluginAccounts.open({ id: account.id })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('lets only members who manage integrations in, and a plugin reach only its own', async () => {
    await expect(
      t.member().integrationAccounts.list({ integration: 'hr.chat' }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      t.hr().pluginAccounts.offer({
        integration: 'chat',
        userId: t.ids.otherOwner,
        candidates: [page('page-3', 'Someone else')],
      }),
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      t.client(await t.pluginToken()).plugins.registerManifest({
        title: 'HR',
        version: '5.0.1',
        scopes: ['events:write'],
        api: { url: t.state.apiUrl },
        actions: [{ type: 'hr.other.send', label: 'Send', integration: 'hr.nowhere', fields: [] }],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_REFERENCE' });
  });
});
