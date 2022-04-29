module.exports = {
  name: 'tumentech',
  port: 3023,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3023/remoteEntry.js',
    scope: 'tumentech',
    module: './routes'
  },
  menus: [
    {
      text: 'Tumentech',
      url: '/list',
      icon: 'icon-car',
      location: 'mainNavigation',
      permission: 'showCars'
    }
  ]
};
