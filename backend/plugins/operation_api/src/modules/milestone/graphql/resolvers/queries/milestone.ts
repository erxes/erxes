import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery, Types } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import {
  IMilestoneDocument,
  IMilestoneParams,
} from '~/modules/milestone/types';
import { STATUS_TYPES } from '~/modules/status/constants/types';

export const milestoneQueries = {
  getMilestone: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Milestone.getMilestone(_id);
  },
  milestones: async (
    _root: undefined,
    params: IMilestoneParams,
    { models }: IContext,
  ) => {

    const {projectId, searchValue} = params; 

    const filter: FilterQuery<IMilestoneParams> = {
      projectId: projectId,
    }

    if(searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i')
    }

    const { list, totalCount, pageInfo } =
      await cursorPaginate<IMilestoneDocument>({
        model: models.Milestone,
        params: {
          ...params,
          orderBy: { isActive: -1, isCompleted: 1, startDate: 1 },
        },
        query: filter,
      });

    return { list, totalCount, pageInfo };
  },

  milestoneProgress: async (
    _root: undefined,
    { projectId }: { projectId: string },
    { models }: IContext,
  ) => {
    await models.Project.getProject(projectId);

    return models.Milestone.aggregate([
      { $match: { projectId: new Types.ObjectId(projectId) } },
      {
        $lookup: {
          from: 'operation_tasks',
          localField: '_id',
          foreignField: 'milestoneId',
          as: 'tasks',
        },
      },
      {
        $addFields: {
          totalScope: {
            $sum: {
              $map: {
                input: '$tasks',
                as: 't',
                in: { $ifNull: ['$$t.estimatePoint', 1] },
              },
            },
          },
          totalStartedScope: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$tasks',
                    as: 't',
                    cond: { $eq: ['$$t.statusType', STATUS_TYPES.STARTED] },
                  },
                },
                as: 't',
                in: { $ifNull: ['$$t.estimatePoint', 1] },
              },
            },
          },
          totalCompletedScope: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$tasks',
                    as: 't',
                    cond: { $eq: ['$$t.statusType', STATUS_TYPES.COMPLETED] },
                  },
                },
                as: 't',
                in: { $ifNull: ['$$t.estimatePoint', 1] },
              },
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          targetDate: 1,
          totalScope: 1,
          totalStartedScope: 1,
          totalCompletedScope: 1,
        },
      },
    ]);
  },
};
