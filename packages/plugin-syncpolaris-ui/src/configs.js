module.exports = {
  srcDir: __dirname,
  name: 'syncpolaris',
  port: 3037,
  scope: 'syncpolaris',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3037/remoteEntry.js',
    scope: 'syncpolaris',
    module: './routes'
  },
  menus:[
    {
      text: 'Sync polaris config',
      to: '/erxes-plugin-sync-polaris/settings/general',
      image: '/images/icons/erxes-04.svg',
      location: "settings",
      scope: "syncpolaris",
      action: 'syncPolarisonfig',
      permission: "syncPolarisConfig",
    },
    {
      "text":"Syncpolariss",
      "url":"/syncpolariss",
      "icon":"icon-star",
      "location":"mainNavigation"
    },
  ]
};
