import {
  normalizeAutomationWorkflows,
  normalizeWorkflowInputs,
  rewriteActionsToInputs,
  substituteInputsBack,
} from './workflowInputs';

const makeMembers = () => [
  {
    id: 'a1',
    type: 'aiAgent',
    config: {
      input: '{{ trigger.content }}',
      nested: { customerId: '{{ trigger.customerId }}' },
      mixed: 'fb-{{ trigger.conversationId }}',
    },
    nextActionId: 'a2',
  },
  {
    id: 'a2',
    type: 'fb.create',
    config: {
      messages: [{ text: '{{ actions.a1.text }}' }],
      external: '{{ actions.outsider.value }}',
    },
  },
];

describe('rewriteActionsToInputs', () => {
  it('rewrites external refs to input.* and keeps originals as bindings', () => {
    const { actions, inputs } = rewriteActionsToInputs(makeMembers() as any);

    expect(inputs).toEqual({
      content: '{{ trigger.content }}',
      customerId: '{{ trigger.customerId }}',
      conversationId: '{{ trigger.conversationId }}',
      value: '{{ actions.outsider.value }}',
    });
    expect(actions[0].config.input).toBe('{{ input.content }}');
    expect(actions[0].config.nested.customerId).toBe('{{ input.customerId }}');
    expect(actions[0].config.mixed).toBe('fb-{{ input.conversationId }}');
    // Internal member ref stays untouched
    expect(actions[1].config.messages[0].text).toBe('{{ actions.a1.text }}');
    expect(actions[1].config.external).toBe('{{ input.value }}');
  });

  it('suffixes colliding names with a counter', () => {
    const { inputs } = rewriteActionsToInputs([
      {
        id: 'a1',
        type: 'x',
        config: {
          one: '{{ trigger.content }}',
          two: '{{ actions.outsider.content }}',
        },
      },
    ] as any);

    expect(Object.keys(inputs).sort()).toEqual(['content', 'content2']);
  });

  it('never derives inputs from malformed nested placeholders', () => {
    const { actions, inputs } = rewriteActionsToInputs([
      {
        id: 'a1',
        type: 'x',
        config: { input: '{{ trigger.{{ trigger.content }} }}' },
      },
    ] as any);

    expect(inputs).toEqual({ content: '{{ trigger.content }}' });
    // Only the inner well-formed token is rewritten; no trailing braces junk
    expect(actions[0].config.input).toBe('{{ trigger.{{ input.content }} }}');
  });

  it('round-trips through substituteInputsBack', () => {
    const members = makeMembers();
    const { actions, inputs } = rewriteActionsToInputs(members as any);
    const restored = substituteInputsBack(actions as any, inputs);

    expect(restored.map((action) => action.config)).toEqual(
      members.map((action) => action.config),
    );
  });
});

describe('normalizeWorkflowInputs', () => {
  it('is a no-op for workflows without external refs', () => {
    const workflow = {
      id: 'wf1',
      actions: [{ id: 'a1', type: 'x', config: { note: 'plain' } }],
      config: { entryActionId: 'a1' },
    };

    expect(normalizeWorkflowInputs(workflow as any)).toBe(workflow);
  });

  it('keeps manual binding overrides over re-derived defaults', () => {
    const workflow = {
      id: 'wf1',
      actions: [
        { id: 'a1', type: 'x', config: { input: '{{ trigger.content }}' } },
      ],
      config: {
        entryActionId: 'a1',
        inputs: { content: '{{ trigger.description }}' },
      },
    };

    const normalized = normalizeWorkflowInputs(workflow as any);

    expect(normalized.config.inputs.content).toBe('{{ trigger.description }}');
    expect(normalized.actions?.[0].config.input).toBe('{{ input.content }}');
  });
});

describe('normalizeAutomationWorkflows', () => {
  it('migrates the legacy memberActionIds reference model to a snapshot', () => {
    const result = normalizeAutomationWorkflows({
      triggers: [{ id: 't1', type: 'x', actionId: 'router' } as any],
      actions: [
        {
          id: 'router',
          type: 'aiAgent',
          config: {
            optionalConnects: [
              { sourceId: 'router', optionalConnectId: 'o1', actionId: 'm1' },
            ],
          },
          nextActionId: 'other',
        },
        { id: 'other', type: 'x', config: {} },
        {
          id: 'm1',
          type: 'x',
          config: { note: '{{ trigger.content }}' },
          nextActionId: 'm2',
        },
        { id: 'm2', type: 'x', config: {} },
      ] as any,
      workflows: [
        {
          id: 'wf1',
          name: 'Legacy',
          config: { memberActionIds: ['m1', 'm2'], entryActionId: 'm1' },
          actions: null,
        },
      ],
    });

    // Members left the root list
    expect(result.actions.map(({ id }) => id)).toEqual(['router', 'other']);
    // Root ref into a member now points at the workflow node
    expect(result.actions[0].config.optionalConnects[0].actionId).toBe('wf1');
    // Snapshot owns the members, rewritten to input.*
    const workflow = result.workflows[0];
    expect(workflow.actions.map(({ id }: any) => id)).toEqual(['m1', 'm2']);
    expect(workflow.actions[0].config.note).toBe('{{ input.content }}');
    expect(workflow.config.inputs).toEqual({
      content: '{{ trigger.content }}',
    });
    expect(workflow.config.memberActionIds).toBeUndefined();
    expect(workflow.config.entryActionId).toBe('m1');
  });
});
