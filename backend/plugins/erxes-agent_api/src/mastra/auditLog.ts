import { randomBytes } from 'crypto';
import type { IModels } from '~/connectionResolvers';

/**
 * A per-action correlation id sent to erxes as the x-erxes-process-id header so
 * the resulting DB changes (and their synchronous cascade) share one processId
 * and can be traced/reverted together. base64url keeps it within the core
 * validator's `[A-Za-z0-9_-]{8,64}` window; the agt_ prefix marks the origin.
 */
export function makeAgentProcessId(): string {
  return `agt_${randomBytes(9).toString('base64url')}`;
}

// The fields a tool layer produces about one mutation attempt. The source +
// principal (agentId / workflowId) are added by the caller that owns them.
export interface AgentActionInput {
  operation: string;
  operationType: string;
  destructive: boolean;
  args?: Record<string, unknown>;
  status: 'success' | 'failed' | 'blocked';
  error?: string;
  // The x-erxes-process-id stamped on the underlying mutation (executed ops only).
  processId?: string;
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
  // Guard a missing model (e.g. a partial test harness) before touching it, so
  // the conditional never operates on a promise.
  const model = models?.MastraAgentActionLog;
  if (!model?.record) return;

  // Fire-and-forget by design: an audit write must never slow down or break the
  // action it records. Not awaited; the catch swallows a rejected write (and
  // marks the promise handled so it is not a floating promise).
  model
    .record(entry)
    .catch((err) => console.error('writeAgentAction failed', err));
}
