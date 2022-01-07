module.exports = {
  name: 'calendar',
  port: 3006,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3006/remoteEntry.js',
    scope: 'calendar',
    module: './routes'
  },
  menus: [
    {
      text: 'Calendar',
      url: '/calendar',
      icon: 'icon-calendar-alt',
      location: 'mainNavigation'
    }
  ]
};
