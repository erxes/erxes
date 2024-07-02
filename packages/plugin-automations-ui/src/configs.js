module.exports = {
  srcDir: __dirname,
  name: 'automations',
  port: 3008,
  scope: 'automations',
  exposes: {
    './routes': './src/routes.tsx',
    './activityLog': './src/activityLogs/index.tsx',
    './template': './src/templates/template.tsx'
  },
  routes: {
    url: 'http://localhost:3008/remoteEntry.js',
    scope: 'automations',
    module: './routes'
  },
  activityLog: './activityLog',
  template: './template',
  menus: [
    {
      text: 'Automations',
      url: '/automations',
      location: 'mainNavigation',
      icon: 'icon-circular',
      permission: 'showAutomations'
    },
    {
      text: 'Automations config',
      to: '/settings/automations/general',
      image: '/images/icons/erxes-14.svg',
      location: 'settings',
      scope: 'automations'
    }
  ]
};
