module.exports = {
  name: 'xyp',
  port: 3017,
  scope: 'xyp',
  exposes: {
    './routes': './src/routes.tsx',
    './xypConfigs': './src/modules/XypConfigs.tsx',
    './customerSidebar':
      './src/modules/contacts/containers/CustomerSidebar.tsx',
    './carSidebar': './src/modules/car/containers/CarSidebar.tsx',
  },

  extendSystemConfig: './xypConfigs',
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'xyp',
    module: './routes',
  },
  menus: [
    {
      text: 'Xyp mongolia',
      to: '/xyps',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'xyp',
    },
  ],

  customerRightSidebarSection: [
    {
      text: 'Xyp Section',
      component: './customerSidebar',
      scope: 'xyp',
    },
  ],
  carRightSidebarSection: './carSidebar',

  // carRightSidebarSection: [
  //   {
  //     text: 'Xyp Section',
  //     component: './customerSidebar',
  //     scope: 'xyp',
  //   },
  // ],
};
