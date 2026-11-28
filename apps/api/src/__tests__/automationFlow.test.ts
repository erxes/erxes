import { describe, expect, it } from 'vite-plus/test';
import { action, forCustomer, useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { makeDue, settle } from './settle';

const note = (id: string, body: string) => action(id, 'core.note.add', { body });

const when = (path: string, value: unknown) => ({
  match: 'all' as const,
  rules: [{ path, op: 'eq' as const, value }],
});

const MINUTE = 60_000;

/** What each kind of step records as its output, and which steps a run takes after it. */
describe('automation flow', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useAutomations();
  const { onlyRun } = t;

  const trace = async (id: string) =>
    (await onlyRun(id)).steps.map((step) => ({ id: step.stepId, output: step.output }));

  it('records the arm a branch, a switch and a split took, and stops at a stop', async () => {
    const id = await t.active(
      'Routes',
      forCustomer('Routed', [
        {
          id: 'b',
          type: 'branch',
          conditions: when('subject.state', 'lead'),
          then: [note('yes', 'a lead')],
          else: [note('no', 'not a lead')],
        },
        {
          id: 'b2',
          type: 'branch',
          conditions: when('subject.state', 'customer'),
          then: [note('yes2', 'a customer')],
          else: [note('no2', 'not a customer')],
        },
        {
          id: 's1',
          type: 'switch',
          cases: [
            {
              label: 'Customer',
              conditions: when('subject.state', 'customer'),
              steps: [note('c0', 'customer')],
            },
            {
              label: 'Lead',
              conditions: when('subject.state', 'lead'),
              steps: [note('c1', 'lead')],
            },
          ],
          otherwise: [note('o1', 'neither')],
        },
        {
          id: 's2',
          type: 'switch',
          cases: [
            { conditions: when('subject.state', 'customer'), steps: [note('c2', 'customer')] },
          ],
          otherwise: [note('o2', 'otherwise')],
        },
        {
          id: 's3',
          type: 'switch',
          cases: [
            {
              label: 'First',
              conditions: when('subject.state', 'lead'),
              steps: [note('c3', 'first')],
            },
          ],
          otherwise: [note('o3', 'otherwise')],
        },
        {
          id: 'p',
          type: 'split',
          paths: [
            { label: 'A', weight: 50, steps: [note('pa', 'A')] },
            { weight: 50, steps: [note('pb', 'B')] },
          ],
        },
        { id: 'end', type: 'stop' },
        note('never', 'after the stop'),
      ]),
    );

    await t.owner().customers.create({ firstName: 'Routed', state: 'lead' });
    await settle();

    expect((await onlyRun(id)).run.status).toBe('succeeded');

    const steps = await trace(id);
    const split = steps.find((step) => step.id === 'p')?.output;
    const took = split && typeof split === 'object' && 'path' in split ? split.path : null;

    expect(steps.map((step) => step.id)).toEqual([
      'b',
      'yes',
      'b2',
      'no2',
      's1',
      'c1',
      's2',
      'o2',
      's3',
      'c3',
      'p',
      took === 0 ? 'pa' : 'pb',
      'end',
    ]);
    const notes = ['yes', 'no2', 'c1', 'o2', 'c3', 'pa', 'pb'];

    expect(steps.filter((step) => !notes.includes(step.id))).toEqual([
      { id: 'b', output: { matched: true } },
      { id: 'b2', output: { matched: false } },
      { id: 's1', output: { case: 1, label: 'Lead' } },
      { id: 's2', output: { case: 'otherwise', label: null } },
      { id: 's3', output: { case: 0, label: 'First' } },
      { id: 'p', output: { path: took, label: took === 0 ? 'A' : null } },
      { id: 'end', output: null },
    ]);
  });

  it('carries on at once after a date already passed, and waits minutes by default', async () => {
    const passed = await t.active(
      'Past date',
      forCustomer('Past', [
        { id: 'd', type: 'delay', until: '{{subject.createdAt | add_days: -30}}' },
        note('n', 'went on'),
      ]),
    );

    const minutes = await t.active(
      'Minutes',
      forCustomer('Minutes', [{ id: 'd', type: 'delay', amount: 5 }, note('n', 'later')]),
    );

    const before = Date.now();

    await t.owner().customers.create({ firstName: 'Past' });
    await t.owner().customers.create({ firstName: 'Minutes' });
    await settle();

    const [pastRun] = await t.runsOf(passed);
    const steps = await trace(passed);
    const waited = steps[0]?.output;

    const waitedUntil =
      waited && typeof waited === 'object' && 'waitedUntil' in waited
        ? String(waited.waitedUntil)
        : '';

    expect(pastRun?.status).toBe('succeeded');
    expect(steps.map((step) => step.id)).toEqual(['d', 'n']);
    expect(Date.parse(waitedUntil)).toBeGreaterThanOrEqual(before - MINUTE);
    expect(Date.parse(waitedUntil)).toBeLessThanOrEqual(Date.now());

    const [waiting] = await t.runsOf(minutes);
    const until = Date.parse(waiting?.waitingUntil ?? '');

    expect(waiting?.status).toBe('waiting');
    expect(until).toBeGreaterThan(before + 4 * MINUTE);
    expect(until).toBeLessThan(Date.now() + 6 * MINUTE);

    await makeDue();
    await settle();

    const [woken] = await trace(minutes);

    expect(woken).toEqual({ id: 'd', output: { waitedUntil: new Date(until).toISOString() } });
  });

  it('fails a delay whose date is not a date, after its retries', async () => {
    const id = await t.active(
      'Bad date',
      forCustomer('Undated', [
        { id: 'd', type: 'delay', until: '{{subject.tagIds | count}}' },
        note('n', 'never'),
      ]),
    );

    await t.owner().customers.create({ firstName: 'Undated' });
    await settle();
    expect((await t.runsOf(id))[0]?.status).toBe('running');

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await makeDue();
      await settle();
    }

    expect((await t.runsOf(id))[0]?.status).toBe('failed');
  });

  it('gives up waiting for an event after the time it was given', async () => {
    const id = await t.active(
      'Wait two hours',
      forCustomer('Patient', [
        { id: 'w', type: 'wait_for', event: 'core.customer.updated', amount: 2, unit: 'hours' },
      ]),
    );

    const before = Date.now();

    await t.owner().customers.create({ firstName: 'Patient' });
    await settle();

    const [waiting] = await t.runsOf(id);
    const until = Date.parse(waiting?.waitingUntil ?? '');

    expect(waiting?.status).toBe('waiting');
    expect(until).toBeGreaterThan(before + 119 * MINUTE);
    expect(until).toBeLessThan(Date.now() + 121 * MINUTE);

    await makeDue();
    await settle();

    expect(await trace(id)).toEqual([{ id: 'w', output: { matched: false, timedOut: true } }]);
  });

  it('shows later steps the record as earlier steps left it, and leaves once that meets the goal', async () => {
    const renamed = await t.active(
      'Rename',
      forCustomer('Before', [
        { id: 'u', type: 'action', action: 'core.customer.update', input: { lastName: 'After' } },
        note('n', 'Now {{subject.lastName}}'),
      ]),
    );

    const goal = await t.active('Convert', {
      ...forCustomer('Convert', [
        { id: 'u', type: 'action', action: 'core.customer.update', input: { state: 'customer' } },
        note('n', 'Still a lead'),
      ]),
      goal: when('subject.state', 'customer'),
    });

    await t.owner().customers.create({ firstName: 'Before', lastName: 'Old' });
    await t.owner().customers.create({ firstName: 'Convert', state: 'lead' });
    await settle();

    expect((await onlyRun(renamed)).steps.find((step) => step.stepId === 'n')?.input).toEqual({
      body: 'Now After',
    });

    const converted = await onlyRun(goal);

    expect(converted.run.status).toBe('succeeded');
    expect(converted.run.goalReachedAt).not.toBeNull();
    expect(converted.steps.map((step) => step.stepId)).toEqual(['u']);
  });

  it('runs branches on a run about no record', async () => {
    const { id } = await t.owner().automations.create({
      name: 'No record',
      definition: {
        trigger: { kind: 'manual' },
        steps: [
          {
            id: 'b',
            type: 'branch',
            conditions: { match: 'all', rules: [{ path: 'subject.firstName', op: 'exists' }] },
            then: [],
            else: [],
          },
        ],
      },
    });

    await t.owner().automations.activate({ id });
    await t.owner().automations.start({ id });
    await settle();

    expect((await onlyRun(id)).run.status).toBe('succeeded');
    expect(await trace(id)).toEqual([{ id: 'b', output: { matched: false } }]);
  });
});
