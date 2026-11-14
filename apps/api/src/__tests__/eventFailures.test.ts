import { events } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { consumerJob, type EventConsumer } from '~/modules/events/consumers';
import { pruneEvents } from '~/modules/events/events.service';
import { addQueues } from '~/modules/jobs/jobs';
import { adminDb, useTestDatabase } from './db';
import { makeDue, settle } from './settle';
import { useTwoOrgs } from './support';

/** A consumer for the test: its queue gets a job for every event published after this. */
const addConsumer = async (consumer: EventConsumer) => {
  const job = consumerJob(consumer);

  await addQueues(job.queues, { schedule: false });

  return job;
};

/** Event delivery that survives failures (retries, dead events, manual retry) and event retention. */
describe('event failures and retention', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const publish = (type: string) => t.hr().events.publish({ events: [{ type }] });
  const failures = () => t.owner().events.failures({});

  /** Dismisses every open failure of the organisation. */
  const dismissAll = async () => {
    const open = (await failures()).data;

    if (open.length === 0) return 0;

    const refs = open.map((failure) => ({ consumer: failure.consumer, eventId: failure.event.id }));

    return (await t.owner().events.dismissFailures({ failures: refs })).dismissed;
  };

  it('retries a failed event with backoff, then marks it dead; a manual retry gets it through', async () => {
    let broken = true;
    const handled: string[] = [];

    const flaky = await addConsumer({
      name: 'test.flaky',
      handle: async (_tx, event) => {
        if (broken && event.type === 'hr.flaky.happened') throw new Error('downstream is down');

        handled.push(event.type);
      },
    });

    const attempts = (flaky.queues[0]?.options.retryLimit ?? 0) + 1;

    await publish('hr.flaky.happened');
    await publish('hr.other.happened');
    await settle();

    // The bad event doesn't block the next one.
    expect(handled).toEqual(['hr.other.happened']);

    const first = await failures();
    const [failure] = first.data;

    expect(first.counts).toEqual({ retrying: 1, dead: 0 });
    expect(failure).toMatchObject({ consumer: 'test.flaky', attempts: 1, status: 'retrying' });
    expect(failure?.lastError).toContain('downstream is down');
    expect(new Date(failure?.nextAttemptAt ?? 0).getTime()).toBeGreaterThan(Date.now() + 30_000);

    // Not due yet: nothing happens.
    await settle();
    expect((await failures()).data[0]).toMatchObject({ attempts: 1, status: 'retrying' });

    for (let attempt = 2; attempt <= attempts; attempt += 1) {
      await makeDue();
      await settle();
    }

    const dead = await failures();

    expect(dead.counts).toEqual({ retrying: 0, dead: 1 });
    expect(dead.data[0]).toMatchObject({ attempts, status: 'dead', nextAttemptAt: null });
    await expect(t.member().events.retryFailures({ allDead: true })).rejects.toMatchObject({
      status: 403,
    });

    broken = false;
    expect(await t.owner().events.retryFailures({ allDead: true })).toEqual({ retried: 1 });
    await settle();
    expect(handled).toEqual(['hr.other.happened', 'hr.flaky.happened']);
    expect((await failures()).counts).toEqual({ retrying: 0, dead: 0 });
  });

  it('dismisses failures; retention removes old events, and their jobs end', async () => {
    let calls = 0;

    await addConsumer({
      name: 'test.failing',
      handle: () => {
        calls += 1;

        return Promise.reject(new Error('nope'));
      },
    });

    await publish('hr.failing.happened');
    await settle();
    expect(await dismissAll()).toBe(1);
    expect((await failures()).counts).toEqual({ retrying: 0, dead: 0 });

    // Removed by retention before its consumers got to it: the jobs end without a failure.
    await publish('hr.old.happened');
    await adminDb().execute(sql`update core_events set created_at = now() - interval '40 days'`);

    const old = await adminDb().select({ id: events.id }).from(events);

    expect(await pruneEvents(adminDb(), 30)).toBe(old.length);
    calls = 0;
    await settle();
    expect(calls).toBe(0);
    expect((await failures()).counts).toEqual({ retrying: 0, dead: 0 });

    // Recent events stay.
    await publish('hr.new.happened');
    expect(await pruneEvents(adminDb(), 30)).toBe(0);
    expect(
      await adminDb().select().from(events).where(eq(events.type, 'hr.new.happened')),
    ).toHaveLength(1);
  });
});
