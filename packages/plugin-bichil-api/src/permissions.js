module.exports = {
  salaries: {
    name: 'bichilSalaries',
    description: 'Bichil salaries',
    actions: [
      {
        name: 'bichilSalariesAll',
        description: 'All',
        use: ['addSalaries', 'showSalaries', 'removeSalaries'],
      },
      {
        name: 'addSalaries',
        description: 'Add salaries',
      },
      {
        name: 'showSalaries',
        description: 'Show salaries',
      },
      {
        name: 'removeSalaries',
        description: 'Remove salaries',
      }
    ],
  },
};
  