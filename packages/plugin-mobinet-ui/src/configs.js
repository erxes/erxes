module.exports = {
  name: 'mobinet',
  port: 3029,
  scope: 'mobinet',
  exposes: {
    './routes': './src/routes.tsx',
    './customerSidebar': './src/modules/contracts/containers/CustomerSidebar.tsx',
    "./cardDetailAction": "./src/modules/contracts/containers/CardDetailAction.tsx",
    './buildingsSection': './src/common/routes/Buildings.tsx',
    './mobinetConfigs': './src/modules/MobinetConfigs.tsx'
  },
  extendSystemConfig: './mobinetConfigs',
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
  ],
  cardDetailAction: "./cardDetailAction",
  customerRightSidebarSection: [
    {
      text: 'customerSection',
      component: './customerSidebar',
      scope: 'mobinet'
    }
  ]
};
