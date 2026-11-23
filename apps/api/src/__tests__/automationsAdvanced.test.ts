import { describe, expect, it } from 'vite-plus/test';
import { loggedEmails } from '~/modules/email/email';
import { action, type DefinitionInput, useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { makeDue, settle } from './settle';

/** A note on every new company. */
const note = (body: string): DefinitionInput => ({
  trigger: { kind: 'event', event: 'core.company.created' },
  steps: [{ id: 'n', type: 'action', action: 'core.note.add', input: { body } }],
});

const mail = (cc: string): DefinitionInput => ({
  trigger: { kind: 'event', event: 'core.customer.created' },
  steps: [
    {
      id: 'mail',
      type: 'action',
      action: 'core.email.send',
      input: { to: 'subject', subject: 'Copied', body: 'Hello', cc },
    },
  ],
});

describe('automations: paths, testing and operations', { timeout: 600_000 }, () => {
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
      .automations.test({ id: draft.id, subjectType: 'customer', subjectId: sample.id });

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

  it('dry-runs an unsaved draft definition on an active automation without publishing it', async () => {
    const id = await t.active('Live', {
      trigger: { kind: 'event', event: 'core.customer.created' },
      steps: [
        {
          id: 'n1',
          type: 'action',
          action: 'core.note.add',
          input: { body: 'Live {{subject.firstName}}' },
        },
      ],
    });

    const sample = await t.owner().customers.create({ firstName: 'Ada', state: 'lead' });
    await settle();

    const result = await t.owner().automations.test({
      id,
      subjectType: 'customer',
      subjectId: sample.id,
      definition: {
        trigger: { kind: 'event', event: 'core.customer.created' },
        steps: [
          {
            id: 'n2',
            type: 'action',
            action: 'core.note.add',
            input: { body: 'Candidate {{subject.firstName}}' },
          },
        ],
      },
    });

    expect(result.triggerMatches).toBe(true);
    expect(result.problems).toEqual([]);
    expect(result.trace.map((item) => item.stepId)).toEqual(['n2']);
    expect(result.trace[0]?.input).toEqual({ body: 'Candidate Ada' });

    const broken = await t.owner().automations.test({
      id,
      subjectType: 'customer',
      subjectId: sample.id,
      definition: {
        trigger: { kind: 'event', event: 'core.customer.created' },
        steps: [
          {
            id: 'dup',
            type: 'action',
            action: 'core.note.add',
            input: { body: 'First {{subject.firstName}}' },
          },
          {
            id: 'dup',
            type: 'action',
            action: 'core.note.add',
            input: { body: 'Second {{subject.firstName}}' },
          },
        ],
      },
    });

    expect(broken.problems).toContain('Two steps share the id dup');
    expect(broken.trace.map((item) => item.stepId)).toEqual(['dup', 'dup']);
    expect(broken.trace[0]?.input).toEqual({ body: 'First Ada' });

    const saved = await t.owner().automations.get({ id });

    expect(saved.activeVersion).toBe(1);
    expect(saved.definition.steps[0]?.id).toBe('n1');
  });

  it('requires automations.manage to dry-run a draft definition but still lets viewers test the saved one', async () => {
    const previous =
      (await t.owner().roles.list({})).data.find((role) => role.key === 'member')?.permissions ??
      [];

    await t.owner().roles.update({ key: 'member', permissions: [...previous, 'automations.view'] });

    try {
      const trigger: DefinitionInput['trigger'] = { kind: 'event', event: 'core.customer.created' };

      const { id } = await t.owner().automations.create({
        name: 'Viewer test',
        definition: {
          trigger,
          steps: [action('saved', 'core.note.add', { body: 'Saved {{subject.firstName}}' })],
        },
      });

      const sample = await t.owner().customers.create({ firstName: 'Grace', state: 'lead' });

      await expect(
        t.member().automations.test({
          id,
          subjectType: 'customer',
          subjectId: sample.id,
          definition: {
            trigger,
            steps: [action('leak', 'core.note.add', { body: '{{subject | json}}' })],
          },
        }),
      ).rejects.toMatchObject({
        status: 403,
        code: 'NOT_ALLOWED',
        data: { permission: 'automations.manage' },
      });

      const result = await t
        .member()
        .automations.test({ id, subjectType: 'customer', subjectId: sample.id });

      expect(result.triggerMatches).toBe(true);
      expect(result.trace.map((item) => item.stepId)).toEqual(['saved']);
      expect(result.trace[0]?.input).toEqual({ body: 'Saved Grace' });
    } finally {
      await t.owner().roles.update({ key: 'member', permissions: previous });
    }
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

  it('copies an email step to its Cc, at most 5 addresses', async () => {
    const check = async (cc: string) =>
      (await t.owner().automations.check({ definition: mail(cc) })).problems;

    expect(await check('a@cc.mn, b@cc.mn, c@cc.mn, d@cc.mn, e@cc.mn, f@cc.mn')).toEqual([
      'Step mail (Send an email): Cc takes at most 5 addresses',
    ]);
    expect(await check('a@cc.mn, not-an-address')).toEqual([
      'Step mail (Send an email): an address in Cc is not an email address',
    ]);
    expect(await check('{{subject.primaryEmail}}')).toEqual([]);

    const id = await t.active('Cc', mail('Boss@cc.mn, copied@mail.mn, boss@cc.mn'));

    await t.owner().customers.create({ firstName: 'Copied', primaryEmail: 'copied@mail.mn' });
    await settle();

    // The recipient isn't copied on their own email, and a repeat goes once.
    expect(loggedEmails.filter((email) => email.subject === 'Copied')).toMatchObject([
      { to: 'copied@mail.mn', cc: ['boss@cc.mn'] },
    ]);
    expect((await t.runsOf(id))[0]?.status).toBe('succeeded');
  });
});
