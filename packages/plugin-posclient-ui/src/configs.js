module.exports = {
  name: 'posclient',
  port: 3030,
  scope: 'posclient',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3030/remoteEntry.js',
    scope: 'posclient',
    module: './routes'
  },
  menus: [
    {
      text: 'Posclients',
      to: '/posclients',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'posclient'
    }
  ]
};