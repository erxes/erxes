module.exports = {
  name: 'exmfeed',
  port: 3111,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3111/remoteEntry.js',
    scope: 'exmfeed',
    module: './routes'
  },
  menus: [
    {
      text: 'Exm feed',
      url: '/erxes-plugin-exm-feed/home',
      icon: 'icon-list-2',
      location: 'mainNavigation',
      permission: 'showExmActivityFeed'
    }
  ]
};
