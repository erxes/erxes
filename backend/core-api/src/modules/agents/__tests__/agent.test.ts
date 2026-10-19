/**
 * Dynamic model-entry resolution contract tests.
 *
 * Regression coverage for a production crash: Mastra resolves the base
 * agent's dynamic `model` callback when wrapping/registering the agent
 * (`new DurableAgent`), with no RequestContext identity — the callback
 * threw `Agents request context is missing identity.`, failing runtime
 * creation and crashing read paths such as the thread list. Resolutions
 * without an identity must return the inert construction fallback instead
 * of throwing; real runs still resolve the acting user's BYOK credentials.
 */

import {
  buildFallbackAgentsModelEntry,
  buildAgentsModelSettings,
  DEFAULT_INSTRUCTIONS,
  resolveAgentsModelEntry,
} from '@/agents/agent';
import { getProviderDefaultModel } from '@/agents/providers';

jest.mock('~/connectionResolvers', () => ({
  generateModels: jest.fn(),
}));
jest.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: jest.fn(() =>
    jest.fn(() => ({
      specificationVersion: 'v3',
      provider: 'anthropic',
      modelId: 'kimi-for-coding',
    })),
  ),
}));

import { generateModels } from '~/connectionResolvers';

const mockedGenerateModels = generateModels as jest.MockedFunction<
  typeof generateModels
>;

const getConnectionsMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  getConnectionsMock.mockResolvedValue({
    connections: [
      {
        provider: 'openai',
        model: 'gpt-5.6-luna',
        config: { apiKey: 'sk-test' },
      },
    ],
  });
  mockedGenerateModels.mockResolvedValue({
    AgentsConnection: { getConnections: getConnectionsMock },
  } as unknown as Awaited<ReturnType<typeof generateModels>>);
});

const contextWith = (values: Record<string, unknown>) => ({
  get(key: string): unknown {
    return values[key];
  },
});

describe('resolveAgentsModelEntry', () => {
  it('returns the inert fallback when there is no request context', async () => {
    const entries = await resolveAgentsModelEntry(undefined);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.model).toMatchObject({
      id: `openai/${getProviderDefaultModel('openai')}`,
      apiKey: '',
    });
    expect(generateModels).not.toHaveBeenCalled();
  });

  it('returns the inert fallback for the identity-less construction context', async () => {
    // This is the exact shape Mastra passes at wrap/registration time:
    // a context object whose identity getters yield nothing.
    const entries = await resolveAgentsModelEntry(
      contextWith({
        subdomain: undefined,
        userId: undefined,
        provider: undefined,
        model: undefined,
      }),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]?.model).toMatchObject({ apiKey: '' });
    expect(generateModels).not.toHaveBeenCalled();
  });

  it('resolves real-run credentials from the stamped snapshot', async () => {
    const entries = await resolveAgentsModelEntry(
      contextWith({
        subdomain: 'tenant',
        userId: 'user-1',
        provider: 'openai',
        model: 'gpt-x',
        thinkingLevel: 'high',
        codeModeEnabled: false,
      }),
    );

    expect(mockedGenerateModels).toHaveBeenCalledWith('tenant');
    expect(getConnectionsMock).toHaveBeenCalledWith('user-1');
    expect(entries).toHaveLength(1);
    expect(entries[0]?.model).toMatchObject({
      id: 'openai/gpt-x',
      apiKey: 'sk-test',
    });
    expect(entries[0]?.providerOptions).toBeDefined();
  });

  it('rejects a stamped run missing provider/model instead of mis-resolving', async () => {
    await expect(
      resolveAgentsModelEntry(
        contextWith({ subdomain: 'tenant', userId: 'user-1' }),
      ),
    ).rejects.toThrow('Agents request context is missing provider/model.');
  });
});

describe('buildFallbackAgentsModelEntry', () => {
  it('builds a credential-less native entry with no I/O', async () => {
    const entries = await buildFallbackAgentsModelEntry();

    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual({
      model: {
        id: `openai/${getProviderDefaultModel('openai')}`,
        apiKey: '',
        headers: {},
      },
    });
    expect(generateModels).not.toHaveBeenCalled();
  });
});

describe('model temperature', () => {
  it('omits temperature for kimi so the Moonshot default applies', () => {
    expect(buildAgentsModelSettings('kimi', 'off')).not.toHaveProperty(
      'temperature',
    );
  });

  it.each(['openai', 'grok', 'kimi-code'])(
    'pins temperature to 0.2 for %s',
    (provider) => {
      expect(buildAgentsModelSettings(provider, 'off').temperature).toBe(0.2);
    },
  );
});

describe('artifact output allowance', () => {
  it.each(['openai', 'grok', 'kimi', 'kimi-code'])(
    'gives %s room for a complete report',
    (provider) => {
      expect(buildAgentsModelSettings(provider, 'off').maxOutputTokens).toBe(
        16384,
      );
    },
  );

  it.each(['minimal', 'low', 'medium', 'high'] as const)(
    'keeps visible output headroom with %s thinking',
    async (thinkingLevel) => {
      getConnectionsMock.mockResolvedValue({
        connections: [
          {
            provider: 'kimi-code',
            model: 'kimi-for-coding',
            config: { apiKey: 'test-key' },
          },
        ],
      });
      const entries = await resolveAgentsModelEntry(
        contextWith({
          subdomain: 'tenant',
          userId: 'user-1',
          provider: 'kimi-code',
          model: 'kimi-for-coding',
          thinkingLevel,
        }),
      );
      const thinking = entries[0].providerOptions?.anthropic?.thinking;
      if (
        !thinking ||
        typeof thinking !== 'object' ||
        !('budgetTokens' in thinking) ||
        typeof thinking.budgetTokens !== 'number'
      )
        throw new Error('Missing thinking budget');
      expect(
        buildAgentsModelSettings('kimi-code', thinkingLevel).maxOutputTokens -
          thinking.budgetTokens,
      ).toBe(16384);
    },
  );
});

describe('base instructions', () => {
  it('uses HTML for every reply and preserves the record-token contract inside HTML', () => {
    expect(DEFAULT_INSTRUCTIONS).toContain(
      'every user-facing reply is rendered HTML',
    );
    expect(DEFAULT_INSTRUCTIONS).toContain(
      'Write assistant text directly as semantic HTML',
    );
    expect(DEFAULT_INSTRUCTIONS).toContain(
      'Put tokens in HTML text nodes only',
    );
    expect(DEFAULT_INSTRUCTIONS).toContain(
      'scripts and external resources are not',
    );
    expect(DEFAULT_INSTRUCTIONS).toContain(
      'Text formatting never creates a file or a download button',
    );
    expect(DEFAULT_INSTRUCTIONS).toContain(
      'use createArtifact only to deliver an actual report',
    );
    expect(DEFAULT_INSTRUCTIONS).not.toContain('html artifact <title>');
    expect(DEFAULT_INSTRUCTIONS).not.toContain(
      'tokens work only in plain prose',
    );
  });
  it('contains the lookup discipline and reference-link rules', () => {
    expect(DEFAULT_INSTRUCTIONS).toContain(
      'Never call a find or list tool with an empty or null filter',
    );
    expect(DEFAULT_INSTRUCTIONS).toContain(
      'use a relation lookup tool when one is available',
    );
    expect(DEFAULT_INSTRUCTIONS).toContain('check for duplicates');
    expect(DEFAULT_INSTRUCTIONS).toContain(
      'never write or alter a record id, label, URL',
    );
  });

  it('instructs findPages page-token navigation over prose directions', () => {
    expect(DEFAULT_INSTRUCTIONS).toContain(
      "call findPages and answer with that page's reference token",
    );
    expect(DEFAULT_INSTRUCTIONS).toContain(
      'never list tools, tool ids, API names or permission names',
    );
    expect(DEFAULT_INSTRUCTIONS).toContain(
      'The application owns the displayed name and destination;',
    );
  });
});
