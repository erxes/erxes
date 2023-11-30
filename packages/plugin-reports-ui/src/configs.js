module.exports = {
  name: 'reports',
  port: 3017,
  scope: 'reports',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'reports',
    module: './routes'
  },
  menus: [
    {
      text: 'Reports',
      to: '/reports',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'reports'
    }
  ]
};
