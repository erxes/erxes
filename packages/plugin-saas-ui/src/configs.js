module.exports = {
  srcDir: __dirname,
  name: 'saas',
  port: 3080,
  scope: 'saas',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3080/remoteEntry.js',
    scope: 'saas',
    module: './routes'
  },

  menus: []
};
