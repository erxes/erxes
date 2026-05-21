const reportTemplates = [
  {
    serviceType: 'deal',
    title: 'Deals chart',
    serviceName: 'sales',
    serviceLabel: "Deals",
    description: 'Deals charts',
    charts: [
      'DealsTotalCount',
      'DealCountByTag',
      'DealCountByLabel',
      'DealCountByCustomProperties',
      'DealAverageAmountByRep',
      'DealLeaderBoardAmountClosedByRep',
      'DealsClosedLostByRep',
      'DealsClosedWonByRep',
      'DealRevenueByStage',
      'DealsTotalCountByDueDate',
      'DealAverageTimeSpentInEachStage',
      'ClosedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown',
    ],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png',
  }
];

export default reportTemplates;
