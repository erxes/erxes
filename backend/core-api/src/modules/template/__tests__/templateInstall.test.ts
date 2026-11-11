import { TTemplate } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { isTemplateAvailable } from '@/template/registry';
import { installTemplate } from '@/template/db/models/Installations';
import { findFlowReferenceIssues } from '@/automations/utils/automationGraph';

// What automations declares for these node types
const nodes = new Map([
  [
    'frontline:telegram.messages',
    { isCustom: true, label: 'Telegram Message', icon: 'IconBrandTelegram' },
  ],
  ['aiAgent', { label: 'AI agent', icon: 'IconSparkles' }],
  ['delay', { label: 'Delay', icon: 'IconClock' }],
]);

const template: TTemplate = {
  id: 'sales',
  version: 2,
  name: 'Sales employee',
  requirements: [
    {
      key: 'brain',
      kind: 'automations:aiAgent',
      label: 'AI connection',
      fills: [
        {
          target: 'part',
          part: 'agent',
          path: 'connection',
          from: 'connection',
        },
      ],
    },
    {
      key: 'bot',
      kind: 'frontline:telegram.bot',
      label: 'Telegram bot',
      fills: [{ target: 'trigger', journey: 'chat', path: 'integrationId' }],
    },
  ],
  parts: [
    { key: 'agent', type: 'automations:aiAgent', defaults: { name: 'Sales' } },
  ],
  journeys: [
    {
      key: 'chat',
      name: 'Answer and sell',
      trigger: { type: 'frontline:telegram.messages' },
      flow: [
        {
          order: 1,
          type: 'aiAgent',
          config: {
            aiAgentId: '{{ parts.agent }}',
            tools: [{ id: 'escalate', kind: 'handoff' }],
          },
          connects: { escalate: 2 },
        },
        { order: 2, type: 'delay', config: { value: '1', type: 'hour' } },
      ],
    },
  ],
};

describe('isTemplateAvailable', () => {
  const nodeTypes = new Set([
    'frontline:telegram.messages',
    'aiAgent',
    'delay',
  ]);

  it('needs every node type and an owner for every requirement', () => {
    expect(
      isTemplateAvailable(template, {
        nodeTypes,
        plugins: new Set(['frontline']),
      }),
    ).toBe(true);
    expect(
      isTemplateAvailable(template, { nodeTypes, plugins: new Set() }),
    ).toBe(false);
    expect(
      isTemplateAvailable(template, {
        nodeTypes: new Set(['aiAgent']),
        plugins: new Set(['frontline']),
      }),
    ).toBe(false);
  });
});

const buildModels = ({ failAutomation = false } = {}) => {
  const created: Record<string, unknown>[] = [];
  const models = {
    AiAgents: {
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'source',
          connection: { provider: 'openai', config: { apiKey: 'sk-secret' } },
        }),
      }),
      createAgent: jest.fn().mockImplementation(async (doc) => doc),
      removeAgent: jest.fn().mockResolvedValue({ success: true }),
      exists: jest.fn().mockResolvedValue(true),
    },
    Automations: {
      createAutomation: jest.fn().mockImplementation(async (doc) => {
        if (failAutomation) throw new Error('save failed');
        created.push(doc);
        // Automation ids are ObjectIds
        return { _id: { toString: () => 'auto-1' } };
      }),
      removeAutomations: jest.fn().mockResolvedValue(undefined),
      countDocuments: jest.fn().mockResolvedValue(0),
    },
    TemplateInstallations: {
      create: jest.fn().mockImplementation(async (doc) => doc),
      findOne: jest.fn(),
      deleteOne: jest.fn(),
    },
  } as unknown as IModels;

  return {
    models,
    created,
    install: (input: { answers: Record<string, unknown> }) =>
      installTemplate({
        models,
        template: { ...template, pluginName: 'frontline' },
        userId: 'u1',
        nodes,
        ...input,
      }),
  };
};

describe('install', () => {
  it('refuses until every requirement is answered', async () => {
    const { install } = buildModels();

    await expect(
      install({
        pluginName: 'frontline',
        templateId: 'sales',
        answers: { brain: 'source' },
        userId: 'u1',
      }),
    ).rejects.toThrow('Answer every step first: Telegram bot');
  });

  it('creates the agent with the chosen connection and a draft automation', async () => {
    const { models, created, install } = buildModels();

    const installation = await install({
      pluginName: 'frontline',
      templateId: 'sales',
      answers: { brain: 'source', bot: 'int-1' },
      userId: 'u1',
    });

    const agentDoc = (models.AiAgents.createAgent as jest.Mock).mock
      .calls[0][0];
    expect(agentDoc).toMatchObject({
      name: 'Sales',
      connection: { provider: 'openai' },
    });
    expect(created[0]).toMatchObject({
      status: 'draft',
      name: 'Answer and sell',
    });
    expect(
      (created[0] as { actions: { config: { aiAgentId: string } }[] })
        .actions[0].config.aiAgentId,
    ).toBe(agentDoc._id);
    expect(installation).toMatchObject({
      templateId: 'sales',
      version: 2,
      answers: { brain: 'source', bot: 'int-1' },
      automationIds: { chat: 'auto-1' },
    });
    expect(JSON.stringify(installation)).not.toContain('sk-secret');
  });

  it('saves nodes the builder draws and the engine runs as declared', async () => {
    const { created, install } = buildModels();

    await install({
      pluginName: 'frontline',
      templateId: 'sales',
      answers: { brain: 'source', bot: 'int-1' },
      userId: 'u1',
    });

    const automation = created[0] as {
      triggers: { isCustom: boolean; label: string; actionId: string }[];
      actions: {
        id: string;
        label: string;
        icon: string;
        config: { optionalConnects?: Record<string, string>[] };
      }[];
    };
    const [agent, delay] = automation.actions;

    // Without isCustom the trigger runs and draws as a segment trigger
    expect(automation.triggers[0]).toMatchObject({
      isCustom: true,
      label: 'Telegram Message',
      actionId: agent.id,
    });
    expect(agent.config.optionalConnects).toEqual([
      { sourceId: agent.id, optionalConnectId: 'escalate', actionId: delay.id },
    ]);
    expect(delay).toMatchObject({ label: 'Delay', icon: 'IconClock' });
    expect(
      findFlowReferenceIssues(
        automation as unknown as Parameters<typeof findFlowReferenceIssues>[0],
      ).size,
    ).toBe(0);
  });

  it('removes what it created when a step fails', async () => {
    const { models, install } = buildModels({ failAutomation: true });

    await expect(
      install({
        pluginName: 'frontline',
        templateId: 'sales',
        answers: { brain: 'source', bot: 'int-1' },
        userId: 'u1',
      }),
    ).rejects.toThrow('save failed');

    expect(models.AiAgents.removeAgent).toHaveBeenCalledTimes(1);
    expect(models.TemplateInstallations.create).not.toHaveBeenCalled();
  });
});
