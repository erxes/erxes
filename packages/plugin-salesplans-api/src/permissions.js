module.exports = {
  salesplans: {
    name: 'salesplans',
    description: 'Sales Plans',
    actions: [
      {
        name: 'salesplansAll',
        description: 'All',
        use: ['showSalesPlans', 'manageSalesPlans']
      },
      {
        name: 'manageSalesPlans',
        description: 'Manage Sales Plans',
        use: ['showSalesPlans']
      },
      {
        name: 'showSalesPlans',
        description: 'Show Sales Plans'
      },
    ]
  }
};
