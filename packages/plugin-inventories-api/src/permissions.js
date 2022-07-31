export default {
  inventories: {
    name: 'inventories',
    description: 'Intentories',
    actions: [
      {
        name: 'inventoriesAll',
        description: 'All',
        use: ['manageRemainders']
      },
      {
        name: 'manageRemainder',
        description: 'Manage remainders'
      }
    ]
  }
};
