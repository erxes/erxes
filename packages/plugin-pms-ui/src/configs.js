module.exports = {
  srcDir: __dirname,
  name: 'pms',
  port: 3031,
  exposes: {
    './routes': './src/routes.tsx',
    './response': './src/response.tsx',
  },
  routes: {
    url: 'http://localhost:3031/remoteEntry.js',
    scope: 'pms',
    module: './routes',
  },
  menus: [
    {
      text: 'PMS config',
      to: '/settings/pms/general',
      image: '/images/icons/erxes-04.svg',
      location: 'settings',
      scope: 'pms',
      action: 'pmsConfig',
      permission: 'pmsConfig',
    },
    {
      text: 'PMS config history',
      url: '/pms/history',
      icon: 'book-alt',
      location: 'mainNavigation',
      scope: 'pms',
      permission: 'pmshistory',
    },
  ],
  layout: {
    url: 'http://localhost:3031/remoteEntry.js',
    scope: 'pms',
    module: './response',
  },
};
