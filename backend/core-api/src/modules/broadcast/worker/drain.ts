import { IBroadcastRecipientDocument } from '@/broadcast/db/models/BroadcastRecipients';
import { IBroadcastRunDocument } from '@/broadcast/db/models/BroadcastRuns';
import {
  addBroadcastWorkerQueue,
  BROADCAST_QUEUES,
} from '@/broadcast/utils/worker';
import { publishBroadcastChanged } from '@/broadcast/utils/publishBroadcast';
import { generateModels, IModels } from '~/connectionResolvers';

const FAILURE_THRESHOLD = 0.8;

export interface IDrainPayload {
  subdomain: string;
  runId: string;
  campaignTitle?: string;
  kind?: 'drain' | 'heartbeat';
  beat?: number;
}

// How often a run checks that something is still working on it.
const HEARTBEAT_MS = 5 * 60 * 1000;

/**
 * Hands one claimed block to the method that knows how to send it.
 *
 * The block is the unit, not the recipient, because a lane can have its own
 * allowance to weigh a whole block against — the email one does. Whatever it
 * is given it accounts for: every row comes back finished or released.
 */
/**
 * What a lane reports back about a block it was given.
 *
 * `exhausted` means it stopped early and put what it did not send back in the
 * manifest. `resumeIn` says how long to leave it — a spent daily allowance is
 * tomorrow's problem, a provider asking to slow down is a minute's.
 */
export type TDrainOutcome = {
  exhausted?: boolean;
  resumeIn?: number;
  reason?: string;
};

export type TDrainDeliver = (args: {
  models: IModels;
  subdomain: string;
  run: IBroadcastRunDocument;
  recipients: IBroadcastRecipientDocument[];
}) => Promise<TDrainOutcome | void>;

/**
 * Keeps one slow pulse on a run so it cannot be forgotten.
 *
 * A drain lives inside a job, and a job can be lost — the queue retries a
 * stalled one once and then gives up. The manifest would survive that, but
 * nothing would be reading it, and the campaign would sit half-sent with
 * nobody able to tell. The pulse rides with the run, carries its subdomain
 * like every other job, and stops on its own when the run does.
 */
export const scheduleHeartbeat = async (
  payload: IDrainPayload,
  delay = HEARTBEAT_MS,
) => {
  const beat = (payload.beat || 0) + 1;

  await addBroadcastWorkerQueue({
    // A pulse only asks a question; it must not queue behind the answer.
    queueName: BROADCAST_QUEUES.SCHEDULING,
    data: {
      method: 'heartbeat',
      payload: { ...payload, kind: 'heartbeat', beat },
    },
    jobId: `${payload.runId}_beat${beat}`,
    delay,
  });
};

const untilTomorrow = () => {
  const next = new Date();

  next.setUTCHours(24, 0, 0, 0);

  return next.getTime() - Date.now();
};

/**
 * Whether this run may keep taking recipients. Pause is `isLive: false` on the
 * campaign and leaves `status` alone, so both have to be read.
 */
const canDrain = async (models: IModels, run: IBroadcastRunDocument) => {
  if (run.status !== 'running') {
    return false;
  }

  const campaign = await models.EngageMessages.findOne(
    { _id: run.engageMessageId },
    { isLive: 1, status: 1 },
  ).lean();

  return !!campaign?.isLive && campaign.status === 'sending';
};

const syncProgress = async (
  models: IModels,
  subdomain: string,
  run: IBroadcastRunDocument,
) => {
  const [sent, failed, processed] = await Promise.all([
    models.BroadcastRecipients.countDocuments({
      runId: run._id,
      status: 'sent',
    }),
    models.BroadcastRecipients.countDocuments({
      runId: run._id,
      status: { $in: ['failed', 'missing', 'skipped'] },
    }),
    models.BroadcastRecipients.countDocuments({
      runId: run._id,
      status: { $nin: ['pending', 'claimed'] },
    }),
  ]);

  const lastUpdated = new Date();

  await models.EngageMessages.updateOne(
    { _id: run.engageMessageId },
    {
      $set: {
        validCustomersCount: sent,
        'progress.successCount': sent,
        'progress.failureCount': failed,
        'progress.processedBatches': processed,
        'progress.lastUpdated': lastUpdated,
      },
    },
  );

  publishBroadcastChanged(subdomain, {
    engageMessageId: run.engageMessageId,
    progress: {
      successCount: sent,
      failureCount: failed,
      processedBatches: processed,
      lastUpdated,
    },
  });
};

/**
 * Closes the run once nothing is left to take. Derived from the manifest
 * rather than a batch counter, so a paused run cannot count itself finished.
 */
const settleRun = async (
  models: IModels,
  subdomain: string,
  run: IBroadcastRunDocument,
  campaignTitle: string,
) => {
  const [sent, failed] = await Promise.all([
    models.BroadcastRecipients.countDocuments({
      runId: run._id,
      status: 'sent',
    }),
    models.BroadcastRecipients.countDocuments({
      runId: run._id,
      status: { $in: ['failed', 'missing'] },
    }),
  ]);

  const totalProcessed = sent + failed;
  const failureRate = totalProcessed > 0 ? failed / totalProcessed : 0;
  const finalStatus = failureRate >= FAILURE_THRESHOLD ? 'failed' : 'completed';

  // Only the drain that actually closed the run announces it.
  if (!(await models.BroadcastRuns.finishRun(run._id, finalStatus))) {
    return;
  }

  const { modifiedCount } = await models.EngageMessages.updateOne(
    { _id: run.engageMessageId, status: { $eq: 'sending' } },
    { $set: { status: finalStatus } },
  );

  // The last block's progress may have been held back, so the close carries
  // the counts as stored rather than recounting them another way.
  const settled = await models.EngageMessages.findOne(
    { _id: run.engageMessageId },
    { progress: 1 },
  ).lean();

  publishBroadcastChanged(subdomain, {
    engageMessageId: run.engageMessageId,
    ...(modifiedCount ? { status: finalStatus } : {}),
    ...(settled?.progress ? { progress: settled.progress } : {}),
  });

  await models.BroadcastTraces.createTrace(
    run.engageMessageId,
    finalStatus === 'failed' ? 'failure' : 'success',
    `Campaign ${finalStatus}. "${campaignTitle}" reached ${sent} customers, ${failed} could not be reached.`,
  );
};

/**
 * Answers whether the run still needs someone working on it, and arranges for
 * that if so. Silent when the run is paused: resuming re-arms the drains, and
 * a pulse that kept firing through a pause would be noise.
 */
export const heartbeatRun = async (payload: unknown) => {
  const beat = payload as IDrainPayload;

  const models = await generateModels(beat.subdomain);
  const run = await models.BroadcastRuns.findOne({ _id: beat.runId });

  if (!run || !(await canDrain(models, run))) {
    return;
  }

  const outstanding = await models.BroadcastRecipients.exists({
    runId: beat.runId,
    status: { $in: ['pending', 'claimed'] },
  });

  if (!outstanding) {
    return;
  }

  // One extra drain: if others are alive it simply shares the manifest, and if
  // none are it is the one that picks the run back up.
  await addBroadcastWorkerQueue({
    queueName: BROADCAST_QUEUES.SENDING,
    data: {
      method: run.method,
      payload: {
        subdomain: beat.subdomain,
        runId: beat.runId,
        campaignTitle: beat.campaignTitle,
      },
    },
    jobId: `${beat.runId}_revive${beat.beat}`,
  });

  await scheduleHeartbeat(beat);
};

/**
 * Drains a run's manifest. Several of these can run against one manifest; the
 * claim is what keeps them off each other's recipients. A pause is noticed
 * between blocks, so a run continues at most one block past it.
 */
export const drainRun = async (payload: unknown, deliver: TDrainDeliver) => {
  const { subdomain, runId, campaignTitle } = payload as IDrainPayload;

  const models = await generateModels(subdomain);

  const run = await models.BroadcastRuns.findOne({ _id: runId });

  if (!run) {
    return;
  }

  try {
    while (await canDrain(models, run)) {
      const block = await models.BroadcastRecipients.claimBlock(runId);

      if (!block.length) {
        break;
      }

      const outcome = await deliver({
        models,
        subdomain,
        run,
        recipients: block,
      });

      await syncProgress(models, subdomain, run);

      if (outcome?.exhausted) {
        // The rows it could not send are back in the manifest, so whoever
        // picks the run up next simply takes them.
        const delay = outcome.resumeIn ?? untilTomorrow();
        const resumeAt = Date.now() + delay;

        await addBroadcastWorkerQueue({
          queueName: BROADCAST_QUEUES.SENDING,
          data: {
            method: run.method,
            payload: { subdomain, runId, campaignTitle },
          },
          // Keyed by the minute it resumes rather than by now: four drains
          // meeting the same wall arrange one resumption between them.
          jobId: `${runId}_resume_${Math.floor(resumeAt / 60_000)}`,
          delay,
        });

        await models.BroadcastTraces.createTrace(
          run.engageMessageId,
          'regular',
          outcome.reason ||
            "Paused until tomorrow: today's sending allowance is spent.",
        );

        return;
      }
    }

    if (await models.BroadcastRecipients.isRunDrained(runId)) {
      await settleRun(
        models,
        subdomain,
        run,
        campaignTitle || run.engageMessageId,
      );
    }
  } catch (error: any) {
    console.error(`Critical error draining run ${runId}:`, error);

    await models.BroadcastRuns.finishRun(runId, 'failed');

    await models.EngageMessages.updateOne(
      { _id: run.engageMessageId },
      { $set: { status: 'failed' } },
    );

    publishBroadcastChanged(subdomain, {
      engageMessageId: run.engageMessageId,
      status: 'failed',
    });

    await models.BroadcastTraces.createTrace(
      run.engageMessageId,
      'failure',
      `Run stopped: ${error.message}`,
    );
  }
};
