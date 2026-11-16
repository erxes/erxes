import { pluginInstallations } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** A field the plugin can't fill (not approved, or uninstalled) would only ever show empty. */
describe('plugin fields members see', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('shows a plugin’s fields only while it is installed with fields:write', async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'Sales',
      version: '1.0.0',
      scopes: ['fields:write', 'customers:read'],
      fields: [
        { code: 'total_spent', contentType: 'customer', label: 'Total spent', type: 'number' },
      ],
    });

    const owner = t.owner();

    const shown = async () => ({
      fields: (await owner.fields.list({ contentType: 'customer' })).data
        .filter((field) => field.plugin)
        .map((field) => field.code),
      filter: (await owner.views.fields({ recordType: 'customer' })).data
        .filter((field) => field.group === 'plugin')
        .map((field) => field.label),
    });

    const listed = { fields: ['total_spent'], filter: ['Total spent'] };
    const hidden = { fields: [], filter: [] };

    expect(await shown()).toEqual(listed);

    // The owner hasn't approved fields:write yet.
    await adminDb()
      .update(pluginInstallations)
      .set({ grantedScopes: ['customers:read'] })
      .where(and(eq(pluginInstallations.orgId, t.ids.org), eq(pluginInstallations.plugin, 'hr')));
    expect(await shown()).toEqual(hidden);

    await owner.plugins.install({ name: 'hr' });
    expect(await shown()).toEqual(listed);

    await owner.plugins.uninstall({ name: 'hr' });
    expect(await shown()).toEqual(hidden);
    // The other organisation still has it.
    expect(
      (await t.other().fields.list({ contentType: 'customer' })).data.filter((f) => f.plugin),
    ).toHaveLength(1);
  });
});
