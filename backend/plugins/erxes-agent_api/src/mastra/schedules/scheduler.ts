// ---------------------------------------------------------------------------
// Agent schedules — BullMQ job schedulers, one per enabled MastraSchedule.
//
// Same reconcile-and-run pattern as the workflow schedule trigger: a reconcile
// job fires on a cron, diffs BullMQ's job schedulers against the current set
// of enabled schedules, and upserts/removes accordingly. Each fired job runs
// one schedule's prompt against its agent (runner.ts). Reconciling keeps
// Mongo as the single source of truth and self-heals after Redis flushes.
// ---------------------------------------------------------------------------

import { Queue } from 'bullmq';
import type { Job } from 'bullmq';
import {
  createMQWorkerWithListeners,
  getEnv,
  getSaasOrganizations,
} from 'erxes-api-shared/utils';
import { generateModels } from '../../connectionResolvers';
import { pruneStaleJobSchedulers } from '../jobSchedulers';
import { runSchedule } from './runner';

const SERVICE = 'erxes-agent';
const RECONCILE_QUEUE = 'agent-schedule-reconcile';
const RUN_QUEUE = 'agent-schedule-run';
const RECONCILE_CRON = '*/5 * * * *';

// The shared Redis connection type, extracted from the MQ helper so this
// module needs no direct ioredis type dependency.
type RedisConnection = Parameters<typeof createMQWorkerWithListeners>[3];

/** The BullMQ job-scheduler id for one tenant's schedule. */
const schedulerId = (tenant: string, scheduleId: string) =>
  `agsched-${tenant}-${scheduleId}`;

/** Tenants to reconcile: every saas org's subdomain, or the pinned 'os'. */
async function tenants(): Promise<string[]> {
  if (getEnv({ name: 'VERSION' }) === 'saas') {
    const orgs = await getSaasOrganizations();
    return orgs.map((org: { subdomain: string }) => org.subdomain);
  }
  return ['os'];
}

/** Diffs BullMQ job schedulers against one tenant's enabled schedules. */
async function reconcileTenant(runQueue: Queue, tenant: string): Promise<void> {
  const models = await generateModels(tenant);
  const schedules = await models.MastraSchedule.getSchedules();

  const desired = new Map<
    string,
    { pattern: string; tz: string; scheduleId: string }
  >();
  for (const schedule of schedules) {
    if (!schedule.isEnabled || !schedule.cron?.trim()) continue;
    desired.set(schedulerId(tenant, schedule._id), {
      pattern: schedule.cron.trim(),
      tz: schedule.timezone || 'UTC',
      scheduleId: schedule._id,
    });
  }

  await pruneStaleJobSchedulers(runQueue, `agsched-${tenant}-`, desired);

  for (const [id, { pattern, tz, scheduleId }] of desired) {
    try {
      await runQueue.upsertJobScheduler(
        id,
        { pattern, tz },
        { name: RUN_QUEUE, data: { subdomain: tenant, scheduleId } },
      );
    } catch (e) {
      // Invalid cron/tz in a saved schedule must not break other schedules.
      console.error(
        `[erxes-agent:schedules] invalid cron "${pattern}" on schedule ${scheduleId}: ${e?.message}`,
      );
    }
  }
}

/** Reconciles every tenant, isolating per-tenant failures. */
async function reconcileAll(runQueue: Queue): Promise<void> {
  for (const tenant of await tenants()) {
    try {
      await reconcileTenant(runQueue, tenant);
    } catch (e) {
      console.error(
        `[erxes-agent:schedules] reconcile failed for ${tenant}: ${e?.message}`,
      );
    }
  }
}

/** Runs one fired schedule, skipping stale or disabled ones. */
async function runScheduledAgent(
  subdomain: string,
  scheduleId: string,
): Promise<string> {
  const models = await generateModels(subdomain);

  let schedule;
  try {
    schedule = await models.MastraSchedule.getSchedule(scheduleId);
  } catch {
    return 'skipped: schedule deleted (next reconcile removes the cron)';
  }
  if (!schedule.isEnabled) return 'skipped: disabled';

  const outcome = await runSchedule({ models, subdomain, schedule });
  return `run ${scheduleId}: ${outcome.status}${
    outcome.error ? ` (${outcome.error})` : ''
  }`;
}

/** Boot hook: registers the reconcile cron + run worker, then kicks one pass. */
export async function initAgentSchedules(
  redis: RedisConnection,
): Promise<void> {
  const reconcileQueue = new Queue(`${SERVICE}-${RECONCILE_QUEUE}`, {
    connection: redis,
  });
  await reconcileQueue.upsertJobScheduler(
    `${SERVICE}-agent-schedule-reconcile-cron`,
    { pattern: RECONCILE_CRON, tz: 'UTC' },
    { name: RECONCILE_QUEUE },
  );

  const runQueue = new Queue(`${SERVICE}-${RUN_QUEUE}`, { connection: redis });

  createMQWorkerWithListeners(
    SERVICE,
    RECONCILE_QUEUE,
    async () => {
      await reconcileAll(runQueue);
      return 'reconciled';
    },
    redis,
    () => {
      // eslint-disable-next-line no-console
      console.log('[erxes-agent:schedules] reconciler ready');
    },
  );

  createMQWorkerWithListeners(
    SERVICE,
    RUN_QUEUE,
    (job: Job) => {
      const { subdomain, scheduleId } = job.data || {};
      if (
        typeof subdomain !== 'string' ||
        !subdomain ||
        typeof scheduleId !== 'string' ||
        !scheduleId
      ) {
        return Promise.resolve('skipped: malformed job');
      }
      return runScheduledAgent(subdomain, scheduleId);
    },
    redis,
    () => {
      // eslint-disable-next-line no-console
      console.log('[erxes-agent:schedules] runner ready');
    },
  );

  // Boot kick — a fresh deploy honors schedules without waiting for the cron.
  await reconcileAll(runQueue);
}
