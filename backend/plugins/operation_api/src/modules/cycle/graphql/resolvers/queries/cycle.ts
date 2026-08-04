import { ICycleDocument } from '@/cycle/types';
import { STATUS_TYPES } from '@/status/constants/types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

import {
  getCycleProgressByMember,
  getCycleProgressByProject,
  getCycleProgressChart,
  getCyclesProgress,
} from '~/modules/cycle/utils';

export const cycleQueries = {
  getCycle: async (
    _parent: undefined,
    { _id },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleRead');

    const cycle = await models.Cycle.getCycle(_id);
    return cycle;
  },

  getCycles: async (
    _parent: undefined,
    params,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleRead');

    const { list, totalCount, pageInfo } = await cursorPaginate<ICycleDocument>(
      {
        model: models.Cycle,
        params: {
          ...params,
          orderBy: { isActive: -1, isCompleted: 1, startDate: 1 },
        },
        query: { teamId: params.teamId },
      },
    );

    return { list, totalCount, pageInfo };
  },

  getCyclesActive: async (
    _parent: undefined,
    params,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleRead');

    if (params.taskId) {
      const task = await models.Task.findOne({
        _id: params.taskId,
        statusType: { $in: [STATUS_TYPES.COMPLETED, STATUS_TYPES.CANCELLED] },
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

          $or: [
            { isActive: true },
            { _id: params?.cycleId || null },
            {
              startDate: { $gte: new Date() },
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
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleRead');

    return getCyclesProgress(_id, assigneeId, models);
  },

  getCycleProgressChart: async (
    _parent: undefined,
    { _id, assigneeId },
    { models, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleRead');

    return getCycleProgressChart(subdomain, _id, assigneeId, models);
  },

  getCycleProgressByMember: async (
    _parent: undefined,
    { _id, assigneeId },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleRead');

    return getCycleProgressByMember(_id, assigneeId, models);
  },

  getCycleProgressByProject: async (
    _parent: undefined,
    { _id, assigneeId },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleRead');

    return getCycleProgressByProject(_id, assigneeId, models);
  },
};
