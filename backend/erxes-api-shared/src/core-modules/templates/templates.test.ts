import {
  layoutTemplateFlow,
  materializeBuiltInTemplate,
  materializeFlow,
  materializeTemplate,
} from './materialize';
import { TTemplate } from './types';
import {
  getUnansweredTemplateRequirements,
  validateTemplate,
} from './validate';

const template: TTemplate = {
  id: 'sales-employee',
  version: 1,
  name: 'Sales employee',
  requirements: [
    {
      key: 'bot',
      kind: 'frontline:telegram.bot',
      label: 'Telegram bot',
      fills: [{ target: 'trigger', journey: 'chat', path: 'integrationId' }],
    },
    {
      key: 'offer',
      kind: 'core:text',
      label: 'Discount ceiling',
      fills: [{ target: 'part', part: 'agent', path: 'context.systemPrompt' }],
    },
    {
      key: 'sender',
      kind: 'core:emails.sender',
      label: 'Sender',
      dependsOn: 'bot',
      fills: [
        {
          target: 'step',
          journey: 'chat',
          order: 2,
          path: 'fromEmail',
          from: 'value',
        },
        {
          target: 'step',
          journey: 'chat',
          order: 2,
          path: 'fromName',
          from: 'name',
        },
      ],
    },
  ],
  parts: [
    {
      key: 'agent',
      type: 'automations:aiAgent',
      defaults: {
        name: 'Sales',
        context: { lookups: ['core:products.products'] },
      },
    },
  ],
  journeys: [
    {
      key: 'chat',
      name: 'Answer and sell',
      trigger: {
        type: 'frontline:telegram.messages',
        config: { chatTypes: 'private' },
      },
      flow: [
        {
          order: 1,
          type: 'aiAgent',
          config: { aiAgentId: '{{ parts.agent }}' },
          next: { yes: 2, no: 3 },
        },
        {
          order: 2,
          type: 'sendEmail',
          config: { body: '{{ actions.1.text }} / {{ actions.11.x }}' },
        },
        { order: 3, type: 'frontline:telegram.messages.create', next: 2 },
      ],
    },
  ],
};

describe('materializeFlow', () => {
  it('mints fresh ids and points the chain, branches and references at them', () => {
    const { actions, entryActionId } = materializeFlow(
      template.journeys[0].flow,
      {
        partIds: { agent: 'agent-1' },
      },
    );
    const [first, second, third] = actions;

    expect(entryActionId).toBe(first.id);
    expect(first.config).toEqual({
      aiAgentId: 'agent-1',
      yes: second.id,
      no: third.id,
    });
    expect(second.config.body).toBe(
      `{{ actions.${first.id}.text }} / {{ actions.11.x }}`,
    );
    expect(third.nextActionId).toBe(second.id);
    expect(new Set(actions.map(({ id }) => id)).size).toBe(3);
  });

  it('never reuses an id already in the flow', () => {
    const { actions } = materializeFlow(template.journeys[0].flow, {
      usedIds: ['taken'],
    });

    expect(actions.some(({ id }) => id === 'taken')).toBe(false);
  });
});

describe('materializeFlow branches', () => {
  it('links tool and option branches and the step a split reads', () => {
    const { actions } = materializeFlow([
      { order: 1, type: 'aiAgent', connects: { order: 2, escalate: 3 } },
      { order: 2, type: 'findObject', next: 3 },
      { order: 3, type: 'split', target: 2, connects: { fallback: 1 } },
    ]);
    const [agent, find, split] = actions;

    expect(agent.config.optionalConnects).toEqual([
      { sourceId: agent.id, optionalConnectId: 'order', actionId: find.id },
      {
        sourceId: agent.id,
        optionalConnectId: 'escalate',
        actionId: split.id,
      },
    ]);
    expect(split.targetActionId).toBe(find.id);
    expect(split.config.optionalConnects).toEqual([
      { sourceId: split.id, optionalConnectId: 'fallback', actionId: agent.id },
    ]);
    expect(agent.targetActionId).toBeUndefined();
  });
});

describe('materializeTemplate', () => {
  const answers = {
    bot: 'int-1',
    offer: 'At most 10% off',
    sender: { value: 'shop@example.mn', name: 'Shop' },
  };

  it('lands every answer where the template says', () => {
    const { parts, automations } = materializeTemplate(template, {
      answers,
      partIds: { agent: 'agent-1' },
    });
    const [chat] = automations;

    expect(parts[0].doc).toEqual({
      name: 'Sales',
      context: {
        lookups: ['core:products.products'],
        systemPrompt: 'At most 10% off',
      },
    });
    expect(chat.triggers[0]).toMatchObject({
      type: 'frontline:telegram.messages',
      config: { chatTypes: 'private', integrationId: 'int-1' },
      actionId: chat.actions[0].id,
    });
    expect(chat.actions[1].config).toMatchObject({
      fromEmail: 'shop@example.mn',
      fromName: 'Shop',
    });
  });

  it('puts a text answer inside the texts that name it', () => {
    const withPolicy: TTemplate = {
      ...template,
      parts: [
        {
          key: 'agent',
          type: 'automations:aiAgent',
          defaults: { description: 'Rules:\n{{ answers.offer }}' },
        },
      ],
    };
    const { parts } = materializeTemplate(withPolicy, {
      answers,
      partIds: { agent: 'agent-1' },
    });

    expect(parts[0].doc.description).toBe('Rules:\nAt most 10% off');
  });

  it('leaves the template untouched for the next install', () => {
    materializeTemplate(template, { answers, partIds: { agent: 'a' } });

    expect(template.parts[0].defaults).toEqual({
      name: 'Sales',
      context: { lookups: ['core:products.products'] },
    });
  });
});

describe('validateTemplate', () => {
  it('accepts a sound template', () => {
    expect(validateTemplate(template)).toEqual([]);
  });

  it('names what is broken', () => {
    const broken: TTemplate = {
      ...template,
      requirements: [
        { key: 'a', kind: 'core:text', label: 'A', dependsOn: 'b' },
        {
          key: 'b',
          kind: 'core:text',
          label: 'B',
          fills: [
            { target: 'step', journey: 'chat', order: 9, path: 'x' },
            { target: 'part', part: 'ghost', path: 'x' },
          ],
        },
      ],
      journeys: [
        {
          ...template.journeys[0],
          flow: [
            {
              order: 1,
              type: 'aiAgent',
              next: 5,
              connects: { escalate: 6 },
              config: { id: '{{ parts.nope }}', text: '{{ answers.bot }}' },
            },
          ],
        },
      ],
    };

    expect(validateTemplate(broken)).toEqual([
      'Journey "chat": step 1 goes to missing step 5',
      'Journey "chat": step 1 goes to missing step 6',
      'Journey "chat": step 1 connects unknown branch "escalate"',
      'Journey "chat": unknown part "nope"',
      '"{{ answers.bot }}" names no text requirement',
      'Requirement "a" depends on "b", which is not asked before it',
      'Requirement "b" fills missing step 9 of "chat"',
      'Requirement "b" fills unknown part "ghost"',
    ]);
  });
});

describe('validateTemplate branches', () => {
  it('needs a branch for every AI tool and only known branch ids', () => {
    const wired: TTemplate = {
      ...template,
      requirements: [],
      journeys: [
        {
          key: 'chat',
          name: 'Chat',
          trigger: { type: 'frontline:facebook.messages' },
          flow: [
            {
              order: 1,
              type: 'aiAgent',
              config: { tools: [{ id: 'order' }, { id: 'escalate' }] },
              connects: { order: 2, ghost: 2 },
            },
            { order: 2, type: 'delay' },
          ],
        },
      ],
    };

    expect(validateTemplate(wired)).toEqual([
      'Journey "chat": step 1 connects unknown branch "ghost"',
      'Journey "chat": step 1 tool "escalate" has no branch',
    ]);
  });

  it('refuses a record step named through refs, which engines never read', () => {
    const misused: TTemplate = {
      ...template,
      requirements: [],
      journeys: [
        {
          key: 'chat',
          name: 'Chat',
          trigger: { type: 'frontline:facebook.messages' },
          flow: [
            { order: 1, type: 'findObject', next: 2 },
            { order: 2, type: 'setProperty', refs: { targetActionId: 1 } },
          ],
        },
      ],
    };

    expect(validateTemplate(misused)).toContain(
      'Journey "chat": step 2 names its record step with refs; use target',
    );
  });
});

describe('getUnansweredTemplateRequirements', () => {
  it('keeps installing closed until every requirement has a value', () => {
    expect(
      getUnansweredTemplateRequirements(template, {
        bot: 'int-1',
        offer: '',
      }).map(({ key }) => key),
    ).toEqual(['offer', 'sender']);
  });
});

describe('materializeBuiltInTemplate', () => {
  const builtIn = {
    id: 'core.welcome',
    name: 'Welcome',
    flow: [
      {
        order: 1,
        type: 'sendEmail',
        config: { subject: 'Hi', html: '' },
        next: 2,
      },
      { order: 2, type: 'delay', config: { value: '3', type: 'day' } },
    ],
    requirements: [
      {
        key: 'content-1',
        kind: 'core:emails.content',
        label: 'Write the welcome',
        fills: [
          { order: 1, path: 'subject', from: 'subject' },
          { order: 1, path: 'html', from: 'html' },
        ],
      },
    ],
  };

  it('fills the answered steps around ids already in the flow', () => {
    const { actions, entryActionId, unanswered } = materializeBuiltInTemplate(
      builtIn,
      {
        usedIds: ['taken'],
        answers: { 'content-1': { subject: 'Welcome', html: '<p>Hello</p>' } },
      },
    );

    expect(unanswered).toEqual([]);
    expect(entryActionId).toBe(actions[0].id);
    expect(actions[0].config).toEqual({
      subject: 'Welcome',
      html: '<p>Hello</p>',
    });
    expect(actions[0].nextActionId).toBe(actions[1].id);
    expect(actions.some(({ id }) => id === 'taken')).toBe(false);
  });

  it('reports what is unanswered and leaves the template text', () => {
    const { actions, unanswered } = materializeBuiltInTemplate(builtIn, {
      answers: { 'content-1': '' },
    });

    expect(unanswered).toEqual(['content-1']);
    expect(actions[0].config.subject).toBe('Hi');
  });
});

describe('layoutTemplateFlow', () => {
  it('keeps the main path on one row and gives each branch its own', () => {
    const positions = layoutTemplateFlow([
      {
        order: 1,
        type: 'aiAgent',
        next: 2,
        connects: { order: 3, escalate: 5 },
      },
      { order: 2, type: 'reply' },
      { order: 3, type: 'create', next: 4 },
      { order: 4, type: 'reply', next: 1 },
      { order: 5, type: 'handoff' },
    ]);

    expect(Object.fromEntries(positions)).toEqual({
      1: { x: 500, y: 0 },
      2: { x: 1000, y: 0 },
      3: { x: 1000, y: 300 },
      4: { x: 1500, y: 300 },
      5: { x: 1000, y: 600 },
    });
  });

  it('places the trigger before the entry step', () => {
    const { automations } = materializeTemplate(template, {
      answers: {},
      partIds: { agent: 'a' },
    });
    const [chat] = automations;
    const points = [
      chat.triggers[0].position,
      ...chat.actions.map(({ position }) => position),
    ].map((point) => `${point?.x},${point?.y}`);

    expect(chat.triggers[0].position).toEqual({ x: 0, y: 0 });
    expect(new Set(points).size).toBe(points.length);
  });
});

describe('journey workflows', () => {
  const withWorkflow: TTemplate = {
    id: 'complaints',
    version: 1,
    name: 'Complaints',
    requirements: [
      {
        key: 'where',
        kind: 'frontline:tickets.status',
        label: 'Where',
        fills: [
          {
            target: 'workflow',
            journey: 'chat',
            workflow: 'file',
            order: 1,
            path: 'statusId',
            from: 'status',
          },
        ],
      },
    ],
    parts: [],
    journeys: [
      {
        key: 'chat',
        name: 'Chat',
        trigger: { type: 'frontline:facebook.messages' },
        flow: [
          {
            order: 1,
            type: 'aiAgent',
            config: { tools: [{ id: 'file', kind: 'helper' }] },
            next: 2,
            connects: { file: 'file' },
          },
          { order: 2, type: 'reply' },
        ],
        workflows: [
          {
            key: 'file',
            name: 'File it',
            inputs: { title: '' },
            output: 'Filed #{{ actions.2.number }}',
            flow: [
              { order: 1, type: 'find', next: { isExists: 2 } },
              { order: 2, type: 'set', target: 1 },
            ],
          },
        ],
      },
    ],
  };

  it('builds the workflow, wires the tool to it and fills its steps', () => {
    const { automations } = materializeTemplate(withWorkflow, {
      answers: { where: { status: 's-1' } },
      partIds: {},
    });
    const [chat] = automations;
    const [workflow] = chat.workflows;
    const [find, set] = workflow.actions;

    expect(chat.actions[0].config.optionalConnects).toEqual([
      {
        sourceId: chat.actions[0].id,
        optionalConnectId: 'file',
        actionId: workflow.id,
      },
    ]);
    expect(workflow.config).toEqual({
      inputs: { title: '' },
      entryActionId: find.id,
      output: `Filed #{{ actions.${set.id}.number }}`,
    });
    expect(find.config).toMatchObject({ statusId: 's-1', isExists: set.id });
    // Where engines read it: on the action, not in its config
    expect(set.targetActionId).toBe(find.id);

    const ids = [
      chat.triggers[0].id,
      workflow.id,
      ...chat.actions.map(({ id }) => id),
      ...workflow.actions.map(({ id }) => id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('names a helper without a workflow and a missing workflow', () => {
    const broken: TTemplate = {
      ...withWorkflow,
      requirements: [],
      journeys: [
        {
          ...withWorkflow.journeys[0],
          flow: [
            {
              order: 1,
              type: 'aiAgent',
              config: {
                tools: [
                  { id: 'file', kind: 'helper' },
                  { id: 'add', kind: 'helper' },
                ],
              },
              connects: { file: 2, add: 'ghost' },
            },
            { order: 2, type: 'reply' },
          ],
        },
      ],
    };

    expect(validateTemplate(broken)).toEqual([
      'Journey "chat": step 1 connects to missing workflow "ghost"',
      'Journey "chat": step 1 helper tool "file" must run a workflow',
    ]);
  });
});

describe('plugin parts', () => {
  it('reads ids that came with a part', () => {
    const withDesk: TTemplate = {
      id: 'desk',
      version: 1,
      name: 'Desk',
      requirements: [],
      parts: [
        { key: 'desk', type: 'frontline:tickets.pipeline', defaults: {} },
      ],
      journeys: [
        {
          key: 'chat',
          name: 'Chat',
          trigger: { type: 'frontline:facebook.messages' },
          flow: [
            {
              order: 1,
              type: 'create',
              config: {
                pipelineId: '{{ parts.desk.pipelineId }}',
                id: '{{ parts.desk }}',
              },
            },
          ],
        },
      ],
    };

    expect(validateTemplate(withDesk)).toEqual([]);

    const { automations } = materializeTemplate(withDesk, {
      answers: {},
      partIds: { desk: 'desk-1' },
      partRefs: { desk: { pipelineId: 'p-1' } },
    });

    expect(automations[0].actions[0].config).toEqual({
      pipelineId: 'p-1',
      id: 'desk-1',
    });
    expect(
      validateTemplate({
        ...withDesk,
        parts: [{ key: 'desk', type: 'pipeline', defaults: {} }],
      }),
    ).toEqual(['Part "desk" type "pipeline" names no owning plugin']);
  });
});
