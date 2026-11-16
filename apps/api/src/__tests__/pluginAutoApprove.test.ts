import type { PluginScope } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { useTestDatabase } from './db';
import { HR_SECRET } from './plugin';
import { useTwoOrgs } from './support';

describe('approving the scopes a newer plugin version asks for', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const asking = async (version: string, scopes: PluginScope[]) =>
    t.client(await t.pluginToken()).plugins.registerManifest({ title: 'HR', version, scopes });

  const hrListing = async () =>
    (await t.member().plugins.list({})).data.find((plugin) => plugin.name === 'hr');

  const scopesNow = async () => {
    const token = await t.client().plugins.token({
      grant_type: 'client_credentials',
      client_id: 'hr',
      client_secret: HR_SECRET,
      org: t.ids.org,
    });

    return token.scope?.split(' ') ?? [];
  };

  it('waits for the owner on Settings › Plugins without auto-install', async () => {
    // Installed again after asking for less, so it holds only that.
    await asking('2.0.0', ['notifications:write']);
    await t.owner().plugins.uninstall({ name: 'hr' });
    await t.owner().plugins.install({ name: 'hr' });
    config.plugins.autoInstall = false;
    await asking('2.1.0', ['notifications:write', 'audit:write']).finally(() => {
      config.plugins.autoInstall = true;
    });

    expect((await hrListing())?.needsApproval).toBe(true);
    expect(await scopesNow()).not.toContain('audit:write');

    await t.owner().plugins.install({ name: 'hr' });
    expect(await scopesNow()).toContain('audit:write');
  });

  it('grants them at once with auto-install, which hides that page', async () => {
    await asking('2.0.0', ['notifications:write']);
    await t.owner().plugins.uninstall({ name: 'hr' });
    await t.owner().plugins.install({ name: 'hr' });
    await asking('3.0.0', ['notifications:write', 'events:write', 'fields:write']);

    expect((await hrListing())?.needsApproval).toBe(false);
    expect(await scopesNow()).toContain('fields:write');
    expect(await t.member().saas.plan({})).toMatchObject({ saas: false, pluginsManaged: true });
  });
});
