import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { type DefinitionInput, makeDue, useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { settle } from './settle';

/** The automation an audit entry was made by. */
const ByAutomation = z.object({ automation: z.object({ id: z.string() }) });

/** Waits two hours, then adds a note. */
const later = (body: string): DefinitionInput => ({
  trigger: { kind: 'event', event: 'core.company.created' },
  steps: [
    { id: 'wait', type: 'delay', amount: 2, unit: 'hours' },
    { id: 'note', type: 'action', action: 'core.note.add', input: { body } },
  ],
});

describe('automations', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useAutomations();
  const { active, runsOf } = t;
  let receiver: Server;
  let hookUrl = '';
  let answer = 200;
  let vipTag = '';

  beforeAll(async () => {
    receiver = createServer((req, res) => {
      req.resume();
      req.on('end', () => {
        res.statusCode = answer;
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ ok: answer === 200 }));
      });
    }).listen(0);

    const address = receiver.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    hookUrl = `http://127.0.0.1:${address.port}/hook`;
    vipTag = (await t.owner().tags.create({ type: 'customer', name: 'vip', colorCode: '#ff0000' }))
      .id;
  });

  afterAll(() => new Promise<void>((resolve) => receiver.close(() => resolve())));

  it('runs steps for matching events: tags, branches, updates, notes with templates, notifications', async () => {
    const created = await t.owner().automations.create({
      name: 'VIP welcome',
      definition: {
        trigger: {
          kind: 'event',
          event: 'core.customer.created',
          conditions: {
            match: 'all',
            rules: [{ path: 'subject.primaryEmail', op: 'contains', value: '@vip.mn' }],
          },
        },
        steps: [
          { id: 'tag', type: 'action', action: 'core.customer.tag', input: { add: [vipTag] } },
          {
            id: 'lead',
            type: 'branch',
            conditions: {
              match: 'all',
              rules: [{ path: 'subject.state', op: 'eq', value: 'lead' }],
            },
            then: [
              {
                id: 'promote',
                type: 'action',
                action: 'core.customer.update',
                input: { state: 'customer', ownerId: t.ids.owner },
              },
            ],
            else: [],
          },
          {
            id: 'note',
            type: 'action',
            action: 'core.note.add',
            input: {
              body: 'Welcome {{subject.firstName}}, tagged by {{steps.tag.output.added.0}}',
            },
          },
          {
            id: 'tell',
            type: 'action',
            action: 'core.notification.send',
            input: { owner: true, title: 'New VIP: {{subject.firstName}}' },
          },
        ],
      },
    });

    const { id } = created;

    await expect(t.member().automations.activate({ id })).rejects.toMatchObject({ status: 403 });
    expect(await t.owner().automations.activate({ id })).toMatchObject({
      status: 'active',
      activeVersion: 1,
    });

    const vip = await t
      .owner()
      .customers.create({ firstName: 'Bold', primaryEmail: 'bold@vip.mn', state: 'lead' });

    await t.owner().customers.create({ firstName: 'Plain', primaryEmail: 'plain@mail.mn' });
    await settle();

    const runs = await runsOf(id);

    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({
      status: 'succeeded',
      subject: { type: 'customer', id: vip.id },
    });

    const detail = await t.owner().automations.run({ runId: runs[0]?.id ?? '' });

    expect(detail.steps.map((step) => `${step.stepId}:${step.status}`)).toEqual([
      'tag:succeeded',
      'lead:succeeded',
      'promote:succeeded',
      'note:succeeded',
      'tell:succeeded',
    ]);

    const customer = await t.owner().customers.get({ id: vip.id });

    expect(customer).toMatchObject({ state: 'customer', ownerId: t.ids.owner });
    expect(customer.tagIds).toContain(vipTag);

    const notes = await t
      .owner()
      .activities.list({ targetType: 'customer', targetId: vip.id, kind: 'notes' });

    expect(notes.data[0]?.data.body).toContain(`Welcome Bold, tagged by ${vipTag}`);

    const inbox = await t.owner().notifications.list({ kind: 'core.automation.message' });

    expect(inbox.data[0]).toMatchObject({ title: 'New VIP: Bold' });

    // Changes it made are audited as the automation's.
    const audit = await t.owner().audit.list({ targetId: vip.id });

    expect(
      audit.data.some((entry) => ByAutomation.safeParse(entry.metadata).data?.automation.id === id),
    ).toBe(true);
  });

  it("doesn't trigger itself, and keeps a customer out once with reentry 'once'", async () => {
    const self = await active('Self', {
      trigger: { kind: 'event', event: 'core.customer.updated' },
      reentry: 'always',
      steps: [
        {
          id: 'touch',
          type: 'action',
          action: 'core.customer.update',
          input: { description: 'touched {{event.id}}' },
        },
      ],
    });

    const customer = await t.owner().customers.create({ firstName: 'Loop' });
    const rename = (lastName: string) => t.owner().customers.update({ id: customer.id, lastName });

    await rename('Er');
    await settle();

    // One run for the member's change; its own change doesn't start another.
    expect((await runsOf(self)).filter((run) => run.subject?.id === customer.id)).toHaveLength(1);
    await t.owner().automations.pause({ id: self });

    const once = await active('Once', {
      trigger: { kind: 'event', event: 'core.customer.updated' },
      reentry: 'once',
      steps: [{ id: 'note', type: 'action', action: 'core.note.add', input: { body: 'once' } }],
    });

    await rename('First');
    await settle();
    await rename('Second');
    await settle();

    // Two changes to the same customer, one run: they went through once.
    expect(await runsOf(once)).toHaveLength(1);
    await t.owner().automations.pause({ id: once });
  });

  it('waits on delays, and runs in progress keep their version when the automation changes', async () => {
    const id = await active('Later', later('version one'));
    const company = await t.owner().companies.create({ primaryName: 'Waiting LLC' });

    await settle();

    const [waiting] = await runsOf(id);

    expect(waiting).toMatchObject({ status: 'waiting' });
    expect(new Date(waiting?.waitingUntil ?? 0).getTime()).toBeGreaterThan(Date.now() + 3_600_000);

    // Published while the run waits.
    expect(
      (await t.owner().automations.update({ id, definition: later('version two') })).activeVersion,
    ).toBe(2);

    await makeDue();
    await settle();
    expect((await runsOf(id))[0]).toMatchObject({ status: 'succeeded', version: 1 });

    const notes = await t
      .owner()
      .activities.list({ targetType: 'company', targetId: company.id, kind: 'notes' });

    expect(notes.data.map((entry) => entry.data.body)).toEqual(['version one']);
  });

  it('retries a failing step, fails the run with the reason, and continues it on retry', async () => {
    const id = await active('Call out', {
      trigger: {
        kind: 'event',
        event: 'core.customer.created',
        conditions: {
          match: 'all',
          rules: [{ path: 'subject.firstName', op: 'eq', value: 'Caller' }],
        },
      },
      steps: [{ id: 'post', type: 'action', action: 'core.webhook.post', input: { url: hookUrl } }],
    });

    answer = 500;
    await t.owner().customers.create({ firstName: 'Caller' });
    await settle();

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await makeDue();
      await settle();
    }

    const [failed] = await runsOf(id);

    expect(failed).toMatchObject({ status: 'failed' });
    expect(failed?.error).toContain('HTTP 500');

    const runId = failed?.id ?? '';

    expect((await t.owner().automations.run({ runId })).steps.at(-1)).toMatchObject({
      stepId: 'post',
      status: 'failed',
    });

    answer = 200;
    await t.owner().automations.retryRun({ runId });
    await makeDue();
    await settle();
    expect((await runsOf(id))[0]).toMatchObject({ status: 'succeeded' });
  });

  it('refuses definitions that would fail: unknown actions, missing fields, wrong subject', async () => {
    const steps: DefinitionInput['steps'][] = [
      [{ id: 'x', type: 'action', action: 'core.rocket.launch', input: {} }],
      [{ id: 'x', type: 'action', action: 'core.note.add', input: {} }],
      [{ id: 'x', type: 'action', action: 'core.company.tag', input: { add: [] } }],
    ];

    for (const bad of steps) {
      const { id } = await t.owner().automations.create({
        name: 'Bad',
        definition: { trigger: { kind: 'event', event: 'core.customer.created' }, steps: bad },
      });

      await expect(t.owner().automations.activate({ id })).rejects.toMatchObject({
        code: 'INVALID_AUTOMATION',
      });
    }

    const catalog = await t.owner().automations.catalog({});

    expect(catalog.actions.map((action) => action.type)).toContain('core.customer.update');
    expect(catalog.triggers.map((trigger) => trigger.type)).toContain('core.customer.created');
  });
});
