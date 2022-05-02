module.exports = {
  name: 'webhook',
  port: 3024,
  scope: 'webhook',
  exposes: {
    './routes': './src/routes.tsx',
  },
  routes: {
    url: 'http://localhost:3024/remoteEntry.js',
    scope: 'webhook',
    module: './routes'
  },
  menus: [
    {
      text: 'Outgoing webhooks',
      to: '/settings/webhooks',
      image: '/images/icons/erxes-11.svg',
      location: 'settings',
      scope: 'webhook',
      action: '',
      permissions: []
    }
  ]
};
