module.exports = {
  name: 'loan',
  port: 3119,
  exposes: {
    './routes': './src/routes.tsx',
  },
  routes: {
    url: 'http://localhost:3119/remoteEntry.js',
    scope: 'loan',
    module: './routes',
  },
  menus: [
    {
      text: 'Loan',
      url: '/erxes-plugin-loan/home',
      icon: 'icon-list-2',
      permission: 'pluginLoansAll',
    },
  ],
};
