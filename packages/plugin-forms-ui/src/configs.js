module.exports = {
  name: 'forms',
  port: 3005,
  scope: 'forms',
  exposes: {
    './routes': './src/routes.tsx',
    './segmentForm': './src/segmentForm.tsx'
  },
  routes: {
    url: 'http://localhost:3005/remoteEntry.js',
    scope: 'forms',
    module: './routes'
  },
  segmentForm: './segmentForm',
  menus: [
    {
      text: 'Properties',
      to: '/settings/properties',
      image: '/images/icons/erxes-01.svg',
      location: 'settings',
      scope: 'forms',
      action: '',
      permissions: []
    }
  ]
};
