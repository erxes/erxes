import type { ActionInfo, AutomationStep } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { stepOutputFields } from '../flowChecks';

const actions: ActionInfo[] = [
  {
    type: 'core.customer.assign',
    label: 'Assign an owner',
    description: null,
    source: 'core',
    integration: null,
    integrationName: null,
    subject: null,
    fields: [],
    outputs: [{ key: 'ownerId', label: 'New owner', type: 'member' }],
  },
  {
    type: 'core.notification.send',
    label: 'Notify team members',
    description: null,
    source: 'core',
    integration: null,
    integrationName: null,
    subject: null,
    fields: [],
    outputs: [],
  },
];

describe('stepOutputFields', () => {
  it('excludes sibling arm outputs inside branches while keeping ancestor and rejoined outputs', () => {
    const branched: AutomationStep[] = [
      { id: 'before', type: 'action', action: 'core.customer.assign', input: {} },
      {
        id: 'br',
        type: 'branch',
        conditions: { match: 'all', rules: [] },
        then: [
          { id: 't1', type: 'action', action: 'core.customer.assign', input: {} },
          { id: 't2', type: 'action', action: 'core.notification.send', input: { title: 'Hi' } },
        ],
        else: [
          { id: 'e1', type: 'action', action: 'core.customer.assign', input: {} },
          { id: 'e2', type: 'action', action: 'core.notification.send', input: { title: 'Hi' } },
        ],
      },
      { id: 'after', type: 'action', action: 'core.notification.send', input: { title: 'Done' } },
    ];

    const pathsFor = (id: string) =>
      stepOutputFields(branched, id, { events: [], actions }).map((field) => field.path);

    expect(pathsFor('t2')).toEqual(['steps.before.output.ownerId', 'steps.t1.output.ownerId']);
    expect(pathsFor('e1')).toEqual(['steps.before.output.ownerId']);
    expect(pathsFor('e2')).toEqual(['steps.before.output.ownerId', 'steps.e1.output.ownerId']);
    expect(pathsFor('after')).toEqual([
      'steps.before.output.ownerId',
      'steps.t1.output.ownerId',
      'steps.e1.output.ownerId',
    ]);
  });

  it('excludes earlier cases and paths inside switch and split steps', () => {
    const flow: AutomationStep[] = [
      {
        id: 'sw',
        type: 'switch',
        cases: [
          {
            conditions: { match: 'all', rules: [] },
            steps: [{ id: 'c0', type: 'action', action: 'core.customer.assign', input: {} }],
          },
          {
            conditions: { match: 'all', rules: [] },
            steps: [{ id: 'c1', type: 'action', action: 'core.notification.send', input: {} }],
          },
        ],
        otherwise: [{ id: 'ow', type: 'action', action: 'core.notification.send', input: {} }],
      },
      {
        id: 'sp',
        type: 'split',
        paths: [
          {
            weight: 50,
            steps: [{ id: 'p0', type: 'action', action: 'core.customer.assign', input: {} }],
          },
          {
            weight: 50,
            steps: [{ id: 'p1', type: 'action', action: 'core.notification.send', input: {} }],
          },
        ],
      },
    ];

    const pathsFor = (id: string) =>
      stepOutputFields(flow, id, { events: [], actions }).map((field) => field.path);

    expect(pathsFor('c1')).toEqual([]);
    expect(pathsFor('ow')).toEqual([]);
    expect(pathsFor('p1')).toEqual(['steps.c0.output.ownerId']);
  });
});
