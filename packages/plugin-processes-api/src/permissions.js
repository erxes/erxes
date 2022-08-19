module.exports = {
  products: {
    name: 'processes',
    description: 'Processes',
    actions: [
      {
        name: 'processesAll',
        description: 'All',
        use: ['showProcesses', 'manageProcesses']
      },
      {
        name: 'showProcesses',
        description: 'Show Processes'
      },
      {
        name: 'manageProcesses',
        description: 'Manage Processes'
      }
    ]
  }
};
