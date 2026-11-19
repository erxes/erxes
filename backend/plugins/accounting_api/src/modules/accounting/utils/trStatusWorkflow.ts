import { TR_STATUSES } from '../@types/constants';

type TWorkflowState = {
  status?: string;
  mentionOwnerId?: string;
  mentionUserIds?: string[];
};

const RESPONDER_DECISIONS = [
  TR_STATUSES.APPROVED,
  TR_STATUSES.REJECED,
  TR_STATUSES.RETURNED,
];

const uniqueIds = (ids: string[] = []) => [...new Set(ids.filter(Boolean))];

const sameIds = (left: string[], right: string[]) =>
  left.length === right.length && left.every((id) => right.includes(id));

/**
 * Resolves the parent workflow status and mention fields for a save and
 * enforces who may make a conversation-level decision. Business and posted
 * statuses remain governed by journal permissions only.
 */
export const resolveTrStatusWorkflow = ({
  next,
  old,
  userId,
}: {
  next: TWorkflowState;
  old?: TWorkflowState;
  userId: string;
}): TWorkflowState => {
  const status = next.status;
  let mentionOwnerId = next.mentionOwnerId || old?.mentionOwnerId;
  let mentionUserIds = uniqueIds(next.mentionUserIds ?? old?.mentionUserIds);

  const oldStatus = old?.status;
  const oldUserIds = uniqueIds(old?.mentionUserIds);
  const wasMentioned = oldStatus === TR_STATUSES.MENTIONED;
  const isResponder = oldUserIds.includes(userId);

  if (
    wasMentioned &&
    status &&
    RESPONDER_DECISIONS.includes(status) &&
    oldUserIds.length &&
    !isResponder
  ) {
    throw new Error(
      'Only the mentioned approvers can approve, reject or return this transaction',
    );
  }

  if (status === TR_STATUSES.RETURNED && oldStatus !== TR_STATUSES.RETURNED) {
    // The responder asks the requester back; the request reverses direction.
    mentionOwnerId = userId;
    mentionUserIds = old?.mentionOwnerId ? [old.mentionOwnerId] : [];
  }

  if (
    wasMentioned &&
    status === TR_STATUSES.MENTIONED &&
    isResponder &&
    userId !== old?.mentionOwnerId &&
    !sameIds(mentionUserIds, oldUserIds)
  ) {
    // An approver forwarding to the next approver becomes the requester.
    mentionOwnerId = userId;
  }

  if (status === TR_STATUSES.MENTIONED && !mentionUserIds.length) {
    throw new Error('Select at least one approver to request approval');
  }

  return { status, mentionOwnerId, mentionUserIds };
};
