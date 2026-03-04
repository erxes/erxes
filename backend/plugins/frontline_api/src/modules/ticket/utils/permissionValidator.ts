import { IModels } from '~/connectionResolvers';
import { IUserDocument } from 'erxes-api-shared/core-types';

export class PermissionValidator {
  constructor(private models: IModels) {}

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

      if (isStatusChanged) {
        const newStatus = await this.models.Status.getStatus(newStatusId);

        if (
          newStatus?.canMoveMemberIds?.length &&
          !newStatus.canMoveMemberIds.includes(userId)
        ) {
          throw new Error(
            'You do not have permission to move tickets in this status',
          );
        }

        return;
      }

      const status = await this.models.Status.getStatus(statusId);

      if (
        status?.canEditMemberIds?.length &&
        !status.canEditMemberIds.includes(userId)
      ) {
        throw new Error(
          'You do not have permission to edit tickets in this status',
        );
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
        throw new Error('User not found');
      }

      if (!status.canMoveMemberIds?.includes(user._id)) {
        throw new Error(
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
