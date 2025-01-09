module.exports = {
  srcDir: __dirname,
  name: 'engages',
  port: 3001,
  scope: 'engages',
  exposes: {
    './routes': './src/routes.tsx',
    './automation': './src/automation.tsx'
  },
  routes: {
    url: 'http://localhost:3001/remoteEntry.js',
    scope: 'engages',
    module: './routes'
  },
  automation: './automation',
  menus: [
    {
      text: 'Broadcast',
      url: '/campaigns',
      icon: 'icon-megaphone',
      location: 'mainNavigation',
      permission: 'showEngagesMessages'
    },
    {
      text: 'Broadcast settings',
      to: '/settings/campaign-configs',
      image: '/images/icons/erxes-08.svg',
      location: 'settings',
      scope: 'engages',
      action: 'engagesAll',
      permissions: ['showEngagesMessages']
    }
  ]
};
