import { publishReportUpdate } from '@/reports/realtime';
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
    { models, user, subdomain }: IContext,
  ) {
    const chart = await models.ReportCharts.createReportChart(
      {
        name,
        chartType,
        visualType,
        colSpan,
        filters: pickReportChartFilters(filters),
      },
      requireUserId(user),
    );
    await publishReportUpdate(subdomain, ['charts']);
    return chart;
  },

  async reportChartEdit(
    _parent: undefined,
    { _id, name, visualType, colSpan, filters }: IReportChartEditArgs,
    { models, user, subdomain }: IContext,
  ) {
    requireUserId(user);

    const chart = await models.ReportCharts.updateReportChart(_id, {
      name,
      visualType,
      colSpan,
      filters: filters ? pickReportChartFilters(filters) : undefined,
    });
    await publishReportUpdate(subdomain, ['charts']);
    return chart;
  },

  async reportChartRemove(
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, subdomain }: IContext,
  ) {
    requireUserId(user);

    const result = await models.ReportCharts.removeReportChart(_id);
    await publishReportUpdate(subdomain, ['charts']);
    return result;
  },
};
