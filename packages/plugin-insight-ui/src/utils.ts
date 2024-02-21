export const groupServiceTypesByServiceName = (list) => {
  return list.reduce((acc, cur) => {
    if (!acc[cur.serviceName]) {
      acc[cur.serviceName] = [];
    }
    if (!acc[cur.serviceName].includes(cur.serviceType)) {
      acc[cur.serviceName].push(cur.serviceType);
    }
    return acc;
  }, {});
};

export const filterChartTemplates = (chartTemplates, reportTemplates, item) => {
  const reportChartTypes = reportTemplates
    .filter((template) => template.serviceType === item?.serviceType)
    .flatMap((template) => template.charts);

  const filteredChartTemplates = chartTemplates.filter((template) =>
    reportChartTypes.includes(template.templateType),
  );

  return filteredChartTemplates;
};

const serviceTypes = {
  ClosedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown: 'deal',
  dealsChartByMonth: 'deal',
  DealAmountAverageByRep: 'deal',
  DealLeaderboardAmountClosedByRep: 'deal',
  DealsByLastModifiedDate: 'deal',
  DealsClosedLostAllTimeByRep: 'deal',
  DealsOpenByCurrentStage: 'deal',
  DealsClosedWonAllTimeByRep: 'deal',
  DealRevenueByStage: 'deal',
  DealsSales: 'deal',
  DealAverage: 'deal',
  TaskAverageTimeToCloseByReps: 'task',
  TaskAverageTimeToCloseByLabel: 'task',
  TaskAverageTimeToCloseByTags: 'task',
  TaskClosedTotalsByReps: 'task',
  TaskClosedTotalsByLabel: 'task',
  TaskClosedTotalsByTags: 'task',
  TasksIncompleteTotalsByReps: 'task',
  TasksIncompleteTotalsByLabel: 'task',
  TasksIncompleteTotalsByTags: 'task',
  AllTasksIncompleteByDueDate: 'task',
  TasksIncompleteAssignedToTheTeamByDueDate: 'task',
  TasksIncompleteAssignedToMeByDueDate: 'task',
  averageFirstResponseTime: 'inbox',
  averageCloseTime: 'inbox',
  closedConversationsCountByRep: 'inbox',
  conversationsCountByTag: 'inbox',
  conversationsCountBySource: 'inbox',
  conversationsCountByRep: 'inbox',
  conversationsCountByStatus: 'inbox',
  conversationsCount: 'inbox',
};

export const getService = (chart) => {
  const { templateType, serviceName } = chart;
  const serviceType = serviceTypes[templateType];

  return { serviceName, serviceType };
};
