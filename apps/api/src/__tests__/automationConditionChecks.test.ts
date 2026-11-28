import type { ConditionGroup } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { type DefinitionInput, useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';

const onCustomer = { kind: 'event', event: 'core.customer.created' } as const;
const byHand = { kind: 'manual' } as const;
const stop = { id: 'stop', type: 'stop' } as const;

const on = (path: string): ConditionGroup => ({ match: 'all', rules: [{ path, op: 'exists' }] });

const deep = (rule: ConditionGroup['rules'][number], levels: number): ConditionGroup =>
  levels === 1
    ? { match: 'all', rules: [rule] }
    : { match: 'all', rules: [deep(rule, levels - 1)] };

/** Bills the run's customer through the Test gateway, on the connection given in `input`. */
const bill = (input: Record<string, unknown>): DefinitionInput => ({
  trigger: onCustomer,
  steps: [
    {
      id: 'bill',
      type: 'action',
      action: 'test.invoice.create',
      input: { amount: 1000, description: 'Fee', ...input },
    },
  ],
});

/** What saving a definition would find wrong with its conditions, connections and fields. */
describe('automation condition checks', { timeout: 180_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  const problemsOf = async (definition: DefinitionInput) =>
    (await t.owner().automations.check({ definition })).problems;

  it('checks the conditions of the trigger, the goal and every step against the record’s fields', async () => {
    expect(
      await problemsOf({
        trigger: { ...onCustomer, conditions: on('subject.t') },
        goal: on('subject.g'),
        steps: [
          { id: 'b', type: 'branch', conditions: on('subject.b'), then: [], else: [] },
          {
            id: 'w',
            type: 'wait_for',
            event: 'core.customer.updated',
            conditions: on('subject.w'),
            amount: 1,
            unit: 'days',
          },
          {
            id: 's',
            type: 'switch',
            cases: [
              { conditions: on('subject.c1'), steps: [] },
              { conditions: on('subject.c2'), steps: [] },
            ],
            otherwise: [],
          },
          { id: 'n', type: 'action', action: 'core.note.add', input: { body: 'x' } },
        ],
      }),
    ).toEqual(
      ['t', 'g', 'b', 'w', 'c1', 'c2'].map((name) => `Conditions: unknown field subject.${name}`),
    );

    expect(
      await problemsOf({
        trigger: {
          kind: 'date',
          subject: 'customer',
          field: 'birthDate',
          conditions: on('subject.d'),
        },
        steps: [stop],
      }),
    ).toEqual(['Conditions: unknown field subject.d']);
    expect(
      await problemsOf({
        trigger: { kind: 'manual', audience: { type: 'company', conditions: on('subject.a') } },
        steps: [stop],
      }),
    ).toEqual(['Conditions: unknown field subject.a']);
    expect(
      await problemsOf({
        trigger: {
          ...onCustomer,
          conditions: {
            match: 'all',
            rules: [
              { path: 'event.payload.x', op: 'exists' },
              deep({ path: 'subject.firstName', op: 'exists' }, 1),
            ],
          },
        },
        steps: [stop],
      }),
    ).toEqual([]);
  });

  it('limits how deep condition groups go, with or without a record', async () => {
    const tooDeep = deep({ path: 'subject.firstName', op: 'exists' }, 4);

    expect(await problemsOf({ trigger: onCustomer, goal: tooDeep, steps: [stop] })).toEqual([
      'Conditions: At most three levels of groups',
    ]);
    expect(await problemsOf({ trigger: byHand, goal: tooDeep, steps: [stop] })).toEqual([
      'At most three levels of groups',
    ]);
    expect(
      await problemsOf({
        trigger: byHand,
        goal: deep({ path: 'subject.anything', op: 'exists' }, 3),
        steps: [stop],
      }),
    ).toEqual([]);
    expect(
      await problemsOf({
        trigger: onCustomer,
        goal: {
          match: 'all',
          rules: [{ path: 'subject.firstName', op: 'within_last', value: 'soon' }],
        },
        steps: [stop],
      }),
    ).toEqual([expect.stringMatching(/^Conditions: ./)]);
  });

  it('takes a connection only while it is active here', async () => {
    expect(await problemsOf(bill({}))).toEqual([
      'Step bill: Test is not connected: connect it in Settings › Integrations',
    ]);

    const gateway = await t.owner().integrations.connect({ key: 'test', name: 'Till', keys: {} });
    const second = await t.owner().integrations.connect({ key: 'test', name: 'Online', keys: {} });

    expect(await problemsOf(bill({}))).toEqual([]);
    expect(await problemsOf(bill({ connection: '' }))).toEqual([]);
    expect(await problemsOf(bill({ connection: gateway.id }))).toEqual([]);
    expect(await problemsOf(bill({ connection: second.id }))).toEqual([]);
    expect(await problemsOf(bill({ connection: 'gone' }))).toEqual([
      expect.stringMatching(/^Step bill \(.+\): that connection is not active$/),
    ]);

    const { actions } = await t.owner().automations.catalog({});

    const optionsOf = (type: string) =>
      Object.fromEntries(
        (actions.find((item) => item.type === type)?.fields ?? []).flatMap((field) =>
          field.options ? [[field.key, field.options.map((option) => option.label)]] : [],
        ),
      );

    expect(optionsOf('test.invoice.create')).toEqual({ connection: ['Till', 'Online'] });
    expect(optionsOf('core.customer.update')).toEqual({ state: ['Lead', 'Customer'] });
  });

  it('offers each field of the record once, marking the ones only conditions can read', async () => {
    const fields = (await t.owner().automations.fields({})).data;
    const paths = fields.map((field) => field.path);

    expect(paths.slice(0, 3)).toEqual(['event.type', 'event.actorType', 'event.payload']);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(expect.arrayContaining(['subject.firstName', 'subject.primaryName']));

    const byPath = new Map(fields.map((field) => [field.path, field]));

    expect(byPath.get('subject.firstName')?.conditionsOnly).toBe(false);
    expect(byPath.get('subject.company.industry')?.conditionsOnly).toBe(true);
    expect(
      fields.filter((field) => field.group === 'company').every((field) => field.conditionsOnly),
    ).toBe(true);
  });
});
