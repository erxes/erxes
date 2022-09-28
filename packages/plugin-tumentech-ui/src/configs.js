module.exports = {
  name: 'tumentech',
  port: 3017,
  scope: 'tumentech',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'tumentech',
    module: './routes'
  },
  menus:[{"text":"Tumentechs","to":"/tumentechs","image":"/images/icons/erxes-18.svg","location":"settings","scope":"tumentech"}]
};
