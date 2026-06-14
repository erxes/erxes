import type { Queue } from 'bullmq';

/**
 * Removes a tenant prefix's BullMQ job schedulers that are no longer desired.
 * Pages through ALL schedulers — the queue is shared across tenants, and a
 * bounded read would stop pruning stale entries past the window. Used by both
 * the workflow and the agent-schedule reconcilers.
 */
export async function pruneStaleJobSchedulers(
  queue: Queue,
  prefix: string,
  desired: { has(key: string): boolean },
): Promise<void> {
  const PAGE = 500;
  const existing: Array<{ key?: string; id?: string | null }> = [];
  for (let start = 0; ; start += PAGE) {
    const batch = await queue.getJobSchedulers(start, start + PAGE - 1);
    existing.push(...batch);
    if (!batch.length || batch.length < PAGE) break;
  }
  for (const scheduler of existing) {
    const key = scheduler.key ?? scheduler.id;
    if (key?.startsWith(prefix) && !desired.has(key)) {
      await queue.removeJobScheduler(key);
    }
  }
}
