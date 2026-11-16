import { type SQL, sql } from 'drizzle-orm';

/** A transaction on core's database, as the plugin's own role (Drizzle's `tx`). */
interface Transaction {
  execute(query: SQL): PromiseLike<unknown>;
}

export interface JobInput {
  orgId: string;
  /** A job the manifest's `jobs` declares. */
  name: string;
  payload?: Record<string, unknown>;
  /** Run no earlier than this. */
  runAt?: Date;
  /** One queued or running job per key: queueing it again adds nothing. */
  dedupeKey?: string;
}

/**
 * Queues one of the plugin's jobs in its own transaction (`core_enqueue_job`),
 * so the job exists only if the transaction commits. Core then POSTs it to
 * `<api.url>/jobs/<name>` until the plugin answers 2xx. The database refuses a
 * name the manifest doesn't declare and an organisation without the plugin.
 */
export const enqueueJob = async (tx: Transaction, job: JobInput) => {
  await tx.execute(sql`select core_enqueue_job(
    ${job.orgId},
    ${job.name},
    ${JSON.stringify(job.payload ?? {})}::jsonb,
    ${job.runAt?.toISOString() ?? null}::timestamptz,
    ${job.dedupeKey ?? null}
  )`);
};
