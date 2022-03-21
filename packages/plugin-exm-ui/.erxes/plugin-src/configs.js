module.exports = {
  name: 'exm',
  port: 3105,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3105/remoteEntry.js',
    scope: 'exm',
    module: './routes'
  },
  menus: [
    {
      text: 'Exm core',
      url: '/erxes-plugin-exm/home',
      icon: '/images/icons/icon-cog.svg',
      location: 'mainNavigation',
      permission: 'showExms'
    }
  ]
};
