import { randomUUID } from 'node:crypto';
import type { IAgentsRuntime } from './memory';

interface IAgentsRunScope {
  runId: string;
  threadId: string;
  resourceId: string;
}

/** Persisted running status is discovery data, not evidence of a live producer. */
export const isAgentsRunAlive = async (
  runtime: IAgentsRuntime,
  scope: IAgentsRunScope,
): Promise<boolean> => {
  const { runs: suspended } = await runtime.agent.listSuspendedRuns(scope);
  if (suspended.some((run) => run.runId === scope.runId)) return true;

  const workflows = await runtime.mastra.getStorage()?.getStore('workflows');
  if (!workflows) throw new Error('Agents workflow storage is unavailable.');

  const { agentThreadStreamRuntime, DurableStepIds } = await import(
    '@mastra/core/agent/durable'
  );
  const fenced = await workflows.supportsRunFencing();
  const owner = fenced
    ? await workflows.getRunOwnership({ runId: scope.runId })
    : null;
  if (owner?.live) return true;

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
    return true;

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
    return false;

  const claim = fenced
    ? await workflows.claimRunOwnership({
        runId: scope.runId,
        ownerId: randomUUID(),
        leaseMs: 30_000,
        expectedGeneration: owner?.generation ?? 0,
      })
    : undefined;
  // A producer/recoverer won the race. Never terminate its execution.
  if (claim && !claim.acquired) return true;

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
    await workflows.updateWorkflowState({
      workflowName: DurableStepIds.AGENTIC_LOOP,
      runId: scope.runId,
      opts: {
        status: 'failed',
        expectedStatus: 'running',
        error: {
          name: 'AgentsRunInterrupted',
          message:
            'The response was interrupted by a server restart. Send a new message to continue.',
        },
      },
      ...(fence ? { fence } : {}),
    });
    return false;
  } finally {
    if (fence) await workflows.releaseRunOwnership(fence);
  }
};
