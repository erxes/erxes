module.exports = {
  name: 'loan',
  port: 3119,
  exposes: {
    './routes': './src/routes.tsx',
    // './companySidebar': './contracts/containers/CompanySidebar.tsx',
  },
  routes: {
    url: 'http://localhost:3119/remoteEntry.js',
    scope: 'loan',
    module: './routes',
  },
  menus: [
    {
      text: 'Contracts',
      url: '/erxes-plugin-loan/home',
      icon: 'icon-medal',
      location: 'mainNavigation',
      permission: 'showContracts',
    },
  ],
  // companyRightSidebarSection: [
  //   {
  //     text: 'companySection',
  //     component: './companySidebar',
  //     scope: 'loan',
  //   },
  // ],
};
