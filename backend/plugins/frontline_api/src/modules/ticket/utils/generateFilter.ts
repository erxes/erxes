import { ITicketDocument } from '@/ticket/@types/ticket';
import { FilterQuery } from 'mongoose';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { createPermissionValidator } from '@/ticket/utils/permissionValidator';

const startOfToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
};

const isPipelineHidden = (pipeline: any, userId?: string) =>
  pipeline.visibility === 'private' &&
  !(!!userId && (pipeline.memberIds || []).includes(userId));

const buildVisibilityCondition = (
  pipeline: any,
  user: IUserDocument | undefined,
): FilterQuery<ITicketDocument> | null => {
  const userId = user?._id;

  if (!userId) {
    return null;
  }

  const conditions: FilterQuery<ITicketDocument>[] = [];

  if (
    pipeline.isCheckUser &&
    !(pipeline.excludeCheckUserIds || []).includes(userId)
  ) {
    conditions.push({ $or: [{ assigneeId: userId }, { createdBy: userId }] });
  }

  if (pipeline.isCheckBranch) {
    conditions.push({ branchId: { $in: user?.branchIds || [] } });
  }

  if (pipeline.isCheckDepartment) {
    conditions.push({ departmentId: { $in: user?.departmentIds || [] } });
  }

  if (pipeline.isCheckDate) {
    conditions.push({ createdAt: { $gte: startOfToday() } });
  }

  if (!conditions.length) {
    return null;
  }

  return conditions.length === 1 ? conditions[0] : { $and: conditions };
};

export const generateFilter = async (
  filter: any,
  user: IUserDocument | undefined,
  models: IModels,
) => {
  const filterQuery: FilterQuery<ITicketDocument> = {};

  const andConditions: FilterQuery<ITicketDocument>[] = [];

  let ownershipOrCondition: FilterQuery<ITicketDocument>['$or'] | null = null;

  const userId = user?._id;

  if (filter.pipelineId) {
    const pipeline = await models.Pipeline.findOne({
      _id: filter.pipelineId,
    });

    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    if (isPipelineHidden(pipeline, userId)) {
      throw new Error(
        'Access denied: You do not have access to this private pipeline',
      );
    }

    if (pipeline.isCheckDepartment && pipeline.departmentIds?.length) {
      const userDeptIds = user?.departmentIds || [];
      const hasAccess = pipeline.departmentIds.some((id) =>
        userDeptIds.includes(id),
      );
      if (!hasAccess) {
        throw new Error(
          'Access denied: You do not belong to the required department for this pipeline',
        );
      }
    }

    if (pipeline.isCheckBranch && pipeline.branchIds?.length) {
      const userBranchIds = user?.branchIds || [];
      const hasAccess = pipeline.branchIds.some((id) =>
        userBranchIds.includes(id),
      );
      if (!hasAccess) {
        throw new Error(
          'Access denied: You do not belong to the required branch for this pipeline',
        );
      }
    }

    const visibilityCondition = buildVisibilityCondition(pipeline, user);

    if (visibilityCondition) {
      andConditions.push(visibilityCondition);
    }
  } else {
    const pipelines = await models.Pipeline.find(
      filter.channelId ? { channelId: filter.channelId } : {},
    ).lean();

    const hiddenPipelineIds: string[] = [];
    const restrictedPipelineIds: string[] = [];
    const restrictedConditions: FilterQuery<ITicketDocument>[] = [];

    for (const pipeline of pipelines) {
      if (isPipelineHidden(pipeline, userId)) {
        hiddenPipelineIds.push(pipeline._id);
        continue;
      }

      const visibilityCondition = buildVisibilityCondition(pipeline, user);

      if (visibilityCondition) {
        restrictedPipelineIds.push(pipeline._id);
        restrictedConditions.push({
          $and: [{ pipelineId: pipeline._id }, visibilityCondition],
        });
      }
    }

    if (hiddenPipelineIds.length) {
      andConditions.push({ pipelineId: { $nin: hiddenPipelineIds } });
    }

    if (restrictedConditions.length) {
      andConditions.push({
        $or: [
          { pipelineId: { $nin: restrictedPipelineIds } },
          ...restrictedConditions,
        ],
      });
    }
  }

  if (filter.myTicketsOnly && userId) {
    ownershipOrCondition = [{ assigneeId: userId }, { createdBy: userId }];
  }

  if (filter.searchValue) {
    const regex = { $regex: escapeRegExp(filter.searchValue), $options: 'i' };

    andConditions.push({ $or: [{ name: regex }, { number: regex }] });
  }

  if (filter.status) {
    filterQuery.status = filter.status;
  }

  if (filter.statusId) {
    filterQuery.statusId = filter.statusId;
  }
  if (filter.statusType) {
    filterQuery.statusType = filter.statusType;
  }

  if (filter.priority) {
    filterQuery.priority = filter.priority;
  }

  if (filter.startDate) {
    filterQuery.startDate = { $gte: filter.startDate };
  }

  if (filter.targetDate) {
    filterQuery.targetDate = { $gte: filter.targetDate };
  }

  if (filter.createdAt) {
    filterQuery.createdAt = { $gte: filter.createdAt };
  }

  if (filter.assigneeId) {
    filterQuery.assigneeId = filter.assigneeId;
  }

  if (filter.channelId) filterQuery.channelId = filter.channelId;
  if (filter.pipelineId) filterQuery.pipelineId = filter.pipelineId;
  if (filter.userId && !filter.channelId && !filter.assigneeId) {
    filterQuery.assigneeId = filter.userId;
  }

  let stateCondition: FilterQuery<ITicketDocument> | null = null;

  switch (filter.state) {
    case 'all':
      stateCondition = { state: { $ne: 'deleted' } };
      break;
    case 'active':
    default:
      stateCondition = {
        $or: [{ state: 'active' }, { state: { $exists: false } }],
      };
      break;
    case 'archived':
      stateCondition = { state: 'archived' };
      break;
    case 'deleted':
      stateCondition = { state: 'deleted' };
      break;
  }

  if (userId) {
    const hiddenStatusIds = await createPermissionValidator(
      models,
    ).getHiddenStatusIds(userId, filter.pipelineId);

    if (hiddenStatusIds.length) {
      andConditions.push({ statusId: { $nin: hiddenStatusIds } });
    }
  }

  if (ownershipOrCondition) {
    andConditions.push({ $or: ownershipOrCondition });
  }

  if (stateCondition) {
    andConditions.push(stateCondition);
  }

  if (andConditions.length) {
    filterQuery.$and = andConditions;
  }

  return filterQuery;
};
