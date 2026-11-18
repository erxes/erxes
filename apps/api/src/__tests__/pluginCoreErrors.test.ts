import { createCoreClient, passCoreError } from '@erxes/plugin-sdk';
import { createServer } from 'node:net';
import { describe, expect, it } from 'vite-plus/test';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** A local port nothing listens on. */
const closedPort = () =>
  new Promise<number>((resolve, reject) => {
    const probe = createServer();

    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();

      probe.close(() =>
        typeof address === 'object' && address
          ? resolve(address.port)
          : reject(new Error('no port')),
      );
    });
  });

describe("core's errors as a plugin passes them on (@erxes/plugin-sdk)", () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it("passes core's 4xx on with its code and field, and only an unreachable core as 503", async () => {
    const core = createCoreClient({
      coreUrl: t.url(''),
      plugin: 'hr',
      clientSecret: await rotatePluginSecret('hr'),
    });

    const customers = core.forOrg(t.ids.org).customers;
    const passOn = passCoreError('customers');

    await expect(
      customers.findOrCreate({ primaryEmail: 'not-an-email' }).catch(passOn),
    ).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_INPUT',
      data: { issues: [{ path: ['primaryEmail'] }] },
    });
    await expect(customers.get({ id: 'no-such-customer' }).catch(passOn)).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });

    await customers.create({ primaryEmail: 'taken@mail.mn' });
    await expect(
      customers.create({ primaryEmail: 'taken@mail.mn' }).catch(passOn),
    ).rejects.toMatchObject({ status: 409, code: 'TAKEN', data: { field: 'primaryEmail' } });

    const down = createCoreClient({
      coreUrl: `http://127.0.0.1:${await closedPort()}`,
      plugin: 'hr',
      clientSecret: 'any-secret',
    });

    await expect(
      down.forOrg(t.ids.org).customers.get({ id: 'x' }).catch(passOn),
    ).rejects.toMatchObject({
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
      message: 'erxes customers could not be reached. Try again shortly.',
    });

    // Core refusing the plugin's own secret is not the caller's fault either.
    const refused = createCoreClient({
      coreUrl: t.url(''),
      plugin: 'hr',
      clientSecret: 'wrong-secret',
    });

    await expect(
      refused.forOrg(t.ids.org).customers.get({ id: 'x' }).catch(passOn),
    ).rejects.toMatchObject({ status: 503, code: 'SERVICE_UNAVAILABLE' });
  });
});
