module.exports = {
  processes: {
    name: 'processes',
    description: 'Processes',
    actions: [
      {
        name: 'processesAll',
        description: 'All',
        use: [
          'showJobs',
          'manageJobs',
          'showWorks',
          'manageWorks',
        ]
      },
      {
        name: 'showJobs',
        description: 'Show Jobs'
      },
      {
        name: 'manageJobs',
        description: 'Manage Jobs'
      },
      {
        name: 'showWorks',
        description: 'Show Works'
      },
      {
        name: 'manageWorks',
        description: 'Manage Works'
      },
    ]
  }
};
