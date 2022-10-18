module.exports = {
  name: '{name}',
  port: 3017,
  scope: '{name}',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: '{name}',
    module: './routes'
  },
  menus: []
};
