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

  let canViewTicket = true;
  const canCreateTicket = true;
  const canDeleteTicket = isPipelineOwner;

  let canEditTicket = true;
  let canMoveTicket = true;

  if (status) {
    if (status.visibilityType === 'private') {
      const canViewStatus = (status.memberIds || []).includes(userId);
      if (!canViewStatus) {
        canViewTicket = false;
        canEditTicket = false;
        canMoveTicket = false;
      }
    }

    if (canViewTicket && status.canEditMemberIds?.length) {
      canEditTicket = status.canEditMemberIds.includes(userId);
    }

    if (canViewTicket && status.canMoveMemberIds?.length) {
      canMoveTicket = status.canMoveMemberIds.includes(userId);
    }
  }

  return {
    canViewPipeline,
    canViewTicket,
    canCreateTicket,
    canEditTicket,
    canDeleteTicket,
    canMoveTicket,
  };
};
