import { sql } from 'drizzle-orm';
import { setTimeout as sleep } from 'node:timers/promises';
import { adminDb } from './db';

/**
 * Whether work is left: an event some consumer hasn't read, or a job that is
 * due. Consumers read only below the cluster's oldest open transaction, so a
 * long transaction elsewhere (another test file's database counts) can hold
 * an event back for a while.
 */
const pending = async () => {
  const { rows } = await adminDb().execute<{ events: boolean; jobs: boolean }>(sql`
    select
      exists (
        select 1 from core_events e join core_event_consumers c
          on (e.tx_id, e.seq) > (c.last_tx_id, c.last_seq)
      ) as events,
      exists (select 1 from core_jobs where status = 'queued' and run_at <= now()) as jobs
  `);

  const [row] = rows;

  return row ? row.events || row.jobs : false;
};

/**
 * Runs the event consumers and due jobs until nothing is left: events become
 * timeline entries, notifications, automation runs, webhook deliveries; runs
 * take their steps. Work scheduled for later (delays, retries with backoff)
 * stays scheduled.
 */
export const settle = async (timeoutMs = 60_000) => {
  const { processEvents } = await import('~/modules/events/processor');
  const { processJobs } = await import('~/modules/jobs/jobs');
  const { JOBS } = await import('~/modules/jobs/registry');
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const handled = (await processEvents()) + (await processJobs(JOBS));

    if (!handled) {
      if (!(await pending())) return;
      await sleep(25);
    }
  }

  throw new Error(`events or jobs still pending after ${timeoutMs} ms`);
};
