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

export type TTrWorkflowFields = {
  status: string;
  mentionOwnerId?: string;
  mentionUserIds: string[];
};

export type TTrWorkflowAction = {
  key: string;
  label: string;
  status: string;
  /** Opens the approver picker; the chosen users become `mentionUserIds`. */
  needsApprovers?: boolean;
  /** Asks for confirmation because it reverses a real (posted) effect. */
  confirmMessage?: string;
  destructive?: boolean;
  /** Resolves the mention fields saved with this action. */
  getFields: (approverIds?: string[]) => TTrWorkflowFields;
};

export type TTrWorkflowActions = {
  primary: TTrWorkflowAction[];
  more: TTrWorkflowAction[];
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
  TR_STATUSES.ONGOING,
  TR_STATUSES.COMPLETE,
  TR_STATUSES.PLAN,
];

const RESPONDER_STATUS_VALUES = [
  TR_STATUSES.APPROVED,
  TR_STATUSES.PROGRESS,
  TR_STATUSES.ONGOING,
  TR_STATUSES.COMPLETE,
  TR_STATUSES.REJECED,
  TR_STATUSES.RETURNED,
];

const DEFAULT_STATUS_VALUES = [
  TR_STATUSES.DRAFT,
  TR_STATUSES.MENTIONED,
  TR_STATUSES.PROGRESS,
  TR_STATUSES.ONGOING,
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

/**
 * Workflow actions offered for the saved transaction state. Primary actions
 * render as buttons; the rest live in the More menu. The plain Save button
 * and status select stay available for setting any status directly.
 */
export const getTrWorkflowActions = (
  params: TWorkflowParams,
): TTrWorkflowActions => {
  const { currentUserId, mentionOwnerId, status } = params;
  const mentionUserIds = unique(params.mentionUserIds);

  const keep = (nextStatus: string) => () => ({
    status: nextStatus,
    mentionOwnerId,
    mentionUserIds,
  });
  const action = (
    key: string,
    nextStatus: string,
    extra: Partial<TTrWorkflowAction> = {},
  ): TTrWorkflowAction => ({
    key,
    label: key,
    status: nextStatus,
    getFields: keep(nextStatus),
    ...extra,
  });
  const askApprovers = (key: string) =>
    action(key, TR_STATUSES.MENTIONED, {
      needsApprovers: true,
      getFields: (approverIds = []) => ({
        status: TR_STATUSES.MENTIONED,
        mentionOwnerId: currentUserId,
        mentionUserIds: unique(approverIds),
      }),
    });

  const requestApproval = askApprovers('request-approval');
  const backToDraft = action('back-to-draft', TR_STATUSES.DRAFT);
  const confirm = action('confirm-transaction', TR_STATUSES.CONFIRMED);
  const complete = action('complete-transaction', TR_STATUSES.COMPLETE);
  const ongoing = action('post-as-ongoing', TR_STATUSES.ONGOING);
  const cancel = action('cancel-transaction', TR_STATUSES.CANELLED, {
    destructive: true,
  });

  if (!status) {
    return { primary: [], more: [requestApproval] };
  }

  const responder = isMentionResponder({ currentUserId, mentionUserIds });

  switch (status) {
    case TR_STATUSES.MENTIONED:
      if (responder) {
        return {
          primary: [
            action('approve-request', TR_STATUSES.APPROVED),
            action('reject', TR_STATUSES.REJECED, { destructive: true }),
          ],
          more: [
            askApprovers('approve-and-forward'),
            action('return-for-clarification', TR_STATUSES.RETURNED, {
              getFields: () => ({
                status: TR_STATUSES.RETURNED,
                ...getNextMentionFields({
                  currentUserId,
                  nextStatus: TR_STATUSES.RETURNED,
                  mentionOwnerId,
                  mentionUserIds,
                }),
              }),
            }),
          ],
        };
      }
      return {
        primary: [],
        more: isMentionOwner({ currentUserId, mentionOwnerId })
          ? [backToDraft]
          : [],
      };
    case TR_STATUSES.RETURNED:
      return {
        primary: responder
          ? [
              action('resubmit', TR_STATUSES.MENTIONED, {
                getFields: () => ({
                  status: TR_STATUSES.MENTIONED,
                  mentionOwnerId: currentUserId,
                  mentionUserIds: mentionOwnerId ? [mentionOwnerId] : [],
                }),
              }),
            ]
          : [],
        more: [backToDraft],
      };
    case TR_STATUSES.DRAFT:
    case TR_STATUSES.REJECED:
      return { primary: [requestApproval], more: [confirm, complete] };
    case TR_STATUSES.APPROVED:
    case TR_STATUSES.PLAN:
      return {
        primary: [confirm],
        more: [askApprovers('request-next-approval'), complete, backToDraft],
      };
    case TR_STATUSES.PROGRESS:
    case TR_STATUSES.ASSIGNED:
    case TR_STATUSES.CONFIRMED:
      return { primary: [complete, cancel], more: [ongoing] };
    case TR_STATUSES.ONGOING:
      return {
        primary: [complete],
        more: [
          { ...cancel, confirmMessage: 'cancel-posted-transaction-confirm' },
        ],
      };
    case TR_STATUSES.COMPLETE:
      return {
        primary: [],
        more: [action('reopen-transaction', TR_STATUSES.ONGOING)],
      };
    case TR_STATUSES.CANELLED:
      return { primary: [], more: [backToDraft] };
    default:
      return { primary: [], more: [] };
  }
};
