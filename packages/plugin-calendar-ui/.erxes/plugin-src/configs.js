module.exports = {
  name: 'calendar',
  port: 3006,
  exposes: {
    './routes': './src/routes.tsx'
    // './settings': './src/Settings.tsx'
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
    // {
    //   text: 'Calendar settings',
    //   icon: 'icon-calendar-alt',
    //   location: 'settings',
    //   scope: 'calendar',
    //   component: './settings'
    // }
  ]
};
