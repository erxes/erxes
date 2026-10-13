import { ICycleDocument } from '@/cycle/types';
import { STATUS_TYPES } from '@/status/constants/types';
import { IContext } from '~/connectionResolvers';

const fillTotals = <T extends object>(item: T | null | undefined) =>
  item == null
    ? item
    : {
        totalScope: 0,
        totalStartedScope: 0,
        totalCompletedScope: 0,
        ...item,
      };

export const Cycle = {
  statistics(cycle: ICycleDocument) {
    const statistics = cycle.statistics;
    if (!statistics) return null;

    return {
      progress: fillTotals(statistics.progress),
      progressByMember: statistics.progressByMember?.map(fillTotals),
      progressByProject: statistics.progressByProject?.map(fillTotals),
      chartData: statistics.chartData
        ? {
            totalScope: statistics.chartData.totalScope ?? 0,
            chartData: statistics.chartData.chartData ?? [],
          }
        : statistics.chartData,
    };
  },

  async donePercent(
    cycle: ICycleDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    if (cycle.isCompleted || !cycle.isActive) {
      const progress = cycle.statistics?.progress;

      const totalScope = progress?.totalScope || 0;
      const totalCompletedScope = progress?.totalCompletedScope || 0;
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
