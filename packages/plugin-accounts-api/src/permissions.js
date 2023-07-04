module.exports = {
  accounts: {
    name: 'accounts',
    description: 'Accounts',
    actions: [
      {
        name: 'accountsAll',
        description: 'All',
        use: ['showAccounts', 'manageAccounts', 'accountsMerge']
      },
      {
        name: 'manageAccounts',
        description: 'Manage accounts'
      },
      {
        name: 'showAccounts',
        description: 'Show accounts'
      },
      {
        name: 'accountsMerge',
        description: 'Merge accounts'
      }
    ]
  }
};
