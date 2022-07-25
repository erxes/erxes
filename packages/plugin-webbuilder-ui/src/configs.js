module.exports = {
  name: 'webbuilder',
  port: 3027,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3027/remoteEntry.js',
    scope: 'webbuilder',
    module: './routes'
  },
  menus: [
    {
      text: 'Web builder',
      url: '/webbuilder/pages',
      icon: 'icon-window-grid',
      location: 'mainNavigation'
    }
  ]
};