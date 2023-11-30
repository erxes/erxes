module.exports = {
  srcDir: __dirname,
  name: 'reports',
  port: 3045,
  scope: 'reports',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3045/remoteEntry.js',
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
