module.exports = {
  srcDir: __dirname,
  name: 'zms',
  port: 3017,
  scope: 'zms',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'zms',
    module: './routes'
  },
  menus:[{"text":"Zmss","url":"/zmss","icon":"icon-star","location":"mainNavigation"}]
};
