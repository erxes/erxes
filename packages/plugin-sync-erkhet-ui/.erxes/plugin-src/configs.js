module.exports = {
  name: 'syncErkhet',
  port: 3017,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'syncErkhet',
    module: './routes'
  },
  menus: [
    {
      text: 'Sync Erkhet',
      to: '/erxes-plugin-sync-erkhet/settings/general',
      image: '/images/icons/erxes-04.svg',
      location: "settings",
      scope: "syncErkhet",
      action: 'syncErkhetConfig',
      permissions: [],
    }
  ]
};
