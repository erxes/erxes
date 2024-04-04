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
          'showPos',
          'manageOrders',
          'manageCovers',
          'showOrders',
          'showCovers'

        ]
      },
      {
        name: 'managePos',
        description: 'Manage POS'
      },
      {
        name: 'showPos',
        description: 'Show'
      },
      {
        name: 'manageOrders',
        description: 'Manage Orders'
      },
      {
        name: 'manageCovers',
        description: 'Manage Covers'
      },
      {
        name: 'showOrders',
        description: 'Show Orders'
      },
      {
        name: 'showCovers',
        description: 'Show Covers'
      }
    ]
  },
};
