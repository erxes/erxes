module.exports = {
  salaries: {
    name: 'bichilSalaries',
    description: 'Bichil salaries',
    actions: [
      {
        name: 'bichilSalariesAll',
        description: 'All',
        use: ['addSalaries', 'showSalaries'],
      },
      {
        name: 'addSalaries',
        description: 'Add salaries',
      },
      {
        name: 'showSalaries',
        description: 'Show salaries',
      },
    ],
  },
};
  