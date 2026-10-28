import { TAutomationFlowDraft } from '../automationGraph';
import {
  checkAutomationGraph,
  prepareAutomationFlow,
} from '../automationGraphCheck';

const mockSendCoreModuleProducer = jest.fn();
const mockResolveAlignedFrom = jest.fn();
const segmentTypes: Record<string, string> = {
  'seg-customers': 'core:contacts.customers',
  'seg-vip': 'core:contacts.customers',
  'seg-deals': 'sales:sales.deals',
};
const verifiedSenders = ['info@erxes.io'];

jest.mock('erxes-api-shared/utils', () => ({
  ...jest.requireActual('erxes-api-shared/utils'),
  getPlugins: jest.fn(async () => ['core', 'sales']),
  sendCoreModuleProducer: (...args: unknown[]) =>
    mockSendCoreModuleProducer(...args),
}));

jest.mock('~/connectionResolvers', () => ({
  generateModels: jest.fn(async () => ({
    Segments: {
      find: ({ _id }: { _id: { $in: string[] } }) => ({
        lean: async () =>
          _id.$in
            .filter((id) => id in segmentTypes)
            .map((id) => ({ _id: id, contentType: segmentTypes[id] })),
      }),
    },
  })),
}));

jest.mock('~/utils/email/senders', () => ({
  resolveAlignedFrom: () => mockResolveAlignedFrom(),
  isSenderAllowed: async (_models: unknown, email: string) =>
    verifiedSenders.includes(email.toLowerCase()),
}));

jest.mock('../../graphql/resolvers/utils/queriesUtils', () => ({
  getAutomationConstants: jest.fn(async () => ({
    triggersConst: [
      {
        type: 'core:contacts.customers',
        label: 'Customer',
        description: 'Start with customers',
        icon: 'IconUsers',
      },
    ],
    actionsConst: [
      {
        type: 'sendEmail',
        label: 'Send Email',
        description: 'Send Email',
        icon: 'IconMailFast',
        configJsonSchema: { type: 'object' },
      },
      {
        type: 'sales:sales.deals.create',
        pluginName: 'sales',
        configJsonSchema: { type: 'object' },
      },
    ],
  })),
}));

const validEmail = {
  subject: 'Hi',
  toEmailsPlaceHolders: '{{ primaryEmail }}',
  replyToEmail: 'info@erxes.io',
};

const flow = (
  status: TAutomationFlowDraft['status'],
  email: Record<string, unknown> = validEmail,
  triggerConfig: { contentId?: string; event?: string; segmentId?: string } = {
    contentId: 'seg-customers',
  },
): TAutomationFlowDraft => ({
  status,
  triggers: [
    {
      id: 't1',
      type: 'core:contacts.customers',
      actionId: 'a1',
      config: {
        reEnrollment: false,
        reEnrollmentRules: [],
        dateConfig: {},
        contentId: '',
        ...triggerConfig,
      },
    },
  ],
  actions: [
    { id: 'a1', type: 'sendEmail', nextActionId: 'a2', config: email },
    { id: 'a2', type: 'sales:sales.deals.create', config: { stageId: 's1' } },
  ],
  workflows: [],
});

const report = (next: TAutomationFlowDraft) =>
  checkAutomationGraph('tenant', { next, scope: 'report' });

const issuesOf = async (next: TAutomationFlowDraft) =>
  (await report(next)).issues.map(({ nodeId, details }) => [
    nodeId,
    details?.map(({ path, message }) => `${path}: ${message}`),
  ]);

beforeEach(() => {
  mockSendCoreModuleProducer.mockReset();
  mockSendCoreModuleProducer.mockResolvedValue([
    { id: 'a2', type: 'sales:sales.deals.create', status: 'valid' },
  ]);
  mockResolveAlignedFrom.mockReset();
  mockResolveAlignedFrom.mockResolvedValue(null);
});

describe('checkAutomationGraph', () => {
  it('checks core configs in process and asks a plugin about its own nodes', async () => {
    const result = await report(flow('draft', { subject: '' }));

    expect(mockSendCoreModuleProducer).toHaveBeenCalledWith(
      expect.objectContaining({
        subdomain: 'tenant',
        pluginName: 'sales',
        producerName: 'validateConfigs',
        input: {
          nodes: [
            {
              id: 'a2',
              type: 'sales:sales.deals.create',
              config: { stageId: 's1' },
            },
          ],
        },
      }),
    );
    expect(result).toMatchObject({
      canSave: true,
      canActivate: false,
      issues: [{ nodeId: 'a1', problem: 'invalidConfig', blocksSave: false }],
    });
  });

  it('passes a flow whose configs and records all check out', async () => {
    expect(await report(flow('draft'))).toMatchObject({
      canSave: true,
      canActivate: true,
      issues: [],
    });
  });

  it('leaves a plugin node unchecked when its service does not answer', async () => {
    mockSendCoreModuleProducer.mockResolvedValue([]);

    const result = await report(flow('draft'));

    expect(result.unchecked).toContainEqual(
      expect.objectContaining({ nodeId: 'a2', reason: 'ownerUnavailable' }),
    );
    expect(result.canActivate).toBe(true);
  });
});

describe('reply-to of an email', () => {
  it('needs one, and asks for a verified sender', async () => {
    expect(
      await issuesOf(flow('draft', { ...validEmail, replyToEmail: '' })),
    ).toEqual([
      [
        'a1',
        [
          'config.replyToEmail: Choose a reply-to address from the verified senders',
        ],
      ],
    ]);
    expect(
      await issuesOf(
        flow('draft', { ...validEmail, replyToEmail: 'someone@else.com' }),
      ),
    ).toEqual([
      [
        'a1',
        ['config.replyToEmail: someone@else.com is not a verified sender'],
      ],
    ]);
  });

  it('reads the picked sender from the From field while the From is aligned', async () => {
    mockResolveAlignedFrom.mockResolvedValue('noreply@erxes.io');

    expect(
      await issuesOf(
        flow('draft', {
          ...validEmail,
          replyToEmail: '',
          fromEmailPlaceHolder: 'info@erxes.io',
        }),
      ),
    ).toEqual([]);
    expect(await issuesOf(flow('draft'))).toEqual([
      [
        'a1',
        [
          'config.fromEmailPlaceHolder: Choose a reply-to address from the verified senders',
        ],
      ],
    ]);
  });
});

describe('segment of a trigger', () => {
  it('needs one that exists, whoever declares the trigger', async () => {
    expect(
      await issuesOf(flow('draft', validEmail, { contentId: '' })),
    ).toEqual([
      ['t1', ['config.contentId: Choose the segment this trigger listens to']],
    ]);
    expect(
      await issuesOf(flow('draft', validEmail, { contentId: 'seg-gone' })),
    ).toEqual([
      ['t1', ['config.contentId: Segment "seg-gone" does not exist']],
    ]);
  });

  it('needs one about the record that triggered the run', async () => {
    expect(
      await issuesOf(flow('draft', validEmail, { contentId: 'seg-deals' })),
    ).toEqual([
      [
        't1',
        [
          'config.contentId: Segment "seg-deals" is about sales:sales.deals, not core:contacts.customers; write the conditions with segmentFields(contentType: "core:contacts.customers"), reaching other records through segmentRelations',
        ],
      ],
    ]);
  });

  it('reads a membership trigger from segmentId', async () => {
    expect(
      await issuesOf(
        flow('draft', validEmail, {
          event: 'segmentMembership',
          segmentId: 'seg-vip',
        }),
      ),
    ).toEqual([]);
  });
});

describe('prepareAutomationFlow', () => {
  it('saves an incomplete draft', async () => {
    await expect(
      prepareAutomationFlow('tenant', {
        next: flow('draft', { subject: '' }, { contentId: '' }),
      }),
    ).resolves.toBeDefined();
  });

  it('refuses a draft value of a shape the builder cannot open', async () => {
    await expect(
      prepareAutomationFlow('tenant', {
        next: flow('draft', { ...validEmail, subject: 2 }),
      }),
    ).rejects.toMatchObject({
      code: 'AUTOMATION_GRAPH_INVALID',
      message: expect.stringContaining('config.subject'),
    });
  });

  it('refuses a draft trigger listening to a segment of another record type', async () => {
    await expect(
      prepareAutomationFlow('tenant', {
        next: flow('draft', validEmail, { contentId: 'seg-deals' }),
      }),
    ).rejects.toMatchObject({
      code: 'AUTOMATION_GRAPH_INVALID',
      message: expect.stringContaining('is about sales:sales.deals'),
    });
  });

  it('refuses a draft step reading a step the flow does not have', async () => {
    await expect(
      prepareAutomationFlow('tenant', {
        next: flow('draft', {
          ...validEmail,
          subject: '{{ actions.ghost.text }}',
        }),
      }),
    ).rejects.toMatchObject({ code: 'AUTOMATION_GRAPH_INVALID' });
  });

  it('still saves a draft whose trigger has no segment yet', async () => {
    await expect(
      prepareAutomationFlow('tenant', {
        next: flow('draft', validEmail, { contentId: '' }),
      }),
    ).resolves.toBeDefined();
  });

  it('keeps saving a draft whose malformed value it did not change', async () => {
    const stored = flow('draft', { ...validEmail, subject: 2 });

    await expect(
      prepareAutomationFlow('tenant', { next: stored, previous: stored }),
    ).resolves.toBeDefined();
  });

  it('gives nodes written outside the builder the presentation it would give, keeping what was written', async () => {
    const { triggers, actions } = await prepareAutomationFlow('tenant', {
      next: flow('draft'),
    });

    expect(triggers[0]).toMatchObject({
      label: 'Customer',
      description: 'Start with customers',
      icon: 'IconUsers',
    });
    expect(actions[0]).toMatchObject({
      label: 'Send Email',
      description: 'Send Email',
      icon: 'IconMailFast',
    });
    expect(actions[1]).not.toHaveProperty('label');
  });

  it('stores variables the way the builder writes them', async () => {
    const { actions } = await prepareAutomationFlow('tenant', {
      next: flow('draft', {
        ...validEmail,
        toEmailsPlaceHolders: '{{primaryEmail}}',
        subject: 'Hi {{firstName }}',
      }),
    });

    expect(actions[0].config).toMatchObject({
      toEmailsPlaceHolders: '{{ primaryEmail }}',
      subject: 'Hi {{ firstName }}',
    });
  });

  it('refuses to go live with a config the engine would reject', async () => {
    await expect(
      prepareAutomationFlow('tenant', {
        next: flow('active', { subject: '' }),
        previous: flow('draft', { subject: '' }),
      }),
    ).rejects.toMatchObject({
      code: 'AUTOMATION_GRAPH_INVALID',
      message: expect.stringMatching(
        /^Cannot activate automation:\naction "a1" \(sendEmail\) has an invalid config\n {2}config\.toEmailsPlaceHolders: /,
      ),
    });
  });
});
