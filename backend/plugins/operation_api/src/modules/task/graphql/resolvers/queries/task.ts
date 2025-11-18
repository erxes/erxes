import { ITaskDocument, ITaskFilter } from '@/task/@types/task';
import { requireLogin } from 'erxes-api-shared/core-modules';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { STATUS_TYPES } from '@/status/constants/types';

const handleDateFilter = (
  filterQuery: FilterQuery<ITaskDocument>,
  fieldName: string,
  value: string | Date,
) => {
  if (value === 'no-date') {
    filterQuery[fieldName] = { $exists: false };
    return;
  }

  if (value === 'in-past') {
    filterQuery[fieldName] = { $lt: new Date() };
    return;
  }

  const stringValue = value instanceof Date ? value.toISOString() : value;

  filterQuery[fieldName] = { $lte: new Date(stringValue) };
};

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
      handleDateFilter(filterQuery, 'startDate', filter.startDate);
    }

    if (filter.targetDate) {
      handleDateFilter(filterQuery, 'targetDate', filter.targetDate);
    }

    if (filter.createdDate) {
      handleDateFilter(filterQuery, 'createdAt', filter.createdDate);
    }

    if (filter.updatedDate) {
      handleDateFilter(filterQuery, 'updatedAt', filter.updatedDate);
    }

    if (filter.completedDate) {
      filterQuery.statusType = STATUS_TYPES.COMPLETED;
      handleDateFilter(filterQuery, 'statusChangedDate', filter.completedDate);
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
      if (filter.projectId === 'no-project') {
        filterQuery.projectId = { $exists: false };
      } else {
        filterQuery.projectId = filter.projectId;
      }
    }

    if (
      filter.projectStatus ||
      filter.projectPriority ||
      filter.projectLeadId ||
      filter.projectMilestoneName
    ) {
      let projectIds: string[] = [];

      if (filter.projectMilestoneName) {
        const matchingMilestones = await models.Milestone.find({
          name: { $regex: filter.projectMilestoneName, $options: 'i' },
        }).distinct('projectId');

        if (matchingMilestones.length === 0) {
          return { list: [], totalCount: 0, pageInfo: null };
        }

        projectIds = matchingMilestones;
      }

      if (
        filter.projectStatus ||
        filter.projectPriority ||
        filter.projectLeadId
      ) {
        const projectFilter: FilterQuery<any> = {};

        if (filter.projectStatus) {
          projectFilter.status = filter.projectStatus;
        }

        if (filter.projectPriority) {
          projectFilter.priority = filter.projectPriority;
        }

        if (filter.projectLeadId) {
          projectFilter.leadId = filter.projectLeadId;
        }

        if (projectIds.length > 0) {
          projectFilter._id = { $in: projectIds };
        }

        const matchingProjects = await models.Project.find(
          projectFilter,
        ).distinct('_id');

        if (matchingProjects.length === 0) {
          return { list: [], totalCount: 0, pageInfo: null };
        }

        projectIds = matchingProjects;
      }

      if (projectIds.length > 0) {
        if (filterQuery.projectId) {
          if (!projectIds.includes(filterQuery.projectId as string)) {
            return { list: [], totalCount: 0, pageInfo: null };
          }
        } else {
          filterQuery.projectId = { $in: projectIds };
        }
      }
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

    if (
      filter.teamId &&
      filter.projectId &&
      filter.projectId !== 'no-project'
    ) {
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
