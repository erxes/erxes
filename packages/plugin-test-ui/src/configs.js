module.exports = {
  name: 'test',
  port: 3016,
  scope: 'test',
  exposes: {
    './routes': './src/routes.tsx',
  },
  routes: {
    url: 'http://localhost:3016/remoteEntry.js',
    scope: 'test',
    module: './routes',
  },
  menus: [
    {
      text: 'Tests',
      to: '/tests',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'test',
    },
  ],
};
