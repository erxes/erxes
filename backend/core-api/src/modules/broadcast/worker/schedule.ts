import { setEventHandlerRuntimeContext } from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { armSchedule, isRecurring, scheduledAt } from '../utils/schedule';

export interface ISchedulePayload {
  subdomain: string;
  engageMessageId: string;
  kind: 'start';
  // The moment this alarm was set for. It identifies the occurrence, both for
  // telling a stale alarm from the current one and for refusing a second run
  // of the same occurrence.
  at: number;
}

const traceFailure = (models: IModels, _id: string, message: string) =>
  models.BroadcastTraces.createTrace(_id, 'failure', message);

export const fireSchedule = async (payload: ISchedulePayload) => {
  const { subdomain, engageMessageId, at } = payload;

  const models = await generateModels(subdomain);
  const campaign = await models.EngageMessages.findOne({
    _id: engageMessageId,
  });

  // Put back to draft, or its schedule taken away. Either way the chain ends
  // here by simply not arming anything further.
  if (!campaign || campaign.isDraft || !campaign.scheduleDate) {
    return;
  }

  // Nobody is here to act. The change log records the send as the campaign's
  // author, since the schedule was their decision — an alarm going off is not
  // an anonymous write.
  setEventHandlerRuntimeContext(subdomain, { userId: campaign.createdBy });

  const occurrence = new Date(at);
  const recurring = isRecurring(campaign);

  if (recurring) {
    // Armed before sending, so a send that throws does not take the whole
    // series with it.
    await armSchedule(subdomain, campaign, occurrence);
  } else if (campaign.runCount || scheduledAt(campaign)?.getTime() !== at) {
    // Already sent, or moved to another moment while this alarm waited.
    return;
  }

  // One occurrence, one run. The unique index is the guarantee; this only
  // saves the work of finding out the expensive way.
  const already = await models.BroadcastRuns.findOne(
    { engageMessageId, scheduledFor: occurrence },
    { _id: 1 },
  ).lean();

  if (already) {
    return;
  }

  // A run still draining means the last occurrence has not finished. Sending
  // again would reach the same people twice, so this one is dropped and said
  // so rather than queued behind.
  const running = await models.BroadcastRuns.findOne(
    { engageMessageId, status: 'running' },
    { runCount: 1 },
  ).lean();

  if (running) {
    await traceFailure(
      models,
      engageMessageId,
      `Scheduled send skipped: run ${running.runCount} is still going.`,
    );

    return;
  }

  await models.BroadcastTraces.createTrace(
    engageMessageId,
    'regular',
    'Scheduled send started.',
  );

  try {
    await models.EngageMessages.goLive(engageMessageId, {
      scheduledFor: occurrence,
    });
  } catch (error: any) {
    // The index refusing a duplicate occurrence is it doing its job.
    if (error?.code === 11000) {
      return;
    }

    await models.EngageMessages.markFailed(engageMessageId);

    // Nobody is watching a worker, so the reason is written where the campaign
    // itself shows it.
    await traceFailure(
      models,
      engageMessageId,
      `Scheduled send failed to start: ${error.message}`,
    );
  }
};
