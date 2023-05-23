module.exports = {
  name: 'clientportal',
  port: 3015,
  scope: 'clientportal',
  exposes: {
    './routes': './src/routes.tsx',
    './cardDetailAction': './src/containers/comments/CardDetailAction.tsx',
    './fieldConfig': './src/containers/FieldConfigForm.tsx'
  },
  cardDetailAction: './cardDetailAction',
  fieldConfig: './fieldConfig',
  routes: {
    url: 'http://localhost:3015/remoteEntry.js',
    scope: 'clientportal',
    module: './routes'
  },
  menus: [
    {
      text: 'Client Portal',
      to: '/settings/client-portal',
      image: '/images/icons/erxes-32.png',
      location: 'settings',
      scope: 'clientportal',
      action: '',
      permissions: []
    }
  ]
};
