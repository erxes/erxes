import { expect, it } from 'vite-plus/test';
import { loggedEmails } from '~/modules/email/email';
import { type DefinitionInput, makeDue, useAutomations } from './automations.fixture';
import { describeWithDb, useTestDatabase } from './db';
import { settle } from './settle';

/** A note on every new company. */
const note = (body: string): DefinitionInput => ({
  trigger: { kind: 'event', event: 'core.company.created' },
  steps: [{ id: 'n', type: 'action', action: 'core.note.add', input: { body } }],
});

describeWithDb('automations: paths, testing and operations', { timeout: 600_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  it('takes switch cases and A/B paths, sends emails, assigns round-robin, and counts each step', async () => {
    const id = await t.active('Route', {
      trigger: {
        kind: 'event',
        event: 'core.customer.created',
        conditions: {
          match: 'all',
          rules: [{ path: 'subject.firstName', op: 'starts_with', value: 'Route' }],
        },
      },
      steps: [
        {
          id: 's',
          type: 'switch',
          cases: [
            {
              label: 'Mail',
              conditions: { match: 'all', rules: [{ path: 'subject.primaryEmail', op: 'exists' }] },
              steps: [
                {
                  id: 'mail',
                  type: 'action',
                  action: 'core.email.send',
                  input: { to: 'subject', subject: 'Hi {{subject.firstName}}', body: 'Hello' },
                },
              ],
            },
          ],
          otherwise: [
            {
              id: 'assign',
              type: 'action',
              action: 'core.customer.assign',
              input: { userIds: [t.ids.owner, t.ids.member] },
            },
          ],
        },
        {
          id: 'ab',
          type: 'split',
          paths: [
            { label: 'A', weight: 50, steps: [] },
            { label: 'B', weight: 50, steps: [] },
          ],
        },
      ],
    });

    await t.owner().customers.create({ firstName: 'Route mail', primaryEmail: 'route@mail.mn' });

    const one = await t.owner().customers.create({ firstName: 'Route one' });
    const two = await t.owner().customers.create({ firstName: 'Route two' });

    await settle();

    expect(loggedEmails).toContainEqual(
      expect.objectContaining({ to: 'route@mail.mn', subject: 'Hi Route mail' }),
    );

    const owners = [
      (await t.owner().customers.get({ id: one.id })).ownerId,
      (await t.owner().customers.get({ id: two.id })).ownerId,
    ];

    expect(new Set(owners)).toEqual(new Set([t.ids.owner, t.ids.member]));

    const stats = await t.owner().automations.stats({ id });

    expect(stats.runs).toMatchObject({ total: 3, succeeded: 3 });
    expect(stats.steps.find((step) => step.stepId === 'assign')).toMatchObject({ succeeded: 2 });
  });

  it('dry-runs a draft without doing anything', async () => {
    const draft = await t.owner().automations.create({
      name: 'Draft',
      definition: {
        trigger: { kind: 'event', event: 'core.customer.created' },
        steps: [
          {
            id: 'b',
            type: 'branch',
            conditions: {
              match: 'all',
              rules: [{ path: 'subject.state', op: 'eq', value: 'lead' }],
            },
            then: [
              {
                id: 'n',
                type: 'action',
                action: 'core.note.add',
                input: { body: 'Hello {{subject.firstName | upper}}' },
              },
            ],
            else: [],
          },
        ],
      },
    });

    const sample = await t.owner().customers.create({ firstName: 'Sample', state: 'lead' });

    const test = await t
      .owner()
      .automations.test({ id: draft.id, subject: { type: 'customer', id: sample.id } });

    expect(test.triggerMatches).toBe(true);
    expect(test.trace.map((item) => item.stepId)).toEqual(['b', 'n']);
    expect(test.trace[1]?.input).toEqual({ body: 'Hello SAMPLE' });
    // Nothing happened for real: no run, and the note step wrote no note.
    expect(await t.runsOf(draft.id)).toEqual([]);
    await settle();

    const notes = await t
      .owner()
      .activities.list({ targetType: 'customer', targetId: sample.id, kind: 'notes' });

    expect(notes.data).toEqual([]);
  });

  it('limits runs an hour and keeps versions', async () => {
    const limited = await t.active('Limited', { ...note('x'), maxRunsPerHour: 1 });

    await t.owner().companies.create({ primaryName: 'One' });
    await t.owner().companies.create({ primaryName: 'Two' });
    await settle();
    expect(await t.runsOf(limited)).toHaveLength(1);
    expect((await t.owner().automations.stats({ id: limited })).skippedByLimit).toBe(1);

    await t.owner().automations.update({ id: limited, definition: note('v2') });

    const versions = await t.owner().automations.versions({ id: limited });

    expect(versions.data.map((item) => item.version)).toEqual([2, 1]);
    expect(await t.owner().automations.restoreVersion({ id: limited, version: 1 })).toMatchObject({
      activeVersion: 3,
    });
  });

  it('tells the owner when runs fail, and offers templates and fields', async () => {
    const failing = await t.active('Broken', {
      trigger: {
        kind: 'event',
        event: 'core.customer.created',
        conditions: {
          match: 'all',
          rules: [{ path: 'subject.firstName', op: 'eq', value: 'Breaks' }],
        },
      },
      steps: [
        {
          id: 'f',
          type: 'action',
          action: 'core.customer.set_field',
          input: { fieldId: 'no-such-field', value: '1' },
        },
      ],
    });

    await t.owner().customers.create({ firstName: 'Breaks' });

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await makeDue();
      await settle();
    }

    expect((await t.runsOf(failing))[0]?.status).toBe('failed');

    const inbox = await t.owner().notifications.list({ kind: 'core.automation.failed' });

    expect(inbox.data[0]).toMatchObject({ title: '“Broken” failed' });

    // Templates to start from, and fields for pickers.
    expect((await t.owner().automations.templates({})).data.length).toBeGreaterThanOrEqual(5);

    const fields = await t.owner().automations.fields({ subject: 'customer' });

    expect(fields.data.map((field) => field.path)).toContain('subject.primaryEmail');
  });
});
