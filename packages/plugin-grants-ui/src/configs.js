module.exports = {
  name: 'grants',
  port: 3029,
  scope: 'grants',
  exposes: {
    './routes': './src/routes.tsx',
    './cardSideBarSection': './src/section/containers/Section.tsx'
  },
  routes: {
    url: 'http://localhost:3029/remoteEntry.js',
    scope: 'grants',
    module: './routes'
  },
  menus: [
    {
      text: 'Grants',
      url: '/grants/requests',
      icon: 'icon-file-question-alt',
      location: 'mainNavigation'
    }
  ],
  dealRightSidebarSection: [
    {
      text: 'grantsSection',
      component: './cardSideBarSection',
      scope: 'grants'
    }
  ],
  ticketRightSidebarSection: [
    {
      text: 'grantsSection',
      component: './cardSideBarSection',
      scope: 'grants'
    }
  ],
  taskRightSidebarSection: [
    {
      text: 'grantsSection',
      component: './cardSideBarSection',
      scope: 'grants'
    }
  ]
};
