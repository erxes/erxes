module.exports = {
  name: '{name}',
  port: 3017,
  scope: '{name}',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: '{name}',
    module: './routes'
  },
  menus: [
    {
      text: '{Name}s',
      to: '/{name}s',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: '{name}'
    }
  ]
};
