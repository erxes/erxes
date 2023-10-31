module.exports = {
  name: 'msdynamic',
  port: 3017,
  scope: 'msdynamic',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'msdynamic',
    module: './routes'
  },
  menus: [
    {
      text: 'Msdynamics',
      to: '/msdynamics',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'msdynamic'
    },
    {
      text: 'Sync MS Dynamic',
      url: '/sync-msdynamic-history',
      icon: 'icon-file-check-alt',
      location: 'mainNavigation',
      scope: 'syncmsdynamic'
    }
  ]
};
