import { eventConsumers, events } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { pruneEvents } from '~/modules/events/events.service';
import {
  type EventConsumer,
  MAX_ATTEMPTS,
  retryFailures,
  runConsumer,
} from '~/modules/events/processor';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/**
 * Runs a consumer until it has read every event: it only reads transactions
 * older than the oldest one still running anywhere on the server, which on a
 * shared Postgres may take a moment.
 */
const drain = async (consumer: EventConsumer) => {
  for (let tries = 0; tries < 100; tries += 1) {
    await runConsumer(consumer);

    const behind = await adminDb().execute(sql`
      select 1 from ${events} e
      where not exists (
        select 1 from ${eventConsumers} c where c.name = ${consumer.name} and (e.tx_id, e.seq) <= (c.last_tx_id, c.last_seq)
      ) limit 1
    `);

    if (!behind.rows.length) return;

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`${consumer.name} never caught up`);
};

/** Makes every waiting retry due now. */
const due = () =>
  adminDb().execute(
    sql`update core_event_failures set next_attempt_at = now() where status = 'retrying'`,
  );

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

    const flaky: EventConsumer = {
      name: 'test.flaky',
      handle: async (_tx, event) => {
        if (broken && event.type === 'hr.flaky.happened') throw new Error('downstream is down');

        handled.push(event.type);
      },
    };

    await publish('hr.flaky.happened');
    await publish('hr.other.happened');
    await drain(flaky);

    // The bad event doesn't block the next one.
    expect(handled).toEqual(['hr.other.happened']);

    const first = await failures();
    const [failure] = first.data;

    expect(first.counts).toEqual({ retrying: 1, dead: 0 });
    expect(failure).toMatchObject({ consumer: 'test.flaky', attempts: 1, status: 'retrying' });
    expect(failure?.lastError).toContain('downstream is down');
    expect(new Date(failure?.nextAttemptAt ?? 0).getTime()).toBeGreaterThan(Date.now() + 30_000);

    // Not due yet: nothing happens.
    expect(await retryFailures(flaky)).toBe(0);

    for (let attempt = 2; attempt <= MAX_ATTEMPTS; attempt += 1) {
      await due();
      await retryFailures(flaky);
    }

    const dead = await failures();

    expect(dead.counts).toEqual({ retrying: 0, dead: 1 });
    expect(dead.data[0]).toMatchObject({
      attempts: MAX_ATTEMPTS,
      status: 'dead',
      nextAttemptAt: null,
    });
    await expect(t.member().events.retryFailures({ allDead: true })).rejects.toMatchObject({
      status: 403,
    });

    broken = false;
    expect(await t.owner().events.retryFailures({ allDead: true })).toEqual({ retried: 1 });
    await retryFailures(flaky);
    expect(handled).toEqual(['hr.other.happened', 'hr.flaky.happened']);
    expect((await failures()).counts).toEqual({ retrying: 0, dead: 0 });
  });

  it('dismisses failures, and keeps events until every consumer has passed them', async () => {
    const failing: EventConsumer = {
      name: 'test.failing',
      handle: () => Promise.reject(new Error('nope')),
    };

    const passing: EventConsumer = { name: 'test.passing', handle: async () => undefined };
    const consumers = ['test.failing', 'test.passing'];

    await publish('hr.old.happened');
    await adminDb().execute(sql`update core_events set created_at = now() - interval '40 days'`);

    // A consumer that never ran holds everything back.
    expect(await pruneEvents(adminDb(), 30, ['test.failing', 'test.never'])).toBe(0);

    await drain(failing);
    await drain(passing);

    // test.failing still has to retry its failures: those events stay.
    const kept = await adminDb().select({ id: events.id }).from(events);
    const open = (await failures()).data.filter((each) => each.consumer === 'test.failing');

    expect(open).toHaveLength(kept.length);
    expect(await pruneEvents(adminDb(), 30, consumers)).toBe(0);
    expect(await dismissAll()).toBe(open.length);
    // test.flaky's history (from the first test) is gone too, so all old events go.
    expect(await pruneEvents(adminDb(), 30, consumers)).toBe(kept.length);

    await publish('hr.new.happened');
    await drain(failing);
    await drain(passing);
    await dismissAll();
    // Recent events stay, handled or not.
    expect(await pruneEvents(adminDb(), 30, consumers)).toBe(0);
    expect(
      await adminDb().select().from(events).where(eq(events.type, 'hr.new.happened')),
    ).toHaveLength(1);
  });
});
