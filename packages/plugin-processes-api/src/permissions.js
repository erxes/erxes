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
        description: 'show processes'
      },
      {
        name: 'manageProcesses',
        description: 'manage processes'
      }
    ]
  }
};
