module.exports = {
  name: 'xbuilder',
  port: 3027,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3027/remoteEntry.js',
    scope: 'xbuilder',
    module: './routes'
  },
  menus: [
    {
      text: 'X Builder',
      url: '/xbuilder',
      icon: 'icon-window-grid',
      location: 'mainNavigation',
      permission: 'showXbuilder'
    }
  ]
};