module.exports = {
  name: 'contract',
  port: 3017,
  scope: 'contract',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'contract',
    module: './routes'
  },
  menus:[{"text":"Contracts","to":"/contracts","image":"/images/icons/erxes-18.svg","location":"settings","scope":"contract"}]
};
