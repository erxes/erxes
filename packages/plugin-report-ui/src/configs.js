module.exports = {
  name: 'report',
  port: 3017,
  scope: 'report',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'report',
    module: './routes'
  },
  menus:[{"text":"Reports","to":"/reports","image":"/images/icons/erxes-18.svg","location":"settings","scope":"report"}]
};
