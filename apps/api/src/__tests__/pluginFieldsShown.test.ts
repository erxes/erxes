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

    // The filter has the custom field and its Data Extensions field, `subject.data.total_spent`.
    const listed = { fields: ['total_spent'], filter: ['Total spent', 'Total spent'] };
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

  it('keeps a field the manifest marks not filterable as a column only', async () => {
    const other = t.other();

    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'Sales',
      version: '1.0.0',
      scopes: ['fields:write', 'customers:read'],
      fields: [
        {
          code: 'total_spent',
          contentType: 'customer',
          label: 'Total spent',
          type: 'number',
          filterable: false,
        },
      ],
    });

    const [field] = (await other.fields.list({ contentType: 'customer' })).data;
    const path = `subject.customFields.${field?.id}`;

    // Still a field (columns and sorting keep it), but not in the filter, which refuses it.
    expect(field).toMatchObject({ code: 'total_spent', archivedAt: null });
    expect(
      (await other.views.fields({ recordType: 'customer' })).data.some((f) => f.path === path),
    ).toBe(false);
    await expect(
      other.customers.list({
        filter: JSON.stringify({ match: 'all', rules: [{ path, op: 'gte', value: 1 }] }),
      }),
    ).rejects.toMatchObject({ code: 'INVALID_FILTER' });
  });
});
