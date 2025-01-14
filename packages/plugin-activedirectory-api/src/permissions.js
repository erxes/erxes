module.exports = {
  cars: {
    name: 'activedirectory',
    description: 'ActiveDirectory',
    actions: [
      {
        name: 'all',
        description: 'All',
        use: ['showAD', 'manageAD'],
      },
      {
        name: 'showAD',
        description: 'Show activedirectory',
      },
      {
        name: 'manageAD',
        description: 'Manage activedirectory',
      },
    ],
  },
};
