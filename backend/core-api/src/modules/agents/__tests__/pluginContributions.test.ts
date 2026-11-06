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
  instructions: '# Pipeline analysis\n\nCount records per stage.',
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
    const preamble = pluginSkillPreamble('sales');
    expect(sales.description).toBe(pipelineSkill.description);
    expect(sales.instructions.startsWith(preamble)).toBe(true);
    expect(
      sales.instructions.indexOf(pipelineSkill.instructions),
    ).toBeGreaterThanOrEqual(preamble.length);
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
    expect(skills[0].instructions).toContain('salesStages');
    expect(skills[0].instructions).toContain('deals');
    expect(skills[0].instructions).not.toContain('cpDeals');
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
    // The rejection is reported once, naming the skill and why.
    expect(warn.mock.calls).toEqual([
      [expect.stringMatching(/"with-tool".*"sales".*tools/)],
    ]);
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
  });
});

describe('readAgentPluginMeta', () => {
  const store = new Map([
    [
      'erxesservice:config:sales',
      JSON.stringify({ meta: { agent: { skills: [pipelineSkill] } } }),
    ],
    ['erxesservice:config:frontline', JSON.stringify({ meta: {} })],
    ['erxesservice:config:broken', '{not json'],
  ]);

  beforeEach(() => {
    jest
      .mocked(redis.get)
      .mockImplementation(async (key: string) => store.get(key) ?? null);
  });

  it('reads each plugin’s own registration from service discovery', async () => {
    await expect(readAgentPluginMeta('sales')).resolves.toEqual({
      skills: [pipelineSkill],
    });
    await expect(readAgentPluginMeta('frontline')).resolves.toBeUndefined();
  });

  it('treats unreadable registrations as no declaration', async () => {
    await expect(readAgentPluginMeta('broken')).resolves.toBeUndefined();

    jest.mocked(redis.get).mockRejectedValueOnce(new Error('ECONNREFUSED'));
    await expect(readAgentPluginMeta('sales')).resolves.toBeUndefined();
  });
});
