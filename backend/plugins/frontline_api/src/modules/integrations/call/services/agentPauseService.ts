import { IModels } from '~/connectionResolvers';
import { getPbxDateKey, parseCdrDate } from './cdrUtils';

interface IRealtimeAgent {
  member_extension?: string;
  status?: string;
  first_name?: string;
  last_name?: string;
  answer?: number | string;
  abandon?: number | string;
  talktime?: number | string;
  pausetime?: string;
  pause_reason?: string;
}

const PAUSED_STATUS = 'Paused';

export const recordAgentPauseTransitions = async (
  models: IModels,
  integrationId: string,
  queue: string,
  agents: IRealtimeAgent[],
): Promise<void> => {
  if (!integrationId || !queue || !Array.isArray(agents) || !agents.length) {
    return;
  }

  const date = getPbxDateKey();

  for (const agent of agents) {
    const extension = agent.member_extension;
    if (!extension) continue;

    const status = agent.status || '';
    const isPausedNow = status === PAUSED_STATUS;

    const existing = await models.CallAgentPauseStats.findOne({
      integrationId,
      queue,
      extension,
      date,
    });

    const previousPauseStart = existing?.currentPauseStartedAt as
      | Date
      | undefined;
    const wasPausedBefore = Boolean(previousPauseStart);

    const latestFields = {
      firstName: agent.first_name,
      lastName: agent.last_name,
      status,
      answer: Number(agent.answer) || 0,
      abandon: Number(agent.abandon) || 0,
      talktime: Number(agent.talktime) || 0,
      pauseReason: agent.pause_reason || '',
    };

    if (isPausedNow && !wasPausedBefore) {
      const pausedAt = parseCdrDate(agent.pausetime) || new Date();

      await models.CallAgentPauseStats.updateOne(
        { integrationId, queue, extension, date },
        {
          $set: { ...latestFields, currentPauseStartedAt: pausedAt },
          $setOnInsert: { pauseIntervals: [], totalPausedSec: 0 },
        },
        { upsert: true },
      );
      continue;
    }

    if (!isPausedNow && previousPauseStart) {
      const pausedAt = previousPauseStart;
      const resumedAt = new Date();
      const durationSec = Math.max(
        0,
        Math.round((resumedAt.getTime() - pausedAt.getTime()) / 1000),
      );

      await models.CallAgentPauseStats.updateOne(
        { integrationId, queue, extension, date },
        {
          $set: { ...latestFields, currentPauseStartedAt: null },
          $push: {
            pauseIntervals: { start: pausedAt, end: resumedAt, durationSec },
          },
          $inc: { totalPausedSec: durationSec },
        },
      );
      continue;
    }

    await models.CallAgentPauseStats.updateOne(
      { integrationId, queue, extension, date },
      {
        $set: latestFields,
        $setOnInsert: { pauseIntervals: [], totalPausedSec: 0 },
      },
      { upsert: true },
    );
  }
};
