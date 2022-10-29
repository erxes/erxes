module.exports = {
  name: 'block',
  port: 3017,
  scope: 'block',
  exposes: {
    './routes': './src/routes.tsx',
    './customerSidebar': './src/containers/CustomerSidebar.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'block',
    module: './routes'
  },
  menus: [
    {
      text: 'Blocks',
      to: '/block/list',
      image: '/images/icons/erxes-18.svg',
      location: 'settings'
    }
  ],
  customerRightSidebarSection: [
    {
      text: 'customerSection',
      component: './customerSidebar',
      scope: 'block'
    }
  ]
};
