jest.mock('../redis', () => ({ redis: { get: jest.fn() } }));
jest.mock('../saas', () => ({}));
jest.mock('../utils', () => ({}));
jest.mock('../mq-worker', () => ({}));

import { redis } from '../redis';
import {
  clearServiceDiscoveryCache,
  getPlugin,
  keyForConfig,
} from '../service-discovery';

describe('service discovery during late registration', () => {
  const values = new Map<string, string>();
  const get = jest.mocked(redis.get);

  beforeEach(() => {
    clearServiceDiscoveryCache();
    values.clear();
    get.mockReset();
    get.mockImplementation(async (key) => values.get(String(key)) ?? null);
  });

  it.each(['missing', 'address-only', 'config-only', 'empty-config'])(
    'does not cache a %s registration',
    async (state) => {
      if (state === 'address-only' || state === 'empty-config') {
        values.set('erxes-service-inventory-tools', 'http://localhost:3315');
      }
      if (state === 'config-only') {
        values.set(
          keyForConfig('inventory-tools'),
          JSON.stringify({ uiEntry: 'http://localhost:3015/remoteEntry.js' }),
        );
      }
      if (state === 'empty-config') {
        values.set(keyForConfig('inventory-tools'), '{}');
      }
      await getPlugin('inventory-tools');

      const config = {
        uiEntry: 'http://localhost:3015/remoteEntry.js',
        releaseVersion: 'latest',
      };
      values.set('erxes-service-inventory-tools', 'http://localhost:3315');
      values.set(keyForConfig('inventory-tools'), JSON.stringify(config));

      const registered = await getPlugin('inventory-tools');
      expect(registered).toEqual({ address: 'http://localhost:3315', config });
      expect(get).toHaveBeenCalledTimes(4);
      expect(await getPlugin('inventory-tools')).toBe(registered);
      expect(get).toHaveBeenCalledTimes(4);
    },
  );

  it('still supports explicitly clearing a successfully cached registration', async () => {
    values.set('erxes-service-inventory', 'http://localhost:3316');
    values.set(keyForConfig('inventory'), '{"releaseVersion":"latest"}');
    await getPlugin('inventory');
    clearServiceDiscoveryCache('inventory');
    values.set('erxes-service-inventory', 'http://localhost:3317');
    expect((await getPlugin('inventory')).address).toBe(
      'http://localhost:3317',
    );
  });
});
