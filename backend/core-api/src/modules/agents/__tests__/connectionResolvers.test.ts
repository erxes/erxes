/**
 * BYOK connection resolver tests.
 *
 * The guarantees under test:
 *
 * - reads and writes are gated behind `agentsChat`; a failed permission
 *   check short-circuits before any model access;
 * - the connections query returns one masked entry per configured provider
 *   — the API key never appears in a response, only a `hasKey` flag;
 * - the upsert adds or replaces ONE provider's entry with the model always
 *   resolved server-side from the provider defaults (unless an explicit
 *   model is provided; re-saving refreshes a stale stored model), keeps
 *   that provider's stored key when the `apiKey` argument is omitted, and
 *   refuses to save an entry that carries no key;
 * - the remove deletes exactly one provider's entry;
 * - the models query fetches every configured provider's /models endpoint
 *   server-side with the stored keys and swallows per-provider failures.
 */

import { agentsConnectionsQueries } from '@/agents/graphql/resolvers/queries/connection';
import { agentsModelsQueries } from '@/agents/graphql/resolvers/queries/models';
import { agentsConnectionMutations } from '@/agents/graphql/resolvers/mutations/connection';
import type { IContext } from '~/connectionResolvers';

interface IFakeConnectionModel {
  getConnections: jest.Mock;
  upsertConnection: jest.Mock;
  removeConnection: jest.Mock;
}

const STORED_DOC = {
  _id: 'conn-1',
  userId: 'user-1',
  connections: [
    {
      provider: 'openai',
      model: 'gpt-5.6-luna',
      config: { apiKey: 'sk-openai' },
    },
    {
      provider: 'grok',
      model: 'grok-4.5',
      config: { apiKey: 'sk-grok' },
    },
  ],
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};

const buildContext = ({
  permissionAllowed = true,
  userId = 'user-1',
  storedDoc = STORED_DOC,
}: {
  permissionAllowed?: boolean;
  userId?: string;
  storedDoc?: typeof STORED_DOC | null;
} = {}) => {
  const checkPermission = jest.fn(async () => {
    if (!permissionAllowed) {
      throw new Error('Permission denied');
    }
  });

  const connectionModel: IFakeConnectionModel = {
    getConnections: jest.fn(async () => storedDoc),
    upsertConnection: jest.fn(
      async (actor: string, provider: string, connection: unknown) => {
        const base = storedDoc ?? {
          _id: 'conn-1',
          userId: actor,
          connections: [],
          updatedAt: undefined,
        };
        const entries = base.connections.filter(
          (entry: { provider: string }) => entry.provider !== provider,
        );

        return {
          ...base,
          userId: actor,
          connections: [...entries, connection],
          updatedAt: new Date('2026-01-03T00:00:00.000Z'),
        };
      },
    ),
    removeConnection: jest.fn(async () => undefined),
  };

  const ctx = {
    checkPermission,
    user: { _id: userId },
    models: { AgentsConnection: connectionModel },
  } as unknown as IContext;

  return { ctx, checkPermission, connectionModel };
};

describe('agentsConnections query', () => {
  it('checks agentsChat and returns every configured provider in masked shape', async () => {
    const { ctx, checkPermission, connectionModel } = buildContext();

    const result = await agentsConnectionsQueries.agentsConnections(
      undefined,
      undefined,
      ctx,
    );

    expect(checkPermission).toHaveBeenCalledWith('agentsChat');
    expect(connectionModel.getConnections).toHaveBeenCalledWith('user-1');
    expect(result).toEqual([
      {
        provider: 'openai',
        model: 'gpt-5.6-luna',
        hasKey: true,
        updatedAt: STORED_DOC.updatedAt,
      },
      {
        provider: 'grok',
        model: 'grok-4.5',
        hasKey: true,
        updatedAt: STORED_DOC.updatedAt,
      },
    ]);
    expect(JSON.stringify(result)).not.toContain('sk-openai');
    expect(JSON.stringify(result)).not.toContain('sk-grok');
  });

  it('returns an empty list when the acting user has no stored connections', async () => {
    const { ctx } = buildContext({ storedDoc: null });

    const result = await agentsConnectionsQueries.agentsConnections(
      undefined,
      undefined,
      ctx,
    );

    expect(result).toEqual([]);
  });

  it('short-circuits without touching the model when permission is denied', async () => {
    const { ctx, connectionModel } = buildContext({
      permissionAllowed: false,
    });

    await expect(
      agentsConnectionsQueries.agentsConnections(undefined, undefined, ctx),
    ).rejects.toThrow('Permission denied');
    expect(connectionModel.getConnections).not.toHaveBeenCalled();
  });
});

describe('agentsConnectionUpsert mutation', () => {
  it('adds a new provider entry with the provider default model on a fresh setup', async () => {
    const { ctx, checkPermission, connectionModel } = buildContext({
      storedDoc: null,
    });

    const result = await agentsConnectionMutations.agentsConnectionUpsert(
      undefined,
      { provider: 'kimi', apiKey: 'sk-kimi' },
      ctx,
    );

    expect(checkPermission).toHaveBeenCalledWith('agentsChat');
    expect(connectionModel.upsertConnection).toHaveBeenCalledWith(
      'user-1',
      'kimi',
      {
        provider: 'kimi',
        model: 'kimi-k3',
        config: { apiKey: 'sk-kimi' },
      },
    );
    expect(result).toMatchObject({
      provider: 'kimi',
      model: 'kimi-k3',
      hasKey: true,
    });
    expect(JSON.stringify(result)).not.toContain('sk-kimi');
  });

  it('keeps the stored key of the same provider when apiKey is omitted', async () => {
    const { ctx, connectionModel } = buildContext();

    await agentsConnectionMutations.agentsConnectionUpsert(
      undefined,
      { provider: 'openai' },
      ctx,
    );

    expect(connectionModel.upsertConnection).toHaveBeenCalledWith(
      'user-1',
      'openai',
      {
        provider: 'openai',
        model: 'gpt-5.6-luna',
        config: { apiKey: 'sk-openai' },
      },
    );
  });

  it('refreshes a stale stored model to the current provider default on re-save', async () => {
    // An entry saved before a default-model change must not pin the old
    // model forever: re-saving without an explicit model stores the current
    // default (openai → gpt-5.6-luna).
    const { ctx, connectionModel } = buildContext({
      storedDoc: {
        ...STORED_DOC,
        connections: [
          {
            provider: 'openai',
            model: 'gpt-5.5',
            config: { apiKey: 'sk-openai' },
          },
        ],
      },
    });

    await agentsConnectionMutations.agentsConnectionUpsert(
      undefined,
      { provider: 'openai', apiKey: 'sk-new' },
      ctx,
    );

    expect(connectionModel.upsertConnection).toHaveBeenCalledWith(
      'user-1',
      'openai',
      {
        provider: 'openai',
        model: 'gpt-5.6-luna',
        config: { apiKey: 'sk-new' },
      },
    );
  });

  it('accepts an explicit model override for the stored entry', async () => {
    const { ctx, connectionModel } = buildContext();

    await agentsConnectionMutations.agentsConnectionUpsert(
      undefined,
      { provider: 'openai', model: 'gpt-5.7-nova' },
      ctx,
    );

    expect(connectionModel.upsertConnection).toHaveBeenCalledWith(
      'user-1',
      'openai',
      {
        provider: 'openai',
        model: 'gpt-5.7-nova',
        config: { apiKey: 'sk-openai' },
      },
    );
  });

  it('replaces the stored key when a new apiKey is provided', async () => {
    const { ctx, connectionModel } = buildContext();

    await agentsConnectionMutations.agentsConnectionUpsert(
      undefined,
      { provider: 'openai', apiKey: 'sk-new' },
      ctx,
    );

    expect(connectionModel.upsertConnection).toHaveBeenCalledWith(
      'user-1',
      'openai',
      {
        provider: 'openai',
        model: 'gpt-5.6-luna',
        config: { apiKey: 'sk-new' },
      },
    );
  });

  it('requires a key for a provider that has none stored', async () => {
    const { ctx, connectionModel } = buildContext({ storedDoc: null });

    await expect(
      agentsConnectionMutations.agentsConnectionUpsert(
        undefined,
        { provider: 'openai' },
        ctx,
      ),
    ).rejects.toThrow('API key is required.');
    expect(connectionModel.upsertConnection).not.toHaveBeenCalled();
  });

  it('treats an empty-string apiKey as clearing the key and refuses to save a keyless entry', async () => {
    const { ctx, connectionModel } = buildContext();

    await expect(
      agentsConnectionMutations.agentsConnectionUpsert(
        undefined,
        { provider: 'openai', apiKey: '   ' },
        ctx,
      ),
    ).rejects.toThrow('API key is required.');
    expect(connectionModel.upsertConnection).not.toHaveBeenCalled();
  });

  it('rejects an unsupported provider before touching the model', async () => {
    const { ctx, connectionModel } = buildContext();

    await expect(
      agentsConnectionMutations.agentsConnectionUpsert(
        undefined,
        { provider: 'not-a-provider', apiKey: 'sk-new' },
        ctx,
      ),
    ).rejects.toThrow('Unsupported AI provider "not-a-provider".');
    expect(connectionModel.getConnections).not.toHaveBeenCalled();
    expect(connectionModel.upsertConnection).not.toHaveBeenCalled();
  });

  it('rejects cloudflare-ai-gateway, which is not offered on the BYOK surface', async () => {
    const { ctx, connectionModel } = buildContext();

    await expect(
      agentsConnectionMutations.agentsConnectionUpsert(
        undefined,
        {
          provider: 'cloudflare-ai-gateway',
          apiKey: 'sk-new',
        },
        ctx,
      ),
    ).rejects.toThrow('Unsupported AI provider "cloudflare-ai-gateway".');
    expect(connectionModel.getConnections).not.toHaveBeenCalled();
    expect(connectionModel.upsertConnection).not.toHaveBeenCalled();
  });

  it('short-circuits without touching the model when permission is denied', async () => {
    const { ctx, connectionModel } = buildContext({
      permissionAllowed: false,
    });

    await expect(
      agentsConnectionMutations.agentsConnectionUpsert(
        undefined,
        { provider: 'openai', apiKey: 'sk-new' },
        ctx,
      ),
    ).rejects.toThrow('Permission denied');
    expect(connectionModel.getConnections).not.toHaveBeenCalled();
    expect(connectionModel.upsertConnection).not.toHaveBeenCalled();
  });
});

describe('agentsConnectionRemove mutation', () => {
  it('checks agentsChat and removes exactly the given provider', async () => {
    const { ctx, checkPermission, connectionModel } = buildContext();

    const result = await agentsConnectionMutations.agentsConnectionRemove(
      undefined,
      { provider: 'grok' },
      ctx,
    );

    expect(checkPermission).toHaveBeenCalledWith('agentsChat');
    expect(connectionModel.removeConnection).toHaveBeenCalledWith(
      'user-1',
      'grok',
    );
    expect(result).toBe(true);
  });

  it('short-circuits without touching the model when permission is denied', async () => {
    const { ctx, connectionModel } = buildContext({
      permissionAllowed: false,
    });

    await expect(
      agentsConnectionMutations.agentsConnectionRemove(
        undefined,
        { provider: 'grok' },
        ctx,
      ),
    ).rejects.toThrow('Permission denied');
    expect(connectionModel.removeConnection).not.toHaveBeenCalled();
  });
});

describe('agentsModels query', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches every configured provider server-side with its stored key and returns sorted unique ids', async () => {
    const { ctx, checkPermission } = buildContext();
    const fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(
      async (input) =>
        ({
          ok: true,
          status: 200,
          json: async () => {
            if (String(input).includes('api.openai.com')) {
              return {
                data: [{ id: 'b-model' }, { id: 'a-model' }, { id: 'a-model' }],
              };
            }

            return { data: [{ id: 'grok-4.5' }, { id: 42 }] };
          },
        }) as Response,
    );

    const result = await agentsModelsQueries.agentsModels(
      undefined,
      undefined,
      ctx,
    );

    expect(checkPermission).toHaveBeenCalledWith('agentsChat');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.openai.com/v1/models',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer sk-openai',
          'x-api-key': 'sk-openai',
        }),
      }),
    );
    expect(result).toEqual([
      { provider: 'openai', models: ['a-model', 'b-model'] },
      { provider: 'grok', models: ['grok-4.5'] },
    ]);
    expect(JSON.stringify(result)).not.toContain('sk-openai');
  });

  it('leaves a failing provider out instead of failing the whole query', async () => {
    const { ctx } = buildContext();
    jest.spyOn(global, 'fetch').mockImplementation(async (input) => {
      if (String(input).includes('api.openai.com')) {
        return {
          ok: false,
          status: 401,
          json: async () => ({ error: 'bad key' }),
        } as Response;
      }

      return { ok: true, status: 200, json: async () => ({ data: [{ id: 'grok-4.5' }] }) } as Response;
    });

    const result = await agentsModelsQueries.agentsModels(
      undefined,
      undefined,
      ctx,
    );

    expect(result).toEqual([{ provider: 'grok', models: ['grok-4.5'] }]);
  });

  it('returns an empty list without fetching when nothing is configured', async () => {
    const { ctx } = buildContext({ storedDoc: null });
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('must not be called'));

    const result = await agentsModelsQueries.agentsModels(
      undefined,
      undefined,
      ctx,
    );

    expect(result).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('short-circuits without touching the model when permission is denied', async () => {
    const { ctx, connectionModel } = buildContext({
      permissionAllowed: false,
    });

    await expect(
      agentsModelsQueries.agentsModels(undefined, undefined, ctx),
    ).rejects.toThrow('Permission denied');
    expect(connectionModel.getConnections).not.toHaveBeenCalled();
  });
});

describe('sealed keys at rest', () => {
  it('reports hasKey=false for an envelope that can no longer be opened', async () => {
    const tampered = {
      ...STORED_DOC,
      connections: [
        {
          provider: 'openai',
          model: 'gpt-5.6-luna',
          // Malformed seal — wrong length tag fails to decrypt → no key.
          config: { apiKey: 'enc:v1:AAAA:AAAA:AAAA' },
        },
      ],
    };
    const { ctx } = buildContext({ storedDoc: tampered });

    const result = await agentsConnectionsQueries.agentsConnections(
      undefined,
      undefined,
      ctx,
    );

    expect(result).toEqual([
      {
        provider: 'openai',
        model: 'gpt-5.6-luna',
        hasKey: false,
        updatedAt: STORED_DOC.updatedAt,
      },
    ]);
  });

  it('keeps the stored (sealed) key when apiKey is omitted on upsert', async () => {
    const sealed = {
      ...STORED_DOC,
      connections: [
        {
          provider: 'openai',
          model: 'gpt-5.6-luna',
          config: { apiKey: 'enc:v1:previously-sealed' },
        },
      ],
    };
    const { ctx, connectionModel } = buildContext({ storedDoc: sealed });

    await agentsConnectionMutations.agentsConnectionUpsert(
      undefined,
      { provider: 'openai' },
      ctx,
    );

    const saved = connectionModel.upsertConnection.mock.calls[0][2] as {
      config: { apiKey: string };
    };
    // The stored envelope is reused verbatim — the model seals on write,
    // and a sealed value is never double-sealed.
    expect(saved.config.apiKey).toBe('enc:v1:previously-sealed');
  });
});
