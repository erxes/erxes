import { ITicketDocument } from '@/ticket/@types/ticket';
import { FilterQuery } from 'mongoose';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { createPermissionValidator } from '@/ticket/utils/permissionValidator';
import { buildPropertyFilter } from 'erxes-api-shared/core-modules';
import {
  IVisibilityPipeline,
  buildVisibilityCondition,
  canSeeAllPipelineTickets,
  getSupervisedDepartmentIds,
  isPipelineRestricted,
} from '@/ticket/utils/ticketVisibility';

const isPipelineHidden = (pipeline: any, userId?: string) =>
  pipeline.visibility === 'private' &&
  !(!!userId && (pipeline.memberIds || []).includes(userId));

export const generateFilter = async (
  filter: any,
  user: IUserDocument | undefined,
  models: IModels,
  subdomain?: string,
  skipPipelineVisibility = false,
) => {
  filter = filter ?? {};

  const {
    segmentIds,
    createdStartDate,
    createdEndDate,
    startDateStartDate,
    startDateEndDate,
    targetDateStartDate,
    targetDateEndDate,
    statusChangedStartDate,
    statusChangedEndDate,
  } = filter;
  const filterQuery: FilterQuery<ITicketDocument> = {};

  const andConditions: FilterQuery<ITicketDocument>[] = [];

  let ownershipOrCondition: FilterQuery<ITicketDocument>['$or'] | null = null;

  const userId = user?._id;

  let supervisedDepartmentIds: string[] | undefined;

  const visibilityFor = async (pipeline: IVisibilityPipeline) => {
    if (
      subdomain &&
      user &&
      supervisedDepartmentIds === undefined &&
      pipeline.isCheckDepartment &&
      isPipelineRestricted(pipeline) &&
      !canSeeAllPipelineTickets(pipeline, user)
    ) {
      supervisedDepartmentIds = await getSupervisedDepartmentIds(
        subdomain,
        user._id,
      );
    }

    return buildVisibilityCondition(
      pipeline,
      user,
      supervisedDepartmentIds || [],
    );
  };

  if (filter.pipelineId && !skipPipelineVisibility) {
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

    const visibilityCondition = await visibilityFor(pipeline);

    if (visibilityCondition) {
      andConditions.push(visibilityCondition);
    }
  } else if (!skipPipelineVisibility) {
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

      const visibilityCondition = await visibilityFor(pipeline);

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

  if (segmentIds?.length) {
    filterQuery.segmentIds = { $in: segmentIds };
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

  if (createdStartDate || createdEndDate) {
    filterQuery.createdAt = {
      ...(createdStartDate && { $gte: new Date(createdStartDate) }),
      ...(createdEndDate && { $lte: new Date(createdEndDate) }),
    };
  }

  if (startDateStartDate || startDateEndDate) {
    filterQuery.startDate = {
      ...(startDateStartDate && { $gte: new Date(startDateStartDate) }),
      ...(startDateEndDate && { $lte: new Date(startDateEndDate) }),
    };
  }

  if (targetDateStartDate || targetDateEndDate) {
    filterQuery.targetDate = {
      ...(targetDateStartDate && { $gte: new Date(targetDateStartDate) }),
      ...(targetDateEndDate && { $lte: new Date(targetDateEndDate) }),
    };
  }

  if (statusChangedStartDate || statusChangedEndDate) {
    filterQuery.statusChangedDate = {
      ...(statusChangedStartDate && { $gte: new Date(statusChangedStartDate) }),
      ...(statusChangedEndDate && { $lte: new Date(statusChangedEndDate) }),
    };
  }

  if (filter.assigneeId) {
    filterQuery.assigneeId = filter.assigneeId;
  }

  if (filter.branchIds?.length) {
    filterQuery.branchId = { $in: filter.branchIds };
  }

  if (filter.departmentIds?.length) {
    filterQuery.departmentId = { $in: filter.departmentIds };
  }

  if (filter.propertiesData) {
    andConditions.push(...buildPropertyFilter(filter.propertiesData));
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
