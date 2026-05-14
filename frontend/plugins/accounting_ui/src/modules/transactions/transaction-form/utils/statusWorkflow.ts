import { TR_STATUSES } from '../../types/constants';

type TStatusOption = {
  value: string;
  label: string;
};

type TWorkflowParams = {
  currentUserId?: string;
  mentionOwnerId?: string;
  mentionUserIds?: string[];
  status?: string;
};

const unique = (ids: string[] = []) => [...new Set(ids.filter(Boolean))];

export const isMentionOwner = ({
  currentUserId,
  mentionOwnerId,
}: TWorkflowParams) => !!currentUserId && currentUserId === mentionOwnerId;

export const isMentionResponder = ({
  currentUserId,
  mentionUserIds,
}: TWorkflowParams) =>
  !!currentUserId && unique(mentionUserIds).includes(currentUserId);

const OWNER_STATUS_VALUES = [
  TR_STATUSES.DRAFT,
  TR_STATUSES.MENTIONED,
  TR_STATUSES.APPROVED,
  TR_STATUSES.REJECED,
  TR_STATUSES.PROGRESS,
  TR_STATUSES.ASSIGNED,
  TR_STATUSES.CONFIRMED,
  TR_STATUSES.CANELLED,
  TR_STATUSES.COMPLETE,
  TR_STATUSES.PLAN,
];

const RESPONDER_STATUS_VALUES = [
  TR_STATUSES.APPROVED,
  TR_STATUSES.PROGRESS,
  TR_STATUSES.COMPLETE,
  TR_STATUSES.REJECED,
  TR_STATUSES.RETURNED,
];

const DEFAULT_STATUS_VALUES = [
  TR_STATUSES.DRAFT,
  TR_STATUSES.MENTIONED,
  TR_STATUSES.PROGRESS,
  TR_STATUSES.COMPLETE,
];

export const getAvailableTrStatusOptions = (
  params: TWorkflowParams,
  options: TStatusOption[],
) => {
  const { status } = params;
  let values = DEFAULT_STATUS_VALUES;

  if (isMentionOwner(params) || !status) {
    values = OWNER_STATUS_VALUES;
  } else if (
    isMentionResponder(params) &&
    [TR_STATUSES.MENTIONED, TR_STATUSES.RETURNED].includes(status)
  ) {
    values = RESPONDER_STATUS_VALUES;
  }

  return options.filter(
    (option) => values.includes(option.value) || option.value === status,
  );
};

export const getNextMentionFields = ({
  currentUserId,
  nextStatus,
  mentionOwnerId,
  mentionUserIds,
}: TWorkflowParams & { nextStatus: string }) => {
  if (nextStatus !== TR_STATUSES.RETURNED || !currentUserId) {
    return {
      mentionOwnerId,
      mentionUserIds: unique(mentionUserIds),
    };
  }

  return {
    mentionOwnerId: currentUserId,
    mentionUserIds: mentionOwnerId ? [mentionOwnerId] : [],
  };
};
