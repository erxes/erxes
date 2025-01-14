module.exports = {
  srcDir: __dirname,
  name: 'activedirectory',
  port: 3012,
  scope: 'activedirectory',
  exposes: {
    './routes': './src/routes.tsx',
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'activedirectory',
    module: './routes',
  },
  menus: [
    {
      text: 'Active Directory',
      to: '/settings/activedirectory/',
      url: '/activedirectory',
      location: 'settings',
      image: '/images/icons/erxes-18.svg',
      scope: 'activedirectory',
      permission: 'showAD',
    },
    {
      text: 'Sync Active Directory',
      url: '/sync-activedirectory',
      icon: 'icon-file-check-alt',
      location: 'mainNavigation',
      scope: 'syncactivedirectory',
      permission: 'showAD',
    },
  ],
};
