import { IContext } from '~/connectionResolvers';
import { reportDataToCSV } from '../../../exportUtils';
import {
  dealsTotalCount,
  dealCountByTag,
  dealCountByLabel,
  dealCountByCustomProperties,
  dealAverageAmountByRep,
  dealLeaderBoardAmountClosedByRep,
  dealsClosedLostByRep,
  dealsClosedWonByRep,
  dealRevenueByStage,
  dealsTotalCountByDueDate,
  dealAverageTimeSpentInEachStage,
  closedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown,
  dealCountByCustomer,
  dealCountByOpenProbability,
  getTrend,
  getTotalDealsCount,
  getWonDealsCount,
  getLostDealsCount,
  getConversionRate,
  getExpectedRevenue,
  forecastRevenue,
  buildFullMatch,
} from '../../../dealReports';

const chartHandlers: Record<string, Function> = {
  DealsTotalCount: dealsTotalCount,
  DealCountByTag: dealCountByTag,
  DealCountByLabel: dealCountByLabel,
  DealCountByCustomProperties: dealCountByCustomProperties,
  DealAverageAmountByRep: dealAverageAmountByRep,
  DealLeaderBoardAmountClosedByRep: dealLeaderBoardAmountClosedByRep,
  DealsClosedLostByRep: dealsClosedLostByRep,
  DealsClosedWonByRep: dealsClosedWonByRep,
  DealRevenueByStage: dealRevenueByStage,
  DealsTotalCountByDueDate: dealsTotalCountByDueDate,
  DealAverageTimeSpentInEachStage: dealAverageTimeSpentInEachStage,
  ClosedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown:
    closedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown,
  DealCountByCustomer: dealCountByCustomer,
  DealCountByOpenProbability: dealCountByOpenProbability,
};

export const dealReports = {
  dealReports: async (
    _root: any,
    { chartType, filters = {} }: { chartType: string; filters: any },
    { models, subdomain }: IContext,
  ) => {
    const handler = chartHandlers[chartType];
    if (!handler) {
      throw new Error(`Unknown chart type: ${chartType}`);
    }
    return handler(models, subdomain, filters);
  },
  dashboardSummary: async (
    _root: any,
    { filters = {} }: { filters: any },
    { models, subdomain }: IContext,
  ): Promise<any> => {
    const total = await getTrend(
      models,
      subdomain,
      filters,
      getTotalDealsCount,
    );
    const won = await getTrend(models, subdomain, filters, getWonDealsCount);
    const lost = await getTrend(models, subdomain, filters, getLostDealsCount);
    const conversion = await getTrend(
      models,
      subdomain,
      filters,
      getConversionRate,
    );
    const revenue = await getTrend(
      models,
      subdomain,
      filters,
      getExpectedRevenue,
    );

    return {
      totalDeals: total,
      wonDeals: won,
      lostDeals: lost,
      conversionRate: conversion,
      expectedRevenue: revenue,
    };
  },
  forecastRevenue: async (
    _root: any,
    { filters = {} }: { filters: any },
    { models, subdomain }: IContext,
  ) => {
    return forecastRevenue(models, subdomain, filters);
  },
  dealsByStage: async (
    _root: any,
    {
      filters = {},
      sort = 'createdAt',
      limit = 100,
      skip = 0,
    }: { filters: any; sort?: string; limit?: number; skip?: number },
    { models }: IContext,
  ) => {
    const match = buildFullMatch(filters);

    // Parse sort direction
    let sortObj: any = {};
    if (sort.startsWith('-')) {
      sortObj[sort.slice(1)] = -1;
    } else {
      sortObj[sort] = -1; // default descending (newest first)
    }

    const pipeline: any[] = [
      { $match: match },
      { $sort: sortObj },
      {
        $group: {
          _id: '$stageId',
          deals: { $push: '$$ROOT' },
          totalCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'sales_stages',
          localField: '_id',
          foreignField: '_id',
          as: 'stageInfo',
        },
      },
      { $unwind: { path: '$stageInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          stageId: '$_id',
          stageName: { $ifNull: ['$stageInfo.name', 'Unknown Stage'] },
          totalCount: 1,
          deals: { $slice: ['$deals', skip, limit] },
        },
      },
      { $sort: { stageName: 1 } },
    ];

    return await models.Deals.aggregate(pipeline);
  },
  // userWidgets query
  userWidgets: async (_root: any, _args: any, { models, user }: IContext) => {
    if (!user) return [];
    return models.SavedWidget.find({ userId: user._id }).sort({ position: 1 });
  },
  exportDealReport: async (
    _root: any,
    {
      chartType,
      filters = {},
      format = 'csv',
    }: { chartType: string; filters: any; format?: string },
    { models, subdomain }: IContext,
  ): Promise<{
    success: boolean;
    content?: string;
    filename?: string;
    error?: string;
  }> => {
    try {
      const handler = chartHandlers[chartType];
      if (!handler) throw new Error(`Unknown chart type: ${chartType}`);

      const reportData = await handler(models, subdomain, filters);

      if (format === 'csv') {
        const csvContent = reportDataToCSV(reportData);
        return {
          success: true,
          content: csvContent,
          filename: `${chartType}_${Date.now()}.csv`,
        };
      }

      return {
        success: false,
        error: `Format ${format} not supported yet`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
      };
    }
  },
};
