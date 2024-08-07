const reportTemplates = [
  {
    serviceType: "task",
    title: "Tasks chart",
    serviceName: "cards",
    description: "Cards conversation charts",
    charts: [
      "TasksTotalCount",
      "TaskAverageTimeToCloseByReps",
      "TaskAverageTimeToCloseByLabel",
      "TaskAverageTimeToCloseByTags",
      "TaskCustomProperties",
      "TaskClosedTotalsByReps",
      "TaskClosedTotalsByLabel",
      "TaskClosedTotalsByTags",
      "AllTasksIncompleteByDueDate"
    ],
    img: "https://cdn.mos.cms.futurecdn.net/S5bicwPe8vbP9nt3iwAwwi.jpg"
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
