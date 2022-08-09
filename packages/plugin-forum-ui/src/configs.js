module.exports = {
  name: 'forum',
  port: 3012,
  scope: 'forum',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'forum',
    module: './routes'
  },
  menus: [
    {
      text: 'Forums',
      url: '/forums',
      icon: 'icon-idea',
      location: 'mainNavigation',
      // scope: 'forum'
    }
  ]
};