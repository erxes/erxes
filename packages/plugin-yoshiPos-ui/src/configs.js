module.exports = {
  name: 'loan',
  port: 3121,
  exposes: {
    './routes': './src/routes.tsx',
    // './settings': './src/Settings.tsx',
    // './contractSection': './contracts/components/common/ContractSection.tsx',
  },
  routes: {
    url: 'http://localhost:3119/remoteEntry.js',
    scope: 'yoshiPos',
    module: './routes',
  },
  menus: [
    {
      text: 'Subscriber',
      url: '/unsubscribe',
      icon: 'icon-medal',
      location: 'mainNavigation',
      permission: 'showContracts',
    },
  ],
};
