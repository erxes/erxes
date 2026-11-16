import type { PluginManifest } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTestServer } from './support';

type RelationField = NonNullable<PluginManifest['relations']>[number]['fields'][number];

const withField = (field: RelationField): PluginManifest => ({
  title: 'HR',
  version: '1',
  scopes: [],
  relations: [
    {
      key: 'deals',
      contentType: 'customer',
      label: 'Deals',
      view: 'hr_customer_deals',
      fields: [field],
    },
  ],
});

describe('relation fields in a manifest', () => {
  useTestDatabase();

  const server = useTestServer();

  it('lets number fields name their measures, and dates only earliest and latest', async () => {
    const hr = server.client(await server.pluginToken());

    await hr.plugins.registerManifest(
      withField({ key: 'amount', label: 'Amount', type: 'number', measures: ['sum'] }),
    );
    await hr.plugins.registerManifest(
      withField({ key: 'closed_on', label: 'Closed', type: 'date', measures: ['max'] }),
    );

    for (const field of [
      { key: 'stage', label: 'Stage', type: 'text', measures: ['sum'] },
      { key: 'closed_on', label: 'Closed', type: 'date', measures: ['avg'] },
      { key: 'amount', label: 'Amount', type: 'number', measures: ['sum', 'sum'] },
    ] satisfies RelationField[]) {
      await expect(hr.plugins.registerManifest(withField(field))).rejects.toMatchObject({
        code: 'INVALID_INPUT',
      });
    }
  });
});
