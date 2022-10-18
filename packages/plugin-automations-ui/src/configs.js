module.exports = {
  name: 'automations',
  port: 3008,
  exposes: {
    './routes': './src/routes.tsx'
    // "./settings": "./src/Settings.tsx",
  },
  routes: {
    url: 'http://localhost:3008/remoteEntry.js',
    scope: 'automations',
    module: './routes'
  },
  menus: [
    {
      text: 'Automations',
      url: '/automations',
      location: 'mainNavigation',
      icon: 'icon-circular',
      permission: 'showAutomations'
    }
  ]
};
