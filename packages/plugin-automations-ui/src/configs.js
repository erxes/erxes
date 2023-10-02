module.exports = {
  name: 'automations',
  port: 3008,
  scope: 'automations',
  exposes: {
    './routes': './src/routes.tsx',
    // "./settings": "./src/Settings.tsx",
    './activityLog': './src/activityLogs/index.tsx'
  },
  routes: {
    url: 'http://localhost:3008/remoteEntry.js',
    scope: 'automations',
    module: './routes'
  },
  activityLog: './activityLog',
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
