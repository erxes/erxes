/**
 * AgentsConnection model — key sealing at rest.
 *
 * The guarantees under test:
 *
 * - `upsertConnection` seals `config.apiKey` before persisting — the raw
 *   `connections` array written to Mongo never contains the plaintext;
 * - an already-sealed key passes through unchanged (the resolver's
 *   keep-stored-key path reuses the stored envelope verbatim);
 * - `getConnections` lazily migrates legacy plaintext entries: it seals
 *   them and writes the sealed array back, best-effort;
 * - a missing encryption secret fails the write path closed — nothing is
 *   persisted in plaintext.
 */

import type { IAgentsConnectionModel } from '@/agents/db/models/Connection';
import { loadAgentsConnectionClass } from '@/agents/db/models/Connection';
import { isSealedSecret, openSecret, sealSecret } from '@/agents/secretBox';

process.env.JWT_TOKEN_SECRET ??= 'secretbox-test-secret';
import type { IModels } from '~/connectionResolvers';

process.env.JWT_TOKEN_SECRET ??= 'secretbox-test-secret';

interface IFakeMongooseModel {
  findOne: jest.Mock;
  findOneAndUpdate: jest.Mock;
  updateOne: jest.Mock;
  deleteOne: jest.Mock;
}

const buildModels = (doc: Record<string, unknown> | null) => {
  const fake: IFakeMongooseModel = {
    findOne: jest.fn(() => ({ lean: async () => doc })),
    findOneAndUpdate: jest.fn(async () => doc ?? { connections: [] }),
    updateOne: jest.fn(async () => ({})),
    deleteOne: jest.fn(async () => ({})),
  };

  const models = { AgentsConnection: fake } as unknown as IModels;
  const schema = loadAgentsConnectionClass(models);
  // schema.loadClass copies the class's static methods onto the schema —
  // invoke them without needing a live mongoose connection.
  const statics = schema.statics as unknown as IAgentsConnectionModel;

  return { fake, statics };
};

describe('AgentsConnection key sealing', () => {
  it('seals a plaintext apiKey before writing connections', async () => {
    const { fake, statics } = buildModels(null);

    await statics.upsertConnection('user-1', 'openai', {
      provider: 'openai',
      model: 'gpt-5',
      config: { apiKey: 'sk-plaintext-secret' },
    } as never);

    const update = fake.findOneAndUpdate.mock.calls[0][1] as {
      $set: { connections: { config: { apiKey: string } }[] };
    };
    const stored = update.$set.connections[0].config.apiKey;

    expect(stored).toMatch(/^enc:v1:/);
    expect(stored).not.toContain('sk-plaintext-secret');
    expect(openSecret(stored)).toBe('sk-plaintext-secret');
    expect(fake.updateOne).not.toHaveBeenCalled();
  });

  it('passes an already-sealed key through unchanged', async () => {
    const { fake, statics } = buildModels(null);
    const sealed = sealSecret('sk-existing');

    await statics.upsertConnection('user-1', 'openai', {
      provider: 'openai',
      model: 'gpt-5',
      config: { apiKey: sealed },
    } as never);

    const update = fake.findOneAndUpdate.mock.calls[0][1] as {
      $set: { connections: { config: { apiKey: string } }[] };
    };

    expect(update.$set.connections[0].config.apiKey).toBe(sealed);
  });

  it('lazily re-seals a legacy plaintext key on read and writes it back', async () => {
    const legacyDoc = {
      _id: 'conn-1',
      userId: 'user-1',
      connections: [
        {
          provider: 'openai',
          model: 'gpt-5',
          config: { apiKey: 'sk-legacy-plain' },
        },
      ],
    };
    const { fake, statics } = buildModels(legacyDoc);

    const doc = await statics.getConnections('user-1');

    const stored = doc?.connections[0]?.config?.apiKey;
    expect(isSealedSecret(stored)).toBe(true);
    expect(openSecret(stored)).toBe('sk-legacy-plain');

    // Write-back: the sealed array replaces the plaintext copy.
    expect(fake.updateOne).toHaveBeenCalledTimes(1);
    const writeBack = fake.updateOne.mock.calls[0][1] as {
      $set: { connections: { config: { apiKey: string } }[] };
    };
    expect(
      writeBack.$set.connections[0].config.apiKey,
    ).toMatch(/^enc:v1:/);
  });

  it('fails the write path closed when encryption is unconfigured', async () => {
    const original = process.env.JWT_TOKEN_SECRET;
    delete process.env.JWT_TOKEN_SECRET;

    try {
      // The key cache is per-module — reload both modules without the env.
      jest.resetModules();
      const { loadAgentsConnectionClass: freshLoader } = await import(
        '../db/models/Connection.js'
      );
      const fake: IFakeMongooseModel = {
        findOne: jest.fn(() => ({ lean: async () => null })),
        findOneAndUpdate: jest.fn(async () => null),
        updateOne: jest.fn(async () => ({})),
        deleteOne: jest.fn(async () => ({})),
      };
      const models = { AgentsConnection: fake } as unknown as IModels;
      const schema = freshLoader(models);
      const statics = schema.statics as unknown as IAgentsConnectionModel;

      await expect(
        statics.upsertConnection('user-1', 'openai', {
          provider: 'openai',
          model: 'gpt-5',
          config: { apiKey: 'sk-should-never-store' },
        } as never),
      ).rejects.toThrow('Agents key encryption is not configured.');
      expect(fake.findOneAndUpdate).not.toHaveBeenCalled();
    } finally {
      process.env.JWT_TOKEN_SECRET = original;
      jest.resetModules();
    }
  });
});
