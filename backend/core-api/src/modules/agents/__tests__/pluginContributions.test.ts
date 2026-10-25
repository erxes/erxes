import {
  buildAgentPluginContributions,
  pluginSkillPreamble,
  readAgentPluginMeta,
} from '@/agents/pluginContributions';

// The shared core-modules barrel loads Mongoose models built from the mocked
// utils; the agents module only needs the agent contract from it.
jest.mock('erxes-api-shared/core-modules', () =>
  jest.requireActual('erxes-api-shared/core-modules/agent'),
);
jest.mock('erxes-api-shared/utils', () => ({
  keyForConfig: (name: string) => `erxesservice:config:${name}`,
  redis: { get: jest.fn() },
}));

import { redis } from 'erxes-api-shared/utils';

const mockedRedisGet = redis.get as unknown as jest.Mock;

const SALES_OWNERS = new Map([
  ['query.deals', 'sales'],
  ['query.salesStages', 'sales'],
  ['query.cpDeals', 'sales'],
  ['mutation.cpDealsAdd', 'sales'],
  ['query.customers', 'core'],
]);

const pipelineSkill = {
  name: 'pipeline-analysis',
  description: 'Analyse deals by pipeline and stage.',
  instructions: '# Pipeline analysis\n\nCount deals per stage.',
  operations: ['salesStages', 'deals', 'cpDeals'],
};

let warn: jest.SpyInstance;

beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  warn.mockRestore();
});

describe('buildAgentPluginContributions', () => {
  it('namespaces skills and puts the precedence preamble before plugin text', async () => {
    const { skills } = await buildAgentPluginContributions(
      [
        { plugin: 'sales', agent: { skills: [pipelineSkill] } },
        {
          plugin: 'frontline',
          agent: {
            skills: [
              {
                name: 'inbox-triage',
                description: 'Triage conversations.',
                instructions: 'Group conversations by channel.',
              },
            ],
          },
        },
      ],
      SALES_OWNERS,
    );

    expect(skills.map(({ name }) => name)).toEqual([
      'frontline-inbox-triage',
      'sales-pipeline-analysis',
    ]);

    const sales = skills[1];
    expect(sales.description).toBe(pipelineSkill.description);
    expect(sales.instructions.startsWith(pluginSkillPreamble('sales'))).toBe(
      true,
    );
    expect(sales.instructions.indexOf('take precedence')).toBeLessThan(
      sales.instructions.indexOf('# Pipeline analysis'),
    );
    // Mastra inline skills are text: no scripts or extra files.
    expect(sales.scripts).toEqual([]);
    expect(sales.references).toEqual([]);
  });

  it('hides only operations the declaring plugin owns and drops hidden hints', async () => {
    const { skills, hiddenOperations } = await buildAgentPluginContributions(
      [
        {
          plugin: 'sales',
          agent: {
            skills: [pipelineSkill],
            hiddenOperations: {
              queries: ['cpDeals', 'customers'],
              mutations: ['cpDealsAdd'],
            },
          },
        },
      ],
      SALES_OWNERS,
    );

    expect([...hiddenOperations].sort()).toEqual([
      'mutation.cpDealsAdd',
      'query.cpDeals',
    ]);
    expect(skills[0].instructions).toContain(
      'Find these with searchGraphql before calling them: `salesStages`, `deals`.',
    );
    expect(skills[0].instructions).not.toContain('cpDeals');
    expect(warn).toHaveBeenCalledWith(
      '[agents] Ignored agent metadata from plugin "sales": cannot hide query "customers": the plugin does not own it',
    );
  });

  it('logs a rejected skill once with its reason and keeps valid skills', async () => {
    const sources = [
      {
        plugin: 'sales',
        agent: {
          skills: [
            { ...pipelineSkill, name: 'with-tool', tools: { run: {} } },
            pipelineSkill,
          ],
        },
      },
    ];

    const first = await buildAgentPluginContributions(sources, SALES_OWNERS);
    await buildAgentPluginContributions(sources, SALES_OWNERS);

    expect(first.skills.map(({ name }) => name)).toEqual([
      'sales-pipeline-analysis',
    ]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      '[agents] Ignored skill "with-tool" from plugin "sales": unsupported field(s) tools',
    );
  });

  it('rejects skills whose namespace or namespaced name is invalid', async () => {
    const { skills } = await buildAgentPluginContributions(
      [
        { plugin: 'Sales_API', agent: { skills: [pipelineSkill] } },
        {
          plugin: 'averyveryverylongpluginname',
          agent: { skills: [{ ...pipelineSkill, name: 'a'.repeat(40) }] },
        },
      ],
      SALES_OWNERS,
    );

    expect(skills).toEqual([]);
    expect(warn).toHaveBeenCalledWith(
      '[agents] Ignored agent metadata from plugin "Sales_API": skills need a plugin name of lowercase letters and digits',
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('exceeds 64 characters'),
    );
  });

  it('contributes nothing for plugins without agent metadata', async () => {
    const contributions = await buildAgentPluginContributions(
      [{ plugin: 'sales', agent: undefined }],
      SALES_OWNERS,
    );

    expect(contributions.skills).toEqual([]);
    expect(contributions.hiddenOperations.size).toBe(0);
  });
});

describe('readAgentPluginMeta', () => {
  it('reads the current registration from service discovery', async () => {
    mockedRedisGet.mockResolvedValueOnce(
      JSON.stringify({ meta: { agent: { skills: [pipelineSkill] } } }),
    );

    await expect(readAgentPluginMeta('sales')).resolves.toEqual({
      skills: [pipelineSkill],
    });
    expect(mockedRedisGet).toHaveBeenCalledWith('erxesservice:config:sales');
  });

  it('treats unreadable registrations as no declaration', async () => {
    mockedRedisGet.mockResolvedValueOnce('{not json');
    await expect(readAgentPluginMeta('sales')).resolves.toBeUndefined();

    mockedRedisGet.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    await expect(readAgentPluginMeta('sales')).resolves.toBeUndefined();
  });
});
