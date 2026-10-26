import { randomUUID } from 'node:crypto';
import { AGENTS_RUN_INTERRUPTED_MESSAGE } from './agentsStream';
import type { IAgentsRuntime } from './memory';

interface IAgentsRunScope {
  runId: string;
  threadId: string;
  resourceId: string;
}

/**
 * - `live`: a producer (or a suspended human-interaction gate) holds the run;
 * - `interrupted`: the run was still marked running with no producer, so it
 *   was just settled as failed — its process restarted or crashed;
 * - `inactive`: not running in this scope, including a run that finished.
 */
export type TAgentsRunState = 'live' | 'interrupted' | 'inactive';

/** Persisted running status is discovery data, not evidence of a live producer. */
export const probeAgentsRun = async (
  runtime: IAgentsRuntime,
  scope: IAgentsRunScope,
): Promise<TAgentsRunState> => {
  const { runs: suspended } = await runtime.agent.listSuspendedRuns(scope);
  if (suspended.some((run) => run.runId === scope.runId)) return 'live';

  const workflows = await runtime.mastra.getStorage()?.getStore('workflows');
  if (!workflows) throw new Error('Agents workflow storage is unavailable.');

  const { agentThreadStreamRuntime, DurableStepIds } = await import(
    '@mastra/core/agent/durable'
  );
  const fenced = await workflows.supportsRunFencing();
  const owner = fenced
    ? await workflows.getRunOwnership({ runId: scope.runId })
    : null;
  if (owner?.live) return 'live';

  // Standalone MongoDB and runs started before storage fencing use the native
  // Redis thread lease. It expires when the producing process stops renewing it.
  if (
    !owner &&
    (await agentThreadStreamRuntime.isRunHoldingThreadLease(
      runtime.agent.getPubSub(),
      scope.runId,
      scope.threadId,
      scope.resourceId,
    ))
  )
    return 'live';

  const snapshot = await workflows.loadWorkflowSnapshot({
    workflowName: DurableStepIds.AGENTIC_LOOP,
    runId: scope.runId,
  });
  const input = snapshot?.context.input;
  const memoryInfo = input?.messageListState?.memoryInfo;
  if (
    snapshot?.status !== 'running' ||
    input?.agentId !== runtime.agent.id ||
    memoryInfo?.threadId !== scope.threadId ||
    memoryInfo?.resourceId !== scope.resourceId
  )
    return 'inactive';

  const claim = fenced
    ? await workflows.claimRunOwnership({
        runId: scope.runId,
        ownerId: randomUUID(),
        leaseMs: 30_000,
        expectedGeneration: owner?.generation ?? 0,
      })
    : undefined;
  // A producer/recoverer won the race. Never terminate its execution.
  if (claim && !claim.acquired) return 'live';

  const fence = claim?.acquired
    ? {
        runId: scope.runId,
        ownerId: claim.record.ownerId,
        generation: claim.record.generation,
      }
    : undefined;
  try {
    // Native storage transition, without re-executing tools or model calls.
    // Terminal discovery also releases message editing from the stale run.
    const settled = await workflows.updateWorkflowState({
      workflowName: DurableStepIds.AGENTIC_LOOP,
      runId: scope.runId,
      opts: {
        status: 'failed',
        expectedStatus: 'running',
        error: {
          name: 'AgentsRunInterrupted',
          message: AGENTS_RUN_INTERRUPTED_MESSAGE,
        },
      },
      ...(fence ? { fence } : {}),
    });
    // No write: the run left `running` (it finished) after the read above.
    return settled ? 'interrupted' : 'inactive';
  } finally {
    if (fence) await workflows.releaseRunOwnership(fence);
  }
};
