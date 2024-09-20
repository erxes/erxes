const reportTemplates = [
  {
    serviceType: 'task',
    title: 'Tasks chart',
    serviceName: 'tasks',
    serviceLabel: "Tasks",
    description: 'Cards conversation charts',
    charts: [
      'TasksTotalCount',
      'TaskAverageTimeToCloseByReps',
      'TaskAverageTimeToCloseByLabel',
      'TaskAverageTimeToCloseByTags',
      'TaskCustomProperties',
      'TaskClosedTotalsByReps',
      'TaskClosedTotalsByLabel',
      'TaskClosedTotalsByTags',
      'AllTasksIncompleteByDueDate',
    ],
    img: 'https://cdn.mos.cms.futurecdn.net/S5bicwPe8vbP9nt3iwAwwi.jpg',
  }
];

export default reportTemplates;
