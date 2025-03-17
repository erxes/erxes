module.exports = {
  accounts: {
    name: 'accounts',
    description: 'Accounts',
    actions: [
      {
        name: 'accountsAll',
        description: 'All',
        use: [
          'showAccounts',
          'manageAccounts',
          'accountsMerge',
          'removeAccounts',
          'manageVatRows',
          'manageCtaxRows'
        ]
      },
      {
        name: 'manageAccounts',
        description: 'Manage accounts'
      },
      {
        name: 'removeAccounts',
        description: 'Remove accounts'
      },
      {
        name: 'showAccounts',
        description: 'Show accounts'
      },
      {
        name: 'accountsMerge',
        description: 'Merge accounts'
      },
      {
        name: 'manageVatRows',
        description: 'manage Vat Rows'
      },
      {
        name: 'manageCtaxRows',
        description: 'manage CTAX Rows'
      },
    ]
  },
  accountingsTransaction: {
    name: 'accountingsTr',
    description: 'Accounting Transaction',
    actions: [
      {
        name: 'accountingsTrAll',
        description: 'Transaction ALL',
      },
      {
        name: 'accountingsCreateMainTr',
        description: 'create main transaction'
      }
    ]
  },
};
