// ---------------------------------------------------------------------------
// Schedule trigger — BullMQ job schedulers, one per enabled schedule-workflow.
//
// Pattern follows the knowledge sweep worker: a reconcile job fires on a cron,
// diffs BullMQ's job schedulers against the current set of enabled workflows
// with trigger.type === 'schedule', and upserts/removes accordingly. Each
// fired job runs one workflow with a schedule envelope. Reconciling (instead
// of mutating schedulers on every save) keeps Mongo as the single source of
// truth and self-heals after Redis flushes or missed updates.
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
import { TriggerEnvelope } from './envelope';
import { runWorkflow } from './runtime';

const SERVICE = 'erxes-agent';
const RECONCILE_QUEUE = 'workflow-schedule-reconcile';
const RUN_QUEUE = 'workflow-schedule-run';
const RECONCILE_CRON = '*/5 * * * *';

// The shared Redis connection type, extracted from the MQ helper so this
// module needs no direct ioredis type dependency.
type RedisConnection = Parameters<typeof createMQWorkerWithListeners>[3];

/** The BullMQ job-scheduler id for one tenant's workflow. */
const schedulerId = (tenant: string, workflowId: string) =>
  `wfsched-${tenant}-${workflowId}`;

/** Tenants to reconcile: every saas org's subdomain, or the pinned 'os'. */
async function tenants(): Promise<string[]> {
  if (getEnv({ name: 'VERSION' }) === 'saas') {
    const orgs = await getSaasOrganizations();
    return orgs.map((org: { subdomain: string }) => org.subdomain);
  }
  return ['os'];
}

/** Diffs BullMQ job schedulers against one tenant's enabled schedule-workflows. */
async function reconcileTenant(runQueue: Queue, tenant: string): Promise<void> {
  const models = await generateModels(tenant);
  const workflows = await models.MastraWorkflow.getWorkflows();

  const desired = new Map<string, { pattern: string; workflowId: string }>();
  for (const wf of workflows) {
    const trigger = wf.definition?.trigger;
    if (!wf.isEnabled || trigger?.type !== 'schedule') continue;
    const cron: unknown = trigger?.config?.cron;
    if (typeof cron !== 'string' || !cron.trim()) continue;
    desired.set(schedulerId(tenant, wf._id), {
      pattern: cron.trim(),
      workflowId: wf._id,
    });
  }

  await pruneStaleJobSchedulers(runQueue, `wfsched-${tenant}-`, desired);

  for (const [id, { pattern, workflowId }] of desired) {
    try {
      await runQueue.upsertJobScheduler(
        id,
        { pattern, tz: 'UTC' },
        { name: RUN_QUEUE, data: { subdomain: tenant, workflowId } },
      );
    } catch (e) {
      // Invalid cron in a saved definition must not break other schedules.
      console.error(
        `[erxes-agent:workflows] invalid cron "${pattern}" on workflow ${workflowId}: ${e?.message}`,
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
        `[erxes-agent:workflows] schedule reconcile failed for ${tenant}: ${e?.message}`,
      );
    }
  }
}

/** Runs one schedule-triggered workflow, skipping stale or disabled ones. */
async function runScheduledWorkflow(
  subdomain: string,
  workflowId: string,
): Promise<string> {
  const models = await generateModels(subdomain);

  let workflow;
  try {
    workflow = await models.MastraWorkflow.getWorkflow(workflowId);
  } catch {
    return 'skipped: workflow deleted (next reconcile removes the schedule)';
  }
  if (
    !workflow.isEnabled ||
    workflow.definition?.trigger?.type !== 'schedule'
  ) {
    return 'skipped: disabled or trigger changed';
  }

  const envelope: TriggerEnvelope = {
    source: 'schedule',
    type: 'schedule',
    payload: { firedAt: new Date().toISOString() },
  };

  const record = await runWorkflow({ models, subdomain, workflow, envelope });
  return `run ${record._id}: ${record.status}`;
}

/** Boot hook: registers the reconcile cron + run worker, then kicks one pass. */
export async function initWorkflowSchedules(
  redis: RedisConnection,
): Promise<void> {
  const reconcileQueue = new Queue(`${SERVICE}-${RECONCILE_QUEUE}`, {
    connection: redis,
  });
  await reconcileQueue.upsertJobScheduler(
    `${SERVICE}-workflow-schedule-reconcile-cron`,
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
      console.log('[erxes-agent:workflows] schedule reconciler ready');
    },
  );

  createMQWorkerWithListeners(
    SERVICE,
    RUN_QUEUE,
    (job: Job) => {
      const { subdomain, workflowId } = job.data || {};
      if (
        typeof subdomain !== 'string' ||
        !subdomain ||
        typeof workflowId !== 'string' ||
        !workflowId
      ) {
        return Promise.resolve('skipped: malformed job');
      }
      return runScheduledWorkflow(subdomain, workflowId);
    },
    redis,
    () => {
      // eslint-disable-next-line no-console
      console.log('[erxes-agent:workflows] schedule runner ready');
    },
  );

  // Boot kick — a fresh deploy honors schedules without waiting for the cron.
  await reconcileAll(runQueue);
}
