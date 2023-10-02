module.exports = {
  name: 'syncerkhet',
  port: 3017,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'syncerkhet',
    module: './routes'
  },
  menus: [
    {
      text: 'Sync Erkhet',
      to: '/erxes-plugin-sync-erkhet/settings/general',
      image: '/images/icons/erxes-04.svg',
      location: "settings",
      scope: "syncerkhet",
      action: 'syncErkhetConfig',
      permission: "syncErkhetConfig",
    },
    {
      text: 'Sync Erkhet',
      url: '/sync-erkhet-history',
      icon: 'icon-file-check-alt',
      location: "mainNavigation",
      scope: 'syncerkhet',
      permission: 'syncErkhetConfig',
    },
  ]
};
