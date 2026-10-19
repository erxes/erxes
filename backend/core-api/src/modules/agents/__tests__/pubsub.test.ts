/**
 * Process-wide Redis Streams PubSub tests.
 *
 * The guarantees under test:
 *
 * - exactly one bus per process, even under concurrent first requests;
 * - a failed creation is evicted so the next request retries instead of
 *   caching the rejection forever;
 * - the native `RedisStreamsPubSub` is configured with the collision-safe
 *   `core-agents` key prefix plus bounded stream length/idle TTL, and its
 *   URL is built from the platform Redis env convention
 *   (`REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`), defaulting to the native
 *   localhost URL when no host is configured.
 */

jest.mock('@mastra/redis-streams', () => ({
  RedisStreamsPubSub: jest.fn(),
}));

// `@mastra/redis-streams` is ESM-only; the mock is always (re-)acquired
// through `jest.requireMock` AFTER `jest.resetModules`, because resetting
// the registry creates a fresh instance of the mock factory and a
// top-level reference would go stale and record no calls.
//
// Dynamic `import()` of a `paths`-mapped name does not resolve in ESM
// mode under nodenext (and a relative import would need an explicit
// extension that jest cannot load), so fresh module instances per test go
// through `require`, which resolves in CJS mode like every other `@/`
// import in this plugin.
const loadPubSubModule = (): {
  getAgentsPubSub: typeof import('@/agents/pubsub').getAgentsPubSub;
  MockedCtor: jest.Mock;
} => {
  jest.resetModules();

  const { RedisStreamsPubSub: MockedCtor } = jest.requireMock(
    '@mastra/redis-streams',
  ) as { RedisStreamsPubSub: jest.Mock };

  MockedCtor.mockClear();
  MockedCtor.mockImplementation((config: unknown) => ({ config }));

  const mod = require('@/agents/pubsub') as typeof import('@/agents/pubsub');

  return { getAgentsPubSub: mod.getAgentsPubSub, MockedCtor };
};

const REDIS_ENV_KEYS = ['REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD'] as const;

let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
  savedEnv = {};

  for (const key of REDIS_ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }

  jest.resetModules();
});

afterEach(() => {
  for (const key of REDIS_ENV_KEYS) {
    const saved = savedEnv[key];

    if (saved === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = saved;
    }
  }
});

describe('getAgentsPubSub', () => {
  it('creates one bus per process and reuses it on repeat calls', async () => {
    const { getAgentsPubSub, MockedCtor } = loadPubSubModule();

    const [first, second, third] = await Promise.all([
      getAgentsPubSub(),
      getAgentsPubSub(),
      getAgentsPubSub(),
    ]);

    expect(first).toBe(second);
    expect(second).toBe(third);
    expect(MockedCtor).toHaveBeenCalledTimes(1);
  });

  it('configures the collision-safe prefix with bounded stream retention', async () => {
    const { getAgentsPubSub, MockedCtor } = loadPubSubModule();

    await getAgentsPubSub();

    expect(MockedCtor).toHaveBeenCalledWith(
      expect.objectContaining({
        keyPrefix: 'core-agents',
        maxStreamLength: 10_000,
        streamIdleTtlMs: 3_600_000,
        maxDeliveryAttempts: 5,
        logger: { warn: expect.any(Function) },
      }),
    );
  });

  it('builds the Redis URL from the platform env convention', async () => {
    process.env.REDIS_HOST = 'redis';
    process.env.REDIS_PORT = '6380';
    process.env.REDIS_PASSWORD = 's3cret';
    const { getAgentsPubSub, MockedCtor } = loadPubSubModule();

    await getAgentsPubSub();

    expect(MockedCtor).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'redis://:s3cret@redis:6380' }),
    );
  });

  it('omits auth and defaults the port when only a host is configured', async () => {
    process.env.REDIS_HOST = 'redis';
    const { getAgentsPubSub, MockedCtor } = loadPubSubModule();

    await getAgentsPubSub();

    expect(MockedCtor).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'redis://redis:6379' }),
    );
  });

  it('defaults to redis://localhost:6379 when no Redis env is configured', async () => {
    const { getAgentsPubSub, MockedCtor } = loadPubSubModule();

    await getAgentsPubSub();

    expect(MockedCtor).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'redis://localhost:6379' }),
    );
  });

  it('honors port and password without REDIS_HOST via the localhost default', async () => {
    process.env.REDIS_PORT = '6380';
    process.env.REDIS_PASSWORD = 's3cret';
    const { getAgentsPubSub, MockedCtor } = loadPubSubModule();

    await getAgentsPubSub();

    expect(MockedCtor).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'redis://:s3cret@localhost:6380' }),
    );
  });

  it('percent-encodes special characters in the password', async () => {
    process.env.REDIS_HOST = 'redis';
    process.env.REDIS_PASSWORD = 'p@ss:w/ord';
    const { getAgentsPubSub, MockedCtor } = loadPubSubModule();

    await getAgentsPubSub();

    expect(MockedCtor).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'redis://:p%40ss%3Aw%2Ford@redis:6379' }),
    );
  });

  it('brackets a bare IPv6 host for URL embedding', async () => {
    process.env.REDIS_HOST = '::1';
    const { getAgentsPubSub, MockedCtor } = loadPubSubModule();

    await getAgentsPubSub();

    expect(MockedCtor).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'redis://[::1]:6379' }),
    );
  });

  it.each([['notaport'], ['6380.5'], ['-1'], [''], ['99999'], ['0']])(
    'rejects a malformed or out-of-range REDIS_PORT %s instead of a broken URL',
    async (port) => {
      process.env.REDIS_HOST = 'redis';
      process.env.REDIS_PORT = port;
      const { getAgentsPubSub, MockedCtor } = loadPubSubModule();

      await expect(getAgentsPubSub()).rejects.toThrow('Invalid REDIS_PORT');
      expect(MockedCtor).not.toHaveBeenCalled();
    },
  );

  it('evicts a failed creation so the next request retries', async () => {
    const { getAgentsPubSub, MockedCtor } = loadPubSubModule();

    MockedCtor.mockImplementationOnce(() => {
      throw new Error('redis unavailable');
    });

    await expect(getAgentsPubSub()).rejects.toThrow('redis unavailable');

    const recovered = await getAgentsPubSub();
    expect(recovered).toBeDefined();
    expect(MockedCtor).toHaveBeenCalledTimes(2);
  });
});
