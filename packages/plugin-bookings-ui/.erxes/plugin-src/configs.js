module.exports = {
  name: 'bookings',
  port: 3001,
  exposes: {
    './routes': './src/routes.tsx',
    './settings': './src/Settings.tsx'
  },
  routes: {
    url: 'http://localhost:3001/remoteEntry.js',
    scope: 'bookings',
    module: './routes'
  },
  menus: [
    {
      text: 'Bookings',
      url: '/bookings',
      icon: 'icon-paste',
      location: 'mainNavigation'
    },
    {
      text: 'Bookings settings',
      icon: 'icon-paste',
      location: 'settings',
      scope: 'bookings',
      component: './settings'
    }
  ]
};
