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
  const status = next.status ?? old?.status ?? TR_STATUSES.DRAFT;
  const oldMentionUserIds = uniqueIds(old?.mentionUserIds);
  const mentionUserIds = uniqueIds(next.mentionUserIds ?? oldMentionUserIds);
  const mentionOwnerId = next.mentionOwnerId || old?.mentionOwnerId || userId;

  if (decision) {
    const oldStatus = old?.status;
    if (!isAddressed(oldStatus) || !oldMentionUserIds.includes(userId)) {
      throw new Error(
        'Only a listed approver can decide an open transaction request',
      );
    }

    // A request waits for every listed user; one decline ends it. Each
    // approval removes the responder, so `mentionUserIds` is who still owes
    // a decision. A request reaches `complete` (real) or falls back to
    // `executing` (soon); an addressed draft only ever returns to the
    // owner's own draft, so a draft review never posts anything.
    const declined = decision === 'DECLINE';
    const remainingUserIds = declined
      ? oldMentionUserIds
      : oldMentionUserIds.filter((id) => id !== userId);
    const isRequest = oldStatus === TR_STATUSES.REQUESTED;
    const doneStatus = isRequest ? TR_STATUSES.COMPLETE : TR_STATUSES.DRAFT;
    const declinedStatus = isRequest
      ? TR_STATUSES.EXECUTING
      : TR_STATUSES.DRAFT;

    return {
      status: declined
        ? declinedStatus
        : remainingUserIds.length
        ? oldStatus
        : doneStatus,
      mentionOwnerId: old?.mentionOwnerId || mentionOwnerId,
      mentionUserIds: remainingUserIds,
    };
  }

  if (!TR_STATUSES.ALL.includes(status)) {
    throw new Error('Invalid transaction status');
  }
  if (isAddressed(status) && !mentionUserIds.length) {
    throw new Error(
      status === TR_STATUSES.REQUESTED
        ? 'Select at least one approver to request approval'
        : 'Select at least one user to address this draft',
    );
  }

  return { status, mentionOwnerId, mentionUserIds };
};
