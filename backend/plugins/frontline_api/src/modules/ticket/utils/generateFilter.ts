import { ITicketDocument } from '@/ticket/@types/ticket';
import { FilterQuery } from 'mongoose';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

export const generateFilter = async (
  filter: any,
  user: IUserDocument,
  models: IModels,
) => {
  const filterQuery: FilterQuery<ITicketDocument> = {};

  let ownershipOrCondition: FilterQuery<ITicketDocument>['$or'] | null = null;

  if (filter.pipelineId) {
    const pipeline = await models.Pipeline.findOne({
      _id: filter.pipelineId,
    });

    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    if (pipeline.visibility === 'private') {
      const isMember = (pipeline.memberIds || []).includes(user._id);
      if (!isMember) {
        throw new Error(
          'Access denied: You do not have access to this private pipeline',
        );
      }
    }

    if (pipeline.isCheckDepartment && pipeline.departmentIds?.length) {
      const userDeptIds = user.departmentIds || [];
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
      const userBranchIds = user.branchIds || [];
      const hasAccess = pipeline.branchIds.some((id) =>
        userBranchIds.includes(id),
      );
      if (!hasAccess) {
        throw new Error(
          'Access denied: You do not belong to the required branch for this pipeline',
        );
      }
    }

    if (
      pipeline.isCheckUser &&
      (pipeline.excludeCheckUserIds || []).includes(user._id)
    ) {
      ownershipOrCondition = [
        { assigneeId: user._id },
        { createdBy: user._id },
      ];
    }
  }

  if (filter.myTicketsOnly) {
    ownershipOrCondition = [
      { assigneeId: user._id },
      { createdBy: user._id },
    ];
  }

  if (filter.name) {
    filterQuery.name = { $regex: filter.name, $options: 'i' };
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

  if (ownershipOrCondition && stateCondition) {
    filterQuery.$and = [{ $or: ownershipOrCondition }, stateCondition];
  } else if (ownershipOrCondition) {
    filterQuery.$or = ownershipOrCondition;
  } else if (stateCondition) {
    Object.assign(filterQuery, stateCondition);
  }

  return filterQuery;
};
