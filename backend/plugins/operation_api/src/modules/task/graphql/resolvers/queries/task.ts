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
      if (filter.assigneeId === 'no-assignee') {
        filterQuery.assigneeId = { $exists: false };
      } else {
        filterQuery.assigneeId = filter.assigneeId;
      }
    }

    if (filter.cycleId) {
      filterQuery.cycleId = filter.cycleId;
    }

    if (filter.cycleFilter && filter.teamId) {
      const now = new Date();
      
      switch (filter.cycleFilter) {
        case 'noCycle':
          filterQuery.cycleId = null;
          break;
          
        case 'anyPastCycle': {
          const pastCycles = await models.Cycle.find({
            teamId: filter.teamId,
            endDate: { $lt: now },
          }).distinct('_id');
          filterQuery.cycleId = { $in: pastCycles };
          break;
        }
        
        case 'previousCycle': {
          const previousCycle = await models.Cycle.findOne({
            teamId: filter.teamId,
            endDate: { $lt: now },
          }).sort({ endDate: -1 });
          if (previousCycle) {
            filterQuery.cycleId = previousCycle._id;
          } else {
            // No previous cycle, return empty results
            filterQuery.cycleId = 'no-previous-cycle';
          }
          break;
        }
        
        case 'currentCycle': {
          const currentCycle = await models.Cycle.findOne({
            teamId: filter.teamId,
            startDate: { $lte: now },
            endDate: { $gte: now },
          });
          if (currentCycle) {
            filterQuery.cycleId = currentCycle._id;
          } else {
            // No current cycle, return empty results
            filterQuery.cycleId = 'no-current-cycle';
          }
          break;
        }
        
        case 'upcomingCycle': {
          const upcomingCycle = await models.Cycle.findOne({
            teamId: filter.teamId,
            startDate: { $gt: now },
          }).sort({ startDate: 1 });
          if (upcomingCycle) {
            filterQuery.cycleId = upcomingCycle._id;
          } else {
            // No upcoming cycle, return empty results
            filterQuery.cycleId = 'no-upcoming-cycle';
          }
          break;
        }
        
        case 'anyFutureCycle': {
          const futureCycles = await models.Cycle.find({
            teamId: filter.teamId,
            startDate: { $gt: now },
          }).distinct('_id');
          filterQuery.cycleId = { $in: futureCycles };
          break;
        }
      }
    }

    if (filter.projectId) {
      filterQuery.projectId = filter.projectId;
    }

    if (filter.milestoneId) {
      filterQuery.milestoneId = filter.milestoneId;
    }

    if (filter.estimatePoint) {
      filterQuery.estimatePoint = filter.estimatePoint;
    }

    if (filter.tagIds && filter.tagIds.length > 0) {
      filterQuery.tagIds = { $in: filter.tagIds };
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
