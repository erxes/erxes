import { automations } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { expect, it } from 'vite-plus/test';
import { tickAutomations } from '~/modules/automations/triggers';
import { makeDue, useAutomations } from './automations.fixture';
import { adminDb, describeWithDb, useTestDatabase } from './db';
import { settle } from './settle';

/** When the automation next fires on its own. */
const nextRunOf = async (id: string) => {
  const [row] = await adminDb()
    .select({ nextRunAt: automations.nextRunAt })
    .from(automations)
    .where(eq(automations.id, id));

  return row?.nextRunAt?.getTime() ?? 0;
};

describeWithDb(
  'automation triggers: schedules, dates, waits, goals and manual starts',
  { timeout: 600_000 },
  () => {
    useTestDatabase();

    const t = useAutomations();

    it('runs on a schedule for each record of its audience, and on birthdays every year', async () => {
      const owner = t.owner();
      const lead = await owner.customers.create({ firstName: 'Lead', state: 'lead' });

      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ulaanbaatar' }).format(
        new Date(),
      );

      const birthday = await owner.customers.create({
        firstName: 'Born',
        birthDate: `1990-${today.slice(5)}`,
      });

      await owner.customers.create({ firstName: 'Client', state: 'customer' });

      const scheduled = await t.active('Daily leads', {
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

      const born = await t.active('Birthday', {
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

      expect(await nextRunOf(scheduled)).toBeGreaterThan(Date.now());

      // Due now.
      await adminDb().execute(
        sql`update core_automations set next_run_at = now() - interval '1 minute' where id in (${scheduled}, ${born})`,
      );
      expect(await tickAutomations()).toBeGreaterThanOrEqual(2);
      await settle();

      expect((await t.runsOf(scheduled)).map((run) => run.subject?.id)).toEqual([lead.id]);
      expect((await t.runsOf(born)).map((run) => run.subject?.id)).toEqual([birthday.id]);
      // Claimed: the next time is set, so it doesn't fire twice.
      expect(await nextRunOf(scheduled)).toBeGreaterThan(Date.now());
    });

    it('waits for an event about the record (or gives up), and lets records leave at their goal', async () => {
      const waiter = await t.active('Wait for update', {
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

      const answered = await t.owner().customers.create({ firstName: 'Wait one' });
      const silent = await t.owner().customers.create({ firstName: 'Wait two' });

      /** The run about one customer: its status and the steps it took. */
      const runFor = async (customerId: string) => {
        const run = (await t.runsOf(waiter)).find((item) => item.subject?.id === customerId);

        return { status: run?.status, steps: run ? await t.stepsOf(run.id) : [] };
      };

      await settle();
      expect((await t.runsOf(waiter)).map((run) => run.status)).toEqual(['waiting', 'waiting']);

      await t.owner().customers.update({ id: answered.id, lastName: 'Replied' });
      await settle();
      expect(await runFor(answered.id)).toEqual({ status: 'succeeded', steps: ['w', 'b', 'yes'] });

      // The other one times out.
      await makeDue();
      await settle();
      expect(await runFor(silent.id)).toEqual({ status: 'succeeded', steps: ['w', 'b', 'no'] });

      // Goal: becoming a customer ends the run while it waits.
      const goal = await t.active('Nurture', {
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

      const prospect = await t.owner().customers.create({ firstName: 'Prospect', state: 'lead' });

      await settle();
      await t.owner().customers.update({ id: prospect.id, state: 'customer' });
      await settle();

      const [ended] = await t.runsOf(goal);

      expect(ended).toMatchObject({ status: 'succeeded', goalReached: true });
      expect(await t.stepsOf(ended?.id ?? '')).toEqual([]);
    });

    it('starts manually on chosen records', async () => {
      const id = await t.active('By hand', {
        trigger: { kind: 'manual', audience: { type: 'customer' } },
        steps: [
          { id: 'n', type: 'action', action: 'core.note.add', input: { body: 'Started by hand' } },
        ],
      });

      const picked = await t.owner().customers.create({ firstName: 'Picked' });

      expect(await t.owner().automations.start({ id, subjects: [picked.id] })).toEqual({
        started: 1,
        skipped: 0,
        continuing: false,
      });
      await settle();
      expect((await t.runsOf(id))[0]).toMatchObject({
        status: 'succeeded',
        subject: { id: picked.id },
      });
    });
  },
);
