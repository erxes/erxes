module.exports = {
  name: 'savings',
  port: 3120,
  exposes: {
    './routes': './src/routes.tsx',
    './contractSection': './src/contracts/components/common/ContractSection.tsx'
  },
  routes: {
    url: 'http://localhost:3120/remoteEntry.js',
    scope: 'savings',
    module: './routes'
  },
  menus: [
    {
      text: 'Saving Contract',
      url: '/erxes-plugin-saving/contract-list',
      icon: 'icon-piggybank',
      location: 'mainNavigation',
      permissions: ['showContracts'],
      permission: 'showContracts'
    },
    {
      text: 'Saving Contract types',
      image: '/images/icons/erxes-01.svg',
      to: '/erxes-plugin-saving/contract-types/',
      action: 'savingConfig',
      scope: 'savings',
      location: 'settings',
      permissions: ['showContracts'],
      permission: 'showContracts'
    },
    {
      text: 'Saving Transaction',
      image: '/images/icons/erxes-16.svg',
      to: '/erxes-plugin-saving/transaction-list',
      action: 'transaction',
      scope: 'savings',
      location: 'transaction-list',
      permissions: ['showTransactions']
    }
  ]
};
