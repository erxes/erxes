import { ICycleDocument } from '@/cycle/types';
import { STATUS_TYPES } from '@/status/constants/types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

import { requireLogin } from 'erxes-api-shared/core-modules';
import {
  getCycleProgressByMember,
  getCycleProgressByProject,
  getCycleProgressChart,
  getCyclesProgress,
} from '~/modules/cycle/utils';

export const cycleQueries = {
  getCycle: async (_parent: undefined, { _id }, { models }: IContext) => {
    const cycle = await models.Cycle.getCycle(_id);
    return cycle;
  },
  getCycles: async (_parent: undefined, params, { models }: IContext) => {
    const { list, totalCount, pageInfo } = await cursorPaginate<ICycleDocument>(
      {
        model: models.Cycle,
        params: {
          ...params,
          orderBy: { isActive: -1, isCompleted: 1, startDate: 1 },
        },
        query: { teamId: params.teamId, isCompleted: false },
      },
    );

    return { list, totalCount, pageInfo };
  },

  getCyclesActive: async (_parent: undefined, params, { models }: IContext) => {
    if (params.taskId) {
      const task = await models.Task.findOne({
        _id: params.taskId,
        statusType: STATUS_TYPES.COMPLETED,
        cycleId: { $ne: null },
      });

      params.cycleId = task?.cycleId;
    }

    const { list, totalCount, pageInfo } = await cursorPaginate<ICycleDocument>(
      {
        model: models.Cycle,
        params: {
          ...params,
          orderBy: {
            isActive: -1,
            isCompleted: 1,
            startDate: 1,
          },
        },

        query: {
          teamId: params.teamId,
          isCompleted: { $ne: true },
          $or: [
            { isActive: true },
            { _id: params?.cycleId || null },
            {
              startDate: { $lte: new Date() },
            },
          ],
        },
      },
    );

    return { list, totalCount, pageInfo };
  },
  getCycleProgress: async (
    _parent: undefined,
    { _id, assigneeId },
    { models }: IContext,
  ) => {
    return getCyclesProgress(_id, assigneeId, models);
  },

  getCycleProgressChart: async (
    _parent: undefined,
    { _id, assigneeId },
    { models }: IContext,
  ) => {
    return getCycleProgressChart(_id, assigneeId, models);
  },

  getCycleProgressByMember: async (
    _parent: undefined,
    { _id, assigneeId },
    { models }: IContext,
  ) => {
    return getCycleProgressByMember(_id, assigneeId, models);
  },

  getCycleProgressByProject: async (
    _parent: undefined,
    { _id, assigneeId },
    { models }: IContext,
  ) => {
    return getCycleProgressByProject(_id, assigneeId, models);
  },
};

requireLogin(cycleQueries, 'getCycle');
requireLogin(cycleQueries, 'getCycles');
requireLogin(cycleQueries, 'getCyclesActive');
requireLogin(cycleQueries, 'getCycleProgress');
requireLogin(cycleQueries, 'getCycleProgressChart');
requireLogin(cycleQueries, 'getCycleProgressByMember');
requireLogin(cycleQueries, 'getCycleProgressByProject');
