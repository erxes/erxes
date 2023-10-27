module.exports = {
  name: 'exm',
  port: 3105,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3105/remoteEntry.js',
    scope: 'exm',
    module: './routes'
  },
  menus: [
    {
      text: 'Exm core',
      to: '/erxes-plugin-exm/home',
      image: '/images/icons/erxes-30.png',
      location: 'settings',
      action: '',
      permissions: ['showExms']
    }
  ]
};
