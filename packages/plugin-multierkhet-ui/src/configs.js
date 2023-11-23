module.exports = {
  srcDir: __dirname,
  name: 'multierkhet',
  port: 3030,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3030/remoteEntry.js',
    scope: 'multierkhet',
    module: './routes'
  },
  menus: [
    {
      text: 'Sync Many Erkhet',
      to: '/erxes-plugin-sync-many-erkhet/settings/general',
      image: '/images/icons/erxes-04.svg',
      location: "settings",
      scope: "multierkhet",
      action: 'multiErkhetConfig',
      permission: "multiErkhetConfig",
    },
    {
      text: 'Sync Many Erkhet',
      url: '/sync-many-erkhet-history',
      icon: 'icon-file-check-alt',
      location: "mainNavigation",
      scope: 'multierkhet',
      permission: 'multiErkhetConfig',
    },
  ]
};
