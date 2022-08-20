module.exports = {
  engages: {
    name: 'loan',
    description: 'Loan',
    actions: [
      { name: 'showContracts', description: 'Show contracts' },
      { name: 'manageContracts', description: 'Manage contracts' },
      { name: 'showInsuranceTypes', description: 'Show insurance type' },
      { name: 'manageInsuranceTypes', description: 'Manage insurance type' },
      { name: 'showCollaterals', description: 'Show Collaterals' },
      { name: 'manageCollaterals', description: 'Manage Collaterals' },
      { name: 'saveSchedules', description: 'Save Schedules' },
      {
        name: 'pluginLoansAll',
        description: 'All',
        use: [
          'showContracts',
          'showInsuranceTypes',
          'manageContracts',
          'manageInsuranceTypes',
          'showCollaterals',
          'manageCollaterals',
          'saveSchedules',
        ],
      },
    ],
  },
};
