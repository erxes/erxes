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
  runAgentTurn,
  patchNativeTurn,
  TurnAgent,
  TurnMessage,
} from '@/agent/turn';
import { getOrCreateAgent } from '~/mastra/agentRuntime';
import { runWithAuth } from '~/mastra/requestContext';
import { isAdvancedMemoryEnabled } from '~/mastra/memory/config';
import { scopedResource } from '~/mastra/memory/mastraMemory';

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
    const { agent } = await getOrCreateAgent(agentConfig, models, subdomain);

    const threadId = scheduleThreadId(schedule._id);

    // The schedule's output thread lives in Mastra's native store under a
    // schedule-scoped resource (kept out of users' chat lists). Memory replays
    // the thread's own history so successive runs can build on earlier output
    // (e.g. "compare with yesterday") and persists this turn itself.
    const useMemory =
      isAdvancedMemoryEnabled() && agentConfig.memoryEnabled !== false;
    const memoryBinding = useMemory
      ? {
          thread: threadId,
          resource: scopedResource(subdomain, `schedule:${schedule._id}`),
        }
      : undefined;

    const authCtx = { token: settings?.erxesApiToken, subdomain };

    const convo: TurnMessage[] = [{ role: 'user', content: schedule.prompt }];
    const reply = await runWithAuth(authCtx, () =>
      runAgentTurn({
        // Same narrowing as chat turns (turn.ts): Mastra's generate() output
        // is wider than the slice TurnAgent consumes.
        agent: agent as unknown as TurnAgent, // NOSONAR typescript:S4325 — removing it fails tsc
        convo,
        message: schedule.prompt,
        authCtx,
        memory: memoryBinding,
      }),
    );

    // Native persistence already happened inside runAgentTurn; stamp the
    // thread↔agent + tenant metadata so the output thread is attributable.
    if (memoryBinding) {
      await patchNativeTurn({
        subdomain,
        binding: memoryBinding,
        agentId: schedule.agentId,
        reply,
      }).catch(() => null);
    }

    return finish({ status: 'success', reply: reply ?? '' });
  } catch (e) {
    return finish({ status: 'failed', error: e?.message || String(e) });
  }
}
