module.exports = {
  srcDir: __dirname,
  name: 'loansresearch',
  port: 3012,
  scope: 'loansresearch',
  exposes: {
    './routes': './src/routes.tsx',
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'loansresearch',
    module: './routes',
  },
  menus: [
    {
      text: 'Loans Reserch',
      url: '/loansresearch',
      icon: 'icon-file-check-alt',
      location: 'mainNavigation',
      scope: 'loansresearch',
    },
  ],
};
