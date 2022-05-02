module.exports = {
  name: 'webhooks',
  port: 3024,
  scope: 'webhooks',
  exposes: {
    './routes': './src/routes.tsx',
  },
  routes: {
    url: 'http://localhost:3024/remoteEntry.js',
    scope: 'webhooks',
    module: './routes'
  },
  menus: [
    {
      text: 'Outgoing webhooks',
      to: '/settings/webhooks',
      image: '/images/icons/erxes-11.svg',
      location: 'settings',
      scope: 'webhooks',
      action: '',
      permissions: []
    }
  ]
};
