module.exports = {
  name: 'trading',
  port: 3012,
  scope: 'trading',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'trading',
    module: './routes'
  },
  menus: [
    {
      text: 'Tradings',
      to: '/tradings',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'trading'
    }
  ]
};