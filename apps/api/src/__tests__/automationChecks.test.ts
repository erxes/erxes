import type { ConditionGroup } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { type DefinitionInput, useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';

type Step = DefinitionInput['steps'][number];

const onCustomer = { kind: 'event', event: 'core.customer.created' } as const;
const byHand = { kind: 'manual' } as const;
const stop: Step = { id: 'stop', type: 'stop' };

const rocket = (id: string): Step => ({
  id,
  type: 'action',
  action: 'core.rocket.launch',
  input: {},
});

const note = (id: string, body: unknown): Step => ({
  id,
  type: 'action',
  action: 'core.note.add',
  input: { body },
});

const waitFor = (id: string, event: string): Step => ({
  id,
  type: 'wait_for',
  event,
  amount: 1,
  unit: 'days',
});

const onDate = (field: string): DefinitionInput => ({
  trigger: { kind: 'date', subject: 'customer', field },
  steps: [stop],
});

const on = (path: string): ConditionGroup => ({ match: 'all', rules: [{ path, op: 'exists' }] });

/** What saving a definition would find wrong with its trigger and steps, before any run. */
describe('automation checks', { timeout: 180_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  const problemsOf = async (definition: DefinitionInput) =>
    (await t.owner().automations.check({ definition })).problems;

  it('finds unknown triggers and actions, and repeated ids, in every arm of every step', async () => {
    expect(await problemsOf({ trigger: onCustomer, steps: [stop] })).toEqual([]);
    expect(
      await problemsOf({
        trigger: { kind: 'event', event: 'core.rocket.launched' },
        steps: [stop],
      }),
    ).toEqual(['Unknown trigger core.rocket.launched']);

    expect(
      await problemsOf({
        trigger: onCustomer,
        steps: [
          {
            id: 'b',
            type: 'branch',
            conditions: on('subject.firstName'),
            then: [rocket('x1')],
            else: [rocket('x2')],
          },
          {
            id: 's',
            type: 'switch',
            cases: [{ conditions: on('subject.firstName'), steps: [rocket('x3')] }],
            otherwise: [rocket('x4')],
          },
          {
            id: 'p',
            type: 'split',
            paths: [
              { weight: 1, steps: [rocket('x5')] },
              { weight: 1, steps: [{ id: 'b', type: 'stop' }] },
            ],
          },
        ],
      }),
    ).toEqual([
      'Step x1: unknown action core.rocket.launch',
      'Step x2: unknown action core.rocket.launch',
      'Step x3: unknown action core.rocket.launch',
      'Step x4: unknown action core.rocket.launch',
      'Step x5: unknown action core.rocket.launch',
      'Two steps share the id b',
    ]);
  });

  it('refuses to turn on a definition with problems, listing every one', async () => {
    const { id } = await t.owner().automations.create({
      name: 'Broken',
      definition: { trigger: onCustomer, steps: [rocket('x1'), { id: 'd', type: 'delay' }] },
    });

    await expect(t.owner().automations.activate({ id })).rejects.toMatchObject({
      code: 'INVALID_AUTOMATION',
      message: 'Step x1: unknown action core.rocket.launch',
      data: {
        problems: ['Step x1: unknown action core.rocket.launch', 'Step d: how long to wait?'],
      },
    });
  });

  it('needs required fields filled, and a delay to know how long', async () => {
    expect(
      await problemsOf({
        trigger: onCustomer,
        steps: [
          note('n1', null),
          note('n2', ''),
          note('n3', 'Hello'),
          { id: 'a1', type: 'action', action: 'core.customer.assign', input: { userIds: [] } },
          {
            id: 'a2',
            type: 'action',
            action: 'core.customer.assign',
            input: { userIds: [t.ids.owner] },
          },
          { id: 'd1', type: 'delay' },
          { id: 'd2', type: 'delay', amount: 2, unit: 'days' },
          { id: 'd3', type: 'delay', until: '{{subject.createdAt}}' },
        ],
      }),
    ).toEqual([
      'Step n1 (Add a note): Note is required',
      'Step n2 (Add a note): Note is required',
      'Step a1 (Assign an owner (round-robin)): Members to rotate through is required',
      'Step d1: how long to wait?',
    ]);
  });

  it('needs the record a step works on to be the one runs are about', async () => {
    const tagCompany: Step = { id: 'tc', type: 'action', action: 'core.company.tag', input: {} };
    const tagCustomer: Step = { id: 'tu', type: 'action', action: 'core.customer.tag', input: {} };

    expect(
      await problemsOf({ trigger: onCustomer, steps: [tagCustomer, note('n', 'x'), tagCompany] }),
    ).toEqual(['Step tc (Tag the company) needs a company, but runs are about a customer']);
    expect(await problemsOf({ trigger: byHand, steps: [tagCustomer, note('n', 'x')] })).toEqual([
      "Step tu (Tag the customer) needs a customer or company, but runs aren't about one",
      "Step n (Add a note) needs a customer or company, but runs aren't about one",
    ]);
    expect(
      await problemsOf({
        trigger: { kind: 'schedule', every: 'day', audience: { type: 'company' } },
        steps: [tagCompany, tagCustomer],
      }),
    ).toEqual(['Step tu (Tag the customer) needs a customer, but runs are about a company']);
    expect(
      await problemsOf({
        trigger: { kind: 'event', event: 'core.company.created' },
        steps: [tagCustomer],
      }),
    ).toEqual(['Step tu (Tag the customer) needs a customer, but runs are about a company']);
    expect(
      await problemsOf({
        trigger: { kind: 'date', subject: 'company', field: 'birthDate' },
        steps: [tagCustomer],
      }),
    ).toEqual(['Step tu (Tag the customer) needs a customer, but runs are about a company']);
  });

  it('waits only for known events about the record runs are about', async () => {
    expect(
      await problemsOf({
        trigger: onCustomer,
        steps: [waitFor('w1', 'core.customer.updated'), waitFor('w2', 'core.rocket.landed')],
      }),
    ).toEqual(['Step w2: unknown event core.rocket.landed']);
    expect(
      await problemsOf({ trigger: byHand, steps: [waitFor('w', 'core.customer.updated')] }),
    ).toEqual(["Step w waits for an event about the record, but runs aren't about one"]);
  });

  it('refuses a template filter that does not exist, wherever the step is', async () => {
    expect(
      await problemsOf({
        trigger: onCustomer,
        steps: [
          {
            id: 'b',
            type: 'branch',
            conditions: on('subject.firstName'),
            then: [note('n', '{{subject.firstName | shout}}')],
            else: [],
          },
        ],
      }),
    ).toEqual([expect.stringContaining('shout')]);
    expect(
      await problemsOf({
        trigger: onCustomer,
        steps: [note('n', '{{subject.firstName | upper}}')],
      }),
    ).toEqual([]);
  });

  it('needs a date trigger on a date field', async () => {
    const text = await t
      .owner()
      .fields.create({ contentType: 'customer', label: 'Nickname', type: 'text' });

    const renewal = await t
      .owner()
      .fields.create({ contentType: 'customer', label: 'Renewal', type: 'date' });

    expect(await problemsOf(onDate('birthDate'))).toEqual([]);
    expect(await problemsOf(onDate(renewal.id))).toEqual([]);
    expect(await problemsOf(onDate(text.id))).toEqual(['The date trigger needs a date field']);
    expect(await problemsOf(onDate('no-such-field'))).toEqual([
      'The date trigger needs a date field',
    ]);
  });
});
