module.exports = {
  srcDir: __dirname,
  name: 'salesplans',
  port: 3026,
  exposes: {
    './routes': './src/routes.tsx',
  },
  routes: {
    url: 'http://localhost:3026/remoteEntry.js',
    scope: 'salesplans',
    module: './routes',
  },
  menus: [
    {
      text: 'Sales Plans',
      to: '/salesplans/labels',
      image: '/images/icons/erxes-31.png',
      location: 'settings',
      scope: 'salesplans',
      action: '',
      // permissions: ['showJobs', 'manageJobs']
    },
    {
      text: 'Sales Plans',
      url: '/sales-plans/day-labels',
      icon: 'icon-file-check-alt',
      location: 'mainNavigation',
      scope: 'salesplans',
      permission: 'showSalesPlans',
    },
  ],
};
