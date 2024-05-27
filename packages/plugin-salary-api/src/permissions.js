module.exports = {
    salaries: {
      name: 'salaries',
      description: 'Salaries',
      actions: [
        {
          name: 'salariesAll',
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
    