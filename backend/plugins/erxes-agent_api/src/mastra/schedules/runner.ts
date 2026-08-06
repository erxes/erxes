// ---------------------------------------------------------------------------
// Scheduled agent run — executes one schedule's prompt against its agent and
// appends the exchange to the schedule's dedicated output thread.
//
// Both the cron worker (scheduler.ts) and the Run-now mutation come through
// runSchedule(). Runs always execute under the app token (the background
// principal), never a user session — Run now is a test of exactly what the
// cron will do, so it must use the same auth.
// ---------------------------------------------------------------------------

import type { IModels } from '~/connectionResolvers';
import type { IMastraScheduleDocument } from '@/schedule/@types/schedule';
import {
  HISTORY_LIMIT,
  runAgentTurn,
  TurnAgent,
  TurnMessage,
} from '@/agent/turn';
import { getOrCreateAgent } from '~/mastra/agentRuntime';
import { isLegacyProvider } from '~/mastra/providers';
import { runWithAuth } from '~/mastra/requestContext';

/** The dedicated output thread of one schedule — derived, never stored. */
export const scheduleThreadId = (scheduleId: string) =>
  `schedule-${scheduleId}`;

export interface ScheduleRunOutcome {
  status: 'success' | 'failed';
  reply?: string;
  error?: string;
}

/**
 * Runs one schedule end to end: agent turn → thread persistence → last-run
 * bookkeeping on the schedule document. Never throws — failures land in
 * lastStatus/lastError so the list page surfaces them.
 */
export async function runSchedule(args: {
  models: IModels;
  subdomain: string;
  schedule: IMastraScheduleDocument;
}): Promise<ScheduleRunOutcome> {
  const { models, subdomain, schedule } = args;
  const startedAt = Date.now();

  /** Persists last-run bookkeeping; never rejects, so the outcome (and the
   * "never throws" contract above) survives a failing recordRun write. */
  const finish = async (
    outcome: ScheduleRunOutcome,
  ): Promise<ScheduleRunOutcome> => {
    try {
      await models.MastraSchedule.recordRun(schedule._id, {
        status: outcome.status,
        error: outcome.error,
        reply: outcome.reply,
        durationMs: Date.now() - startedAt,
      });
    } catch (e) {
      console.error(
        `[erxes-agent:schedules] recordRun failed for ${schedule._id}: ${e?.message}`,
      );
    }
    return outcome;
  };

  try {
    const agentConfig = await models.MastraAgent.findOne({
      agentId: schedule.agentId,
      isEnabled: true,
    });
    if (!agentConfig) {
      return finish({
        status: 'failed',
        error: `Agent "${schedule.agentId}" not found or disabled`,
      });
    }

    const settings = await models.MastraSettings.findOne({});
    const providers = await models.MastraProvider.find({ isEnabled: true });
    const { agent, tools } = await getOrCreateAgent(agentConfig, models);

    const threadId = scheduleThreadId(schedule._id);
    await models.MastraThread.ensureThread(
      threadId,
      schedule.agentId,
      schedule.createdByUserId || '',
      `Schedule: ${schedule.name}`,
    );

    // Replay the thread's own history so successive runs can build on earlier
    // output (e.g. "compare with yesterday") — same gate as chat turns.
    const history =
      agentConfig.memoryEnabled === false
        ? []
        : await models.MastraMessage.getRecent(threadId, HISTORY_LIMIT);
    const convo: TurnMessage[] = [
      ...history.map((msg) => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: schedule.prompt },
    ];

    const authCtx = { token: settings?.erxesApiToken, subdomain };
    const isLegacy = isLegacyProvider(agentConfig.provider, providers);

    const reply = await runWithAuth(authCtx, () =>
      runAgentTurn({
        // Same narrowing as chat turns (turn.ts): Mastra's generate() output
        // is wider than the slice TurnAgent consumes.
        agent: agent as unknown as TurnAgent, // NOSONAR typescript:S4325 — removing it fails tsc
        tools,
        convo,
        message: schedule.prompt,
        isLegacy,
        authCtx,
      }),
    );

    await models.MastraMessage.addMessage(threadId, 'user', schedule.prompt);
    if (reply) {
      await models.MastraMessage.addMessage(threadId, 'assistant', reply);
    }
    await models.MastraThread.touchThread(threadId);

    return finish({ status: 'success', reply: reply ?? '' });
  } catch (e) {
    return finish({ status: 'failed', error: e?.message || String(e) });
  }
}
