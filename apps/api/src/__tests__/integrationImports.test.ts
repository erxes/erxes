import { createCoreClient } from '@erxes/plugin-sdk';
import { describe, expect, it } from 'vite-plus/test';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';
import { useTestDatabase } from './db';
import { APP_SECRET, page, useChatPlugin } from './integrationAccounts.fixture';

const OLD_TOKEN = 'old-page-token-0123456789';

const SIP_PASSWORD = 'sip-password-0123456789';

describe('a plugin bringing its own accounts and secrets to core', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useChatPlugin();

  const salesCore = async () => {
    const core = createCoreClient({
      coreUrl: t.url(''),
      plugin: 'sales',
      clientSecret: await rotatePluginSecret('sales'),
    });

    await core.registerManifest({
      title: 'Sales',
      version: '1.0.0',
      scopes: [],
      api: { url: t.state.apiUrl },
      integrations: [
        {
          key: 'crm',
          name: 'CRM',
          summary: 'Accounts of a CRM',
          category: 'messaging',
          accounts: [{ kind: 'page', label: 'Page', plural: 'Pages' }],
          connect: { type: 'redirect' },
          pick: false,
          hooks: [],
        },
      ],
    });

    return core;
  };

  const oldPage = {
    ...page('old-page-1', 'Old Store'),
    id: 'old-page-account-1',
    createdBy: null,
    secret: { pageToken: OLD_TOKEN },
  };

  const oldInbox = {
    id: 'old-inbox-account-1',
    createdBy: null,
    kind: 'inbox',
    externalId: 'old-inbox-1',
    name: 'Old Inbox',
    secret: { token: OLD_TOKEN },
  };

  it('copies accounts in under their own ids, calls no hook, and changes nothing when run again', async () => {
    const hooks = t.hooks.length;

    const imported = {
      integration: 'chat',
      accounts: [oldPage, { ...oldInbox, createdBy: t.ids.owner }],
    };

    const first = await t.hr().pluginAccounts.import(imported);
    const again = await t.hr().pluginAccounts.import(imported);

    for (const answer of [first, again]) {
      expect(answer.data.map((account) => [account.id, account.name, account.status])).toEqual([
        ['old-page-account-1', 'Old Store', 'healthy'],
        ['old-inbox-account-1', 'Old Inbox', 'healthy'],
      ]);
    }

    expect(JSON.stringify(first)).not.toContain(OLD_TOKEN);
    expect((await t.accounts()).map((account) => account.id).toSorted()).toEqual([
      'old-inbox-account-1',
      'old-page-account-1',
    ]);
    expect((await t.hr().pluginAccounts.open({ id: oldPage.id })).secret).toEqual({
      pageToken: OLD_TOKEN,
    });
    expect(t.hooks).toHaveLength(hooks);
    expect((await t.owner().audit.list({ targetId: oldPage.id })).data).toMatchObject([
      {
        action: 'integration_account.imported',
        targetLabel: 'Old Store',
        metadata: { integration: 'hr.chat', kind: 'Page', externalId: 'old-page-1' },
      },
      { action: 'integration_account.imported' },
    ]);
  });

  it('keeps the stored id of an account already there and takes its new details', async () => {
    const { data } = await t.hr().pluginAccounts.import({
      integration: 'chat',
      accounts: [
        {
          ...oldPage,
          id: 'old-page-account-copy',
          name: 'Old Store renamed',
          secret: { pageToken: 'rotated-token' },
        },
      ],
    });

    expect(data.map((account) => [account.id, account.name])).toEqual([
      ['old-page-account-1', 'Old Store renamed'],
    ]);
    expect((await t.hr().pluginAccounts.open({ id: oldPage.id })).secret).toEqual({
      pageToken: 'rotated-token',
    });
    await expect(
      t.hr().pluginAccounts.import({
        integration: 'chat',
        accounts: [{ ...page('old-page-2', 'Clash'), id: oldInbox.id, createdBy: null }],
      }),
    ).rejects.toMatchObject({ status: 409, code: 'TAKEN' });
  });

  it("refuses another plugin's integration and a kind the integration does not declare", async () => {
    const sales = await salesCore();

    const crmPage = {
      ...page('crm-page-1', 'CRM page'),
      id: 'crm-page-account-1',
      createdBy: null,
    };

    await expect(
      t.hr().pluginAccounts.import({ integration: 'crm', accounts: [crmPage] }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
    expect(
      (
        await sales
          .forOrg(t.ids.org)
          .pluginAccounts.import({ integration: 'crm', accounts: [crmPage] })
      ).data,
    ).toMatchObject([{ id: 'crm-page-account-1', integration: 'sales.crm' }]);
    await expect(
      t.hr().pluginAccounts.import({
        integration: 'chat',
        accounts: [{ ...page('bot-1', 'A bot'), kind: 'bot', id: 'stray-bot', createdBy: null }],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INTEGRATION_REFUSED' });
    expect((await t.accounts()).map((account) => account.id)).not.toContain('stray-bot');
  });

  it('saves the setup only where the organisation has none', async () => {
    const oldSetup = { appId: 'old-app', appSecret: 'old-app-secret' };

    await t.hr().pluginAccounts.import({ integration: 'chat', setup: oldSetup, accounts: [] });

    expect((await t.hr().pluginAccounts.setup({ integration: 'chat' })).setup).toEqual({
      appId: 'app-1',
      appSecret: APP_SECRET,
    });

    const globex = t.hr(t.ids.otherOrg).pluginAccounts;

    await globex.import({ integration: 'chat', setup: oldSetup, accounts: [] });
    await globex.import({
      integration: 'chat',
      setup: { appId: 'later-app', appSecret: 'later-secret' },
      accounts: [],
    });

    expect((await globex.setup({ integration: 'chat' })).setup).toEqual(oldSetup);
    expect((await t.other().integrationAccounts.setup({ integration: 'hr.chat' })).values).toEqual({
      appId: 'old-app',
    });
    await expect(
      t.hr().pluginAccounts.import({ integration: 'bot', setup: oldSetup, accounts: [] }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
  });

  it('seals values that only the same plugin in the same organisation opens', async () => {
    const values = { password: SIP_PASSWORD, extension: 101 };
    const { sealed } = await t.hr().pluginSecrets.seal({ values });

    expect(sealed).not.toContain(SIP_PASSWORD);
    expect((await t.hr().pluginSecrets.open({ sealed })).values).toEqual(values);

    const sales = await salesCore();
    const refused = { status: 400, code: 'INVALID_INPUT' };

    await expect(t.hr(t.ids.otherOrg).pluginSecrets.open({ sealed })).rejects.toMatchObject(
      refused,
    );
    await expect(sales.forOrg(t.ids.org).pluginSecrets.open({ sealed })).rejects.toMatchObject(
      refused,
    );
    await expect(t.hr().pluginSecrets.open({ sealed: 'v1.not.sealed.here' })).rejects.toMatchObject(
      refused,
    );
    await expect(
      t.hr().pluginSecrets.seal({ values: { blob: 'x'.repeat(9000) } }),
    ).rejects.toMatchObject(refused);
    await expect(t.owner().pluginSecrets.seal({ values })).rejects.toMatchObject({ status: 403 });
  });
});
