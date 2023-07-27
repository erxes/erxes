module.exports = {
  name: 'syncsaas',
  port: 3030,
  scope: 'syncsaas',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3030/remoteEntry.js',
    scope: 'syncsaas',
    module: './routes'
  },
  menus: [
    {
      text: 'Sync Saas',
      to: '/settings/sync-saas',
      image: '/images/icons/erxes-04.svg',
      location: 'settings',
      scope: 'syncsaas',
      action: 'syncSaasConfig',
      permission: 'syncSaasConfig'
    }
  ]
};
