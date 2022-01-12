module.exports = {
  name: 'deals',
  port: 3003,
  exposes: {
    './routes': './src/routes.tsx',
    './settings': './src/Settings.tsx'
  },
  routes: {
    url: 'http://localhost:3003/remoteEntry.js',
    scope: 'deals',
    module: './routes'
  },
  menus: [
    // {
    //   text: 'Sales Pipeline',
    //   url: '/deal',
    //   icon: 'icon-piggy-bank',
    //   location: 'mainNavigation'
    // },
    // {
    //   text: 'Task',
    //   url: '/task',
    //   icon: 'icon-laptop',
    //   location: 'mainNavigation'
    // },
    // {
    //   text: 'Ticket',
    //   url: '/ticket/board',
    //   icon: 'icon-ticket',
    //   location: 'mainNavigation'
    // }
    {
      text: 'Growth Hacking',
      url: '/growthHack',
      icon: 'icon-idea',
      location: 'mainNavigation'
    }
  ]
};
