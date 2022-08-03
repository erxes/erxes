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
    // {
    //   text: 'Sync Erkhet Deals Check',
    //   to: '/sync-erkhet-check',
    //   image: '/images/icons/erxes-04.svg',
    //   location: "mainNavigation",
    //   scope: 'syncerkhet'
    // }
  ]
};
