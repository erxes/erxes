module.exports = {
  inventories: {
    name: 'inventories',
    description: 'Inventories',
    actions: [
      {
        name: 'inventoriesAll',
        description: 'All',
        use: ['manageRemainders']
      },
      {
        name: 'manageRemainders',
        description: 'Manage remainders'
      }
    ]
  }
};
