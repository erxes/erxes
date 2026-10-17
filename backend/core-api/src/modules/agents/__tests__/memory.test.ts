/**
 * Tenant memory lifecycle tests.
 *
 * The guarantees under test:
 *
 * - exactly one Memory (one store/init cycle) per subdomain, even under
 *   concurrent first requests;
 * - a failed creation is evicted so the next request retries instead of
 *   caching the rejection forever;
 * - the runtime bundle pairs that Memory with a minimal Mastra instance
 *   sharing the same store, so destructive-tool approval snapshots persist
 *   to the same dedicated agents sub-database;
 * - conversation collections resolve against the dedicated
 *   `{baseDb}_agents_memory` database derived from the shared connection,
 *   never against the platform's own database;
 * - `close()` is a no-op because the platform owns the connection lifecycle;
 * - a not-yet-open connection fails loudly instead of returning a dead store.
 */

import { getAgentsMemory, getAgentsRuntime } from '@/agents/memory';

jest.mock('@mastra/mongodb', () => ({
  // MongoDB 4.4.25 compatible
  MongoDBStore: jest.fn(function (this: { stores: { workflows: object } }) {
    this.stores = { workflows: {} };
  }),
}));
// MongoDB 4.4.25 compatible
jest.mock('@/agents/mongo44Compatibility', () => ({
  installMongo44WorkflowCompatibility: jest.fn(),
}));
jest.mock('@mastra/memory', () => ({
  Memory: jest.fn(),
}));
jest.mock('@mastra/core/mastra', () => ({
  Mastra: jest.fn(),
}));
jest.mock('@mastra/core/agent/durable', () => ({
  createDurableAgent: jest.fn((opts: { agent: unknown }) => opts.agent),
}));
jest.mock('@/agents/agent', () => ({
  buildBaseAgentsAgent: jest.fn(async () => ({
    id: 'agents',
    name: 'agents',
  })),
}));
jest.mock('@/agents/pubsub', () => {
  const bus = { bus: 'agents-test-bus' };

  return { getAgentsPubSub: jest.fn(async () => bus) };
});

// The mutable connection state lives inside the factory (which is hoisted)
// and is exposed on the mocked module so tests can flip it per scenario.
jest.mock('mongoose', () => {
  const state: { db: { databaseName: string } | undefined } = {
    db: { databaseName: 'erxes_tenant' },
  };
  const useDb = jest.fn();
  return {
    __esModule: true,
    default: {
      connection: {
        useDb,
        get db() {
          return state.db;
        },
      },
    },
    __state: state,
    __useDb: useDb,
  };
});

// `@mastra/mongodb` and `@mastra/memory` are ESM-only; the mocked modules are
// retrieved through jest.requireMock so this CommonJS file never imports them.
const { MongoDBStore: MockedMongoDBStore } = jest.requireMock(
  '@mastra/mongodb',
) as { MongoDBStore: jest.Mock };
const { Memory: MockedMemory } = jest.requireMock('@mastra/memory') as {
  Memory: jest.Mock;
};
const { Mastra: MockedMastra } = jest.requireMock('@mastra/core/mastra') as {
  Mastra: jest.Mock;
};
const { getAgentsPubSub: mockedGetAgentsPubSub } = jest.requireMock(
  '@/agents/pubsub',
) as { getAgentsPubSub: jest.Mock };

interface IMongooseMock {
  default: { connection: { useDb: jest.Mock } };
  __state: { db: { databaseName: string } | undefined };
  __useDb: jest.Mock;
}

const mongooseMock = jest.requireMock('mongoose') as IMongooseMock;
const fakeConnection = mongooseMock.default.connection;

interface IConnectorHandlerLike {
  getCollection(name: string): Promise<{ name?: string }>;
  close(): Promise<void>;
}

const lastStoreConfig = () =>
  MockedMongoDBStore.mock.calls[
    MockedMongoDBStore.mock.calls.length - 1
  ][0] as { id: string; connectorHandler: IConnectorHandlerLike };

const lastMemoryOptions = () =>
  MockedMemory.mock.calls[MockedMemory.mock.calls.length - 1][0] as {
    storage: unknown;
    options: Record<string, unknown>;
  };

const lastMastraConfig = () =>
  MockedMastra.mock.calls[MockedMastra.mock.calls.length - 1][0] as {
    storage: unknown;
    agents: unknown;
    logger: unknown;
    workers: unknown;
    pubsub: unknown;
  };

const mastraConfigAt = (index: number) =>
  MockedMastra.mock.calls[index]?.[0] as {
    storage: unknown;
    agents: unknown;
    logger: unknown;
    workers: unknown;
    pubsub: unknown;
  };

beforeEach(() => {
  jest.clearAllMocks();
  mongooseMock.__state.db = { databaseName: 'erxes_tenant' };
  fakeConnection.useDb.mockImplementation((name: string) => ({
    db: {
      collection: jest.fn((collectionName: string) => ({
        name: `${name}.${collectionName}`,
      })),
    },
  }));
});

describe('getAgentsMemory', () => {
  it('creates one Memory per subdomain and reuses it on repeat calls', async () => {
    const first = await getAgentsMemory('tenant-a');
    const second = await getAgentsMemory('tenant-a');

    expect(second).toBe(first);
    expect(MockedMemory).toHaveBeenCalledTimes(1);
    expect(MockedMongoDBStore).toHaveBeenCalledTimes(1);
  });

  it('keeps separate Memory instances per subdomain', async () => {
    const a = await getAgentsMemory('tenant-x');
    const b = await getAgentsMemory('tenant-y');

    expect(a).not.toBe(b);
    expect(MockedMemory).toHaveBeenCalledTimes(2);
  });

  it('does not double-initialize the store under concurrent first requests', async () => {
    const [a, b, c] = await Promise.all([
      getAgentsMemory('tenant-race'),
      getAgentsMemory('tenant-race'),
      getAgentsMemory('tenant-race'),
    ]);

    expect(a).toBe(b);
    expect(b).toBe(c);
    expect(MockedMemory).toHaveBeenCalledTimes(1);
    expect(MockedMongoDBStore).toHaveBeenCalledTimes(1);
  });

  it('evicts a failed creation so the next request retries', async () => {
    MockedMemory.mockImplementationOnce(() => {
      throw new Error('store init failed');
    });

    await expect(getAgentsMemory('tenant-flaky')).rejects.toThrow(
      'store init failed',
    );

    const recovered = await getAgentsMemory('tenant-flaky');
    expect(recovered).toBeDefined();
    expect(MockedMemory).toHaveBeenCalledTimes(2);
  });

  it('does not cache a rejection for other subdomains', async () => {
    MockedMemory.mockImplementationOnce(() => {
      throw new Error('boom');
    });

    await expect(getAgentsMemory('tenant-bad')).rejects.toThrow('boom');

    const healthy = await getAgentsMemory('tenant-good');
    expect(healthy).toBeDefined();
  });
});

describe('connectorHandler', () => {
  it('resolves collections against the dedicated agents sub-database', async () => {
    await getAgentsMemory('tenant-db');
    const { connectorHandler } = lastStoreConfig();

    const collection = await connectorHandler.getCollection('messages');

    expect(fakeConnection.useDb).toHaveBeenCalledWith(
      'erxes_tenant_agents_memory',
    );
    expect(collection).toBeDefined();
    expect(collection.name).toBe('erxes_tenant_agents_memory.messages');
  });

  it('close() is a no-op that never touches the shared connection', async () => {
    await getAgentsMemory('tenant-close');
    const { connectorHandler } = lastStoreConfig();

    await expect(connectorHandler.close()).resolves.toBeUndefined();
  });

  it('fails loudly when the connection is not open yet', async () => {
    await getAgentsMemory('tenant-notopen');
    const { connectorHandler } = lastStoreConfig();

    mongooseMock.__state.db = undefined;

    await expect(connectorHandler.getCollection('messages')).rejects.toThrow(
      'Mongoose connection is not open yet.',
    );
  });
});

describe('Memory configuration', () => {
  it('replays a bounded recent-message window and derives thread titles', async () => {
    await getAgentsMemory('tenant-opts');

    const { options } = lastMemoryOptions();
    expect(options.lastMessages).toBe(20);
    expect(options.generateTitle).toBe(true);
  });

  it('wires the MongoDBStore into the Memory instance', async () => {
    await getAgentsMemory('tenant-wire');

    const { storage } = lastMemoryOptions();
    expect(storage).toBe(MockedMongoDBStore.mock.instances[0]);
  });
});

describe('getAgentsRuntime', () => {
  it('pairs the tenant Memory with a Mastra instance and a durable agent', async () => {
    const runtime = await getAgentsRuntime('tenant-rt');

    expect(runtime.memory).toBe(MockedMemory.mock.instances[0]);
    expect(runtime.mastra).toBe(MockedMastra.mock.instances[0]);
    expect(runtime.agent).toBeDefined();
    expect(lastMastraConfig().storage).toBe(
      MockedMongoDBStore.mock.instances[0],
    );
  });

  it('builds a minimal Mastra instance: persistent storage, agents registered, no workers, no logging', async () => {
    await getAgentsRuntime('tenant-minimal');

    const config = lastMastraConfig();
    expect(config.logger).toBe(false);
    expect(config.workers).toBe(false);
    expect(config.agents).toBeDefined();
  });

  it('hands every tenant Mastra the same process-wide Redis Streams bus', async () => {
    await getAgentsRuntime('tenant-bus-a');
    await getAgentsRuntime('tenant-bus-b');

    // Two tenants get two Mastra instances but one shared bus: stream
    // events publish to Redis, so `observe` replays across replicas.
    expect(MockedMastra).toHaveBeenCalledTimes(2);
    expect(mastraConfigAt(0)?.pubsub).toBeDefined();
    expect(mastraConfigAt(0)?.pubsub).toBe(mastraConfigAt(1)?.pubsub);
    expect(mockedGetAgentsPubSub).toHaveBeenCalled();
  });

  it('creates one bundle per subdomain and reuses it on repeat calls', async () => {
    const first = await getAgentsRuntime('tenant-reuse');
    const second = await getAgentsRuntime('tenant-reuse');

    expect(second).toBe(first);
    expect(MockedMastra).toHaveBeenCalledTimes(1);
    expect(MockedMongoDBStore).toHaveBeenCalledTimes(1);
  });

  it('exposes the same Memory through getAgentsMemory', async () => {
    const runtime = await getAgentsRuntime('tenant-shared');
    const memory = await getAgentsMemory('tenant-shared');

    expect(memory).toBe(runtime.memory);
    expect(MockedMemory).toHaveBeenCalledTimes(1);
  });

  it('evicts a bundle whose Mastra construction fails so the next request retries', async () => {
    MockedMastra.mockImplementationOnce(() => {
      throw new Error('mastra init failed');
    });

    await expect(getAgentsRuntime('tenant-mastra-flaky')).rejects.toThrow(
      'mastra init failed',
    );

    const recovered = await getAgentsRuntime('tenant-mastra-flaky');
    expect(recovered.mastra).toBeDefined();
    expect(MockedMastra).toHaveBeenCalledTimes(2);
  });
});
