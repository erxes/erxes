import { plugins } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { sha256 } from '~/lib/crypto';
import { syncPluginSecrets } from '~/modules/plugins/plugins.service';
import { adminDb, useTestDatabase } from './db';
import { useTestServer } from './support';

describe('plugin names', () => {
  useTestDatabase();

  const server = useTestServer();
  const secret = 'x'.repeat(40);

  it('refuses a plugin named after a core area at startup', async () => {
    config.pluginKeys.set(secret, 'payments');

    try {
      await expect(syncPluginSecrets()).rejects.toThrow('payments is reserved');
    } finally {
      config.pluginKeys.delete(secret);
    }
  });

  it("keeps a plugin registered under a core area's name from declaring core permissions", async () => {
    await adminDb()
      .insert(plugins)
      .values({ name: 'team', secretHash: sha256(secret), secretRotatedAt: sql`now()` });

    const { access_token } = await server.client().plugins.token({
      grant_type: 'client_credentials',
      client_id: 'team',
      client_secret: secret,
    });

    await expect(
      server.client(access_token).plugins.registerManifest({
        title: 'Team',
        version: '1',
        permissions: [{ action: 'team.manage', label: 'Manage the team' }],
        permissionSets: [
          { key: 'all', label: 'All', permissions: ['team.manage'], defaultRoles: ['member'] },
        ],
      }),
    ).rejects.toMatchObject({ code: 'NAMESPACE_REQUIRED' });
  });
});
