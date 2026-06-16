import { OperationMeta } from './operationRegistry';

// Consent for irreversible mutations, stored per-agent (and per-workflow).
//   'block' (default) → the agent may NOT run remove/delete/merge operations.
//   'allow'           → destructive operations are permitted.
// 'confirm' is intentionally NOT a value yet: a human-in-the-loop approval flow
// does not exist on the chat/scheduled transports, so anything other than an
// explicit 'allow' must fall through to 'block' and never silently destroy data.
export type DestructiveOpsPolicy = 'block' | 'allow';

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
  return value === 'allow' ? 'allow' : 'block';
}

/**
 * The structured refusal returned to the model when it attempts a destructive
 * operation without consent. Deliberately actionable: the model should explain
 * the limit to the user and offer a safe alternative, NOT silently retry.
 */
export function destructiveBlockedResult(operation: string) {
  return {
    success: false,
    blocked: true,
    error: `Operation "${operation}" deletes or merges data and is blocked for this agent.`,
    instruction:
      'Do NOT retry this operation. Tell the user plainly that this agent is not ' +
      'allowed to delete or merge records, and that an administrator can enable ' +
      'destructive operations in the agent settings if it is intended. Where it ' +
      'helps, suggest a non-destructive alternative such as editing or archiving ' +
      'instead of removing.',
  };
}
