import { ITicketDocument } from '@/ticket/@types/ticket';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';

export interface IVisibilityPipeline {
  isCheckUser?: boolean;
  isCheckDepartment?: boolean;
  isCheckBranch?: boolean;
  isCheckDate?: boolean;
  excludeCheckUserIds?: string[];
  departmentIds?: string[];
}

type TVisibilityUser = Pick<
  IUserDocument,
  '_id' | 'role' | 'isOwner' | 'departmentIds' | 'branchIds'
>;

const startOfToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
};

export const canSeeAllPipelineTickets = (
  pipeline: IVisibilityPipeline,
  user: TVisibilityUser,
): boolean =>
  user.role === 'system' ||
  !!user.isOwner ||
  (pipeline.excludeCheckUserIds || []).includes(user._id);

export const isPipelineRestricted = (pipeline: IVisibilityPipeline): boolean =>
  !!(pipeline.isCheckUser || pipeline.isCheckDepartment || pipeline.isCheckBranch);

export const buildVisibilityCondition = (
  pipeline: IVisibilityPipeline,
  user: TVisibilityUser | undefined,
  supervisedDepartmentIds: string[] = [],
): FilterQuery<ITicketDocument> | null => {
  const userId = user?._id;

  if (!user || !userId) {
    return null;
  }

  const conditions: FilterQuery<ITicketDocument>[] = [];

  if (
    isPipelineRestricted(pipeline) &&
    !canSeeAllPipelineTickets(pipeline, user)
  ) {
    const orClauses: FilterQuery<ITicketDocument>[] = [
      { createdBy: userId },
      { assigneeId: userId },
    ];

    if (pipeline.isCheckUser) {
      orClauses.push(
        { subscribedUserIds: userId },
        {
          assigneeId: { $in: [null, ''] },
          'subscribedUserIds.0': { $exists: false },
        },
      );
    }

    const userDepartmentIds = user.departmentIds || [];

    if (pipeline.isCheckDepartment && userDepartmentIds.length) {
      orClauses.push({ departmentId: { $in: userDepartmentIds } });

      const supervisedOnPipeline = supervisedDepartmentIds.filter((id) =>
        (pipeline.departmentIds || []).includes(id),
      );

      if (supervisedOnPipeline.length) {
        orClauses.push({ departmentId: { $in: supervisedOnPipeline } });
      }
    }

    const userBranchIds = user.branchIds || [];

    if (pipeline.isCheckBranch && userBranchIds.length) {
      orClauses.push({ branchId: { $in: userBranchIds } });
    }

    conditions.push({ $or: orClauses });
  }

  if (pipeline.isCheckDate) {
    conditions.push({ createdAt: { $gte: startOfToday() } });
  }

  if (!conditions.length) {
    return null;
  }

  return conditions.length === 1 ? conditions[0] : { $and: conditions };
};

export const getSupervisedDepartmentIds = async (
  subdomain: string,
  userId: string,
): Promise<string[]> => {
  const departments: { _id: string }[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'departments',
    action: 'findWithChild',
    input: { query: { supervisorId: userId }, fields: { _id: 1 } },
    defaultValue: [],
  });

  return (departments || []).map(({ _id }) => _id);
};
