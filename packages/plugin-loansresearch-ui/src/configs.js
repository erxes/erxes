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
      to: '/settings/loansresearch/',
      url: '/loansresearch',
      location: 'settings',
      image: '/images/icons/erxes-18.svg',
      scope: 'loansresearch',
    },
    {
      text: 'Sync Loans Reserch',
      url: '/sync-loansresearch',
      icon: 'icon-file-check-alt',
      location: 'mainNavigation',
      scope: 'syncloansresearch',
    },
  ],
};
