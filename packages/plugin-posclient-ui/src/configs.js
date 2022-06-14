module.exports = {
  name: 'clientpos',
  port: 3012,
  scope: 'clientpos',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'clientpos',
    module: './routes'
  },
  menus: [
    {
      text: 'Clientposs',
      to: '/clientposs',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'clientpos'
    }
  ]
};