module.exports = {
  name: 'feed',
  port: 3111,
  exposes: {
    './routes': './src/routes.tsx',
  },
  routes: {
    url: 'http://localhost:3111/remoteEntry.js',
    scope: 'feed',
    module: './routes',
  },
  menus: [
    {
      text: 'Exm feed',
      url: '/erxes-plugin-exm-feed/home',
      icon: 'icon-cog',
      location: 'mainNavigation',
      permission: 'showExms',
    },
  ],
};
