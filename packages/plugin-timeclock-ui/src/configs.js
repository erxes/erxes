module.exports = {
  name: 'timeclock',
  port: 3023,
  scope: 'timeclock',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3023/remoteEntry.js',
    scope: 'timeclock',
    module: './routes'
  },
  menus: [
    {
      text: 'Timeclocks',
      url: '/timeclocks',
      icon: 'icon-star',
      location: 'mainNavigation'
    }
  ]
};
