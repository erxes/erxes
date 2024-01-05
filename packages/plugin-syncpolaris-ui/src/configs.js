module.exports = {
  srcDir: __dirname,
  name: 'syncpolaris',
  port: 3017,
  scope: 'syncpolaris',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'syncpolaris',
    module: './routes'
  },
  menus:[{"text":"Syncpolariss","url":"/syncpolariss","icon":"icon-star","location":"mainNavigation"}]
};
