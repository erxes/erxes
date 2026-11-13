import { buildTaskDateRangeQuery } from '@/task/utils/dateFilters';
import { IProjectDocument } from '@/project/@types/project';
import { ITaskDocument, ITaskFilter } from '@/task/@types/task';
import { ICycleDocument } from '@/cycle/types';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { taskCursorPaginateByStatus } from '@/task/graphql/resolvers/utils';

export const taskQueries = {
  getTask: async (
    _parent: undefined,
    { _id },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('taskRead');

    return models.Task.getTask(_id);
  },

  getTasks: async (
    _parent: undefined,
    { filter = {} }: { filter?: Partial<ITaskFilter> },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('taskRead');

    const filterQuery: FilterQuery<ITaskDocument> = {};

    if (filter._id) {
      filterQuery._id = filter._id;
    }

    if (filter.name) {
      filterQuery.name = { $regex: escapeRegExp(filter.name), $options: 'i' };
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

    Object.assign(filterQuery, buildTaskDateRangeQuery(filter));

    if (filter.teamId) {
      filterQuery.teamId = filter.teamId;
    }

    if (filter.createdBy) {
      filterQuery.createdBy = filter.createdBy;
    }

    if (filter.assigneeId) {
      if (filter.assigneeId === 'no-assignee') {
        filterQuery.assigneeId = null;
      } else {
        filterQuery.assigneeId = filter.assigneeId;
      }
    }

    if (filter.cycleId) {
      filterQuery.cycleId = filter.cycleId;
    }

    if (filter.cycleFilter === 'noCycle') {
      filterQuery.cycleId = null;
    } else if (filter.cycleFilter) {
      const now = new Date();
      const cycleQuery: FilterQuery<ICycleDocument> = {};

      if (filter.teamId) {
        cycleQuery.teamId = filter.teamId;
      }

      switch (filter.cycleFilter) {
        case 'anyPastCycle':
        case 'previousCycle':
          cycleQuery.endDate = { $lt: now };
          break;
        case 'currentCycle':
          cycleQuery.startDate = { $lte: now };
          cycleQuery.endDate = { $gte: now };
          break;
        case 'upcomingCycle':
        case 'anyFutureCycle':
          cycleQuery.startDate = { $gt: now };
          break;
      }

      const matchingCycles = models.Cycle.find(cycleQuery);

      if (
        filter.cycleFilter === 'previousCycle' ||
        filter.cycleFilter === 'upcomingCycle'
      ) {
        matchingCycles.cast();
        const cycles = await models.Cycle.aggregate<{
          cycleId: ICycleDocument['_id'];
        }>([
          { $match: matchingCycles.getFilter() },
          {
            $sort:
              filter.cycleFilter === 'previousCycle'
                ? { endDate: -1 }
                : { startDate: 1 },
          },
          { $group: { _id: '$teamId', cycleId: { $first: '$_id' } } },
        ]);
        filterQuery.cycleId = { $in: cycles.map((cycle) => cycle.cycleId) };
      } else {
        filterQuery.cycleId = { $in: await matchingCycles.distinct('_id') };
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
          name: {
            $regex: escapeRegExp(filter.projectMilestoneName),
            $options: 'i',
          },
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
        const projectFilter: FilterQuery<IProjectDocument> = {};

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

        const matchingProjects =
          await models.Project.find(projectFilter).distinct('_id');

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

    // The tasks of these customers / companies.
    if (filter.customerId) {
      filterQuery.customerId = filter.customerId;
    }

    if (filter.companyId) {
      filterQuery.companyId = filter.companyId;
    }

    if (filter.labelIds && filter.labelIds.length > 0) {
      filterQuery.labelIds = { $in: filter.labelIds };
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

    const pagination = filter.orderBy
      ? await cursorPaginate<ITaskDocument>({
          model: models.Task,
          params: filter,
          query: filterQuery,
        })
      : await taskCursorPaginateByStatus({
          models,
          params: filter,
          query: filterQuery,
        });

    return pagination;
  },
};
