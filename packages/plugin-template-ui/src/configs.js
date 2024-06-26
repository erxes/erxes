module.exports = {
  srcDir: __dirname,
  name: 'template',
  port: 3128,
  scope: 'template',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3128/remoteEntry.js',
    scope: 'template',
    module: './routes'
  },
  menus: [
    {
      text: 'Templates',
      to: '/settings/templates',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'template'
    }
  ]
};
