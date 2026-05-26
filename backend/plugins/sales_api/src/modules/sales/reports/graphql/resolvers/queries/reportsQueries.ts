import { IContext } from '~/connectionResolvers';
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
};