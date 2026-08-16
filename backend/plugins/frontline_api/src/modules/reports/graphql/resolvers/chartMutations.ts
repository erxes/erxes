import {
  IReportChartAddArgs,
  IReportChartEditArgs,
} from '@/reports/@types/chart';
import { pickReportChartFilters } from '@/reports/utils';
import { IContext } from '~/connectionResolvers';

const requireUserId = (user: IContext['user']) => {
  if (!user?._id) {
    throw new Error('Login required');
  }

  return user._id;
};

export const reportChartMutations = {
  async reportChartAdd(
    _parent: undefined,
    { name, chartType, visualType, colSpan, filters }: IReportChartAddArgs,
    { models, user }: IContext,
  ) {
    return models.ReportCharts.createReportChart(
      {
        name,
        chartType,
        visualType,
        colSpan,
        filters: pickReportChartFilters(filters),
      },
      requireUserId(user),
    );
  },

  async reportChartEdit(
    _parent: undefined,
    { _id, name, visualType, colSpan, filters }: IReportChartEditArgs,
    { models, user }: IContext,
  ) {
    requireUserId(user);

    return models.ReportCharts.updateReportChart(_id, {
      name,
      visualType,
      colSpan,
      filters: filters ? pickReportChartFilters(filters) : undefined,
    });
  },

  async reportChartRemove(
    _parent: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) {
    requireUserId(user);

    return models.ReportCharts.removeReportChart(_id);
  },
};
