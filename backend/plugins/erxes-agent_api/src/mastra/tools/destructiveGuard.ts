import { OperationMeta } from './operationRegistry';
import { ApprovedOp } from '../requestContext';

// Consent for irreversible mutations, stored per-agent (and per-workflow).
//   'ask' (default) → remove/delete/merge run only after the user approves them
//                     in chat (the agent never silently destroys data, and never
//                     hard-refuses — it asks).
//   'allow'         → destructive operations run without asking.
// The legacy value 'block' resolves to 'ask' (we no longer hard-refuse).
export type DestructiveOpsPolicy = 'ask' | 'allow';

// erxes mutation names are suffix-based: customersRemove, dealsRemove,
// segmentsDelete, customersMerge, companiesMerge. Match those verbs anywhere in
// the operation name. We gate ONLY mutations, so reads are never affected.
// 'archive' is deliberately excluded — it is the reversible, soft alternative to
// a hard delete, so blocking it would push the model toward the worse option.
const DESTRUCTIVE_NAME = /(remove|delete|merge|destroy)/i;

/** True when `op` is a mutation that irreversibly destroys or merges data. */
export function isDestructiveOperation(op: OperationMeta): boolean {
  if (op.operationType !== 'mutation') return false;
  return DESTRUCTIVE_NAME.test(op.operation);
}

/**
 * Resolve the destructive-ops consent from a stored config object (an agent
 * document or a workflow definition). Anything other than an explicit 'allow'
 * — including a missing field on a legacy agent — resolves to 'block', so the
 * safe default holds even before the field is persisted.
 */
export function resolveDestructiveOpsPolicy(
  config: unknown,
): DestructiveOpsPolicy {
  const value = (config as { destructiveOps?: unknown } | null | undefined)
    ?.destructiveOps;
  // Only an explicit 'allow' skips the prompt; everything else (incl. the legacy
  // 'block' and a missing field) means "ask the user".
  return value === 'allow' ? 'allow' : 'ask';
}

/** Stable serialization of an op's args so an approval matches the exact call. */
function canonicalArgs(args: unknown): string {
  if (!args || typeof args !== 'object') return '';
  const obj = args as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return JSON.stringify(keys.map((k) => [k, obj[k]]));
}

/** True when the user has approved this exact operation + args for the turn. */
export function isApprovedOperation(
  operation: string,
  args: unknown,
  approved: ApprovedOp[] | undefined,
): boolean {
  if (!approved?.length) return false;
  const target = canonicalArgs(args);
  return approved.some(
    (a) => a.operation === operation && canonicalArgs(a.args) === target,
  );
}

/**
 * The structured result returned when the model attempts a destructive
 * operation that the user has not yet approved. The agent must NOT retry — it
 * surfaces the intent so the user gets an Approve / Deny prompt; the operation
 * runs only on the follow-up turn carrying the approval.
 */
export function destructiveApprovalRequiredResult(
  operation: string,
  args: Record<string, unknown>,
) {
  return {
    success: false,
    requiresApproval: true,
    operation,
    args,
    error: `Operation "${operation}" deletes or merges data and needs the user's approval.`,
    instruction:
      'Do NOT retry this operation and take no other action this turn. Reply with ' +
      'ONE short question asking the user to confirm, naming exactly what will be ' +
      'affected (for example: "Delete these 7 products?"). Do NOT mention buttons, ' +
      'approval, or that they will be prompted — just ask the question. The ' +
      'operation runs automatically once they approve.',
  };
}
