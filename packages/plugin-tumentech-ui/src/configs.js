module.exports = {
  name: 'tumentech',
  port: 3023,
  scope: 'tumentech',
  url: 'http://localhost:3023/remoteEntry.js',
  exposes: {
    './routes': './src/routes.tsx',
    './driverSection': './src/DriverSection.tsx',
    './participantSection': './src/ParticipantSection.tsx',
    './customerSidebar': './src/containers/CustomerSidebar.tsx',
    './companySidebar': './src/containers/CompanySidebar.tsx'
  },
  routes: {
    url: 'http://localhost:3023/remoteEntry.js',
    scope: 'tumentech',
    module: './routes'
  },
  menus: [
    {
      text: 'Tumentech',
      url: '/erxes-plugin-tumentech/list',
      icon: 'icon-car',
      location: 'mainNavigation',
      permission: 'showCars'
    }
  ],
  customerRightSidebarSection: [
    {
      text: 'customerSection',
      component: './components/common/CarSection',
      scope: 'cars'
    }
  ],
  companyRightSidebarSection: [
    {
      text: 'companySection',
      component: './components/common/CarSection',
      scope: 'cars'
    }
  ],
  dealRightSidebarSection: [
    {
      text: 'driverSection',
      component: './driverSection',
      scope: 'tumentech'
    },
    {
      text: 'participantSection',
      component: './participantSection',
      scope: 'tumentech'
    }
  ]
};
