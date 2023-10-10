module.exports = {
  name: 'goals',
  port: 3017,
  scope: 'goals',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'goals',
    module: './routes'
  },
  menus:[{"text":"Goalss","to":"/goalss","image":"/images/icons/erxes-18.svg","location":"settings","scope":"goals"}]
};
