// ---------------------------------------------------------------------------
// Company Knowledge RAG — BullMQ sweep worker.
//
// Agent = Person: the index is built AS the requesting user, never under an
// unattended privileged service token. So reconciliation is triggered by user
// activity — a chat that uses the knowledge tool (lazy, when the corpus is
// empty/stale) or the explicit "Sync now" settings action — and each sweep job
// carries that user's auth, which the worker hands to runKnowledgeSweep so the
// gateway enforces their permissions. There is no cron: an unattended job has
// no person, hence no auth.
// ---------------------------------------------------------------------------

import {
  createMQWorkerWithListeners,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { runKnowledgeSweep, SweepAuth } from './indexer';

const SERVICE = 'erxes-agent';
const SWEEP_QUEUE = 'knowledge-sweep';

export interface SweepJobData {
  subdomain: string;
  auth?: SweepAuth;
}

/**
 * Enqueue one reconciliation sweep for a tenant, carrying the requesting
 * user's auth. Call this from a user-authenticated context (the knowledge tool
 * or the sync mutation) — the worker replays the auth so the sweep reads
 * company data with exactly that user's permissions.
 */
export function enqueueKnowledgeSweep(data: SweepJobData) {
  return sendWorkerQueue(SERVICE, SWEEP_QUEUE).add(SWEEP_QUEUE, data);
}

// The shared Redis connection type, extracted from the MQ helper so this
// module needs no direct ioredis type dependency.
type RedisConnection = Parameters<typeof createMQWorkerWithListeners>[3];

/** Boot hook: register the sweep worker. No scheduler — see file header. */
export function initKnowledgeSync(redis: RedisConnection): void {
  createMQWorkerWithListeners(
    SERVICE,
    SWEEP_QUEUE,
    async (job) => {
      const { subdomain, auth } = (job?.data ?? {}) as SweepJobData;
      if (!subdomain) return 'skipped: no subdomain';
      const result = await runKnowledgeSweep(subdomain, auth);
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
}
