module.exports = {
  name: 'forum',
  port: 3019,
  scope: 'forum',
  exposes: {
    './routes': './src/routes.tsx',
    './settings': './src/Settings.tsx',
  },
  routes: {
    url: 'http://localhost:3019/remoteEntry.js',
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