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
      icon: 'icon-followers',
      location: 'mainNavigation'
    },
    {
      text: 'Grants Configs',
      to: '/settings/grants-configs',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'grants'
    }
  ],
  dealRightSidebarSection: [
    {
      text: 'grantsSection',
      component: './cardSideBarSection',
      scope: 'grants',
      withDetail: true
    }
  ],
  ticketRightSidebarSection: [
    {
      text: 'grantsSection',
      component: './cardSideBarSection',
      scope: 'grants',
      withDetail: true
    }
  ],
  taskRightSidebarSection: [
    {
      text: 'grantsSection',
      component: './cardSideBarSection',
      scope: 'grants',
      withDetail: true
    }
  ]
};
