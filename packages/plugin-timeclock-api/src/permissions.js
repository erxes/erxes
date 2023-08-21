module.exports = {
  timeclock: {
    name: 'timeclock',
    description: 'Timeclock',
    actions: [
      {
        name: 'timeclocksAll',
        description: 'All',
        use: ['showTimeclocks', 'manageTimeclocks']
      },
      {
        name: 'manageTimeclocks',
        description: 'Manage timeclocks'
      },
      {
        name: 'showTimeclocks',
        description: 'Show timeclocks'
      }
    ]
  }
};
