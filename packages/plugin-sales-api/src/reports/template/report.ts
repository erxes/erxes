const reportTemplates = [
  {
    serviceType: "deal",
    title: "Deals chart",
    serviceName: "cards",
    description: "Deals charts",
    charts: [
      "DealsTotalCount",
      "DealCountByTag",
      "DealCountByLabel",
      "DealCountByCustomProperties",
      "DealAverageAmountByRep",
      "DealLeaderBoardAmountClosedByRep",
      "DealsClosedLostByRep",
      "DealsClosedWonByRep",
      "DealRevenueByStage",
      "DealsTotalCountByDueDate",
      "DealAverageTimeSpentInEachStage",
      "ClosedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown"
    ],
    img: "https://sciter.com/wp-content/uploads/2022/08/chart-js.png"
  },
  {
    serviceType: "ticket",
    title: "Tickets chart",
    serviceName: "cards",
    description: "Tickets conversation charts",
    charts: [
      "TicketsTotalCount",
      "TicketCustomProperties",
      "TicketClosedTotalsByTags",
      "TicketClosedTotalsByLabel",
      "TicketClosedTotalsByRep",
      "TicketTotalsByFrequency",
      "TicketAverageTimeToCloseByRep",
      "TicketTotalsBySource"
    ],
    img: "https://sciter.com/wp-content/uploads/2022/08/chart-js.png"
  }
];

export default reportTemplates;
