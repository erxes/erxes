import { IContext } from '~/connectionResolvers';

export const reportChartQueries = {
  async reportCharts(
    _parent: undefined,
    { chartType }: { chartType?: string },
    { models }: IContext,
  ) {
    const selector = chartType ? { chartType } : {};

    return models.ReportCharts.find(selector).sort({ createdAt: 1 }).lean();
  },

  async reportChartDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.ReportCharts.getReportChart(_id);
  },
};
