import { sendTRPCMessage } from 'erxes-api-shared/utils';
import dayjs from 'dayjs';                           // <-- ADDED for Step 3
import { buildDateFilter, buildDateGroup, getRelatedIds } from './reportUtils';
import { IModels } from '../../../connectionResolvers';
import { PROBABILITY_CLOSED, PROBABILITY_OPEN } from './reportConfig';
import { IDealReportFilter } from '@/sales/reports/@types/reportFilters';

const buildFullMatch = (filters: IDealReportFilter): Record<string, any> => {
  const dateField = filters.dateRangeType || 'createdAt';
  const match: Record<string, any> = buildDateFilter(filters, dateField);

  if (filters.pipelineIds?.length) match.pipelineId = { $in: filters.pipelineIds };
  if (filters.stageIds?.length) match.stageId = { $in: filters.stageIds };
  if (filters.boardId) match.boardId = filters.boardId;
  if (filters.userIds?.length) match.userId = { $in: filters.userIds };
  if (filters.assignedUserIds?.length) match.assignedUserIds = { $in: filters.assignedUserIds };
  if (filters.tagIds?.length) match.tagIds = { $in: filters.tagIds };
  if (filters.labelIds?.length) match.labelIds = { $in: filters.labelIds };
  if (filters.companyIds?.length) match.companyIds = { $in: filters.companyIds };
  if (filters.productIds?.length) match.productIds = { $in: filters.productIds };
  if (filters.priority) match.priority = filters.priority;
  if (filters.status) match.status = filters.status;
  if (filters.branchIds?.length) match.branchId = { $in: filters.branchIds };
  if (filters.departmentIds?.length) match.departmentId = { $in: filters.departmentIds };

  return match;
};

const getPreviousPeriodFilters = (filters: IDealReportFilter): IDealReportFilter => {
  const prevFilters = { ...filters };
  if (filters.fromDate && filters.toDate) {
    const duration = dayjs(filters.toDate).diff(dayjs(filters.fromDate), 'day');
    prevFilters.fromDate = dayjs(filters.fromDate).subtract(duration, 'day').format('YYYY-MM-DD');
    prevFilters.toDate = dayjs(filters.toDate).subtract(duration, 'day').format('YYYY-MM-DD');
    prevFilters.dateRange = undefined;
  } else if (filters.dateRange && filters.dateRange !== 'all') {
    switch (filters.dateRange) {
      case 'today': prevFilters.dateRange = 'yesterday'; break;
      case 'thisWeek': prevFilters.dateRange = 'lastWeek'; break;
      case 'thisMonth': prevFilters.dateRange = 'lastMonth'; break;
      case 'thisYear': prevFilters.dateRange = 'lastYear'; break;
      default: prevFilters.dateRange = filters.dateRange;
    }
  }
  return prevFilters;
};

const getTrend = async (
  models: IModels,
  subdomain: string,
  filters: IDealReportFilter,
  metricFn: (models: IModels, subdomain: string, filters: IDealReportFilter) => Promise<number>
): Promise<{ current: number; previous: number; percentChange: number }> => {
  const current = await metricFn(models, subdomain, filters);
  const prevFilters = getPreviousPeriodFilters(filters);
  const previous = await metricFn(models, subdomain, prevFilters);
  const percentChange = previous === 0 ? 0 : ((current - previous) / previous) * 100;
  return { current, previous, percentChange: Math.round(percentChange * 10) / 10 };
};

const getTotalDealsCount = async (models: IModels, _subdomain: string, filters: IDealReportFilter): Promise<number> => {
  const match = buildFullMatch(filters);
  return await models.Deals.countDocuments(match);
};

const getWonDealsCount = async (models: IModels, _subdomain: string, filters: IDealReportFilter): Promise<number> => {
  const match = buildFullMatch(filters);
  const stages = await models.Stages.find({ probability: 'Won', type: 'deal' }).lean();
  match.stageId = { $in: stages.map(s => s._id) };
  return await models.Deals.countDocuments(match);
};

const getLostDealsCount = async (models: IModels, _subdomain: string, filters: IDealReportFilter): Promise<number> => {
  const match = buildFullMatch(filters);
  const stages = await models.Stages.find({ probability: 'Lost', type: 'deal' }).lean();
  match.stageId = { $in: stages.map(s => s._id) };
  return await models.Deals.countDocuments(match);
};

const getConversionRate = async (models: IModels, subdomain: string, filters: IDealReportFilter): Promise<number> => {
  const won = await getWonDealsCount(models, subdomain, filters);
  const lost = await getLostDealsCount(models, subdomain, filters);
  const total = won + lost;
  return total === 0 ? 0 : (won / total) * 100;
};

const getExpectedRevenue = async (models: IModels, _subdomain: string, filters: IDealReportFilter): Promise<number> => {
  const match = buildFullMatch(filters);
  const openStages = await models.Stages.find({ probability: { $nin: ['Won', 'Lost'] }, type: 'deal' }).lean();
  match.stageId = { $in: openStages.map(s => s._id) };
  const deals = await models.Deals.find(match, { productsData: 1, stageId: 1 }).lean();
  let total = 0;
  for (const deal of deals) {
    const stage = openStages.find(s => s._id.toString() === deal.stageId.toString());
    const probability = stage?.probability ? parseFloat(stage.probability) / 100 : 0;
    const amount = (deal.productsData || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    total += amount * probability;
  }
  return total;
};


/**
 * 1. Total count of deals (optionally filtered by date)
 */
export const dealsTotalCount = async (models: IModels, filters: IDealReportFilter) => {
  const match = buildFullMatch(filters);
  const count = await models.Deals.countDocuments(match);
  return { labels: ['Total'], datasets: [{ data: [count] }] };
};

/**
 * 2. Count deals grouped by tag
 */
export const dealCountByTag = async (
  models: IModels,
  subdomain: string,
  filters: IDealReportFilter,
) => {
  const match = buildFullMatch(filters);
  match.tagIds = { $exists: true, $ne: [] };

  const pipeline: any[] = [
    { $match: match },
    { $unwind: '$tagIds' },
    { $group: { _id: '$tagIds', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ];
  const result = await models.Deals.aggregate(pipeline);
  if (!result.length) {
    return { labels: [], datasets: [{ data: [] }] };
  }
  const tagIds = result.map(r => r._id);
  const tags = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'tags',
    action: 'find',
    input: { query: { _id: { $in: tagIds } } },
    defaultValue: [],
  });
  const tagMap = new Map(tags.map((t: any) => [t._id, t.name]));
  return {
    labels: tagIds.map(id => tagMap.get(id) || id),
    datasets: [{ data: result.map(r => r.count) }],
  };
};

/**
 * 3. Count deals grouped by label
 */
export const dealCountByLabel = async (
  models: IModels,
  subdomain: string,
  filters: IDealReportFilter,
) => {
  const match = buildFullMatch(filters);
  match.labelIds = { $exists: true, $ne: [] };

  const pipeline: any[] = [
    { $match: match },
    { $unwind: '$labelIds' },
    { $group: { _id: '$labelIds', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ];
  const result = await models.Deals.aggregate(pipeline);
  if (!result.length) {
    return { labels: [], datasets: [{ data: [] }] };
  }
  const labelIds = result.map(r => r._id);
  const labels = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'pipelineLabels',
    action: 'find',
    input: { query: { _id: { $in: labelIds } } },
    defaultValue: [],
  });
  const labelMap = new Map(labels.map((l: any) => [l._id, l.name]));
  return {
    labels: labelIds.map(id => labelMap.get(id) || id),
    datasets: [{ data: result.map(r => r.count) }],
  };
};

/**
 * 4. Count deals grouped by a custom property (field)
 */
export const dealCountByCustomProperties = async (
  models: IModels,
  filters: IDealReportFilter,
) => {
  const match = buildFullMatch(filters);
  const { fieldId } = filters;
  if (!fieldId) {
    throw new Error('Custom field id is required');
  }

  const pipeline: any[] = [
    { $match: match },
    { $unwind: '$customFieldsData' },
    { $match: { 'customFieldsData.field': fieldId } },
    {
      $addFields: {
        flatValues: {
          $cond: {
            if: { $eq: [{ $type: '$customFieldsData.value' }, 'object'] },
            then: {
              $map: {
                input: { $objectToArray: '$customFieldsData.value' },
                as: 'pair',
                in: '$$pair.v',
              },
            },
            else: {
              $cond: {
                if: { $isArray: '$customFieldsData.value' },
                then: '$customFieldsData.value',
                else: ['$customFieldsData.value'],
              },
            },
          },
        },
      },
    },
    { $unwind: '$flatValues' },
    {
      $group: {
        _id: '$flatValues',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ];

  const result = await models.Deals.aggregate(pipeline);
  return {
    labels: result.map(r => r._id),
    datasets: [{ data: result.map(r => r.count) }],
  };
};

/**
 * 5. Average deal amount per assigned user (rep)
 */
export const dealAverageAmountByRep = async (
  models: IModels,
  subdomain: string,
  filters: IDealReportFilter,
) => {
  const match = buildFullMatch(filters);
  match['productsData.tickUsed'] = true;
  const pipeline: any[] = [
    { $match: match },
    { $unwind: '$productsData' },
    { $match: { 'productsData.tickUsed': true } },
    { $unwind: '$assignedUserIds' },
    {
      $group: {
        _id: '$assignedUserIds',
        averageAmount: { $avg: '$productsData.amount' },
      },
    },
    { $sort: { averageAmount: -1 } },
  ];
  const result = await models.Deals.aggregate(pipeline);
  if (!result.length) {
    return { labels: [], datasets: [{ data: [] }] };
  }
  const userIds = result.map(r => r._id);
  const users = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'users',
    action: 'find',
    input: { query: { _id: { $in: userIds } } },
    defaultValue: [],
  });
  const userMap = new Map(
    users.map((u: any) => [u._id, u.details?.fullName || u.email]),
  );
  return {
    labels: userIds.map(id => userMap.get(id) || id),
    datasets: [{ data: result.map(r => r.averageAmount) }],
  };
};

/**
 * 6. Leaderboard of closed deals amount by rep
 */
export const dealLeaderBoardAmountClosedByRep = async (
  models: IModels,
  subdomain: string,
  filters: IDealReportFilter,
) => {
  const match = buildFullMatch(filters);
  const stages = await models.Stages.find({
    probability: { $in: PROBABILITY_CLOSED },
    type: 'deal',
  }).lean();
  const closedStageIds = stages.map(s => s._id);
  match.stageId = { $in: closedStageIds };
  match['productsData.tickUsed'] = true;
  const pipeline: any[] = [
    { $match: match },
    { $unwind: '$productsData' },
    { $match: { 'productsData.tickUsed': true } },
    { $unwind: '$assignedUserIds' },
    {
      $group: {
        _id: '$assignedUserIds',
        totalAmount: { $sum: '$productsData.amount' },
      },
    },
    { $sort: { totalAmount: -1 } },
  ];
  const result = await models.Deals.aggregate(pipeline);
  if (!result.length) {
    return { labels: [], datasets: [{ data: [] }] };
  }
  const userIds = result.map(r => r._id);
  const users = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'users',
    action: 'find',
    input: { query: { _id: { $in: userIds } } },
    defaultValue: [],
  });
  const userMap = new Map(
    users.map((u: any) => [u._id, u.details?.fullName || u.email]),
  );
  return {
    labels: userIds.map(id => userMap.get(id) || id),
    datasets: [{ data: result.map(r => r.totalAmount) }],
  };
};

/**
 * 7. Count of closed lost deals by rep
 */
export const dealsClosedLostByRep = async (
  models: IModels,
  subdomain: string,
  filters: IDealReportFilter,
) => {
  const match = buildFullMatch(filters);
  const stages = await models.Stages.find({
    probability: 'Lost',
    type: 'deal',
  }).lean();
  match.stageId = { $in: stages.map(s => s._id) };
  const pipeline: any[] = [
    { $match: match },
    { $unwind: '$assignedUserIds' },
    { $group: { _id: '$assignedUserIds', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ];
  const result = await models.Deals.aggregate(pipeline);
  if (!result.length) {
    return { labels: [], datasets: [{ data: [] }] };
  }
  const userIds = result.map(r => r._id);
  const users = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'users',
    action: 'find',
    input: { query: { _id: { $in: userIds } } },
    defaultValue: [],
  });
  const userMap = new Map(
    users.map((u: any) => [u._id, u.details?.fullName || u.email]),
  );
  return {
    labels: userIds.map(id => userMap.get(id) || id),
    datasets: [{ data: result.map(r => r.count) }],
  };
};

/**
 * 8. Count of closed won deals by rep
 */
export const dealsClosedWonByRep = async (
  models: IModels,
  subdomain: string,
  filters: IDealReportFilter,
) => {
  const match = buildFullMatch(filters);
  const stages = await models.Stages.find({
    probability: 'Won',
    type: 'deal',
  }).lean();
  match.stageId = { $in: stages.map(s => s._id) };
  const pipeline: any[] = [
    { $match: match },
    { $unwind: '$assignedUserIds' },
    { $group: { _id: '$assignedUserIds', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ];
  const result = await models.Deals.aggregate(pipeline);
  if (!result.length) {
    return { labels: [], datasets: [{ data: [] }] };
  }
  const userIds = result.map(r => r._id);
  const users = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'users',
    action: 'find',
    input: { query: { _id: { $in: userIds } } },
    defaultValue: [],
  });
  const userMap = new Map(
    users.map((u: any) => [u._id, u.details?.fullName || u.email]),
  );
  return {
    labels: userIds.map(id => userMap.get(id) || id),
    datasets: [{ data: result.map(r => r.count) }],
  };
};

/**
 * 9. Revenue by stage (sum of productsData.amount where tickUsed = true)
 */
export const dealRevenueByStage = async (
  models: IModels,
  filters: IDealReportFilter,
) => {
  const match = buildFullMatch(filters);
  match['productsData.tickUsed'] = true;
  const pipeline: any[] = [
    { $match: match },
    { $unwind: '$productsData' },
    { $match: { 'productsData.tickUsed': true } },
    {
      $lookup: {
        from: 'sales_stages',
        localField: 'stageId',
        foreignField: '_id',
        as: 'stage',
      },
    },
    { $unwind: '$stage' },
    {
      $group: {
        _id: '$stage.name',
        totalAmount: { $sum: '$productsData.amount' },
      },
    },
    { $sort: { totalAmount: -1 } },
  ];
  const result = await models.Deals.aggregate(pipeline);
  return {
    labels: result.map(r => r._id),
    datasets: [{ data: result.map(r => r.totalAmount) }],
  };
};

/**
 * 10. Total count of deals grouped by due date (closeDate)
 */
export const dealsTotalCountByDueDate = async (
  models: IModels,
  filters: IDealReportFilter,
) => {
  const originalDateRangeType = filters.dateRangeType;
  filters.dateRangeType = 'closeDate';
  const match = buildFullMatch(filters);
  filters.dateRangeType = originalDateRangeType;

  match.closeDate = { $exists: true, $ne: null, $type: 'date' };

  const group = buildDateGroup('closeDate', filters.frequency);
  const pipeline: any[] = [{ $match: match }, ...group];
  const result = await models.Deals.aggregate(pipeline);
  return {
    labels: result.map(r => r._id),
    datasets: [{ data: result.map(r => r.count) }],
  };
};

/**
 * 11. Average time spent in each stage (based on activity logs)
 */
export const dealAverageTimeSpentInEachStage = async (
  models: IModels,
  subdomain: string,
  filters: IDealReportFilter,
) => {
  const match = buildFullMatch(filters);
  const deals = await models.Deals.find(match, { _id: 1, stageId: 1 }).lean();
  const dealIds = deals.map(d => d._id);

  if (!dealIds.length) {
    return { labels: [], datasets: [{ data: [] }] };
  }

  const logs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'activityLogs',
    action: 'findMany',
    input: {
      query: {
        contentType: 'sales:deal',
        contentId: { $in: dealIds },
        action: 'moved',
      },
      sort: { createdAt: 1 },
    },
    defaultValue: [],
  });

  const stageDurations: Record<string, number[]> = {};
  const logsByDeal: Record<string, any[]> = {};

  for (const log of logs) {
    const dealId = log.contentId;
    if (!logsByDeal[dealId]) logsByDeal[dealId] = [];
    logsByDeal[dealId].push(log);
  }

  for (const [, dealLogs] of Object.entries(logsByDeal)) {
    for (let i = 0; i < dealLogs.length; i++) {
      const currentLog = dealLogs[i];
      const nextLog = dealLogs[i + 1];
      const stageId = currentLog.content?.destinationStageId;
      if (!stageId) continue;

      const enterTime = new Date(currentLog.createdAt).getTime();
      const exitTime = nextLog ? new Date(nextLog.createdAt).getTime() : Date.now();

      const hoursSpent = (exitTime - enterTime) / (1000 * 60 * 60);
      if (!stageDurations[stageId]) stageDurations[stageId] = [];
      stageDurations[stageId].push(hoursSpent);
    }
  }

  const stageIds = Object.keys(stageDurations);
  const stages = await models.Stages.find({ _id: { $in: stageIds } }).lean();
  const stageMap = new Map(stages.map(s => [s._id, s.name]));

  const labels: string[] = [];
  const averages: number[] = [];

  stageIds.forEach(stageId => {
    const durations = stageDurations[stageId];
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    labels.push(stageMap.get(stageId) || stageId);
    averages.push(Math.round(avg * 10) / 10);
  });

  return {
    labels,
    datasets: [{ data: averages }],
  };
};

/**
 * 12. Closed revenue by month with deal total and closed revenue breakdown
 */
export const closedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown = async (
  models: IModels,
  filters: IDealReportFilter,
) => {
  const match = buildFullMatch(filters);
  match.createdAt = { ...match.createdAt, $type: 'date' };

  const stages = await models.Stages.find({
    probability: { $in: PROBABILITY_CLOSED },
    type: 'deal',
  }).lean();
  const closedStageIds = stages.map(s => s._id);

  const pipeline: any[] = [
    { $match: match },
    { $unwind: '$productsData' },
    { $match: { 'productsData.tickUsed': true } },
    {
      $addFields: {
        isClosed: { $in: ['$stageId', closedStageIds] },
        month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
      },
    },
    {
      $group: {
        _id: '$month',
        totalAmount: { $sum: '$productsData.amount' },
        closedAmount: {
          $sum: {
            $cond: [{ $eq: ['$isClosed', true] }, '$productsData.amount', 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ];
  const result = await models.Deals.aggregate(pipeline);
  return {
    labels: result.map(r => r._id),
    datasets: [
      { label: 'Total Revenue', data: result.map(r => r.totalAmount) },
      { label: 'Closed Revenue', data: result.map(r => r.closedAmount) },
    ],
  };
};

/**
 * 13. Count deals grouped by stage, filtered by customer IDs
 */
export const dealCountByCustomer = async (
  models: IModels,
  subdomain: string,
  filters: IDealReportFilter,
) => {
  const match = buildFullMatch(filters);

  if (filters.customerIds?.length) {
    const relatedDealIds = await getRelatedIds(
      subdomain,
      'customer',
      filters.customerIds,
      'deal',
    );
    if (!relatedDealIds.length) {
      return { labels: [], datasets: [{ data: [] }] };
    }
    match._id = { $in: relatedDealIds };
  }

  const pipeline: any[] = [
    { $match: match },
    {
      $lookup: {
        from: 'sales_stages',
        localField: 'stageId',
        foreignField: '_id',
        as: 'stage',
      },
    },
    { $unwind: '$stage' },
    {
      $group: {
        _id: '$stage.name',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ];
  const result = await models.Deals.aggregate(pipeline);
  return {
    labels: result.map(r => r._id),
    datasets: [{ data: result.map(r => r.count) }],
  };
};

/**
 * 14. Count deals in open stages
 */
export const dealCountByOpenProbability = async (
  models: IModels,
  filters: IDealReportFilter,
) => {
  const match = buildFullMatch(filters);

  const stages = await models.Stages.find({
    probability: { $in: PROBABILITY_OPEN },
    type: 'deal',
  }).lean();
  const openStageIds = stages.map(s => s._id);
  if (!openStageIds.length) {
    return { labels: [], datasets: [{ data: [] }] };
  }
  match.stageId = { $in: openStageIds };

  const pipeline: any[] = [
    { $match: match },
    {
      $lookup: {
        from: 'sales_stages',
        localField: 'stageId',
        foreignField: '_id',
        as: 'stage',
      },
    },
    { $unwind: '$stage' },
    {
      $group: {
        _id: '$stage.name',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ];
  const result = await models.Deals.aggregate(pipeline);
  return {
    labels: result.map(r => r._id),
    datasets: [{ data: result.map(r => r.count) }],
  };
};
export const forecastRevenue = async (
  models: IModels,
  _subdomain: string,
  filters: IDealReportFilter,
) => {
  const match = buildFullMatch(filters);
  const allStages = await models.Stages.find({ type: 'deal' }).lean();
  const openStages = allStages.filter(s => s.probability && !['Won', 'Lost'].includes(s.probability));
  match.stageId = { $in: openStages.map(s => s._id) };

  const deals = await models.Deals.find(match, { productsData: 1, stageId: 1 }).lean();
  let totalForecast = 0;
  const stageMap = new Map<string, number>();
  const probMap = new Map<string, number>();

  for (const deal of deals) {
    const stage = openStages.find(s => s._id.toString() === deal.stageId.toString());
    const probability = stage?.probability ? parseFloat(stage.probability) / 100 : 0;
    const amount = (deal.productsData || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    const forecast = amount * probability;
    totalForecast += forecast;

    // by stage
    const stageId = deal.stageId.toString();
    stageMap.set(stageId, (stageMap.get(stageId) || 0) + forecast);

    // by probability bucket
    const bucket = stage?.probability || '0%';
    probMap.set(bucket, (probMap.get(bucket) || 0) + forecast);
  }

  const byStage = Array.from(stageMap.entries()).map(([stageId, forecast]) => {
    const stage = allStages.find(s => s._id.toString() === stageId);
    return { stageId, stageName: stage?.name || stageId, forecast };
  });

  const byProbability = Array.from(probMap.entries())
    .map(([bucket, forecast]) => ({ bucket, forecast }))
    .sort((a, b) => {
      const aVal = parseFloat(a.bucket) || (a.bucket === 'Won' ? 100 : a.bucket === 'Lost' ? 0 : 0);
      const bVal = parseFloat(b.bucket) || (b.bucket === 'Won' ? 100 : b.bucket === 'Lost' ? 0 : 0);
      return bVal - aVal;
    });

  return { totalForecast, byStage, byProbability };
};
export {
  buildFullMatch,
  getTrend,
  getTotalDealsCount,
  getWonDealsCount,
  getLostDealsCount,
  getConversionRate,
  getExpectedRevenue,
};