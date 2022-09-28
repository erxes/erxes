module.exports = {
  name: 'plugin',
  port: 3017,
  scope: 'plugin',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'plugin',
    module: './routes'
  },
  menus:[{"text":"Plugins","to":"/plugins","image":"/images/icons/erxes-18.svg","location":"settings","scope":"plugin"}]
};
