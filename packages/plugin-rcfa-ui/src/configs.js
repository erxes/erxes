module.exports = {
  name: 'rcfa',
  port: 3030,
  scope: 'rcfa',
  exposes: {
    './routes': './src/routes.tsx',
    './rcfaSection': './src/rcfa/containers/Section.tsx',
    './selectResolver': './src/common/SelectResolver.tsx'
  },
  routes: {
    url: 'http://localhost:3030/remoteEntry.js',
    scope: 'rcfa',
    module: './routes'
  },
  formsExtraFields: [
    {
      scope: 'rcfa',
      component: './selectResolver',
      type: 'rcfaResolver'
    }
  ],
  menus: [
    {
      text: 'RCFA',
      url: '/rcfa',
      icon: 'icon-file-question-alt',
      location: 'mainNavigation'
    }
  ],
  ticketRightSidebarSection: [
    {
      text: 'rcfaSection',
      component: './rcfaSection',
      scope: 'rcfa'
    }
  ]
};
