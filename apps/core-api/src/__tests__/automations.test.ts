import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';
import { settle } from './settle';

describeWithDb('automations', { timeout: 300_000 }, () => {
  useTestDatabase();

  let api: Server;
  let receiver: Server;
  let base = '';
  let hookUrl = '';
  let answer = 200;
  let orgId = '';
  let ownerId = '';
  let owner = '';
  let memberToken = '';
  let vipTag = '';

  const call = async (token: string, method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  const makeDue = async () => {
    const { sql } = await import('drizzle-orm');

    await adminDb().execute(sql`update core_jobs set run_at = now() where status = 'queued'`);
  };

  beforeAll(async () => {
    const { users, newId } = await import('@erxes/core-db');

    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn' },
    });

    const memberId = newId();

    orgId = acme.organization.id;
    ownerId = acme.owner.id;
    await adminDb()
      .insert(users)
      .values({ id: memberId, orgId, email: 'm@acme.mn', role: 'member', status: 'active' });
    owner = await currentToken(ownerId, orgId);
    memberToken = await currentToken(memberId, orgId);
    api = createApp().listen(0);
    base = `http://127.0.0.1:${(api.address() as AddressInfo).port}`;
    receiver = createServer((req, res) => {
      req.resume();
      req.on('end', () => {
        res.statusCode = answer;
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ ok: answer === 200 }));
      });
    }).listen(0);
    hookUrl = `http://127.0.0.1:${(receiver.address() as AddressInfo).port}/hook`;
    vipTag = (
      await call(owner, 'POST', '/tags', { type: 'customer', name: 'vip', colorCode: '#ff0000' })
    ).body.id;
  });

  afterAll(async () => {
    api.closeAllConnections();
    await new Promise<void>((resolve) => api.close(() => resolve()));
    await new Promise<void>((resolve) => receiver.close(() => resolve()));
  });

  it('runs steps for matching events: tags, branches, updates, notes with templates, notifications', async () => {
    const created = await call(owner, 'POST', '/automations', {
      name: 'VIP welcome',
      definition: {
        trigger: {
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
                input: { state: 'customer', ownerId: ownerId },
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

    expect(created.status).toBe(201);
    expect(
      (await call(memberToken, 'POST', `/automations/${created.body.id}/activate`)).status,
    ).toBe(403);
    expect(
      (await call(owner, 'POST', `/automations/${created.body.id}/activate`)).body,
    ).toMatchObject({ status: 'active', activeVersion: 1 });

    const vip = await call(owner, 'POST', '/customers', {
      firstName: 'Bold',
      primaryEmail: 'bold@vip.mn',
      state: 'lead',
    });

    const other = await call(owner, 'POST', '/customers', {
      firstName: 'Plain',
      primaryEmail: 'plain@mail.mn',
    });

    await settle();

    const runs = await call(owner, 'GET', `/automations/${created.body.id}/runs`);

    expect(runs.body.data).toHaveLength(1);
    expect(runs.body.data[0]).toMatchObject({
      status: 'succeeded',
      subject: { type: 'customer', id: vip.body.id },
    });

    const detail = await call(owner, 'GET', `/automations/runs/${runs.body.data[0].id}`);

    expect(
      detail.body.steps.map(
        (step: { stepId: string; status: string }) => `${step.stepId}:${step.status}`,
      ),
    ).toEqual([
      'tag:succeeded',
      'lead:succeeded',
      'promote:succeeded',
      'note:succeeded',
      'tell:succeeded',
    ]);

    const customer = await call(owner, 'GET', `/customers/${vip.body.id}`);

    expect(customer.body).toMatchObject({ state: 'customer', ownerId });
    expect(
      customer.body.tagIds ?? customer.body.tags?.map((tag: { id: string }) => tag.id),
    ).toContain(vipTag);

    const timeline = await call(
      owner,
      'GET',
      `/activities?targetType=customer&targetId=${vip.body.id}&kind=notes`,
    );

    expect(timeline.body.data[0].summary ?? timeline.body.data[0].data?.body).toContain(
      `Welcome Bold, tagged by ${vipTag}`,
    );

    const inbox = await call(owner, 'GET', '/notifications?kind=core.automation.message');

    expect(inbox.body.data[0]).toMatchObject({ title: 'New VIP: Bold' });

    // Changes it made are audited as the automation's.
    const audit = await call(owner, 'GET', `/audit?targetId=${vip.body.id}`);

    const byAutomation = audit.body.data.filter(
      (entry: { metadata?: { automation?: { id: string } } }) =>
        entry.metadata?.automation?.id === created.body.id,
    );

    expect(byAutomation.length).toBeGreaterThan(0);
    expect(other.status).toBe(201);
  });

  it("doesn't trigger itself, and keeps a customer out once with reentry 'once'", async () => {
    const created = await call(owner, 'POST', '/automations', {
      name: 'Self',
      definition: {
        trigger: { event: 'core.customer.updated' },
        reentry: 'always',
        steps: [
          {
            id: 'touch',
            type: 'action',
            action: 'core.customer.update',
            input: { description: 'touched {{event.id}}' },
          },
        ],
      },
    });

    await call(owner, 'POST', `/automations/${created.body.id}/activate`);

    const customer = await call(owner, 'POST', '/customers', { firstName: 'Loop' });

    await call(owner, 'PATCH', `/customers/${customer.body.id}`, { lastName: 'Er' });
    await settle();

    const runs = await call(owner, 'GET', `/automations/${created.body.id}/runs`);

    // One run for the member's change; its own change doesn't start another.
    expect(
      runs.body.data.filter(
        (run: { subject: { id: string } }) => run.subject.id === customer.body.id,
      ),
    ).toHaveLength(1);
    await call(owner, 'POST', `/automations/${created.body.id}/pause`);

    const once = await call(owner, 'POST', '/automations', {
      name: 'Once',
      definition: {
        trigger: { event: 'core.customer.updated' },
        reentry: 'once',
        steps: [{ id: 'note', type: 'action', action: 'core.note.add', input: { body: 'once' } }],
      },
    });

    await call(owner, 'POST', `/automations/${once.body.id}/activate`);
    await call(owner, 'PATCH', `/customers/${customer.body.id}`, { lastName: 'First' });
    await settle();
    await call(owner, 'PATCH', `/customers/${customer.body.id}`, { lastName: 'Second' });
    await settle();

    const onceRuns = await call(owner, 'GET', `/automations/${once.body.id}/runs`);

    // Two changes to the same customer, one run: they went through once.
    expect(onceRuns.body.data).toHaveLength(1);
    await call(owner, 'POST', `/automations/${once.body.id}/pause`);
  });

  it('waits on delays, and runs in progress keep their version when the automation changes', async () => {
    const created = await call(owner, 'POST', '/automations', {
      name: 'Later',
      definition: {
        trigger: { event: 'core.company.created' },
        steps: [
          { id: 'wait', type: 'delay', amount: 2, unit: 'hours' },
          { id: 'note', type: 'action', action: 'core.note.add', input: { body: 'version one' } },
        ],
      },
    });

    await call(owner, 'POST', `/automations/${created.body.id}/activate`);

    const company = await call(owner, 'POST', '/companies', { primaryName: 'Waiting LLC' });

    await settle();

    let runs = await call(owner, 'GET', `/automations/${created.body.id}/runs`);

    expect(runs.body.data[0]).toMatchObject({ status: 'waiting' });
    expect(new Date(runs.body.data[0].waitingUntil).getTime()).toBeGreaterThan(
      Date.now() + 3_600_000,
    );

    // Published while the run waits.
    const changed = await call(owner, 'PATCH', `/automations/${created.body.id}`, {
      definition: {
        trigger: { event: 'core.company.created' },
        steps: [
          { id: 'wait', type: 'delay', amount: 2, unit: 'hours' },
          { id: 'note', type: 'action', action: 'core.note.add', input: { body: 'version two' } },
        ],
      },
    });

    expect(changed.body.activeVersion).toBe(2);

    await makeDue();
    await settle();

    runs = await call(owner, 'GET', `/automations/${created.body.id}/runs`);
    expect(runs.body.data[0]).toMatchObject({ status: 'succeeded', version: 1 });

    const timeline = await call(
      owner,
      'GET',
      `/activities?targetType=company&targetId=${company.body.id}&kind=notes`,
    );

    expect(JSON.stringify(timeline.body.data)).toContain('version one');
  });

  it('retries a failing step, fails the run with the reason, and continues it on retry', async () => {
    const created = await call(owner, 'POST', '/automations', {
      name: 'Call out',
      definition: {
        trigger: {
          event: 'core.customer.created',
          conditions: {
            match: 'all',
            rules: [{ path: 'subject.firstName', op: 'eq', value: 'Caller' }],
          },
        },
        steps: [
          { id: 'post', type: 'action', action: 'core.webhook.post', input: { url: hookUrl } },
        ],
      },
    });

    await call(owner, 'POST', `/automations/${created.body.id}/activate`);
    answer = 500;
    await call(owner, 'POST', '/customers', { firstName: 'Caller' });
    await settle();

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await makeDue();
      await settle();
    }

    let runs = await call(owner, 'GET', `/automations/${created.body.id}/runs`);

    expect(runs.body.data[0]).toMatchObject({ status: 'failed' });
    expect(runs.body.data[0].error).toContain('HTTP 500');

    const failed = await call(owner, 'GET', `/automations/runs/${runs.body.data[0].id}`);

    expect(failed.body.steps.at(-1)).toMatchObject({ stepId: 'post', status: 'failed' });

    answer = 200;
    expect(
      (await call(owner, 'POST', `/automations/runs/${runs.body.data[0].id}/retry`)).status,
    ).toBe(200);
    await makeDue();
    await settle();

    runs = await call(owner, 'GET', `/automations/${created.body.id}/runs`);
    expect(runs.body.data[0]).toMatchObject({ status: 'succeeded' });
  });

  it('refuses definitions that would fail: unknown actions, missing fields, wrong subject', async () => {
    const make = (steps: unknown[], event = 'core.customer.created') =>
      call(owner, 'POST', '/automations', {
        name: 'Bad',
        definition: { trigger: { event }, steps },
      });

    const unknown = await make([
      { id: 'x', type: 'action', action: 'core.rocket.launch', input: {} },
    ]);

    const missing = await make([{ id: 'x', type: 'action', action: 'core.note.add', input: {} }]);

    const wrongSubject = await make([
      { id: 'x', type: 'action', action: 'core.company.tag', input: { add: [] } },
    ]);

    for (const created of [unknown, missing, wrongSubject]) {
      expect(
        (await call(owner, 'POST', `/automations/${created.body.id}/activate`)).body.code,
      ).toBe('INVALID_AUTOMATION');
    }

    const catalog = await call(owner, 'GET', '/automations/catalog');

    expect(catalog.body.actions.map((action: { type: string }) => action.type)).toContain(
      'core.customer.update',
    );
    expect(catalog.body.triggers.map((trigger: { type: string }) => trigger.type)).toContain(
      'core.customer.created',
    );
  });
});
