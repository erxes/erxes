module.exports = {
  name: 'salesplans',
  port: 3026,
  exposes: {
    './routes': './src/routes.tsx',
  },
  routes: {
    url: 'http://localhost:3025/remoteEntry.js',
    scope: 'salesplans',
    module: './routes',
  },
  menus: [
    {
      text: 'Sales Plans',
      url: '/sales-plans',
      icon: 'icon-file-check-alt',
      location: 'mainNavigation',
      scope: 'salesplans',
      permissions: [],
    },
  ],
};
