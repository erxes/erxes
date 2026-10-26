/**
 * AgentsConnection model against real MongoDB.
 *
 * Every test runs the production model through `generateModels('test')` on a
 * throwaway database, so query filters, `$set`/`$unset` and upserts are
 * MongoDB's own behaviour:
 *
 * - keys are sealed before they reach the database, and the write path fails
 *   closed without an encryption secret;
 * - the explicit default is set only when that provider is saved, leaves the
 *   document untouched otherwise, can be cleared, and is dropped with its
 *   connection;
 * - documents still in the old single-`connection` shape migrate to the
 *   array with a sealed key, the default set and the old field removed;
 * - one user's or one tenant's writes never touch another's document.
 */

import { randomUUID } from 'node:crypto';
import type { Connection } from 'mongoose';
import type { IAiAgentConnection } from 'erxes-api-shared/core-modules';
import type * as CoreModules from 'erxes-api-shared/core-modules';
import type { IModels } from '~/connectionResolvers';

const DATABASE = `erxes_agents_connection_test_${randomUUID().replace(/-/g, '')}`;
const TENANT_B_DATABASE = `${DATABASE}_b`;

// Before any app module loads: the shared mongo module reads MONGO_URL once.
process.env.MONGO_URL = `mongodb://127.0.0.1:27017/${DATABASE}?directConnection=true`;
process.env.JWT_TOKEN_SECRET = 'agents-connection-test-secret';

// Real database round trips; the first ones also build the collection.
jest.setTimeout(30_000);

type IConnectionResolvers = typeof import('~/connectionResolvers');
type ISecretBox = typeof import('@/agents/secretBox');

let models: IModels;
let tenantB: IModels;
let tenantBConnection: Connection;
let secretBox: ISecretBox;

const OPENAI: IAiAgentConnection = {
  provider: 'openai',
  model: 'gpt-5.6-luna',
  config: { apiKey: 'sk-openai-plain' },
};
const KIMI: IAiAgentConnection = {
  provider: 'kimi',
  model: 'kimi-k3',
  config: { apiKey: 'sk-kimi-plain' },
};

/** The stored document exactly as MongoDB holds it. */
const rawDoc = (userId: string, scope: IModels = models) =>
  scope.AgentsConnection.collection.findOne({ userId });

const saveBoth = async (userId: string) => {
  await models.AgentsConnection.upsertConnection(userId, 'openai', {
    ...OPENAI,
    config: { ...OPENAI.config },
  });
  await models.AgentsConnection.upsertConnection(userId, 'kimi', {
    ...KIMI,
    config: { ...KIMI.config },
  });
};

/** A document written by the previous single-connection shape. */
const insertLegacy = (userId: string) =>
  models.AgentsConnection.collection.insertOne({
    userId,
    connection: {
      provider: 'openai',
      model: 'gpt-5.6-luna',
      config: { apiKey: 'sk-legacy-plain' },
    },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

beforeAll(async () => {
  const { default: mongoose } = await import('mongoose');
  const resolvers: IConnectionResolvers = await import('~/connectionResolvers');
  const { createScopedEventHandlers } = jest.requireActual<typeof CoreModules>(
    'erxes-api-shared/core-modules',
  );

  secretBox = await import('@/agents/secretBox');
  models = await resolvers.generateModels('test');
  // Connect and build the collection before the first test measures anything.
  await mongoose.connection.asPromise();
  await models.AgentsConnection.init();
  // SaaS tenants are separate databases on the same server (`useDb` per
  // organization); load the production classes on one the same way.
  tenantBConnection = mongoose.connection.useDb(TENANT_B_DATABASE);
  tenantB = resolvers.loadClasses(
    tenantBConnection,
    'tenant-b',
    createScopedEventHandlers('tenant-b'),
  );
}, 60_000);

afterEach(async () => {
  await models.AgentsConnection.collection.deleteMany({});
  await tenantB.AgentsConnection.collection.deleteMany({});
});

afterAll(async () => {
  const { default: mongoose } = await import('mongoose');

  // The shared mongo module exits the process on any disconnect; this is the
  // intended end of the suite, not a lost connection.
  mongoose.connection.removeAllListeners('disconnected');
  await mongoose.disconnect();
  // Dropped after disconnecting, so no pending index build re-creates them.
  const cleanup = await mongoose
    .createConnection('mongodb://127.0.0.1:27017/admin?directConnection=true')
    .asPromise();
  await cleanup.useDb(DATABASE).dropDatabase();
  await cleanup.useDb(TENANT_B_DATABASE).dropDatabase();
  await cleanup.close();
});

describe('key sealing', () => {
  it('stores only a sealed key and opens it back to the plaintext', async () => {
    await models.AgentsConnection.upsertConnection('user-1', 'openai', {
      ...OPENAI,
      config: { ...OPENAI.config },
    });

    const stored = await rawDoc('user-1');
    const apiKey = stored?.connections[0].config.apiKey;

    expect(secretBox.isSealedSecret(apiKey)).toBe(true);
    expect(JSON.stringify(stored)).not.toContain('sk-openai-plain');
    expect(secretBox.openSecret(apiKey)).toBe('sk-openai-plain');
  });

  it('keeps an already-sealed key unchanged', async () => {
    const sealed = secretBox.sealSecret('sk-already-sealed');

    await models.AgentsConnection.upsertConnection('user-1', 'openai', {
      ...OPENAI,
      config: { apiKey: sealed },
    });

    expect((await rawDoc('user-1'))?.connections[0].config.apiKey).toBe(
      sealed,
    );
  });

  it('seals a legacy plaintext array entry on read and writes it back', async () => {
    await models.AgentsConnection.collection.insertOne({
      userId: 'user-1',
      connections: [OPENAI],
    });

    const read = await models.AgentsConnection.getConnections('user-1');
    const stored = await rawDoc('user-1');

    expect(secretBox.openSecret(read?.connections[0].config.apiKey)).toBe(
      'sk-openai-plain',
    );
    expect(
      secretBox.isSealedSecret(stored?.connections[0].config.apiKey),
    ).toBe(true);
  });

  it('fails closed without an encryption secret and stores nothing', async () => {
    const original = process.env.JWT_TOKEN_SECRET;
    delete process.env.JWT_TOKEN_SECRET;

    try {
      let isolated: IConnectionResolvers | undefined;
      let isolatedMongoose: typeof import('mongoose') | undefined;

      // A fresh module registry: the key cache starts empty without a secret.
      jest.isolateModules(() => {
        isolatedMongoose = jest.requireActual<typeof import('mongoose')>(
          'mongoose',
        );
        isolated = jest.requireActual<IConnectionResolvers>(
          '~/connectionResolvers',
        );
      });

      if (!isolated || !isolatedMongoose) {
        throw new Error('Isolated models did not load');
      }

      const unsealed = await isolated.generateModels('test');

      await expect(
        unsealed.AgentsConnection.upsertConnection('user-1', 'openai', {
          ...OPENAI,
          config: { ...OPENAI.config },
        }),
      ).rejects.toThrow('Agents key encryption is not configured.');
      expect(await rawDoc('user-1')).toBeNull();
      isolatedMongoose.connection.removeAllListeners('disconnected');
      await isolatedMongoose.disconnect();
    } finally {
      process.env.JWT_TOKEN_SECRET = original;
    }
  });
});

describe('explicit default provider', () => {
  it('is set when that provider is saved', async () => {
    await saveBoth('user-1');

    const doc = await models.AgentsConnection.setDefaultProvider(
      'user-1',
      'kimi',
    );

    expect(doc?.defaultProvider).toBe('kimi');
    expect((await rawDoc('user-1'))?.defaultProvider).toBe('kimi');
  });

  it('is refused for a provider that is not saved, leaving the document unchanged', async () => {
    await saveBoth('user-1');
    await models.AgentsConnection.setDefaultProvider('user-1', 'kimi');
    const before = await rawDoc('user-1');

    await expect(
      models.AgentsConnection.setDefaultProvider('user-1', 'grok'),
    ).resolves.toBeNull();
    expect(await rawDoc('user-1')).toEqual(before);
  });

  it('is cleared by an empty provider', async () => {
    await saveBoth('user-1');
    await models.AgentsConnection.setDefaultProvider('user-1', 'kimi');

    await models.AgentsConnection.setDefaultProvider('user-1', '');

    expect(await rawDoc('user-1')).not.toHaveProperty('defaultProvider');
  });

  it('is dropped when its connection is removed, and kept when another one is', async () => {
    await saveBoth('user-1');
    await models.AgentsConnection.setDefaultProvider('user-1', 'kimi');

    await models.AgentsConnection.removeConnection('user-1', 'openai');
    expect((await rawDoc('user-1'))?.defaultProvider).toBe('kimi');

    await models.AgentsConnection.upsertConnection('user-1', 'openai', {
      ...OPENAI,
      config: { ...OPENAI.config },
    });
    await models.AgentsConnection.removeConnection('user-1', 'kimi');
    const stored = await rawDoc('user-1');

    expect(stored).not.toHaveProperty('defaultProvider');
    expect(
      stored?.connections.map((entry: IAiAgentConnection) => entry.provider),
    ).toEqual(['openai']);
  });
});

describe('single-connection documents', () => {
  it('migrate when their provider becomes the default', async () => {
    await insertLegacy('user-1');

    const doc = await models.AgentsConnection.setDefaultProvider(
      'user-1',
      'openai',
    );
    const stored = await rawDoc('user-1');

    expect(doc?.defaultProvider).toBe('openai');
    expect(stored).not.toHaveProperty('connection');
    expect(stored?.defaultProvider).toBe('openai');
    expect(stored?.connections).toHaveLength(1);
    expect(
      secretBox.isSealedSecret(stored?.connections[0].config.apiKey),
    ).toBe(true);
    expect(secretBox.openSecret(stored?.connections[0].config.apiKey)).toBe(
      'sk-legacy-plain',
    );
  });

  it('stay unchanged when another provider is requested as default', async () => {
    await insertLegacy('user-1');
    const before = await rawDoc('user-1');

    await expect(
      models.AgentsConnection.setDefaultProvider('user-1', 'kimi'),
    ).resolves.toBeNull();
    expect(await rawDoc('user-1')).toEqual(before);
  });

  it('migrate on read: sealed key in the array and the old field removed', async () => {
    await insertLegacy('user-1');

    const read = await models.AgentsConnection.getConnections('user-1');
    const stored = await rawDoc('user-1');

    expect(read?.connections.map((entry) => entry.provider)).toEqual([
      'openai',
    ]);
    expect(stored).not.toHaveProperty('connection');
    expect(
      secretBox.isSealedSecret(stored?.connections[0].config.apiKey),
    ).toBe(true);
  });
});

describe('scoping', () => {
  it('never lets one user’s writes touch another user’s document', async () => {
    await saveBoth('user-1');
    await models.AgentsConnection.upsertConnection('user-2', 'kimi', {
      ...KIMI,
      config: { ...KIMI.config },
    });
    const otherBefore = await rawDoc('user-2');

    await models.AgentsConnection.setDefaultProvider('user-1', 'kimi');
    await models.AgentsConnection.removeConnection('user-1', 'openai');
    // user-2 has no openai connection, so it cannot become their default.
    await expect(
      models.AgentsConnection.setDefaultProvider('user-2', 'openai'),
    ).resolves.toBeNull();

    expect(await rawDoc('user-2')).toEqual(otherBefore);
  });

  it('keeps tenants in separate databases', async () => {
    await saveBoth('user-1');
    await models.AgentsConnection.setDefaultProvider('user-1', 'kimi');

    expect(await tenantB.AgentsConnection.getConnections('user-1')).toBeNull();
    await expect(
      tenantB.AgentsConnection.setDefaultProvider('user-1', 'kimi'),
    ).resolves.toBeNull();

    await tenantB.AgentsConnection.upsertConnection('user-1', 'openai', {
      ...OPENAI,
      config: { ...OPENAI.config },
    });
    await tenantB.AgentsConnection.removeConnection('user-1', 'openai');

    expect((await rawDoc('user-1'))?.defaultProvider).toBe('kimi');
    expect(await rawDoc('user-1', tenantB)).toBeNull();
  });
});
