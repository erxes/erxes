module.exports = {
  name: 'timeclock',
  port: 3018,
  scope: 'timeclock',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3018/remoteEntry.js',
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
