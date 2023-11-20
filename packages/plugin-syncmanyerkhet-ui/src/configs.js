module.exports = {
  srcDir: __dirname,
  name: 'syncmanyerkhet',
  port: 3030,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3030/remoteEntry.js',
    scope: 'syncmanyerkhet',
    module: './routes'
  },
  menus: [
    {
      text: 'Sync Many Erkhet',
      to: '/erxes-plugin-sync-many-erkhet/settings/general',
      image: '/images/icons/erxes-04.svg',
      location: "settings",
      scope: "syncmanyerkhet",
      action: 'syncManyErkhetConfig',
      permission: "syncManyErkhetConfig",
    },
    {
      text: 'Sync Many Erkhet',
      url: '/sync-many-erkhet-history',
      icon: 'icon-file-check-alt',
      location: "mainNavigation",
      scope: 'syncmanyerkhet',
      permission: 'syncManyErkhetConfig',
    },
  ]
};
