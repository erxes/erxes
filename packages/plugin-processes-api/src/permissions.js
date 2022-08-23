module.exports = {
  products: {
    name: 'processes',
    description: 'Processes',
    actions: [
      {
        name: 'processesAll',
        description: 'All',
        use: [
          'manageJobRefers',
          'manageWorks',
          'showFlows',
          'showJobRefers',
          'showWorks'
        ]
      },
      {
        name: 'manageJobRefers',
        description: 'Manage Jobs'
      },
      {
        name: 'manageWorks',
        description: 'Manage Works'
      },
      {
        name: 'showFlows',
        description: 'Show Flows'
      },
      {
        name: 'showJobRefers',
        description: 'Show Jobs'
      },
      {
        name: 'showWorks',
        description: 'Show Works'
      },
    ]
  }
};
