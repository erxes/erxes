import { currentUserState } from 'ui-modules';
import { useAtomValue } from 'jotai';
import type { IPipeline } from '@/pipelines/types';

export interface IStatusPermissions {
  value: string;
  memberIds?: string[];
  canMoveMemberIds?: string[];
  canEditMemberIds?: string[];
  departmentIds?: string[];
  visibilityType?: string;
}

export interface ITicketPermissions {
  canViewPipeline: boolean;
  canViewTicket: boolean;
  canCreateTicket: boolean;
  canEditTicket: boolean;
  canDeleteTicket: boolean;
  canMoveTicket: boolean;
}

interface UseTicketPermissionsParams {
  pipeline?: IPipeline;
  status?: IStatusPermissions;
  assigneeId?: string;
}

const resolveStatusPermissions = (
  status: IStatusPermissions,
  userId: string,
): Pick<
  ITicketPermissions,
  'canViewTicket' | 'canEditTicket' | 'canMoveTicket'
> => {
  if (
    status.visibilityType === 'private' &&
    !(status.memberIds || []).includes(userId)
  ) {
    return { canViewTicket: false, canEditTicket: false, canMoveTicket: false };
  }

  const canEditTicket = status.canEditMemberIds?.length
    ? status.canEditMemberIds.includes(userId)
    : true;

  const canMoveTicket = status.canMoveMemberIds?.length
    ? status.canMoveMemberIds.includes(userId)
    : true;

  return { canViewTicket: true, canEditTicket, canMoveTicket };
};

const DENIED: ITicketPermissions = {
  canViewPipeline: false,
  canViewTicket: false,
  canCreateTicket: false,
  canEditTicket: false,
  canDeleteTicket: false,
  canMoveTicket: false,
};

export const useTicketPermissions = ({
  pipeline,
  status,
  assigneeId,
}: UseTicketPermissionsParams): ITicketPermissions => {
  const currentUser = useAtomValue(currentUserState);

  if (!currentUser?._id || !pipeline) {
    return DENIED;
  }

  const userId = currentUser._id;
  const isPipelineOwner = pipeline.userId === userId;
  const isAssignedUser = !!assigneeId && assigneeId === userId;

  let canViewPipeline = true;

  if (pipeline.visibility === 'private') {
    canViewPipeline =
      isPipelineOwner ||
      isAssignedUser ||
      (pipeline.memberIds || []).includes(userId);
  }

  if (!canViewPipeline) {
    return DENIED;
  }

  const canCreateTicket = true;
  const canDeleteTicket = isPipelineOwner;

  const { canViewTicket, canEditTicket, canMoveTicket } = status
    ? resolveStatusPermissions(status, userId)
    : { canViewTicket: true, canEditTicket: true, canMoveTicket: true };

  return {
    canViewPipeline,
    canViewTicket,
    canCreateTicket,
    canEditTicket,
    canDeleteTicket,
    canMoveTicket,
  };
};
