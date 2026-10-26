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
  buildAgentsInstructions,
  buildBaseAgentsAgent,
  buildFallbackAgentsModelEntry,
  buildAgentsModelSettings,
  DEFAULT_INSTRUCTIONS,
  resolveAgentsModelEntry,
} from '@/agents/agent';
import { buildCodeModeAddition } from '@/agents/codeMode';
import { listAgentPluginSkills } from '@/agents/graphqlTools';
import { buildAgentPluginContributions } from '@/agents/pluginContributions';
import { REPORT_CREATION_SKILL } from '@/agents/skills/reportCreation';
import { getProviderDefaultModel } from '@/agents/providers';

jest.mock('~/connectionResolvers', () => ({
  generateModels: jest.fn(),
}));

/** The per-run callbacks the production agent is constructed with. */
interface IRunConfig {
  tools(run: {
    requestContext: { get(key: string): unknown };
  }): Promise<Record<string, unknown>>;
  instructions(run: {
    requestContext: { get(key: string): unknown };
  }): Promise<string>;
  skills(run: {
    requestContext: { get(key: string): unknown };
  }): Promise<unknown[]>;
}

let mockAgentConfig: IRunConfig | undefined;
// Mastra's Agent pulls in ESM-only packages jest cannot load. Only the
// container is replaced: it records the configuration buildBaseAgentsAgent
// passes, whose tools/instructions callbacks are the production code.
jest.mock('@mastra/core/agent', () => ({
  Agent: class {
    constructor(config: IRunConfig) {
      mockAgentConfig = config;
    }
  },
}));
const capturedAgentConfig = (): IRunConfig | undefined => mockAgentConfig;
// The plugin catalog comes from service discovery (covered by
// pluginSkills.test.ts and the real-agent fixture); here it is fixed so the
// test sees what the agent mounts from it. Every other GraphQL tool is real.
jest.mock('@/agents/graphqlTools', () => ({
  ...jest.requireActual('@/agents/graphqlTools'),
  listAgentPluginSkills: jest.fn(async () => []),
}));
// Memory is only handed through to the (replaced) Agent container.
const mockMemory = Object.create(null);
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
        buildAgentsModelSettings('kimi-code', thinkingLevel, 'kimi-for-coding')
          .maxOutputTokens - thinking.budgetTokens,
      ).toBe(16384);
    },
  );
});

describe('what every run mounts', () => {
  const BASE_TOOLS = [
    'askUser',
    'callGraphql',
    'createArtifact',
    'findPages',
    'readFile',
    'searchGraphql',
  ];
  /** Builds the production agent and returns its per-run callbacks. */
  const buildRunConfig = async () => {
    mockAgentConfig = undefined;
    await buildBaseAgentsAgent({ memory: mockMemory });
    const config = capturedAgentConfig();
    if (!config) throw new Error('The agent was not constructed');
    return config;
  };
  const runWith = (codeModeEnabled: boolean) => ({
    requestContext: contextWith({ codeModeEnabled }),
  });

  it('composes the base prompt, the report skill and today’s date, adding code mode only when given', () => {
    const now = new Date('2026-10-26T09:30:00.000Z');
    const plain = buildAgentsInstructions(now);

    expect(plain.startsWith(DEFAULT_INSTRUCTIONS)).toBe(true);
    expect(plain).toContain(REPORT_CREATION_SKILL.instructions);
    expect(plain).toContain('2026-10-26');
    expect(plain).not.toContain('CODE MODE ADDITION');
    expect(buildAgentsInstructions(now, 'CODE MODE ADDITION')).toContain(
      'CODE MODE ADDITION',
    );
  });

  it('mounts the base tools on every run and the code-mode tool only when the tenant enables it', async () => {
    const config = await buildRunConfig();
    const { tool } = await buildCodeModeAddition();

    expect(Object.keys(await config.tools(runWith(false))).sort()).toEqual(
      BASE_TOOLS,
    );
    expect(Object.keys(await config.tools(runWith(true))).sort()).toEqual(
      [...BASE_TOOLS, tool.id].sort(),
    );
  });

  it('mounts the report skill in every run and code-mode instructions only when enabled', async () => {
    const config = await buildRunConfig();
    const { instructions } = await buildCodeModeAddition();
    const plain = await config.instructions(runWith(false));
    const withCode = await config.instructions(runWith(true));

    expect(plain).toContain(REPORT_CREATION_SKILL.instructions);
    expect(withCode).toContain(REPORT_CREATION_SKILL.instructions);
    expect(plain).not.toContain(instructions);
    expect(withCode).toContain(instructions);
  });

  it('mounts the reachable plugins’ skills on every run, outside the instructions', async () => {
    const pluginText = 'Count deals per stage and report each currency.';
    const { skills } = await buildAgentPluginContributions(
      [
        {
          plugin: 'sales',
          agent: {
            skills: [
              {
                name: 'pipeline-analysis',
                description: 'Analyse deals by pipeline and stage.',
                instructions: pluginText,
              },
            ],
          },
        },
      ],
      new Map(),
    );
    jest.mocked(listAgentPluginSkills).mockResolvedValue(skills);
    const config = await buildRunConfig();

    for (const codeModeEnabled of [false, true]) {
      const run = runWith(codeModeEnabled);

      expect(await config.skills(run)).toEqual(skills);
      expect(await config.instructions(run)).not.toContain(pluginText);
    }
  });
});
