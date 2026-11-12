import type { ActionInfo, AutomationStep } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import {
  actionDefaults,
  cloneStep,
  countSteps,
  describeConditions,
  describeStep,
  findStep,
  flowProblems,
  insertStep,
  locate,
  moveStep,
  removeStep,
  replaceStep,
  stepOutputFields,
} from '../flowModel';

const wait: AutomationStep = {
  id: 'w',
  type: 'wait_for',
  event: 'core.customer.updated',
  amount: 3,
  unit: 'days',
};

const branch: AutomationStep = {
  id: 'b',
  type: 'branch',
  conditions: {
    match: 'all',
    rules: [{ path: 'steps.w.output.matched', op: 'eq', value: false }],
  },
  then: [{ id: 'n', type: 'action', action: 'core.notification.send', input: { title: 'Ping' } }],
  else: [],
};

const flow: AutomationStep[] = [
  { id: 'a', type: 'action', action: 'core.customer.assign', input: {} },
  wait,
  branch,
];

const actions: ActionInfo[] = [
  {
    type: 'core.customer.assign',
    label: 'Assign an owner',
    description: null,
    source: 'core',
    subject: null,
    fields: [
      { key: 'userIds', label: 'Members to rotate through', type: 'members', required: true },
    ],
  },
  {
    type: 'core.notification.send',
    label: 'Notify team members',
    description: null,
    source: 'core',
    subject: null,
    fields: [{ key: 'title', label: 'Title', type: 'text', required: true }],
  },
];

const events = [{ type: 'core.customer.updated', label: 'Customer updated' }];

describe('flow model', () => {
  it('finds, locates and counts steps inside arms', () => {
    expect(findStep(flow, 'n')?.type).toBe('action');
    expect(locate(flow, 'n')).toEqual({
      address: { parentId: 'b', arm: 'then' },
      index: 0,
      length: 1,
    });
    expect(countSteps(flow)).toBe(4);
  });

  it('inserts into an empty arm, moves, replaces and removes without touching other steps', () => {
    const added = insertStep(flow, { parentId: 'b', arm: 'else' }, 0, { id: 's', type: 'stop' });

    expect(locate(added, 's')?.address).toEqual({ parentId: 'b', arm: 'else' });
    expect(added[0]).toBe(flow[0]);

    const moved = moveStep(flow, 'w', -1);

    expect(moved.map((step) => step.id)).toEqual(['w', 'a', 'b']);
    // Already first: nothing moves.
    expect(moveStep(moved, 'w', -1)).toBe(moved);

    const renamed = replaceStep(flow, {
      id: 'n',
      type: 'action',
      action: 'core.notification.send',
      input: { title: 'Pong' },
    });

    expect(findStep(renamed, 'n')).toMatchObject({ input: { title: 'Pong' } });
    expect(findStep(removeStep(flow, 'n'), 'n')).toBeNull();
    expect(countSteps(removeStep(flow, 'b'))).toBe(2);
  });

  it('duplicates with fresh ids all the way down', () => {
    const copy = cloneStep(branch);
    const [inner] = copy.type === 'branch' ? copy.then : [];

    expect(copy.id).not.toBe('b');
    expect(inner).toMatchObject({ type: 'action', action: 'core.notification.send' });
    expect(inner?.id).not.toBe('n');
  });

  it('names what each step does, with outputs of earlier steps as fields', () => {
    const outputs = stepOutputFields(flow, 'b', { events });

    expect(outputs).toEqual([
      {
        path: 'steps.w.output.matched',
        label: 'Customer updated within the wait',
        type: 'boolean',
      },
    ]);
    expect(describeStep(branch, { actions, events, fields: outputs }).title).toBe(
      'If Customer updated within the wait: no',
    );
    expect(describeStep(wait, { actions, events, fields: [] })).toEqual({
      title: 'Customer updated',
      detail: 'At most 3 days',
    });
    expect(
      describeStep(
        { id: 'd', type: 'delay', amount: 1, unit: 'hours' },
        { actions, events, fields: [] },
      ).title,
    ).toBe('1 hour');
    expect(
      describeConditions(
        {
          match: 'any',
          rules: [
            { path: 'subject.primaryEmail', op: 'exists' },
            { path: 'subject.state', op: 'eq', value: 'lead' },
          ],
        },
        [],
      ),
    ).toBe('primary email is set or 1 more');
  });

  it('flags required inputs left empty and branches without conditions', () => {
    const problems = flowProblems(
      [
        ...flow,
        { id: 'e', type: 'branch', conditions: { match: 'all', rules: [] }, then: [], else: [] },
      ],
      actions,
    );

    expect(problems.get('a')).toEqual(['Fill in members to rotate through']);
    expect(problems.get('n')).toBeUndefined();
    expect(problems.get('e')).toEqual(['Add a condition']);
  });
});

describe('action inputs', () => {
  const email: ActionInfo = {
    type: 'core.email.send',
    label: 'Send an email',
    description: null,
    source: 'core',
    subject: null,
    fields: [
      { key: 'to', label: 'To', type: 'recipients', required: true },
      { key: 'subject', label: 'Subject', type: 'text', required: true },
    ],
  };

  const move: ActionInfo = {
    type: 'core.lead.move',
    label: 'Move the lead to a stage',
    description: null,
    source: 'core',
    subject: 'customer',
    fields: [{ key: 'stage', label: 'Stage', type: 'lead_stage', required: true }],
  };

  const setField: ActionInfo = {
    type: 'core.customer.set_field',
    label: 'Set a custom field',
    description: null,
    source: 'core',
    subject: 'customer',
    fields: [{ key: 'fieldId', label: 'Field', type: 'custom_field', required: true }],
  };

  it('starts an email addressed to the record', () => {
    expect(actionDefaults(email)).toEqual({ to: 'subject' });
    expect(actionDefaults(move)).toEqual({});
  });

  it('names stages and custom fields on the card, not their ids', () => {
    const context = {
      actions: [move, setField],
      events: [],
      fields: [{ path: 'subject.customFields.f1', label: 'Plan (custom)', type: 'select' }],
      stages: [{ id: 's1', name: 'Qualified' }],
    };

    expect(
      describeStep(
        { id: 'm', type: 'action', action: 'core.lead.move', input: { stage: 's1' } },
        context,
      ).detail,
    ).toBe('Stage: Qualified');
    expect(
      describeStep(
        { id: 'f', type: 'action', action: 'core.customer.set_field', input: { fieldId: 'f1' } },
        context,
      ).detail,
    ).toBe('Field: Plan');
  });
});
