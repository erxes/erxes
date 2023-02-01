module.exports = {
  name: 'mobinet',
  port: 3029,
  scope: 'mobinet',
  exposes: {
    './routes': './src/routes.tsx',
    './buildingsSection': './src/common/routes/Buildings.tsx'
  },
  routes: {
    url: 'http://localhost:3029/remoteEntry.js',
    scope: 'mobinet',
    module: './routes',
  },
  menus: [
    {
      text: 'Mobinet',
      url: '/mobinet/building/list?viewType=list',
      icon: 'icon-star',
      location: 'mainNavigation',
    },
  ],

  ticketRightSidebarSection: [
    {
      text: "buildingsSection",
      component: "./buildingsSection",
      scope: "mobinet"
    }
  ]
};
