import { sql } from 'drizzle-orm';
import { setTimeout as sleep } from 'node:timers/promises';
import { adminDb } from './db';

/** pg-boss's states of a job that hasn't started yet: new, or waiting for its retry. */
const waiting = sql`state::text in (${sql.join(
  ['created', 'retry'].map((state) => sql`${state}`),
  sql`, `,
)})`;

/** Whether work is left: a job that is due, or one running. */
const pending = async () => {
  const { rows } = await adminDb().execute<{ pending: boolean }>(sql`
    select exists (
      select 1 from core_queue.job
      where (${waiting} and start_after <= now()) or state = 'active'
    ) as pending
  `);

  return rows[0]?.pending ?? false;
};

/**
 * Runs the workers until no job is due or running: events become timeline
 * entries, notifications, automation runs, webhook deliveries; runs take their
 * steps. Work scheduled for later (delays, retries with backoff) stays
 * scheduled.
 */
export const settle = async (timeoutMs = 60_000) => {
  const { startWorkers, stopWorkers } = await import('~/modules/jobs/jobs');
  const deadline = Date.now() + timeoutMs;

  await startWorkers();

  try {
    while (await pending()) {
      if (Date.now() > deadline) throw new Error(`jobs still pending after ${timeoutMs} ms`);
      await sleep(25);
    }
  } finally {
    await stopWorkers();
  }
};

/** Delayed, waiting and retried jobs become due now (instead of waiting out their time). */
export const makeDue = () =>
  adminDb().execute(sql`update core_queue.job set start_after = now() where ${waiting}`);
