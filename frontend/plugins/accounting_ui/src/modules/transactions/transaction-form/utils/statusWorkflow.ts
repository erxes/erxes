import { TR_STATUSES } from '../../types/constants';

type TWorkflowState = {
  status?: string;
  mentionUserIds?: string[];
};

export const isAddressedTrStatus = (status?: string) =>
  status === TR_STATUSES.MENTIONED || status === TR_STATUSES.REQUESTED;

const uniqueIds = (ids?: string[] | null) => [
  ...new Set((ids || []).filter(Boolean)),
];

/**
 * A listed user of a saved `mentioned`/`requested` transaction. They open
 * the form in the decision view: Approve, Decline and the manage toggle.
 */
export const isTrResponder = (saved: TWorkflowState, userId?: string) =>
  !!userId &&
  isAddressedTrStatus(saved.status) &&
  uniqueIds(saved.mentionUserIds).includes(userId);

/**
 * Approve/Decline decide the saved state, so they only apply while the form
 * still holds the saved status and recipients; editing either one turns the
 * save into a direct change instead.
 */
export const hasSavedWorkflow = (
  saved: TWorkflowState,
  current: TWorkflowState,
) => {
  const savedIds = uniqueIds(saved.mentionUserIds);
  const currentIds = uniqueIds(current.mentionUserIds);

  return (
    (current.status || '') === (saved.status || '') &&
    savedIds.length === currentIds.length &&
    savedIds.every((id) => currentIds.includes(id))
  );
};

/** Owners can ask for approval from a draft or while executing. */
export const canRequestTrApproval = (status?: string) =>
  !status ||
  [TR_STATUSES.DRAFT, TR_STATUSES.MENTIONED, TR_STATUSES.EXECUTING].includes(
    status,
  );
