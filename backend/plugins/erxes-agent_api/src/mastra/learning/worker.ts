// ---------------------------------------------------------------------------
// Agent Learning — BullMQ sweep scheduling + the sweep itself.
//
// Same shape as the knowledge worker: a repeatable scheduler enqueues one
// sweep per tenant; the sweep distills idle threads with undistilled
// messages, then runs corpus hygiene (decay + archive). One immediate sweep
// at boot.
// ---------------------------------------------------------------------------

import { Queue } from 'bullmq';
import {
  createMQWorkerWithListeners,
  getEnv,
  getSaasOrganizations,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { isLegacyProvider } from '~/mastra/providers';
import {
  learningSweepCron,
  learningTenant,
  resolveLearningTuning,
} from './config';
import { ensureLearningCollection, setLearningVectorStatus } from './store';
import { distillThread } from './distill';
import { ExtractionRuntime } from './extractor';

const SERVICE = 'erxes-agent';
const SWEEP_QUEUE = 'learning-sweep';
const SCHEDULER_QUEUE = 'learning-sweep-scheduler';

// Per-sweep caps — a sweep is cheap and frequent, so backlogs drain over a
// few ticks instead of one expensive burst of LLM calls.
const MAX_THREADS_PER_SWEEP = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface LearningSweepResult {
  threads: number;
  created: number;
  merged: number;
  promoted: number;
  gated: number;
  decayed: number;
  archived: number;
  error?: string;
}

/** The extraction runtime: the default agent's provider/model + app token. */
async function resolveRuntime(
  models: IModels,
  subdomain: string,
): Promise<{ runtime: ExtractionRuntime; defaultAgentId: string } | null> {
  const settings = await models.MastraSettings.getSettings();
  const agentConfig = settings?.defaultAgentId
    ? await models.MastraAgent.findOne({
        agentId: settings.defaultAgentId,
        isEnabled: true,
      })
    : await models.MastraAgent.findOne({ isEnabled: true });
  if (!agentConfig) return null;

  const providers = await models.MastraProvider.find({ isEnabled: true });
  return {
    defaultAgentId: agentConfig.agentId,
    runtime: {
      provider: agentConfig.provider,
      model: agentConfig.model,
      providers,
      authCtx: { token: settings?.erxesApiToken, subdomain },
      isLegacy: isLegacyProvider(agentConfig.provider, providers),
    },
  };
}

/** Decay stale lessons and archive the ones that fell below the floor. */
async function runHygiene(
  models: IModels,
  tenant: string,
): Promise<{ decayed: number; archived: number }> {
  const tuning = resolveLearningTuning();
  const now = Date.now();
  const staleCutoff = new Date(now - tuning.decayDays * DAY_MS);
  const dailyCutoff = new Date(now - DAY_MS);

  // Decay: not reinforced in decayDays AND not already touched today (the
  // confidence write bumps updatedAt, so an idle lesson decays at most daily).
  const stale = await models.MastraLearning.find({
    status: { $in: ['candidate', 'approved'] },
    pinned: { $ne: true },
    updatedAt: { $lt: dailyCutoff },
    $or: [
      { lastReinforcedAt: { $lt: staleCutoff } },
      { lastReinforcedAt: { $exists: false }, createdAt: { $lt: staleCutoff } },
    ],
  }).limit(200);

  let decayed = 0;
  let archived = 0;
  for (const doc of stale) {
    const confidence = (doc.confidence ?? 0.5) * tuning.decayFactor;
    if (confidence < tuning.archiveBelowConfidence) {
      await models.MastraLearning.updateOne(
        { _id: doc._id },
        { $set: { confidence, status: 'archived' } },
      );
      try {
        await setLearningVectorStatus(tenant, String(doc._id), 'archived');
      } catch {
        // converged on a later sweep
      }
      archived++;
    } else {
      await models.MastraLearning.updateOne(
        { _id: doc._id },
        { $set: { confidence } },
      );
      decayed++;
    }
  }
  return { decayed, archived };
}

/** One full learning sweep for one tenant. Returns a result, never throws. */
export async function runLearningSweep(
  subdomain: string,
): Promise<LearningSweepResult> {
  const result: LearningSweepResult = {
    threads: 0,
    created: 0,
    merged: 0,
    promoted: 0,
    gated: 0,
    decayed: 0,
    archived: 0,
  };

  try {
    const tenant = learningTenant(subdomain);
    if (!tenant) return { ...result, error: 'no tenant' };

    const models = await generateModels(subdomain);
    await ensureLearningCollection();

    const resolved = await resolveRuntime(models, subdomain);
    if (!resolved)
      return { ...result, error: 'no enabled agent for extraction' };

    const tuning = resolveLearningTuning();
    const idleCutoff = new Date(Date.now() - tuning.idleMinutes * 60 * 1000);

    // Idle threads with an undistilled tail. $expr compares the two counters.
    const threads = await models.MastraThread.find({
      lastMessageAt: { $lt: idleCutoff },
      $expr: {
        $gt: ['$messageCount', { $ifNull: ['$distilledMessageCount', 0] }],
      },
    })
      .sort({ lastMessageAt: 1 })
      .limit(MAX_THREADS_PER_SWEEP);

    for (const thread of threads) {
      try {
        const all = await models.MastraMessage.getMessages(thread.threadId);
        const cursor = thread.distilledMessageCount ?? 0;
        const tail = all.slice(cursor);
        if (tail.length) {
          const distilled = await distillThread({
            models,
            tenant,
            agentId: thread.agentId,
            ownerResourceId: thread.userId || `thread:${thread.threadId}`,
            messages: tail.map((m) => ({ role: m.role, content: m.content })),
            runtime: resolved.runtime,
          });
          result.created += distilled.created;
          result.merged += distilled.merged;
          result.promoted += distilled.promoted;
          result.gated += distilled.gated;
        }
        // Cursor advances only after a successful distillation, so failures
        // retry on the next sweep.
        await models.MastraThread.updateOne(
          { threadId: thread.threadId },
          { $set: { distilledMessageCount: all.length } },
        );
        result.threads++;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(
          `[erxes-agent:learning] thread "${thread.threadId}" skipped: ${
            e?.message || e
          }`,
        );
      }
    }

    const hygiene = await runHygiene(models, tenant);
    result.decayed = hygiene.decayed;
    result.archived = hygiene.archived;
    return result;
  } catch (e) {
    return { ...result, error: e?.message || String(e) };
  }
}

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
export async function initLearningSweep(redis: RedisConnection): Promise<void> {
  const schedulerQueue = new Queue(`${SERVICE}-${SCHEDULER_QUEUE}`, {
    connection: redis,
  });

  await schedulerQueue.upsertJobScheduler(
    `${SERVICE}-learning-sweep-cron`,
    { pattern: learningSweepCron(), tz: 'UTC' },
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
      console.log('[erxes-agent:learning] sweep scheduler ready');
    },
  );

  createMQWorkerWithListeners(
    SERVICE,
    SWEEP_QUEUE,
    async (job) => {
      const { subdomain } = job?.data ?? {};
      if (!subdomain) return 'skipped: no subdomain';
      const result = await runLearningSweep(subdomain);
      const errorSuffix = result.error ? `, error: ${result.error}` : '';
      // eslint-disable-next-line no-console
      console.log(
        `[erxes-agent:learning] sweep "${subdomain}": ${result.threads} threads, +${result.created} created, ~${result.merged} merged, ↑${result.promoted} promoted, ✕${result.gated} gated, ↓${result.decayed} decayed, ${result.archived} archived${errorSuffix}`,
      );
      return result;
    },
    redis,
    () => {
      // eslint-disable-next-line no-console
      console.log('[erxes-agent:learning] sweep worker ready');
    },
  );

  // Initial sweep so a fresh deploy doesn't wait for the first cron tick.
  await enqueueSweepPerTenant();
}
