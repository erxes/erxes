module.exports = {
  srcDir: __dirname,
  name: 'logs',
  port: 3040,
  scope: 'logs',
  exposes: {
    './routes': './src/routes.tsx',
    './contactDetailContent': './src/logs/Activities.tsx'
  },
  routes: {
    url: 'http://localhost:3040/remoteEntry.js',
    scope: 'logs',
    module: './routes'
  },
  contactDetailContent: './contactDetailContent',
  menus: [
    {
      text: 'System Logs',
      to: '/settings/logs',
      image: '/images/icons/erxes-33.png',
      location: 'settings',
      scope: 'logs',
      component: './settings',
      action: '',
      permissions: []
    },
    {
      text: 'Email Delivery Logs',
      to: '/settings/emailDelivery',
      image: '/images/icons/erxes-27.png',
      location: 'settings',
      scope: 'logs',
      component: './settings',
      action: '',
      permissions: []
    }
  ]
};
