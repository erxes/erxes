import { TR_STATUSES } from '../@types/constants';
import { ITransaction } from '../@types/transaction';

type TWorkflowState = Pick<
  ITransaction,
  'status' | 'mentionOwnerId' | 'mentionUserIds'
>;

export type TTransactionDecision = 'APPROVE' | 'DECLINE';

const uniqueIds = (ids: string[] = []) => [...new Set(ids.filter(Boolean))];

const isAddressed = (status?: string): status is string =>
  status === TR_STATUSES.MENTIONED || status === TR_STATUSES.REQUESTED;

/**
 * A request waits for every listed user; one decline ends it. Each approval
 * removes the responder, so `mentionUserIds` is who still owes a decision.
 * A request reaches `complete` (real) or falls back to `executing` (soon);
 * an addressed draft only ever returns to the owner's own draft, so a draft
 * review never posts anything.
 */
const resolveDecision = (
  decision: TTransactionDecision,
  old: TWorkflowState | undefined,
  userId: string,
): TWorkflowState => {
  const oldStatus = old?.status;
  const oldMentionUserIds = uniqueIds(old?.mentionUserIds);

  if (!isAddressed(oldStatus) || !oldMentionUserIds.includes(userId)) {
    throw new Error(
      'Only a listed approver can decide an open transaction request',
    );
  }

  const isRequest = oldStatus === TR_STATUSES.REQUESTED;
  const decided = { mentionOwnerId: old?.mentionOwnerId || userId };

  if (decision === 'DECLINE') {
    return {
      ...decided,
      status: isRequest ? TR_STATUSES.EXECUTING : TR_STATUSES.DRAFT,
      mentionUserIds: oldMentionUserIds,
    };
  }

  const remainingUserIds = oldMentionUserIds.filter((id) => id !== userId);
  if (remainingUserIds.length) {
    return { ...decided, status: oldStatus, mentionUserIds: remainingUserIds };
  }

  return {
    ...decided,
    status: isRequest ? TR_STATUSES.COMPLETE : TR_STATUSES.DRAFT,
    mentionUserIds: [],
  };
};

const ADDRESS_REQUIRED_MESSAGES: Record<string, string> = {
  [TR_STATUSES.REQUESTED]: 'Select at least one approver to request approval',
  [TR_STATUSES.MENTIONED]: 'Select at least one user to address this draft',
};

export const resolveTrStatusWorkflow = ({
  next,
  old,
  userId,
  decision,
}: {
  next: TWorkflowState;
  old?: TWorkflowState;
  userId: string;
  decision?: TTransactionDecision;
}): TWorkflowState => {
  if (decision) {
    return resolveDecision(decision, old, userId);
  }

  const status = next.status ?? old?.status ?? TR_STATUSES.DRAFT;
  const mentionUserIds = uniqueIds(next.mentionUserIds ?? old?.mentionUserIds);
  const mentionOwnerId = next.mentionOwnerId || old?.mentionOwnerId || userId;

  if (!TR_STATUSES.ALL.includes(status)) {
    throw new Error('Invalid transaction status');
  }
  if (isAddressed(status) && !mentionUserIds.length) {
    throw new Error(ADDRESS_REQUIRED_MESSAGES[status]);
  }

  return { status, mentionOwnerId, mentionUserIds };
};
