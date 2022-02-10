module.exports = {
  name: 'clientPortal',
  port: 3015,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3015/remoteEntry.js',
    scope: 'clientPortal',
    module: './routes'
  },
  menus: [
    {
      text: 'Client Portal',
      url: '/settings/client-portal',
      icon: 'icon-car',
      location: 'mainNavigation'
    }
  ]
};
