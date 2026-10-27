import { TAutomationConfigCheck } from 'erxes-api-shared/core-modules';
import {
  buildAutomationGraphReport,
  canonicalPlaceholders,
  describeAutomationGraphIssues,
  findFlowReferenceIssues,
  selectConfigCheckNodes,
  TAutomationFlowDraft,
  TAutomationGraphCatalog,
} from '../automationGraph';

const catalog: TAutomationGraphCatalog = {
  nodes: new Map([
    ['core:contacts.customers', { pluginName: 'core', hasConfigSchema: false }],
    ['if', { pluginName: 'core', hasConfigSchema: false }],
    ['findObject', { pluginName: 'core', hasConfigSchema: false }],
    ['delay', { pluginName: 'core', hasConfigSchema: true }],
    ['sendEmail', { pluginName: 'core', hasConfigSchema: true }],
    [
      'sales:sales.deals.create',
      { pluginName: 'sales', hasConfigSchema: true },
    ],
  ]),
  reachablePlugins: new Set(['core', 'sales']),
};

const flow = (
  overrides: Partial<TAutomationFlowDraft> = {},
): TAutomationFlowDraft => ({
  status: 'draft',
  triggers: [
    {
      id: 't1',
      type: 'core:contacts.customers',
      actionId: 'a1',
      config: {
        contentId: '',
        reEnrollment: false,
        reEnrollmentRules: [],
        dateConfig: {},
      },
    },
  ],
  actions: [
    {
      id: 'a1',
      type: 'delay',
      nextActionId: 'a2',
      config: { value: '1', type: 'day' },
    },
    { id: 'a2', type: 'sendEmail', config: { subject: 'Hi' } },
  ],
  workflows: [],
  ...overrides,
});

const report = (
  next: TAutomationFlowDraft,
  previous?: TAutomationFlowDraft | null,
  checks: TAutomationConfigCheck[] = [],
) =>
  buildAutomationGraphReport({
    next,
    previous,
    catalog,
    configChecks: new Map(checks.map((check) => [check.id, check])),
  });

const invalid = (id: string, type: string): TAutomationConfigCheck => ({
  id,
  type,
  status: 'invalid',
  issues: [{ path: 'config.subject', message: 'Required' }],
});

describe('what a save may introduce', () => {
  it('stores a sound draft', () => {
    expect(report(flow())).toMatchObject({ canSave: true, issues: [] });
  });

  it('refuses a new node of a type no reachable service declares', () => {
    const next = flow({
      actions: [
        flow().actions[0],
        { ...flow().actions[1], nextActionId: 'a3' },
        { id: 'a3', type: 'core:invented' },
      ],
    });

    expect(report(next)).toMatchObject({
      canSave: false,
      issues: [{ nodeId: 'a3', problem: 'unknownType', blocksSave: true }],
    });
  });

  it('leaves the type of a service it cannot reach unjudged', () => {
    const next = flow({
      actions: [...flow().actions, { id: 'a3', type: 'loyalty:score.add' }],
    });

    const result = report(next);

    expect(result.canSave).toBe(true);
    expect(result.unchecked).toContainEqual(
      expect.objectContaining({ nodeId: 'a3', reason: 'ownerUnavailable' }),
    );
  });

  it('refuses links to nodes the flow does not have, branches included', () => {
    const next = flow({
      actions: [
        {
          id: 'a1',
          type: 'if',
          nextActionId: 'a2',
          config: { yes: 'a2', no: 'ghost' },
        },
        {
          id: 'a2',
          type: 'sendEmail',
          config: {
            optionalConnects: [{ optionalConnectId: 'o1', actionId: 'gone' }],
          },
        },
      ],
    });

    expect(
      report(next).issues.map(({ nodeId, message }) => [nodeId, message]),
    ).toEqual([
      ['a1', 'action "a1" config.no points to missing node "ghost"'],
      [
        'a2',
        'action "a2" config.optionalConnects.0.actionId points to missing node "gone"',
      ],
    ]);
  });

  it('follows the found and not-found branches of find object', () => {
    const next = flow({
      actions: [
        {
          id: 'a1',
          type: 'findObject',
          config: { isExists: 'a2', notExists: 'ghost' },
        },
        { id: 'a2', type: 'sendEmail', config: { subject: 'Hi' } },
      ],
    });

    expect(report(next).issues.map(({ message }) => message)).toEqual([
      'action "a1" config.notExists points to missing node "ghost"',
    ]);
  });

  it('reports a step no trigger reaches, error branches included, without refusing the save or going live', () => {
    const next = flow({
      actions: [
        flow().actions[0],
        { ...flow().actions[1], nextActionId: 'a4' },
        { id: 'a3', type: 'delay', targetActionId: 'a1', config: {} },
        {
          id: 'a4',
          type: 'delay',
          config: { onSuccessActionId: 'a5', onErrorActionId: 'a6' },
        },
        { id: 'a5', type: 'delay', config: {} },
        { id: 'a6', type: 'delay', config: {} },
      ],
    });
    const result = report(next);

    expect(result).toMatchObject({ canSave: true, canActivate: true });
    expect(
      result.issues.map(({ nodeId, problem, blocksSave }) => [
        nodeId,
        problem,
        blocksSave,
      ]),
    ).toEqual([['a3', 'unreachable', false]]);
  });

  it('lets a node hand over to a workflow', () => {
    const next = flow({
      actions: [{ id: 'a1', type: 'delay', nextActionId: 'w1', config: {} }],
      workflows: [{ id: 'w1', name: 'Follow up', actions: [] }],
    });

    expect(report(next).canSave).toBe(true);
  });

  it('does not re-judge history the save left untouched', () => {
    const stored = flow({
      actions: [
        { id: 'a1', type: 'legacy:old', nextActionId: 'deleted', config: {} },
      ],
    });
    const next = flow({
      actions: [
        {
          id: 'a1',
          type: 'legacy:old',
          nextActionId: 'deleted',
          config: { note: 'edited' },
        },
      ],
    });

    expect(report(next, stored)).toMatchObject({ canSave: true, issues: [] });
  });

  it('judges a link the save changed', () => {
    const stored = flow();
    const next = flow({
      actions: [
        { ...flow().actions[0], nextActionId: 'nowhere' },
        flow().actions[1],
      ],
    });

    expect(report(next, stored).issues).toMatchObject([
      { nodeId: 'a1', problem: 'missingLink' },
      { nodeId: 'a2', problem: 'unreachable' },
    ]);
  });
});

describe('which configs are checked', () => {
  const select = (
    next: TAutomationFlowDraft,
    previous: TAutomationFlowDraft | null,
    scope: 'save' | 'report' = 'save',
  ) =>
    selectConfigCheckNodes({ next, previous, catalog, scope }).map(
      ({ id, pluginName }) => `${pluginName}:${id}`,
    );

  it('checks only what a draft save changes', () => {
    expect(select(flow(), flow())).toEqual([]);
    expect(select(flow(), null)).toEqual(['core:t1', 'core:a1', 'core:a2']);
  });

  it('checks every declared node and the trigger segment when the flow goes live', () => {
    expect(select(flow({ status: 'active' }), flow())).toEqual([
      'core:t1',
      'core:a1',
      'core:a2',
    ]);
    expect(select(flow({ status: 'active' }), null)).toEqual([
      'core:t1',
      'core:a1',
      'core:a2',
    ]);
  });

  it('leaves the segment of a custom trigger to its owner', () => {
    const next = flow({
      status: 'active',
      triggers: [{ ...flow().triggers[0], isCustom: true }],
    });

    expect(select(next, null)).toEqual(['core:a1', 'core:a2']);
  });

  it('checks only changed nodes while the flow stays live, moving one is not a change', () => {
    const stored = flow({ status: 'active' });
    const next = flow({
      status: 'active',
      actions: [
        Object.assign({}, flow().actions[0], { position: { x: 900, y: 40 } }),
        { ...flow().actions[1], config: { subject: 'Hello' } },
      ],
    });

    expect(select(next, stored)).toEqual(['core:a2']);
  });

  it('does not take placeholder spacing for an edit while the flow stays live', () => {
    const withSubject = (subject: string) =>
      flow({
        status: 'active',
        actions: [
          flow().actions[0],
          { ...flow().actions[1], config: { subject } },
        ],
      });

    expect(
      select(
        withSubject('Hi {{ firstName }}'),
        withSubject('Hi {{firstName}}'),
      ),
    ).toEqual([]);
  });

  it('asks each owner about its own nodes', () => {
    const next = flow({
      status: 'active',
      actions: [{ id: 'a1', type: 'sales:sales.deals.create', config: {} }],
    });

    expect(select(next, null)).toEqual(['core:t1', 'sales:a1']);
  });

  it('checks every declared config in a report', () => {
    expect(select(flow(), flow(), 'report')).toEqual([
      'core:t1',
      'core:a1',
      'core:a2',
    ]);
  });
});

describe('config results', () => {
  it('blocks going live on an invalid config and names the field', () => {
    const result = report(flow({ status: 'active' }), flow(), [
      invalid('a2', 'sendEmail'),
    ]);

    expect(result).toMatchObject({ canSave: false, canActivate: false });
    expect(describeAutomationGraphIssues(result)).toBe(
      'action "a2" (sendEmail) has an invalid config\n  config.subject: Required',
    );
  });

  it('reports an invalid config of a draft without refusing the save', () => {
    expect(report(flow(), flow(), [invalid('a2', 'sendEmail')])).toMatchObject({
      canSave: true,
      canActivate: false,
      issues: [{ nodeId: 'a2', problem: 'invalidConfig', blocksSave: false }],
    });
  });

  it('marks nodes whose owner could not answer, and nodes nobody declared a schema for', () => {
    const next = flow({
      actions: [
        { id: 'a1', type: 'if', nextActionId: 'a2', config: {} },
        { id: 'a2', type: 'sendEmail', config: { subject: 'Hi' } },
      ],
    });
    const result = report(next, next, [
      { id: 'a2', type: 'sendEmail', status: 'unchecked' },
    ]);

    expect(result.unchecked).toEqual([
      {
        nodeId: 'a1',
        nodeType: 'if',
        kind: 'action',
        reason: 'noConfigSchema',
      },
      {
        nodeId: 'a2',
        nodeType: 'sendEmail',
        kind: 'action',
        reason: 'ownerUnavailable',
      },
    ]);
  });
});

describe('placeholders', () => {
  it('writes every variable the way the builder does', () => {
    expect(
      canonicalPlaceholders(
        'Hi {{firstName}}, {{  trigger.primaryEmail}} {{ now }} {{}} {{ trigger.{{field}} }}',
      ),
    ).toBe(
      'Hi {{ firstName }}, {{ trigger.primaryEmail }} {{ now }} {{}} {{ trigger.{{ field }} }}',
    );
  });

  it('reaches nested editor state and leaves values that are not JSON alone', () => {
    const sentAt = new Date('2026-10-25T00:00:00.000Z');

    expect(
      canonicalPlaceholders({
        contentJson: {
          type: 'doc',
          content: [{ type: 'text', text: 'Dear {{firstName}}' }],
        },
        sentAt,
        retries: 2,
      }),
    ).toEqual({
      contentJson: {
        type: 'doc',
        content: [{ type: 'text', text: 'Dear {{ firstName }}' }],
      },
      sentAt,
      retries: 2,
    });
  });
});

describe('what a config refers to', () => {
  const issuesOf = (actions: TAutomationFlowDraft['actions']) =>
    Object.fromEntries(findFlowReferenceIssues(flow({ actions })));

  it('needs variables to read steps the flow has', () => {
    expect(
      issuesOf([
        {
          id: 'a1',
          type: 'sendEmail',
          config: { subject: '{{ actions.a2.text }} {{ actions.ghost.text }}' },
        },
        { id: 'a2', type: 'aiAgent', config: {} },
      ]),
    ).toEqual({
      a1: [
        {
          check: 'references',
          malformed: true,
          path: 'config',
          message:
            '{{ actions.ghost... }} reads a step this flow does not have',
        },
      ],
    });
  });

  it('links only the branches a step declares', () => {
    expect(
      issuesOf([
        {
          id: 'a1',
          type: 'aiAgent',
          config: {
            goalType: 'generateText',
            tools: [{ id: 'complain' }],
            optionalConnects: [
              { optionalConnectId: 'complain', actionId: 'a2' },
              { optionalConnectId: 'refund', actionId: 'a2' },
            ],
          },
        },
        { id: 'a2', type: 'delay', config: {} },
      ]),
    ).toEqual({
      a1: [
        {
          check: 'references',
          malformed: true,
          path: 'config.optionalConnects.1.optionalConnectId',
          message: '"refund" is not a branch of this step; use complain',
        },
      ],
    });
  });

  it('needs a split comparing values to name the step they come from', () => {
    const split = {
      id: 'a1',
      type: 'split',
      config: {
        options: [
          {
            id: 'o1',
            config: {
              conditions: [
                { propertyName: 'attributes.severity', propertyOperator: 'e' },
              ],
            },
          },
        ],
      },
    };

    expect(issuesOf([split])).toMatchObject({
      a1: [{ path: 'targetActionId' }],
    });
    expect(
      issuesOf([
        { ...split, targetActionId: 'a0' },
        { id: 'a0', type: 'aiAgent' },
      ]),
    ).toEqual({});
  });
});

describe('checks', () => {
  it('groups findings by the check that made them, in the order they run', () => {
    const next = flow({
      actions: [
        flow().actions[0],
        { ...flow().actions[1], nextActionId: 'ghost' },
        { id: 'a3', type: 'delay', config: {} },
      ],
    });
    const { checks } = report(next, null, [
      {
        id: 'a2',
        type: 'sendEmail',
        status: 'invalid',
        issues: [
          { check: 'schema', path: 'config.subject', message: 'Required' },
          {
            check: 'records',
            path: 'config.replyToEmail',
            message: 'Unverified',
          },
        ],
      },
    ]);

    expect(
      checks.map(({ key, status, items }) => [key, status, items.length]),
    ).toEqual([
      ['types', 'ok', 0],
      ['links', 'bad', 1],
      ['reach', 'warn', 1],
      ['segment', 'ok', 0],
      ['settings', 'bad', 1],
      ['records', 'bad', 1],
      ['references', 'ok', 0],
      ['owners', 'ok', 0],
    ]);
  });
});
