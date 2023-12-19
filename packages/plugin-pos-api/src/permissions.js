module.exports = {
    pos: {
      name: 'pos',
      description: 'POS',
      actions: [
        {
          name: 'posAll',
          description: 'All',
          use: [
            'managePos',
            'showPos'
          ]
        },
        {
          name: 'managePos',
          description: 'Manage POS'
        },
        {
          name: 'showPos',
          description: 'Show'
        }
      ]
    },
};
