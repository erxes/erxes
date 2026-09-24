import { redis } from './redis';
import {
  clearServiceDiscoveryCache,
  getPlugin,
  getPluginAddress,
  keyForConfig,
} from './service-discovery';

jest.mock('./redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('./saas', () => ({
  getSaasOrganizationDetail: jest.fn(),
}));

jest.mock('./mq-worker', () => ({
  sendWorkerQueue: jest.fn(),
}));

const redisGet = redis.get as jest.Mock;

const serviceKey = (name: string) => `erxes-service-${name}`;

let redisStore: { [key: string]: string };

describe('service-discovery', () => {
  beforeEach(() => {
    clearServiceDiscoveryCache();
    jest.clearAllMocks();

    redisStore = {};
    redisGet.mockImplementation((key: string) =>
      Promise.resolve(redisStore[key] ?? null),
    );
  });

  describe('getPlugin', () => {
    it('does not cache a miss, so a service that registers later is picked up', async () => {
      const name = 'content';

      const first = await getPlugin(name);
      expect(first.address).toBe('');
      expect(first.config).toEqual({});

      redisStore[serviceKey(name)] = 'http://plugin-content-api:3300';
      redisStore[keyForConfig(name)] = JSON.stringify({
        meta: { description: 'Content management' },
      });

      const second = await getPlugin(name);
      expect(second.address).toBe('http://plugin-content-api:3300');
      expect(second.config).toEqual({
        meta: { description: 'Content management' },
      });
    });

    it('caches a hit and does not query redis again', async () => {
      const name = 'content';
      redisStore[serviceKey(name)] = 'http://plugin-content-api:3300';
      redisStore[keyForConfig(name)] = JSON.stringify({ meta: {} });

      const first = await getPlugin(name);
      expect(first.address).toBe('http://plugin-content-api:3300');
      expect(redisGet).toHaveBeenCalledTimes(2);

      const second = await getPlugin(name);
      expect(second).toBe(first);
      expect(redisGet).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPluginAddress', () => {
    it('does not cache a miss, so a service that registers later is picked up', async () => {
      const name = 'content';

      const first = await getPluginAddress(name);
      expect(first).toBeNull();

      redisStore[serviceKey(name)] = 'http://plugin-content-api:3300';

      const second = await getPluginAddress(name);
      expect(second).toBe('http://plugin-content-api:3300');
    });

    it('caches a hit and does not query redis again', async () => {
      const name = 'content';
      redisStore[serviceKey(name)] = 'http://plugin-content-api:3300';

      const first = await getPluginAddress(name);
      expect(first).toBe('http://plugin-content-api:3300');
      expect(redisGet).toHaveBeenCalledTimes(1);

      const second = await getPluginAddress(name);
      expect(second).toBe('http://plugin-content-api:3300');
      expect(redisGet).toHaveBeenCalledTimes(1);
    });
  });
});
