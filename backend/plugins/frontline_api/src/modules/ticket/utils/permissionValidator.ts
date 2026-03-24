import { IModels } from '~/connectionResolvers';
import { IUserDocument } from 'erxes-api-shared/core-types';

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

export interface ITicketPermissions {
  canViewPipeline: boolean;
  canViewTicket: boolean;
  canCreateTicket: boolean;
  canEditTicket: boolean;
  canDeleteTicket: boolean;
  canMoveTicket: boolean;
}

const resolveStatusPermissions = (
  status: {
    visibilityType?: string;
    memberIds?: string[];
    canEditMemberIds?: string[];
    canMoveMemberIds?: string[];
  },
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

export class PermissionValidator {
  constructor(private models: IModels) {}

  async validatePipelineAccess(
    pipelineId: string,
    user: IUserDocument,
  ): Promise<void> {
    if (!pipelineId?.trim()) {
      throw new PermissionError('Pipeline ID is required');
    }

    if (!user?._id) {
      throw new PermissionError('Authentication required');
    }

    const pipeline = await this.models.Pipeline.findOne({ _id: pipelineId });

    if (!pipeline) {
      throw new PermissionError('Pipeline not found');
    }

    if (pipeline.userId === user._id) {
      return;
    }

    if (pipeline.visibility === 'private') {
      const isMember = (pipeline.memberIds || []).includes(user._id);
      if (!isMember) {
        throw new PermissionError(
          'Access denied: You do not have permission to access this pipeline',
        );
      }
    }

    if (pipeline.isCheckDepartment && pipeline.departmentIds?.length) {
      const userDeptIds = user.departmentIds || [];
      const hasAccess = pipeline.departmentIds.some((id) =>
        userDeptIds.includes(id),
      );
      if (!hasAccess) {
        throw new PermissionError(
          'Access denied: You do not belong to the required department for this pipeline',
        );
      }
    }

    if (pipeline.isCheckBranch && pipeline.branchIds?.length) {
      const userBranchIds = user.branchIds || [];
      const hasAccess = pipeline.branchIds.some((id) =>
        userBranchIds.includes(id),
      );
      if (!hasAccess) {
        throw new PermissionError(
          'Access denied: You do not belong to the required branch for this pipeline',
        );
      }
    }
  }

  async getTicketPermissions(
    pipelineId: string,
    statusId: string | undefined,
    user: IUserDocument,
  ): Promise<ITicketPermissions> {
    const permissions: ITicketPermissions = {
      canViewPipeline: false,
      canViewTicket: false,
      canCreateTicket: false,
      canEditTicket: false,
      canDeleteTicket: false,
      canMoveTicket: false,
    };

    try {
      await this.validatePipelineAccess(pipelineId, user);
      permissions.canViewPipeline = true;
    } catch {
      return permissions;
    }

    const pipeline = await this.models.Pipeline.findOne({ _id: pipelineId });
    const isPipelineOwner = pipeline?.userId === user._id;

    permissions.canViewTicket = true;
    permissions.canCreateTicket = true;
    permissions.canDeleteTicket = isPipelineOwner;

    if (statusId) {
      const status = await this.models.Status.findOne({ _id: statusId });

      if (status) {
        const resolved = resolveStatusPermissions(status, user._id);
        permissions.canViewTicket = resolved.canViewTicket;
        permissions.canEditTicket = resolved.canEditTicket;
        permissions.canMoveTicket = resolved.canMoveTicket;
      }
    } else {
      permissions.canEditTicket = true;
      permissions.canMoveTicket = true;
    }

    return permissions;
  }

  async validateEditPermission(
    statusId: string,
    newStatusId: string,
    userId: string,
  ): Promise<void> {
    try {
      if (!statusId?.trim()) {
        throw new Error('Status ID is required');
      }

      if (!userId?.trim()) {
        throw new Error('User ID is required');
      }

      const isStatusChanged = newStatusId && newStatusId !== statusId;

      const status = await this.models.Status.getStatus(statusId);

      if (
        status?.canEditMemberIds?.length &&
        !status.canEditMemberIds.includes(userId)
      ) {
        throw new PermissionError(
          'You do not have permission to edit tickets in this status',
        );
      }

      if (isStatusChanged) {
        const newStatus = await this.models.Status.getStatus(newStatusId);

        if (
          newStatus?.canMoveMemberIds?.length &&
          !newStatus.canMoveMemberIds.includes(userId)
        ) {
          throw new PermissionError(
            'You do not have permission to move tickets to this status',
          );
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to validate edit permission');
    }
  }

  async validateMovePermission(
    statusId: string,
    user?: IUserDocument,
  ): Promise<void> {
    try {
      if (!statusId?.trim()) {
        return;
      }

      const status = await this.models.Status.findOne({ _id: statusId });

      if (!status) {
        throw new Error('Status not found');
      }

      if (!user?._id) {
        throw new PermissionError('Authentication required');
      }

      if (
        status.canMoveMemberIds?.length &&
        !status.canMoveMemberIds.includes(user._id)
      ) {
        throw new PermissionError(
          'You do not have permission to move tickets to this status',
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to validate move permission');
    }
  }

  async validateVisibilityAccess(
    statusId: string,
    user?: IUserDocument,
  ): Promise<boolean> {
    try {
      if (!statusId?.trim()) {
        return false;
      }

      const status = await this.models.Status.getStatus(statusId);

      if (!status) {
        return false;
      }

      return (
        status.visibilityType !== 'private' ||
        (status.memberIds || []).includes(user?._id || '')
      );
    } catch {
      return false;
    }
  }
}

export const createPermissionValidator = (models: IModels) => {
  return new PermissionValidator(models);
};
