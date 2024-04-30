const reportTemplates = [
  {
    serviceType: 'deviation',
    title: 'Deviation chart',
    serviceName: 'aputpm',
    description: 'Deviation charts',
    charts: [
      'deviationByDefaultBranch',
      'deviationByDefaultDepartment',
      'deviationByEachMonth',
      'openedDeviationByUsers',
      'totalDeviation',
      'deviationByLabels',
      'deviationByAssets',
    ],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png',
  },
  {
    serviceType: 'action',
    title: 'Action chart',
    serviceName: 'aputpm',
    description: 'Action charts',
    charts: [
      'actionByDefaultDepartment',
      'totalAction',
      'actionByEachMonth',
      'closedActionByUsers',
      'totalAction',
      'actionByLabels',
    ],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png',
  },
];

export default reportTemplates;
