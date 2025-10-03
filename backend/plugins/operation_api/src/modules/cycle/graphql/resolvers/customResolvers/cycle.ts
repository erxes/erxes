import { ICycleDocument } from '@/cycle/types';
import { STATUS_TYPES } from '@/status/constants/types';
import { IContext } from '~/connectionResolvers';

export const Cycle = {
  async donePercent(
    cycle: ICycleDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    if (cycle.isCompleted || !cycle.isActive) {
      const progress = (cycle.statistics as any)?.progress || {};

      const totalScope = progress.totalScope || 0;
      const totalCompletedScope = progress.totalCompletedScope || 0;
      const donePercent = Math.round((totalCompletedScope / totalScope) * 100);

      return donePercent || 0;
    }

    const result = await models.Task.aggregate([
      {
        $match: {
          cycleId: cycle._id,
          statusType: { $ne: STATUS_TYPES.CANCELLED },
        },
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          doneTasks: {
            $sum: {
              $cond: [
                {
                  $eq: ['$statusType', STATUS_TYPES.COMPLETED],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    if (!result.length || result[0].totalTasks === 0) {
      return 0;
    }

    return Math.round((result[0].doneTasks / result[0].totalTasks) * 100);
  },
};
