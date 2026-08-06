// ---------------------------------------------------------------------------
// Company Knowledge RAG — BullMQ sweep scheduling.
//
// Pattern follows posclient_api/src/worker: a repeatable scheduler job fires
// on a cron, enqueues one sweep job per tenant, and a worker runs the actual
// reconciliation. One immediate sweep is enqueued at boot so a fresh deploy
// doesn't wait for the first cron tick.
// ---------------------------------------------------------------------------

import { Queue } from 'bullmq';
import {
  createMQWorkerWithListeners,
  getEnv,
  getSaasOrganizations,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { knowledgeSyncCron } from './config';
import { runKnowledgeSweep } from './indexer';

const SERVICE = 'erxes-agent';
const SWEEP_QUEUE = 'knowledge-sweep';
const SCHEDULER_QUEUE = 'knowledge-sweep-scheduler';

/** Queue one sweep job per tenant (saas: every org; non-saas: the single tenant). */
async function enqueueSweepPerTenant() {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION === 'saas') {
    const orgs = await getSaasOrganizations();
    for (const org of orgs) {
      sendWorkerQueue(SERVICE, SWEEP_QUEUE).add(SWEEP_QUEUE, {
        subdomain: org.subdomain,
      });
    }
    return;
  }

  sendWorkerQueue(SERVICE, SWEEP_QUEUE).add(SWEEP_QUEUE, { subdomain: 'os' });
}

// The shared Redis connection type, extracted from the MQ helper so this
// module needs no direct ioredis type dependency.
type RedisConnection = Parameters<typeof createMQWorkerWithListeners>[3];

/** Boot hook: register the sweep scheduler + worker and kick one sweep. */
export async function initKnowledgeSync(redis: RedisConnection): Promise<void> {
  const schedulerQueue = new Queue(`${SERVICE}-${SCHEDULER_QUEUE}`, {
    connection: redis,
  });

  await schedulerQueue.upsertJobScheduler(
    `${SERVICE}-knowledge-sweep-cron`,
    { pattern: knowledgeSyncCron(), tz: 'UTC' },
    { name: SCHEDULER_QUEUE },
  );

  createMQWorkerWithListeners(
    SERVICE,
    SCHEDULER_QUEUE,
    async () => {
      await enqueueSweepPerTenant();
      return 'scheduled';
    },
    redis,
    () => {
      // eslint-disable-next-line no-console
      console.log('[erxes-agent:knowledge] sweep scheduler ready');
    },
  );

  createMQWorkerWithListeners(
    SERVICE,
    SWEEP_QUEUE,
    async (job) => {
      const { subdomain } = job?.data ?? {};
      if (!subdomain) return 'skipped: no subdomain';
      const result = await runKnowledgeSweep(subdomain);
      const perType = Object.entries(result.types)
        .map(
          ([typeName, st]) =>
            `${typeName}=${st.count}${st.error ? '(err)' : ''}`,
        )
        .join(' ');
      const errorSuffix = result.error ? `, errors: ${result.error}` : '';
      // eslint-disable-next-line no-console
      console.log(
        `[erxes-agent:knowledge] sweep "${subdomain}": ${result.pointCount} points [${perType}], +${result.upserted} upserted, -${result.deleted} deleted${errorSuffix}`,
      );
      return result;
    },
    redis,
    () => {
      // eslint-disable-next-line no-console
      console.log('[erxes-agent:knowledge] sweep worker ready');
    },
  );

  // Initial sweep so the corpus exists right after boot.
  await enqueueSweepPerTenant();
}
