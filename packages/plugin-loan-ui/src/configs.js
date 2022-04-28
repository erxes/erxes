module.exports = {
  name: 'loan',
  port: 3112,
  exposes: {
    './routes': './src/routes.tsx',
  },
  routes: {
    url: 'http://localhost:3112/remoteEntry.js',
    scope: 'loan',
    module: './routes',
  },
  menus: [
    {
      text: 'Loan',
      url: '/erxes-plugin-loan/home',
      icon: 'icon-list-2',
      permission: 'showContracts',
    },
  ],
};
