module.exports = {
  products: {
    name: 'processes',
    description: 'Processes',
    actions: [
      {
        name: 'processesAll',
        description: 'All',
        use: ['showJobRefers', 'manageJobRefers',]
      },
      {
        name: 'showJobRefers',
        description: 'show Job Refers',
      },
      {
        name: 'manageJobRefers',
        description: 'manage Job Refers',
      }
    ]
  },
}