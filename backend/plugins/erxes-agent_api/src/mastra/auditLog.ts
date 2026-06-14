import type { IModels } from '~/connectionResolvers';

// The fields a tool layer produces about one mutation attempt. The source +
// principal (agentId / workflowId) are added by the caller that owns them.
export interface AgentActionInput {
  operation: string;
  operationType: string;
  destructive: boolean;
  args?: Record<string, unknown>;
  status: 'success' | 'failed' | 'blocked';
  error?: string;
}

export interface AgentActionEntry extends AgentActionInput {
  source: 'chat' | 'workflow';
  agentId?: string;
  workflowId?: string;
}

/**
 * Persist one agent action to the audit trail. Fire-and-forget by design: an
 * audit write must never slow down or break the action it records, so failures
 * are logged and swallowed rather than propagated.
 */
export function writeAgentAction(
  models: IModels,
  entry: AgentActionEntry,
): void {
  // Defensive on every axis: a missing model (e.g. a partial test harness), a
  // synchronous throw, or a rejected write must never surface to the caller.
  try {
    const pending = models?.MastraAgentActionLog?.record?.(entry);
    if (pending && typeof pending.catch === 'function') {
      pending.catch((err) => console.error('writeAgentAction failed', err));
    }
  } catch (err) {
    console.error('writeAgentAction failed', err);
  }
}
