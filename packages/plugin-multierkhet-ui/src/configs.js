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
      text: 'Sync Multi Erkhet',
      to: '/erxes-plugin-multi-erkhet/settings/general',
      image: '/images/icons/erxes-04.svg',
      location: "settings",
      scope: "multierkhet",
      action: 'multiErkhetConfig',
      permission: "multiErkhetConfig",
    },
    {
      text: 'Sync Multi Erkhet',
      url: '/multi-erkhet-history',
      icon: 'icon-file-check-alt',
      location: "mainNavigation",
      scope: 'multierkhet',
      permission: 'multiErkhetConfig',
    },
  ]
};
