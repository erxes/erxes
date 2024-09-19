const reportTemplates = [
  {
    serviceType: 'ticket',
    title: 'Tickets chart',
    serviceName: 'tickets',
    serviceLabel: "Tickets",
    description: 'Tickets conversation charts',
    charts: [
      'TicketsTotalCount',
      'TicketCustomProperties',
      'TicketClosedTotalsByTags',
      'TicketClosedTotalsByLabel',
      'TicketClosedTotalsByRep',
      'TicketTotalsByFrequency',
      'TicketAverageTimeToCloseByRep',
      'TicketTotalsBySource',
    ],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png',
  }
];

export default reportTemplates;
