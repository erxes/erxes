import { TTemplate } from 'erxes-api-shared/core-modules';
import { TRegisteredTemplate } from '@/template/registry';
import { IModels } from '~/connectionResolvers';
import { isTemplateAvailable } from '@/template/registry';
import {
  createTemplatePartsApi,
  installTemplate,
  splitTemplatePartType,
} from '@/template/db/utils';
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

const twoJourneys: TRegisteredTemplate = {
  ...template,
  pluginName: 'frontline',
  journeys: [
    ...template.journeys,
    { ...template.journeys[0], key: 'follow-up', name: 'Follow up' },
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
    AutomationFolders: {
      createFolder: jest
        .fn()
        .mockImplementation(async (doc) => ({ _id: 'folder-1', ...doc })),
      deleteOne: jest.fn().mockResolvedValue(undefined),
    },
  } as unknown as IModels;

  const partsApi = {
    create: jest.fn(
      async ({
        type,
        doc,
      }: {
        type: string;
        doc: Record<string, unknown>;
      }) => ({
        _id: `${type}-id`,
        refs: { pipelineId: 'p-1' },
        doc,
      }),
    ),
    remove: jest.fn(async () => ({ removed: true })),
  };

  return {
    models,
    created,
    partsApi,
    install: (input: {
      answers: Record<string, unknown>;
      template?: TRegisteredTemplate;
    }) =>
      installTemplate({
        models,
        template: { ...template, pluginName: 'frontline' },
        userId: 'u1',
        nodes,
        partsApi,
        ...input,
      }),
  };
};

describe('install', () => {
  it('refuses until every requirement is answered', async () => {
    const { install } = buildModels();

    await expect(
      install({
        answers: { brain: 'source' },
      }),
    ).rejects.toThrow('Answer every step first: Telegram bot');
  });

  it('creates the agent with the chosen connection and a draft automation', async () => {
    const { created, install, partsApi } = buildModels();

    const installation = await install({
      answers: { brain: 'source', bot: 'int-1' },
    });

    const agentCall = partsApi.create.mock.calls[0][0];
    expect(agentCall).toMatchObject({
      type: 'automations:aiAgent',
      userId: 'u1',
      doc: { name: 'Sales', connection: { provider: 'openai' } },
    });
    expect(created[0]).toMatchObject({
      status: 'draft',
      name: 'Answer and sell',
    });
    expect(
      (created[0] as { actions: { config: { aiAgentId: string } }[] })
        .actions[0].config.aiAgentId,
    ).toBe('automations:aiAgent-id');
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
      answers: { brain: 'source', bot: 'int-1' },
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

  it('saves workflows with every field the builder form requires', async () => {
    const { models, partsApi, created } = buildModels();
    const [journey] = template.journeys;

    await installTemplate({
      models,
      template: {
        ...template,
        pluginName: 'frontline',
        journeys: [
          {
            ...journey,
            flow: [
              {
                ...journey.flow[0],
                config: {
                  aiAgentId: '{{ parts.agent }}',
                  tools: [
                    { id: 'escalate', kind: 'handoff' },
                    { id: 'wait', kind: 'helper' },
                  ],
                },
                connects: { escalate: 2, wait: 'wait' },
              },
              journey.flow[1],
            ],
            workflows: [
              {
                key: 'wait',
                name: 'Wait a bit',
                description: 'Waits before answering.',
                inputs: { minutes: '' },
                flow: [
                  {
                    order: 1,
                    type: 'delay',
                    config: { value: '1', type: 'hour' },
                  },
                ],
              },
            ],
          },
        ],
      },
      answers: { brain: 'source', bot: 'int-1' },
      userId: 'u1',
      nodes,
      partsApi,
    });

    const [workflow] = (created[0] as { workflows: Record<string, unknown>[] })
      .workflows;

    // Without these the builder refuses to save, so it can never be switched on
    expect(workflow).toMatchObject({
      automationId: '',
      name: 'Wait a bit',
      description: 'Waits before answering.',
    });
  });

  it('removes what it created when a step fails', async () => {
    const { models, install, partsApi } = buildModels({ failAutomation: true });

    await expect(
      install({
        answers: { brain: 'source', bot: 'int-1' },
        template: twoJourneys,
      }),
    ).rejects.toThrow('save failed');

    expect(partsApi.remove).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'automations:aiAgent' }),
    );
    expect(models.TemplateInstallations.create).not.toHaveBeenCalled();
    expect(models.AutomationFolders.deleteOne).toHaveBeenCalledWith({
      _id: 'folder-1',
    });
  });

  it('files every automation in one folder named after the template', async () => {
    const { models, created, install } = buildModels();

    const installation = await install({
      answers: { brain: 'source', bot: 'int-1' },
      template: twoJourneys,
    });

    expect(models.AutomationFolders.createFolder).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Sales employee',
        installationId: installation._id,
        createdBy: 'u1',
      }),
    );
    expect(created).toHaveLength(2);
    expect(created.every((doc) => doc.folderId === 'folder-1')).toBe(true);
  });

  it('makes no folder for a lone automation', async () => {
    const { models, created, install } = buildModels();

    await install({ answers: { brain: 'source', bot: 'int-1' } });

    expect(models.AutomationFolders.createFolder).not.toHaveBeenCalled();
    expect(created[0]).not.toHaveProperty('folderId');
  });

  it('lists a segment no journey reads', async () => {
    const { partsApi, install } = buildModels();

    const installation = await install({
      answers: {},
      template: {
        id: 'new-customers',
        version: 1,
        name: 'New customers',
        pluginName: 'core',
        requirements: [],
        parts: [
          {
            key: 'segment',
            type: 'core:segments.segment',
            defaults: { name: 'New customers' },
          },
        ],
        journeys: [],
      },
    });

    expect(partsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'core:segments.segment', listed: true }),
    );
    expect(installation.parts).toEqual([
      expect.objectContaining({ key: 'segment', listed: true }),
    ]);
  });

  it('creates a plugin part through its owner and reads what came with it', async () => {
    const { models, created, partsApi } = buildModels();
    const withDesk = {
      ...template,
      pluginName: 'frontline',
      parts: [
        ...template.parts,
        {
          key: 'desk',
          type: 'frontline:tickets.pipeline',
          defaults: { name: 'Complaints' },
        },
      ],
      journeys: [
        {
          ...template.journeys[0],
          flow: [
            {
              ...template.journeys[0].flow[0],
              config: {
                ...template.journeys[0].flow[0].config,
                pipelineId: '{{ parts.desk.pipelineId }}',
              },
            },
            template.journeys[0].flow[1],
          ],
        },
      ],
    };

    const installation = await installTemplate({
      models,
      template: withDesk,
      answers: { brain: 'source', bot: 'int-1' },
      userId: 'u1',
      nodes,
      partsApi,
    });

    expect(partsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'frontline:tickets.pipeline',
        doc: { name: 'Complaints' },
      }),
    );
    expect(installation.parts).toContainEqual({
      key: 'desk',
      type: 'frontline:tickets.pipeline',
      _id: 'frontline:tickets.pipeline-id',
      refs: { pipelineId: 'p-1' },
    });
    expect(
      (created[0] as { actions: { config: { pipelineId: string } }[] })
        .actions[0].config.pipelineId,
    ).toBe('p-1');
  });
});

describe('splitTemplatePartType', () => {
  it('keeps the whole part type its owner registered', () => {
    expect(splitTemplatePartType('frontline:tickets.pipeline')).toEqual({
      pluginName: 'frontline',
      partType: 'tickets.pipeline',
    });
    expect(splitTemplatePartType('frontline:forms.rating').partType).toBe(
      'forms.rating',
    );
  });
});

describe('core segment part', () => {
  it('lists a delivered segment and keeps it on removal', async () => {
    const createSegment = jest.fn(async () => ({ _id: 'seg-2' }));
    const removeSegments = jest.fn();
    const api = createTemplatePartsApi(
      { Segments: { createSegment, removeSegments } } as unknown as IModels,
      'test',
    );

    await api.create({
      type: 'core:segments.segment',
      doc: { name: 'New customers' },
      userId: 'u1',
      listed: true,
    });
    expect(createSegment).toHaveBeenCalledWith({ name: 'New customers' }, 'u1');

    await expect(
      api.remove({
        key: 'segment',
        type: 'core:segments.segment',
        _id: 'seg-2',
        listed: true,
      }),
    ).resolves.toEqual({ removed: false, reason: 'A listed segment stays' });
    expect(removeSegments).not.toHaveBeenCalled();
  });

  it('creates the segment owned by the automations and removes it once', async () => {
    const createSegment = jest.fn(async () => ({ _id: 'seg-1' }));
    const removeSegments = jest.fn(async () => ({}));
    const exists = jest
      .fn()
      .mockResolvedValueOnce({ _id: 'seg-1' })
      .mockResolvedValueOnce(null);
    const api = createTemplatePartsApi(
      {
        Segments: { createSegment, removeSegments, exists },
      } as unknown as IModels,
      'test',
    );
    const root = { kind: 'group', conjunction: 'or', children: [] };

    await expect(
      api.create({
        type: 'core:segments.segment',
        doc: { contentType: 'sales:pos.orders', root },
        userId: 'u1',
      }),
    ).resolves.toEqual({ _id: 'seg-1' });
    expect(createSegment).toHaveBeenCalledWith(
      { contentType: 'sales:pos.orders', root, ownedBy: 'automation' },
      'u1',
    );

    const part = {
      key: 'settled',
      type: 'core:segments.segment',
      _id: 'seg-1',
    };
    await api.remove(part);
    await api.remove(part);
    expect(removeSegments).toHaveBeenCalledTimes(1);
  });
});
