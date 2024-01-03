module.exports = {
  srcDir: __dirname,
  name: 'insurance',
  port: 3017,
  scope: 'insurance',
  exposes: {
    './routes': './src/routes.tsx',
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'insurance',
    module: './routes',
  },
  menus: [
    {
      text: 'Insurance',
      url: '/insurance/risks',
      icon: 'icon-umbrella',
      location: 'mainNavigation',
    }
  ],
};
