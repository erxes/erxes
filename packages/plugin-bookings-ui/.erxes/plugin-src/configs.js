module.exports = {
  name: 'bookings',
  port: 3002,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3002/remoteEntry.js',
    scope: 'bookings',
    module: './routes'
  },
  menus: [
    {
      text: 'Bookings',
      url: '/bookings',
      icon: 'icon-paste',
      location: 'mainNavigation'
    }
  ]
};
