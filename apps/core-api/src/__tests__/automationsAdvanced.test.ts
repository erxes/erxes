import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';

describeWithDb(
  'automations: triggers, waits, goals, paths, testing, operations',
  { timeout: 600_000 },
  () => {
    useTestDatabase();

    let api: Server;
    let base = '';
    let orgId = '';
    let ownerId = '';
    let owner = '';
    let memberId = '';

    const call = async (method: string, path: string, body?: unknown) => {
      const response = await fetch(`${base}/core/v1${path}`, {
        method,
        headers: { authorization: `Bearer ${owner}`, 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      const text = await response.text();

      return { status: response.status, body: text ? JSON.parse(text) : null };
    };

    const flush = async () => {
      const { processEvents } = await import('~/modules/events/processor');
      const { processJobs } = await import('~/modules/jobs/jobs');
      const { JOBS } = await import('~/modules/jobs/registry');
      let idle = 0;

      for (let round = 0; round < 40 && idle < 2; round += 1) {
        const handled = (await processEvents()) + (await processJobs(JOBS));

        idle = handled ? 0 : idle + 1;
      }
    };

    const makeDue = async () => {
      const { sql } = await import('drizzle-orm');

      await adminDb().execute(sql`update core_jobs set run_at = now() where status = 'queued'`);
    };

    const create = async (name: string, definition: unknown) => {
      const created = await call('POST', '/automations', { name, definition });
      const activated = await call('POST', `/automations/${created.body.id}/activate`);

      if (activated.status !== 200)
        throw new Error(`activate ${name}: ${JSON.stringify(activated.body)}`);

      return created.body.id as string;
    };

    const runs = async (id: string) =>
      (await call('GET', `/automations/${id}/runs?limit=100`)).body.data as {
        id: string;
        status: string;
        subject: { id: string } | null;
        goalReached: boolean;
      }[];

    const steps = async (runId: string) =>
      (
        (await call('GET', `/automations/runs/${runId}`)).body.steps as {
          stepId: string;
          output: unknown;
        }[]
      ).map((step) => step.stepId);

    beforeAll(async () => {
      const { users, newId } = await import('@erxes/core-db');

      const acme = await createOrganization({
        subdomain: 'acme',
        name: 'Acme',
        owner: { email: 'o@acme.mn' },
      });

      orgId = acme.organization.id;
      ownerId = acme.owner.id;
      memberId = newId();
      await adminDb()
        .insert(users)
        .values({ id: memberId, orgId, email: 'm@acme.mn', role: 'member', status: 'active' });
      owner = await currentToken(ownerId, orgId);
      api = createApp().listen(0);
      base = `http://127.0.0.1:${(api.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
      api.closeAllConnections();
      await new Promise<void>((resolve) => api.close(() => resolve()));
    });

    it('runs on a schedule for each record of its audience, and on birthdays every year', async () => {
      const { automations } = await import('@erxes/core-db');
      const { eq, sql } = await import('drizzle-orm');
      const { tickAutomations } = await import('~/modules/automations/triggers');
      const lead = await call('POST', '/customers', { firstName: 'Lead', state: 'lead' });

      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ulaanbaatar' }).format(
        new Date(),
      );

      const birthday = await call('POST', '/customers', {
        firstName: 'Born',
        birthDate: `1990-${today.slice(5)}`,
      });

      await call('POST', '/customers', { firstName: 'Client', state: 'customer' });

      const scheduled = await create('Daily leads', {
        trigger: {
          kind: 'schedule',
          every: 'day',
          at: '09:00',
          timezone: 'Asia/Ulaanbaatar',
          audience: {
            type: 'customer',
            conditions: {
              match: 'all',
              rules: [{ path: 'subject.state', op: 'eq', value: 'lead' }],
            },
          },
        },
        steps: [
          {
            id: 'note',
            type: 'action',
            action: 'core.note.add',
            input: { body: 'Daily check {{now | date: "YYYY-MM-DD"}}' },
          },
        ],
      });

      const born = await create('Birthday', {
        trigger: {
          kind: 'date',
          subject: 'customer',
          field: 'birthDate',
          yearly: true,
          offsetDays: 0,
          at: '00:01',
          timezone: 'Asia/Ulaanbaatar',
        },
        steps: [
          {
            id: 'note',
            type: 'action',
            action: 'core.note.add',
            input: { body: 'Happy birthday {{subject.firstName}}' },
          },
        ],
        reentry: 'daily',
      });

      const [row] = await adminDb()
        .select({ nextRunAt: automations.nextRunAt })
        .from(automations)
        .where(eq(automations.id, scheduled));

      expect(row!.nextRunAt!.getTime()).toBeGreaterThan(Date.now());

      // Due now.
      await adminDb().execute(
        sql`update core_automations set next_run_at = now() - interval '1 minute' where id in (${scheduled}, ${born})`,
      );
      expect(await tickAutomations()).toBeGreaterThanOrEqual(2);
      await flush();

      expect((await runs(scheduled)).map((run) => run.subject?.id)).toEqual([lead.body.id]);
      expect((await runs(born)).map((run) => run.subject?.id)).toEqual([birthday.body.id]);

      // Claimed: the next time is set, so it doesn't fire twice.
      const [after] = await adminDb()
        .select({ nextRunAt: automations.nextRunAt })
        .from(automations)
        .where(eq(automations.id, scheduled));

      expect(after!.nextRunAt!.getTime()).toBeGreaterThan(Date.now());
    });

    it('waits for an event about the record (or gives up), and lets records leave at their goal', async () => {
      const waiter = await create('Wait for update', {
        trigger: {
          kind: 'event',
          event: 'core.customer.created',
          conditions: {
            match: 'all',
            rules: [{ path: 'subject.firstName', op: 'starts_with', value: 'Wait' }],
          },
        },
        steps: [
          { id: 'w', type: 'wait_for', event: 'core.customer.updated', amount: 2, unit: 'days' },
          {
            id: 'b',
            type: 'branch',
            conditions: {
              match: 'all',
              rules: [{ path: 'steps.w.output.matched', op: 'eq', value: true }],
            },
            then: [
              {
                id: 'yes',
                type: 'action',
                action: 'core.note.add',
                input: { body: 'Updated in time' },
              },
            ],
            else: [
              { id: 'no', type: 'action', action: 'core.note.add', input: { body: 'No update' } },
            ],
          },
        ],
      });

      const answered = await call('POST', '/customers', { firstName: 'Wait one' });
      const silent = await call('POST', '/customers', { firstName: 'Wait two' });

      await flush();
      expect((await runs(waiter)).every((run) => run.status === 'waiting')).toBe(true);

      await call('PATCH', `/customers/${answered.body.id}`, { lastName: 'Replied' });
      await flush();

      let list = await runs(waiter);
      const first = list.find((run) => run.subject?.id === answered.body.id)!;

      expect(first.status).toBe('succeeded');
      expect(await steps(first.id)).toEqual(['w', 'b', 'yes']);

      // The other one times out.
      await makeDue();
      await flush();
      list = await runs(waiter);

      const second = list.find((run) => run.subject?.id === silent.body.id)!;

      expect(second.status).toBe('succeeded');
      expect(await steps(second.id)).toEqual(['w', 'b', 'no']);

      // Goal: becoming a customer ends the run while it waits.
      const goal = await create('Nurture', {
        trigger: {
          kind: 'event',
          event: 'core.customer.created',
          conditions: {
            match: 'all',
            rules: [{ path: 'subject.firstName', op: 'eq', value: 'Prospect' }],
          },
        },
        steps: [
          { id: 'd', type: 'delay', amount: 3, unit: 'days' },
          {
            id: 'n',
            type: 'action',
            action: 'core.note.add',
            input: { body: 'Still not a customer' },
          },
        ],
        goal: { match: 'all', rules: [{ path: 'subject.state', op: 'eq', value: 'customer' }] },
      });

      const prospect = await call('POST', '/customers', { firstName: 'Prospect', state: 'lead' });

      await flush();
      await call('PATCH', `/customers/${prospect.body.id}`, { state: 'customer' });
      await flush();

      const [ended] = await runs(goal);

      expect(ended).toMatchObject({ status: 'succeeded', goalReached: true });
      expect(await steps(ended!.id)).toEqual([]);
    });

    it('takes switch cases and A/B paths, sends emails, assigns round-robin, and counts each step', async () => {
      const { loggedEmails } = await import('~/modules/email/email');

      const id = await create('Route', {
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
                conditions: {
                  match: 'all',
                  rules: [{ path: 'subject.primaryEmail', op: 'exists' }],
                },
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
                input: { userIds: [ownerId, memberId] },
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

      const mailed = await call('POST', '/customers', {
        firstName: 'Route mail',
        primaryEmail: 'route@mail.mn',
      });

      const one = await call('POST', '/customers', { firstName: 'Route one' });
      const two = await call('POST', '/customers', { firstName: 'Route two' });

      await flush();

      expect(
        loggedEmails.some(
          (email) => email.to === 'route@mail.mn' && email.subject === 'Hi Route mail',
        ),
      ).toBe(true);

      const owners = [
        (await call('GET', `/customers/${one.body.id}`)).body.ownerId,
        (await call('GET', `/customers/${two.body.id}`)).body.ownerId,
      ];

      expect(new Set(owners)).toEqual(new Set([ownerId, memberId]));
      expect(mailed.status).toBe(201);

      const stats = await call('GET', `/automations/${id}/stats`);

      expect(stats.body.runs).toMatchObject({ total: 3, succeeded: 3 });
      expect(
        stats.body.steps.find((step: { stepId: string }) => step.stepId === 'assign'),
      ).toMatchObject({ succeeded: 2 });
    });

    it('dry-runs a draft, limits runs an hour, keeps versions, and tells the owner when runs fail', async () => {
      const draft = await call('POST', '/automations', {
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

      const sample = await call('POST', '/customers', { firstName: 'Sample', state: 'lead' });

      const test = await call('POST', `/automations/${draft.body.id}/test`, {
        subject: { type: 'customer', id: sample.body.id },
      });

      expect(test.body.triggerMatches).toBe(true);
      expect(test.body.trace.map((item: { stepId: string }) => item.stepId)).toEqual(['b', 'n']);
      expect(test.body.trace[1].input).toEqual({ body: 'Hello SAMPLE' });
      // Nothing happened for real.
      expect((await call('GET', `/automations/${draft.body.id}/runs`)).body.data).toEqual([]);

      // One run an hour.
      const limited = await create('Limited', {
        trigger: { kind: 'event', event: 'core.company.created' },
        steps: [{ id: 'n', type: 'action', action: 'core.note.add', input: { body: 'x' } }],
        maxRunsPerHour: 1,
      });

      await call('POST', '/companies', { primaryName: 'One' });
      await call('POST', '/companies', { primaryName: 'Two' });
      await flush();
      expect((await runs(limited)).length).toBe(1);
      expect((await call('GET', `/automations/${limited}/stats`)).body.skippedByLimit).toBe(1);

      // Versions and restore.
      await call('PATCH', `/automations/${limited}`, {
        definition: {
          trigger: { kind: 'event', event: 'core.company.created' },
          steps: [{ id: 'n', type: 'action', action: 'core.note.add', input: { body: 'v2' } }],
        },
      });

      const versions = await call('GET', `/automations/${limited}/versions`);

      expect(versions.body.data.map((item: { version: number }) => item.version)).toEqual([2, 1]);
      expect((await call('POST', `/automations/${limited}/versions/1/restore`)).body).toMatchObject(
        { activeVersion: 3 },
      );

      // A run that fails tells whoever turned the automation on.
      const failing = await create('Broken', {
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

      await call('POST', '/customers', { firstName: 'Breaks' });

      for (let attempt = 0; attempt < 6; attempt += 1) {
        await makeDue();
        await flush();
      }

      expect((await runs(failing))[0]?.status).toBe('failed');

      const inbox = await call('GET', '/notifications?kind=core.automation.failed');

      expect(inbox.body.data[0]).toMatchObject({ title: '“Broken” failed' });

      // Templates to start from, and fields for pickers.
      expect((await call('GET', '/automations/templates')).body.data.length).toBeGreaterThanOrEqual(
        5,
      );
      expect(
        (await call('GET', '/automations/fields?subject=customer')).body.data.map(
          (field: { path: string }) => field.path,
        ),
      ).toContain('subject.primaryEmail');
    });

    it('starts manually on chosen records', async () => {
      const id = await create('By hand', {
        trigger: { kind: 'manual', audience: { type: 'customer' } },
        steps: [
          { id: 'n', type: 'action', action: 'core.note.add', input: { body: 'Started by hand' } },
        ],
      });

      const picked = await call('POST', '/customers', { firstName: 'Picked' });

      const started = await call('POST', `/automations/${id}/start`, {
        subjects: [picked.body.id],
      });

      expect(started.body).toEqual({ started: 1, skipped: 0 });
      await flush();
      expect((await runs(id))[0]).toMatchObject({
        status: 'succeeded',
        subject: { id: picked.body.id },
      });
    });
  },
);
