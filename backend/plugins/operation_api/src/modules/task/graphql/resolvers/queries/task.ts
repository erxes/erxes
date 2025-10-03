import { ITaskDocument, ITaskFilter } from '@/task/@types/task';
import { requireLogin } from 'erxes-api-shared/core-modules';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

export const taskQueries = {
  getTask: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Task.getTask(_id);
  },

  getTasks: async (
    _parent: undefined,
    { filter }: { filter: ITaskFilter },
    { models }: IContext,
  ) => {
    const filterQuery: FilterQuery<ITaskDocument> = {};

    if (filter.name) {
      filterQuery.name = { $regex: filter.name, $options: 'i' };
    }

    if (filter.status) {
      filterQuery.status = filter.status;
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

    if (filter.teamId) {
      filterQuery.teamId = filter.teamId;
    }

    if (filter.createdBy) {
      filterQuery.createdBy = filter.createdBy;
    }

    if (filter.assigneeId) {
      filterQuery.assigneeId = filter.assigneeId;
    }

    if (filter.cycleId) {
      filterQuery.cycleId = filter.cycleId;
    }

    if (filter.projectId) {
      filterQuery.projectId = filter.projectId;
    }

    if (filter.estimatePoint) {
      filterQuery.estimatePoint = filter.estimatePoint;
    }

    if (filter.teamId && filter.projectId) {
      delete filterQuery.teamId;
    }

    if (
      filter.userId &&
      !filter.teamId &&
      !filter.assigneeId &&
      !filter.projectId
    ) {
      filterQuery.assigneeId = filter.userId;
    }

    const { list, totalCount, pageInfo } = await cursorPaginate<ITaskDocument>({
      model: models.Task,
      params: {
        ...filter,
        orderBy: {
          statusType: 'asc',
          createdAt: 'asc',
        },
      },
      query: filterQuery,
    });

    return { list, totalCount, pageInfo };
  },
};

requireLogin(taskQueries, 'getTask');
requireLogin(taskQueries, 'getTasks');
